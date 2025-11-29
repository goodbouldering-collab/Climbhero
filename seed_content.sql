-- ClimbHero Blog Posts and Announcements
-- Real content with multilingual support

-- Clear existing content
DELETE FROM blog_posts;
DELETE FROM announcements;

-- ===== BLOG POSTS =====
INSERT INTO blog_posts (title, content, image_url, published_date, title_en, content_en, title_zh, content_zh, title_ko, content_ko) VALUES
('マルチピッチクライミング完全ガイド', 
'<h2>マルチピッチとは？</h2><p>複数のピッチを連続して登るクライミング技術です。30年の経験から、安全なビレイ技術とロープワークを解説します。</p><h2>必要な装備</h2><p>ハーネス、ロープ、カラビナ、確保器など。グッぼるショップで全て揃います。</p><h2>岩場での実践</h2><p>彦根周辺の岩場で実践できます。年間2.5万人が利用するジムで基礎を学びましょう。</p><h3>安全管理のポイント</h3><ul><li>ダブルチェックの習慣化</li><li>コミュニケーションの明確化</li><li>天候判断の重要性</li></ul>', 
'/images/blog/multipitch.jpg', 
'2024-11-20', 
'Complete Multipitch Climbing Guide', 
'<h2>What is Multipitch?</h2><p>Climbing technique connecting multiple pitches. 30 years experience teaching safe belay and ropework.</p><h2>Required Gear</h2><p>Harness, rope, carabiners, belay device - all available at Gubboru Shop.</p><h2>Practice at Crag</h2><p>Practice at crags around Hikone. Learn basics at gym with 25,000 annual users.</p>', 
'多段攀岩完全指南', 
'<h2>什么是多段攀岩？</h2><p>连续攀爬多个段落的技术。30年经验教授安全保护和绳索技术。</p><h2>必要装备</h2><p>安全带、绳索、快挂、保护器等-Gubboru商店全齐。</p><h2>岩场实践</h2><p>在彦根周边岩场实践。在年接待2.5万人的攀岩馆学习基础。</p>', 
'멀티피치 클라이밍 완전가이드', 
'<h2>멀티피치란?</h2><p>여러 피치를 연속으로 오르는 기술. 30년 경험으로 안전한 빌레이와 로프워크 해설.</p><h2>필요 장비</h2><p>하네스, 로프, 카라비너, 확보기 등-Gubboru샵에서 구비.</p><h2>암장 실천</h2><p>히코네 주변 암장에서 실천. 연 2.5만명 이용 짐에서 기초 학습.</p>'),

('ボルダリングV難度完全攻略法', 
'<h2>V0からV10までの道のり</h2><p>グッぼるボルダリングの課題管理システムで、あなたの登攀データを分析。効率的な上達法を30年の経験から伝授します。</p><h2>肩甲骨主導のムーブ</h2><p>小円筋と肩甲骨を意識したフォームが重要。筋力ではなく体幹で登ります。</p><h2>120モデルのシューズ選び</h2><p>グレードに合わせた最適なシューズ選びも重要。試履き→ジム試登で確認できます。</p><h3>グレード別アプローチ</h3><ul><li>V0-V2: フットワーク基礎</li><li>V3-V5: ムーブの引き出し</li><li>V6-V8: パワーと持久力</li><li>V9+: メンタルとコンディショニング</li></ul>', 
'/images/blog/v-grades.jpg', 
'2024-11-18', 
'Bouldering V-Grade Complete Strategy', 
'<h2>Journey from V0 to V10</h2><p>Analyze your climbing data with Gubboru problem management system. Learn efficient progression from 30 years experience.</p><h2>Scapula-Driven Movement</h2><p>Focus on teres minor and scapula form. Climb with core, not muscle strength.</p><h2>Choosing from 120 Shoe Models</h2><p>Optimal shoe selection matters. Try-on → gym test available.</p>', 
'抱石V难度完全攻略', 
'<h2>V0到V10之路</h2><p>用Gubboru线路管理系统分析攀爬数据。30年经验传授高效进步法。</p><h2>肩胛骨主导动作</h2><p>注意小圆肌和肩胛骨姿势。用核心不用肌肉力量攀爬。</p><h2>120款鞋子选择</h2><p>根据难度选最佳鞋子。可试穿→攀岩馆测试。</p>', 
'볼더링 V난이도 완전공략', 
'<h2>V0부터 V10까지</h2><p>Gubboru 과제관리시스템으로 등반데이터 분석. 30년 경험의 효율적 성장법.</p><h2>견갑골 주도 무브</h2><p>소원근과 견갑골 의식한 폼 중요. 근력이 아닌 코어로 등반.</p><h2>120모델 슈즈선택</h2><p>난이도별 최적 슈즈선택 중요. 시착→짐테스트 가능.</p>'),

('クライミングと環境保全活動', 
'<h2>プロギングとは</h2><p>ジョギングしながらゴミ拾い。プロギングジャパン副会長として年間30回超のイベントを開催。延べ4,000人参加で2.4トン回収。</p><h2>スターバックスとの協業</h2><p>企業と連携した地域活性化。クライミングコミュニティの環境意識向上を目指します。</p><h2>SDGsへの取り組み</h2><p>彦根駅前の遊休物件再生プロジェクト。クライミング施設を核とした地域創生。</p><h3>具体的な数値実績</h3><ul><li>年間イベント回数: 30回以上</li><li>累計参加者: 4,000人</li><li>回収ゴミ量: 2.4トン</li><li>協賛企業数: 15社</li></ul>', 
'/images/blog/plogging.jpg', 
'2024-11-15', 
'Climbing and Environmental Conservation', 
'<h2>What is Plogging</h2><p>Picking trash while jogging. As Plogging Japan VP, host 30+ events yearly. 4,000 participants collected 2.4 tons.</p><h2>Starbucks Collaboration</h2><p>Regional revitalization with corporate partners. Raising environmental awareness in climbing community.</p><h2>SDGs Initiative</h2><p>Hikone Station vacant property regeneration. Regional revitalization centered on climbing facility.</p>', 
'攀岩与环保活动', 
'<h2>什么是拾荒慢跑</h2><p>边慢跑边捡垃圾。作为拾荒慢跑日本副会长，每年举办30+活动。4,000人参与回收2.4吨。</p><h2>星巴克合作</h2><p>与企业合作地区振兴。提高攀岩社区环保意识。</p><h2>SDGs措施</h2><p>彦根站前闲置物业再生。以攀岩设施为核心的地区创生。</p>', 
'클라이밍과 환경보전', 
'<h2>플로깅이란</h2><p>조깅하며 쓰레기줍기. 플로깅재팬 부회장으로 연30회+ 이벤트. 4,000명 참가 2.4톤 회수.</p><h2>스타벅스 협업</h2><p>기업과 지역활성화. 클라이밍커뮤니티 환경의식 향상.</p><h2>SDGs 대응</h2><p>히코네역 유휴물건 재생. 클라이밍시설 중심 지역창생.</p>'),

('クライミングジム選びのポイント', 
'<h2>ジム・ショップ・カフェ一体型の魅力</h2><p>グッぼるは日本唯一の3in1施設。年間2.5万人が利用する課題管理システムで、あなたの成長を可視化します。</p><h2>120モデルのシューズ在庫</h2><p>LINE接客→EC→試履き→ジム試登の一気通貫サービス。クラッシュパッド60枚超の圧倒的在庫。</p><h2>ナポリ式エスプレッソ</h2><p>カフェ併設でクライミング前後のリラックス。IoT計測で豆の鮮度管理。</p><h3>グッぼるの強み</h3><ul><li>ジム・ショップ・カフェの3in1</li><li>120モデル以上のシューズ在庫</li><li>60枚以上のクラッシュパッド</li><li>独自課題管理システム</li></ul>', 
'/images/blog/gym-selection.jpg', 
'2024-11-12', 
'Choosing the Right Climbing Gym', 
'<h2>Gym-Shop-Cafe Integration</h2><p>Gubboru is Japan only 3-in-1 facility. Problem management system used by 25,000 annually visualizes your growth.</p><h2>120 Shoe Models Stock</h2><p>LINE service → EC → try-on → gym test integration. 60+ crash pads overwhelming inventory.</p><h2>Napoli Espresso</h2><p>Cafe for pre/post climbing relaxation. IoT bean freshness monitoring.</p>', 
'攀岩馆选择要点', 
'<h2>攀岩馆商店咖啡馆一体魅力</h2><p>Gubboru是日本唯一3合1设施。年2.5万人使用的线路管理系统可视化您的成长。</p><h2>120款鞋子库存</h2><p>LINE接待→电商→试穿→攀岩馆测试一站式。60+抱石垫压倒性库存。</p><h2>那不勒斯咖啡</h2><p>咖啡馆供攀岩前后放松。物联网监测豆子新鲜度。</p>', 
'클라이밍짐 선택 포인트', 
'<h2>짐샵카페 일체형 매력</h2><p>Gubboru는 일본유일 3in1시설. 연2.5만명 이용 과제관리시스템으로 성장 가시화.</p><h2>120모델 슈즈재고</h2><p>LINE접객→EC→시착→짐테스트 통합서비스. 60+크래시패드 압도적재고.</p><h2>나폴리 에스프레소</h2><p>카페에서 클라이밍 전후 휴식. IoT 원두신선도 관리.</p>'),

('2024年最新クライミングシューズレビュー', 
'<h2>注目の新作モデル</h2><p>Scarpa・La Sportiva・Unparallel・Boreal・Red Chiliの最新ラインナップを徹底レビュー。グッぼるの120モデル在庫から選び方を解説。</p><h2>初心者におすすめの一足</h2><p>La Sportiva TarantulaceやScarpa Originなど、フィット感と価格のバランスが良いモデルを厳選。</p><h2>上級者向けアグレッシブシューズ</h2><p>Evolv Oracle、Scarpa Drago LV、La Sportiva Solution Compなど、V10以上を目指すクライマー必見。</p><h3>シューズ選びのチェックポイント</h3><ul><li>足型との相性</li><li>ダウントゥの角度</li><li>ラバーの硬さ</li><li>エッジング性能</li></ul>', 
'/images/blog/shoes-review.jpg', 
'2024-11-10', 
'2024 Climbing Shoes Review', 
'<h2>Notable New Models</h2><p>Complete review of latest lineup from Scarpa, La Sportiva, Unparallel, Boreal, Red Chili. Selection guide from Gubboru 120 model inventory.</p><h2>Recommended for Beginners</h2><p>La Sportiva Tarantulace, Scarpa Origin etc. - models with good fit and price balance.</p><h2>Aggressive Shoes for Advanced</h2><p>Evolv Oracle, Scarpa Drago LV, La Sportiva Solution Comp - must-see for V10+ climbers.</p>', 
'2024最新攀岩鞋评测', 
'<h2>值得关注的新款</h2><p>Scarpa、La Sportiva、Unparallel等最新产品全面评测。从Gubboru 120款库存中讲解选购方法。</p><h2>初学者推荐</h2><p>La Sportiva Tarantulace、Scarpa Origin等舒适度与价格平衡好的款式。</p><h2>高级攀岩者激进款</h2><p>Evolv Oracle、Scarpa Drago LV等，瞄准V10以上必看。</p>', 
'2024 최신 클라이밍 슈즈 리뷰', 
'<h2>주목 신작모델</h2><p>Scarpa, La Sportiva 등 최신 라인업 철저 리뷰. Gubboru 120모델 재고에서 선택법 해설.</p><h2>초보자 추천</h2><p>La Sportiva Tarantulace, Scarpa Origin 등 핏과 가격 밸런스 좋은 모델.</p><h2>상급자용 어그레시브 슈즈</h2><p>Evolv Oracle, Scarpa Drago LV 등 V10이상 목표 클라이머 필견.</p>');

-- ===== ANNOUNCEMENTS =====
INSERT INTO announcements (title, content, priority, is_active, title_en, content_en, title_zh, content_zh, title_ko, content_ko) VALUES
('🎉 年間プラン50%OFF キャンペーン中！', 
'プレミアム年間プランが月額換算¥490で利用可能！無制限いいね、動画投稿、お気に入り管理、広告非表示など全機能をお得に。', 
1, 1, 
'🎉 Annual Plan 50% OFF Campaign!', 
'Premium annual plan available at ¥490/month equivalent! Unlimited likes, video uploads, favorites, ad-free - all features at great price.', 
'🎉 年度计划5折优惠中！', 
'高级年度计划月均只需490日元！无限点赞、视频上传、收藏管理、无广告等全功能超值体验。', 
'🎉 연간플랜 50%OFF 캠페인!', 
'프리미엄 연간플랜 월환산 ¥490! 무제한좋아요, 동영상투고, 즐겨찾기, 광고없음 전기능 혜택.'),

('🏆 V16新課題リリース', 
'30年のクライミング経験を活かした最高難易度課題が登場！肩甲骨と小円筋を駆使する革新的ムーブを体験してください。グッぼるボルダリングでお待ちしています。', 
1, 1, 
'🏆 New V16 Problem Released', 
'Created from 30 years climbing experience - highest difficulty problem! Experience innovative movement using scapula and teres minor. We await you at Gubboru Bouldering.', 
'🏆 V16新线路发布', 
'基于30年攀岩经验打造最高难度线路！体验使用肩胛骨和小圆肌的创新动作。Gubboru抱石等您挑战。', 
'🏆 V16 신규과제 릴리즈', 
'30년 경험으로 만든 최고난이도! 견갑골과 소원근 활용 혁신무브 체험. Gubboru볼더링에서 기다립니다.'),

('☕ カフェ新メニュー×プロギングイベント', 
'ナポリ直送豆の新エスプレッソメニュー登場！次回プロギングは12/15(日)開催。スターバックスとのコラボイベントです。参加費無料、事前登録不要。', 
2, 1, 
'☕ New Cafe Menu × Plogging Event', 
'New espresso with Naples direct import beans! Next plogging 12/15(Sun). Starbucks collaboration event. Free entry, no registration needed.', 
'☕ 咖啡馆新菜单×拾荒活动', 
'那不勒斯直送豆子新咖啡！下次拾荒12/15(周日)举办。星巴克合作活动。免费参加，无需预约。', 
'☕ 카페신메뉴×플로깅이벤트', 
'나폴리직송원두 신메뉴! 다음플로깅 12/15(일). 스타벅스콜라보. 참가무료, 사전등록불필요.');

SELECT 'Blog posts inserted: ' || COUNT(*) as result FROM blog_posts;
SELECT 'Announcements inserted: ' || COUNT(*) as result FROM announcements;
