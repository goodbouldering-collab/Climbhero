-- Migration: News Crawler System
-- Create tables for automatic news collection

-- News Articles Table
CREATE TABLE IF NOT EXISTS news_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  title_en TEXT,
  title_zh TEXT,
  title_ko TEXT,
  
  summary TEXT,
  summary_en TEXT,
  summary_zh TEXT,
  summary_ko TEXT,
  
  url TEXT NOT NULL UNIQUE,
  source_name TEXT,
  source_url TEXT,
  
  image_url TEXT,
  published_date DATETIME,
  crawled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  category TEXT DEFAULT 'general', -- bouldering, lead, alpine, competition, news, other
  genre TEXT, -- AI-generated genre classification
  
  language TEXT DEFAULT 'en', -- Original language: en, ja, zh, ko, es, fr, de, etc.
  
  is_active INTEGER DEFAULT 1,
  view_count INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- News Crawler Settings Table
CREATE TABLE IF NOT EXISTS news_crawler_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Search Keywords (JSON array)
  keywords TEXT DEFAULT '["climbing news", "bouldering", "sport climbing", "alpinism", "IFSC", "climbing competition"]',
  
  -- Languages to search (JSON array)
  languages TEXT DEFAULT '["en", "ja"]',
  
  -- News sources (JSON array of domains)
  sources TEXT DEFAULT '[]',
  
  -- Cron schedule (cron expression)
  cron_schedule TEXT DEFAULT '0 15 * * *', -- Daily at 15:00 JST
  
  -- Max articles per crawl
  max_articles_per_crawl INTEGER DEFAULT 20,
  
  -- Days to keep articles
  retention_days INTEGER DEFAULT 30,
  
  -- API Keys (encrypted)
  google_api_key TEXT,
  openai_api_key TEXT,
  
  -- Enable/Disable crawler
  is_enabled INTEGER DEFAULT 1,
  
  -- Last crawl timestamp
  last_crawl_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO news_crawler_settings (id) VALUES (1);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_date ON news_articles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_crawled_at ON news_articles(crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_active ON news_articles(is_active);
CREATE INDEX IF NOT EXISTS idx_news_articles_language ON news_articles(language);
CREATE INDEX IF NOT EXISTS idx_news_articles_genre ON news_articles(genre);
