-- Insert sample users
INSERT OR IGNORE INTO users (email, username, membership_type) VALUES 
  ('demo@example.com', 'Demo User', 'free'),
  ('premium@example.com', 'Premium Member', 'premium');

-- Insert expanded sample videos (15+ videos) with media_source - REAL CLIMBING VIDEOS
INSERT OR IGNORE INTO videos (title, description, url, thumbnail_url, duration, channel_name, category, views, likes, media_source) VALUES 
  ('Lead finals | Grand Finale Fukuoka 2025', 'IFSC Climbing Nations Grand Finale in Fukuoka featuring lead climbing finals with brand-new team format.', 'https://www.youtube.com/watch?v=JWPkWeAxm-c', 'https://i.ytimg.com/vi/JWPkWeAxm-c/maxresdefault.jpg', '45:23', 'IFSC Climbing', 'competition', 35420, 0, 'youtube'),
  ('Boulder finals | Nations Grand Finale Fukuoka 2025', 'IFSC Nations Grand Finale Boulder finals showcasing top climbers in new team format competition.', 'https://www.youtube.com/watch?v=oBxtF11EuHY', 'https://i.ytimg.com/vi/oBxtF11EuHY/maxresdefault.jpg', '52:18', 'IFSC Climbing', 'competition', 42890, 0, 'youtube'),
  ('ROCKMASTER 2025 | KO BOULDER', 'Knock-out boulder competition at Climbing Stadium in Arco featuring world-class climbers in exciting format.', 'https://www.youtube.com/watch?v=FxxksZe9pQc', 'https://i.ytimg.com/vi/FxxksZe9pQc/maxresdefault.jpg', '28:45', 'Bouldering TV', 'competition', 23450, 0, 'youtube'),
  ('Women''s Boulder final | Seoul 2025', 'IFSC World Cup Seoul 2025 women''s boulder final showcasing top female climbers in thrilling competition.', 'https://www.youtube.com/watch?v=wxiMreMe-Ds', 'https://i.ytimg.com/vi/wxiMreMe-Ds/maxresdefault.jpg', '38:12', 'IFSC Climbing', 'competition', 31670, 0, 'youtube'),
  ('Men''s Boulder final | Prague 2025', 'IFSC World Cup Prague 2025 men''s boulder final with incredible performances from top athletes.', 'https://www.youtube.com/watch?v=J5QtctB5Bpg', 'https://i.ytimg.com/vi/J5QtctB5Bpg/maxresdefault.jpg', '41:22', 'IFSC Climbing', 'bouldering', 28340, 0, 'youtube'),
  ('U17 Boulder finals | Helsinki 2025', 'The 34th edition of the IFSC Youth World Championships in Helsinki featuring Boulder competition with young talents.', 'https://www.youtube.com/watch?v=BSiltlmRYfI', 'https://i.ytimg.com/vi/BSiltlmRYfI/maxresdefault.jpg', '35:47', 'IFSC Climbing', 'competition', 8120, 0, 'youtube'),
  ('Boulder Finals | 2025 North American Cup Vail', 'USA Climbing North American Cup Series 2025 Boulder finals featuring top North American climbers competing in Vail.', 'https://www.youtube.com/watch?v=IczjOZUX7uc', 'https://i.ytimg.com/vi/IczjOZUX7uc/maxresdefault.jpg', '42:15', 'USA Climbing', 'competition', 11200, 0, 'youtube'),
  ('Boulder elimination heats | Grand Finale Fukuoka 2025', 'Six of the top Climbing teams on the circuit put their skills to the test in boulder elimination format.', 'https://www.youtube.com/watch?v=s6a0AEA6K2g', 'https://i.ytimg.com/vi/s6a0AEA6K2g/maxresdefault.jpg', '33:18', 'IFSC Climbing', 'competition', 7890, 0, 'youtube'),
  ('2025 National Team Trials: Boulder Finals | USA Climbing', 'National Team Trials at Mesa Rim in Austin, TX with 117 registered athletes competing for spots on the team.', 'https://www.youtube.com/watch?v=snpvUQP3npE', 'https://i.ytimg.com/vi/snpvUQP3npE/maxresdefault.jpg', '48:33', 'USA Climbing', 'competition', 15000, 0, 'youtube'),
  ('Women''s Boulder final | Salt Lake City 2025', 'Third Boulder World Cup competition of the year in Salt Lake City, Utah featuring top female climbers.', 'https://www.youtube.com/watch?v=inbOhDT7bok', 'https://i.ytimg.com/vi/inbOhDT7bok/maxresdefault.jpg', '39:45', 'IFSC Climbing', 'competition', 22000, 0, 'youtube'),
  ('Men''s Boulder final | Keqiao 2025', 'The new four-year Olympic cycle kicks off in Keqiao, China with the first IFSC World Cup event of 2025.', 'https://www.youtube.com/watch?v=eLdRhRqQ2D0', 'https://i.ytimg.com/vi/eLdRhRqQ2D0/maxresdefault.jpg', '44:28', 'IFSC Climbing', 'bouldering', 18430, 0, 'youtube'),
  ('Lead finals | Chamonix 2025', 'IFSC Climbing World Cup Chamonix 2025 as the world''s best climbers take on Lead and Speed in the Alps.', 'https://www.youtube.com/watch?v=fJnnnymFx9Y', 'https://i.ytimg.com/vi/fJnnnymFx9Y/maxresdefault.jpg', '46:12', 'IFSC Climbing', 'competition', 16780, 0, 'youtube'),
  ('Potentially World''s Hardest Trad Route - Bon Voyage E12 (9a)', 'Influenced by Hard Grit, this is bold and committing trad climbing at its finest - attempting Bon Voyage E12.', 'https://www.youtube.com/watch?v=ji4At78H5Ys', 'https://i.ytimg.com/vi/ji4At78H5Ys/maxresdefault.jpg', '28:47', 'Adventure Climbing', 'outdoor', 24230, 0, 'youtube'),
  ('2025 Paraclimbing Finals | USA Climbing', 'The Paraclimbing National Championships return for 2025, hosted at Touchstone Pacific Pipe in Oakland, CA.', 'https://www.youtube.com/watch?v=ROqC1uwhTcM', 'https://i.ytimg.com/vi/ROqC1uwhTcM/maxresdefault.jpg', '32:22', 'USA Climbing', 'competition', 9870, 0, 'youtube'),
  ('Biggest Adventure Climb of 2024!', 'Jackie and I set off to climb Birdland (5.7+) in Red Rocks - our longest and highest rated trad multi pitch climb in 2024!', 'https://www.youtube.com/watch?v=No_ZzP8RI1U', 'https://i.ytimg.com/vi/No_ZzP8RI1U/maxresdefault.jpg', '22:15', 'Adventure Climbers', 'outdoor', 13290, 0, 'youtube');

-- Insert sample blog posts
INSERT OR IGNORE INTO blog_posts (title, content, image_url, published_date) VALUES 
  ('新規クライミングジムパートナー10社が加入！全国200箇所以上で動画撮影が可能に', 'クライミング動画共有プラットフォームとして、より多くの場所での撮影機会を提供するため、新たに10社のクライミングジムとパートナーシップを結びました。これにより全国200箇所以上のジムで自由に撮影が可能となります。パートナージムでは撮影許可が不要で、気軽に動画を投稿できます。', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400', '2025-10-25'),
  ('第1回クライミング動画コンテスト開催決定！賞金総額100万円', 'あなたの最高の瞬間を共有しよう。プロ・アマ問わず参加可能な動画コンテストを開催します。グレード別の部門制で、誰でも参加しやすい内容となっています。優勝賞金は50万円！エントリー期間は11月1日から12月31日まで。', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400', '2025-10-20'),
  ('安全な撮影のためのガイドラインを公開しました', 'クライミング中の撮影は危険を伴う場合があります。安全に配慮した撮影方法や注意点をまとめたガイドラインを作成しました。三脚の設置位置、マット配置との兼ね合い、スポッターの配置など、具体的な指針を提供します。', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', '2025-10-15'),
  ('プレミアム会員限定：AI自動グレード判定機能をリリース', 'プレミアム会員向けに、AIによる自動グレード判定機能をリリースしました。動画から課題の難易度を自動で推定し、適切なカテゴリーに分類します。精度は85%以上を達成しています。', 'https://images.unsplash.com/photo-1551135049-8a33b5883817?w=400', '2025-10-10'),
  ('クライミング動画投稿数が10,000本を突破！', 'サービス開始から1年で、投稿動画数が10,000本を突破しました。コミュニティの皆様のご協力に感謝いたします。これからも最高のクライミングプラットフォームを目指して改善を続けます。', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', '2025-10-05');

-- Insert video rankings based on internal likes only (external likes ignored)
-- Initial likes count is 0, will increase as users like videos
INSERT OR IGNORE INTO video_rankings (video_id, total_score, daily_score, weekly_score, monthly_score, yearly_score) 
SELECT 
  id,
  likes as total_score,
  CAST(likes / 365 AS INTEGER) as daily_score,
  CAST(likes / 52 AS INTEGER) as weekly_score,
  CAST(likes / 12 AS INTEGER) as monthly_score,
  likes as yearly_score
FROM videos;
