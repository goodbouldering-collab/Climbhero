import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))

// ============ API Routes ============

// Get all videos
app.get('/api/videos', async (c) => {
  const { env } = c
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '12')
  const category = c.req.query('category')
  const offset = (page - 1) * limit

  try {
    let query = 'SELECT * FROM videos'
    let countQuery = 'SELECT COUNT(*) as total FROM videos'
    const params: any[] = []

    if (category && category !== 'all') {
      query += ' WHERE category = ?'
      countQuery += ' WHERE category = ?'
      params.push(category)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const { results: videos } = await env.DB.prepare(query).bind(...params).all()
    const { results: countResult } = await env.DB.prepare(countQuery).bind(...(category && category !== 'all' ? [category] : [])).all()
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
    return c.json(video)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Create video
app.post('/api/videos', async (c) => {
  const { env } = c
  const body = await c.req.json()
  const { title, description, url, thumbnail_url, duration, channel_name, category } = body

  if (!title || !url) {
    return c.json({ error: 'Title and URL are required' }, 400)
  }

  try {
    const result = await env.DB.prepare(
      'INSERT INTO videos (title, description, url, thumbnail_url, duration, channel_name, category) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(title, description || '', url, thumbnail_url || '', duration || '', channel_name || '', category || 'bouldering').run()

    return c.json({ id: result.meta.last_row_id, message: 'Video created successfully' }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Like video
app.post('/api/videos/:id/like', async (c) => {
  const { env } = c
  const videoId = c.req.param('id')
  const body = await c.req.json()
  const { user_id } = body

  if (!user_id) {
    return c.json({ error: 'User ID is required' }, 400)
  }

  try {
    // Check if already liked
    const existing = await env.DB.prepare('SELECT * FROM likes WHERE user_id = ? AND video_id = ?').bind(user_id, videoId).first()
    
    if (existing) {
      // Unlike
      await env.DB.prepare('DELETE FROM likes WHERE user_id = ? AND video_id = ?').bind(user_id, videoId).run()
      await env.DB.prepare('UPDATE videos SET likes = likes - 1 WHERE id = ?').bind(videoId).run()
      return c.json({ message: 'Unliked successfully', liked: false })
    } else {
      // Like
      await env.DB.prepare('INSERT INTO likes (user_id, video_id) VALUES (?, ?)').bind(user_id, videoId).run()
      await env.DB.prepare('UPDATE videos SET likes = likes + 1 WHERE id = ?').bind(videoId).run()
      return c.json({ message: 'Liked successfully', liked: true })
    }
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Favorite video
app.post('/api/videos/:id/favorite', async (c) => {
  const { env } = c
  const videoId = c.req.param('id')
  const body = await c.req.json()
  const { user_id } = body

  if (!user_id) {
    return c.json({ error: 'User ID is required' }, 400)
  }

  try {
    const existing = await env.DB.prepare('SELECT * FROM favorites WHERE user_id = ? AND video_id = ?').bind(user_id, videoId).first()
    
    if (existing) {
      await env.DB.prepare('DELETE FROM favorites WHERE user_id = ? AND video_id = ?').bind(user_id, videoId).run()
      return c.json({ message: 'Removed from favorites', favorited: false })
    } else {
      await env.DB.prepare('INSERT INTO favorites (user_id, video_id) VALUES (?, ?)').bind(user_id, videoId).run()
      return c.json({ message: 'Added to favorites', favorited: true })
    }
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get blog posts
app.get('/api/blog', async (c) => {
  const { env } = c

  try {
    const { results: posts } = await env.DB.prepare('SELECT * FROM blog_posts ORDER BY published_date DESC LIMIT 10').all()
    return c.json(posts)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get user stats
app.get('/api/users/:id/stats', async (c) => {
  const { env } = c
  const userId = c.req.param('id')

  try {
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    return c.json(user)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============ Frontend Route ============

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ClimbHero - クライミング動画共有プラットフォーム</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .hero-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .video-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .video-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          }
          .category-badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-weight: 600;
          }
          .duration-badge {
            position: absolute;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: bold;
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-md sticky top-0 z-50">
            <div class="container mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-mountain text-purple-600 text-3xl"></i>
                        <h1 class="text-2xl font-bold text-gray-800">ClimbHero</h1>
                    </div>
                    <nav class="hidden md:flex space-x-6">
                        <a href="#" class="text-gray-700 hover:text-purple-600 transition">動画一覧</a>
                        <a href="#upload" class="text-gray-700 hover:text-purple-600 transition">動画投稿</a>
                        <a href="#plans" class="text-gray-700 hover:text-purple-600 transition">会員プラン</a>
                        <a href="#blog" class="text-gray-700 hover:text-purple-600 transition">ブログ</a>
                    </nav>
                    <button class="md:hidden text-gray-700">
                        <i class="fas fa-bars text-2xl"></i>
                    </button>
                </div>
            </div>
        </header>

        <!-- Hero Section -->
        <section class="hero-gradient text-white py-20">
            <div class="container mx-auto px-4 text-center">
                <h2 class="text-4xl md:text-5xl font-bold mb-4">Unleash Your Climbing Spirit.</h2>
                <p class="text-xl md:text-2xl mb-8">クライマーが求める本物の映像を共有しよう！</p>
                <button class="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition">
                    今すぐ始める
                </button>
            </div>
        </section>

        <!-- Category Filter -->
        <section class="container mx-auto px-4 py-8">
            <div class="flex flex-wrap gap-3 justify-center">
                <button onclick="filterVideos('all')" class="category-btn px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition">
                    すべて
                </button>
                <button onclick="filterVideos('bouldering')" class="category-btn px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition">
                    ボルダリング
                </button>
                <button onclick="filterVideos('competition')" class="category-btn px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition">
                    競技
                </button>
                <button onclick="filterVideos('tutorial')" class="category-btn px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition">
                    チュートリアル
                </button>
                <button onclick="filterVideos('gym_review')" class="category-btn px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition">
                    ジムレビュー
                </button>
            </div>
        </section>

        <!-- Video Grid -->
        <section class="container mx-auto px-4 py-8">
            <h3 class="text-3xl font-bold text-gray-800 mb-6">新着動画</h3>
            <div id="video-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <!-- Videos will be loaded here -->
            </div>
            <div class="text-center mt-8">
                <button id="load-more" class="px-8 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition">
                    もっと見る
                </button>
            </div>
        </section>

        <!-- Upload Section -->
        <section id="upload" class="bg-white py-16">
            <div class="container mx-auto px-4 max-w-2xl">
                <h3 class="text-3xl font-bold text-gray-800 mb-4 text-center">動画URLを投稿</h3>
                <p class="text-gray-600 mb-8 text-center">URLを入力するだけで、AIが自動的にジャンルを判定。本物のクライミング動画のみを厳選して共有できます。</p>
                <div class="bg-gray-50 p-8 rounded-lg shadow-md">
                    <form id="upload-form" class="space-y-4">
                        <div>
                            <label class="block text-gray-700 font-bold mb-2">動画URL *</label>
                            <input type="url" id="video-url" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" placeholder="https://youtube.com/watch?v=...">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-bold mb-2">タイトル *</label>
                            <input type="text" id="video-title" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" placeholder="動画のタイトル">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-bold mb-2">説明</label>
                            <textarea id="video-description" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600" rows="3" placeholder="動画の説明（オプション）"></textarea>
                        </div>
                        <div>
                            <label class="block text-gray-700 font-bold mb-2">カテゴリー</label>
                            <select id="video-category" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                                <option value="bouldering">ボルダリング</option>
                                <option value="competition">競技</option>
                                <option value="tutorial">チュートリアル</option>
                                <option value="gym_review">ジムレビュー</option>
                            </select>
                        </div>
                        <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition">
                            <i class="fas fa-upload mr-2"></i>投稿する
                        </button>
                        <p class="text-sm text-gray-500 text-center">一般会員: 1日10件まで / 特別会員: 1日30件まで投稿可能</p>
                    </form>
                </div>
            </div>
        </section>

        <!-- Membership Plans -->
        <section id="plans" class="py-16">
            <div class="container mx-auto px-4">
                <h3 class="text-3xl font-bold text-gray-800 mb-12 text-center">会員プラン</h3>
                <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div class="bg-white p-8 rounded-lg shadow-md">
                        <h4 class="text-2xl font-bold text-gray-800 mb-4">非会員の方へ</h4>
                        <p class="text-gray-600 mb-6">現在、動画の閲覧のみ可能です。いいね機能、お気に入り登録、動画投稿には会員登録が必要です。</p>
                        <button class="w-full bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700 transition">
                            会員登録（無料）
                        </button>
                    </div>
                    <div class="bg-purple-600 text-white p-8 rounded-lg shadow-md">
                        <h4 class="text-2xl font-bold mb-2">会員プラン</h4>
                        <div class="text-4xl font-bold mb-2">$20<span class="text-lg">/月</span></div>
                        <p class="text-sm mb-6 opacity-90">年間契約で20%オフ: $192/年</p>
                        <ul class="space-y-3 mb-6">
                            <li class="flex items-center"><i class="fas fa-check mr-2"></i>1日10件までURL投稿可能</li>
                            <li class="flex items-center"><i class="fas fa-check mr-2"></i>いいね機能の利用</li>
                            <li class="flex items-center"><i class="fas fa-check mr-2"></i>お気に入り登録機能</li>
                            <li class="flex items-center"><i class="fas fa-check mr-2"></i>全プラットフォーム対応</li>
                            <li class="flex items-center"><i class="fas fa-check mr-2"></i>広告非表示</li>
                        </ul>
                        <button class="w-full bg-white text-purple-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                            会員プランを始める
                        </button>
                        <p class="text-xs mt-4 opacity-75 text-center">※ 会員登録後、すべての機能をご利用いただけます</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Blog Section -->
        <section id="blog" class="bg-white py-16">
            <div class="container mx-auto px-4">
                <h3 class="text-3xl font-bold text-gray-800 mb-8">最新ニュース</h3>
                <div id="blog-grid" class="grid md:grid-cols-3 gap-8">
                    <!-- Blog posts will be loaded here -->
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white py-12">
            <div class="container mx-auto px-4">
                <div class="grid md:grid-cols-3 gap-8">
                    <div>
                        <h4 class="text-xl font-bold mb-4">ClimbHero</h4>
                        <p class="text-gray-400">クライミング動画共有プラットフォーム</p>
                    </div>
                    <div>
                        <h4 class="text-xl font-bold mb-4">カスタマーサポート</h4>
                        <p class="text-gray-400">平日 10:00 - 18:00</p>
                    </div>
                    <div>
                        <h4 class="text-xl font-bold mb-4">所在地</h4>
                        <p class="text-gray-400">〒100-0001 東京都千代田区1-1-1</p>
                    </div>
                </div>
                <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 ClimbHero. All rights reserved.</p>
                </div>
            </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
