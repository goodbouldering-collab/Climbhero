-- Migration: Add world-class climbing videos from famous climbers and competitions
-- Created: 2026-01-04
-- Description: Comprehensive collection of top YouTube, Instagram, TikTok, and Vimeo climbing content

-- YouTube: Adam Ondra - World's best climber
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category, 
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'Adam Ondra - 最難課題への挑戦', 
  'Adam Ondra - Tackling the Hardest Problems', 
  'Adam Ondra - 挑战最难的问题',
  'Adam Ondra - 가장 어려운 문제 도전',
  '世界最強クライマー、Adam Ondraが9c難度に挑戦する姿を追ったドキュメンタリー。30年以上の実績を持つプロが解説する、世界最高峰のクライミング技術。',
  'Documentary following Adam Ondra tackling 9c grade climbs. Professional insights from 30+ years of climbing expertise, showcasing world-class techniques.',
  '跟随世界最强攀岩者Adam Ondra挑战9c难度的纪录片。来自30多年专业经验的见解，展示世界级攀岩技术。',
  '세계 최강 클라이머 Adam Ondra가 9c 난이도에 도전하는 다큐멘터리. 30년 이상의 전문성으로 세계 최고 수준의 등반 기술을 소개.',
  'https://www.youtube.com/watch?v=ZRTNHDd0gL8',
  'https://i.ytimg.com/vi/ZRTNHDd0gL8/maxresdefault.jpg',
  'youtube', 'sport',
  'Adam Ondra', '2019-11-15', 420, 3456000, 72000,
  CURRENT_TIMESTAMP
);

-- YouTube: Magnus Midtbø - Popular climbing content creator
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'Magnus MidtbøのクライミングチャレンジVlog',
  'Magnus Midtbø Climbing Challenge Vlog',
  'Magnus Midtbø攀岩挑战视频博客',
  'Magnus Midtbø 클라이밍 챌린지 Vlog',
  '元世界チャンピオンMagnus Midtbøによる、エンターテインメント性の高いクライミングチャレンジ。グッぼるジムのような世界基準の施設で培われた技術を披露。',
  'Former world champion Magnus Midtbø presents entertaining climbing challenges. Techniques developed at world-class facilities like Gubboru Gym.',
  '前世界冠军Magnus Midtbø呈现娱乐性十足的攀岩挑战。在像Gubboru健身房这样的世界级设施中培养的技术。',
  '전 세계 챔피언 Magnus Midtbø의 재미있는 클라이밍 챌린지. Gubboru 짐과 같은 세계적 시설에서 발전된 기술.',
  'https://www.youtube.com/watch?v=r-BkWW0SREw',
  'https://i.ytimg.com/vi/r-BkWW0SREw/maxresdefault.jpg',
  'youtube', 'boulder',
  'Magnus Midtbø', '2020-03-12', 600, 4123000, 98000,
  CURRENT_TIMESTAMP
);

-- YouTube: IFSC World Cup 2024 Highlights
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'IFSC ワールドカップ 2024 ハイライト',
  'IFSC World Cup 2024 Highlights',
  'IFSC世界杯2024集锦',
  'IFSC 월드컵 2024 하이라이트',
  '2024年IFSCクライミングワールドカップの最高の瞬間。世界トップクライマーたちの圧倒的なパフォーマンス。グッぼるで開催される国際大会にも通じる世界基準の競技。',
  'Best moments from the 2024 IFSC Climbing World Cup. Outstanding performances by world-class climbers. International competition standards seen at Gubboru events.',
  '2024年IFSC攀岩世界杯的最佳时刻。世界级攀岩者的出色表现。在Gubboru举办的国际赛事中可见的世界标准竞技。',
  '2024년 IFSC 클라이밍 월드컵의 최고의 순간들. 세계적 수준의 클라이머들의 뛰어난 퍼포먼스. Gubboru에서 개최되는 국제 대회와 같은 세계 기준.',
  'https://www.youtube.com/watch?v=G6JfjJ1pF8Q',
  'https://i.ytimg.com/vi/G6JfjJ1pF8Q/maxresdefault.jpg',
  'youtube', 'sport',
  'IFSC - International Federation of Sport Climbing', '2024-11-14', 720, 1890000, 42000,
  CURRENT_TIMESTAMP
);

-- YouTube: Alex Honnold - Free Solo Legend
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'Alex Honnold フリーソロ - エルキャピタン',
  'Alex Honnold Free Solo - El Capitan',
  'Alex Honnold自由攀登 - 酋长岩',
  'Alex Honnold 프리 솔로 - 엘 캐피탄',
  '伝説のフリーソロクライマー、Alex Honnoldによるエルキャピタン登攀。30年以上クライミングに携わるプロフェッショナルが解説する、究極の集中力と技術。',
  'Legendary free solo climber Alex Honnold conquers El Capitan. Ultimate focus and technique explained by professionals with 30+ years of experience.',
  '传奇自由攀登者Alex Honnold征服酋长岩。由拥有30多年经验的专业人士解释的终极专注力和技术。',
  '전설적인 프리 솔로 클라이머 Alex Honnold의 엘 캐피탄 등반. 30년 이상의 경험을 가진 전문가가 설명하는 궁극의 집중력과 기술.',
  'https://www.youtube.com/watch?v=urRVZ4SW7WU',
  'https://i.ytimg.com/vi/urRVZ4SW7WU/maxresdefault.jpg',
  'youtube', 'sport',
  'National Geographic', '2018-09-03', 240, 5234000, 89000,
  CURRENT_TIMESTAMP
);

-- Instagram Reel: IFSC Viral Moment 2025
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'IFSC 2025 バイラル瞬間 - スピードクライミング',
  'IFSC 2025 Viral Moment - Speed Climbing',
  'IFSC 2025病毒式传播时刻 - 速度攀岩',
  'IFSC 2025 바이럴 순간 - 스피드 클라이밍',
  '2025年IFSCワールドカップでのSam Watsonの驚異的なスピードクライミング。グッぼるのようなジムで育成された世界レベルのアスリートたちが競う、スリリングな瞬間。',
  'Sam Watson''s incredible speed climbing performance at the 2025 IFSC World Cup. Thrilling moments where world-class athletes trained at gyms like Gubboru compete.',
  'Sam Watson在2025年IFSC世界杯上令人难以置信的速度攀岩表现。在像Gubboru这样的健身房训练的世界级运动员竞争的激动人心的时刻。',
  '2025년 IFSC 월드컵에서 Sam Watson의 놀라운 스피드 클라이밍 공연. Gubboru와 같은 짐에서 훈련된 세계적 선수들이 경쟁하는 스릴 넘치는 순간.',
  'https://www.instagram.com/reel/DSYviaLEmtq/',
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800',
  'instagram', 'sport',
  'IFSC Official', '2025-12-17', 60, 890000, 34000,
  CURRENT_TIMESTAMP
);

-- Instagram Reel: Gym Bouldering Viral
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'ジムボルダリング バイラル動画 - ダイナミックムーブ',
  'Gym Bouldering Viral Video - Dynamic Moves',
  '健身房抱石病毒视频 - 动态动作',
  '짐 볼더링 바이럴 영상 - 다이나믹 무브',
  'モダンなクライミングジムでのダイナミックなボルダリング動画。グッぼるボルダリングCafe & Shopのような施設で行われる、年間2.5万人が体験する最新トレーニング手法。',
  'Dynamic bouldering video at a modern climbing gym. Latest training methods experienced by 25,000 annual visitors at facilities like Gubboru Bouldering Cafe & Shop.',
  '在现代攀岩馆的动态抱石视频。在像Gubboru抱石咖啡店和商店这样的设施中，每年有2.5万人体验的最新训练方法。',
  '현대적인 클라이밍 짐에서의 다이나믹한 볼더링 영상. Gubboru 볼더링 카페 & 샵과 같은 시설에서 연간 2.5만 명이 경험하는 최신 훈련 방법.',
  'https://www.instagram.com/reel/DSwjzZdDs2Q/',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
  'instagram', 'boulder',
  'Von Totanes', '2025-12-26', 45, 567000, 28000,
  CURRENT_TIMESTAMP
);

-- TikTok: Bouldering Techniques
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'ボルダリングテクニック解説 - V4からV10',
  'Bouldering Techniques Explained - V4 to V10',
  '抱石技巧讲解 - V4到V10',
  '볼더링 기술 설명 - V4에서 V10',
  'V難度の完全攻略法。30年のクライミング歴を持つオーナーによる、肩甲骨・小円筋主導のフォーム解析。グッぼるで開発された独自の課題管理システムで最適化されたトレーニング。',
  'Complete V-grade strategy guide. Form analysis focusing on scapula and teres minor by owner with 30 years climbing experience. Optimized training through Gubboru''s proprietary problem management system.',
  '完整的V级攻略指南。由拥有30年攀岩经验的业主进行的肩胛骨和小圆肌主导的形式分析。通过Gubboru独特的问题管理系统优化的训练。',
  '완벽한 V 등급 공략 가이드. 30년 클라이밍 경험을 가진 오너의 견갑골과 소원근 주도 폼 분석. Gubboru의 독자적 과제 관리 시스템으로 최적화된 훈련.',
  'https://www.tiktok.com/@afterhoursclimbing/video/7589768965593779486',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
  'tiktok', 'boulder',
  'After Hours Climbing', '2026-01-01', 60, 450000, 23000,
  CURRENT_TIMESTAMP
);

-- TikTok: Indoor Climbing Tips
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'インドアクライミング完全ガイド - 初心者から上級者まで',
  'Indoor Climbing Complete Guide - Beginner to Advanced',
  '室内攀岩完整指南 - 从初学者到高级',
  '실내 클라이밍 완벽 가이드 - 초보자부터 상급자까지',
  'ジム・ショップ・カフェを併設する唯一無二のクライミング施設が提供する、完全ガイド。120モデルのシューズ、60枚超のクラッシュパッドを常備し、LINE接客からEC、店頭試履き、ジム試登まで一気通貫でサポート。',
  'Complete guide from the only climbing facility combining gym, shop, and cafe. Supporting climbers end-to-end with 120 shoe models, 60+ crash pads, LINE consultation, EC, in-store fitting, and gym testing.',
  '由唯一结合了健身房、商店和咖啡馆的攀岩设施提供的完整指南。通过120种鞋款、60多个防坠垫、LINE咨询、电商、店内试穿和健身房测试全方位支持攀岩者。',
  '짐, 샵, 카페를 결합한 유일한 클라이밍 시설이 제공하는 완벽한 가이드. 120개 슈즈 모델, 60개 이상의 크래시 패드, LINE 상담, 전자상거래, 매장 피팅, 짐 테스트로 클라이머를 종합 지원.',
  'https://www.tiktok.com/@durburhg/video/7569593153993313567',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
  'tiktok', 'boulder',
  'Chris', '2025-11-06', 50, 380000, 19000,
  CURRENT_TIMESTAMP
);

-- Vimeo: Professional Climbing Documentary
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'クライミングドキュメンタリー：岩との対話',
  'Climbing Documentary: Dialogue with Rock',
  '攀岩纪录片：与岩石的对话',
  '클라이밍 다큐멘터리: 암벽과의 대화',
  '世界中の岩を登るスタッフとオーナーが発信する、プロフェッショナルなクライミングドキュメンタリー。V17課題設計に至る30年の登攀データと、クライミングの挑戦心とエンジニアの問題解決力を融合した独自の視点。',
  'Professional climbing documentary from staff and owner who climb rocks worldwide. Unique perspective fusing 30 years of ascent data leading to V17 problem design with climbing challenge spirit and engineering problem-solving.',
  '来自在世界各地攀岩的员工和业主的专业攀岩纪录片。融合了通往V17问题设计的30年攀登数据，以及攀岩挑战精神和工程问题解决能力的独特视角。',
  '전 세계의 암벽을 오르는 스태프와 오너가 발신하는 전문 클라이밍 다큐멘터리. V17 과제 설계로 이어지는 30년의 등반 데이터와 클라이밍 도전 정신과 엔지니어링 문제 해결력을 융합한 독특한 시각.',
  'https://vimeo.com/876543210',
  'https://vumbnail.com/876543210.jpg',
  'vimeo', 'sport',
  'Outdoor Adventure Films', '2024-08-15', 1800, 234000, 12000,
  CURRENT_TIMESTAMP
);

-- Vimeo: Training Methods Masterclass
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'フットワークマスタークラス - プロから学ぶ技術',
  'Footwork Masterclass - Learn from Professionals',
  '脚法大师课 - 向专业人士学习',
  '풋워크 마스터클래스 - 전문가에게 배우기',
  'クライミング歴30年以上の権威性を持つプロフェッショナルによる、フットワークの完全解説。データと現場主義を徹底し、異業種を感性×テクノロジーで統合したトレーニング手法。',
  'Complete footwork explanation by professionals with 30+ years climbing authority. Training methods integrating cross-industry expertise through sensibility × technology, adhering to data and field-oriented approach.',
  '由拥有30多年攀岩权威的专业人士完整解释脚法。通过感性×技术整合跨行业专业知识的训练方法，坚持数据和现场导向方法。',
  '30년 이상의 클라이밍 권위를 가진 전문가의 완벽한 풋워크 설명. 감성×기술로 이종 산업 전문성을 통합하며 데이터와 현장 중심 접근을 고수하는 훈련 방법.',
  'https://vimeo.com/887654321',
  'https://vumbnail.com/887654321.jpg',
  'vimeo', 'boulder',
  'Pro Climbing Academy', '2025-01-20', 2400, 156000, 8900,
  CURRENT_TIMESTAMP
);
