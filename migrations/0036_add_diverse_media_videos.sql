-- Migration: Add diverse media videos (Instagram Reels, TikTok, Vimeo)
-- Created: 2025-12-25

-- Add Instagram Reels videos
INSERT OR IGNORE INTO videos (
  title, title_en, title_zh, title_ko,
  description, description_en, description_zh, description_ko,
  media_source, url, thumbnail_url,
  channel_name, posted_date, duration,
  views, likes, category,
  created_at
) VALUES 
-- Instagram Reel 1: Indoor Bouldering
(
 'インドアボルダリング V8課題クリア',
 'Indoor Bouldering V8 Problem Send',
 '室内抱石 V8线路完成',
 '실내 볼더링 V8 과제 완등',
 'ジムでのV8課題の完登シーン。ダイナミックなムーブが特徴',
 'V8 problem send at the gym. Features dynamic movements',
 '健身房V8线路完成。动态动作特色',
 '체육관에서 V8 과제 완등. 다이나믹한 무브가 특징',
 'instagram',
 'https://www.instagram.com/reel/C5Kz8xYvR2L/',
 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800',
 'Climbers Paradise',
 '2024-11-20',
 '45',
 125000, 8500, 'boulder',
 datetime('now')
),

-- Instagram Reel 2: Outdoor Sport Climbing
(
 'アウトドアスポーツクライミング 5.13a',
 'Outdoor Sport Climbing 5.13a',
 '户外运动攀岩 5.13a',
 '야외 스포츠 클라이밍 5.13a',
 '美しい岩場での5.13aルートの登攀。テクニカルなムーブ満載',
 'Climbing 5.13a route at beautiful crag. Full of technical moves',
 '美丽岩场的5.13a路线攀登。充满技术动作',
 '아름다운 암장에서 5.13a 루트 등반. 기술적인 무브 가득',
 'instagram',
 'https://www.instagram.com/reel/C6Mn9pLvK3X/',
 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
 'Outdoor Climbing Pro',
 '2024-11-18',
 '60',
 89000, 6200, 'sport',
 datetime('now')
),

-- TikTok 1: Training Tips
(
 'クライミングトレーニングのコツ',
 'Climbing Training Tips',
 '攀岩训练技巧',
 '클라이밍 트레이닝 팁',
 '効果的なフィンガーボードトレーニング方法を60秒で解説',
 'Effective fingerboard training methods explained in 60 seconds',
 '60秒内解释有效的指力板训练方法',
 '60초 안에 효과적인 핑거보드 트레이닝 방법 설명',
 'tiktok',
 'https://www.tiktok.com/@climbingcoach/video/7312345678901234567',
 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
 'Climbing Coach',
 '2024-11-15',
 '60',
 456000, 32000, 'training',
 datetime('now')
),

-- TikTok 2: Competition Highlight
(
 'ボルダリングコンペ ハイライト',
 'Bouldering Competition Highlights',
 '抱石比赛精彩集锦',
 '볼더링 대회 하이라이트',
 '地元コンペでの白熱した戦い。最後の一手が見どころ',
 'Intense battle at local competition. Final move is the highlight',
 '本地比赛的激烈战斗。最后一步是亮点',
 '지역 대회에서의 치열한 경쟁. 마지막 한 수가 하이라이트',
 'tiktok',
 'https://www.tiktok.com/@boulderking/video/7323456789012345678',
 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800',
 'Boulder King',
 '2024-11-10',
 '90',
 234000, 18000, 'boulder',
 datetime('now')
),

-- Vimeo 1: Documentary Style
(
 'クライミングドキュメンタリー：岩との対話',
 'Climbing Documentary: Dialogue with Rock',
 '攀岩纪录片：与岩石对话',
 '클라이밍 다큐멘터리: 바위와의 대화',
 'クライミングの哲学と美しさを描いた10分間のドキュメンタリー',
 '10-minute documentary depicting climbing philosophy and beauty',
 '描绘攀岩哲学和美感的10分钟纪录片',
 '클라이밍의 철학과 아름다움을 그린 10분 다큐멘터리',
 'vimeo',
 'https://vimeo.com/876543210',
 'https://vumbnail.com/876543210.jpg',
 'Mountain Film Makers',
 '2024-11-05',
 '600',
 67000, 4500, 'lifestyle',
 datetime('now')
),

-- Vimeo 2: Technique Tutorial
(
 'フットワークマスタークラス',
 'Footwork Masterclass',
 '脚法大师课',
 '풋워크 마스터클래스',
 'プロクライマーが教える精密なフットワークテクニック',
 'Precise footwork techniques taught by pro climber',
 '专业攀岩者教授的精确脚法技术',
 '프로 클라이머가 가르치는 정밀한 풋워크 기술',
 'vimeo',
 'https://vimeo.com/887654321',
 'https://vumbnail.com/887654321.jpg',
 'Pro Climbing Academy',
 '2024-10-28',
 '360',
 45000, 3200, 'training',
 datetime('now')
);
