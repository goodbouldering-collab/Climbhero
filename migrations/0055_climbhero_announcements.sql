-- Migration: Replace announcements with ClimbHero site-related content
-- Date: 2026-01-11
-- Purpose: Remove old announcements and add 5 new site/sponsor-related announcements

-- Delete all existing announcements
DELETE FROM announcements;

-- Reset sequence
DELETE FROM sqlite_sequence WHERE name = 'announcements';

-- Insert new ClimbHero site-related announcements

INSERT INTO announcements (id, title, content, priority, is_active, created_at) VALUES
(1, '🎉 ClimbHero 新機能リリース！ランキングダイジェスト自動再生',
 'トップページに人気動画トップ10の自動再生カルーセルを追加しました。世界最高峰のクライミング動画をお楽しみください。',
 5, 1, CURRENT_TIMESTAMP),

(2, '📹 厳選YouTube動画10本を追加',
 'Alex Honnold、Adam Ondra、小山田大など世界トップクライマーの動画を厳選。IFSC World Cup最新映像も視聴可能です。全てのURLと動画が検証済みで確実に再生できます。',
 4, 1, CURRENT_TIMESTAMP),

(3, '⭐ お気に入り機能が復活',
 'お気に入り動画をマイページで管理できるようになりました。気になる動画をブックマークして、いつでも見返せます。ログインして今すぐ試してみてください。',
 3, 1, CURRENT_TIMESTAMP),

(4, '🏔️ クライミングシューズ120モデル常時在庫',
 'La Sportiva、SCARPA、Evolv、Five Tenなど主要ブランドのシューズを取り揃え。グッぼるショップで試履き→ジム試登が可能です。クラッシュパッド60枚超も在庫あり。',
 2, 1, CURRENT_TIMESTAMP),

(5, '💎 プレミアムプラン登場 - 無制限動画投稿',
 '月額¥990で無制限動画投稿、広告非表示、お気に入り管理、優先サポートなど全機能が利用可能。年間プランなら月額¥490（50%OFF）でさらにお得です。',
 1, 1, CURRENT_TIMESTAMP);
