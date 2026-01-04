-- Migration: Update blog images with Japanese-themed AI-generated images
-- Created: 2026-01-04
-- Description: Replace blog header images with high-quality Japanese climbing-focused AI images

-- Update マルチピッチクライミング完全ガイド (Japanese climber on Japanese mountain)
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/V90YaRYf?cache_control=3600'
WHERE slug = 'multipitch-climbing-guide';

-- Update ボルダリングV難度完全攻略法 (Japanese gym with Asian climber)
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/Lbot1Wta?cache_control=3600'
WHERE slug = 'v-grade-complete-guide';

-- Update クライミングと環境保全活動 (Japanese climbers plogging)
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/B13zlWAe?cache_control=3600'
WHERE slug = 'climbing-and-environment';

-- Update クライミングジム選びのポイント (Japanese gym with cafe)
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/Mx37wZXh?cache_control=3600'
WHERE slug = 'choosing-climbing-gym';

-- Update 2024年最新クライミングシューズレビュー (Japanese shoe store)
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/F4dczqbJ?cache_control=3600'
WHERE slug = 'shoes-review-2024';
