-- Migration: Update blog images with high-quality AI-generated images
-- Created: 2026-01-04
-- Description: Replace Unsplash images with custom AI-generated climbing images

-- Update マルチピッチクライミング完全ガイド
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/8jY38dE5?cache_control=3600'
WHERE slug = 'multipitch-climbing-guide';

-- Update ボルダリングV難度完全攻略法
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/3WxaeHCD?cache_control=3600'
WHERE slug = 'v-grade-complete-guide';

-- Update クライミングと環境保全活動
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/DDEUW3Eo?cache_control=3600'
WHERE slug = 'climbing-and-environment';

-- Update クライミングジム選びのポイント
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/D7a4GFWI?cache_control=3600'
WHERE slug = 'choosing-climbing-gym';

-- Update 2024年最新クライミングシューズレビュー
UPDATE blog_posts SET 
  image_url = 'https://www.genspark.ai/api/files/s/pEGEQts2?cache_control=3600'
WHERE slug = 'shoes-review-2024';
