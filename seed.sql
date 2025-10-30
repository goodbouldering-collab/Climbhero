-- Insert sample users
INSERT OR IGNORE INTO users (email, username, membership_type) VALUES 
  ('demo@example.com', 'Demo User', 'free'),
  ('premium@example.com', 'Premium Member', 'premium');

-- Insert expanded sample videos (20+ videos) with MULTIPLE MEDIA SOURCES - REAL CLIMBING VIDEOS
INSERT OR IGNORE INTO videos (title, description, url, thumbnail_url, duration, channel_name, category, views, likes, media_source) VALUES 
  -- YouTube Videos (8)
  ('Lead finals | Grand Finale Fukuoka 2025', 'IFSC Climbing Nations Grand Finale in Fukuoka featuring lead climbing finals with brand-new team format.', 'https://www.youtube.com/watch?v=JWPkWeAxm-c', 'https://i.ytimg.com/vi/JWPkWeAxm-c/maxresdefault.jpg', '45:23', 'IFSC Climbing', 'competition', 35420, 0, 'youtube'),
  ('Boulder finals | Nations Grand Finale Fukuoka 2025', 'IFSC Nations Grand Finale Boulder finals showcasing top climbers in new team format competition.', 'https://www.youtube.com/watch?v=oBxtF11EuHY', 'https://i.ytimg.com/vi/oBxtF11EuHY/maxresdefault.jpg', '52:18', 'IFSC Climbing', 'competition', 42890, 0, 'youtube'),
  ('ROCKMASTER 2025 | KO BOULDER', 'Knock-out boulder competition at Climbing Stadium in Arco featuring world-class climbers in exciting format.', 'https://www.youtube.com/watch?v=FxxksZe9pQc', 'https://i.ytimg.com/vi/FxxksZe9pQc/maxresdefault.jpg', '28:45', 'Bouldering TV', 'competition', 23450, 0, 'youtube'),
  ('Women''s Boulder final | Seoul 2025', 'IFSC World Cup Seoul 2025 women''s boulder final showcasing top female climbers in thrilling competition.', 'https://www.youtube.com/watch?v=wxiMreMe-Ds', 'https://i.ytimg.com/vi/wxiMreMe-Ds/maxresdefault.jpg', '38:12', 'IFSC Climbing', 'competition', 31670, 0, 'youtube'),
  ('Men''s Boulder final | Prague 2025', 'IFSC World Cup Prague 2025 men''s boulder final with incredible performances from top athletes.', 'https://www.youtube.com/watch?v=J5QtctB5Bpg', 'https://i.ytimg.com/vi/J5QtctB5Bpg/maxresdefault.jpg', '41:22', 'IFSC Climbing', 'bouldering', 28340, 0, 'youtube'),
  ('U17 Boulder finals | Helsinki 2025', 'The 34th edition of the IFSC Youth World Championships in Helsinki featuring Boulder competition with young talents.', 'https://www.youtube.com/watch?v=BSiltlmRYfI', 'https://i.ytimg.com/vi/BSiltlmRYfI/maxresdefault.jpg', '35:47', 'IFSC Climbing', 'competition', 8120, 0, 'youtube'),
  ('Potentially World''s Hardest Trad Route - Bon Voyage E12', 'Influenced by Hard Grit, this is bold and committing trad climbing at its finest - attempting Bon Voyage E12.', 'https://www.youtube.com/watch?v=ji4At78H5Ys', 'https://i.ytimg.com/vi/ji4At78H5Ys/maxresdefault.jpg', '28:47', 'Adventure Climbing', 'outdoor', 24230, 0, 'youtube'),
  ('Biggest Adventure Climb of 2024!', 'Jackie and I set off to climb Birdland (5.7+) in Red Rocks - our longest and highest rated trad multi pitch climb in 2024!', 'https://www.youtube.com/watch?v=No_ZzP8RI1U', 'https://i.ytimg.com/vi/No_ZzP8RI1U/maxresdefault.jpg', '22:15', 'Adventure Climbers', 'outdoor', 13290, 0, 'youtube'),
  
  -- Instagram Videos (5)
  ('Climbing in the Moment: Bouldering in Rocklands', 'Petra was dominating world stages and still is on top level in outdoor climbing at the legendary Rocklands bouldering area.', 'https://www.instagram.com/reel/DM-voQztdOR/', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600', '0:58', 'Professional Climber', 'bouldering', 15640, 0, 'instagram'),
  ('Matt''s Roof Sit V10/11 - Little Cottonwood Canyon', 'Get an inside look at Matt''s Roof Sit V10/11 bouldering adventure with friends Alex Johnson and Ally Dorey.', 'https://www.instagram.com/reel/DOeTeqRktJ9/', 'https://images.unsplash.com/photo-1564769610726-4b0e3809f42e?w=600', '1:23', 'Melina Costanza', 'bouldering', 8920, 0, 'instagram'),
  ('Super Slap V8 - Mont-wright', 'Super Slap, V8 (hard), Mont-wright climb. OMG I had such a hard time with this powerful problem!', 'https://www.instagram.com/reel/DPtnQhNDkCZ/', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600', '0:45', 'Jean Mich', 'bouldering', 6780, 0, 'instagram'),
  ('Best MoonBoard Climbs 2024', 'New video live on the Moon Climbing YouTube channel showcasing the Best MoonBoard climbs of 2024.', 'https://www.instagram.com/reel/DNqWUBsoKoI/', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600', '1:12', 'Moon Climbing', 'training', 11230, 0, 'instagram'),
  ('European Boulder Championship Highlights', 'European Boulder Championship 4th place finish - incredible performance and powerful moves throughout the competition.', 'https://www.instagram.com/reel/DPQjaacCEn9/', 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600', '1:05', 'Ram Levin', 'competition', 9450, 0, 'instagram'),
  
  -- TikTok Videos (4)
  ('Climbing Dance Trend 2025', 'Discover the latest climbing dance trend for 2025 with this fun and creative bouldering challenge going viral!', 'https://www.tiktok.com/@mamalindy/video/7512635749355801887', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600', '0:32', 'Lindy and Jlo', 'tutorial', 13570, 0, 'tiktok'),
  ('Olympic Titan Wall Practice - Brooke Raboutou', 'Watch as Brooke Raboutou practices on the Olympic Titan wall for the upcoming competition season.', 'https://www.tiktok.com/@brooke.raboutou/video/7389361344908119326', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600', '0:48', 'Brooke Raboutou', 'training', 18920, 0, 'tiktok'),
  ('V2 to V5: 3 Game-Changing Moves', 'Climbing from V2 to V5 wasn''t easy, but these 3 moves made all the difference! Heel hooks, flagging, and drop knees.', 'https://www.tiktok.com/tag/climbing', 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600', '0:55', 'Climbing Tips', 'tutorial', 22340, 0, 'tiktok'),
  ('Bouldering 2024 vs 2025 Comparison', 'Explore the evolution of bouldering techniques in our latest video, comparing trends from 2024 and 2025.', 'https://www.tiktok.com/@yellowlarch/video/7499565360174107926', 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?w=600', '1:02', 'Yellow Larch', 'tutorial', 9870, 0, 'tiktok'),
  
  -- Vimeo Videos (3)
  ('Arc''teryx Presents: Climbing Through', 'Professional climber Julia Niles has danced between responsibilities for years. Lured by friend Em Pellerin to go climb.', 'https://vimeo.com/1085144635', 'https://images.unsplash.com/photo-1551135049-8a33b5883817?w=600', '12:34', 'Arc''teryx', 'outdoor', 14560, 0, 'vimeo'),
  ('The Future of Climbing', 'An inspiring look at the future of climbing through the lens of the next generation of climbers and their innovative approaches.', 'https://vimeo.com/1117148056', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600', '18:45', 'Dutch Mountain Film', 'documentary', 8230, 0, 'vimeo'),
  ('Holcomb Climbing Trip | 2024', 'Join us on an epic climbing trip to Holcomb featuring stunning routes, beautiful scenery, and unforgettable moments.', 'https://vimeo.com/1106766191', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600', '8:22', 'Ben Peterson', 'outdoor', 6450, 0, 'vimeo');

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
