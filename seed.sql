-- Insert sample users
INSERT OR IGNORE INTO users (email, username, membership_type) VALUES 
  ('demo@example.com', 'Demo User', 'free'),
  ('premium@example.com', 'Premium Member', 'premium');

-- Insert sample videos
INSERT OR IGNORE INTO videos (title, description, url, thumbnail_url, duration, channel_name, category, views, likes) VALUES 
  ('小川山 - 最高グレードのボルダリングに挑戦', '小川山エリアでの高難度ボルダリングチャレンジ。V15グレードの岩に挑む様子を記録。', 'https://youtube.com/watch?v=sample1', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400', '12:45', 'Japan Climbing', 'bouldering', 1250, 89),
  ('IFSC World Cup 2025 - 決勝戦ハイライト', 'IFSCワールドカップ2025の決勝戦ハイライト。世界トップクライマーたちの戦い。', 'https://youtube.com/watch?v=sample2', 'https://images.unsplash.com/photo-1564769610726-4b0e3809f42e?w=400', '08:32', 'IFSC Official', 'competition', 8920, 342),
  ('ボルダリング初心者講座 - 基本的なムーブ解説', 'ボルダリング初心者向けの基本ムーブ解説動画。フットワーク、ボディポジション、手順などを詳しく説明。', 'https://youtube.com/watch?v=sample3', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400', '15:20', 'Climbing Academy', 'tutorial', 3450, 156),
  ('スポーツクライミング日本選手権 2025 - 女子決勝', '日本選手権2025女子決勝の模様。トップ選手たちの華麗なムーブに注目。', 'https://youtube.com/watch?v=sample4', 'https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?w=400', '05:45', 'JMA Climbing', 'competition', 5670, 234),
  ('御岳エリア - 新規ボルダー課題開拓', '御岳エリアでの新規ボルダー課題の開拓記録。未登の岩に初挑戦。', 'https://youtube.com/watch?v=sample5', 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400', '22:10', 'Tokyo Bouldering', 'bouldering', 2340, 98),
  ('クライミングジム巡り - 東京最新ジム紹介', '東京都内の最新クライミングジムを巡るシリーズ。設備やコース設定を詳しく紹介。', 'https://youtube.com/watch?v=sample6', 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?w=400', '10:32', 'Gym Hunter', 'gym_review', 4120, 187);

-- Insert sample blog posts
INSERT OR IGNORE INTO blog_posts (title, content, image_url, published_date) VALUES 
  ('新規クライミングジムパートナー10社が加入！全国200箇所以上で動画撮影が可能に', 'クライミング動画共有プラットフォームとして、より多くの場所での撮影機会を提供するため、新たに10社のクライミングジムとパートナーシップを結びました。これにより全国200箇所以上のジムで自由に撮影が可能となります。', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400', '2025-06-10'),
  ('第1回クライミング動画コンテスト開催決定！賞金総額100万円', 'あなたの最高の瞬間を共有しよう。プロ・アマ問わず参加可能な動画コンテストを開催します。グレード別の部門制で、誰でも参加しやすい内容となっています。優勝賞金は50万円！', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400', '2025-06-08'),
  ('安全な撮影のためのガイドラインを公開しました', 'クライミング中の撮影は危険を伴う場合があります。安全に配慮した撮影方法や注意点をまとめたガイドラインを作成しました。三脚の設置位置、マット配置との兼ね合い、スポッターの配置など、具体的な指針を提供します。', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', '2025-06-05');
