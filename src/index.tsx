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
        membership_type: user.membership_type
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
  
  const user = await getUserFromSession(env.DB, sessionToken || '')
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  return c.json({
    id: (user as any).id,
    email: (user as any).email,
    username: (user as any).username,
    membership_type: (user as any).membership_type,
    is_admin: (user as any).is_admin || 0
  })
})

// ============ Video API ============

// Get all videos with filters
app.get('/api/videos', async (c) => {
  const { env } = c
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '12')
  const category = c.req.query('category')
  const search = c.req.query('search')
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

    return c.json({
      videos,
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

// Get single video
app.get('/api/videos/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')

  try {
    const video = await env.DB.prepare('SELECT * FROM videos WHERE id = ?').bind(id).first()
    if (!video) {
      return c.json({ error: 'Video not found' }, 404)
    }
    
    // Increment views
    await env.DB.prepare('UPDATE videos SET views = views + 1 WHERE id = ?').bind(id).run()
    
    return c.json(video)
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

    // Free users: Check like limit (3 likes)
    if (user.membership_type === 'free') {
      const likeCount = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM user_likes WHERE user_id = ?'
      ).bind(userId).first() as any
      
      if (likeCount && likeCount.count >= 3) {
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
      remaining_likes: user.membership_type === 'free' ? (3 - userLikeCount.count) : 'unlimited'
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
      remaining_likes: user.membership_type === 'free' ? Math.max(0, 3 - userLikeCount.count) : 'unlimited'
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

// ============ Blog API ============

// Get all blog posts
app.get('/api/blog', async (c) => {
  const { env } = c

  try {
    const { results: posts } = await env.DB.prepare('SELECT * FROM blog_posts ORDER BY published_date DESC').all()
    return c.json(posts)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get single blog post
app.get('/api/blog/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')

  try {
    const post = await env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(id).first()
    if (!post) {
      return c.json({ error: 'Blog post not found' }, 404)
    }
    return c.json(post)
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
  const { title, content, image_url, published_date } = body

  if (!title || !content) {
    return c.json({ error: 'Title and content are required' }, 400)
  }

  try {
    const result = await env.DB.prepare(
      'INSERT INTO blog_posts (title, content, image_url, published_date) VALUES (?, ?, ?, ?)'
    ).bind(title, content, image_url || '', published_date || new Date().toISOString().split('T')[0]).run()

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
  const { title, content, image_url } = body

  try {
    await env.DB.prepare(
      'UPDATE blog_posts SET title = ?, content = ?, image_url = ? WHERE id = ?'
    ).bind(title, content, image_url || '', id).run()

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

app.get('/', (c) => {
  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ClimbHero - クライミング動画共有プラットフォーム</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div id="root"></div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/i18n.js"></script>
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

export default app
