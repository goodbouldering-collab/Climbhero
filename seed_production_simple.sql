-- Clear existing data
DELETE FROM videos;
DELETE FROM blog_posts;
DELETE FROM announcements;

-- YouTube Regular Videos
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.youtube.com/watch?v=abc123xyz', 'V16課題完登への道', 'グッぼるボルダリングで最高難易度V16に挑戦する30年のクライミング経験', 'bouldering', 'youtube', 'youtube', 'abc123xyz', 'Path to Completing V16 Problem', '30 years climbing experience at Gubboru', 'V16难题完攀之路', '在Gubboru挑战V16', 'V16 완등의 길', 'Gubboru에서 V16 도전');

INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.youtube.com/watch?v=def456uvw', '肩甲骨主導のムーブ解説', '小円筋と肩甲骨を使った効率的なクライミングフォーム', 'tutorial', 'youtube', 'youtube', 'def456uvw', 'Scapula Movement Guide', 'Efficient climbing with teres minor', '肩胛骨动作解说', '使用小圆肌的攀岩', '견갑골 무브 해설', '소원근을 사용한 폼');

INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.youtube.com/watch?v=ghi789rst', 'プロギング × クライミング', '環境保全とクライミングを融合', 'other', 'youtube', 'youtube', 'ghi789rst', 'Plogging x Climbing', 'Environmental conservation meets climbing', '拾荒慢跑与攀岩', '环保与攀岩结合', '플로깅 x 클라이밍', '환경보전과 클라이밍');

INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.youtube.com/watch?v=jkl012mno', 'クライミングシューズ120モデル比較', 'グッぼるショップの全在庫シューズ徹底レビュー', 'gear', 'youtube', 'youtube', 'jkl012mno', '120 Shoe Models Comparison', 'Complete Gubboru Shop inventory review', '120款攀岩鞋对比', 'Gubboru商店全库存', '120모델 슈즈 비교', 'Gubboru 샵 전체 재고');

INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.youtube.com/watch?v=pqr345stu', 'エスプレッソとクライミング', 'ナポリ式エスプレッソで最高のパフォーマンス', 'other', 'youtube', 'youtube', 'pqr345stu', 'Espresso and Climbing', 'Peak performance with Napoli espresso', '浓缩咖啡与攀岩', '那不勒斯咖啡最佳表现', '에스프레소와 클라이밍', '나폴리식 에스프레소');

-- YouTube Shorts
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.youtube.com/shorts/short001abc', '3秒で分かる正しいホールドの持ち方', '初心者必見！基本のホールディングテクニック', 'tutorial', 'youtube_shorts', 'youtube', 'short001abc', '3-Second Hold Gripping Guide', 'Must-see for beginners', '3秒了解抓点', '初学者必看', '3초 홀드 잡는법', '초보자 필수');

INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.youtube.com/shorts/short002xyz', 'V12デッドポイント成功の瞬間', '完璧なタイミングで掴む！', 'bouldering', 'youtube_shorts', 'youtube', 'short002xyz', 'V12 Deadpoint Success', 'Perfect timing catch', 'V12死点成功', '完美时机', 'V12 데드포인트', '완벽한 타이밍');

INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.youtube.com/shorts/short003def', '筋トレ不要！体幹だけで登る', '30年のクライマーが教える本質', 'tutorial', 'youtube_shorts', 'youtube', 'short003def', 'No Muscle Training Needed', 'Core-only climbing by 30yr veteran', '无需肌肉训练', '30年经验传授', '근력운동 불필요', '30년 클라이머');

-- Instagram Reels
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.instagram.com/reel/IGreel001abc', 'グッぼるカフェの絶品カプチーノ', 'ナポリ直送豆で淹れる本格派', 'other', 'instagram', 'instagram', 'IGreel001abc', 'Exquisite Cappuccino', 'Authentic brew from Naples', '绝品卡布奇诺', '那不勒斯豆', '절품 카푸치노', '나폴리 직송');

INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.instagram.com/reel/IGreel002xyz', '最新課題V15セッション', 'トップクライマー達の挑戦', 'bouldering', 'instagram', 'instagram', 'IGreel002xyz', 'Latest V15 Problem', 'Top climbers challenge', '最新V15线路', '顶级攀岩者', '최신 V15 과제', '톱 클라이머');

INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.instagram.com/reel/IGreel003def', 'ジム×ショップ×カフェの融合', '日本唯一の3in1クライミング施設', 'other', 'instagram', 'instagram', 'IGreel003def', 'Gym Shop Cafe Fusion', 'Japan only 3-in-1 facility', '攀岩馆商店咖啡馆', '日本唯一3合1', '짐샵카페 융합', '일본 유일 3in1');

-- TikTok Videos
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.tiktok.com/@goodbouldering/video/7123456789', '誰でもできる！V0からV3への最短ルート', '初心者が1ヶ月で成長するコツ', 'tutorial', 'tiktok', 'tiktok', '7123456789', 'Anyone Can! V0 to V3', 'Beginner progress tips', '任何人都能V0到V3', '1个月进步技巧', '누구나 V0→V3', '1개월 성장 요령');

INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.tiktok.com/@goodbouldering/video/7234567890', 'クライミングあるある10選', 'クライマーなら共感必至！', 'other', 'tiktok', 'tiktok', '7234567890', 'Top 10 Climbing Moments', 'Climbers will relate', '攀岩常见10场景', '攀岩者共鸣', '클라이밍 있는있는', '클라이머 공감');

INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.tiktok.com/@goodbouldering/video/7345678901', '彦根駅前の隠れた名店', 'クライミング後のご褒美グルメ', 'other', 'tiktok', 'tiktok', '7345678901', 'Hidden Gem at Hikone', 'Reward gourmet after climbing', '彦根站前隐藏名店', '攀岩后奖励美食', '히코네역 맛집', '클라이밍 후 보상');

-- Vimeo Videos
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://vimeo.com/123456789', 'グッぼる施設紹介 - 完全版', 'ジム・ショップ・カフェの全貌', 'other', 'vimeo', 'vimeo', '123456789', 'Gubboru Facility Tour', 'Complete view of all facilities', 'Gubboru设施介绍', '攀岩馆商店咖啡馆', 'Gubboru 시설소개', '짐샵카페 전모');

INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://vimeo.com/234567890', 'V16プロジェクト - ドキュメンタリー', '最高難易度への挑戦の記録', 'bouldering', 'vimeo', 'vimeo', '234567890', 'V16 Project Documentary', 'Challenge record', 'V16项目纪录片', '挑战最高难度', 'V16 다큐멘터리', '최고난이도 도전');

-- X (Twitter) Videos
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://twitter.com/goodbouldering/status/1234567890123456789', 'クライミングコンサルタント実績公開', '14施設立ち上げ・補助金採択率85%', 'other', 'x', 'x', '1234567890123456789', 'Consulting Results', '14 facilities, 85% approval', '咨询实绩公开', '14设施85%批准', '컨설팅 실적', '14시설 85%채택');

INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://twitter.com/goodbouldering/status/2345678901234567890', 'Notエステ×クライミング', 'IPL・SHR複合機で最高のコンディション', 'other', 'x', 'x', '2345678901234567890', 'Beauty Salon x Climbing', 'Best condition with IPL SHR', '美容沙龙与攀岩', 'IPL SHR最佳状态', '에스테 x 클라이밍', 'IPL SHR 컨디션');

-- Blog Posts
INSERT INTO blog_posts (title, content, image_url, published_date, title_en, content_en, title_zh, content_zh, title_ko, content_ko) VALUES
('ボルダリング初心者のための完全ガイド', '<h2>ボルダリングとは？</h2><p>グッぼるボルダリングでは、年間2.5万人のクライマーが楽しんでいます。</p>', '/images/blog/guide.jpg', '2024-01-15', 'Complete Beginners Guide', '<h2>What is Bouldering?</h2><p>25,000 climbers annually at Gubboru.</p>', '初学者完全指南', '<h2>什么是抱石？</h2><p>Gubboru每年2.5万人。</p>', '초보자 완전가이드', '<h2>볼더링이란?</h2><p>Gubboru 연간 2.5만명.</p>');

-- Announcements
INSERT INTO announcements (title, content, priority, is_active, title_en, content_en, title_zh, content_zh, title_ko, content_ko) VALUES
('新規V16課題リリース！', '最高難易度の新課題が登場しました。', 1, 1, 'New V16 Problem Released', 'Highest difficulty problem arrived', '新V16线路发布', '最高难度线路登场', '신규 V16 릴리스', '최고난이도 과제');
