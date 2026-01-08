-- Fix blog posts with invalid genspark.ai image URLs
-- Replace with valid Unsplash climbing images
-- Created: 2026-01-08

UPDATE blog_posts SET image_url = 'https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?w=1200&h=600&fit=crop&q=85' WHERE id = 20;  -- Multi-pitch climbing
UPDATE blog_posts SET image_url = 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=600&fit=crop&q=85' WHERE id = 21;  -- Bouldering V-grades
UPDATE blog_posts SET image_url = 'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=1200&h=600&fit=crop&q=85' WHERE id = 22;  -- Climbing and environment
UPDATE blog_posts SET image_url = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop&q=85' WHERE id = 23;  -- Choosing climbing gym
UPDATE blog_posts SET image_url = 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&h=600&fit=crop&q=85' WHERE id = 24;  -- Climbing shoes review
