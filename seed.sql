-- Insert sample users
INSERT OR IGNORE INTO users (email, username, membership_type) VALUES 
  ('demo@example.com', 'Demo User', 'free'),
  ('premium@example.com', 'Premium Member', 'premium');

-- Insert expanded sample videos (15+ videos)
INSERT OR IGNORE INTO videos (title, description, url, thumbnail_url, duration, channel_name, category, views, likes) VALUES 
  ('小川山 - 最高グレードV15ボルダリング完登', '小川山エリアでの高難度ボルダリングチャレンジ。V15グレードの岩に挑む様子を記録。', 'https://youtube.com/watch?v=sample1', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400', '12:45', 'Japan Climbing', 'bouldering', 12500, 890),
  ('IFSC World Cup 2025 決勝戦ハイライト', 'IFSCワールドカップ2025の決勝戦ハイライト。世界トップクライマーたちの激しい戦い。', 'https://youtube.com/watch?v=sample2', 'https://images.unsplash.com/photo-1564769610726-4b0e3809f42e?w=400', '08:32', 'IFSC Official', 'competition', 28920, 1342),
  ('ボルダリング初心者講座 - 基本ムーブ完全解説', 'ボルダリング初心者向けの基本ムーブ解説動画。フットワーク、ボディポジション、手順などを詳しく説明。', 'https://youtube.com/watch?v=sample3', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400', '15:20', 'Climbing Academy', 'tutorial', 13450, 756),
  ('スポーツクライミング日本選手権2025 女子決勝', '日本選手権2025女子決勝の模様。トップ選手たちの華麗なムーブに注目。', 'https://youtube.com/watch?v=sample4', 'https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?w=400', '05:45', 'JMA Climbing', 'competition', 15670, 834),
  ('御岳エリア - 新規V13ボルダー課題初登', '御岳エリアでの新規ボルダー課題の開拓記録。未登のV13課題に初挑戦。', 'https://youtube.com/watch?v=sample5', 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400', '22:10', 'Tokyo Bouldering', 'bouldering', 9340, 498),
  ('クライミングジム巡り - 東京最新ジム紹介', '東京都内の最新クライミングジムを巡るシリーズ。設備やコース設定を詳しく紹介。', 'https://youtube.com/watch?v=sample6', 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?w=400', '10:32', 'Gym Hunter', 'gym_review', 8120, 387),
  ('瑞牆山 - 伝説の課題「十一面観音」挑戦記', '瑞牆山の有名な課題「十一面観音」（V14）に挑戦。クラシック課題の魅力を紹介。', 'https://youtube.com/watch?v=sample7', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400', '18:23', 'Rock & Soul', 'bouldering', 11200, 623),
  ('リードクライミング テクニック講座 Part1', 'リードクライミングの基本テクニックを解説。クリップのタイミング、ルートファインディングなど。', 'https://youtube.com/watch?v=sample8', 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400', '13:15', 'Lead Masters', 'tutorial', 7890, 412),
  ('世界最強クライマーVS超難関課題', '世界トップクラスのクライマーが挑む、V16グレードの超難関課題。圧倒的なパワーとテクニック。', 'https://youtube.com/watch?v=sample9', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400', '25:40', 'Elite Climbing', 'bouldering', 45000, 2340),
  ('オリンピック金メダリストの練習風景', '東京オリンピック金メダリストの日常トレーニング。強さの秘密に迫る。', 'https://youtube.com/watch?v=sample10', 'https://images.unsplash.com/photo-1564769610726-4b0e3809f42e?w=400', '14:28', 'Olympic Channel', 'competition', 32000, 1890),
  ('ボルダリングジム開設マニュアル', 'ボルダリングジムを開業したい方向けの完全ガイド。必要な設備、資金、ノウハウを解説。', 'https://youtube.com/watch?v=sample11', 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?w=400', '32:10', 'Gym Business Pro', 'gym_review', 5430, 276),
  ('城ヶ崎海岸 - シーサイドクライミング特集', '静岡県・城ヶ崎海岸での海沿いクライミング。絶景と共に楽しむ岩登り。', 'https://youtube.com/watch?v=sample12', 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400', '16:45', 'Seaside Climbers', 'bouldering', 6780, 345),
  ('アジアユース選手権2025 ハイライト', 'アジアユース選手権の熱戦。未来のスター選手たちの活躍。', 'https://youtube.com/watch?v=sample13', 'https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?w=400', '09:12', 'Asia Climbing', 'competition', 4230, 189),
  ('トレーニング完全ガイド - 筋力アップ編', 'クライミングに必要な筋力をつけるためのトレーニング方法を詳しく解説。', 'https://youtube.com/watch?v=sample14', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400', '20:33', 'Strength Lab', 'tutorial', 9870, 567),
  ('グッぼるジム完全ガイド - 設備＆課題紹介', '滋賀県・グッぼるボルダリングCafe&Shopの魅力を徹底紹介。充実の設備と多彩な課題。', 'https://youtube.com/watch?v=sample15', 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?w=400', '11:50', 'Gubboru Official', 'gym_review', 3290, 198);

-- Insert sample blog posts
INSERT OR IGNORE INTO blog_posts (title, content, image_url, published_date) VALUES 
  ('新規クライミングジムパートナー10社が加入！全国200箇所以上で動画撮影が可能に', 'クライミング動画共有プラットフォームとして、より多くの場所での撮影機会を提供するため、新たに10社のクライミングジムとパートナーシップを結びました。これにより全国200箇所以上のジムで自由に撮影が可能となります。パートナージムでは撮影許可が不要で、気軽に動画を投稿できます。', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400', '2025-10-25'),
  ('第1回クライミング動画コンテスト開催決定！賞金総額100万円', 'あなたの最高の瞬間を共有しよう。プロ・アマ問わず参加可能な動画コンテストを開催します。グレード別の部門制で、誰でも参加しやすい内容となっています。優勝賞金は50万円！エントリー期間は11月1日から12月31日まで。', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400', '2025-10-20'),
  ('安全な撮影のためのガイドラインを公開しました', 'クライミング中の撮影は危険を伴う場合があります。安全に配慮した撮影方法や注意点をまとめたガイドラインを作成しました。三脚の設置位置、マット配置との兼ね合い、スポッターの配置など、具体的な指針を提供します。', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', '2025-10-15'),
  ('プレミアム会員限定：AI自動グレード判定機能をリリース', 'プレミアム会員向けに、AIによる自動グレード判定機能をリリースしました。動画から課題の難易度を自動で推定し、適切なカテゴリーに分類します。精度は85%以上を達成しています。', 'https://images.unsplash.com/photo-1551135049-8a33b5883817?w=400', '2025-10-10'),
  ('クライミング動画投稿数が10,000本を突破！', 'サービス開始から1年で、投稿動画数が10,000本を突破しました。コミュニティの皆様のご協力に感謝いたします。これからも最高のクライミングプラットフォームを目指して改善を続けます。', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', '2025-10-05');
