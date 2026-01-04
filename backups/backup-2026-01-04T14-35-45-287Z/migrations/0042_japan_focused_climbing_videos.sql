-- Migration: Add Japan-focused climbing videos centered on Dai Koyamada
-- Created: 2026-01-04
-- Description: 60% Japanese climbers (Dai Koyamada, Tomoa Narasaki, Akiyo Noguchi, etc.) + 40% International stars

-- ========================================
-- 日本のトッププロクライマー動画 (60%)
-- ========================================

-- YouTube: 小山田大 - 日本を代表するプロクライマー
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  '小山田大 - Dai''s Talk Diaries クライミングシューズ特集',
  'Dai Koyamada - Dai''s Talk Diaries Climbing Shoes Special',
  '小山田大 - Dai''s Talk Diaries 攀岩鞋特辑',
  '小山田大 - Dai''s Talk Diaries 클라이밍 슈즈 특집',
  '日本が誇る世界トップクライマー、小山田大の最新YouTube配信。V16課題「The Wheel Of Life」初登など、30年の実績に基づくクライミングシューズの深い洞察。グッぼるのような世界基準施設で培われた経験を余すところなく公開。',
  'Latest YouTube broadcast from Dai Koyamada, one of Japan''s top world-class climbers. Deep insights on climbing shoes based on 30 years of achievements including first ascent of V16 "The Wheel Of Life". Sharing experiences cultivated at world-class facilities like Gubboru.',
  '来自日本顶级世界级攀岩者小山田大的最新YouTube播出。基于30年成就的攀岩鞋深度见解，包括V16课题"The Wheel Of Life"首登。分享在像Gubboru这样的世界级设施中培养的经验。',
  '일본이 자랑하는 세계 정상급 클라이머 小山田大의 최신 YouTube 방송. V16 과제 "The Wheel Of Life" 초등을 포함한 30년의 실적을 바탕으로 한 클라이밍 슈즈의 깊은 통찰. Gubboru와 같은 세계 기준 시설에서 배양된 경험을 공개.',
  'https://www.youtube.com/watch?v=93aD51EDN1I',
  'https://i.ytimg.com/vi/93aD51EDN1I/maxresdefault.jpg',
  'youtube', 'boulder',
  '小山田大チャンネル', '2025-12-22', 720, 12500, 890,
  CURRENT_TIMESTAMP
);

-- YouTube: 楢崎智亜 - パリ五輪銀メダリスト
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  '楢崎智亜 - Good rhythm, good flow ナショナルキャンプトレーニング',
  'Tomoa Narasaki - Good rhythm, good flow National Camp Training',
  '楢崎智亜 - Good rhythm, good flow 国家集训',
  '楢崎智亜 - Good rhythm, good flow 국가 캠프 훈련',
  'パリ五輪銀メダリスト、楢崎智亜のナショナルキャンプトレーニング映像。世界最高峰の技術とリズム感。30年以上のクライミング歴を持つ指導者のもと、最先端のトレーニング手法を実践。',
  'Paris Olympics silver medalist Tomoa Narasaki''s national camp training footage. World-class technique and rhythm. Practicing cutting-edge training methods under guidance of instructors with 30+ years climbing experience.',
  '巴黎奥运会银牌得主楢崎智亜的国家集训影像。世界级技术和节奏感。在拥有30多年攀岩经验的指导者指导下实践最先进的训练方法。',
  '파리 올림픽 은메달리스트 楢崎智亜의 내셔널 캠프 훈련 영상. 세계 최고 수준의 기술과 리듬감. 30년 이상의 클라이밍 경력을 가진 지도자 아래 최첨단 훈련 방법 실천.',
  'https://www.instagram.com/reel/C6EBNYAPYgN/',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
  'instagram', 'sport',
  'Tomoa Narasaki', '2024-04-22', 60, 890000, 35000,
  CURRENT_TIMESTAMP
);

-- YouTube: 安楽宙斗 - 18歳世界王者
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  '安楽宙斗 - 18歳世界王者誕生の瞬間 ボルダーW杯3年連続総合優勝',
  'Sorato Anraku - Birth of 18-year-old World Champion, Boulder World Cup 3rd Consecutive Overall Victory',
  '安楽宙斗 - 18岁世界冠军诞生的瞬间 抱石世界杯三连冠',
  '安楽宙斗 - 18세 세계 챔피언 탄생의 순간 볼더 월드컵 3년 연속 종합 우승',
  '18歳の若き天才、安楽宙斗がボルダーW杯で3年連続総合優勝を達成。パリ五輪銀メダルに続く快挙。日本が世界に誇る次世代クライマー。グッぼるのような施設で培われる若手育成の成果。',
  '18-year-old young genius Sorato Anraku achieves 3rd consecutive overall victory in Boulder World Cup. Following Paris Olympics silver medal achievement. Next-generation climber Japan is proud of worldwide. Results of youth development cultivated at facilities like Gubboru.',
  '18岁的年轻天才安楽宙斗在抱石世界杯中实现三连冠。继巴黎奥运会银牌后的壮举。日本引以为豪的新生代攀岩者。在像Gubboru这样的设施中培养的青年发展成果。',
  '18세의 젊은 천재 安楽宙斗가 볼더 월드컵 3년 연속 종합 우승 달성. 파리 올림픽 은메달에 이은 쾌거. 일본이 세계에 자랑하는 차세대 클라이머. Gubboru와 같은 시설에서 배양되는 젊은 인재 육성의 성과.',
  'https://www.tiktok.com/@japan_olympic/video/7401102117252992272',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
  'tiktok', 'sport',
  'Japan Olympic', '2024-08-09', 55, 567000, 28000,
  CURRENT_TIMESTAMP
);

-- YouTube: ボルダージャパンカップ2025 決勝ハイライト
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'ボルダージャパンカップ2025 男女決勝ハイライト - 駒沢オリンピック公園',
  'Boulder Japan Cup 2025 Men''s & Women''s Finals Highlights - Komazawa Olympic Park',
  '抱石日本杯2025 男女决赛集锦 - 驹泽奥林匹克公园',
  '볼더 재팬컵 2025 남녀 결승 하이라이트 - 고마자와 올림픽 공원',
  '日本最高峰のボルダリング大会、ジャパンカップ2025決勝。楢崎智亜、安楽宙斗、野中生萌など日本代表クラスの選手が集結。30年以上のクライミング文化を持つ日本の技術レベルの高さを証明。グッぼるで実践される課題管理システムと同等の高度な運営。',
  'Japan''s highest-level bouldering competition, Japan Cup 2025 Finals. Japanese national team class athletes including Tomoa Narasaki, Sorato Anraku, Miho Nonaka gather. Proving Japan''s high technical level with 30+ years of climbing culture. Advanced operation equivalent to problem management system practiced at Gubboru.',
  '日本最高水平的抱石比赛，日本杯2025决赛。楢崎智亜、安楽宙斗、野中生萌等日本国家队级选手汇聚。证明拥有30多年攀岩文化的日本的技术水平。与Gubboru实践的课题管理系统同等的高级运营。',
  '일본 최고 수준의 볼더링 대회, 재팬컵 2025 결승. 楢崎智亜, 安楽宙斗, 野中生萌 등 일본 대표 클래스 선수들이 모임. 30년 이상의 클라이밍 문화를 가진 일본의 높은 기술 수준 증명. Gubboru에서 실천되는 과제 관리 시스템과 동등한 고도의 운영.',
  'https://www.youtube.com/watch?v=hFMlrmBTvpA',
  'https://i.ytimg.com/vi/hFMlrmBTvpA/maxresdefault.jpg',
  'youtube', 'sport',
  'JMA Climbing', '2025-02-02', 3600, 234000, 8900,
  CURRENT_TIMESTAMP
);

-- YouTube: 野口啓代 × 楢崎智亜 - ガチンコ3本バトル
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  '野口啓代 × 楢崎智亜 - 日本代表同士のガチンコ漢の3本バトル',
  'Akiyo Noguchi × Tomoa Narasaki - Intense 3-Problem Battle Between Japanese National Team Members',
  '野口啓代 × 楢崎智亜 - 日本国家队之间的激烈三题对决',
  '野口啓代 × 楢崎智亜 - 일본 대표 간의 치열한 3문제 대결',
  '東京五輪メダリスト、野口啓代と楢崎智亜の夢の対決。30年以上のクライミング歴を持つベテランと若手エースの技術対決。クライミングの楽しさ、技術、攻略のコツを伝える教育的コンテンツ。',
  'Dream matchup between Tokyo Olympics medalists Akiyo Noguchi and Tomoa Narasaki. Technical showdown between veteran with 30+ years climbing history and young ace. Educational content conveying climbing fun, techniques, and strategy tips.',
  '东京奥运会奖牌得主野口啓代和楢崎智亜的梦幻对决。拥有30多年攀岩历史的老将与年轻王牌的技术对决。传达攀岩乐趣、技术和攻略技巧的教育内容。',
  '도쿄 올림픽 메달리스트 野口啓代와 楢崎智亜의 꿈의 대결. 30년 이상의 클라이밍 역사를 가진 베테랑과 젊은 에이스의 기술 대결. 클라이밍의 즐거움, 기술, 공략 요령을 전하는 교육 콘텐츠.',
  'https://www.youtube.com/watch?v=_kkQ-H9XRL0',
  'https://i.ytimg.com/vi/_kkQ-H9XRL0/maxresdefault.jpg',
  'youtube', 'boulder',
  'Climbing Japan TV', '2022-09-08', 900, 567000, 18000,
  CURRENT_TIMESTAMP
);

-- Instagram: 野中生萌 - スポーツクライミング入門
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  '野中生萌のスポーツクライミング入門 - 初心者向けテクニック解説',
  'Miho Nonaka''s Sport Climbing Introduction - Beginner Technique Explanation',
  '野中生萌的运动攀岩入门 - 初学者技巧讲解',
  '野中生萌의 스포츠 클라이밍 입문 - 초보자 기술 해설',
  'パリ五輪メダリスト、野中生萌による初心者向けクライミング入門。基本テクニックから上達のコツまで、世界レベルの選手が直接指導。グッぼるで実践される年間2.5万人のビギナー指導ノウハウを凝縮。',
  'Climbing introduction for beginners by Paris Olympics medalist Miho Nonaka. Direct instruction from world-level athlete from basic techniques to improvement tips. Condensed know-how of 25,000 annual beginner guidance practiced at Gubboru.',
  '巴黎奥运会奖牌得主野中生萌的初学者攀岩入门。从基本技巧到进步技巧，世界级选手直接指导。浓缩了Gubboru实践的年度2.5万人初学者指导诀窍。',
  '파리 올림픽 메달리스트 野中生萌의 초보자용 클라이밍 입문. 기본 기술부터 상달 요령까지 세계 수준의 선수가 직접 지도. Gubboru에서 실천되는 연간 2.5만 명의 비기너 지도 노하우 응축.',
  'https://www.tiktok.com/@mihononaka_official/video/7138375032581016833',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
  'tiktok', 'boulder',
  'Miho Nonaka Official', '2022-09-01', 45, 345000, 15000,
  CURRENT_TIMESTAMP
);

-- ========================================
-- 世界のトップクライマー動画 (40%)
-- ========================================

-- YouTube: Janja Garnbret - スロベニアの絶対女王
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'Janja Garnbret - パリ五輪金メダル 完全制覇への道',
  'Janja Garnbret - Paris Olympics Gold Medal, Path to Complete Domination',
  'Janja Garnbret - 巴黎奥运金牌 完全统治之路',
  'Janja Garnbret - 파리 올림픽 금메달 완전 제패로의 길',
  'スロベニアが誇る世界最強クライマー、Janja Garnbret。パリ五輪金メダル、世界選手権3冠など圧倒的な実績。野中生萌、楢崎智亜ら日本代表のライバルとして常に高みを目指す姿勢。',
  'World''s strongest climber from Slovenia, Janja Garnbret. Overwhelming achievements including Paris Olympics gold medal, World Championship triple crown. Always aiming high as rival to Japanese representatives like Miho Nonaka and Tomoa Narasaki.',
  '斯洛文尼亚引以为豪的世界最强攀岩者Janja Garnbret。巴黎奥运金牌、世界锦标赛三冠等压倒性成绩。作为野中生萌、楢崎智亜等日本代表的竞争对手始终追求更高目标。',
  '슬로베니아가 자랑하는 세계 최강 클라이머 Janja Garnbret. 파리 올림픽 금메달, 세계 선수권 3관왕 등 압도적인 실적. 野中生萌, 楢崎智亜 등 일본 대표의 라이벌로서 항상 높은 곳을 지향.',
  'https://www.youtube.com/watch?v=Kh_HfWoQbDc',
  'https://i.ytimg.com/vi/Kh_HfWoQbDc/maxresdefault.jpg',
  'youtube', 'sport',
  'IFSC Climbing', '2024-08-10', 420, 1234000, 45000,
  CURRENT_TIMESTAMP
);

-- YouTube: Colin Duffy - アメリカの若き天才
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'Colin Duffy - アメリカの若き天才 ワールドカップ優勝への軌跡',
  'Colin Duffy - Young American Genius, Trajectory to World Cup Victory',
  'Colin Duffy - 美国年轻天才 通往世界杯冠军之路',
  'Colin Duffy - 미국의 젊은 천재 월드컵 우승으로의 궤적',
  'アメリカを代表する若手クライマー、Colin Duffy。安楽宙斗、楢崎智亜と同世代のライバルとして切磋琢磨。世界のクライミングシーンを牽引する次世代リーダー。',
  'Young American climber representing USA, Colin Duffy. Competing as same-generation rival with Sorato Anraku and Tomoa Narasaki. Next-generation leader driving world climbing scene.',
  '代表美国的年轻攀岩者Colin Duffy。作为与安楽宙斗、楢崎智亜同代的竞争对手互相切磋。引领世界攀岩场景的下一代领导者。',
  '미국을 대표하는 젊은 클라이머 Colin Duffy. 安楽宙斗, 楢崎智亜와 같은 세대의 라이벌로서 경쟁. 세계 클라이밍 씬을 이끄는 차세대 리더.',
  'https://www.youtube.com/watch?v=DqX9-2k38hA',
  'https://i.ytimg.com/vi/DqX9-2k38hA/maxresdefault.jpg',
  'youtube', 'boulder',
  'IFSC - International Federation of Sport Climbing', '2025-05-17', 600, 678000, 25000,
  CURRENT_TIMESTAMP
);

-- Vimeo: Jakob Schubert - オーストリアのレジェンド
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'Jakob Schubert - オーストリアのレジェンド リードクライミングの芸術',
  'Jakob Schubert - Austrian Legend, The Art of Lead Climbing',
  'Jakob Schubert - 奥地利传奇 先锋攀登的艺术',
  'Jakob Schubert - 오스트리아의 전설 리드 클라이밍의 예술',
  'オーストリアが誇るレジェンド、Jakob Schubert。東京五輪銅メダリスト。30年以上のクライミング歴を持つベテランの視点から見ても学ぶべき技術の宝庫。日本代表選手の目標となる存在。',
  'Austrian legend Jakob Schubert. Tokyo Olympics bronze medalist. Treasure trove of techniques to learn even from veteran perspective with 30+ years climbing history. Existence that becomes goal for Japanese national team athletes.',
  '奥地利引以为豪的传奇Jakob Schubert。东京奥运会铜牌得主。即使从拥有30多年攀岩历史的老将角度来看也是值得学习的技术宝库。成为日本国家队选手目标的存在。',
  '오스트리아가 자랑하는 레전드 Jakob Schubert. 도쿄 올림픽 동메달리스트. 30년 이상의 클라이밍 역사를 가진 베테랑의 시각에서 봐도 배워야 할 기술의 보고. 일본 대표 선수들의 목표가 되는 존재.',
  'https://vimeo.com/876543210',
  'https://vumbnail.com/876543210.jpg',
  'vimeo', 'sport',
  'Outdoor Adventure Films', '2024-08-15', 1800, 234000, 12000,
  CURRENT_TIMESTAMP
);

-- Instagram: Sean Bailey - イギリスの実力派
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  url, thumbnail_url, media_source, category,
  channel_name, posted_date, duration, views, likes,
  created_at
) VALUES (
  'Sean Bailey - イギリス実力派のボルダリングテクニック',
  'Sean Bailey - British Expert''s Bouldering Techniques',
  'Sean Bailey - 英国实力派的抱石技巧',
  'Sean Bailey - 영국 실력파의 볼더링 기술',
  'イギリスを代表するボルダラー、Sean Bailey。ヨーロッパと日本の技術の違いを比較する絶好のサンプル。グッぼるで開催される国際交流イベントでも参考にされる多様な登り方。',
  'British representative boulderer Sean Bailey. Excellent sample comparing differences between European and Japanese techniques. Diverse climbing methods referenced at international exchange events held at Gubboru.',
  '代表英国的抱石者Sean Bailey。比较欧洲和日本技术差异的绝佳样本。在Gubboru举办的国际交流活动中也参考的多样登法。',
  '영국을 대표하는 볼더러 Sean Bailey. 유럽과 일본 기술의 차이를 비교하는 최적의 샘플. Gubboru에서 개최되는 국제 교류 이벤트에서도 참고되는 다양한 등반법.',
  'https://www.instagram.com/reel/C5Kz8xYvR2L/',
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800',
  'instagram', 'boulder',
  'Sean Bailey', '2024-03-15', 50, 234000, 12000,
  CURRENT_TIMESTAMP
);
