-- Insert sample climbing videos from real platforms
-- Admin user ID should be 1

-- YouTube Videos  
INSERT INTO videos (uploader_id, title, description, url, thumbnail_url, platform, video_id_external, category, views, likes, posted_date) VALUES
(1, 'Adam Ondra - Silence 9c 世界最難課題', '世界最難課題 Silence 9c (5.15d) の完登動画。ノルウェーのFlatangerで撮影', 'https://www.youtube.com/watch?v=ZRTNHDd0gL8', 'https://img.youtube.com/vi/ZRTNHDd0gL8/hqdefault.jpg', 'youtube', 'ZRTNHDd0gL8', 'lead', 1250, 45, datetime('now', '-30 days')),

(1, 'Alex Honnold - Free Solo El Capitan', 'エルキャピタンのフリーソロ完登ドキュメンタリーハイライト', 'https://www.youtube.com/watch?v=3-wjmIFlnNo', 'https://img.youtube.com/vi/3-wjmIFlnNo/hqdefault.jpg', 'youtube', '3-wjmIFlnNo', 'free solo', 2100, 78, datetime('now', '-25 days')),

(1, 'Jakob Schubert - Boulder World Cup 2023', 'ボルダリングワールドカップ2023 ヤコブ・シューベルトの神業', 'https://www.youtube.com/watch?v=Ht9O4F1QWYU', 'https://img.youtube.com/vi/Ht9O4F1QWYU/hqdefault.jpg', 'youtube', 'Ht9O4F1QWYU', 'bouldering', 950, 35, datetime('now', '-20 days')),

(1, 'Janja Garnbret - Olympics 2021 Gold', '東京オリンピック2021 ヤニャ・ガルンブレトの金メダル獲得', 'https://www.youtube.com/watch?v=k7VWiBZH6Oo', 'https://img.youtube.com/vi/k7VWiBZH6Oo/hqdefault.jpg', 'youtube', 'k7VWiBZH6Oo', 'bouldering', 1800, 92, datetime('now', '-15 days')),

(1, 'Magnus Midtbø - Gym Climb Challenge', 'マグナス・ミドボーのジムクライミングチャレンジ', 'https://www.youtube.com/watch?v=WKkqjLKGBV4', 'https://img.youtube.com/vi/WKkqjLKGBV4/hqdefault.jpg', 'youtube', 'WKkqjLKGBV4', 'bouldering', 670, 28, datetime('now', '-10 days')),

(1, 'Tommy Caldwell - The Dawn Wall', 'トミー・コールドウェルのドーンウォール完登ストーリー', 'https://www.youtube.com/watch?v=EdvolpsD5E4', 'https://img.youtube.com/vi/EdvolpsD5E4/hqdefault.jpg', 'youtube', 'EdvolpsD5E4', 'lead', 1400, 56, datetime('now', '-8 days')),

(1, 'Stefano Ghisolfi - Bibliographie 9c+', 'ステファノ・ギソルフィの世界最難課題チャレンジ', 'https://www.youtube.com/watch?v=ZYkzrYYOvGo', 'https://img.youtube.com/vi/ZYkzrYYOvGo/hqdefault.jpg', 'youtube', 'ZYkzrYYOvGo', 'lead', 890, 41, datetime('now', '-5 days')),

(1, 'Shauna Coxsey - Home Training', 'ショーナ・コクシーの自宅トレーニングルーティン', 'https://www.youtube.com/watch?v=kJPWZ1FDC08', 'https://img.youtube.com/vi/kJPWZ1FDC08/hqdefault.jpg', 'youtube', 'kJPWZ1FDC08', 'bouldering', 540, 22, datetime('now', '-3 days')),

(1, 'Chris Sharma - Jumbo Love Deep Water Solo', 'クリス・シャルマの伝説的課題 Jumbo Love', 'https://www.youtube.com/watch?v=0FXrquRzc_g', 'https://img.youtube.com/vi/0FXrquRzc_g/hqdefault.jpg', 'youtube', '0FXrquRzc_g', 'deep water', 1100, 48, datetime('now', '-2 days')),

(1, 'Ashima Shiraishi - Horizon 9a 最年少', 'アシマ・シライシ 最年少9a完登', 'https://www.youtube.com/watch?v=OE59n2PaP-k', 'https://img.youtube.com/vi/OE59n2PaP-k/hqdefault.jpg', 'youtube', 'OE59n2PaP-k', 'lead', 780, 34, datetime('now', '-1 days'));

-- TikTok Videos
INSERT INTO videos (uploader_id, title, description, url, thumbnail_url, platform, video_id_external, category, views, likes, posted_date) VALUES
(1, 'ボルダリング女子のデイリールーティン 💪', 'グッぼるでの1日密着！朝練からカフェタイムまで #ボルダリング #クライミング女子', 'https://www.tiktok.com/@climbinggirl/video/7234567890123456789', 'https://img.youtube.com/vi/default/hqdefault.jpg', 'tiktok', '7234567890123456789', 'bouldering', 3200, 156, datetime('now', '-12 days')),

(1, 'V7課題を3トライで完登！ 秘訣は肩甲骨の使い方', '30年のクライミング経験から学んだテクニックを公開 #クライミング #ボルダリング', 'https://www.tiktok.com/@gubboru_official/video/7345678901234567890', 'https://img.youtube.com/vi/default/hqdefault.jpg', 'tiktok', '7345678901234567890', 'bouldering', 5800, 289, datetime('now', '-9 days')),

(1, 'クライミングシューズ120モデル全部試してみた', 'グッぼるショップで全モデル試履き可能！あなたにピッタリの1足を #クライミングシューズ', 'https://www.tiktok.com/@climbgear/video/7456789012345678901', 'https://img.youtube.com/vi/default/hqdefault.jpg', 'tiktok', '7456789012345678901', 'gear', 4100, 201, datetime('now', '-6 days'));

-- Vimeo Videos
INSERT INTO videos (uploader_id, title, description, url, thumbnail_url, platform, video_id_external, category, views, likes, posted_date) VALUES
(1, 'グッぼる ボルダリングCafe - Cinematic Tour', 'ジム、ショップ、カフェが一体になった唯一のクライミング施設。4K撮影でお届けする館内ツアー', 'https://vimeo.com/812345678', 'https://i.vimeocdn.com/video/812345678_640.jpg', 'vimeo', '812345678', 'gym_tour', 1900, 87, datetime('now', '-18 days')),

(1, 'The Art of Bouldering - Hikone, Japan', '彦根の岩場とグッぼるジムで撮影したボルダリングアートフィルム。プロクライマー出演', 'https://vimeo.com/823456789', 'https://i.vimeocdn.com/video/823456789_640.jpg', 'vimeo', '823456789', 'bouldering', 2700, 124, datetime('now', '-11 days')),

(1, 'プロギングジャパン × グッぼる コラボ清掃活動', '彦根駅前の清掃ランニングイベント。クライミングとSDGsの融合', 'https://vimeo.com/834567890', 'https://i.vimeocdn.com/video/834567890_640.jpg', 'vimeo', '834567890', 'event', 1500, 68, datetime('now', '-4 days'));

-- Instagram Videos (Reels)
INSERT INTO videos (uploader_id, title, description, url, thumbnail_url, platform, video_id_external, category, views, likes, posted_date) VALUES
(1, 'エスプレッソ×クライミング ☕️🧗', 'ナポリ式エスプレッソで登攀前のカフェイン補給。空輸豆の鮮度管理はIoT計測で最適化 #グッぼるカフェ', 'https://www.instagram.com/reel/CxYZ1234abc/', 'https://scontent.cdninstagram.com/v/t51.2885-15/placeholder.jpg', 'instagram', 'CxYZ1234abc', 'lifestyle', 6200, 342, datetime('now', '-16 days')),

(1, '小円筋を使ったデッドポイント解説 💡', 'V17課題設計者が教える、効率的なダイナミックムーブの秘訣 #ボルダリングテクニック', 'https://www.instagram.com/reel/CyAB2345def/', 'https://scontent.cdninstagram.com/v/t51.2885-15/placeholder.jpg', 'instagram', 'CyAB2345def', 'tutorial', 4800, 267, datetime('now', '-13 days')),

(1, 'クライミングシューズリソールビフォーアフター', '寿命2倍！環境にも優しいリソールサービス。グッぼるで¥6,500〜 #サステナブル', 'https://www.instagram.com/reel/CzBC3456ghi/', 'https://scontent.cdninstagram.com/v/t51.2885-15/placeholder.jpg', 'instagram', 'CzBC3456ghi', 'gear', 3600, 198, datetime('now', '-7 days'));

-- Update statistics
UPDATE users SET notes = 'Sample data populated with YouTube, TikTok, Vimeo, Instagram' WHERE id = 1;
