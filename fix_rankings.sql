-- Initialize rankings for existing videos
INSERT OR IGNORE INTO video_rankings (video_id, total_score, weekly_score, monthly_score)
SELECT id, likes * 10, likes * 10, likes * 10 FROM videos;
