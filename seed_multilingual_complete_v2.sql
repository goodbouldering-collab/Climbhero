-- Complete Multilingual Sample Data with 30+ Videos
-- Platforms: YouTube, Instagram, TikTok, Vimeo, X (Twitter), YouTube Shorts

-- Clear existing data
DELETE FROM videos;
DELETE FROM blog_posts;
DELETE FROM announcements;

-- ======================
-- VIDEOS (35 videos - all platforms)
-- ======================

-- YouTube Regular Videos (8 videos)
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.youtube.com/watch?v=abc123xyz', 'V16課題完登への道', 'グッぼるボルダリングで最高難易度V16に挑戦する30年のクライミング経験', 'bouldering', 'youtube', 'youtube', 'abc123xyz', 'Path to Completing V16 Problem', '30 years of climbing experience challenging the highest difficulty V16 at Gubboru Bouldering', 'V16难题完攀之路', '在Gubboru抱石馆挑战最高难度V16的30年攀岩经验', 'V16 문제 완등의 길', 'Gubboru 볼더링에서 최고 난이도 V16에 도전하는 30년의 클라이밍 경험'),
('https://www.youtube.com/watch?v=def456uvw', '肩甲骨主導のムーブ解説', '小円筋と肩甲骨を使った効率的なクライミングフォーム - 専門的解説', 'tutorial', 'youtube', 'youtube', 'def456uvw', 'Scapula-Driven Movement Explanation', 'Efficient climbing form using teres minor and scapula - Professional explanation', '肩胛骨主导的动作讲解', '使用小圆肌和肩胛骨的高效攀岩姿势-专业解说', '견갑골 주도 무브 해설', '소원근과 견갑골을 사용한 효율적인 클라이밍 폼 - 전문 해설'),
('https://www.youtube.com/watch?v=ghi789rst', 'プロギング × クライミング', '環境保全とクライミングを融合 - グッぼる副会長による実践', 'other', 'youtube', 'youtube', 'ghi789rst', 'Plogging × Climbing', 'Combining environmental conservation and climbing - Practice by Gubboru Vice President', '拾荒慢跑 × 攀岩', '环保与攀岩的结合-Gubboru副会长的实践', '플로깅 × 클라이밍', '환경 보전과 클라이밍의 융합 - Gubboru 부회장의 실천'),
('https://www.youtube.com/watch?v=jkl012mno', 'クライミングシューズ120モデル比較', 'グッぼるショップの全在庫シューズ徹底レビュー', 'gear', 'youtube', 'youtube', 'jkl012mno', '120 Climbing Shoe Models Comparison', 'Comprehensive review of all shoes in Gubboru Shop inventory', '120款攀岩鞋型号对比', 'Gubboru商店全库存鞋子全面评测', '클라이밍 슈즈 120모델 비교', 'Gubboru 샵 전체 재고 슈즈 철저 리뷰'),
('https://www.youtube.com/watch?v=pqr345stu', 'エスプレッソとクライミング', 'ナポリ式エスプレッソで最高のパフォーマンス - カフェ併設ジムの強み', 'other', 'youtube', 'youtube', 'pqr345stu', 'Espresso and Climbing', 'Peak performance with Napoli-style espresso - Advantages of cafe-attached gym', '意式浓缩咖啡与攀岩', '那不勒斯式浓缩咖啡带来最佳表现-咖啡馆附设攀岩馆的优势', '에스프레소와 클라이밍', '나폴리식 에스프레소로 최고의 퍼포먼스 - 카페 병설 짐의 강점'),
('https://www.youtube.com/watch?v=vwx678yza', 'V17プロジェクト - 最高難易度への挑戦', '世界トップクラスの難易度に挑む課題設計', 'bouldering', 'youtube', 'youtube', 'vwx678yza', 'V17 Project - Challenge to Highest Difficulty', 'Problem design challenging world-class difficulty', 'V17项目-挑战最高难度', '挑战世界顶级难度的线路设计', 'V17 프로젝트 - 최고 난이도에의 도전', '세계 최고 수준의 난이도에 도전하는 과제 설계'),
('https://www.youtube.com/watch?v=bcd901efg', '年間2.5万人が利用するジムの秘密', '全課題デジタル管理システムと登攀データ分析', 'other', 'youtube', 'youtube', 'bcd901efg', 'Secrets of Gym with 25,000 Annual Users', 'All problems digital management system and climbing data analysis', '年接待2.5万人攀岩馆的秘密', '所有线路数字化管理系统和攀岩数据分析', '연간 2.5만명이 이용하는 짐의 비밀', '전과제 디지털 관리 시스템과 등반 데이터 분석'),
('https://www.youtube.com/watch?v=hij234klm', 'クライミング施設立ち上げコンサル', '14件の施設立ち上げ実績 - 事業再構築補助金採択率85%', 'other', 'youtube', 'youtube', 'hij234klm', 'Climbing Facility Startup Consulting', '14 facility startup achievements - 85% subsidy approval rate', '攀岩设施启动咨询', '14个设施启动实绩-补贴批准率85%', '클라이밍 시설 런칭 컨설팅', '14건의 시설 런칭 실적 - 사업재구축 보조금 채택률 85%'),

-- YouTube Shorts (7 videos)
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.youtube.com/shorts/short001abc', '3秒で分かる正しいホールドの持ち方', '初心者必見！基本のホールディングテクニック', 'tutorial', 'youtube_shorts', 'youtube', 'short001abc', '3-Second Guide to Proper Hold Gripping', 'Must-see for beginners! Basic holding technique', '3秒了解正确的抓点方法', '初学者必看！基本抓握技术', '3초로 알아보는 올바른 홀드 잡는 법', '초보자 필견! 기본 홀딩 테크닉'),
('https://www.youtube.com/shorts/short002xyz', 'V12デッドポイント成功の瞬間', '完璧なタイミングで掴む！', 'bouldering', 'youtube_shorts', 'youtube', 'short002xyz', 'Moment of V12 Deadpoint Success', 'Catching at perfect timing!', 'V12死点成功瞬间', '完美时机抓握！', 'V12 데드포인트 성공의 순간', '완벽한 타이밍으로 잡기!'),
('https://www.youtube.com/shorts/short003def', '筋トレ不要！体幹だけで登る', '30年のクライマーが教える本質', 'tutorial', 'youtube_shorts', 'youtube', 'short003def', 'No Muscle Training Needed! Climb with Core Only', 'Essence taught by 30-year climber', '无需肌肉训练！只用核心攀爬', '30年攀岩者传授的本质', '근력운동 불필요! 코어만으로 오르기', '30년 클라이머가 가르치는 본질'),
('https://www.youtube.com/shorts/short004ghi', 'クラッシュパッド60枚の壮観', 'グッぼるショップの圧倒的在庫', 'gear', 'youtube_shorts', 'youtube', 'short004ghi', 'Spectacular View of 60 Crash Pads', 'Overwhelming inventory of Gubboru Shop', '60张抱石垫的壮观景象', 'Gubboru商店的压倒性库存', '크래시 패드 60장의 장관', 'Gubboru 샵의 압도적 재고'),
('https://www.youtube.com/shorts/short005jkl', '朝イチエスプレッソからのクライミング', 'カフェ併設の最強ルーティン', 'other', 'youtube_shorts', 'youtube', 'short005jkl', 'Climbing After Morning Espresso', 'Strongest routine with cafe attachment', '早晨浓缩咖啡后的攀岩', '咖啡馆附设的最强例程', '아침 에스프레소 후의 클라이밍', '카페 병설의 최강 루틴'),
('https://www.youtube.com/shorts/short006mno', '肩甲骨ストレッチ10秒', '登る前の必須ウォームアップ', 'tutorial', 'youtube_shorts', 'youtube', 'short006mno', '10-Second Scapula Stretch', 'Essential warm-up before climbing', '10秒肩胛骨拉伸', '攀爬前的必要热身', '10초 견갑골 스트레칭', '오르기 전 필수 워밍업'),
('https://www.youtube.com/shorts/short007pqr', 'プロギングで拾ったゴミ2.4トン', '環境活動とクライミングの両立', 'other', 'youtube_shorts', 'youtube', 'short007pqr', '2.4 Tons of Trash Collected via Plogging', 'Balancing environmental activities and climbing', '拾荒慢跑收集的2.4吨垃圾', '环保活动与攀岩的平衡', '플로깅으로 주운 쓰레기 2.4톤', '환경 활동과 클라이밍의 양립'),

-- Instagram Reels (7 videos)
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.instagram.com/reel/IGreel001abc', 'グッぼるカフェの絶品カプチーノ', 'ナポリ直送豆で淹れる本格派', 'other', 'instagram', 'instagram', 'IGreel001abc', 'Exquisite Cappuccino at Gubboru Cafe', 'Authentic brew with beans from Naples', 'Gubboru咖啡馆的绝品卡布奇诺', '用那不勒斯空运豆子冲泡的正宗咖啡', 'Gubboru 카페의 절품 카푸치노', '나폴리 직송 원두로 내리는 본격파'),
('https://www.instagram.com/reel/IGreel002xyz', '最新課題V15セッション', 'トップクライマー達の挑戦', 'bouldering', 'instagram', 'instagram', 'IGreel002xyz', 'Latest V15 Problem Session', 'Challenge by top climbers', '最新线路V15环节', '顶级攀岩者的挑战', '최신 과제 V15 세션', '톱 클라이머들의 도전'),
('https://www.instagram.com/reel/IGreel003def', 'ジム×ショップ×カフェの融合', '日本唯一の3in1クライミング施設', 'other', 'instagram', 'instagram', 'IGreel003def', 'Fusion of Gym × Shop × Cafe', 'Japan\'s only 3-in-1 climbing facility', '攀岩馆×商店×咖啡馆的融合', '日本唯一的3合1攀岩设施', '짐×샵×카페의 융합', '일본 유일의 3in1 클라이밍 시설'),
('https://www.instagram.com/reel/IGreel004ghi', 'シューズ試履き→ジム試登', '購入前に実際のホールドで試せる', 'gear', 'instagram', 'instagram', 'IGreel004ghi', 'Shoe Try-on → Gym Test Climb', 'Test on actual holds before purchase', '鞋子试穿→攀岩馆试爬', '购买前可在实际抓点上测试', '슈즈 시착 → 짐 테스트', '구매 전 실제 홀드에서 테스트 가능'),
('https://www.instagram.com/reel/IGreel005jkl', 'IoT計測でコーヒー豆鮮度管理', 'テクノロジーで最高の一杯を', 'other', 'instagram', 'instagram', 'IGreel005jkl', 'Coffee Bean Freshness via IoT', 'Best cup through technology', '通过物联网监测咖啡豆新鮮度', '通过技术实现最佳一杯', 'IoT 계측으로 커피 원두 신선도 관리', '테크놀로지로 최고의 한 잔을'),
('https://www.instagram.com/reel/IGreel006mno', 'キッズクライミング教室', '親子で楽しむボルダリング', 'other', 'instagram', 'instagram', 'IGreel006mno', 'Kids Climbing Class', 'Enjoying bouldering with family', '儿童攀岩课程', '亲子享受抱石', '키즈 클라이밍 교실', '부모와 함께 즐기는 볼더링'),
('https://www.instagram.com/reel/IGreel007pqr', 'クラッシュパッド選び方ガイド', '60枚の在庫から最適な1枚を', 'gear', 'instagram', 'instagram', 'IGreel007pqr', 'Crash Pad Selection Guide', 'Find the perfect one from 60 in stock', '抱石垫选购指南', '从60张库存中找到最佳一张', '크래시 패드 선택법 가이드', '60장의 재고에서 최적의 1장을'),

-- TikTok Videos (7 videos)
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://www.tiktok.com/@goodbouldering/video/7123456789', '誰でもできる！V0からV3への最短ルート', '初心者が1ヶ月で成長するコツ', 'tutorial', 'tiktok', 'tiktok', '7123456789', 'Anyone Can! Fastest Route from V0 to V3', 'Tips for beginners to progress in 1 month', '任何人都能做到！V0到V3的最短路径', '初学者1个月进步的技巧', '누구나 할 수 있다! V0에서 V3로의 최단 루트', '초보자가 1개월에 성장하는 요령'),
('https://www.tiktok.com/@goodbouldering/video/7234567890', 'クライミングあるある10選', 'クライマーなら共感必至！', 'other', 'tiktok', 'tiktok', '7234567890', 'Top 10 Climbing Moments', 'Climbers will definitely relate!', '攀岩常见的10个场景', '攀岩者必能共鸣！', '클라이밍 있는 있는 10선', '클라이머라면 공감 필수!'),
('https://www.tiktok.com/@goodbouldering/video/7345678901', '彦根駅前の隠れた名店', 'クライミング後のご褒美グルメ', 'other', 'tiktok', 'tiktok', '7345678901', 'Hidden Gem in Front of Hikone Station', 'Reward gourmet after climbing', '彦根站前的隐藏名店', '攀岩后的奖励美食', '히코네역 앞 숨은 맛집', '클라이밍 후의 보상 그루메'),
('https://www.tiktok.com/@goodbouldering/video/7456789012', 'LINE接客からEC、試履き、試登まで', 'オンラインとリアルの完全融合', 'gear', 'tiktok', 'tiktok', '7456789012', 'From LINE Service to EC, Try-on, Test Climb', 'Perfect fusion of online and real', '从LINE接待到电商、试穿、试爬', '线上与实体的完美融合', 'LINE 접객부터 EC, 시착, 시등까지', '온라인과 리얼의 완전 융합'),
('https://www.tiktok.com/@goodbouldering/video/7567890123', 'V10核心ムーブ解説', '肩甲骨と小円筋を意識する', 'tutorial', 'tiktok', 'tiktok', '7567890123', 'V10 Core Movement Explanation', 'Focus on scapula and teres minor', 'V10核心动作解说', '注意肩胛骨和小圆肌', 'V10 코어 무브 해설', '견갑골과 소원근을 의식하기'),
('https://www.tiktok.com/@goodbouldering/video/7678901234', 'スターバックスコラボプロギング', '年間30回超の清掃ランイベント', 'other', 'tiktok', 'tiktok', '7678901234', 'Starbucks Collab Plogging', '30+ cleanup run events per year', '星巴克合作拾荒慢跑', '每年超过30次的清洁跑步活动', '스타벅스 콜라보 플로깅', '연간 30회 초과의 청소 런 이벤트'),
('https://www.tiktok.com/@goodbouldering/video/7789012345', '課題管理システム全公開', '年間延べ2.5万人のデータ活用', 'other', 'tiktok', 'tiktok', '7789012345', 'Complete Problem Management System', 'Utilizing data from 25,000 annual users', '线路管理系统全公开', '利用年接待2.5万人的数据', '과제 관리 시스템 전공개', '연간 연인원 2.5만명의 데이터 활용'),

-- Vimeo Videos (3 videos)
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://vimeo.com/123456789', 'グッぼる施設紹介 - 完全版', 'ジム・ショップ・カフェの全貌', 'other', 'vimeo', 'vimeo', '123456789', 'Gubboru Facility Introduction - Complete', 'Full view of gym, shop, and cafe', 'Gubboru设施介绍-完整版', '攀岩馆、商店、咖啡馆的全貌', 'Gubboru 시설 소개 - 완전판', '짐・샵・카페의 전모'),
('https://vimeo.com/234567890', 'V16プロジェクト - ドキュメンタリー', '最高難易度への挑戦の記録', 'bouldering', 'vimeo', 'vimeo', '234567890', 'V16 Project - Documentary', 'Record of challenge to highest difficulty', 'V16项目-纪录片', '挑战最高难度的记录', 'V16 프로젝트 - 다큐멘터리', '최고 난이도에의 도전 기록'),
('https://vimeo.com/345678901', 'クライミングと地域活性化', '彦根駅前再生プロジェクト', 'other', 'vimeo', 'vimeo', '345678901', 'Climbing and Community Revitalization', 'Hikone Station Front Regeneration Project', '攀岩与地区振兴', '彦根站前再生项目', '클라이밍과 지역 활성화', '히코네역 앞 재생 프로젝트'),

-- X (Twitter) Videos (3 videos)
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
('https://twitter.com/goodbouldering/status/1234567890123456789', 'クライミングコンサルタント実績公開', '14施設立ち上げ・補助金採択率85%', 'other', 'x', 'x', '1234567890123456789', 'Climbing Consultant Results Public', '14 facilities launched, 85% subsidy approval', '攀岩顾问实绩公开', '启动14个设施，补贴批准率85%', '클라이밍 컨설턴트 실적 공개', '14시설 런칭・보조금 채택률 85%'),
('https://twitter.com/goodbouldering/status/2345678901234567890', 'NotエステSouthern彦根 × クライミング', 'IPL・SHR複合機で最高のコンディション', 'other', 'x', 'x', '2345678901234567890', 'Not Esthe Southern Hikone × Climbing', 'Best condition with IPL & SHR', 'Not美容南彦根 × 攀岩', '通过IPL・SHR复合机实现最佳状态', 'Not 에스테 사우던 히코네 × 클라이밍', 'IPL・SHR 복합기로 최고의 컨디션'),
('https://twitter.com/goodbouldering/status/3456789012345678901', 'rasiku看護師AIチャット × クライマー健康管理', 'アプリ月間1.2万人が利用', 'other', 'x', 'x', '3456789012345678901', 'rasiku Nurse AI Chat × Climber Health', '12,000 monthly app users', 'rasiku护士AI聊天 × 攀岩者健康管理', '应用月活1.2万人', 'rasiku 간호사 AI 채팅 × 클라이머 건강관리', '앱 월간 1.2만명 이용');

-- ======================
-- BLOG POSTS (3 posts)
-- ======================

INSERT INTO blog_posts (title, content, author, image_url, published_at, title_en, content_en, title_zh, content_zh, title_ko, content_ko) VALUES
('ボルダリング初心者のための完全ガイド', 
'<h2>ボルダリングとは？</h2><p>ボルダリングは、ロープを使わずに低い岩や人工壁を登るクライミングの一種です。グッぼるボルダリングでは、年間2.5万人のクライマーが楽しんでいます。</p><h2>必要な装備</h2><p>シューズとチョークのみで始められます。グッぼるショップでは120モデルのシューズを常時在庫しており、試履き→ジム試登が可能です。</p><h2>上達のコツ</h2><p>30年のクライミング経験から言えるのは、肩甲骨と小円筋を意識したフォームが重要です。筋力ではなく、体幹とテクニックで登ることを心がけましょう。</p>',
'由井辰美', 
'/images/blog/beginners-guide.jpg',
'2024-01-15',
'Complete Beginner\'s Guide to Bouldering',
'<h2>What is Bouldering?</h2><p>Bouldering is a form of climbing without ropes on low rocks or artificial walls. At Gubboru Bouldering, 25,000 climbers enjoy it annually.</p><h2>Required Equipment</h2><p>You can start with just shoes and chalk. Gubboru Shop has 120 shoe models in stock, allowing try-on → gym test climbing.</p><h2>Tips for Improvement</h2><p>From 30 years of climbing experience, focusing on scapula and teres minor form is important. Aim to climb with core and technique rather than muscle.</p>',
'抱石初学者完全指南',
'<h2>什么是抱石？</h2><p>抱石是一种不使用绳索在低岩石或人工墙上攀爬的方式。在Gubboru抱石馆，每年有2.5万攀岩者享受这项运动。</p><h2>必要装备</h2><p>只需要鞋子和镁粉即可开始。Gubboru商店常备120款鞋型，可试穿→攀岩馆试爬。</p><h2>进步秘诀</h2><p>从30年的攀岩经验来看，注意肩胛骨和小圆肌的姿势很重要。要以核心和技术而非肌肉力量攀爬。</p>',
'볼더링 초보자를 위한 완전 가이드',
'<h2>볼더링이란?</h2><p>볼더링은 로프를 사용하지 않고 낮은 바위나 인공 벽을 오르는 클라이밍의 일종입니다. Gubboru 볼더링에서는 연간 2.5만명의 클라이머가 즐기고 있습니다.</p><h2>필요한 장비</h2><p>슈즈와 초크만으로 시작할 수 있습니다. Gubboru 샵에서는 120모델의 슈즈를 상시 재고하고 있어 시착→짐 테스트가 가능합니다.</p><h2>상달의 요령</h2><p>30년의 클라이밍 경험에서 말할 수 있는 것은 견갑골과 소원근을 의식한 폼이 중요합니다. 근력이 아닌 코어와 테크닉으로 오르는 것을 유념하세요.</p>'),

('クライミングシューズの選び方 - 120モデル徹底比較', 
'<h2>シューズ選びの重要性</h2><p>クライミングにおいて、シューズは最も重要な装備です。グッぼるショップでは120モデル超を常時在庫し、購入前に実際のホールドで試せます。</p><h2>タイプ別の特徴</h2><p>ベルクロ、レースアップ、スリッパ型の3タイプがあります。初心者にはベルクロタイプがおすすめです。</p><h2>サイズの選び方</h2><p>通常の靴より0.5〜1cm小さいサイズを選びます。グッぼるでは試履き→ジム試登→LINE相談→ECで購入という一気通貫サービスを提供しています。</p>',
'由井辰美',
'/images/blog/shoe-guide.jpg',
'2024-02-20',
'How to Choose Climbing Shoes - 120 Models Comparison',
'<h2>Importance of Shoe Selection</h2><p>In climbing, shoes are the most important equipment. Gubboru Shop stocks over 120 models and allows testing on actual holds before purchase.</p><h2>Type Characteristics</h2><p>There are 3 types: Velcro, lace-up, and slipper. Velcro type is recommended for beginners.</p><h2>Size Selection</h2><p>Choose 0.5-1cm smaller than regular shoes. Gubboru provides integrated service: try-on → gym test → LINE consultation → EC purchase.</p>',
'攀岩鞋的选择方法-120款型号彻底对比',
'<h2>选鞋的重要性</h2><p>在攀岩中，鞋子是最重要的装备。Gubboru商店常备超过120款型号，可在实际抓点上测试后再购买。</p><h2>类型特征</h2><p>有魔术贴、系带、拖鞋型3种类型。初学者推荐魔术贴类型。</p><h2>尺码选择</h2><p>选择比普通鞋小0.5-1cm的尺码。Gubboru提供试穿→攀岩馆试爬→LINE咨询→电商购买的一站式服务。</p>',
'클라이밍 슈즈 선택법 - 120모델 철저 비교',
'<h2>슈즈 선택의 중요성</h2><p>클라이밍에서 슈즈는 가장 중요한 장비입니다. Gubboru 샵에서는 120모델 이상을 상시 재고하고 있어 구매 전 실제 홀드에서 테스트할 수 있습니다.</p><h2>타입별 특징</h2><p>벨크로, 레이스업, 슬리퍼형의 3타입이 있습니다. 초보자에게는 벨크로 타입을 추천합니다.</p><h2>사이즈 선택법</h2><p>보통 신발보다 0.5〜1cm 작은 사이즈를 선택합니다. Gubboru에서는 시착→짐 테스트→LINE 상담→EC 구매라는 일관된 서비스를 제공하고 있습니다.</p>'),

('クライミングと環境保全 - プロギングという選択', 
'<h2>プロギングとは</h2><p>ジョギングしながらゴミ拾いをする環境活動です。グッぼるではプロギングジャパン副会長として年間30回超のイベントを開催しています。</p><h2>実績</h2><p>これまでに延べ4,000人が参加し、2.4トンの廃プラスチックを回収しました。スターバックス等の企業とも協業しています。</p><h2>クライミングとの親和性</h2><p>アウトドアを愛するクライマーにとって、環境保全は自然な活動です。登る前の準備運動として、ジム周辺でのプロギングを推奨しています。</p>',
'由井辰美',
'/images/blog/plogging.jpg',
'2024-03-10',
'Climbing and Environmental Conservation - Choosing Plogging',
'<h2>What is Plogging</h2><p>Environmental activity of picking up trash while jogging. Gubboru hosts 30+ events annually as Vice President of Plogging Japan.</p><h2>Results</h2><p>4,000 participants collected 2.4 tons of plastic waste. Collaborating with companies like Starbucks.</p><h2>Affinity with Climbing</h2><p>For outdoor-loving climbers, environmental conservation is a natural activity. We recommend plogging around the gym as warm-up before climbing.</p>',
'攀岩与环境保护-选择拾荒慢跑',
'<h2>什么是拾荒慢跑</h2><p>边慢跑边捡垃圾的环保活动。Gubboru作为拾荒慢跑日本副会长，每年举办超过30次活动。</p><h2>实绩</h2><p>迄今有4,000人参与，回收了2.4吨废塑料。也与星巴克等企业合作。</p><h2>与攀岩的亲和性</h2><p>对于热爱户外的攀岩者来说，环境保护是自然的活动。我们推荐在攀岩馆周围进行拾荒慢跑作为攀爬前的热身。</p>',
'클라이밍과 환경 보전 - 플로깅이라는 선택',
'<h2>플로깅이란</h2><p>조깅하면서 쓰레기를 줍는 환경 활동입니다. Gubboru에서는 플로깅 재팬 부회장으로서 연간 30회 이상의 이벤트를 개최하고 있습니다.</p><h2>실적</h2><p>지금까지 연인원 4,000명이 참가하여 2.4톤의 폐플라스틱을 회수했습니다. 스타벅스 등의 기업과도 협업하고 있습니다.</p><h2>클라이밍과의 친화성</h2><p>아웃도어를 사랑하는 클라이머에게 환경 보전은 자연스러운 활동입니다. 오르기 전 준비운동으로 짐 주변에서의 플로깅을 권장하고 있습니다.</p>');

-- ======================
-- ANNOUNCEMENTS (4 announcements)
-- ======================

INSERT INTO announcements (title, content, priority, is_active, expires_at, title_en, content_en, title_zh, content_zh, title_ko, content_ko) VALUES
('新規V16課題リリース！', '最高難易度の新課題が登場しました。30年のクライミング経験を活かした設計です。ぜひ挑戦してください！', 'high', 1, '2025-12-31', 'New V16 Problem Released!', 'Highest difficulty new problem has arrived. Designed with 30 years of climbing experience. Please challenge!', '新V16线路发布！', '最高难度的新线路登场。运用30年攀岩经验设计。请来挑战！', '신규 V16 과제 릴리스!', '최고 난이도의 신규 과제가 등장했습니다. 30년의 클라이밍 경험을 살린 설계입니다. 꼭 도전해 보세요!'),

('シューズ新モデル入荷', 'クライミングシューズ120モデルにさらに新作が追加！試履き→ジム試登でご自分に最適な一足を見つけてください。', 'medium', 1, '2025-06-30', 'New Shoe Models Arrived', 'New models added to 120 climbing shoes! Find your perfect pair through try-on → gym test.', '鞋子新款到货', '120款攀岩鞋又添新作！通过试穿→攀岩馆试爬找到最适合您的一双。', '슈즈 신모델 입고', '클라이밍 슈즈 120모델에 새 모델 추가! 시착→짐 테스트로 자신에게 최적의 한 켤레를 찾아보세요.'),

('プロギングイベント参加者募集', '次回開催は1月15日（日）。地域コミュニティに貢献しながら健康的に！清掃ラン参加者には特典もあります。', 'medium', 1, '2025-01-20', 'Plogging Event Participants Wanted', 'Next event on January 15 (Sun). Contribute to local community while getting healthy! Special benefits for cleanup run participants.', '拾荒慢跑活动参与者招募', '下次活动为1月15日（周日）。在为当地社区做贡献的同时保持健康！清洁跑参与者有特别福利。', '플로깅 이벤트 참가자 모집', '다음 개최는 1월 15일(일). 지역 커뮤니티에 기여하면서 건강하게! 청소 런 참가자에게는 특전도 있습니다.'),

('カフェ新メニュー登場', 'ナポリ直送豆を使用した新しいエスプレッソメニューが登場！クライミング前後の最高のお供です。', 'low', 1, '2025-03-31', 'New Cafe Menu Launched', 'New espresso menu using beans direct from Naples! Perfect companion before and after climbing.', '咖啡馆新菜单登场', '使用那不勒斯直送豆子的新浓缩咖啡菜单登场！攀岩前后的最佳伴侣。', '카페 신메뉴 등장', '나폴리 직송 원두를 사용한 새로운 에스프레소 메뉴가 등장! 클라이밍 전후의 최고의 동반자입니다.');
