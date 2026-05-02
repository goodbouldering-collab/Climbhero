/**
 * Video crawler for ClimbHero
 * Fetches climbing videos from YouTube/Vimeo (and 3rd-party scraped TikTok/IG)
 * and runs AI analysis (Gemini) for translation, genre, grade, quality score.
 */

export interface CrawledVideo {
  platform: 'youtube' | 'vimeo' | 'tiktok' | 'instagram'
  external_id: string                  // platform-native id
  url: string
  title: string
  description: string
  thumbnail_url: string
  duration: string                     // ISO 8601 (PT1H2M3S) or seconds
  channel_name: string
  channel_id?: string
  views: number
  likes: number
  comments?: number
  posted_date?: string                 // ISO date
  language?: string
}

export interface CrawlResult {
  fetched: number
  videos: CrawledVideo[]
  error?: string
}

// =====================================================================
// YouTube Data API v3
// =====================================================================

interface YouTubeSearchItem {
  id: { videoId: string }
  snippet: {
    title: string
    description: string
    channelTitle: string
    channelId: string
    publishedAt: string
    thumbnails: { high?: { url: string }; medium?: { url: string } }
  }
}

interface YouTubeVideoItem {
  id: string
  snippet: {
    title: string
    description: string
    channelTitle: string
    channelId: string
    publishedAt: string
    defaultAudioLanguage?: string
    defaultLanguage?: string
    thumbnails: { maxres?: { url: string }; high?: { url: string }; medium?: { url: string } }
  }
  contentDetails: { duration: string }
  statistics: { viewCount?: string; likeCount?: string; commentCount?: string }
}

export async function crawlYouTube(
  apiKey: string,
  query: string,
  options: { maxResults?: number; region?: string; language?: string; minViews?: number } = {}
): Promise<CrawlResult> {
  const { maxResults = 25, region, language, minViews = 0 } = options

  if (!apiKey) return { fetched: 0, videos: [], error: 'YouTube API key not configured' }

  try {
    // Step 1: search.list to get video IDs
    const searchParams = new URLSearchParams({
      part: 'id',
      q: query,
      type: 'video',
      maxResults: String(Math.min(maxResults, 50)),
      order: 'viewCount',
      videoEmbeddable: 'true',
      key: apiKey,
    })
    if (region) searchParams.set('regionCode', region)
    if (language) searchParams.set('relevanceLanguage', language)

    const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams}`)
    if (!searchRes.ok) {
      const text = await searchRes.text()
      return { fetched: 0, videos: [], error: `YouTube search failed: ${searchRes.status} ${text.slice(0, 200)}` }
    }
    const searchData = await searchRes.json() as { items?: YouTubeSearchItem[] }
    const ids = (searchData.items || []).map(i => i.id.videoId).filter(Boolean)
    if (ids.length === 0) return { fetched: 0, videos: [] }

    // Step 2: videos.list to get statistics + duration
    const videosParams = new URLSearchParams({
      part: 'snippet,contentDetails,statistics',
      id: ids.join(','),
      key: apiKey,
    })
    const videosRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?${videosParams}`)
    if (!videosRes.ok) {
      const text = await videosRes.text()
      return { fetched: 0, videos: [], error: `YouTube videos failed: ${videosRes.status} ${text.slice(0, 200)}` }
    }
    const videosData = await videosRes.json() as { items?: YouTubeVideoItem[] }
    const items = videosData.items || []

    const videos: CrawledVideo[] = items
      .map((item): CrawledVideo => ({
        platform: 'youtube',
        external_id: item.id,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        title: item.snippet.title,
        description: item.snippet.description || '',
        thumbnail_url:
          item.snippet.thumbnails.maxres?.url ||
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`,
        duration: parseYouTubeDuration(item.contentDetails.duration),
        channel_name: item.snippet.channelTitle,
        channel_id: item.snippet.channelId,
        views: parseInt(item.statistics.viewCount || '0', 10),
        likes: parseInt(item.statistics.likeCount || '0', 10),
        comments: parseInt(item.statistics.commentCount || '0', 10),
        posted_date: item.snippet.publishedAt,
        language: item.snippet.defaultAudioLanguage || item.snippet.defaultLanguage,
      }))
      .filter(v => v.views >= minViews)

    return { fetched: videos.length, videos }
  } catch (error: any) {
    return { fetched: 0, videos: [], error: `YouTube crawl exception: ${error.message}` }
  }
}

function parseYouTubeDuration(iso: string): string {
  // PT1H2M3S -> "1:02:03", PT3M5S -> "3:05"
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '')
  if (!m) return '0:00'
  const h = parseInt(m[1] || '0', 10)
  const min = parseInt(m[2] || '0', 10)
  const s = parseInt(m[3] || '0', 10)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`
}

// =====================================================================
// Vimeo API
// =====================================================================

interface VimeoVideoItem {
  uri: string                          // /videos/123456
  name: string
  description: string | null
  duration: number                     // seconds
  link: string
  pictures: { sizes: { width: number; link: string }[] }
  user: { name: string; uri: string }
  created_time: string
  stats: { plays?: number }
  metadata?: { connections?: { likes?: { total?: number }; comments?: { total?: number } } }
}

export async function crawlVimeo(
  accessToken: string,
  query: string,
  options: { maxResults?: number; minViews?: number } = {}
): Promise<CrawlResult> {
  const { maxResults = 25, minViews = 0 } = options
  if (!accessToken) return { fetched: 0, videos: [], error: 'Vimeo access token not configured' }

  try {
    const params = new URLSearchParams({
      query,
      per_page: String(Math.min(maxResults, 50)),
      sort: 'plays',
      direction: 'desc',
      fields: 'uri,name,description,duration,link,pictures.sizes,user.name,user.uri,created_time,stats.plays,metadata.connections.likes.total,metadata.connections.comments.total',
    })

    const res = await fetch(`https://api.vimeo.com/videos?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
      },
    })

    if (!res.ok) {
      const text = await res.text()
      return { fetched: 0, videos: [], error: `Vimeo failed: ${res.status} ${text.slice(0, 200)}` }
    }

    const data = await res.json() as { data?: VimeoVideoItem[] }
    const items = data.data || []

    const videos: CrawledVideo[] = items
      .map((item): CrawledVideo => {
        const id = item.uri.split('/').pop() || ''
        // pick largest thumbnail
        const sizes = item.pictures?.sizes || []
        const largest = sizes.reduce((acc, s) => (s.width > (acc?.width || 0) ? s : acc), sizes[0])
        return {
          platform: 'vimeo',
          external_id: id,
          url: item.link,
          title: item.name,
          description: item.description || '',
          thumbnail_url: largest?.link || '',
          duration: secondsToDuration(item.duration),
          channel_name: item.user.name,
          channel_id: item.user.uri.split('/').pop(),
          views: item.stats?.plays || 0,
          likes: item.metadata?.connections?.likes?.total || 0,
          comments: item.metadata?.connections?.comments?.total || 0,
          posted_date: item.created_time,
        }
      })
      .filter(v => v.views >= minViews)

    return { fetched: videos.length, videos }
  } catch (error: any) {
    return { fetched: 0, videos: [], error: `Vimeo crawl exception: ${error.message}` }
  }
}

function secondsToDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

// =====================================================================
// AI Analysis (Gemini)
// =====================================================================

export interface AIAnalysis {
  title_ja: string
  title_en: string
  title_zh: string
  title_ko: string
  description_ja: string
  description_en: string
  description_zh: string
  description_ko: string
  genre: string                        // bouldering / lead / speed / alpine / training / news / other
  grade: string | null                 // V10 / 5.14a / 8c+ / null
  quality_score: number                // 0-100
  summary_ja: string                   // short summary for SEO/LLMO
  summary_en: string
  summary_zh: string
  summary_ko: string
}

export async function analyzeVideoWithAI(
  video: CrawledVideo,
  geminiApiKey: string
): Promise<AIAnalysis | null> {
  if (!geminiApiKey) return null

  const prompt = `You are an expert climbing content analyst with 30+ years of experience covering bouldering, lead, speed, and alpine climbing worldwide.

Analyze this climbing video and return a strict JSON response.

VIDEO:
- Platform: ${video.platform}
- Title: ${video.title}
- Channel: ${video.channel_name}
- Description: ${(video.description || '').slice(0, 1500)}
- Views: ${video.views}
- Likes: ${video.likes}
- Duration: ${video.duration}
- Posted: ${video.posted_date || 'unknown'}

TASK: Return ONLY a single valid JSON object with EXACTLY these keys:
{
  "title_ja": "Japanese title (translate or keep if already JA, max 80 chars)",
  "title_en": "English title (translate or keep, max 80 chars)",
  "title_zh": "Simplified Chinese title (max 60 chars)",
  "title_ko": "Korean title (max 60 chars)",
  "description_ja": "Japanese description (1-3 sentences)",
  "description_en": "English description (1-3 sentences)",
  "description_zh": "Chinese description (1-3 sentences)",
  "description_ko": "Korean description (1-3 sentences)",
  "genre": "one of: bouldering | lead | speed | alpine | training | competition | news | other",
  "grade": "climbing grade if mentioned (V0-V17, 5.6-5.15d, 4-9c+) or null",
  "quality_score": 0-100 integer combining production, climber notability, content uniqueness, and likely global appeal,
  "summary_ja": "1-sentence SEO summary in Japanese",
  "summary_en": "1-sentence SEO summary in English",
  "summary_zh": "1-sentence SEO summary in Chinese",
  "summary_ko": "1-sentence SEO summary in Korean"
}

RULES:
- Keep climbing grades unchanged across languages (V10, 5.14a, 8c+)
- If a field cannot be determined, use a sensible default ("other" for genre, null for grade, 50 for quality_score)
- Return ONLY the JSON object, no prose, no code fences`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
        }),
      }
    )

    if (!res.ok) return null
    const data = await res.json() as any
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null

    const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '')
    const parsed = JSON.parse(cleaned) as AIAnalysis

    // Sanity defaults
    parsed.quality_score = Math.max(0, Math.min(100, Math.round(parsed.quality_score ?? 50)))
    if (!parsed.genre) parsed.genre = 'other'
    return parsed
  } catch (error) {
    console.error('AI analysis failed:', error)
    return null
  }
}

// =====================================================================
// Cloudflare Workers AI fallback (no external API key required)
// =====================================================================

/**
 * Translate text using Workers AI (m2m100). Returns null on failure.
 * Use as fallback when Gemini API key is not configured.
 */
export async function translateWithWorkersAI(
  ai: any,
  text: string,
  targetLang: 'ja' | 'en' | 'zh' | 'ko'
): Promise<string | null> {
  if (!ai || !text) return null
  try {
    const result = await ai.run('@cf/meta/m2m100-1.2b', {
      text,
      target_lang: targetLang === 'zh' ? 'chinese' : targetLang === 'ko' ? 'korean' : targetLang === 'ja' ? 'japanese' : 'english',
    })
    return result?.translated_text || null
  } catch {
    return null
  }
}

/**
 * Classify video genre using Workers AI text classification.
 * Returns one of: bouldering / lead / speed / alpine / training / competition / news / other
 */
export async function classifyGenreWithWorkersAI(
  ai: any,
  title: string,
  description: string
): Promise<string> {
  if (!ai) return 'other'
  try {
    const text = `${title}. ${description}`.toLowerCase()
    if (/bouldering|ボルダリング|抱石|볼더링/.test(text)) return 'bouldering'
    if (/lead|リード|领攀|리드/.test(text)) return 'lead'
    if (/speed|スピード|速度|스피드/.test(text)) return 'speed'
    if (/alpine|アルパイン|阿尔卑斯|알파인/.test(text)) return 'alpine'
    if (/training|トレーニング|训练|훈련/.test(text)) return 'training'
    if (/ifsc|world cup|olympics|大会|competition|世锦赛|대회/.test(text)) return 'competition'
    if (/news|news|新闻|뉴스/.test(text)) return 'news'
    return 'bouldering'  // default
  } catch {
    return 'other'
  }
}

/**
 * Compute a heuristic quality score from raw stats when AI is unavailable.
 */
export function heuristicQualityScore(video: CrawledVideo): number {
  // log scale on views, plus engagement ratio
  const viewScore = Math.min(60, Math.log10(Math.max(1, video.views)) * 10)
  const engagement = video.views > 0 ? (video.likes / video.views) * 100 : 0
  const engagementScore = Math.min(30, engagement * 5)
  const recencyBonus = (() => {
    if (!video.posted_date) return 0
    const days = (Date.now() - new Date(video.posted_date).getTime()) / 86400000
    if (days < 30) return 10
    if (days < 180) return 5
    return 0
  })()
  return Math.round(viewScore + engagementScore + recencyBonus)
}
