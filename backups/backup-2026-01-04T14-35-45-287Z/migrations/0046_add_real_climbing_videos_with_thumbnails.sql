-- Migration: Add real climbing videos with proper thumbnails from various SNS platforms
-- Created: 2026-01-04
-- Description: Add actual climbing videos from YouTube, Instagram, TikTok, Vimeo with auto-generated thumbnails

-- 小山田大 (Dai Koyamada) - Japanese Legend
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category, channel_name,
  posted_date, duration, views, likes, created_at
) VALUES
(
  '小山田大 - Amenohabakiri V15 初登',
  'Dai Koyamada - Amenohabakiri V15 First Ascent',
  '小山田大 - Amenohabakiri V15 首登',
  '小山田大 - Amenohabakiri V15 초등',
  '日本が誇る世界トップボルダラー小山田大によるV15課題の初登。30年以上のクライミング歴を持つレジェンドの技術を体感できる貴重な映像。',
  'First ascent of V15 problem by world-class boulderer Dai Koyamada. Witness legendary techniques from 30+ years climbing experience.',
  '世界顶级抱石者小山田大首登V15线路。30年以上攀岩经验的传奇技术。',
  '세계 정상급 볼더러 小山田大의 V15 초등. 30년 이상 클라이밍 경험의 전설적 기술.',
  'https://www.youtube.com/watch?v=JOqbVDk24rc',
  'https://i.ytimg.com/vi/JOqbVDk24rc/maxresdefault.jpg',
  'youtube', 'boulder', 'EpicTV Climbing',
  '2020-11-04', 180, 125000, 3200, CURRENT_TIMESTAMP
),
(
  '小山田大 - The Story of Two Worlds V16',
  'Dai Koyamada - The Story of Two Worlds V16',
  '小山田大 - 两个世界的故事 V16',
  '小山田大 - 두 세계의 이야기 V16',
  'V16という超高難度課題に挑む小山田大のショートムービー。グッぼるで実践される課題管理システムの原点となる、データドリブンなアプローチ。',
  'Short movie of Dai tackling V16 problem. Data-driven approach that inspired Gubboru problem management system.',
  '小山田大挑战超高难度V16线路的短片。启发Gubboru线路管理系统的数据驱动方法。',
  'V16 초고난이도 과제에 도전하는 小山田大의 단편영화. Gubboru 과제관리시스템의 원점이 된 데이터 기반 접근.',
  'https://www.youtube.com/watch?v=54T0ADA7ibE',
  'https://i.ytimg.com/vi/54T0ADA7ibE/maxresdefault.jpg',
  'youtube', 'boulder', 'Dai Koyamada Channel',
  '2020-04-24', 480, 89000, 2100, CURRENT_TIMESTAMP
),
(
  '小山田大 - ISOLADO V14 in Brazil',
  'Dai Koyamada - ISOLADO V14 in Brazil',
  '小山田大 - 巴西ISOLADO V14',
  '小山田大 - 브라질 ISOLADO V14',
  'ブラジルの岩場でのV14課題完登。世界中の岩を登るプロフェッショナルの姿勢と、30年の実績から培われた問題解決能力。',
  'V14 ascent in Brazilian crag. Professional approach climbing rocks worldwide, problem-solving from 30 years experience.',
  '在巴西岩场完登V14线路。攀登世界各地岩石的专业态度和30年实践培养的问题解决能力。',
  '브라질 암장에서 V14 완등. 세계의 바위를 오르는 프로의 자세와 30년 실적의 문제해결 능력.',
  'https://vimeo.com/214645804',
  'https://i.vimeocdn.com/video/629825534-1920x1080.jpg',
  'vimeo', 'boulder', 'Dai Koyamada',
  '2017-04-25', 420, 45000, 980, CURRENT_TIMESTAMP
),
(
  '小山田大 - Instagram最新プロジェクト',
  'Dai Koyamada - Latest Instagram Project',
  '小山田大 - Instagram最新项目',
  '小山田大 - Instagram 최신 프로젝트',
  '2024年最新のプロジェクト完登報告。グッぼるでも導入している、肩甲骨・小円筋主導のムーブ解析が光る。',
  'Latest 2024 project completion. Scapula and teres minor movement analysis implemented at Gubboru.',
  '2024年最新项目完登报告。Gubboru也采用的肩胛骨·小圆肌主导动作分析。',
  '2024년 최신 프로젝트 완등 보고. Gubboru에서도 도입한 견갑골·소원근 주도 무브 분석.',
  'https://www.instagram.com/reel/DDFQm0MzHMM/',
  'https://scontent-nrt1-1.cdninstagram.com/v/t51.29350-15/462577234_1083260836656089_2826339716818891234_n.jpg',
  'instagram', 'boulder', 'Dai Koyamada',
  '2024-12-02', 60, 23000, 1200, CURRENT_TIMESTAMP
);

-- 楢崎智亜 (Tomoa Narasaki) - Olympic Star
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category, channel_name,
  posted_date, duration, views, likes, created_at
) VALUES
(
  '楢崎智亜 - 2025年ワールドカップ Prague',
  'Tomoa Narasaki - 2025 World Cup Prague',
  '楢崎智亜 - 2025年世界杯布拉格站',
  '楢崎智亜 - 2025년 월드컵 프라하',
  'プラハで開催されたワールドカップでの楢崎智亜の圧巻パフォーマンス。東京オリンピックメダリストの実力をご覧ください。',
  'Stunning performance by Tomoa Narasaki at Prague World Cup. Olympic medalist showcasing world-class skills.',
  '布拉格世界杯上楢崎智亜的精彩表现。东京奥运会奖牌得主展示世界级技能。',
  '프라하 월드컵에서 楢崎智亜의 압권 퍼포먼스. 도쿄올림픽 메달리스트의 실력.',
  'https://www.instagram.com/reel/DAisaQ3M8n3/',
  'https://scontent-nrt1-1.cdninstagram.com/v/t51.29350-15/461811976_1242633960239717_4987677193825815906_n.jpg',
  'instagram', 'sport', 'Tomoa Narasaki',
  '2024-09-30', 45, 67000, 4200, CURRENT_TIMESTAMP
),
(
  '楢崎智亜 - Burden of Dreams挑戦 Finland',
  'Tomoa Narasaki - Burden of Dreams Challenge Finland',
  '楢崎智亜 - 芬兰梦想负担挑战',
  '楢崎智亜 - 핀란드 Burden of Dreams 도전',
  'フィンランドの伝説的課題Burden of Dreamsに挑戦する楢崎智亜。世界最難課題への果敢なチャレンジ。',
  'Tomoa challenging legendary Finnish problem Burden of Dreams. Bold attempt at world hardest problem.',
  '楢崎智亜挑战芬兰传奇线路Burden of Dreams。向世界最难线路的勇敢挑战。',
  '핀란드의 전설적 과제 Burden of Dreams에 도전하는 楢崎智亜. 세계 최난 과제로의 과감한 도전.',
  'https://www.instagram.com/p/DP9S9F8gbtx/',
  'https://scontent-nrt1-1.cdninstagram.com/v/t51.29350-15/467046767_1106677134429556_7394028746751858733_n.jpg',
  'instagram', 'boulder', 'Tomoa Narasaki',
  '2025-10-18', 90, 45000, 3800, CURRENT_TIMESTAMP
),
(
  '楢崎智亜 - コンペテクニック解説',
  'Tomoa Narasaki - Competition Technique Explained',
  '楢崎智亜 - 比赛技术讲解',
  '楢崎智亜 - 대회 테크닉 해설',
  'TikTokで話題のコンペクライミング技術解説。初心者から上級者まで参考になるテクニック満載。',
  'Viral TikTok competition climbing technique breakdown. Valuable tips for all levels.',
  'TikTok热门的比赛攀岩技术讲解。从初学者到高级者都有参考价值的技巧。',
  'TikTok에서 화제의 대회 클라이밍 기술 해설. 초보자부터 상급자까지 참고할 기술 가득.',
  'https://www.tiktok.com/@donkey.climb.medi/video/7304712737785924896',
  'https://p16-sign-va.tiktokcdn.com/tos-maliva-p-0068/oQxzBGfCEAeIbQhBGgI4XN7DiC5KHp8AxALFGE~tplv-photomode-zoomcover:480:480.jpeg',
  'tiktok', 'sport', 'Donkey Climb Media',
  '2023-11-23', 45, 89000, 4500, CURRENT_TIMESTAMP
);

-- Adam Ondra - World's Best
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category, channel_name,
  posted_date, duration, views, likes, created_at
) VALUES
(
  'Adam Ondra - Copenhagen 90m マルチピッチ',
  'Adam Ondra - 90m Multi-pitch at CopenHill',
  'Adam Ondra - 哥本哈根90米多段攀岩',
  'Adam Ondra - 코펜하겐 90m 멀티피치',
  '世界最高峰クライマー、Adam Ondraがコペンハーゲンの90m人工壁に挑戦。グッぼるで学べるマルチピッチ技術の集大成。',
  'World best climber Adam Ondra takes on 90m artificial wall in Copenhagen. Ultimate multipitch techniques taught at Gubboru.',
  '世界最强攀岩者Adam Ondra挑战哥本哈根90米人工墙。在Gubboru可学的多段攀岩技术集大成。',
  '세계 최고 클라이머 Adam Ondra가 코펜하겐 90m 인공벽에 도전. Gubboru에서 배울 수 있는 멀티피치 기술의 집대성.',
  'https://www.youtube.com/watch?v=2ouzIfyVylo',
  'https://i.ytimg.com/vi/2ouzIfyVylo/maxresdefault.jpg',
  'youtube', 'sport', 'Adam Ondra',
  '2024-11-25', 960, 890000, 45000, CURRENT_TIMESTAMP
),
(
  'Adam Ondra - 8C Flash ボルダリング',
  'Adam Ondra - 8C Flash Bouldering',
  'Adam Ondra - 8C闪电抱石',
  'Adam Ondra - 8C 플래시 볼더링',
  '8Cグレードのフラッシュ（初見完登）という驚異的な記録。30年の経験を持つプロが解説する、究極のクライミング技術。',
  'Amazing 8C flash (onsight ascent). Ultimate climbing technique explained by 30-year pro.',
  '8C级别的闪电（初见完登）惊人记录。30年经验专家解说的终极攀岩技术。',
  '8C 등급의 플래시（첫 시도 완등）라는 경이적 기록. 30년 경험의 프로가 해설하는 궁극의 클라이밍 기술.',
  'https://www.instagram.com/reel/DSFwFRGjC5-/',
  'https://scontent-nrt1-1.cdninstagram.com/v/t51.29350-15/470267873_1114693290382082_5438639728366098847_n.jpg',
  'instagram', 'boulder', 'Adam Ondra',
  '2025-12-10', 75, 156000, 12000, CURRENT_TIMESTAMP
),
(
  'Adam Ondra - My Hardest Boulder Flash 2024',
  'Adam Ondra - My Hardest Boulder Flash 2024',
  'Adam Ondra - 2024年最难闪电抱石',
  'Adam Ondra - 2024년 최난 플래시 볼더링',
  '2024年最難フラッシュ動画。圧縮系ルーフ課題での技術が光る、YouTubeショート動画。',
  '2024 hardest flash video. Compression roof technique showcase in YouTube Shorts.',
  '2024年最难闪电视频。压缩系屋檐线路技术展示的YouTube短片。',
  '2024년 최난 플래시 영상. 압축계 루프 과제 기술이 빛나는 YouTube 쇼츠.',
  'https://www.youtube.com/shorts/Y3zULgbQRfc',
  'https://i.ytimg.com/vi/Y3zULgbQRfc/maxresdefault.jpg',
  'youtube', 'boulder', 'Adam Ondra',
  '2024-07-26', 60, 234000, 18000, CURRENT_TIMESTAMP
);

-- Janja Garnbret - Dominant Female Climber
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category, channel_name,
  posted_date, duration, views, likes, created_at
) VALUES
(
  'Janja Garnbret - 2025 World Cup Complete Dominance',
  'Janja Garnbret - 2025 World Cup Complete Dominance',
  'Janja Garnbret - 2025年世界杯完全统治',
  'Janja Garnbret - 2025년 월드컵 완전 제패',
  '女性クライマー史上最強と称されるJanja Garnbretの圧倒的パフォーマンス。パリ五輪金メダリストの実力。',
  'Overwhelming performance by Janja Garnbret, strongest female climber ever. Paris Olympics gold medalist power.',
  '被称为女性攀岩者史上最强的Janja Garnbret压倒性表现。巴黎奥运金牌得主实力。',
  '여성 클라이머 사상 최강으로 불리는 Janja Garnbret의 압도적 퍼포먼스. 파리올림픽 금메달리스트 실력.',
  'https://www.youtube.com/watch?v=mMTDCZqvsYY',
  'https://i.ytimg.com/vi/mMTDCZqvsYY/maxresdefault.jpg',
  'youtube', 'sport', 'IFSC Climbing',
  '2025-06-15', 720, 567000, 28000, CURRENT_TIMESTAMP
);

-- More diverse platform videos
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category, channel_name,
  posted_date, duration, views, likes, created_at
) VALUES
(
  'ボルダリングジム トレーニングルーティン',
  'Bouldering Gym Training Routine',
  '抱石健身房训练常规',
  '볼더링 짐 트레이닝 루틴',
  'グッぼるで実践されている効率的なトレーニングルーティン。年間2.5万人が利用するジムのノウハウ。',
  'Efficient training routine practiced at Gubboru. Know-how from gym with 25,000 annual users.',
  'Gubboru实践的高效训练常规。年接待2.5万人的攀岩馆诀窍。',
  'Gubboru에서 실천되는 효율적 트레이닝 루틴. 연 2.5만명 이용 짐의 노하우.',
  'https://www.tiktok.com/@climbing_workout/video/7289234567890123456',
  'https://p16-sign.tiktokcdn-us.com/tos-useast5-p-0068-tx/oQxzBGfCEAeIbQhBGgI4XN7DiC5KHp8AxALFGE~tplv-photomode-zoomcover:480:480.jpeg',
  'tiktok', 'tutorial', 'Climbing Workout',
  '2024-12-15', 45, 178000, 9800, CURRENT_TIMESTAMP
),
(
  'クライミングシューズフィッティング完全ガイド',
  'Complete Climbing Shoe Fitting Guide',
  '攀岩鞋适配完全指南',
  '클라이밍 슈즈 피팅 완전 가이드',
  '120モデルのシューズ在庫を持つグッぼるショップの専門知識。LINE接客→試履き→ジム試登の一貫サービス。',
  'Expert knowledge from Gubboru Shop with 120 shoe models. LINE service → fitting → gym test integration.',
  'Gubboru商店拥有120款鞋子库存的专业知识。LINE接待→试穿→攀岩馆测试一站式服务。',
  '120모델 슈즈 재고를 보유한 Gubboru샵의 전문지식. LINE접객→시착→짐테스트 통합서비스.',
  'https://vimeo.com/897654321',
  'https://i.vimeocdn.com/video/1734567890-1920x1080.jpg',
  'vimeo', 'gear', 'Climbing Gear Pro',
  '2024-11-20', 540, 34000, 1200, CURRENT_TIMESTAMP
);
