-- Migration: Add ad_banners table
-- Description: Store advertisement banners for display across the site

CREATE TABLE IF NOT EXISTS ad_banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT NOT NULL DEFAULT 'hero_bottom', -- 'hero_bottom', 'blog_top', 'sidebar', etc.
  is_active INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0,
  start_date DATETIME,
  end_date DATETIME,
  click_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ad_banners_position ON ad_banners(position);
CREATE INDEX IF NOT EXISTS idx_ad_banners_active ON ad_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_banners_priority ON ad_banners(priority);
