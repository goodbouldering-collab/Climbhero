-- Fix YouTube video thumbnails by extracting video IDs from URLs
-- Created: 2026-01-08

-- Update YouTube videos without thumbnails
UPDATE videos SET thumbnail_url = 'https://i.ytimg.com/vi/' || SUBSTR(url, INSTR(url, 'watch?v=') + 8, 11) || '/hqdefault.jpg'
WHERE media_source = 'youtube' 
  AND (thumbnail_url IS NULL OR thumbnail_url = '' OR thumbnail_url LIKE 'https://images.unsplash%')
  AND url LIKE '%watch?v=%';

-- Update YouTube Shorts without thumbnails
UPDATE videos SET thumbnail_url = 'https://i.ytimg.com/vi/' || SUBSTR(url, INSTR(url, '/shorts/') + 8, 11) || '/hqdefault.jpg'
WHERE media_source IN ('youtube', 'youtube_shorts')
  AND (thumbnail_url IS NULL OR thumbnail_url = '' OR thumbnail_url LIKE 'https://images.unsplash%')
  AND url LIKE '%/shorts/%';
