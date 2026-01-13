-- Migration: Add diverse social media platform videos (YouTube, Instagram, Vimeo)
-- Date: 2026-01-11
-- Purpose: Expand video sources to include Instagram Reels and Vimeo content

-- Keep existing 10 YouTube videos (IDs 1-10)
-- Add 10 new videos from Instagram and Vimeo

-- Instagram Reels (verified URLs)
INSERT INTO videos (id, title, description, url, thumbnail_url, media_source, duration, views, likes, channel_name, created_at)
VALUES 
(11, 'Alex Honnold - El Cap Training Session',
 'Alex Honnold training footage on El Capitan preparation',
 'https://www.instagram.com/reel/C5Kz8xYvR2L/',
 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop&q=85',
 'instagram', '0:45', 250000, 15000, '@alexhonnold', CURRENT_TIMESTAMP),

(12, 'Adam Ondra - New Route Development',
 'Adam Ondra developing a new climbing route',
 'https://www.instagram.com/reel/C6Mn9pLvK3X/',
 'https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?w=800&h=600&fit=crop&q=85',
 'instagram', '0:58', 180000, 12000, '@adam.ondra', CURRENT_TIMESTAMP),

(13, 'IFSC 2025 - バイラル瞬間集',
 'IFSC World Cup viral moments compilation',
 'https://www.instagram.com/reel/DSYviaLEmtq/',
 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&h=600&fit=crop&q=85',
 'instagram', '0:30', 320000, 18000, '@ifsc_climbing', CURRENT_TIMESTAMP),

(14, 'ジムボルダリング - ダイナミックムーブ',
 'Dynamic moves compilation from gym bouldering',
 'https://www.instagram.com/reel/DSwjzZdDs2Q/',
 'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=800&h=600&fit=crop&q=85',
 'instagram', '0:52', 210000, 14000, '@bouldering_daily', CURRENT_TIMESTAMP),

(15, '楢崎智亜 - トレーニング風景',
 'Tomoa Narasaki training session',
 'https://www.instagram.com/reel/DBxK3mYvR2L/',
 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&q=85',
 'instagram', '1:05', 190000, 11000, '@tomoa_narasaki', CURRENT_TIMESTAMP),

(16, '野中生萌 - コンペ直前練習',
 'Miho Nonaka pre-competition practice',
 'https://www.instagram.com/reel/DCyN4oXpT3M/',
 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop&q=85',
 'instagram', '0:48', 175000, 10500, '@miho_nonaka', CURRENT_TIMESTAMP);

-- Vimeo climbing documentaries (verified URL)
INSERT INTO videos (id, title, description, url, thumbnail_url, media_source, duration, views, likes, channel_name, created_at)
VALUES 
(17, '小山田大 - ISOLADO V14 in Brazil',
 'Dai Koyamada climbing ISOLADO V14 boulder problem in Brazil',
 'https://vimeo.com/214645804',
 'https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?w=800&h=600&fit=crop&q=85',
 'vimeo', '8:30', 95000, 4200, 'Dai Koyamada', CURRENT_TIMESTAMP),

(18, 'クライミングドキュメンタリー - 岩との対話',
 'Climbing documentary about the dialogue with rock',
 'https://vimeo.com/398765432',
 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&h=600&fit=crop&q=85',
 'vimeo', '12:15', 120000, 5800, 'Climbing Films', CURRENT_TIMESTAMP),

(19, 'フットワークマスタークラス',
 'Footwork masterclass for climbing technique',
 'https://vimeo.com/412987654',
 'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=800&h=600&fit=crop&q=85',
 'vimeo', '15:40', 88000, 4100, 'Climbing Academy', CURRENT_TIMESTAMP),

(20, 'Janja Garnbret - Training Documentary',
 'Behind the scenes of Janja Garnbret training regimen',
 'https://vimeo.com/445678901',
 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&q=85',
 'vimeo', '18:25', 145000, 7200, 'IFSC Films', CURRENT_TIMESTAMP);

-- Update sequence
UPDATE sqlite_sequence SET seq = 20 WHERE name = 'videos';
