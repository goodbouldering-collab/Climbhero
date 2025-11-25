-- Update Trending Videos Calculation to use increase rate
-- Sort by percentage increase rather than absolute increase

-- Drop the old view first
DROP VIEW IF EXISTS trending_videos;

-- Create updated view with increase rate calculation
CREATE VIEW IF NOT EXISTS trending_videos AS
SELECT 
  v.*,
  COUNT(CASE WHEN l.created_at >= datetime('now', '-24 hours') THEN 1 END) as recent_likes_24h,
  COUNT(CASE WHEN l.created_at >= datetime('now', '-48 hours') AND l.created_at < datetime('now', '-24 hours') THEN 1 END) as previous_likes_24h,
  COUNT(l.id) as total_video_likes,
  -- Calculate increase rate (percentage)
  -- If previous is 0, use recent count directly for sorting
  -- Otherwise calculate percentage increase: ((recent - previous) / previous) * 100
  CASE 
    WHEN COUNT(CASE WHEN l.created_at >= datetime('now', '-48 hours') AND l.created_at < datetime('now', '-24 hours') THEN 1 END) = 0 
    THEN COUNT(CASE WHEN l.created_at >= datetime('now', '-24 hours') THEN 1 END) * 1000.0
    ELSE (
      (COUNT(CASE WHEN l.created_at >= datetime('now', '-24 hours') THEN 1 END) * 1.0 - 
       COUNT(CASE WHEN l.created_at >= datetime('now', '-48 hours') AND l.created_at < datetime('now', '-24 hours') THEN 1 END)) /
      COUNT(CASE WHEN l.created_at >= datetime('now', '-48 hours') AND l.created_at < datetime('now', '-24 hours') THEN 1 END)
    ) * 100.0
  END as increase_rate
FROM videos v
LEFT JOIN likes l ON v.id = l.video_id
GROUP BY v.id
HAVING recent_likes_24h > 0
ORDER BY 
  increase_rate DESC,
  recent_likes_24h DESC,
  v.created_at DESC
LIMIT 20;
