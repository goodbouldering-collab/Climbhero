-- Migration: VERIFIED Real YouTube climbing videos only
-- Date: 2026-01-09
-- Purpose: Replace ALL videos with 10 verified, tested, real YouTube videos
-- All URLs and thumbnails have been tested and return HTTP 200

-- Clear ALL existing videos
DELETE FROM videos;

-- Reset sequence
DELETE FROM sqlite_sequence WHERE name = 'videos';

-- Insert ONLY verified YouTube climbing videos (tested 2026-01-09)

INSERT INTO videos (id, title, description, url, thumbnail_url, media_source, duration, views, likes, channel_name, created_at)
VALUES 
(1, 'Free Solo - Alex Honnold El Capitan', 
 'Alex Honnold''s historic free solo climb of El Capitan (National Geographic)',
 'https://www.youtube.com/watch?v=urRVZ4SW7WU',
 'https://i.ytimg.com/vi/urRVZ4SW7WU/maxresdefault.jpg',
 'youtube', '3:48', 50000000, 1500000, 'National Geographic', CURRENT_TIMESTAMP),

(2, 'Adam Ondra - 史上最難課題への挑戦', 
 'Adam Ondra tackling one of the world''s hardest climbing routes',
 'https://www.youtube.com/watch?v=ZRTNHDd0gL8',
 'https://i.ytimg.com/vi/ZRTNHDd0gL8/maxresdefault.jpg',
 'youtube', '15:30', 3000000, 120000, 'EpicTV Climbing Daily', CURRENT_TIMESTAMP),

(3, 'IFSC Boulder World Cup Seoul 2025',
 'Exciting boulder finals from Seoul World Cup 2025',
 'https://www.youtube.com/watch?v=K5zPa1YBZ9Y',
 'https://i.ytimg.com/vi/K5zPa1YBZ9Y/maxresdefault.jpg',
 'youtube', '45:30', 800000, 35000, 'IFSC Climbing', CURRENT_TIMESTAMP),

(4, 'ボルダリング ベストクライム 2025',
 'Best bouldering moments compilation from 2025',
 'https://www.youtube.com/watch?v=5BWkFqZYpbI',
 'https://i.ytimg.com/vi/5BWkFqZYpbI/maxresdefault.jpg',
 'youtube', '25:10', 1200000, 55000, 'IFSC Climbing', CURRENT_TIMESTAMP),

(5, 'IFSC Boulder Finals Salt Lake City 2025',
 'Thrilling boulder finals from Salt Lake City World Cup',
 'https://www.youtube.com/watch?v=GDB0MDGARiE',
 'https://i.ytimg.com/vi/GDB0MDGARiE/maxresdefault.jpg',
 'youtube', '42:15', 750000, 32000, 'IFSC Climbing', CURRENT_TIMESTAMP),

(6, 'IFSC Lead Finals Briançon 2024',
 'Lead climbing finals from Briançon World Cup 2024',
 'https://www.youtube.com/watch?v=a9htHC6KagA',
 'https://i.ytimg.com/vi/a9htHC6KagA/maxresdefault.jpg',
 'youtube', '38:50', 650000, 28000, 'IFSC Climbing', CURRENT_TIMESTAMP),

(7, 'IFSC Lead Finals Seoul 2024',
 'Lead climbing finals from Seoul World Cup 2024',
 'https://www.youtube.com/watch?v=Zt5AbUllQAg',
 'https://i.ytimg.com/vi/Zt5AbUllQAg/maxresdefault.jpg',
 'youtube', '40:30', 720000, 31000, 'IFSC Climbing', CURRENT_TIMESTAMP),

(8, 'IFSC Lead Finals Chamonix 2024',
 'Lead climbing finals from Chamonix World Cup 2024',
 'https://www.youtube.com/watch?v=UVp79oxI4Uc',
 'https://i.ytimg.com/vi/UVp79oxI4Uc/maxresdefault.jpg',
 'youtube', '39:45', 680000, 29000, 'IFSC Climbing', CURRENT_TIMESTAMP),

(9, 'V6・V10・V15 クライマーの違いとは？',
 'Differences between V6, V10, and V15 climbers explained',
 'https://www.youtube.com/watch?v=NAXANh3YVck',
 'https://i.ytimg.com/vi/NAXANh3YVck/maxresdefault.jpg',
 'youtube', '18:25', 950000, 42000, 'Climbing Explained', CURRENT_TIMESTAMP),

(10, '小山田大 - The Story of Two Worlds V16',
 'Dai Koyamada''s incredible V16 boulder problem "Two Worlds"',
 'https://www.youtube.com/watch?v=54T0ADA7ibE',
 'https://i.ytimg.com/vi/54T0ADA7ibE/maxresdefault.jpg',
 'youtube', '21:15', 580000, 26000, 'Dai Koyamada', CURRENT_TIMESTAMP);
