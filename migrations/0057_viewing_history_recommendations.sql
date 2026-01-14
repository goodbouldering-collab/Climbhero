-- Migration: Add viewing history and recommendations system
-- Date: 2026-01-11
-- Purpose: Track user viewing history and enable personalized recommendations

-- Viewing history table
CREATE TABLE IF NOT EXISTS viewing_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  video_id INTEGER NOT NULL,
  watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  watch_duration INTEGER DEFAULT 0,  -- in seconds
  completed INTEGER DEFAULT 0,  -- 0 or 1
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_viewing_history_user ON viewing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_viewing_history_video ON viewing_history(video_id);
CREATE INDEX IF NOT EXISTS idx_viewing_history_watched_at ON viewing_history(watched_at);

-- User activity streaks (for gamification)
CREATE TABLE IF NOT EXISTS user_streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_videos_watched INTEGER DEFAULT 0,
  total_watch_time INTEGER DEFAULT 0,  -- in seconds
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON user_streaks(user_id);

-- Daily challenges (optional, for future)
CREATE TABLE IF NOT EXISTS daily_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  challenge_date DATE NOT NULL,
  challenge_type TEXT NOT NULL,  -- 'watch_videos', 'like_videos', 'share_videos'
  target_count INTEGER DEFAULT 3,
  current_count INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  reward_claimed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, challenge_date, challenge_type)
);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_user ON daily_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
