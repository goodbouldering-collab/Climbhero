-- User settings table for API keys and preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  openai_api_key TEXT,
  youtube_api_key TEXT,
  vimeo_access_token TEXT,
  instagram_access_token TEXT,
  tiktok_access_token TEXT,
  notify_likes INTEGER DEFAULT 1,
  notify_comments INTEGER DEFAULT 1,
  notify_replies INTEGER DEFAULT 1,
  notify_follows INTEGER DEFAULT 1,
  notify_announcements INTEGER DEFAULT 1,
  profile_public INTEGER DEFAULT 1,
  show_email INTEGER DEFAULT 0,
  allow_comments INTEGER DEFAULT 1,
  language TEXT DEFAULT 'ja',
  timezone TEXT DEFAULT 'Asia/Tokyo',
  videos_per_page INTEGER DEFAULT 12,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings for all existing users
INSERT OR IGNORE INTO user_settings (user_id) 
SELECT id FROM users;
