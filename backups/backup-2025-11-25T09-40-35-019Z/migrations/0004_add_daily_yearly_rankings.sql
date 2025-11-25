-- Add daily and yearly ranking columns to video_rankings table
ALTER TABLE video_rankings ADD COLUMN daily_score INTEGER DEFAULT 0;
ALTER TABLE video_rankings ADD COLUMN yearly_score INTEGER DEFAULT 0;

-- Update existing rankings with sample data
UPDATE video_rankings SET 
  daily_score = total_score / 365,
  yearly_score = total_score;
