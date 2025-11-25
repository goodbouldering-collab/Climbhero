-- Add climber testimonials table for famous climbers' comments
-- Supporting multilingual content for international climbers

CREATE TABLE IF NOT EXISTS climber_testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Climber Information
  climber_name_ja TEXT NOT NULL,
  climber_name_en TEXT NOT NULL,
  climber_name_zh TEXT,
  climber_name_ko TEXT,
  
  -- Title/Credentials (e.g., "プロクライマー", "V15 Climber", "World Cup Champion")
  title_ja TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_zh TEXT,
  title_ko TEXT,
  
  -- Testimonial Comment
  comment_ja TEXT NOT NULL,
  comment_en TEXT NOT NULL,
  comment_zh TEXT,
  comment_ko TEXT,
  
  -- Profile Image URL
  avatar_url TEXT,
  
  -- Social Media Links (optional)
  instagram_url TEXT,
  youtube_url TEXT,
  website_url TEXT,
  
  -- Display Settings
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for active testimonials ordered by display_order
CREATE INDEX IF NOT EXISTS idx_testimonials_active_order 
  ON climber_testimonials(is_active, display_order);

-- Insert sample testimonials for testing
INSERT INTO climber_testimonials (
  climber_name_ja, climber_name_en, climber_name_zh, climber_name_ko,
  title_ja, title_en, title_zh, title_ko,
  comment_ja, comment_en, comment_zh, comment_ko,
  avatar_url,
  instagram_url,
  display_order,
  is_active
) VALUES 
(
  '山田 太郎', 'Taro Yamada', '山田太郎', '야마다 타로',
  'プロクライマー / V15', 'Professional Climber / V15', '职业攀岩者 / V15', '프로 클라이머 / V15',
  'RemakeClimberは革新的なプラットフォームです。世界中のクライマーが集まり、技術を共有できる最高の場所だと思います。動画のクオリティも素晴らしく、初心者からプロまで学べるコンテンツが豊富です。',
  'RemakeClimber is an innovative platform. It''s the best place for climbers worldwide to gather and share techniques. The video quality is excellent, with rich content for beginners to professionals.',
  'RemakeClimber是一个创新的平台。这是全球攀岩者聚集和分享技术的最佳场所。视频质量出色，从初学者到专业人士都能学到丰富的内容。',
  'RemakeClimber는 혁신적인 플랫폼입니다. 전 세계 클라이머들이 모여 기술을 공유할 수 있는 최고의 장소라고 생각합니다. 영상 품질도 훌륭하고 초보자부터 프로까지 배울 수 있는 콘텐츠가 풍부합니다.',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
  'https://instagram.com/sample',
  1,
  1
),
(
  '佐藤 花子', 'Hanako Sato', '佐藤花子', '사토 하나코',
  'ワールドカップ優勝者', 'World Cup Champion', '世界杯冠军', '월드컵 챔피언',
  'このコミュニティは本当に温かく、互いに高め合える環境が整っています。ランキング機能により、モチベーションも維持しやすく、毎日トレーニングを続けられています。',
  'This community is truly warm, with an environment where we can elevate each other. The ranking feature helps maintain motivation, and I can continue training every day.',
  '这个社区真的很温暖，有一个可以互相提高的环境。排名功能有助于保持动力，我可以每天继续训练。',
  '이 커뮤니티는 정말 따뜻하고 서로 높여갈 수 있는 환경이 갖춰져 있습니다. 랭킹 기능으로 동기부여도 유지하기 쉽고 매일 트레이닝을 계속할 수 있습니다.',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://instagram.com/sample2',
  2,
  1
),
(
  '鈴木 健', 'Ken Suzuki', '铃木健', '스즈키 켄',
  'ボルダリングジムオーナー', 'Bouldering Gym Owner', '抱石馆老板', '볼더링 짐 오너',
  'RemakeClimberのおかげで、当ジムの会員さんも大きく成長しました。プラットフォーム上で世界中のテクニックを学べることで、地方にいながら最先端の情報にアクセスできています。',
  'Thanks to RemakeClimber, our gym members have grown significantly. By learning techniques from around the world on the platform, they can access cutting-edge information even from rural areas.',
  '多亏了RemakeClimber，我们健身房的会员显著增长。通过在平台上学习来自世界各地的技术，即使在农村地区也能获得最前沿的信息。',
  'RemakeClimber 덕분에 우리 짐의 회원들도 크게 성장했습니다. 플랫폼에서 전 세계 테크닉을 배울 수 있어서 지방에 있으면서도 최첨단 정보에 접근할 수 있습니다.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  NULL,
  3,
  1
);
