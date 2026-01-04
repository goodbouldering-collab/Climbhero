-- Migration: Update video thumbnails with actual platform URLs based on research
-- Created: 2026-01-04
-- Description: Replace placeholder thumbnails with real YouTube/Instagram/TikTok thumbnails

-- YouTube videos: Use standard YouTube thumbnail URL pattern
-- Format: https://i.ytimg.com/vi/{VIDEO_ID}/maxresdefault.jpg

-- 小山田大チャンネル
UPDATE videos SET 
  thumbnail_url = 'https://i.ytimg.com/vi/93aD51EDN1I/maxresdefault.jpg'
WHERE url = 'https://www.youtube.com/watch?v=93aD51EDN1I';

-- ボルダージャパンカップ2025
UPDATE videos SET 
  thumbnail_url = 'https://i.ytimg.com/vi/hFMlrmBTvpA/maxresdefault.jpg'
WHERE url = 'https://www.youtube.com/watch?v=hFMlrmBTvpA';

-- 野口啓代 × 楢崎智亜
UPDATE videos SET 
  thumbnail_url = 'https://i.ytimg.com/vi/_kkQ-H9XRL0/maxresdefault.jpg'
WHERE url = 'https://www.youtube.com/watch?v=_kkQ-H9XRL0';

-- Instagram/TikTok: Keep Unsplash placeholders as these platforms don't provide direct thumbnail URLs
-- These are appropriate generic climbing images
UPDATE videos SET 
  thumbnail_url = 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800'
WHERE media_source IN ('instagram', 'tiktok') AND thumbnail_url LIKE '%unsplash%';
