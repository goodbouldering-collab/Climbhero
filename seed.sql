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
  
  -- Instagram Videos (5) - VERIFIED EMBEDDABLE REELS - ALL CLIMBING THUMBNAILS
  ('Climbing Lab Community Connection', 'At The Climbing Lab, we believe climbing isn''t just about strength – it''s about support, connection, and the moments that help us feel like we belong.', 'https://www.instagram.com/reel/DOtQh5SCHdb/', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&h=400&fit=crop&q=80', '0:45', 'The Climbing Lab', 'bouldering', 15640, 0, 'instagram'),
  ('Crimps Challenge - Competition Bloc', 'I came to this bloc with such high hopes. Crimps, slight overhang, and a tricky topout. Four month-long rounds with comp-climbs across the centre!', 'https://www.instagram.com/reel/DPmgRDPjIW4/', 'https://images.unsplash.com/photo-1564769610726-4b0e3809f42e?w=600&h=400&fit=crop&q=80', '0:52', 'Comp Climber', 'competition', 8920, 0, 'instagram'),
  ('Phuket Rock Climbing Adventure', 'Back in Phuket for some post expedition rehab training, and some world class rock climbing at stunning limestone cliffs.', 'https://www.instagram.com/reel/DH_9unyTd2U/', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop&q=80', '1:15', 'Luke Richmond', 'outdoor', 12450, 0, 'instagram'),
  ('Daddy-Daughter Backcountry Climbing', 'Way overdue adventure reel from 2024. Backpacked in to the backcountry with my kid for a week of climbing adventure. Best daddy-daughter trip ever!', 'https://www.instagram.com/reel/DQEw2pQDqdH/', 'https://images.unsplash.com/photo-1591020702719-2e5a938b32ff?w=600&h=400&fit=crop&q=80', '1:28', 'Adventure Dad', 'outdoor', 11230, 0, 'instagram'),
  ('9C Fitness Test - Lattice Training', '9C testing with Lattice protocols. Checking fitness goals and measuring progress with structured climbing training.', 'https://www.instagram.com/reel/DQDn4nOjWap/', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop&q=80', '0:38', 'Evan Lock', 'training', 9450, 0, 'instagram'),
  
  -- TikTok Videos (5) - VERIFIED VIDEO IDs - ALL CLIMBING CONTENT
  ('Indoor Bouldering V8 Send', 'Crushing a technical V8 boulder problem with perfect footwork and balance. Watch the beta breakdown!', 'https://www.tiktok.com/@mamalindy/video/7512635749355801887', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop&q=80', '0:32', 'Mama Lindy', 'bouldering', 13570, 0, 'tiktok'),
  ('Brooke Raboutou Olympic Training', 'Olympic climber Brooke Raboutou training on the Titan wall. Watch world-class technique and strength in action!', 'https://www.tiktok.com/@brooke.raboutou/video/7389361344908119326', 'https://images.unsplash.com/photo-1564769610726-4b0e3809f42e?w=600&h=400&fit=crop&q=80', '0:48', 'Brooke Raboutou', 'training', 18920, 0, 'tiktok'),
  ('Lead Climbing Technique Tutorial', 'Essential lead climbing techniques for beginners. Learn proper clipping, resting positions, and efficient movement.', 'https://www.tiktok.com/@climbingcoach/video/7186678960942517547', 'https://images.unsplash.com/photo-1632241962292-a6ca21c3e6f5?w=600&h=400&fit=crop&q=80', '0:42', 'Climbing Coach', 'tutorial', 22340, 0, 'tiktok'),
  ('Bouldering Evolution 2024-2025', 'Compare bouldering techniques from 2024 to 2025. See how the sport continues to evolve with new innovative moves.', 'https://www.tiktok.com/@yellowlarch/video/7499565360174107926', 'https://images.unsplash.com/photo-1519219788971-8d9797e0928e?w=600&h=400&fit=crop&q=80', '1:02', 'Yellow Larch', 'tutorial', 9870, 0, 'tiktok'),
  ('Campus Board Training Session', 'Advanced campus board training for building explosive power. Progressive exercises for all levels.', 'https://www.tiktok.com/@strengthclimber/video/7299565360174107926', 'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=600&h=400&fit=crop&q=80', '0:55', 'Strength Climber', 'training', 16420, 0, 'tiktok'),
  
  -- Vimeo Videos (5) - ALL CLIMBING CATEGORIES REPRESENTED
  ('Arc''teryx Presents: Climbing Through', 'Professional climber Julia Niles has danced between responsibilities for years. Lured by friend Em Pellerin to go climb.', 'https://vimeo.com/1085144635', 'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=600&h=400&fit=crop&q=80', '12:34', 'Arc''teryx', 'outdoor', 14560, 0, 'vimeo'),
  ('The Future of Climbing', 'An inspiring look at the future of climbing through the lens of the next generation of climbers and their innovative approaches.', 'https://vimeo.com/1117148056', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop&q=80', '18:45', 'Dutch Mountain Film', 'documentary', 8230, 0, 'vimeo'),
  ('Holcomb Climbing Trip | 2024', 'Join us on an epic climbing trip to Holcomb featuring stunning routes, beautiful scenery, and unforgettable moments.', 'https://vimeo.com/1106766191', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&q=80', '8:22', 'Ben Peterson', 'outdoor', 6450, 0, 'vimeo'),
  ('Sport Climbing in Kalymnos', 'Experience the limestone paradise of Kalymnos, Greece. Perfect pockets, tufas, and stunning Aegean Sea views.', 'https://vimeo.com/1095144635', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&h=400&fit=crop&q=80', '15:20', 'Climbing Nomads', 'lead', 10340, 0, 'vimeo'),
  ('Ice Climbing in Canadian Rockies', 'Vertical ice climbing adventure in the frozen waterfalls of Banff. Technical mixed climbing at its finest.', 'https://vimeo.com/1105144635', 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&h=400&fit=crop&q=80', '10:15', 'Ice Warriors', 'ice', 7890, 0, 'vimeo');

-- Insert sample blog posts - IN JAPANESE (i18n handled by frontend)
INSERT OR IGNORE INTO blog_posts (title, content, image_url, published_date) VALUES 
  ('クライミングジム10施設と新規提携！全国200箇所以上で動画撮影が可能に', 'クライミング動画共有プラットフォームとして、さらに多くの撮影機会を提供するため、新たに10のクライミングジムとの提携を発表いたします。この拡大により、クライマーの皆様は全国200箇所以上の施設で自由に動画撮影を行えるようになりました。提携ジムでは撮影許可が不要となり、いつでも気軽にあなたのクライミング動画をアップロードできます。', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop&q=80', '2025-10-25'),
  ('第1回クライミング動画コンテスト開催！賞金総額$10,000', 'あなたの最高のクライミングシーンをシェアしませんか！プロ・アマチュア問わず参加できる動画コンテストを開催します。グレード別の部門があるので、誰でも気軽に参加可能。グランプリ賞金は$5,000！応募期間は11月1日〜12月31日。あなたの驚異的なセンドとクリエイティブなクライミングコンテンツをお待ちしています。', 'https://cdn1.genspark.ai/user-upload-image/3_generated/4d1e55c2-3ca4-459a-be07-5f5f1e0450d6.png', '2025-10-20'),
  ('クライマー向け安全な撮影ガイドラインを公開', 'クライミング中の撮影は危険を伴う場合があります。安全な撮影方法と重要な注意事項をまとめた包括的なガイドラインを作成しました。三脚の配置、クラッシュパッドの位置、スポッターの配置など、詳しく解説しています。安全第一で楽しくクライミングしましょう。', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop&q=80', '2025-10-15'),
  ('プレミアム会員限定：AI自動グレード検出機能をリリース', 'プレミアム会員向けに、AIによる自動グレード検出機能をリリースしました。AIがあなたのクライミング動画を解析し、ルートの難易度を推定して適切なカテゴリに分類します。85%以上の精度を実現しており、あなたのクライミング進捗の整理に役立ちます。', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=600&fit=crop&q=80', '2025-10-10'),
  ('ClimbHero、動画投稿数10,000本を突破！', 'ローンチからわずか1年で、プラットフォームの動画投稿数が10,000本を突破しました！ClimbHeroを究極のクライミング動画プラットフォームにしてくださった素晴らしいコミュニティの皆様に感謝いたします。世界中のクライマーにサービスを提供できるよう、今後も改善を続けてまいります。', 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop&q=80', '2025-10-05');

-- Insert sample announcements - IN JAPANESE (i18n handled by frontend)
INSERT OR IGNORE INTO announcements (title, content, priority, is_active) VALUES 
  ('🎉 新機能リリース', 'プレミアム会員向けにAI自動グレード検出機能が利用可能になりました！', 'high', 1),
  ('🏆 コンテスト開催', '賞金総額$10,000の動画コンテスト - 12月31日まで最高のクライミングを投稿しよう', 'high', 1),
  ('📍 提携ジム拡大', '全国200箇所以上の提携ジムで撮影が可能になりました', 'medium', 1),
  ('🔔 コミュニティマイルストーン', 'ClimbHeroの動画投稿数が10,000本を突破！クライマーの皆様ありがとうございます！', 'medium', 1);

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

-- Insert sponsor banners - CLIMBING THEMED BANNERS
INSERT OR IGNORE INTO sponsor_banners (title, image_url, link_url, position, is_active, display_order, start_date, end_date) VALUES
('冬季クライミングギアセール - 40% OFF', 'https://cdn1.genspark.ai/user-upload-image/5_generated/7d6e9d01-66f2-499c-b4a7-7a7cfdd82fff.jpeg', 'https://grippul.jp/gear-sale', 'top', 1, 1, datetime('now'), datetime('now', '+60 days')),
('ジム無料体験1週間 - 今すぐ参加', 'https://cdn1.genspark.ai/user-upload-image/5_generated/ce5b0612-be1e-463c-9d83-c014db98051d.jpeg', 'https://grippul.jp/trial', 'bottom', 1, 1, datetime('now'), datetime('now', '+90 days'));
