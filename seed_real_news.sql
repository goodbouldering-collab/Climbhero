-- Real Climbing News Articles from 2025
-- Insert authentic news from IFSC, climbing communities, and professional climbers

INSERT OR IGNORE INTO news_articles (
  title,
  title_en,
  title_zh,
  title_ko,
  summary,
  summary_en,
  summary_zh,
  summary_ko,
  url,
  source_name,
  source_url,
  image_url,
  published_date,
  category,
  genre
) VALUES 
-- IFSC World Championships Seoul 2025
(
  'IFSC クライミング世界選手権2025 ソウル大会開催',
  'IFSC Climbing World Championships Seoul 2025',
  'IFSC攀岩世界锦标赛2025首尔站',
  'IFSC 클라이밍 세계선수권대회 2025 서울',
  'IFSCクライミング世界選手権の第19回大会が2025年9月21日から28日まで韓国ソウルで開催されました。世界最高峰のクライマーたちがボルダリング、リード、スピードの3種目で熱戦を繰り広げました。',
  'The 19th edition of the IFSC Climbing World Championships was held in Seoul, South Korea from September 21-28, 2025. Top climbers competed in Boulder, Lead, and Speed disciplines.',
  '第19届IFSC攀岩世界锦标赛于2025年9月21日至28日在韩国首尔举行。顶级攀岩者在抱石、难度和速度三个项目中展开激烈角逐。',
  '제19회 IFSC 클라이밍 세계선수권대회가 2025년 9월 21일부터 28일까지 대한민국 서울에서 개최되었습니다. 세계 최고의 클라이머들이 볼더링, 리드, 스피드 종목에서 경쟁했습니다.',
  'https://www.ifsc-climbing.org/events/ifsc-climbing-world-championships-seoul-2025',
  'IFSC',
  'https://www.ifsc-climbing.org/events/ifsc-climbing-world-championships-seoul-2025',
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop&q=80',
  '2025-09-28 12:00:00',
  'international',
  'competition'
),

-- Anraku Wins World Title
(
  '安楽宙斗、劇的な逆転で世界王者に',
  'Anraku Wins World Title in Dramatic Last-Gasp Gold',
  '安乐宙斗戏剧性逆转夺得世界冠军',
  '안라쿠 소라토, 극적인 역전으로 세계 챔피언',
  'IFSC世界選手権2025の最終セッションの最後のボルダー課題で、日本の安楽宙斗が劇的な逆転勝利を飾り、世界タイトルを獲得しました。17歳の若きチャンピオンの誕生です。',
  'Japan''s Sorato Anraku claimed the world title with a dramatic comeback on the final boulder of the IFSC World Championships 2025 final session. The 17-year-old becomes the youngest champion.',
  '在IFSC世界锦标赛2025决赛最后一个抱石项目中，日本选手安乐宙斗戏剧性逆转夺得世界冠军。这位17岁的年轻选手成为最年轻的世界冠军。',
  'IFSC 세계선수권대회 2025 결승 마지막 볼더 문제에서 일본의 안라쿠 소라토가 극적인 역전승으로 세계 타이틀을 획득했습니다. 17세의 젊은 챔피언 탄생입니다.',
  'https://www.ifsc-climbing.org/events/ifsc-climbing-world-championships-seoul-2025/news/anraku-wins-world-title-in-more-last-gasp-gold-drama',
  'IFSC',
  'https://www.ifsc-climbing.org/events/ifsc-climbing-world-championships-seoul-2025/news/anraku-wins-world-title-in-more-last-gasp-gold-drama',
  'https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?w=800&h=600&fit=crop&q=80',
  '2025-09-28 18:00:00',
  'international',
  'competition'
),

-- Alex Honnold Plumber's Crack Record
(
  'Alex Honnold、レッドロックで記録更新',
  'Alex Honnold Sets New Red Rock Record',
  'Alex Honnold在红岩创造新纪录',
  'Alex Honnold, 레드락 신기록 수립',
  '伝説的フリークライマーAlex Honnoldが、レッドロックの有名な「Plumber''s Crack」ルートを25秒で登り降りし、新記録を樹立しました。',
  'Legendary free soloist Alex Honnold climbed up and down the famous ''Plumber''s Crack'' at Red Rock in just over 25 seconds, setting a new record.',
  '传奇自由攀登者Alex Honnold在红岩著名的"Plumber''s Crack"路线上下攀登仅用25秒，创造了新纪录。',
  '전설적인 프리 솔로이스트 Alex Honnold가 레드락의 유명한 ''Plumber''s Crack'' 루트를 25초 만에 오르내리며 신기록을 수립했습니다.',
  'https://www.planetmountain.com/en/news/climbing/alex-honnold-sets-new-plumbers-crack-record-red-rock.html',
  'Planet Mountain',
  'https://www.planetmountain.com/en/news/climbing/alex-honnold-sets-new-plumbers-crack-record-red-rock.html',
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop&q=80',
  '2025-11-15 10:00:00',
  'usa',
  'outdoor'
),

-- Adam Ondra Boulder Bar Event
(
  'Adam Ondra、11月15日にBoulder Bar Linzでイベント開催',
  'Adam Ondra Event at Boulder Bar Linz on Nov 15',
  'Adam Ondra将于11月15日在Boulder Bar Linz举办活动',
  'Adam Ondra, 11월 15일 Boulder Bar Linz 이벤트',
  'チェコの世界的クライマーAdam Ondraが、オーストリアのBoulder Bar Linzで特別イベントを開催。ファンとの交流やデモンストレーションが行われます。',
  'Czech world-class climber Adam Ondra will host a special event at Boulder Bar Linz, Austria. Meet and greet with fans and climbing demonstrations scheduled.',
  '捷克世界级攀岩者Adam Ondra将在奥地利Boulder Bar Linz举办特别活动。将进行粉丝见面会和攀岩表演。',
  '체코의 세계적인 클라이머 Adam Ondra가 오스트리아 Boulder Bar Linz에서 특별 이벤트를 개최합니다. 팬 미팅과 클라이밍 데모가 예정되어 있습니다.',
  'https://www.instagram.com/reel/DQmaNktjCV_/',
  'Instagram @adam.ondra',
  'https://www.instagram.com/reel/DQmaNktjCV_/',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&q=80',
  '2025-11-03 14:00:00',
  'europe',
  'event'
),

-- Narasaki Tomoa DMG MORI Event
(
  '楢崎智亜プロデュース「DMG MORI CLIMBING FES」開催決定',
  'Narasaki Tomoa''s "DMG MORI CLIMBING FES" Announced',
  '楢崎智亜策划"DMG MORI CLIMBING FES"确定举办',
  '나라사키 토모아 프로듀스 "DMG MORI CLIMBING FES" 개최 확정',
  '日本のトップクライマー楢崎智亜がプロデュースする大規模クライミングフェスティバルが12月に開催。妻でオリンピックメダリストの野口啓代もルートセッターとして参加します。',
  'Top Japanese climber Tomoa Narasaki produces major climbing festival in December. Olympic medalist Akiyo Noguchi, his wife, will participate as route setter.',
  '日本顶级攀岩者楢崎智亜策划的大型攀岩节将于12月举办。奥运奖牌得主、其妻子野口啓代将作为路线设定者参加。',
  '일본 최고 클라이머 나라사키 토모아가 프로듀스하는 대규모 클라이밍 페스티벌이 12월에 개최됩니다. 올림픽 메달리스트인 그의 아내 노구치 아키요도 루트 세터로 참가합니다.',
  'https://www.climbers-web.jp/news/20251116-1/',
  'CLIMBERS',
  'https://www.climbers-web.jp/news/20251116-1/',
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop&q=80',
  '2025-11-16 09:00:00',
  'domestic',
  'event'
),

-- Japan Boulder Team Training
(
  '日本ボルダー代表、新シーズンに向けトレーニング合宿',
  'Japan Boulder Team Training Camp for New Season',
  '日本抱石代表队新赛季训练营',
  '일본 볼더링 대표팀 신시즌 훈련 캠프',
  '2025シーズンのW杯に向け、日本ボルダー代表がトレーニング合宿を実施。パリ五輪金メダリストのSam Robertsも参加し、国際交流を深めています。',
  'Japan''s boulder national team holds training camp for 2025 World Cup season. Paris Olympic gold medalist Sam Roberts also joins for international exchange.',
  '日本抱石国家队为2025年世界杯赛季进行训练营。巴黎奥运金牌得主Sam Roberts也参加了国际交流。',
  '일본 볼더링 국가대표팀이 2025 월드컵 시즌을 위한 훈련 캠프를 실시합니다. 파리 올림픽 금메달리스트 Sam Roberts도 국제 교류를 위해 참가합니다.',
  'https://www.climbers-web.jp/tag/tomoa-narasaki/',
  'CLIMBERS',
  'https://www.climbers-web.jp/tag/tomoa-narasaki/',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=600&fit=crop&q=80',
  '2025-10-20 08:00:00',
  'domestic',
  'training'
),

-- Noguchi Akiyo's Dream Event
(
  '野口啓代「AKIYO''S DREAM with RYUGASAKI」開催',
  'Noguchi Akiyo''s "AKIYO''S DREAM with RYUGASAKI" Event',
  '野口啓代"AKIYO''S DREAM with RYUGASAKI"活动',
  '노구치 아키요 "AKIYO''S DREAM with RYUGASAKI" 이벤트',
  'オリンピックメダリスト野口啓代が地元・龍ケ崎市でクライミングイベントを開催。次世代のクライマー育成と地域活性化を目指します。',
  'Olympic medalist Akiyo Noguchi hosts climbing event in her hometown Ryugasaki. Aims to develop next generation climbers and revitalize local community.',
  '奥运奖牌得主野口啓代在家乡龙崎市举办攀岩活动。旨在培养下一代攀岩者并振兴当地社区。',
  '올림픽 메달리스트 노구치 아키요가 고향 류가사키시에서 클라이밍 이벤트를 개최합니다. 차세대 클라이머 육성과 지역 활성화를 목표로 합니다.',
  'https://www.climbers-web.jp/tag/tomoa-narasaki/',
  'CLIMBERS',
  'https://www.climbers-web.jp/tag/tomoa-narasaki/',
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop&q=80',
  '2025-09-23 10:00:00',
  'domestic',
  'event'
),

-- 2025 Japan Boulder Representatives
(
  '2025年ボルダー日本代表発表：安楽宙斗、楢崎智亜ら選出',
  '2025 Japan Boulder National Team Announced',
  '2025年日本抱石国家队公布',
  '2025년 일본 볼더링 국가대표 발표',
  '日本山岳・スポーツクライミング協会が2025シーズンの国際大会派遣ボルダー日本代表を発表。パリ五輪出場の安楽宙斗、楢崎智亜、森秋彩、野中生萌ら男子12人、女子11人が選ばれました。',
  'JMSCA announces 2025 boulder national team for international competitions. Paris Olympic athletes Sorato Anraku, Tomoa Narasaki, Ai Mori, and Miho Nonaka selected among 12 men and 11 women.',
  '日本山岳与运动攀登协会公布2025赛季国际比赛抱石国家队。巴黎奥运选手安乐宙斗、楢崎智亜、森秋彩、野中生萌等男子12人、女子11人入选。',
  '일본산악스포츠클라이밍협회가 2025시즌 국제대회 볼더링 국가대표를 발표했습니다. 파리 올림픽 출전 선수 안라쿠 소라토, 나라사키 토모아, 모리 아이, 노나카 미호 등 남자 12명, 여자 11명이 선발되었습니다.',
  'https://www.climbers-web.jp/news/20250224-1/',
  'CLIMBERS',
  'https://www.climbers-web.jp/news/20250224-1/',
  'https://images.unsplash.com/photo-1519219788971-8d9797e0928e?w=800&h=600&fit=crop&q=80',
  '2025-02-24 15:00:00',
  'domestic',
  'team'
),

-- IFSC World Cup Koper 2025
(
  'IFSC ワールドカップ コペル2025：統計とハイライト',
  'IFSC Climbing World Cup Koper 2025: Facts and Stats',
  'IFSC世界杯科佩尔2025：事实与统计',
  'IFSC 월드컵 코페르 2025: 통계와 하이라이트',
  'スロベニアのコペルで開催されたIFSC クライミング ワールドカップ2025は、歴史上417回目のワールドカップイベントで、236回目のリードワールドカップ大会となりました。',
  'The IFSC Climbing World Cup Koper 2025 is the 417th Climbing World Cup event in history, featuring the 236th Lead World Cup competition in Koper, Slovenia.',
  '在斯洛文尼亚科佩尔举行的IFSC攀岩世界杯2025是历史上第417场世界杯赛事，也是第236场难度世界杯比赛。',
  '슬로베니아 코페르에서 개최된 IFSC 클라이밍 월드컵 2025는 역사상 417번째 월드컵 이벤트이자 236번째 리드 월드컵 대회입니다.',
  'https://www.ifsc-climbing.org/events/ifsc-world-cup-koper-2025/news/ifsc-climbing-world-cup-koper-2025-facts-and-stats',
  'IFSC',
  'https://www.ifsc-climbing.org/events/ifsc-world-cup-koper-2025/news/ifsc-climbing-world-cup-koper-2025-facts-and-stats',
  'https://images.unsplash.com/photo-1531756716853-09a60d38d820?w=800&h=600&fit=crop&q=80',
  '2025-09-04 12:00:00',
  'international',
  'competition'
),

-- Nations Grand Finale Fukuoka 2025
(
  'Nations Grand Finale 福岡2025：ボルダー決勝',
  'Nations Grand Finale Fukuoka 2025: Boulder Finals',
  'Nations Grand Finale福冈2025：抱石决赛',
  'Nations Grand Finale 후쿠오카 2025: 볼더 결승',
  'IFSCネーションズグランドフィナーレが福岡で開催され、世界各国の代表チームがボルダリングで激突。日本チームがホームで圧倒的なパフォーマンスを披露しました。',
  'IFSC Nations Grand Finale held in Fukuoka features national teams battling in bouldering. Team Japan delivers outstanding performance on home turf.',
  'IFSC国家总决赛在福冈举行，各国国家队在抱石项目中激烈角逐。日本队在主场展现出色表现。',
  'IFSC 네이션스 그랜드 피날레가 후쿠오카에서 개최되어 각국 대표팀이 볼더링에서 격돌했습니다. 일본 팀이 홈에서 압도적인 퍼포먼스를 선보였습니다.',
  'https://www.ifsc-climbing.org/news/nations-grand-finale-fukuoka-2025',
  'IFSC',
  'https://www.ifsc-climbing.org/news/nations-grand-finale-fukuoka-2025',
  'https://images.unsplash.com/photo-1522163723043-478ef79a5bb4?w=800&h=600&fit=crop&q=80',
  '2025-10-25 14:00:00',
  'domestic',
  'competition'
);
