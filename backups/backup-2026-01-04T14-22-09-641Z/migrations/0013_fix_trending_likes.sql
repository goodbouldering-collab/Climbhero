-- Fix Trending Videos to use user_likes table instead of likes table
-- Update view to calculate like increase rate correctly

-- Drop the old view first
DROP VIEW IF EXISTS trending_videos;

-- Create updated view with user_likes table
CREATE VIEW IF NOT EXISTS trending_videos AS
SELECT 
  v.*,
  COUNT(CASE WHEN ul.created_at >= datetime('now', '-24 hours') THEN 1 END) as recent_likes_24h,
  COUNT(CASE WHEN ul.created_at >= datetime('now', '-48 hours') AND ul.created_at < datetime('now', '-24 hours') THEN 1 END) as previous_likes_24h,
  COUNT(ul.id) as total_video_likes,
  -- Calculate increase rate (percentage)
  -- If previous is 0, use recent count * 1000 for high priority
  -- Otherwise calculate percentage increase: ((recent - previous) / previous) * 100
  CASE 
    WHEN COUNT(CASE WHEN ul.created_at >= datetime('now', '-48 hours') AND ul.created_at < datetime('now', '-24 hours') THEN 1 END) = 0 
    THEN COUNT(CASE WHEN ul.created_at >= datetime('now', '-24 hours') THEN 1 END) * 1000.0
    ELSE (
      (COUNT(CASE WHEN ul.created_at >= datetime('now', '-24 hours') THEN 1 END) * 1.0 - 
       COUNT(CASE WHEN ul.created_at >= datetime('now', '-48 hours') AND ul.created_at < datetime('now', '-24 hours') THEN 1 END)) /
      COUNT(CASE WHEN ul.created_at >= datetime('now', '-48 hours') AND ul.created_at < datetime('now', '-24 hours') THEN 1 END)
    ) * 100.0
  END as increase_rate
FROM videos v
LEFT JOIN user_likes ul ON v.id = ul.video_id
GROUP BY v.id
HAVING recent_likes_24h > 0
ORDER BY 
  increase_rate DESC,
  recent_likes_24h DESC,
  v.created_at DESC
LIMIT 20;
