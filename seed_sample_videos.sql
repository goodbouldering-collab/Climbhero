-- ClimbHero Sample Videos Collection 2024/2025
-- Real working YouTube climbing videos

-- Clear existing videos
DELETE FROM videos;

-- ===== BOULDERING CATEGORY =====
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
-- Best of Bouldering Compilation 2025
('https://www.youtube.com/watch?v=5BWkFqZYpbI', 'ボルダリングベスト集 2025', '世界トップクライマーによる2025年の最高のボルダリングシーンを厳選。次のプロジェクトのモチベーションに！', 'bouldering', 'youtube', 'youtube', '5BWkFqZYpbI', 'Best of Bouldering Compilation 2025', 'Best bouldering moments from top climbers in 2025', '2025年最佳抱石集锦', '2025年顶级攀岩者最佳抱石场景', '2025 볼더링 베스트 모음', '2025년 최고의 볼더링 장면 모음'),

-- V6 V10 V15 Difference
('https://www.youtube.com/watch?v=NAXANh3YVck', 'V6・V10・V15クライマーの違いとは？', '20年の経験から解説する各グレードの技術差。筋力だけでなくテクニックの重要性を深堀り', 'bouldering', 'youtube', 'youtube', 'NAXANh3YVck', 'Difference Between V6, V10 and V15 Climbers', 'After 20 years experience explaining technique vs strength at each grade', 'V6、V10和V15攀岩者的区别', '20年经验解析各级别的技术差异', 'V6, V10, V15 클라이머 차이', '20년 경험으로 해설하는 그레이드별 기술 차이'),

-- Men's Boulder Final Salt Lake City 2025
('https://www.youtube.com/watch?v=GDB0MDGARiE', 'IFSCボルダーファイナル ソルトレイクシティ2025', '2025年シーズン最高峰のボルダー競技。ランキング変動が激しい熱戦！', 'competition', 'youtube', 'youtube', 'GDB0MDGARiE', 'Men Boulder Final Salt Lake City 2025', 'One of the best men boulder finals with ranking changes throughout', '2025盐湖城男子抱石决赛', '2025年最顶级的男子抱石比赛', '2025 솔트레이크시티 남자볼더 결승', '2025 최고의 남자 볼더 결승전'),

-- V15 Flash Adam Ondra
('https://www.youtube.com/watch?v=_Wk4aKdXC9g', 'アダム・オンドラ V15（8C）フラッシュの軌跡', '世界最強クライマーによるV15フラッシュのドキュメンタリー。人類の限界に挑む', 'bouldering', 'youtube', 'youtube', '_Wk4aKdXC9g', 'Story of V15 (8C) Flash by Adam Ondra', 'Documentary of world best climber flashing V15', 'Adam Ondra V15闪攀记录', '世界最强攀岩者V15闪攀纪录片', '아담 온드라 V15 플래시 스토리', '세계최강 클라이머의 V15 플래시 기록'),

-- Best Climbs 2024
('https://www.youtube.com/watch?v=kn1-jmT7DsQ', '2024年ベストクライム総集編', '2024年に世界中で達成された最高のクライミングシーンを振り返る', 'bouldering', 'youtube', 'youtube', 'kn1-jmT7DsQ', 'Best Climbs of 2024', 'Looking back at the best climbing achievements worldwide in 2024', '2024年最佳攀登回顾', '回顾2024年全球最佳攀登成就', '2024 베스트 클라임', '2024년 전세계 최고의 등반 성과 회고');

-- ===== LEAD CLIMBING CATEGORY =====
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
-- Lead Finals Briançon 2024
('https://www.youtube.com/watch?v=a9htHC6KagA', 'IFSCリードファイナル ブリアンソン2024', 'フランスの美しい岩場で開催された世界大会。トップクライマーの技術を堪能', 'lead', 'youtube', 'youtube', 'a9htHC6KagA', 'Lead Finals Briançon 2024', 'World cup lead finals in beautiful French setting', '2024布里昂松先锋攀决赛', '在美丽的法国举办的世界杯先锋攀决赛', '2024 브리앙송 리드 결승', '아름다운 프랑스 암장에서의 월드컵'),

-- Lead Finals Seoul 2024
('https://www.youtube.com/watch?v=Zt5AbUllQAg', 'IFSCリードファイナル ソウル2024', '史上初の3種目同時開催大会でのリード決勝。Jessica PilzがJanja Garnbretを逆転', 'lead', 'youtube', 'youtube', 'Zt5AbUllQAg', 'Lead Finals Seoul 2024', 'First ever combined disciplines event - Pilz overtakes Garnbret', '2024首尔先锋攀决赛', '历史首次三项目同时举办的先锋攀决赛', '2024 서울 리드 결승', '최초 3종목 동시개최 대회 리드 결승'),

-- Lead Finals Chamonix 2024
('https://www.youtube.com/watch?v=UVp79oxI4Uc', 'IFSCリードファイナル シャモニー2024', '22回目の開催となるシャモニー大会。オリンピック直前の重要な一戦', 'lead', 'youtube', 'youtube', 'UVp79oxI4Uc', 'Lead Finals Chamonix 2024', '22nd Chamonix World Cup - crucial event before Olympics', '2024夏蒙尼先锋攀决赛', '第22届夏蒙尼世界杯，奥运前重要比赛', '2024 샤모니 리드 결승', '22회 샤모니 월드컵 올림픽 직전 중요 대회'),

-- Adam Ondra World Championships 2025
('https://www.youtube.com/watch?v=rHjVHaBhm7Y', 'アダム・オンドラ 2025世界選手権リードセミファイナル', 'レジェンドクライマーの世界選手権での挑戦。複数回ワールドチャンピオンの実力', 'lead', 'youtube', 'youtube', 'rHjVHaBhm7Y', 'Adam Ondra World Championships 2025 Lead Semi', 'Climbing legend competing at 2025 World Championships', 'Adam Ondra 2025世锦赛先锋半决赛', '传奇攀岩者在2025世锦赛的挑战', '아담 온드라 2025 세계선수권 리드 준결승', '레전드 클라이머의 세계선수권 도전');

-- ===== GEAR CATEGORY =====
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
-- Best Climbing Shoes 2024
('https://www.youtube.com/watch?v=geShckmkYnw', '2024年ベストクライミングシューズ5選', 'ボルダリング・トラッド・スポートに最適なシューズを実地テスト。グッぼる120モデルからの選び方参考に', 'gear', 'youtube', 'youtube', 'geShckmkYnw', '5 Best Climbing Shoes 2024', 'Field tested shoes for bouldering, trad and sport climbing', '2024年最佳攀岩鞋5款', '实地测试最适合抱石、传统、运动攀岩的鞋子', '2024 베스트 클라이밍 슈즈 5선', '볼더링, 트래드, 스포츠용 실지 테스트'),

-- Beginner Climbing Shoes Guide
('https://www.youtube.com/watch?v=N7hElzY6ToQ', '2024初心者向けクライミングシューズガイド', '初めてのシューズ選びに迷わない！3モデル実地テストレビュー', 'gear', 'youtube', 'youtube', 'N7hElzY6ToQ', '2024 Beginner Rock Climbing Shoes Guide', 'Best bouldering shoes for beginners - 3 models tested', '2024初学者攀岩鞋指南', '新手选鞋不迷茫！3款实测评测', '2024 초보자 클라이밍 슈즈 가이드', '처음 슈즈 선택에 도움되는 3모델 테스트'),

-- Sport Climbing Shoes 2024
('https://www.youtube.com/watch?v=MMujGEHZqK0', 'スポートクライミングシューズ2024年版', 'クライミングシューズのプロが解説する重要ポイントと具体例', 'gear', 'youtube', 'youtube', 'MMujGEHZqK0', 'Top Sport Climbing Shoes 2024', 'Shoe expert explains key elements with examples', '2024年运动攀岩鞋推荐', '攀岩鞋专家讲解关键要素和具体案例', '2024 스포츠 클라이밍 슈즈', '슈즈 전문가가 핵심 포인트 해설'),

-- Bouldering Shoes 2024
('https://www.youtube.com/watch?v=CQyPBWFFPK4', 'ボルダリングシューズ2024最新ラインナップ', 'La Sportiva・Scarpa・Unparallel等6ブランドを網羅', 'gear', 'youtube', 'youtube', 'CQyPBWFFPK4', 'Top Bouldering Shoes 2024', 'Complete lineup from La Sportiva, Scarpa, Unparallel and more', '2024年抱石鞋最新阵容', 'La Sportiva、Scarpa、Unparallel等6品牌全覆盖', '2024 볼더링 슈즈 최신 라인업', 'La Sportiva, Scarpa 등 6브랜드 총망라'),

-- New Climbing Shoes 2024
('https://www.youtube.com/watch?v=ocjvYYjBeCU', '2024年新作クライミングシューズ先行レビュー', 'Scarpa・La Sportiva・Unparallel・Boreal・Red Chiliの新モデル', 'gear', 'youtube', 'youtube', 'ocjvYYjBeCU', 'New Climbing Shoes 2024 First Look', 'New models from Scarpa, La Sportiva, Unparallel, Boreal, Red Chili', '2024新款攀岩鞋抢先看', 'Scarpa、La Sportiva等新款鞋提前预览', '2024 신작 클라이밍 슈즈 선행 리뷰', 'Scarpa, La Sportiva 등 신모델 미리보기');

-- ===== TUTORIAL CATEGORY =====
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
-- Multipitch Climbing Tutorial
('https://www.youtube.com/watch?v=iT0qYd9E6Nw', 'マルチピッチクライミング入門', 'トラッドクライミング学習シリーズPart6：マルチピッチのリード方法を詳しく解説', 'tutorial', 'youtube', 'youtube', 'iT0qYd9E6Nw', 'Learning Multipitch Lead Climbing', 'Trad climbing series Part 6 - How to lead multipitch in detail', '多段攀岩入门教程', '传统攀岩学习第6部分：详细讲解多段先锋', '멀티피치 클라이밍 입문', '트래드 클라이밍 시리즈 파트6: 멀티피치 리드 상세 해설'),

-- Magnus Midtbo Strength Training
('https://www.youtube.com/watch?v=Ms3yRqjvWxY', 'これまで見たことない筋力トレーニング - Magnus Midtbø', 'クライミング界のレジェンドが驚愕の筋力を披露', 'tutorial', 'youtube', 'youtube', 'Ms3yRqjvWxY', 'Climbing Strength Training Never Seen Before', 'Climbing legend Magnus shows incredible strength training', '前所未见的攀岩力量训练', '攀岩传奇展示惊人的力量训练', '본 적 없는 클라이밍 근력 트레이닝', '클라이밍 레전드가 보여주는 놀라운 근력');

-- ===== JAPAN CLIMBING GYM =====
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
-- B-Pump Ogikubo - World's Hardest Gym
('https://www.youtube.com/watch?v=EGXbq-ABTjU', 'B-PUMP荻窪 - 世界最難関ボルダリングジム', '日本が誇る世界最難関のインドアクライミングジム。BLACK TAPEの伝説', 'other', 'youtube', 'youtube', 'EGXbq-ABTjU', 'B-PUMP Ogikubo - World Hardest Bouldering Gym', 'Japan legendary indoor gym - home of BLACK TAPE', 'B-PUMP�的窪-世界最难抱石馆', '日本传奇室内攀岩馆，黑带的故乡', 'B-PUMP 오기쿠보 - 세계최난관 볼더링짐', '일본이 자랑하는 세계최난관 인도어짐'),

-- Japanese Gym Grades
('https://www.youtube.com/watch?v=wiVV5p7j3EY', '日本のジムグレードは本当に辛いのか？', '海外クライマーが検証する日本ジムのグレード感覚。V3でも完璧な技術が必要', 'other', 'youtube', 'youtube', 'wiVV5p7j3EY', 'Are Japanese Gym Grades Really That Hard?', 'Foreign climber tests Japanese gym grading - V3 requires perfect technique', '日本攀岩馆难度真的那么高吗？', '外国攀岩者验证日本攀岩馆的难度感觉', '일본 짐 그레이드는 정말 어려운가?', '외국 클라이머가 검증하는 일본 짐 그레이드'),

-- Olympic Climber's Home Gym
('https://www.youtube.com/watch?v=Izhq2zPLTyM', 'オリンピック選手を育てた日本のジム', 'Green Arrow八千代 - 現役オリンピック選手がここから始まった', 'other', 'youtube', 'youtube', 'Izhq2zPLTyM', 'The Gym That Raised Olympic Climber', 'Green Arrow Yachiyo - where current Olympic athlete started climbing', '培养奥运选手的日本攀岩馆', 'Green Arrow八千代-现役奥运选手从这里起步', '올림픽 선수를 키운 일본 짐', 'Green Arrow 야치요 - 현역 올림픽 선수 출신 짐'),

-- Tokyo B-Pump Tour
('https://www.youtube.com/watch?v=1KspjIo5NNo', '世界最難関ジムに挑戦...撃沈記録', 'B-PUMP荻窪での挑戦記録。コンディション不良でも挑んだ結果は...', 'other', 'youtube', 'youtube', '1KspjIo5NNo', 'Challenging World Hardest Gym...Got Destroyed', 'Challenge at B-PUMP Ogikubo despite not being physically fit', '挑战世界最难馆...惨败记录', 'B-PUMP荻窪挑战记录，状态不佳也要挑战', '세계최난관 짐에 도전...격침 기록', 'B-PUMP 오기쿠보 컨디션 불량에도 도전'),

-- Tokyo Pump 2 Kawasaki
('https://www.youtube.com/watch?v=QN6mDZ5VwiY', 'Pump 2 川崎 東京ボルダリングセッション', '2024年7月の東京クライミングジムセッション記録', 'other', 'youtube', 'youtube', 'QN6mDZ5VwiY', 'Pump 2 Kawasaki Tokyo Bouldering Session', 'Tokyo climbing gym session July 2024', 'Pump 2川崎 东京抱石记录', '2024年7月东京攀岩馆训练记录', 'Pump 2 가와사키 도쿄 볼더링 세션', '2024년 7월 도쿄 클라이밍짐 세션');

-- ===== COMPETITION =====
INSERT INTO videos (url, title, description, category, platform, media_source, video_id_external, title_en, description_en, title_zh, description_zh, title_ko, description_ko) VALUES
-- Men's Boulder Seoul 2025
('https://www.youtube.com/watch?v=K5zPa1YBZ9Y', 'IFSCボルダーファイナル ソウル2025', '2025年シーズンのハイライト。韓国ソウルでの熱戦', 'competition', 'youtube', 'youtube', 'K5zPa1YBZ9Y', 'Men Boulder Final Seoul 2025', '2025 season highlight in vibrant Seoul, Korea', '2025首尔男子抱石决赛', '2025年赛季亮点，在首尔的激烈比赛', '2025 서울 남자볼더 결승', '2025 시즌 하이라이트 서울 열전'),

-- First Boulder Final 2025
('https://www.youtube.com/watch?v=lGY6pfI8oDU', '2025年シーズン最初のボルダーファイナル', 'IFSC World Cup 2025が柯橋でボルダー大会として開幕', 'competition', 'youtube', 'youtube', 'lGY6pfI8oDU', 'First Boulder Final of 2025 Season', 'IFSC World Cup 2025 kicks off in Keqiao with Boulder', '2025年赛季首场抱石决赛', 'IFSC世界杯2025在柯桥以抱石大赛开幕', '2025 시즌 첫 볼더 파이널', 'IFSC 월드컵 2025 커차오에서 볼더로 개막'),

-- Magnus vs America's Strongest
('https://www.youtube.com/watch?v=kkKFt3ptYwQ', 'Magnus Midtbø vs アメリカ最強クライマー', 'YouTubeクライミング界の帝王がアメリカの最強クライマーに挑戦', 'competition', 'youtube', 'youtube', 'kkKFt3ptYwQ', 'Magnus vs America Strongest Climbers', 'YouTube climbing king challenges America strongest climbers', 'Magnus挑战美国最强攀岩者', 'YouTube攀岩之王挑战美国最强选手', 'Magnus vs 미국 최강 클라이머', '유튜브 클라이밍 킹이 미국 최강에 도전'),

-- V15 Challenger
('https://www.youtube.com/watch?v=SlNkl_hG7j0', 'V15クライマーに1v1対決を挑んだ結果', 'プロクライマーとの1対1チャレンジ。実力差を思い知らされる', 'competition', 'youtube', 'youtube', 'SlNkl_hG7j0', 'I Challenged a V15 Climber to 1v1', 'Pro climber 1v1 challenge showing the skill gap', '挑战V15攀岩者1v1对决', '与职业攀岩者1v1挑战，感受实力差距', 'V15 클라이머에게 1v1 도전한 결과', '프로클라이머와 1대1 도전 실력차 체감');

-- Update video stats with realistic data
UPDATE videos SET 
    views = ABS(RANDOM()) % 50000 + 1000,
    likes = ABS(RANDOM()) % 500 + 50,
    created_at = datetime('now', '-' || (ABS(RANDOM()) % 90) || ' days');

-- Ensure we have some trending videos
UPDATE videos SET views = views * 10, likes = likes * 5 WHERE id IN (
    SELECT id FROM videos ORDER BY RANDOM() LIMIT 5
);

SELECT 'Sample videos inserted: ' || COUNT(*) as result FROM videos;
