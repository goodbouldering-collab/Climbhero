-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add password and session fields to users
ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN session_token TEXT;
ALTER TABLE users ADD COLUMN last_login DATETIME;

-- Add rankings tracking
CREATE TABLE IF NOT EXISTS video_rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL UNIQUE,
  weekly_score INTEGER DEFAULT 0,
  monthly_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_users_session_token ON users(session_token);
CREATE INDEX IF NOT EXISTS idx_video_rankings_weekly ON video_rankings(weekly_score DESC);
CREATE INDEX IF NOT EXISTS idx_video_rankings_monthly ON video_rankings(monthly_score DESC);
CREATE INDEX IF NOT EXISTS idx_video_rankings_total ON video_rankings(total_score DESC);
