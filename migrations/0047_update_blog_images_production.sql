-- Migration: Update blog images in production
-- Created: 2026-01-05
-- Description: Update blog post images with AI-generated Japanese-themed images for production database

-- Update all blog posts with new AI-generated images
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/V90YaRYf?cache_control=3600'
WHERE title = 'マルチピッチクライミング完全ガイド';

UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/Lbot1Wta?cache_control=3600'
WHERE title = 'ボルダリングV難度完全攻略法';

UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/B13zlWAe?cache_control=3600'
WHERE title = 'クライミングと環境保全活動';

UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/Mx37wZXh?cache_control=3600'
WHERE title = 'クライミングジム選びのポイント';

UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/F4dczqbJ?cache_control=3600'
WHERE title = '2024年最新クライミングシューズレビュー';
