-- Trending Videos Calculation
-- Track videos with recent like spikes for "いいね急増中" feature

-- Create a view to calculate trending videos based on recent likes
-- Videos that received many likes in the last 24-48 hours
CREATE VIEW IF NOT EXISTS trending_videos AS
SELECT 
  v.*,
  COUNT(CASE WHEN l.created_at >= datetime('now', '-24 hours') THEN 1 END) as recent_likes_24h,
  COUNT(CASE WHEN l.created_at >= datetime('now', '-48 hours') AND l.created_at < datetime('now', '-24 hours') THEN 1 END) as previous_likes_24h,
  COUNT(l.id) as total_video_likes
FROM videos v
LEFT JOIN likes l ON v.id = l.video_id
GROUP BY v.id
HAVING recent_likes_24h > 0
ORDER BY 
  (recent_likes_24h - previous_likes_24h) DESC,
  recent_likes_24h DESC,
  v.created_at DESC
LIMIT 20;
