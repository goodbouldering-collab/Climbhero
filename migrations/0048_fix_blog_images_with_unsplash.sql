-- Fix blog images with high-quality Unsplash climbing images
-- Created: 2026-01-05

UPDATE blog_posts SET image_url = 'https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?w=1200&h=600&fit=crop&q=85' WHERE id IN (1, 15);  -- Multi-pitch climbing
UPDATE blog_posts SET image_url = 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=600&fit=crop&q=85' WHERE id IN (2, 16);  -- Bouldering V-grades
UPDATE blog_posts SET image_url = 'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=1200&h=600&fit=crop&q=85' WHERE id IN (3, 17);  -- Climbing and environment
UPDATE blog_posts SET image_url = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop&q=85' WHERE id IN (4, 18);  -- Choosing climbing gym
UPDATE blog_posts SET image_url = 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&h=600&fit=crop&q=85' WHERE id IN (5, 19);  -- Climbing shoes review
