-- Add media_source column to videos table
ALTER TABLE videos ADD COLUMN media_source TEXT DEFAULT 'youtube';

-- Create user_likes table for tracking likes
CREATE TABLE IF NOT EXISTS user_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  video_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  UNIQUE(user_id, video_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_video_id ON user_likes(video_id);

-- Update ranking calculation to use internal likes only
-- Note: video_rankings.total_score will now be based on internal likes count
