-- Migration: Video crawler infrastructure
-- Date: 2026-04-26
-- Purpose: Auto-crawl videos from YouTube/Vimeo/TikTok/Instagram with AI analysis

-- Crawler source definitions (what queries/channels to crawl)
CREATE TABLE IF NOT EXISTS video_crawler_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL,                  -- youtube / vimeo / tiktok / instagram
  source_type TEXT NOT NULL DEFAULT 'query', -- query / channel / hashtag / playlist
  query TEXT NOT NULL,                     -- "bouldering 2026" or channel id
  language TEXT,                           -- preferred result language (ja/en/zh/ko)
  region TEXT,                             -- ISO region code (JP/US/...)
  max_results INTEGER DEFAULT 25,
  min_views INTEGER DEFAULT 1000,          -- skip videos below this view count
  enabled INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0,              -- higher runs first
  last_crawled_at DATETIME,
  last_status TEXT,                        -- ok / error / rate_limited
  last_error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_video_crawler_sources_enabled ON video_crawler_sources(enabled, priority);
CREATE INDEX IF NOT EXISTS idx_video_crawler_sources_platform ON video_crawler_sources(platform);

-- Crawler run log
CREATE TABLE IF NOT EXISTS video_crawler_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER,
  platform TEXT NOT NULL,
  query TEXT,
  ran_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  fetched INTEGER DEFAULT 0,
  inserted INTEGER DEFAULT 0,
  updated INTEGER DEFAULT 0,
  skipped INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  duration_ms INTEGER,
  details TEXT,                            -- JSON: error messages, sample IDs
  FOREIGN KEY (source_id) REFERENCES video_crawler_sources(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_video_crawler_log_ran_at ON video_crawler_log(ran_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_crawler_log_source ON video_crawler_log(source_id, ran_at DESC);

-- Add AI analysis columns to videos table
ALTER TABLE videos ADD COLUMN source_query TEXT;
ALTER TABLE videos ADD COLUMN ai_processed_at DATETIME;
ALTER TABLE videos ADD COLUMN ai_genre TEXT;             -- bouldering / lead / speed / alpine / training / news
ALTER TABLE videos ADD COLUMN ai_grade TEXT;             -- e.g. "V10", "5.14a", "8c+"
ALTER TABLE videos ADD COLUMN ai_quality_score INTEGER;  -- 0-100
ALTER TABLE videos ADD COLUMN ai_summary TEXT;
ALTER TABLE videos ADD COLUMN ai_summary_en TEXT;
ALTER TABLE videos ADD COLUMN ai_summary_zh TEXT;
ALTER TABLE videos ADD COLUMN ai_summary_ko TEXT;
ALTER TABLE videos ADD COLUMN crawled_at DATETIME;
ALTER TABLE videos ADD COLUMN auto_imported INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_videos_ai_quality ON videos(ai_quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_videos_auto_imported ON videos(auto_imported, crawled_at DESC);

-- Default seed sources (curated climbing search queries)
INSERT INTO video_crawler_sources (platform, source_type, query, language, region, max_results, min_views, priority) VALUES
  ('youtube', 'query', 'bouldering competition', 'en', 'US', 25, 5000, 100),
  ('youtube', 'query', 'lead climbing IFSC', 'en', 'US', 25, 5000, 95),
  ('youtube', 'query', 'rock climbing send', 'en', 'US', 25, 10000, 90),
  ('youtube', 'query', 'ボルダリング', 'ja', 'JP', 25, 1000, 85),
  ('youtube', 'query', 'クライミング 大会', 'ja', 'JP', 25, 1000, 80),
  ('youtube', 'query', '攀岩', 'zh', 'CN', 25, 1000, 70),
  ('youtube', 'query', '클라이밍', 'ko', 'KR', 25, 1000, 70),
  ('youtube', 'query', 'climbing shorts', 'en', 'US', 25, 50000, 75),
  ('vimeo', 'query', 'climbing', 'en', NULL, 25, 1000, 60),
  ('vimeo', 'query', 'bouldering', 'en', NULL, 25, 1000, 60);

-- Crawler global settings
CREATE TABLE IF NOT EXISTS video_crawler_settings (
  id INTEGER PRIMARY KEY,
  youtube_api_key TEXT,
  vimeo_access_token TEXT,
  rapidapi_key TEXT,                  -- for tiktok/instagram scrapers
  cron_schedule TEXT DEFAULT '0 */6 * * *',
  enabled INTEGER DEFAULT 1,
  ai_analysis_enabled INTEGER DEFAULT 1,
  translate_enabled INTEGER DEFAULT 1,
  last_crawl_at DATETIME,
  last_ai_run_at DATETIME,
  total_videos_imported INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO video_crawler_settings (id) VALUES (1);
