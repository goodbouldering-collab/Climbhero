-- Migration: Fix blog slugs and update images
-- Created: 2026-01-04
-- Description: Add proper slugs to blog posts and update images with Japanese-themed AI-generated images

-- Update マルチピッチクライミング完全ガイド
UPDATE blog_posts SET 
  slug = 'multipitch-climbing-guide',
  image_url = 'https://www.genspark.ai/api/files/s/V90YaRYf?cache_control=3600'
WHERE id = 6;

-- Update ボルダリングV難度攻略法
UPDATE blog_posts SET 
  slug = 'v-grade-complete-guide',
  image_url = 'https://www.genspark.ai/api/files/s/Lbot1Wta?cache_control=3600'
WHERE id = 7;

-- Update クライミングと環境保全活動
UPDATE blog_posts SET 
  slug = 'climbing-and-environment',
  image_url = 'https://www.genspark.ai/api/files/s/B13zlWAe?cache_control=3600'
WHERE id = 8;

-- Update クライミングジム選びのポイント
UPDATE blog_posts SET 
  slug = 'choosing-climbing-gym',
  image_url = 'https://www.genspark.ai/api/files/s/Mx37wZXh?cache_control=3600'
WHERE id = 9;

-- Update クライミング施設開業コンサルティング (use first image)
UPDATE blog_posts SET 
  slug = 'climbing-gym-consulting',
  image_url = 'https://www.genspark.ai/api/files/s/V90YaRYf?cache_control=3600'
WHERE id = 10;
