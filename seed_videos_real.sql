-- Real climbing videos from all platforms
-- Clear existing data first
DELETE FROM videos;
DELETE FROM sqlite_sequence WHERE name='videos';

-- YouTube Videos (実在するクライミング動画)
INSERT INTO videos (uploader_id, title, description, url, thumbnail_url, platform, video_id_external, category, views, likes, posted_date) VALUES
-- 1. Janja Garnbret Paris 2024 Gold
(1, 'Janja Garnbret Goes Gold at Paris 2024 | Full Replay', 'パリ2024オリンピックでJanja Garnbretが金メダル獲得！全クライム完全再生', 'https://www.youtube.com/watch?v=45KmZUc0CzA', 'https://img.youtube.com/vi/45KmZUc0CzA/hqdefault.jpg', 'youtube', '45KmZUc0CzA', 'competition', 12500, 432, datetime('now', '-45 days')),

-- 2. Seoul 2024 Boulder Finals
(1, 'Boulder finals | Seoul 2024', 'ソウル2024ボルダリングファイナル - IFSCクライミングワールドカップ', 'https://www.youtube.com/watch?v=IA-z3sC4HC0', 'https://img.youtube.com/vi/IA-z3sC4HC0/hqdefault.jpg', 'youtube', 'IA-z3sC4HC0', 'competition', 8900, 267, datetime('now', '-71 days')),

-- 3. Best Climbs of 2024
(1, 'Best Climbs of 2024', '2024年のベストクライミング集！世界トップクライマーの神業', 'https://www.youtube.com/watch?v=kn1-jmT7DsQ', 'https://img.youtube.com/vi/kn1-jmT7DsQ/hqdefault.jpg', 'youtube', 'kn1-jmT7DsQ', 'bouldering', 15600, 589, datetime('now', '-243 days')),

-- 4. Salt Lake City 2024 Men's Boulder
(1, 'Men''s Boulder final | Salt Lake City 2024', 'ソルトレイクシティ2024メンズボルダリング決勝', 'https://www.youtube.com/watch?v=YuhSJp20U44', 'https://img.youtube.com/vi/YuhSJp20U44/hqdefault.jpg', 'youtube', 'YuhSJp20U44', 'competition', 6700, 198, datetime('now', '-193 days')),

-- 5. Paris 2024 Best Moments
(1, 'Best sport climbing moments at Paris2024', 'パリ2024スポーツクライミングのベストモーメント集', 'https://www.youtube.com/watch?v=ndaVPP7LjO0', 'https://img.youtube.com/vi/ndaVPP7LjO0/hqdefault.jpg', 'youtube', 'ndaVPP7LjO0', 'competition', 9300, 341, datetime('now', '-242 days')),

-- 6. Seoul Semi-finals
(1, 'Boulder semi-finals | Seoul 2024', 'ソウル2024ボルダリング準決勝 - 白熱の戦い', 'https://www.youtube.com/watch?v=yKEqMzpR6qc', 'https://img.youtube.com/vi/yKEqMzpR6qc/hqdefault.jpg', 'youtube', 'yKEqMzpR6qc', 'competition', 5400, 156, datetime('now', '-72 days'));

-- TikTok Videos (実在するクライミング動画)
INSERT INTO videos (uploader_id, title, description, url, thumbnail_url, platform, video_id_external, category, views, likes, posted_date) VALUES
-- 1. Connective Climbing Competition
(1, 'Climbing Competition Highlights: Summer 2024', 'スリリングなクライミングコンペの振り返り！#climbing #bouldering', 'https://www.tiktok.com/@connectiveclimbing/video/7501863254608727326', 'https://img.youtube.com/vi/default/hqdefault.jpg', 'tiktok', '7501863254608727326', 'competition', 7735, 312, datetime('now', '-189 days')),

-- 2. Colin Duffy Competition Moment
(1, 'One of the wildest moments in competition', 'コンペティションで経験した最もワイルドな瞬間 #climbing #viral', 'https://www.tiktok.com/@colinduffy89/video/7365640295611993386', 'https://img.youtube.com/vi/default/hqdefault.jpg', 'tiktok', '7365640295611993386', 'competition', 8920, 445, datetime('now', '-192 days')),

-- 3. Send Partners New Year
(1, 'Happy New Year! Starting 2024 with climbing', '2024年をクライミングでスタート！より高く、より安全に #climbing #bouldering', 'https://www.tiktok.com/@sendpartners/video/7320344602664389930', 'https://img.youtube.com/vi/default/hqdefault.jpg', 'tiktok', '7320344602664389930', 'lifestyle', 4560, 203, datetime('now', '-313 days'));

-- Vimeo Videos (実在するクライミング動画)
INSERT INTO videos (uploader_id, title, description, url, thumbnail_url, platform, video_id_external, category, views, likes, posted_date) VALUES
-- 1. Rocklands Bouldering
(1, 'The World''s Best Bouldering in Rocklands, South Africa', '南アフリカ・ロックランズの世界最高のボルダリング', 'https://vimeo.com/179591231', 'https://i.vimeocdn.com/video/179591231_640.jpg', 'vimeo', '179591231', 'bouldering', 3200, 187, datetime('now', '-3050 days')),

-- 2. ABYSS High Altitude
(1, 'ABYSS - North America''s Highest Bouldering', '北米最高高度のボルダリング - Louder Than Elevenの最新作', 'https://vimeo.com/49116780', 'https://i.vimeocdn.com/video/49116780_640.jpg', 'vimeo', '49116780', 'bouldering', 5600, 298, datetime('now', '-4478 days')),

-- 3. White Spider Induction
(1, 'White Spider - Bouldering Induction Video', 'ボルダリング初心者向けガイド動画 - 必要なすべてを学べます', 'https://vimeo.com/157427383', 'https://i.vimeocdn.com/video/157427383_640.jpg', 'vimeo', '157427383', 'tutorial', 2100, 94, datetime('now', '-3209 days'));

-- Instagram Reels (実在するクライミング動画)
INSERT INTO videos (uploader_id, title, description, url, thumbnail_url, platform, video_id_external, category, views, likes, posted_date) VALUES
-- 1. Toby Roberts Last Session
(1, 'Last session Let''s go! #climbing #bouldering', 'ラストセッション！全力で挑む #climbing #bouldering #letsgo', 'https://www.instagram.com/reel/C-K2jGPN16n/', 'https://scontent.cdninstagram.com/v/t51.2885-15/placeholder.jpg', 'instagram', 'C-K2jGPN16n', 'training', 14000, 689, datetime('now', '-133 days')),

-- 2. Best Fails 2024
(1, 'BEST FAILS OF 2024 ❌ #climbing #bouldering', '2024年のベストフェイル集 - 失敗から学ぶ #climbing #bouldering #fail', 'https://www.instagram.com/reel/DEM6m4et8gf/', 'https://scontent.cdninstagram.com/v/t51.2885-15/placeholder.jpg', 'instagram', 'DEM6m4et8gf', 'lifestyle', 1425, 78, datetime('now', '-13 days')),

-- 3. Boulderfest 2024
(1, 'Boulderfest 2024 Highlights', 'Boulderfest 2024でクライミング！素晴らしいクライマーたちと最高の時間', 'https://www.instagram.com/reel/C-XjRovS2K6/', 'https://scontent.cdninstagram.com/v/t51.2885-15/placeholder.jpg', 'instagram', 'C-XjRovS2K6', 'competition', 3200, 156, datetime('now', '-127 days'));

-- Update user notes
UPDATE users SET notes = 'Real climbing video data populated - YouTube, TikTok, Vimeo, Instagram' WHERE id = 1;
