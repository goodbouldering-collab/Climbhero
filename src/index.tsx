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

// Get trending videos (注目の動画)
app.get('/api/videos/trending', async (c) => {
  const { env } = c
  const limit = parseInt(c.req.query('limit') || '10')
  
  try {
    // Query the trending_videos view
    const { results: trendingVideos } = await env.DB.prepare(`
      SELECT * FROM trending_videos LIMIT ?
    `).bind(limit).all()
    
    return c.json({
      videos: trendingVideos || [],
      count: trendingVideos?.length || 0
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get Instagram videos
app.get('/api/videos/instagram', async (c) => {
  const { env } = c
  const limit = parseInt(c.req.query('limit') || '10')
  
  try {
    const { results: instagramVideos } = await env.DB.prepare(`
      SELECT * FROM videos 
      WHERE media_source = 'instagram' 
      ORDER BY created_at DESC 
      LIMIT ?
    `).bind(limit).all()
    
    return c.json({
      videos: instagramVideos || [],
      count: instagramVideos?.length || 0
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
  const { title, content, image_url, published_date } = body

  try {
    await env.DB.prepare(
      'UPDATE blog_posts SET title = ?, content = ?, image_url = ?, published_date = ? WHERE id = ?'
    ).bind(title, content, image_url || '', published_date || new Date().toISOString().split('T')[0], id).run()

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
        <title>ClimbHero - クライミング動画共有プラットフォーム</title>
        
        <!-- Favicons -->
        <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon-16x16.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png">
        <link rel="manifest" href="/static/site.webmanifest">
        
        <!-- Meta Tags for SEO -->
        <meta name="description" content="ClimbHero - 世界中のクライミング動画を発見し、共有しよう。YouTube、Instagram、TikTok、Vimeoの動画を一括管理。リアルタイムランキング、多言語対応。">
        <meta name="keywords" content="クライミング,ボルダリング,動画,共有,プラットフォーム,YouTube,Instagram,TikTok,Vimeo,ランキング">
        <meta name="author" content="ClimbHero">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://climbhero.pages.dev/">
        <meta property="og:title" content="ClimbHero - クライミング動画共有プラットフォーム">
        <meta property="og:description" content="世界中のクライミング動画を発見し、共有しよう。YouTube、Instagram、TikTok、Vimeoの動画を一括管理。">
        <meta property="og:image" content="/android-chrome-512x512.png">
        
        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="https://climbhero.pages.dev/">
        <meta property="twitter:title" content="ClimbHero - クライミング動画共有プラットフォーム">
        <meta property="twitter:description" content="世界中のクライミング動画を発見し、共有しよう。YouTube、Instagram、TikTok、Vimeoの動画を一括管理。">
        <meta property="twitter:image" content="/android-chrome-512x512.png">
        
        <!-- Theme Color -->
        <meta name="theme-color" content="#7c3aed">
        
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div id="root"></div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/marked@11.0.0/marked.min.js"></script>
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

// ============ Announcements API ============

// Get all active announcements
app.get('/api/announcements', async (c) => {
  const { env } = c
  
  try {
    const announcements = await env.DB.prepare(`
      SELECT * FROM announcements 
      WHERE is_active = 1 
      ORDER BY priority DESC, created_at DESC
    `).all()
    
    return c.json(announcements.results || [])
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
  
  const { title, content, priority, is_active } = await c.req.json()
  
  if (!title || !content) {
    return c.json({ error: 'Title and content are required' }, 400)
  }
  
  try {
    const result = await env.DB.prepare(`
      INSERT INTO announcements (title, content, priority, is_active)
      VALUES (?, ?, ?, ?)
    `).bind(title, content, priority || 0, is_active !== undefined ? is_active : 1).run()
    
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
  const { title, content, priority, is_active } = await c.req.json()
  
  try {
    await env.DB.prepare(`
      UPDATE announcements 
      SET title = ?, content = ?, priority = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(title, content, priority || 0, is_active !== undefined ? is_active : 1, announcementId).run()
    
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
**住所：** 〒100-0001 東京都千代田区1-1-1

---

**Let's climb together! 🧗‍♀️🧗‍♂️**
    `
  })
})

export default app
