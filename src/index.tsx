import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { setCookie, getCookie } from 'hono/cookie'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// ============ Helper Functions ============

// Simple password hashing (in production, use bcrypt or similar)
function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64')
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

async function getUserFromSession(db: D1Database, sessionToken: string) {
  if (!sessionToken) return null
  return await db.prepare('SELECT * FROM users WHERE session_token = ?').bind(sessionToken).first()
}

// ============ Authentication API ============

// Register
app.post('/api/auth/register', async (c) => {
  const { env } = c
  const body = await c.req.json()
  const { email, username, password } = body

  if (!email || !username || !password) {
    return c.json({ error: 'All fields are required' }, 400)
  }

  try {
    // Check if user exists
    const existing = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
    if (existing) {
      return c.json({ error: 'Email already registered' }, 400)
    }

    const passwordHash = hashPassword(password)
    const sessionToken = generateSessionToken()

    const result = await env.DB.prepare(
      'INSERT INTO users (email, username, password_hash, session_token, membership_type) VALUES (?, ?, ?, ?, ?)'
    ).bind(email, username, passwordHash, sessionToken, 'free').run()

    setCookie(c, 'session_token', sessionToken, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'Lax'
    })

    return c.json({
      success: true,
      user: {
        id: result.meta.last_row_id,
        email,
        username,
        membership_type: 'free'
      }
    }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Login
app.post('/api/auth/login', async (c) => {
  const { env } = c
  const body = await c.req.json()
  const { email, password } = body

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400)
  }

  try {
    // Check for hardcoded admin credentials
    if (email === 'admin' && password === 'admin123') {
      const sessionToken = generateSessionToken()
      
      // Set admin session cookie
      setCookie(c, 'session_token', sessionToken, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'Lax'
      })
      
      // Store admin session in memory (for development)
      setCookie(c, 'admin_session', 'true', {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'Lax'
      })

      return c.json({
        success: true,
        user: {
          id: 0,
          email: 'admin',
          username: 'Administrator',
          membership_type: 'admin',
          is_admin: true
        }
      })
    }

    // Regular user authentication
    const passwordHash = hashPassword(password)
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND password_hash = ?'
    ).bind(email, passwordHash).first() as any

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const sessionToken = generateSessionToken()
    await env.DB.prepare(
      'UPDATE users SET session_token = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(sessionToken, user.id).run()

    setCookie(c, 'session_token', sessionToken, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'Lax'
    })

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        membership_type: user.membership_type,
        is_admin: user.is_admin || false
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Logout
app.post('/api/auth/logout', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')

  if (sessionToken) {
    await env.DB.prepare('UPDATE users SET session_token = NULL WHERE session_token = ?').bind(sessionToken).run()
  }

  setCookie(c, 'session_token', '', { maxAge: 0 })
  return c.json({ success: true })
})

// Get current user
app.get('/api/auth/me', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const adminSession = getCookie(c, 'admin_session')
  
  // Check for admin session
  if (adminSession === 'true' && sessionToken) {
    return c.json({
      id: 0,
      email: 'admin',
      username: 'Administrator',
      membership_type: 'admin',
      is_admin: true
    })
  }
  
  const user = await getUserFromSession(env.DB, sessionToken || '')
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  return c.json({
    id: (user as any).id,
    email: (user as any).email,
    username: (user as any).username,
    membership_type: (user as any).membership_type,
    is_admin: (user as any).is_admin || false
  })
})

// Password Reset - Request
app.post('/api/auth/password-reset/request', async (c) => {
  const { env } = c
  const { email } = await c.req.json()
  
  try {
    // Check if user exists
    const result = await env.DB.prepare(`
      SELECT id, email FROM users WHERE email = ?
    `).bind(email).first()
    
    if (!result) {
      return c.json({ error: 'Email address not found' }, 404)
    }
    
    // Generate reset token (simple random string for demo)
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    
    // Save token to database
    await env.DB.prepare(`
      INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
      VALUES (?, ?, ?, 0)
    `).bind(result.id, token, expiresAt).run()
    
    // In production, send email here with reset link
    // For development, we'll just return success
    // The frontend will show a modal with the reset link
    
    return c.json({ 
      success: true,
      message: 'Password reset link has been sent to your email',
      // For development only - remove in production
      dev_token: token,
      dev_reset_url: `#reset-password?email=${encodeURIComponent(email)}&token=${token}`
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return c.json({ error: 'Failed to process password reset request' }, 500)
  }
})

// Password Reset - Confirm (simplified for development)
app.post('/api/auth/password-reset/confirm', async (c) => {
  const { env } = c
  const { email, password } = await c.req.json()
  
  try {
    // Find user by email
    const user = await env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(email).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Update password (in development, we skip token validation for simplicity)
    const passwordHash = hashPassword(password)
    await env.DB.prepare(`
      UPDATE users SET password_hash = ? WHERE id = ?
    `).bind(passwordHash, user.id).run()
    
    // Mark all tokens for this user as used
    await env.DB.prepare(`
      UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?
    `).bind(user.id).run()
    
    return c.json({ success: true, message: 'Password has been reset successfully' })
  } catch (error) {
    console.error('Password reset confirm error:', error)
    return c.json({ error: 'Failed to reset password' }, 500)
  }
})

// ============ Video API ============

// Get all videos with filters
app.get('/api/videos', async (c) => {
  const { env } = c
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '12')
  const category = c.req.query('category')
  const platform = c.req.query('platform')
  const search = c.req.query('search')
  const lang = c.req.query('lang') || 'ja'
  const offset = (page - 1) * limit

  try {
    let query = 'SELECT * FROM videos WHERE 1=1'
    let countQuery = 'SELECT COUNT(*) as total FROM videos WHERE 1=1'
    const params: any[] = []

    if (category && category !== 'all') {
      query += ' AND category = ?'
      countQuery += ' AND category = ?'
      params.push(category)
    }

    if (platform && platform !== 'all') {
      query += ' AND platform = ?'
      countQuery += ' AND platform = ?'
      params.push(platform)
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)'
      countQuery += ' AND (title LIKE ? OR description LIKE ?)'
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    const queryParams = [...params, limit, offset]
    const countParams = params

    const { results: videos } = await env.DB.prepare(query).bind(...queryParams).all()
    const { results: countResult } = await env.DB.prepare(countQuery).bind(...countParams).all()
    const total = (countResult[0] as any).total

    // Localize video titles
    const localizedVideos = (videos as any[]).map((video: any) => ({
      ...video,
      title: getLocalizedField(video, 'title', lang)
    }))

    return c.json({
      videos: localizedVideos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get trending videos (注目の動画)
app.get('/api/videos/trending', async (c) => {
  const { env } = c
  const limit = parseInt(c.req.query('limit') || '10')
  const lang = c.req.query('lang') || 'ja'
  
  try {
    // Query the trending_videos view
    const { results: trendingVideos } = await env.DB.prepare(`
      SELECT * FROM trending_videos LIMIT ?
    `).bind(limit).all()
    
    // Localize video titles
    const localizedVideos = (trendingVideos as any[]).map((video: any) => ({
      ...video,
      title: getLocalizedField(video, 'title', lang)
    }))
    
    return c.json({
      videos: localizedVideos || [],
      count: localizedVideos?.length || 0
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get top liked videos (ランキング: いいね数順)
app.get('/api/videos/top-liked', async (c) => {
  const { env } = c
  const limit = parseInt(c.req.query('limit') || '20')
  const period = c.req.query('period') || 'all' // 'daily', 'weekly', 'monthly', '6months', '1year', 'all'
  const lang = c.req.query('lang') || 'ja'
  
  try {
    let dateFilter = ''
    const now = new Date()
    
    if (period === 'daily') {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      dateFilter = ` AND posted_date >= datetime('${yesterday.toISOString()}')`
    } else if (period === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = ` AND posted_date >= datetime('${weekAgo.toISOString()}')`
    } else if (period === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = ` AND posted_date >= datetime('${monthAgo.toISOString()}')`
    } else if (period === '6months') {
      const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
      dateFilter = ` AND posted_date >= datetime('${sixMonthsAgo.toISOString()}')`
    } else if (period === '1year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      dateFilter = ` AND posted_date >= datetime('${yearAgo.toISOString()}')`
    }
    
    const { results: topVideos } = await env.DB.prepare(`
      SELECT * FROM videos 
      WHERE likes > 0${dateFilter}
      ORDER BY likes DESC, views DESC
      LIMIT ?
    `).bind(limit).all()
    
    // Localize video titles
    const localizedVideos = (topVideos as any[]).map((video: any) => ({
      ...video,
      title: getLocalizedField(video, 'title', lang)
    }))
    
    return c.json({
      videos: localizedVideos || [],
      count: localizedVideos?.length || 0,
      period: period
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get Instagram videos
app.get('/api/videos/instagram', async (c) => {
  const { env } = c
  const limit = parseInt(c.req.query('limit') || '10')
  const lang = c.req.query('lang') || 'ja'
  
  try {
    const { results: instagramVideos } = await env.DB.prepare(`
      SELECT * FROM videos 
      WHERE media_source = 'instagram' 
      ORDER BY created_at DESC 
      LIMIT ?
    `).bind(limit).all()
    
    // Localize video titles
    const localizedVideos = (instagramVideos as any[]).map((video: any) => ({
      ...video,
      title: getLocalizedField(video, 'title', lang)
    }))
    
    return c.json({
      videos: localizedVideos || [],
      count: localizedVideos?.length || 0
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get single video
app.get('/api/videos/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  const lang = c.req.query('lang') || 'ja'

  try {
    const video = await env.DB.prepare('SELECT * FROM videos WHERE id = ?').bind(id).first()
    if (!video) {
      return c.json({ error: 'Video not found' }, 404)
    }
    
    // Increment views
    await env.DB.prepare('UPDATE videos SET views = views + 1 WHERE id = ?').bind(id).run()
    
    // Localize video title
    const localizedVideo = {
      ...video,
      title: getLocalizedField(video, 'title', lang)
    }
    
    return c.json(localizedVideo)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Create video
app.post('/api/videos', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '')

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  const body = await c.req.json()
  const { title, description, url, thumbnail_url, duration, channel_name, category } = body

  if (!title || !url) {
    return c.json({ error: 'Title and URL are required' }, 400)
  }

  try {
    const result = await env.DB.prepare(
      'INSERT INTO videos (title, description, url, thumbnail_url, duration, channel_name, category) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(title, description || '', url, thumbnail_url || '', duration || '', channel_name || '', category || 'bouldering').run()

    const videoId = result.meta.last_row_id

    // Initialize ranking entry
    await env.DB.prepare(
      'INSERT INTO video_rankings (video_id, total_score) VALUES (?, 0)'
    ).bind(videoId).run()

    return c.json({ id: videoId, message: 'Video created successfully' }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Like video (新しい user_likes テーブルを使用)
app.post('/api/videos/:id/like', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  const videoId = c.req.param('id')
  const userId = user.id

  try {
    // Check if already liked
    const existing = await env.DB.prepare('SELECT * FROM user_likes WHERE user_id = ? AND video_id = ?').bind(userId, videoId).first()
    
    if (existing) {
      return c.json({ error: 'Already liked this video', liked: true }, 400)
    }

    // Free users: Check like limit (1 like)
    if (user.membership_type === 'free') {
      const likeCount = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM user_likes WHERE user_id = ?'
      ).bind(userId).first() as any
      
      if (likeCount && likeCount.count >= 1) {
        return c.json({ 
          error: 'Free plan limit reached',
          message: 'プレミアムプランにアップグレードすると無制限にいいねできます',
          limit_reached: true,
          current_count: likeCount.count
        }, 403)
      }
    }

    // Add like
    await env.DB.prepare('INSERT INTO user_likes (user_id, video_id) VALUES (?, ?)').bind(userId, videoId).run()
    await env.DB.prepare('UPDATE videos SET likes = likes + 1 WHERE id = ?').bind(videoId).run()
    
    // Update rankings (internal likes only)
    await env.DB.prepare(`
      UPDATE video_rankings 
      SET 
        total_score = total_score + 1,
        daily_score = daily_score + 1,
        weekly_score = weekly_score + 1,
        monthly_score = monthly_score + 1,
        yearly_score = yearly_score + 1,
        last_updated = CURRENT_TIMESTAMP
      WHERE video_id = ?
    `).bind(videoId).run()
    
    // Get updated like count
    const video = await env.DB.prepare('SELECT likes FROM videos WHERE id = ?').bind(videoId).first() as any
    const userLikeCount = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM user_likes WHERE user_id = ?'
    ).bind(userId).first() as any
    
    return c.json({ 
      message: 'Liked successfully',
      liked: true,
      likes: video.likes,
      user_like_count: userLikeCount.count,
      remaining_likes: user.membership_type === 'free' ? (1 - userLikeCount.count) : 'unlimited'
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Check if user liked video and get like info
app.get('/api/videos/:id/liked', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any

  if (!user) {
    return c.json({ liked: false, user_like_count: 0, remaining_likes: 0 })
  }

  const videoId = c.req.param('id')
  const userId = user.id

  try {
    const like = await env.DB.prepare('SELECT * FROM user_likes WHERE user_id = ? AND video_id = ?').bind(userId, videoId).first()
    const userLikeCount = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM user_likes WHERE user_id = ?'
    ).bind(userId).first() as any
    
    return c.json({ 
      liked: !!like,
      user_like_count: userLikeCount.count,
      remaining_likes: user.membership_type === 'free' ? Math.max(0, 1 - userLikeCount.count) : 'unlimited'
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Favorite video
app.post('/api/videos/:id/favorite', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '')

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  const videoId = c.req.param('id')
  const userId = (user as any).id

  try {
    const existing = await env.DB.prepare('SELECT * FROM favorites WHERE user_id = ? AND video_id = ?').bind(userId, videoId).first()
    
    if (existing) {
      await env.DB.prepare('DELETE FROM favorites WHERE user_id = ? AND video_id = ?').bind(userId, videoId).run()
      await env.DB.prepare('UPDATE video_rankings SET total_score = total_score - 5, weekly_score = weekly_score - 5, monthly_score = monthly_score - 5 WHERE video_id = ?').bind(videoId).run()
      return c.json({ message: 'Removed from favorites', favorited: false })
    } else {
      await env.DB.prepare('INSERT INTO favorites (user_id, video_id) VALUES (?, ?)').bind(userId, videoId).run()
      await env.DB.prepare('UPDATE video_rankings SET total_score = total_score + 5, weekly_score = weekly_score + 5, monthly_score = monthly_score + 5 WHERE video_id = ?').bind(videoId).run()
      return c.json({ message: 'Added to favorites', favorited: true })
    }
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Check if user favorited video
app.get('/api/videos/:id/favorited', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '')

  if (!user) {
    return c.json({ favorited: false })
  }

  const videoId = c.req.param('id')
  const userId = (user as any).id

  try {
    const favorite = await env.DB.prepare('SELECT * FROM favorites WHERE user_id = ? AND video_id = ?').bind(userId, videoId).first()
    return c.json({ favorited: !!favorite })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Comments API ============

// Get comments for video
app.get('/api/videos/:id/comments', async (c) => {
  const { env } = c
  const videoId = c.req.param('id')

  try {
    const { results: comments } = await env.DB.prepare(`
      SELECT c.*, u.username 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.video_id = ? 
      ORDER BY c.created_at DESC
    `).bind(videoId).all()

    return c.json(comments)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Post comment
app.post('/api/videos/:id/comments', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '')

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  const videoId = c.req.param('id')
  const userId = (user as any).id
  const body = await c.req.json()
  const { content } = body

  if (!content || content.trim() === '') {
    return c.json({ error: 'Comment content is required' }, 400)
  }

  try {
    const result = await env.DB.prepare(
      'INSERT INTO comments (video_id, user_id, content) VALUES (?, ?, ?)'
    ).bind(videoId, userId, content).run()

    // Update ranking score
    await env.DB.prepare('UPDATE video_rankings SET total_score = total_score + 3, weekly_score = weekly_score + 3, monthly_score = monthly_score + 3 WHERE video_id = ?').bind(videoId).run()

    return c.json({ id: result.meta.last_row_id, message: 'Comment posted successfully' }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Rankings API ============

// Get rankings
app.get('/api/rankings/:type', async (c) => {
  const { env } = c
  const type = c.req.param('type') // 'daily', 'weekly', 'monthly', 'yearly', 'total'
  const limit = parseInt(c.req.query('limit') || '20')

  let scoreColumn = 'total_score'
  if (type === 'daily') scoreColumn = 'daily_score'
  if (type === 'weekly') scoreColumn = 'weekly_score'
  if (type === 'monthly') scoreColumn = 'monthly_score'
  if (type === 'yearly') scoreColumn = 'yearly_score'

  try {
    const { results: rankings } = await env.DB.prepare(`
      SELECT v.*, r.${scoreColumn} as score, r.last_updated
      FROM video_rankings r
      JOIN videos v ON r.video_id = v.id
      ORDER BY r.${scoreColumn} DESC
      LIMIT ?
    `).bind(limit).all()

    return c.json(rankings)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Ad Banners API ============

// Get ad banners by position
app.get('/api/ad-banners', async (c) => {
  const { env } = c
  const position = c.req.query('position') || ''
  
  try {
    let query = `
      SELECT * FROM ad_banners 
      WHERE is_active = 1
      AND (start_date IS NULL OR start_date <= datetime('now'))
      AND (end_date IS NULL OR end_date >= datetime('now'))
    `
    const params: any[] = []
    
    if (position) {
      query += ' AND position = ?'
      params.push(position)
    }
    
    query += ' ORDER BY priority ASC'
    
    const { results: banners } = await env.DB.prepare(query).bind(...params).all()
    return c.json(banners || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Track ad banner impression
app.post('/api/ad-banners/:id/impression', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  
  try {
    await env.DB.prepare(
      'UPDATE ad_banners SET impression_count = impression_count + 1 WHERE id = ?'
    ).bind(id).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Track ad banner click
app.post('/api/ad-banners/:id/click', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  
  try {
    await env.DB.prepare(
      'UPDATE ad_banners SET click_count = click_count + 1 WHERE id = ?'
    ).bind(id).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Blog API ============

// ============ Blog Genres API ============

// Get all blog genres
app.get('/api/blog/genres', async (c) => {
  const { env } = c
  
  try {
    const { results: genres } = await env.DB.prepare(`
      SELECT * FROM blog_genres 
      WHERE is_active = 1 
      ORDER BY display_order ASC
    `).all()
    
    return c.json(genres || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Blog Tags API (MUST BE BEFORE /api/blog/:id) ============

// Get all blog tags
app.get('/api/blog/tags', async (c) => {
  const { env } = c
  
  try {
    const tags = await env.DB.prepare(`
      SELECT t.*, COUNT(pt.blog_post_id) as post_count
      FROM blog_tags t
      LEFT JOIN blog_post_tags pt ON t.id = pt.tag_id
      GROUP BY t.id
      ORDER BY t.name ASC
    `).all()

    return c.json(tags.results)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get blog posts by tag
app.get('/api/blog/posts/tag/:tagName', async (c) => {
  const { env } = c
  const tagName = c.req.param('tagName')

  try {
    const posts = await env.DB.prepare(`
      SELECT DISTINCT p.*
      FROM blog_posts p
      JOIN blog_post_tags pt ON p.id = pt.blog_post_id
      JOIN blog_tags t ON pt.tag_id = t.id
      WHERE t.name = ?
      ORDER BY p.published_date DESC
    `).bind(tagName).all()

    return c.json(posts.results)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get all blog posts
// Helper function to get localized field
function getLocalizedField(obj: any, fieldName: string, lang: string): string {
  if (lang === 'en' && obj[`${fieldName}_en`]) return obj[`${fieldName}_en`]
  if (lang === 'zh' && obj[`${fieldName}_zh`]) return obj[`${fieldName}_zh`]
  if (lang === 'ko' && obj[`${fieldName}_ko`]) return obj[`${fieldName}_ko`]
  return obj[fieldName] // Default to Japanese
}

app.get('/api/blog', async (c) => {
  const { env } = c
  const lang = c.req.query('lang') || 'ja'
  const genre = c.req.query('genre') || ''

  try {
    let query = 'SELECT * FROM blog_posts'
    const params: any[] = []
    
    if (genre) {
      query += ' WHERE genre = ?'
      params.push(genre)
    }
    
    query += ' ORDER BY published_date DESC'
    
    const { results: posts } = await env.DB.prepare(query).bind(...params).all()
    
    // Return language-specific fields based on lang parameter (supports ja/en/zh/ko)
    const localizedPosts = (posts as any[]).map((post: any) => ({
      ...post,
      title: getLocalizedField(post, 'title', lang),
      content: getLocalizedField(post, 'content', lang)
    }))
    
    return c.json(localizedPosts)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get single blog post (supports slug or ID)
app.get('/api/blog/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  const lang = c.req.query('lang') || 'ja'

  try {
    // Check if id is a slug (contains hyphens) or numeric ID
    const isSlug = id.includes('-')
    const query = isSlug 
      ? 'SELECT * FROM blog_posts WHERE slug = ?'
      : 'SELECT * FROM blog_posts WHERE id = ?'
    
    const post = await env.DB.prepare(query).bind(id).first() as any
    if (!post) {
      return c.json({ error: 'Blog post not found' }, 404)
    }
    
    // Return language-specific fields (supports ja/en/zh/ko)
    const localizedPost = {
      ...post,
      title: getLocalizedField(post, 'title', lang),
      content: getLocalizedField(post, 'content', lang)
    }
    
    return c.json(localizedPost)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Create blog post (admin only - simplified for demo)
app.post('/api/blog', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '')

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  const body = await c.req.json()
  const { title, title_en, content, content_en, image_url, published_date } = body

  if (!title || !content) {
    return c.json({ error: 'Title and content are required' }, 400)
  }

  try {
    const result = await env.DB.prepare(
      'INSERT INTO blog_posts (title, title_en, content, content_en, image_url, published_date) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(title, title_en || null, content, content_en || null, image_url || '', published_date || new Date().toISOString().split('T')[0]).run()

    return c.json({ id: result.meta.last_row_id, message: 'Blog post created successfully' }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update blog post
app.put('/api/blog/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '')

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  const id = c.req.param('id')
  const body = await c.req.json()
  const { title, title_en, content, content_en, image_url, published_date } = body

  try {
    await env.DB.prepare(
      'UPDATE blog_posts SET title = ?, title_en = ?, content = ?, content_en = ?, image_url = ?, published_date = ? WHERE id = ?'
    ).bind(title, title_en || null, content, content_en || null, image_url || '', published_date || new Date().toISOString().split('T')[0], id).run()

    return c.json({ message: 'Blog post updated successfully' })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete blog post
app.delete('/api/blog/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '')

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  const id = c.req.param('id')

  try {
    await env.DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(id).run()
    return c.json({ message: 'Blog post deleted successfully' })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Genspark AI Integration API ============

// Generate blog URL for Genspark AI
app.post('/api/genspark/blog-url', async (c) => {
  try {
    const body = await c.req.json()
    const { title_ja, title_en, title_zh, title_ko, custom_slug } = body

    if (!title_ja) {
      return c.json({ error: 'title_ja is required' }, 400)
    }

    // Generate slug from English title or custom slug
    let slug = custom_slug
    if (!slug && title_en) {
      slug = title_en
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')          // Replace spaces with hyphens
        .replace(/-+/g, '-')           // Replace multiple hyphens with single
        .replace(/^-|-$/g, '')         // Remove leading/trailing hyphens
    }
    
    // If still no slug, generate from timestamp
    if (!slug) {
      slug = `blog-post-${Date.now()}`
    }

    // Base URL (use environment variable or default)
    const baseUrl = 'https://climbhero.pages.dev'

    // Generate URLs for all 4 languages
    const urls = {
      ja: `${baseUrl}/blog/${slug}?lang=ja`,
      en: `${baseUrl}/blog/${slug}?lang=en`,
      zh: `${baseUrl}/blog/${slug}?lang=zh`,
      ko: `${baseUrl}/blog/${slug}?lang=ko`
    }

    // Collect titles
    const titles = {
      ja: title_ja,
      en: title_en || title_ja,
      zh: title_zh || title_ja,
      ko: title_ko || title_ja
    }

    // SEO preview data
    const seo_preview = {
      og_url: `${baseUrl}/blog/${slug}`,
      canonical: `${baseUrl}/blog/${slug}`,
      alternate_langs: [
        `<link rel="alternate" hreflang="ja" href="${urls.ja}" />`,
        `<link rel="alternate" hreflang="en" href="${urls.en}" />`,
        `<link rel="alternate" hreflang="zh" href="${urls.zh}" />`,
        `<link rel="alternate" hreflang="ko" href="${urls.ko}" />`
      ]
    }

    return c.json({
      slug,
      urls,
      titles,
      seo_preview,
      message: 'Blog URLs generated successfully for 4 languages (ja/en/zh/ko)',
      usage_note: 'Use these URLs in your blog posts. The slug is SEO-optimized and supports multilingual content.'
    })

  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ User Profile API ============

// Get user's videos
app.get('/api/users/:id/videos', async (c) => {
  const { env } = c
  const userId = c.req.param('id')

  try {
    // For demo, return all videos (in production, track video ownership)
    const { results: videos } = await env.DB.prepare(
      'SELECT * FROM videos ORDER BY created_at DESC LIMIT 20'
    ).all()
    return c.json(videos)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get user's favorites
app.get('/api/users/:id/favorites', async (c) => {
  const { env } = c
  const userId = c.req.param('id')

  try {
    const { results: favorites } = await env.DB.prepare(`
      SELECT v.* 
      FROM favorites f 
      JOIN videos v ON f.video_id = v.id 
      WHERE f.user_id = ? 
      ORDER BY f.created_at DESC
    `).bind(userId).all()

    return c.json(favorites)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Frontend Route ============

// Favicon handler
app.get('/favicon.ico', (c) => {
  return c.notFound()
})

app.get('/', (c) => {
  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ClimbHero - 世界中のクライミング動画を発見し共有しよう</title>
        
        <!-- Favicons -->
        <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon-16x16.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png">
        <link rel="manifest" href="/static/site.webmanifest">
        
        <!-- Meta Tags for SEO -->
        <meta name="description" content="ClimbHero - 世界中のクライミング動画を発見し共有しよう。YouTube、Instagram、TikTok、Vimeoの動画を一括管理。リアルタイムランキング、多言語対応。">
        <meta name="keywords" content="クライミング,ボルダリング,動画,共有,プラットフォーム,YouTube,Instagram,TikTok,Vimeo,ランキング">
        <meta name="author" content="ClimbHero">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://climbhero.pages.dev/">
        <meta property="og:title" content="ClimbHero - 世界中のクライミング動画を発見し共有しよう">
        <meta property="og:description" content="世界中のクライミング動画を発見し共有しよう。YouTube、Instagram、TikTok、Vimeoの動画を一括管理。">
        <meta property="og:image" content="/android-chrome-512x512.png">
        
        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="https://climbhero.pages.dev/">
        <meta property="twitter:title" content="ClimbHero - 世界中のクライミング動画を発見し共有しよう">
        <meta property="twitter:description" content="世界中のクライミング動画を発見し共有しよう。YouTube、Instagram、TikTok、Vimeoの動画を一括管理。">
        <meta property="twitter:image" content="/android-chrome-512x512.png">
        
        <!-- Theme Color -->
        <meta name="theme-color" content="#7c3aed">
        
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div id="root"></div>
        
        <!-- Video Modal -->
        <div id="video-modal" class="modal">
            <div class="modal-content">
                <div class="modal-video-content"></div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/marked@11.0.0/marked.min.js"></script>
        <script src="/static/i18n.js"></script>
        <script src="/static/video-helpers.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `;
  return c.html(html)
})

// ============ Media Analysis API ============

// Parse video URL and extract media source and embed info
app.post('/api/media/analyze', async (c) => {
  try {
    const body = await c.req.json()
    const { url } = body

    if (!url) {
      return c.json({ error: 'URL is required' }, 400)
    }

    let mediaSource = 'unknown'
    let embedUrl = ''
    let videoId = ''

    // YouTube
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      mediaSource = 'youtube'
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
      if (match) {
        videoId = match[1]
        embedUrl = `https://www.youtube.com/embed/${videoId}`
      }
    }
    // YouTube Shorts
    else if (url.includes('youtube.com/shorts/')) {
      mediaSource = 'youtube_shorts'
      const match = url.match(/youtube\.com\/shorts\/([^?&\s]+)/)
      if (match) {
        videoId = match[1]
        embedUrl = `https://www.youtube.com/embed/${videoId}`
      }
    }
    // Vimeo
    else if (url.includes('vimeo.com/')) {
      mediaSource = 'vimeo'
      const match = url.match(/vimeo\.com\/(\d+)/)
      if (match) {
        videoId = match[1]
        embedUrl = `https://player.vimeo.com/video/${videoId}`
      }
    }
    // Instagram
    else if (url.includes('instagram.com/')) {
      mediaSource = 'instagram'
      const match = url.match(/instagram\.com\/(p|reel)\/([^/?]+)/)
      if (match) {
        videoId = match[2]
        embedUrl = `https://www.instagram.com/${match[1]}/${videoId}/embed`
      }
    }
    // TikTok
    else if (url.includes('tiktok.com/')) {
      mediaSource = 'tiktok'
      const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
      if (match) {
        videoId = match[1]
        embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`
      }
    }

    return c.json({
      media_source: mediaSource,
      video_id: videoId,
      embed_url: embedUrl,
      original_url: url
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get media source display name
function getMediaSourceName(source: string): string {
  const names: Record<string, string> = {
    'youtube': 'YouTube',
    'youtube_shorts': 'YouTube Shorts',
    'vimeo': 'Vimeo',
    'instagram': 'Instagram',
    'tiktok': 'TikTok'
  }
  return names[source] || 'Unknown'
}

// ============ Search API ============

app.get('/api/search', async (c) => {
  const { env } = c
  const query = c.req.query('q')
  
  if (!query || query.length < 2) {
    return c.json({ videos: [], users: [] })
  }
  
  try {
    const searchTerm = `%${query}%`
    
    // Search videos
    const videos = await env.DB.prepare(`
      SELECT * FROM videos 
      WHERE title LIKE ? OR description LIKE ? OR channel_name LIKE ?
      ORDER BY views DESC
      LIMIT 10
    `).bind(searchTerm, searchTerm, searchTerm).all()
    
    // Search users
    const users = await env.DB.prepare(`
      SELECT id, username, bio FROM users 
      WHERE username LIKE ? OR bio LIKE ?
      LIMIT 10
    `).bind(searchTerm, searchTerm).all()
    
    return c.json({
      videos: videos.results || [],
      users: users.results || []
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Notifications API ============

app.get('/api/notifications', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  
  try {
    const notifications = await env.DB.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).bind((user as any).id).all()
    
    return c.json(notifications.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/api/notifications/:id/read', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  
  const notificationId = c.req.param('id')
  
  try {
    await env.DB.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE id = ? AND user_id = ?
    `).bind(notificationId, (user as any).id).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/api/notifications/read-all', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  
  try {
    await env.DB.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE user_id = ?
    `).bind((user as any).id).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Comments API ============

app.get('/api/videos/:id/comments', async (c) => {
  const { env } = c
  const videoId = c.req.param('id')
  
  try {
    const comments = await env.DB.prepare(`
      SELECT c.*, u.username 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.video_id = ? AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
    `).bind(videoId).all()
    
    return c.json(comments.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/api/videos/:id/comments', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  
  const videoId = c.req.param('id')
  const { content, parent_id } = await c.req.json()
  
  if (!content || content.trim().length === 0) {
    return c.json({ error: 'Comment cannot be empty' }, 400)
  }
  
  try {
    const result = await env.DB.prepare(`
      INSERT INTO comments (video_id, user_id, parent_id, content)
      VALUES (?, ?, ?, ?)
    `).bind(videoId, (user as any).id, parent_id || null, content).run()
    
    return c.json({ 
      success: true, 
      comment_id: result.meta.last_row_id 
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Share Tracking API ============

app.post('/api/shares', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '')
  
  const { video_id, platform } = await c.req.json()
  
  try {
    await env.DB.prepare(`
      INSERT INTO video_shares (video_id, user_id, platform)
      VALUES (?, ?, ?)
    `).bind(video_id, user ? (user as any).id : null, platform).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Follow System API ============

app.post('/api/users/:id/follow', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  
  const followingId = c.req.param('id')
  
  try {
    // Check if already following
    const existing = await env.DB.prepare(`
      SELECT * FROM follows 
      WHERE follower_id = ? AND following_id = ?
    `).bind((user as any).id, followingId).first()
    
    if (existing) {
      // Unfollow
      await env.DB.prepare(`
        DELETE FROM follows 
        WHERE follower_id = ? AND following_id = ?
      `).bind((user as any).id, followingId).run()
      
      return c.json({ following: false })
    } else {
      // Follow
      await env.DB.prepare(`
        INSERT INTO follows (follower_id, following_id)
        VALUES (?, ?)
      `).bind((user as any).id, followingId).run()
      
      return c.json({ following: true })
    }
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Announcements API ============

// Get all active announcements
app.get('/api/announcements', async (c) => {
  const { env } = c
  const lang = c.req.query('lang') || 'ja'
  const genre = c.req.query('genre') || ''
  
  try {
    let query = `
      SELECT * FROM announcements 
      WHERE is_active = 1
    `
    const params: any[] = []
    
    if (genre) {
      query += ' AND genre = ?'
      params.push(genre)
    }
    
    query += ' ORDER BY priority DESC, created_at DESC'
    
    const announcements = await env.DB.prepare(query).bind(...params).all()
    
    // Return language-specific fields (supports ja/en/zh/ko)
    const localizedAnnouncements = (announcements.results as any[] || []).map((announcement: any) => ({
      ...announcement,
      title: getLocalizedField(announcement, 'title', lang),
      content: getLocalizedField(announcement, 'content', lang)
    }))
    
    return c.json(localizedAnnouncements)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get all announcements (admin)
app.get('/api/admin/announcements', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  try {
    const announcements = await env.DB.prepare(`
      SELECT * FROM announcements 
      ORDER BY created_at DESC
    `).all()
    
    return c.json(announcements.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Create announcement (admin)
app.post('/api/admin/announcements', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const { title, title_en, title_zh, title_ko, content, content_en, content_zh, content_ko, priority, is_active } = await c.req.json()
  
  if (!title || !content) {
    return c.json({ error: 'Title and content are required' }, 400)
  }
  
  try {
    const result = await env.DB.prepare(`
      INSERT INTO announcements (title, title_en, title_zh, title_ko, content, content_en, content_zh, content_ko, priority, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(title, title_en || null, title_zh || null, title_ko || null,
            content, content_en || null, content_zh || null, content_ko || null,
            priority || 0, is_active !== undefined ? is_active : 1).run()
    
    return c.json({ 
      success: true, 
      announcement_id: result.meta.last_row_id 
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update announcement (admin)
app.put('/api/admin/announcements/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const announcementId = c.req.param('id')
  const { title, title_en, title_zh, title_ko, content, content_en, content_zh, content_ko, priority, is_active } = await c.req.json()
  
  try {
    await env.DB.prepare(`
      UPDATE announcements 
      SET title = ?, title_en = ?, title_zh = ?, title_ko = ?,
          content = ?, content_en = ?, content_zh = ?, content_ko = ?,
          priority = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(title, title_en || null, title_zh || null, title_ko || null,
            content, content_en || null, content_zh || null, content_ko || null,
            priority || 0, is_active !== undefined ? is_active : 1, announcementId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete announcement (admin)
app.delete('/api/admin/announcements/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const announcementId = c.req.param('id')
  
  try {
    await env.DB.prepare(`
      DELETE FROM announcements WHERE id = ?
    `).bind(announcementId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Sponsor Banners API ============

// Get active sponsor banners by position (public)
app.get('/api/banners/:position', async (c) => {
  const { env } = c
  const position = c.req.param('position')
  
  if (!['top', 'bottom'].includes(position)) {
    return c.json({ error: 'Invalid position. Must be "top" or "bottom"' }, 400)
  }
  
  try {
    const banners = await env.DB.prepare(`
      SELECT * FROM sponsor_banners 
      WHERE position = ? 
        AND is_active = 1 
        AND (start_date IS NULL OR start_date <= datetime('now'))
        AND (end_date IS NULL OR end_date >= datetime('now'))
      ORDER BY display_order ASC, created_at DESC
    `).bind(position).all()
    
    return c.json(banners.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get all sponsor banners (admin)
app.get('/api/admin/banners', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  try {
    const banners = await env.DB.prepare(`
      SELECT * FROM sponsor_banners 
      ORDER BY position ASC, display_order ASC, created_at DESC
    `).all()
    
    return c.json(banners.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Create sponsor banner (admin)
app.post('/api/admin/banners', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const { title, image_url, link_url, position, is_active, display_order, start_date, end_date } = await c.req.json()
  
  if (!title || !image_url || !position) {
    return c.json({ error: 'Title, image_url, and position are required' }, 400)
  }
  
  if (!['top', 'bottom'].includes(position)) {
    return c.json({ error: 'Position must be "top" or "bottom"' }, 400)
  }
  
  try {
    const result = await env.DB.prepare(`
      INSERT INTO sponsor_banners (title, image_url, link_url, position, is_active, display_order, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title, 
      image_url, 
      link_url || null, 
      position, 
      is_active !== undefined ? is_active : 1,
      display_order || 0,
      start_date || null,
      end_date || null
    ).run()
    
    return c.json({ 
      success: true, 
      banner_id: result.meta.last_row_id 
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update sponsor banner (admin)
app.put('/api/admin/banners/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const bannerId = c.req.param('id')
  const { title, image_url, link_url, position, is_active, display_order, start_date, end_date } = await c.req.json()
  
  if (!title || !image_url || !position) {
    return c.json({ error: 'Title, image_url, and position are required' }, 400)
  }
  
  if (!['top', 'bottom'].includes(position)) {
    return c.json({ error: 'Position must be "top" or "bottom"' }, 400)
  }
  
  try {
    await env.DB.prepare(`
      UPDATE sponsor_banners 
      SET title = ?, image_url = ?, link_url = ?, position = ?, is_active = ?, 
          display_order = ?, start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title,
      image_url,
      link_url || null,
      position,
      is_active !== undefined ? is_active : 1,
      display_order || 0,
      start_date || null,
      end_date || null,
      bannerId
    ).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete sponsor banner (admin)
app.delete('/api/admin/banners/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const bannerId = c.req.param('id')
  
  try {
    await env.DB.prepare(`
      DELETE FROM sponsor_banners WHERE id = ?
    `).bind(bannerId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Admin Ad Banners Management API ============

// Create ad banner (admin)
app.post('/api/admin/ad-banners', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const { title, image_url, link_url, position, is_active, priority, start_date, end_date } = await c.req.json()
  
  if (!title || !image_url || !position) {
    return c.json({ error: 'Title, image_url, and position are required' }, 400)
  }
  
  if (!['hero_bottom', 'blog_top'].includes(position)) {
    return c.json({ error: 'Position must be "hero_bottom" or "blog_top"' }, 400)
  }
  
  try {
    const result = await env.DB.prepare(`
      INSERT INTO ad_banners (title, image_url, link_url, position, is_active, priority, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title,
      image_url,
      link_url || null,
      position,
      is_active !== undefined ? is_active : 1,
      priority || 0,
      start_date || null,
      end_date || null
    ).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update ad banner (admin)
app.put('/api/admin/ad-banners/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const bannerId = c.req.param('id')
  const { title, image_url, link_url, position, is_active, priority, start_date, end_date } = await c.req.json()
  
  if (!title || !image_url || !position) {
    return c.json({ error: 'Title, image_url, and position are required' }, 400)
  }
  
  if (!['hero_bottom', 'blog_top'].includes(position)) {
    return c.json({ error: 'Position must be "hero_bottom" or "blog_top"' }, 400)
  }
  
  try {
    await env.DB.prepare(`
      UPDATE ad_banners 
      SET title = ?, image_url = ?, link_url = ?, position = ?, is_active = ?, 
          priority = ?, start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title,
      image_url,
      link_url || null,
      position,
      is_active !== undefined ? is_active : 1,
      priority || 0,
      start_date || null,
      end_date || null,
      bannerId
    ).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete ad banner (admin)
app.delete('/api/admin/ad-banners/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const bannerId = c.req.param('id')
  
  try {
    await env.DB.prepare(`
      DELETE FROM ad_banners WHERE id = ?
    `).bind(bannerId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Admin Video Management API ============

// Get all videos (admin)
app.get('/api/admin/videos', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  try {
    const videos = await env.DB.prepare(`
      SELECT * FROM videos 
      ORDER BY created_at DESC
    `).all()
    
    return c.json(videos.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update video (admin)
app.put('/api/admin/videos/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const videoId = c.req.param('id')
  const { title, description, category, likes, views } = await c.req.json()
  
  try {
    await env.DB.prepare(`
      UPDATE videos 
      SET title = ?, description = ?, category = ?, likes = ?, views = ?
      WHERE id = ?
    `).bind(title, description, category, likes, views, videoId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete video (admin)
app.delete('/api/admin/videos/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const videoId = c.req.param('id')
  
  try {
    await env.DB.prepare(`
      DELETE FROM videos WHERE id = ?
    `).bind(videoId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ User Management API (Admin) ============

// Get all users (admin)
app.get('/api/admin/users', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  try {
    const result = await env.DB.prepare(`
      SELECT id, email, username, membership_type, is_admin, notes, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `).all()
    
    return c.json(result.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update user (admin)
app.put('/api/admin/users/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const userId = c.req.param('id')
  const { username, email, membership_type, notes, password, is_admin } = await c.req.json()
  
  try {
    if (password) {
      // Update with new password
      const passwordHash = hashPassword(password)
      await env.DB.prepare(`
        UPDATE users 
        SET username = ?, email = ?, membership_type = ?, notes = ?, password_hash = ?, is_admin = ?
        WHERE id = ?
      `).bind(username, email, membership_type, notes, passwordHash, is_admin || 0, userId).run()
    } else {
      // Update without password change
      await env.DB.prepare(`
        UPDATE users 
        SET username = ?, email = ?, membership_type = ?, notes = ?, is_admin = ?
        WHERE id = ?
      `).bind(username, email, membership_type, notes, is_admin || 0, userId).run()
    }
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete user (admin)
app.delete('/api/admin/users/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const userId = c.req.param('id')
  
  // Prevent deleting own account
  if (parseInt(userId) === user.id) {
    return c.json({ error: '自分のアカウントは削除できません' }, 400)
  }
  
  try {
    // Delete user and related data
    await env.DB.batch([
      env.DB.prepare('DELETE FROM user_likes WHERE user_id = ?').bind(userId),
      env.DB.prepare('DELETE FROM favorites WHERE user_id = ?').bind(userId),
      env.DB.prepare('DELETE FROM comments WHERE user_id = ?').bind(userId),
      env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId)
    ])
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ User Settings API ============

// Change password (user)
app.post('/api/user/change-password', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user) {
    return c.json({ error: 'ログインが必要です' }, 401)
  }
  
  const { currentPassword, newPassword } = await c.req.json()
  
  if (!currentPassword || !newPassword) {
    return c.json({ error: '現在のパスワードと新しいパスワードが必要です' }, 400)
  }
  
  if (newPassword.length < 6) {
    return c.json({ error: '新しいパスワードは6文字以上である必要があります' }, 400)
  }
  
  try {
    // Verify current password
    const currentHash = hashPassword(currentPassword)
    if (user.password_hash !== currentHash) {
      return c.json({ error: '現在のパスワードが正しくありません' }, 400)
    }
    
    // Update password
    const newHash = hashPassword(newPassword)
    await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
      .bind(newHash, user.id).run()
    
    return c.json({ success: true, message: 'パスワードが変更されました' })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Stripe Settings API ============

// Get Stripe settings (admin)
app.get('/api/admin/stripe-settings', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  try {
    const settings = await env.DB.prepare(`
      SELECT setting_key, setting_value FROM stripe_settings
    `).all()
    
    const settingsObj: Record<string, string> = {}
    settings.results?.forEach((row: any) => {
      settingsObj[row.setting_key] = row.setting_value
    })
    
    return c.json(settingsObj)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Save Stripe settings (admin)
app.post('/api/admin/stripe-settings', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const { publishable_key, secret_key, webhook_secret } = await c.req.json()
  
  try {
    // Upsert settings
    if (publishable_key) {
      await env.DB.prepare(`
        INSERT INTO stripe_settings (setting_key, setting_value, updated_at)
        VALUES ('publishable_key', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(setting_key) DO UPDATE SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
      `).bind(publishable_key, publishable_key).run()
    }
    
    if (secret_key) {
      await env.DB.prepare(`
        INSERT INTO stripe_settings (setting_key, setting_value, updated_at)
        VALUES ('secret_key', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(setting_key) DO UPDATE SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
      `).bind(secret_key, secret_key).run()
    }
    
    if (webhook_secret) {
      await env.DB.prepare(`
        INSERT INTO stripe_settings (setting_key, setting_value, updated_at)
        VALUES ('webhook_secret', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(setting_key) DO UPDATE SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
      `).bind(webhook_secret, webhook_secret).run()
    }
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Email Campaign API ============

// Get all email campaigns (admin)
app.get('/api/admin/email-campaigns', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  try {
    const campaigns = await env.DB.prepare(`
      SELECT * FROM email_campaigns
      ORDER BY created_at DESC
    `).all()
    
    return c.json(campaigns.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Create email campaign (admin)
app.post('/api/admin/email-campaigns', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const { subject, content } = await c.req.json()
  
  if (!subject || !content) {
    return c.json({ error: 'Subject and content are required' }, 400)
  }
  
  try {
    // Get user count
    const userCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM users
    `).first() as any
    
    const result = await env.DB.prepare(`
      INSERT INTO email_campaigns (subject, content, recipient_count, created_by, status)
      VALUES (?, ?, ?, ?, 'draft')
    `).bind(subject, content, userCount?.count || 0, user.id).run()
    
    return c.json({ 
      success: true, 
      campaign_id: result.meta.last_row_id 
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Send email campaign (admin)
app.post('/api/admin/email-campaigns/:id/send', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const campaignId = c.req.param('id')
  
  try {
    // Get campaign
    const campaign = await env.DB.prepare(`
      SELECT * FROM email_campaigns WHERE id = ?
    `).bind(campaignId).first() as any
    
    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404)
    }
    
    // Get all users
    const users = await env.DB.prepare(`
      SELECT id, email FROM users
    `).all()
    
    // Update campaign status
    await env.DB.prepare(`
      UPDATE email_campaigns 
      SET status = 'sending', sent_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(campaignId).run()
    
    // Create email logs (simulated - in production, integrate with email service)
    for (const usr of users.results || []) {
      await env.DB.prepare(`
        INSERT INTO email_logs (campaign_id, user_id, email, status)
        VALUES (?, ?, ?, 'sent')
      `).bind(campaignId, (usr as any).id, (usr as any).email).run()
    }
    
    // Update sent count
    await env.DB.prepare(`
      UPDATE email_campaigns 
      SET status = 'sent', sent_count = ?
      WHERE id = ?
    `).bind(users.results?.length || 0, campaignId).run()
    
    return c.json({ success: true, sent_count: users.results?.length || 0 })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete email campaign (admin)
app.delete('/api/admin/email-campaigns/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const campaignId = c.req.param('id')
  
  try {
    await env.DB.prepare(`
      DELETE FROM email_campaigns WHERE id = ?
    `).bind(campaignId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ AI URL Validation & Genre Detection API ============

// Validate and analyze video URL with AI simulation
app.post('/api/media/validate', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  const { url } = await c.req.json()
  
  if (!url) {
    return c.json({ error: 'URL is required' }, 400)
  }
  
  try {
    // Check daily posting limit
    const today = new Date().toISOString().split('T')[0]
    const dailyLimit = user.membership_type === 'premium' ? 30 : 10
    
    let limitRecord = await env.DB.prepare(`
      SELECT * FROM posting_limits WHERE user_id = ? AND date = ?
    `).bind(user.id, today).first() as any
    
    if (!limitRecord) {
      // Create new limit record for today
      await env.DB.prepare(`
        INSERT INTO posting_limits (user_id, date, post_count, daily_limit)
        VALUES (?, ?, 0, ?)
      `).bind(user.id, today, dailyLimit).run()
      limitRecord = { post_count: 0, daily_limit: dailyLimit }
    }
    
    if (limitRecord.post_count >= limitRecord.daily_limit) {
      return c.json({
        error: 'Daily posting limit reached',
        message: user.membership_type === 'premium' 
          ? '本日の投稿上限（30件）に達しました'
          : '本日の投稿上限（10件）に達しました。プレミアムプランで30件まで投稿可能です',
        limit_reached: true,
        current_count: limitRecord.post_count,
        daily_limit: limitRecord.daily_limit
      }, 429)
    }
    
    // Parse URL to get platform info
    const analysisResult = await analyzeVideoUrl(url)
    
    // Simulate AI classification (in production, call ML model)
    const aiClassification = simulateAIClassification(url, analysisResult.title || '')
    
    // Check for duplicate submissions
    const existingSubmission = await env.DB.prepare(`
      SELECT * FROM video_submissions 
      WHERE canonical_url = ? OR submitted_url = ?
    `).bind(analysisResult.canonical_url || url, url).first()
    
    if (existingSubmission) {
      return c.json({
        error: 'Duplicate video',
        message: 'この動画は既に投稿されています',
        duplicate: true
      }, 400)
    }
    
    return c.json({
      valid: true,
      platform: analysisResult.platform,
      video_id: analysisResult.video_id,
      canonical_url: analysisResult.canonical_url,
      ai_classification: {
        genre: aiClassification.genre,
        confidence: aiClassification.confidence,
        is_authentic: aiClassification.is_authentic,
        tags: aiClassification.tags
      },
      posting_limit: {
        used: limitRecord.post_count,
        limit: limitRecord.daily_limit,
        remaining: limitRecord.daily_limit - limitRecord.post_count
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Helper function to analyze video URL
async function analyzeVideoUrl(url: string) {
  let platform = 'unknown'
  let videoId = ''
  let canonicalUrl = url
  let title = ''
  
  // YouTube
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
    platform = 'youtube'
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (match) {
      videoId = match[1]
      canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`
      title = 'YouTube Climbing Video'
    }
  }
  // YouTube Shorts
  else if (url.includes('youtube.com/shorts/')) {
    platform = 'youtube_shorts'
    const match = url.match(/youtube\.com\/shorts\/([^?&\s]+)/)
    if (match) {
      videoId = match[1]
      canonicalUrl = `https://www.youtube.com/shorts/${videoId}`
      title = 'YouTube Shorts Climbing'
    }
  }
  // Vimeo
  else if (url.includes('vimeo.com/')) {
    platform = 'vimeo'
    const match = url.match(/vimeo\.com\/(\d+)/)
    if (match) {
      videoId = match[1]
      canonicalUrl = `https://vimeo.com/${videoId}`
      title = 'Vimeo Climbing Video'
    }
  }
  // Instagram
  else if (url.includes('instagram.com/')) {
    platform = 'instagram'
    const match = url.match(/instagram\.com\/(p|reel)\/([^/?]+)/)
    if (match) {
      videoId = match[2]
      canonicalUrl = `https://www.instagram.com/${match[1]}/${videoId}/`
      title = 'Instagram Climbing'
    }
  }
  // TikTok
  else if (url.includes('tiktok.com/')) {
    platform = 'tiktok'
    const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
    if (match) {
      videoId = match[1]
      canonicalUrl = url
      title = 'TikTok Climbing'
    }
  }
  
  return {
    platform,
    video_id: videoId,
    canonical_url: canonicalUrl,
    title
  }
}

// Simulate AI classification (replace with real ML model in production)
function simulateAIClassification(url: string, title: string) {
  const content = (url + ' ' + title).toLowerCase()
  
  // Determine genre based on keywords
  let genre = 'other'
  let confidence = 0.85
  const tags: string[] = []
  
  if (content.includes('boulder') || content.includes('ボルダリング') || content.includes('ボルダー')) {
    genre = 'bouldering'
    confidence = 0.92
    tags.push('bouldering', 'indoor')
  } else if (content.includes('lead') || content.includes('リード') || content.includes('sport climb')) {
    genre = 'lead'
    confidence = 0.90
    tags.push('lead', 'rope')
  } else if (content.includes('alpine') || content.includes('アルパイン') || content.includes('mountain')) {
    genre = 'alpine'
    confidence = 0.88
    tags.push('alpine', 'outdoor', 'mountain')
  } else if (content.includes('climb') || content.includes('クライミング')) {
    genre = 'other'
    confidence = 0.80
    tags.push('climbing')
  }
  
  // Check if it looks like authentic climbing content
  const isAuthentic = content.includes('climb') || content.includes('boulder') || 
                       content.includes('クライミング') || content.includes('ボルダリング')
  
  // Add difficulty tags
  if (content.includes('v10') || content.includes('v11') || content.includes('v12')) {
    tags.push('advanced')
  } else if (content.includes('v7') || content.includes('v8') || content.includes('v9')) {
    tags.push('intermediate')
  }
  
  // Add location tags
  if (content.includes('outdoor') || content.includes('rock') || content.includes('crag')) {
    tags.push('outdoor')
  } else if (content.includes('gym') || content.includes('ジム') || content.includes('indoor')) {
    tags.push('indoor')
  }
  
  return {
    genre,
    confidence,
    is_authentic: isAuthentic,
    tags
  }
}

// Submit video after validation
app.post('/api/media/submit', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  const { url, title, description, ai_classification } = await c.req.json()
  
  if (!url || !title) {
    return c.json({ error: 'URL and title are required' }, 400)
  }
  
  try {
    // Increment posting limit
    const today = new Date().toISOString().split('T')[0]
    await env.DB.prepare(`
      UPDATE posting_limits 
      SET post_count = post_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND date = ?
    `).bind(user.id, today).run()
    
    // Create video submission
    const result = await env.DB.prepare(`
      INSERT INTO video_submissions (
        user_id, submitted_url, canonical_url, platform, video_id_external,
        title, description, ai_genre, ai_confidence, ai_tags, is_authentic, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      url,
      ai_classification.canonical_url || url,
      ai_classification.platform,
      ai_classification.video_id,
      title,
      description || '',
      ai_classification.ai_classification.genre,
      ai_classification.ai_classification.confidence,
      JSON.stringify(ai_classification.ai_classification.tags),
      ai_classification.ai_classification.is_authentic ? 1 : 0,
      ai_classification.ai_classification.confidence > 0.85 ? 'approved' : 'pending'
    ).run()
    
    // If auto-approved, also create in videos table
    if (ai_classification.ai_classification.confidence > 0.85) {
      const videoResult = await env.DB.prepare(`
        INSERT INTO videos (
          title, description, url, category, uploader_id, platform, video_id_external
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        title,
        description || '',
        url,
        ai_classification.ai_classification.genre,
        user.id,
        ai_classification.platform,
        ai_classification.video_id
      ).run()
      
      // Initialize ranking entry
      await env.DB.prepare(`
        INSERT INTO video_rankings (video_id, total_score) VALUES (?, 0)
      `).bind(videoResult.meta.last_row_id).run()
    }
    
    return c.json({
      success: true,
      submission_id: result.meta.last_row_id,
      status: ai_classification.ai_classification.confidence > 0.85 ? 'approved' : 'pending',
      message: ai_classification.ai_classification.confidence > 0.85 
        ? '動画が承認されました！' 
        : '動画を送信しました。審査をお待ちください。'
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get user's posting stats
app.get('/api/users/posting-stats', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  try {
    const today = new Date().toISOString().split('T')[0]
    const dailyLimit = user.membership_type === 'premium' ? 30 : 10
    
    const limitRecord = await env.DB.prepare(`
      SELECT * FROM posting_limits WHERE user_id = ? AND date = ?
    `).bind(user.id, today).first() as any
    
    const totalSubmissions = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM video_submissions WHERE user_id = ?
    `).bind(user.id).first() as any
    
    const approvedSubmissions = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM video_submissions WHERE user_id = ? AND status = 'approved'
    `).bind(user.id).first() as any
    
    return c.json({
      daily: {
        used: limitRecord?.post_count || 0,
        limit: dailyLimit,
        remaining: dailyLimit - (limitRecord?.post_count || 0)
      },
      total: {
        submissions: totalSubmissions?.count || 0,
        approved: approvedSubmissions?.count || 0,
        pending: (totalSubmissions?.count || 0) - (approvedSubmissions?.count || 0)
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Contests API ============

// Get all active contests
app.get('/api/contests', async (c) => {
  const { env } = c
  
  try {
    const contests = await env.DB.prepare(`
      SELECT * FROM contests 
      WHERE is_public = 1 AND status IN ('active', 'judging')
      ORDER BY start_date DESC
    `).all()
    
    return c.json(contests.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get single contest details
app.get('/api/contests/:id', async (c) => {
  const { env } = c
  const contestId = c.req.param('id')
  
  try {
    const contest = await env.DB.prepare(`
      SELECT * FROM contests WHERE id = ?
    `).bind(contestId).first()
    
    if (!contest) {
      return c.json({ error: 'Contest not found' }, 404)
    }
    
    // Get submissions count
    const submissionsCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM contest_submissions WHERE contest_id = ?
    `).bind(contestId).first() as any
    
    return c.json({
      ...contest,
      submissions_count: submissionsCount?.count || 0
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Submit to contest
app.post('/api/contests/:id/submit', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  const contestId = c.req.param('id')
  const { video_id, category } = await c.req.json()
  
  if (!video_id) {
    return c.json({ error: 'Video ID is required' }, 400)
  }
  
  try {
    // Check if contest is accepting submissions
    const contest = await env.DB.prepare(`
      SELECT * FROM contests WHERE id = ?
    `).bind(contestId).first() as any
    
    if (!contest) {
      return c.json({ error: 'Contest not found' }, 404)
    }
    
    const now = new Date()
    const deadline = new Date(contest.submission_deadline)
    
    if (now > deadline) {
      return c.json({ error: 'Submission deadline has passed' }, 400)
    }
    
    // Check user's submission count
    const userSubmissions = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM contest_submissions 
      WHERE contest_id = ? AND user_id = ?
    `).bind(contestId, user.id).first() as any
    
    if (userSubmissions.count >= contest.max_entries_per_user) {
      return c.json({ 
        error: 'Maximum entries reached',
        message: `最大${contest.max_entries_per_user}件まで投稿できます`
      }, 400)
    }
    
    // Create submission
    const result = await env.DB.prepare(`
      INSERT INTO contest_submissions (contest_id, user_id, video_id, category, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).bind(contestId, user.id, video_id, category || 'general').run()
    
    return c.json({
      success: true,
      submission_id: result.meta.last_row_id,
      message: 'コンテストに応募しました！'
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Vote on contest submission
app.post('/api/contests/:contestId/vote/:submissionId', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  const contestId = c.req.param('contestId')
  const submissionId = c.req.param('submissionId')
  const { score } = await c.req.json()
  
  if (!score || score < 1 || score > 5) {
    return c.json({ error: 'Score must be between 1 and 5' }, 400)
  }
  
  try {
    // Check if already voted
    const existing = await env.DB.prepare(`
      SELECT * FROM contest_votes 
      WHERE submission_id = ? AND user_id = ?
    `).bind(submissionId, user.id).first()
    
    if (existing) {
      return c.json({ error: 'Already voted on this submission' }, 400)
    }
    
    // Add vote
    await env.DB.prepare(`
      INSERT INTO contest_votes (contest_id, submission_id, user_id, score)
      VALUES (?, ?, ?, ?)
    `).bind(contestId, submissionId, user.id, score).run()
    
    // Update submission vote count
    await env.DB.prepare(`
      UPDATE contest_submissions 
      SET public_votes = public_votes + ?
      WHERE id = ?
    `).bind(score, submissionId).run()
    
    return c.json({ success: true, message: '投票しました！' })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Safety Guidelines API ============

// Get all active safety guidelines
app.get('/api/safety-guidelines', async (c) => {
  const { env } = c
  
  try {
    const guidelines = await env.DB.prepare(`
      SELECT * FROM safety_guidelines 
      WHERE is_active = 1
      ORDER BY created_at DESC
    `).all()
    
    return c.json(guidelines.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get single safety guideline
app.get('/api/safety-guidelines/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  
  try {
    const guideline = await env.DB.prepare(`
      SELECT * FROM safety_guidelines WHERE id = ?
    `).bind(id).first()
    
    if (!guideline) {
      return c.json({ error: 'Guideline not found' }, 404)
    }
    
    return c.json(guideline)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Partners API ============

// Get all active partners
app.get('/api/partners', async (c) => {
  const { env } = c
  const type = c.req.query('type')
  const prefecture = c.req.query('prefecture')
  
  try {
    let query = 'SELECT * FROM partners WHERE status = ?'
    const params: any[] = ['active']
    
    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }
    
    if (prefecture) {
      query += ' AND prefecture = ?'
      params.push(prefecture)
    }
    
    query += ' ORDER BY name'
    
    const partners = await env.DB.prepare(query).bind(...params).all()
    
    return c.json(partners.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get single partner
app.get('/api/partners/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  
  try {
    const partner = await env.DB.prepare(`
      SELECT * FROM partners WHERE id = ?
    `).bind(id).first()
    
    if (!partner) {
      return c.json({ error: 'Partner not found' }, 404)
    }
    
    // Get partner videos count
    const videosCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM partner_videos WHERE partner_id = ?
    `).bind(id).first() as any
    
    return c.json({
      ...partner,
      videos_count: videosCount?.count || 0
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Admin Contest Management ============

// Get all contests (admin)
app.get('/api/admin/contests', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  try {
    const contests = await env.DB.prepare(`
      SELECT * FROM contests ORDER BY created_at DESC
    `).all()
    
    return c.json(contests.results || [])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Create contest (admin)
app.post('/api/admin/contests', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const { title, description, rules, prize_pool, start_date, end_date, submission_deadline } = await c.req.json()
  
  if (!title || !start_date || !end_date || !submission_deadline) {
    return c.json({ error: 'Required fields missing' }, 400)
  }
  
  try {
    const result = await env.DB.prepare(`
      INSERT INTO contests (
        title, description, rules, prize_pool, 
        start_date, end_date, submission_deadline, 
        created_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `).bind(
      title, description || '', rules || '', prize_pool || '',
      start_date, end_date, submission_deadline, user.id
    ).run()
    
    return c.json({
      success: true,
      contest_id: result.meta.last_row_id,
      message: 'コンテストを作成しました'
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update contest (admin)
app.put('/api/admin/contests/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const user = await getUserFromSession(env.DB, sessionToken || '') as any
  
  if (!user || !user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  const contestId = c.req.param('id')
  const { title, description, status } = await c.req.json()
  
  try {
    await env.DB.prepare(`
      UPDATE contests 
      SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(title, description, status, contestId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Contact Form API ============

// Submit contact form
app.post('/api/contact', async (c) => {
  const { env } = c
  const { name, email, subject, message } = await c.req.json()
  
  if (!name || !email || !message) {
    return c.json({ error: 'Name, email, and message are required' }, 400)
  }
  
  try {
    // In production, send email via SendGrid/Mailgun
    // For now, just log to database (you could create a contact_messages table)
    console.log('Contact form submission:', { name, email, subject, message })
    
    return c.json({
      success: true,
      message: 'お問い合わせを受け付けました。2営業日以内にご連絡いたします。'
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Static Pages API ============

// Get Terms of Service
app.get('/api/pages/terms', async (c) => {
  return c.json({
    title: '利用規約',
    last_updated: '2024-10-28',
    content: `
# ClimbHero 利用規約

最終更新日：2024年10月28日

本利用規約（以下「本規約」）は、ClimbHero（以下「当サービス」）の利用条件を定めるものです。

## 第1条（適用）

1. 本規約は、ユーザーと当サービスとの間の当サービスの利用に関わる一切の関係に適用されます。
2. 当サービスが当サービス上で掲載する利用に関するルール等は、本規約の一部を構成するものとします。

## 第2条（利用登録）

1. 登録希望者が当サービスの定める方法によって利用登録を申請し、当サービスがこれを承認することによって、利用登録が完了するものとします。
2. 当サービスは、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあります：
   - 利用登録の申請に際して虚偽の事項を届け出た場合
   - 本規約に違反したことがある者からの申請である場合
   - その他、当サービスが利用登録を相当でないと判断した場合

## 第3条（ユーザーIDおよびパスワードの管理）

1. ユーザーは、自己の責任において、当サービスのユーザーIDおよびパスワードを適切に管理するものとします。
2. ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与することはできません。

## 第4条（コンテンツの投稿）

1. ユーザーは、当サービスに動画URLを投稿することができます。
2. 投稿されたコンテンツに関する著作権は投稿者に帰属します。
3. 当サービスは、投稿されたコンテンツを当サービスの運営・改善・プロモーションのために使用することができます。
4. 以下のコンテンツの投稿を禁止します：
   - 法令または公序良俗に違反する内容
   - 犯罪行為に関連する内容
   - 第三者の著作権、商標権等の知的財産権を侵害する内容
   - 第三者のプライバシーを侵害する内容
   - 当サービスのネットワークまたはシステム等に過度な負荷をかける行為

## 第5条（投稿制限）

1. 無料プランのユーザーは1日10件までの動画URL投稿が可能です。
2. プレミアムプランのユーザーは1日30件までの動画URL投稿が可能です。
3. 当サービスは、不正な投稿や規約違反があった場合、投稿を削除または制限することができます。

## 第6条（有料プラン）

1. プレミアムプランの料金は以下の通りです：
   - 月額プラン：$20/月
   - 年額プラン：$192/年（20%割引）
2. 料金は前払いとし、途中解約の場合でも返金は行いません。
3. 無料トライアル期間終了後、自動的に有料プランに移行します。

## 第7条（禁止事項）

ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません：

1. 法令または公序良俗に違反する行為
2. 犯罪行為に関連する行為
3. 当サービスの他のユーザー、または第三者の知的財産権、肖像権、プライバシー、名誉等を侵害する行為
4. 当サービスのネットワークまたはシステム等に過度な負荷をかける行為
5. 当サービスの運営を妨害するおそれのある行為
6. 不正アクセスをし、またはこれを試みる行為
7. 他のユーザーに関する個人情報等を収集または蓄積する行為
8. 不正な目的を持って当サービスを利用する行為
9. その他、当サービスが不適切と判断する行為

## 第8条（当サービスの提供の停止等）

1. 当サービスは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく当サービスの全部または一部の提供を停止または中断することができます：
   - システムの保守点検または更新を行う場合
   - 地震、落雷、火災、停電等の不可抗力により、システムの提供が困難となった場合
   - その他、システムの提供が困難と判断した場合

## 第9条（免責事項）

1. 当サービスは、当サービスに事実上または法律上の瑕疵がないことを保証するものではありません。
2. 当サービスは、当サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。

## 第10条（利用規約の変更）

当サービスは、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができます。

## 第11条（準拠法・裁判管轄）

1. 本規約の解釈にあたっては、日本法を準拠法とします。
2. 当サービスに関して紛争が生じた場合には、東京地方裁判所を専属的合意管轄とします。

## お問い合わせ

本規約に関するお問い合わせは、お問い合わせページよりご連絡ください。
    `
  })
})

// Get Privacy Policy
app.get('/api/pages/privacy', async (c) => {
  return c.json({
    title: 'プライバシーポリシー',
    last_updated: '2024-10-28',
    content: `
# プライバシーポリシー

最終更新日：2024年10月28日

ClimbHero（以下「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。

## 第1条（収集する情報）

当サービスは、以下の情報を収集します：

### 1. ユーザーが提供する情報
- メールアドレス
- ユーザー名
- プロフィール情報（任意）
- 投稿する動画URL

### 2. 自動的に収集される情報
- IPアドレス
- ブラウザの種類とバージョン
- デバイス情報
- アクセス日時
- リファラー情報
- Cookieおよび類似技術による情報

### 3. サービス利用に関する情報
- 動画の視聴履歴
- いいねやコメントの履歴
- 検索履歴

## 第2条（情報の利用目的）

収集した情報は、以下の目的で利用します：

1. **サービスの提供・運営**
   - アカウント管理
   - コンテンツの表示・配信
   - ユーザー認証

2. **サービスの改善**
   - ユーザー体験の向上
   - 新機能の開発
   - バグの修正

3. **コミュニケーション**
   - お知らせの送信
   - カスタマーサポート
   - マーケティング（オプトアウト可能）

4. **セキュリティ**
   - 不正行為の検知と防止
   - 規約違反の調査

5. **法令遵守**
   - 法的義務の履行
   - 権利の保護

## 第3条（情報の第三者提供）

当サービスは、以下の場合を除き、個人情報を第三者に提供しません：

1. ユーザーの同意がある場合
2. 法令に基づく場合
3. 人の生命、身体または財産の保護のために必要がある場合
4. サービス提供に必要な範囲で業務委託先に提供する場合

### 業務委託先
- 決済処理：Stripe Inc.
- メール配信：（使用する場合に記載）
- クラウドホスティング：Cloudflare, Inc.

## 第4条（Cookie等の利用）

### Cookieの使用
当サービスは、以下の目的でCookieを使用します：

1. ログイン状態の維持
2. ユーザー設定の保存
3. アクセス解析
4. 広告の最適化（無料プラン）

### Cookieの無効化
ブラウザの設定でCookieを無効にすることができますが、一部機能が利用できなくなる場合があります。

## 第5条（個人情報の管理）

### セキュリティ対策
当サービスは、以下のセキュリティ対策を実施しています：

1. SSL/TLS暗号化通信
2. パスワードのハッシュ化
3. アクセス制御
4. 定期的なセキュリティ監査

### データの保存期間
- アカウント情報：アカウント削除まで
- 投稿データ：アカウント削除まで
- アクセスログ：90日間

## 第6条（ユーザーの権利）

ユーザーは、以下の権利を有します：

1. **アクセス権**：自己の個人情報の開示を請求できます
2. **訂正権**：個人情報の訂正を請求できます
3. **削除権**：個人情報の削除を請求できます
4. **データポータビリティ権**：データの移行を請求できます
5. **オプトアウト権**：マーケティングメールの受信を拒否できます

これらの権利を行使する場合は、お問い合わせページよりご連絡ください。

## 第7条（子供のプライバシー）

当サービスは、13歳未満の子供から意図的に個人情報を収集しません。13歳未満の方は、保護者の同意を得た上でご利用ください。

## 第8条（国際的なデータ転送）

当サービスは、日本国外のサーバーを使用する場合があります。ユーザーの個人情報は、適切な保護措置を講じた上で国外に転送される場合があります。

## 第9条（プライバシーポリシーの変更）

当サービスは、必要に応じてプライバシーポリシーを変更することがあります。重要な変更がある場合は、サービス上で通知します。

## 第10条（お問い合わせ）

プライバシーに関するお問い合わせは、以下よりご連絡ください：

- お問い合わせページ：/contact
- メールアドレス：privacy@climbhero.info

## 第11条（準拠法）

本プライバシーポリシーは、日本法に準拠し、解釈されるものとします。

---

**GDPR対応**

EU圏のユーザーに対しては、GDPR（一般データ保護規則）に基づき、以下の権利を保証します：

- データアクセス権
- データ訂正権
- データ削除権（忘れられる権利）
- データポータビリティ権
- 処理の制限を求める権利
- 異議を申し立てる権利

これらの権利を行使する場合は、privacy@climbhero.infoまでご連絡ください。
    `
  })
})

// Get About Page
app.get('/api/pages/about', async (c) => {
  return c.json({
    title: 'ClimbHeroについて',
    last_updated: '2024-10-28',
    content: `
# ClimbHeroについて

## 私たちのミッション

**ClimbHero**は、世界中のクライマーをつなぎ、クライミングの魅力を広めることを使命としています。

### ビジョン

「すべてのクライマーが、自分の挑戦を共有し、他者から学び、共に成長できるプラットフォーム」

## ClimbHeroの特徴

### 🤖 AI自動分類システム

投稿された動画URLを**AI**が自動的に解析し、ジャンル（ボルダリング、リード、アルパインなど）を判定。本物のクライミング動画のみを厳選して共有できます。

**特徴：**
- 自動ジャンル検出
- 信頼度スコア表示
- 重複チェック機能
- 複数プラットフォーム対応（YouTube、Vimeo、Instagram、TikTok）

### 🏆 コンテストシステム

定期的に開催されるクライミング動画コンテストに参加できます。

**現在の開催例：**
- **第1回クライミング動画コンテスト**
  - 賞金総額：100万円
  - プロ・アマチュア部門
  - グレード別審査

### 🏋️ パートナージム

**全国200箇所以上**の提携ジムで撮影可能。

**提携ジムの特典：**
- 撮影許可の事前取得不要
- 専用撮影エリア
- 撮影機材の貸し出し（一部ジム）
- 会員割引

### 📊 ランキングシステム

いいねやコメントで動画を応援すると、ランキングに反映されます。

**ランキング種類：**
- デイリー
- ウィークリー
- マンスリー
- イヤリー

### 🛡️ 安全ガイドライン

クライミング撮影時の安全とマナーに関する包括的なガイドラインを提供しています。

**ガイドライン内容：**
- 撮影時の安全確保
- ジムでのマナー
- 外岩での注意事項
- 機材管理方法

## プラン

### 無料プラン
- ✓ 動画の視聴無制限
- ✓ いいね機能（1回まで）
- ✓ コメント機能
- ✓ お気に入り登録

### プレミアムプラン
**月額 $20 / 年額 $192**（20% OFF）

- ✓ **動画投稿（1日30件まで）**
- ✓ **無制限いいね**
- ✓ お気に入り無制限
- ✓ 広告非表示
- ✓ 全プラットフォーム対応
- ✓ 優先サポート
- ✓ コンテスト参加権

## コミュニティガイドライン

### 尊重と配慮

すべてのユーザーが安心して利用できるよう、以下の点を守ってください：

1. **他者を尊重する**
   - 攻撃的なコメントは禁止
   - 建設的なフィードバックを心がける
   - 多様性を尊重する

2. **安全第一**
   - 危険な行為を助長しない
   - 安全装備の使用を推奨
   - 初心者への適切なアドバイス

3. **著作権を守る**
   - 自分が権利を持つ動画のみ投稿
   - 他者の動画を無断転載しない
   - 音楽の著作権に配慮

4. **正確な情報**
   - グレードやルート情報は正確に
   - 誤情報の拡散を避ける
   - 訂正があれば速やかに更新

## 運営チーム

ClimbHeroは、クライミングを愛する開発者とクライマーのチームによって運営されています。

**チームの経験：**
- 30年以上のクライミング経験
- グッぼる ボルダリングCafe & Shop 運営
- 全国14ジムの立ち上げ支援
- プロギングジャパン副会長

## パートナーシップ

### ジムパートナーシップ

クライミングジムの皆様との提携を募集しています。

**提携メリット：**
- 無料でジム情報を掲載
- 撮影許可ジムとして認定
- 会員向けプロモーション
- 動画撮影による集客効果

**お問い合わせ：** partnership@climbhero.info

### スポンサーシップ

コンテストやイベントのスポンサーを募集しています。

**お問い合わせ：** sponsor@climbhero.info

## テクノロジー

ClimbHeroは、最新のテクノロジーで構築されています：

- **Cloudflare Pages**：グローバルエッジネットワーク
- **Cloudflare D1**：分散型SQLiteデータベース
- **AI分類システム**：動画ジャンル自動判定
- **多言語対応**：日本語・英語（今後拡大予定）

## 統計情報

- **登録ユーザー数**：成長中
- **動画投稿数**：毎日増加中
- **提携ジム数**：全国200箇所以上
- **対応プラットフォーム**：4種類（YouTube、Vimeo、Instagram、TikTok）

## お問い合わせ

ご質問、ご提案、パートナーシップのお問い合わせは、お問い合わせページよりご連絡ください。

**サポート時間：** 平日 10:00-18:00

**監修：**  
クライミングルプロジェクト  
〒224-0054 神奈川県横浜市都筑区佐江戸町417

**製作者：**  
グッぼる ボルダリングカフェ  
〒522-0043 滋賀県彦根市小泉町34-8

---

**Let's climb together! 🧗‍♀️🧗‍♂️**
    `
  })
})

// ============ CSV Export/Import API ============

// Export Users as CSV
app.get('/api/admin/users/export', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const users = await env.DB.prepare(`
      SELECT id, email, username, membership_type, is_admin, notes, created_at, last_login
      FROM users
      ORDER BY id ASC
    `).all()

    // Generate CSV
    const headers = ['ID', 'Email', 'Username', 'Membership', 'Is Admin', 'Notes', 'Created At', 'Last Login']
    const rows = users.results.map((user: any) => [
      user.id,
      user.email,
      user.username,
      user.membership_type,
      user.is_admin ? 'Yes' : 'No',
      user.notes || '',
      user.created_at,
      user.last_login || ''
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="climbhero-users-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Import Users from CSV
app.post('/api/admin/users/import', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const body = await c.req.json()
    const { csvData } = body

    if (!csvData) {
      return c.json({ error: 'CSV data is required' }, 400)
    }

    const lines = csvData.trim().split('\n')
    if (lines.length < 2) {
      return c.json({ error: 'CSV must have headers and at least one data row' }, 400)
    }

    const headers = lines[0].split(',').map((h: string) => h.replace(/"/g, '').trim())
    const imported = []
    const errors = []

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map((v: string) => v.replace(/^"|"$/g, '').replace(/""/g, '"').trim())
        
        if (!values || values.length < 3) continue

        const email = values[1]
        const username = values[2]
        const membership = values[3] || 'free'
        const notes = values[5] || ''

        // Check if user exists
        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
        
        if (!existing) {
          // Create new user with default password
          const defaultPassword = hashPassword('ClimbHero2024!')
          const result = await env.DB.prepare(`
            INSERT INTO users (email, username, password_hash, membership_type, notes)
            VALUES (?, ?, ?, ?, ?)
          `).bind(email, username, defaultPassword, membership, notes).run()
          
          imported.push({ email, username, id: result.meta.last_row_id })
        } else {
          errors.push({ line: i + 1, email, reason: 'User already exists' })
        }
      } catch (err: any) {
        errors.push({ line: i + 1, reason: err.message })
      }
    }

    return c.json({
      success: true,
      imported: imported.length,
      errors: errors.length,
      details: { imported, errors }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Blog Tags Admin API ============

// Create new tag
// ============ Admin Blog Genre Management ============

// Create blog genre (admin)
app.post('/api/admin/blog/genres', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { name, name_en, name_zh, name_ko, icon, color, display_order } = await c.req.json()
    
    if (!name) {
      return c.json({ error: 'Genre name is required' }, 400)
    }

    const result = await env.DB.prepare(`
      INSERT INTO blog_genres (name, name_en, name_zh, name_ko, icon, color, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name,
      name_en || null,
      name_zh || null,
      name_ko || null,
      icon || 'fas fa-folder',
      color || 'purple',
      display_order || 0
    ).run()
    
    return c.json({
      success: true,
      genre: { id: result.meta.last_row_id, name, name_en, name_zh, name_ko, icon, color, display_order }
    }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update blog genre (admin)
app.put('/api/admin/blog/genres/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const genreId = parseInt(c.req.param('id'))
    const { name, name_en, name_zh, name_ko, icon, color, display_order, is_active } = await c.req.json()
    
    await env.DB.prepare(`
      UPDATE blog_genres 
      SET name = ?, name_en = ?, name_zh = ?, name_ko = ?, icon = ?, color = ?, 
          display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name,
      name_en || null,
      name_zh || null,
      name_ko || null,
      icon,
      color,
      display_order,
      is_active !== undefined ? is_active : 1,
      genreId
    ).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete blog genre (admin)
app.delete('/api/admin/blog/genres/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const genreId = parseInt(c.req.param('id'))
    await env.DB.prepare('DELETE FROM blog_genres WHERE id = ?').bind(genreId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Admin Blog Tag Management ============

app.post('/api/admin/blog/tags', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { name } = await c.req.json()
    
    if (!name) {
      return c.json({ error: 'Tag name is required' }, 400)
    }

    const result = await env.DB.prepare('INSERT INTO blog_tags (name) VALUES (?)').bind(name).run()
    
    return c.json({
      success: true,
      tag: { id: result.meta.last_row_id, name }
    }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete tag
app.delete('/api/admin/blog/tags/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const tagId = parseInt(c.req.param('id'))
    await env.DB.prepare('DELETE FROM blog_tags WHERE id = ?').bind(tagId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get blog posts with tags (admin list view)
app.get('/api/admin/blog/posts', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const posts = await env.DB.prepare(`
      SELECT 
        p.*,
        GROUP_CONCAT(t.name, ',') as tags
      FROM blog_posts p
      LEFT JOIN blog_post_tags pt ON p.id = pt.blog_post_id
      LEFT JOIN blog_tags t ON pt.tag_id = t.id
      GROUP BY p.id
      ORDER BY p.published_date DESC
    `).all()

    return c.json(posts.results.map((post: any) => ({
      ...post,
      tags: post.tags ? post.tags.split(',') : []
    })))
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Add tags to blog post
app.post('/api/admin/blog/posts/:id/tags', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const postId = parseInt(c.req.param('id'))
    const { tagIds } = await c.req.json()

    // Delete existing tags
    await env.DB.prepare('DELETE FROM blog_post_tags WHERE blog_post_id = ?').bind(postId).run()

    // Insert new tags
    for (const tagId of tagIds) {
      await env.DB.prepare('INSERT INTO blog_post_tags (blog_post_id, tag_id) VALUES (?, ?)').bind(postId, tagId).run()
    }

    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update existing blog post endpoint to include tags
app.put('/api/admin/blog/posts/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const postId = parseInt(c.req.param('id'))
    const { title, title_en, title_zh, title_ko, content, content_en, content_zh, content_ko, image_url, published_date, slug, tagIds } = await c.req.json()

    // Update blog post with 4-language support
    await env.DB.prepare(`
      UPDATE blog_posts 
      SET title = ?, title_en = ?, title_zh = ?, title_ko = ?, 
          content = ?, content_en = ?, content_zh = ?, content_ko = ?,
          image_url = ?, published_date = ?, slug = ?
      WHERE id = ?
    `).bind(title, title_en || null, title_zh || null, title_ko || null, 
            content, content_en || null, content_zh || null, content_ko || null,
            image_url, published_date, slug || null, postId).run()

    // Update tags if provided
    if (tagIds) {
      await env.DB.prepare('DELETE FROM blog_post_tags WHERE blog_post_id = ?').bind(postId).run()
      for (const tagId of tagIds) {
        await env.DB.prepare('INSERT INTO blog_post_tags (blog_post_id, tag_id) VALUES (?, ?)').bind(postId, tagId).run()
      }
    }

    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Create blog post with tags
app.post('/api/admin/blog/posts', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { title, title_en, title_zh, title_ko, content, content_en, content_zh, content_ko, image_url, published_date, slug, tagIds } = await c.req.json()

    // Generate slug if not provided
    const finalSlug = slug || title_en?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `post-${Date.now()}`

    // Create blog post with 4-language support
    const result = await env.DB.prepare(`
      INSERT INTO blog_posts (title, title_en, title_zh, title_ko, content, content_en, content_zh, content_ko, image_url, published_date, slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(title, title_en || null, title_zh || null, title_ko || null,
            content, content_en || null, content_zh || null, content_ko || null,
            image_url, published_date, finalSlug).run()

    const postId = result.meta.last_row_id

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await env.DB.prepare('INSERT INTO blog_post_tags (blog_post_id, tag_id) VALUES (?, ?)').bind(postId, tagId).run()
      }
    }

    return c.json({ success: true, id: postId }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Climber Testimonials API ============

// Get all active testimonials (public)
app.get('/api/testimonials', async (c) => {
  const { env } = c
  try {
    const testimonials = await env.DB.prepare(`
      SELECT * FROM climber_testimonials 
      WHERE is_active = 1 
      ORDER BY display_order ASC, created_at DESC
    `).all()
    
    return c.json({ testimonials: testimonials.results })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get all testimonials (admin only)
app.get('/api/admin/testimonials', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const testimonials = await env.DB.prepare(`
      SELECT * FROM climber_testimonials 
      ORDER BY display_order ASC, created_at DESC
    `).all()
    
    return c.json({ testimonials: testimonials.results })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Create testimonial (admin only)
app.post('/api/admin/testimonials', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { 
      climber_name_ja, climber_name_en, climber_name_zh, climber_name_ko,
      title_ja, title_en, title_zh, title_ko,
      comment_ja, comment_en, comment_zh, comment_ko,
      avatar_url, instagram_url, youtube_url, website_url,
      display_order, is_active 
    } = await c.req.json()

    if (!climber_name_ja || !climber_name_en || !title_ja || !title_en || !comment_ja || !comment_en) {
      return c.json({ error: 'Required fields missing (ja and en required)' }, 400)
    }

    const result = await env.DB.prepare(`
      INSERT INTO climber_testimonials (
        climber_name_ja, climber_name_en, climber_name_zh, climber_name_ko,
        title_ja, title_en, title_zh, title_ko,
        comment_ja, comment_en, comment_zh, comment_ko,
        avatar_url, instagram_url, youtube_url, website_url,
        display_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      climber_name_ja, climber_name_en, climber_name_zh || null, climber_name_ko || null,
      title_ja, title_en, title_zh || null, title_ko || null,
      comment_ja, comment_en, comment_zh || null, comment_ko || null,
      avatar_url || null, instagram_url || null, youtube_url || null, website_url || null,
      display_order || 0, is_active !== undefined ? is_active : 1
    ).run()

    return c.json({ success: true, id: result.meta.last_row_id }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update testimonial (admin only)
app.put('/api/admin/testimonials/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const testimonialId = parseInt(c.req.param('id'))
    const { 
      climber_name_ja, climber_name_en, climber_name_zh, climber_name_ko,
      title_ja, title_en, title_zh, title_ko,
      comment_ja, comment_en, comment_zh, comment_ko,
      avatar_url, instagram_url, youtube_url, website_url,
      display_order, is_active 
    } = await c.req.json()

    await env.DB.prepare(`
      UPDATE climber_testimonials SET
        climber_name_ja = ?, climber_name_en = ?, climber_name_zh = ?, climber_name_ko = ?,
        title_ja = ?, title_en = ?, title_zh = ?, title_ko = ?,
        comment_ja = ?, comment_en = ?, comment_zh = ?, comment_ko = ?,
        avatar_url = ?, instagram_url = ?, youtube_url = ?, website_url = ?,
        display_order = ?, is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      climber_name_ja, climber_name_en, climber_name_zh || null, climber_name_ko || null,
      title_ja, title_en, title_zh || null, title_ko || null,
      comment_ja, comment_en, comment_zh || null, comment_ko || null,
      avatar_url || null, instagram_url || null, youtube_url || null, website_url || null,
      display_order || 0, is_active !== undefined ? is_active : 1,
      testimonialId
    ).run()

    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete testimonial (admin only)
app.delete('/api/admin/testimonials/:id', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser || !currentUser.is_admin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const testimonialId = parseInt(c.req.param('id'))
    await env.DB.prepare('DELETE FROM climber_testimonials WHERE id = ?').bind(testimonialId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// AI-powered URL analysis endpoint
app.post('/api/videos/analyze-url', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  try {
    const body = await c.req.json()
    const { url, openai_api_key } = body
    
    if (!url) {
      return c.json({ error: 'URL is required' }, 400)
    }
    
    if (!openai_api_key) {
      return c.json({ error: 'OpenAI API key is required. Please set it in Settings.' }, 400)
    }
    
    // Detect platform from URL
    let platform = 'other'
    let videoId = ''
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      platform = 'youtube'
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
      videoId = match ? match[1] : ''
    } else if (url.includes('instagram.com')) {
      platform = 'instagram'
      const match = url.match(/instagram\.com\/(?:p|reel)\/([^\/]+)/)
      videoId = match ? match[1] : ''
    } else if (url.includes('tiktok.com')) {
      platform = 'tiktok'
      const match = url.match(/tiktok\.com\/.*\/video\/(\d+)/)
      videoId = match ? match[1] : ''
    } else if (url.includes('vimeo.com')) {
      platform = 'vimeo'
      const match = url.match(/vimeo\.com\/(\d+)/)
      videoId = match ? match[1] : ''
    }
    
    // Call OpenAI to extract metadata
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openai_api_key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts metadata from video URLs. Return a JSON object with: title (creative title based on URL), description (brief description), grade (climbing grade if applicable), location (if mentioned in URL), tags (comma-separated keywords).'
          },
          {
            role: 'user',
            content: `Extract metadata from this video URL: ${url}`
          }
        ],
        response_format: { type: 'json_object' }
      })
    })
    
    if (!openaiResponse.ok) {
      throw new Error('OpenAI API request failed')
    }
    
    const openaiData = await openaiResponse.json()
    const metadata = JSON.parse(openaiData.choices[0].message.content)
    
    // Generate thumbnail URL based on platform
    let thumbnailUrl = ''
    if (platform === 'youtube' && videoId) {
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    } else if (platform === 'vimeo' && videoId) {
      thumbnailUrl = `https://vumbnail.com/${videoId}.jpg`
    }
    
    return c.json({
      success: true,
      data: {
        platform,
        platform_video_id: videoId,
        video_url: url,
        thumbnail_url: thumbnailUrl,
        title: metadata.title || 'Untitled Video',
        description: metadata.description || '',
        grade: metadata.grade || '',
        location: metadata.location || '',
        tags: metadata.tags || ''
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// User settings API
app.get('/api/settings', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  try {
    const settings = await env.DB.prepare(
      'SELECT * FROM user_settings WHERE user_id = ?'
    ).bind(currentUser.id).first()
    
    if (!settings) {
      // Create default settings
      await env.DB.prepare(
        'INSERT INTO user_settings (user_id) VALUES (?)'
      ).bind(currentUser.id).run()
      
      return c.json({ settings: { user_id: currentUser.id } })
    }
    
    return c.json({ settings })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.put('/api/settings', async (c) => {
  const { env } = c
  const sessionToken = getCookie(c, 'session_token')
  const currentUser = await getUserFromSession(env.DB, sessionToken || '')
  
  if (!currentUser) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  try {
    const body = await c.req.json()
    const { 
      youtube_api_key, 
      openai_api_key,
      vimeo_access_token,
      instagram_access_token,
      tiktok_access_token,
      notify_likes,
      notify_comments,
      profile_public,
      allow_comments
    } = body
    
    // Check if settings exist
    const existing = await env.DB.prepare(
      'SELECT * FROM user_settings WHERE user_id = ?'
    ).bind(currentUser.id).first()
    
    if (!existing) {
      // Insert new settings
      await env.DB.prepare(`
        INSERT INTO user_settings 
        (user_id, youtube_api_key, vimeo_access_token, instagram_access_token, tiktok_access_token, 
         notify_likes, notify_comments, profile_public, allow_comments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        currentUser.id,
        youtube_api_key || '',
        vimeo_access_token || '',
        instagram_access_token || '',
        tiktok_access_token || '',
        notify_likes !== undefined ? notify_likes : 1,
        notify_comments !== undefined ? notify_comments : 1,
        profile_public !== undefined ? profile_public : 1,
        allow_comments !== undefined ? allow_comments : 1
      ).run()
    } else {
      // Update existing settings
      await env.DB.prepare(`
        UPDATE user_settings 
        SET youtube_api_key = ?, vimeo_access_token = ?, instagram_access_token = ?, tiktok_access_token = ?,
            notify_likes = ?, notify_comments = ?, profile_public = ?, allow_comments = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).bind(
        youtube_api_key !== undefined ? youtube_api_key : existing.youtube_api_key,
        vimeo_access_token !== undefined ? vimeo_access_token : existing.vimeo_access_token,
        instagram_access_token !== undefined ? instagram_access_token : existing.instagram_access_token,
        tiktok_access_token !== undefined ? tiktok_access_token : existing.tiktok_access_token,
        notify_likes !== undefined ? notify_likes : existing.notify_likes,
        notify_comments !== undefined ? notify_comments : existing.notify_comments,
        profile_public !== undefined ? profile_public : existing.profile_public,
        allow_comments !== undefined ? allow_comments : existing.allow_comments,
        currentUser.id
      ).run()
    }
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

export default app
