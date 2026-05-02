/**
 * Video crawler orchestrator
 * - Reads enabled sources from DB
 * - Calls platform-specific crawlers
 * - Optionally runs AI analysis
 * - Dedup-inserts into videos table
 * - Records run log per source
 */

import {
  crawlYouTube,
  crawlVimeo,
  analyzeVideoWithAI,
  translateWithWorkersAI,
  classifyGenreWithWorkersAI,
  heuristicQualityScore,
  type CrawledVideo,
  type AIAnalysis,
} from './video-crawler'

/**
 * AI analysis with fallback chain:
 *   1. Gemini (best quality, full multi-language + grade extraction) — if GEMINI_API_KEY
 *   2. Workers AI (free, basic translate + heuristic genre)         — if env.AI binding
 *   3. heuristic only                                                — always available
 */
async function analyzeWithFallback(
  video: CrawledVideo,
  env: { GEMINI_API_KEY?: string; AI?: any }
): Promise<AIAnalysis | null> {
  if (env.GEMINI_API_KEY) {
    const ai = await analyzeVideoWithAI(video, env.GEMINI_API_KEY)
    if (ai) return ai
  }
  if (env.AI) {
    const [titleEn, titleZh, titleKo, genre] = await Promise.all([
      translateWithWorkersAI(env.AI, video.title, 'en'),
      translateWithWorkersAI(env.AI, video.title, 'zh'),
      translateWithWorkersAI(env.AI, video.title, 'ko'),
      classifyGenreWithWorkersAI(env.AI, video.title, video.description),
    ])
    return {
      title_ja: video.title,
      title_en: titleEn || video.title,
      title_zh: titleZh || video.title,
      title_ko: titleKo || video.title,
      description_ja: video.description.slice(0, 500),
      description_en: video.description.slice(0, 500),
      description_zh: video.description.slice(0, 500),
      description_ko: video.description.slice(0, 500),
      genre,
      grade: null,
      quality_score: heuristicQualityScore(video),
      summary_ja: video.title,
      summary_en: titleEn || video.title,
      summary_zh: titleZh || video.title,
      summary_ko: titleKo || video.title,
    }
  }
  return null
}

interface Source {
  id: number
  platform: string
  source_type: string
  query: string
  language: string | null
  region: string | null
  max_results: number
  min_views: number
  enabled: number
  priority: number
}

interface Settings {
  youtube_api_key: string | null
  vimeo_access_token: string | null
  rapidapi_key: string | null
  enabled: number
  ai_analysis_enabled: number
  translate_enabled: number
}

export interface OrchestratorResult {
  total_fetched: number
  total_inserted: number
  total_skipped: number
  total_errors: number
  per_source: Array<{
    source_id: number
    platform: string
    query: string
    fetched: number
    inserted: number
    skipped: number
    errors: number
    error_message?: string
  }>
}

export async function runCrawl(
  db: D1Database,
  env: {
    GEMINI_API_KEY?: string;
    YOUTUBE_API_KEY?: string;
    VIMEO_ACCESS_TOKEN?: string;
    AI?: any;
  },
  options: { sourceId?: number; limit?: number; runAI?: boolean } = {}
): Promise<OrchestratorResult> {
  const settings = await loadSettings(db)

  // env vars take precedence over DB-stored secrets (more secure)
  const youtubeKey = env.YOUTUBE_API_KEY || settings.youtube_api_key || ''
  const vimeoKey = env.VIMEO_ACCESS_TOKEN || settings.vimeo_access_token || ''
  const geminiKey = env.GEMINI_API_KEY || ''
  // AI runs if either Gemini key or Workers AI binding is available
  const runAI =
    options.runAI !== false &&
    settings.ai_analysis_enabled === 1 &&
    (!!geminiKey || !!env.AI)

  const sources = await loadSources(db, options.sourceId, options.limit)

  const result: OrchestratorResult = {
    total_fetched: 0,
    total_inserted: 0,
    total_skipped: 0,
    total_errors: 0,
    per_source: [],
  }

  for (const source of sources) {
    const startedAt = Date.now()
    let fetched = 0, inserted = 0, skipped = 0, errors = 0
    let errorMessage: string | undefined
    let crawled: CrawledVideo[] = []

    try {
      if (source.platform === 'youtube') {
        const r = await crawlYouTube(youtubeKey, source.query, {
          maxResults: source.max_results,
          region: source.region || undefined,
          language: source.language || undefined,
          minViews: source.min_views,
        })
        crawled = r.videos
        fetched = r.fetched
        if (r.error) errorMessage = r.error
      } else if (source.platform === 'vimeo') {
        const r = await crawlVimeo(vimeoKey, source.query, {
          maxResults: source.max_results,
          minViews: source.min_views,
        })
        crawled = r.videos
        fetched = r.fetched
        if (r.error) errorMessage = r.error
      } else {
        // tiktok / instagram crawlers can be added here (RapidAPI etc.)
        errorMessage = `Platform ${source.platform} not yet implemented`
      }
    } catch (err: any) {
      errorMessage = `crawl exception: ${err.message}`
      errors++
    }

    // Insert / dedup
    for (const v of crawled) {
      try {
        const existing = await db
          .prepare('SELECT id FROM videos WHERE url = ?')
          .bind(v.url)
          .first()

        if (existing) {
          // refresh stats only
          await db
            .prepare(`UPDATE videos SET views = ?, likes = ? WHERE url = ?`)
            .bind(v.views, v.likes, v.url)
            .run()
          skipped++
          continue
        }

        let ai: AIAnalysis | null = null
        if (runAI) {
          try {
            ai = await analyzeWithFallback(v, env)
          } catch (err) {
            console.error('AI analysis error:', err)
          }
        }

        const qualityScore = ai?.quality_score ?? heuristicQualityScore(v)

        await db
          .prepare(
            `INSERT INTO videos (
              title, description, url, thumbnail_url, duration, channel_name,
              category, views, likes,
              media_source, platform, video_id_external, posted_date,
              title_en, description_en, title_zh, description_zh, title_ko, description_ko,
              source_query, ai_processed_at, ai_genre, ai_grade, ai_quality_score,
              ai_summary, ai_summary_en, ai_summary_zh, ai_summary_ko,
              crawled_at, auto_imported
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            ai?.title_ja || v.title,
            ai?.description_ja || v.description.slice(0, 500),
            v.url,
            v.thumbnail_url,
            v.duration,
            v.channel_name,
            ai?.genre || 'bouldering',
            v.views,
            v.likes,
            v.platform,
            v.platform,
            v.external_id,
            v.posted_date || null,
            ai?.title_en || null,
            ai?.description_en || null,
            ai?.title_zh || null,
            ai?.description_zh || null,
            ai?.title_ko || null,
            ai?.description_ko || null,
            source.query,
            ai ? new Date().toISOString() : null,
            ai?.genre || null,
            ai?.grade || null,
            qualityScore,
            ai?.summary_ja || null,
            ai?.summary_en || null,
            ai?.summary_zh || null,
            ai?.summary_ko || null,
            new Date().toISOString(),
            1
          )
          .run()
        inserted++
      } catch (err: any) {
        errors++
        console.error('Insert error for', v.url, err.message)
      }
    }

    // Log this source run
    await db
      .prepare(
        `INSERT INTO video_crawler_log
         (source_id, platform, query, fetched, inserted, skipped, errors, duration_ms, details)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        source.id,
        source.platform,
        source.query,
        fetched,
        inserted,
        skipped,
        errors,
        Date.now() - startedAt,
        errorMessage ? JSON.stringify({ error: errorMessage }) : null
      )
      .run()

    await db
      .prepare(
        `UPDATE video_crawler_sources
         SET last_crawled_at = CURRENT_TIMESTAMP,
             last_status = ?, last_error = ?
         WHERE id = ?`
      )
      .bind(errorMessage ? 'error' : 'ok', errorMessage || null, source.id)
      .run()

    result.total_fetched += fetched
    result.total_inserted += inserted
    result.total_skipped += skipped
    result.total_errors += errors
    result.per_source.push({
      source_id: source.id,
      platform: source.platform,
      query: source.query,
      fetched,
      inserted,
      skipped,
      errors,
      error_message: errorMessage,
    })
  }

  await db
    .prepare(
      `UPDATE video_crawler_settings
       SET last_crawl_at = CURRENT_TIMESTAMP,
           total_videos_imported = total_videos_imported + ?
       WHERE id = 1`
    )
    .bind(result.total_inserted)
    .run()

  return result
}

async function loadSettings(db: D1Database): Promise<Settings> {
  const row = await db
    .prepare('SELECT * FROM video_crawler_settings WHERE id = 1')
    .first<any>()
  return {
    youtube_api_key: row?.youtube_api_key || null,
    vimeo_access_token: row?.vimeo_access_token || null,
    rapidapi_key: row?.rapidapi_key || null,
    enabled: row?.enabled ?? 1,
    ai_analysis_enabled: row?.ai_analysis_enabled ?? 1,
    translate_enabled: row?.translate_enabled ?? 1,
  }
}

async function loadSources(
  db: D1Database,
  sourceId?: number,
  limit?: number
): Promise<Source[]> {
  if (sourceId) {
    const row = await db
      .prepare('SELECT * FROM video_crawler_sources WHERE id = ?')
      .bind(sourceId)
      .first<any>()
    return row ? [row as Source] : []
  }

  const stmt = db
    .prepare(
      `SELECT * FROM video_crawler_sources
       WHERE enabled = 1
       ORDER BY priority DESC, COALESCE(last_crawled_at, '1970-01-01') ASC
       LIMIT ?`
    )
    .bind(limit ?? 20)
  const { results } = await stmt.all<any>()
  return (results || []) as Source[]
}

/**
 * Backfill AI analysis for previously imported videos that have null ai_processed_at.
 * Falls back to Workers AI when GEMINI_API_KEY is not set.
 */
export async function backfillAIAnalysis(
  db: D1Database,
  envOrKey: string | { GEMINI_API_KEY?: string; AI?: any },
  limit = 10
): Promise<{ processed: number; errors: number }> {
  // Backwards compat: accept a bare gemini key (old callers) OR the env object
  const env: { GEMINI_API_KEY?: string; AI?: any } =
    typeof envOrKey === 'string' ? { GEMINI_API_KEY: envOrKey } : envOrKey
  if (!env.GEMINI_API_KEY && !env.AI) return { processed: 0, errors: 0 }

  const { results } = await db
    .prepare(
      `SELECT id, title, description, channel_name, views, likes, duration,
              posted_date, platform, media_source, url
       FROM videos
       WHERE ai_processed_at IS NULL
       ORDER BY views DESC
       LIMIT ?`
    )
    .bind(limit)
    .all<any>()

  let processed = 0, errors = 0
  for (const row of results || []) {
    const cv: CrawledVideo = {
      platform: (row.platform || row.media_source || 'youtube') as any,
      external_id: '',
      url: row.url,
      title: row.title,
      description: row.description || '',
      thumbnail_url: '',
      duration: row.duration || '',
      channel_name: row.channel_name || '',
      views: row.views || 0,
      likes: row.likes || 0,
      posted_date: row.posted_date,
    }
    try {
      const ai = await analyzeWithFallback(cv, env)
      if (!ai) { errors++; continue }
      await db
        .prepare(
          `UPDATE videos SET
             title_en = COALESCE(title_en, ?),
             title_zh = COALESCE(title_zh, ?),
             title_ko = COALESCE(title_ko, ?),
             description_en = COALESCE(description_en, ?),
             description_zh = COALESCE(description_zh, ?),
             description_ko = COALESCE(description_ko, ?),
             ai_genre = ?, ai_grade = ?, ai_quality_score = ?,
             ai_summary = ?, ai_summary_en = ?, ai_summary_zh = ?, ai_summary_ko = ?,
             ai_processed_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        )
        .bind(
          ai.title_en, ai.title_zh, ai.title_ko,
          ai.description_en, ai.description_zh, ai.description_ko,
          ai.genre, ai.grade, ai.quality_score,
          ai.summary_ja, ai.summary_en, ai.summary_zh, ai.summary_ko,
          row.id
        )
        .run()
      processed++
    } catch (err) {
      console.error('Backfill error for video', row.id, err)
      errors++
    }
  }
  return { processed, errors }
}
