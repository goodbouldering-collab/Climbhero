# ClimbHero - クライミング動画共有プラットフォーム

## 📋 プロジェクト概要

**ClimbHero**は、クライミングコミュニティのための本格的な動画共有プラットフォームです。参考サイト（https://climbhero.info）のデザインを模倣しつつ、充実した機能を提供します。

### 主な特徴

- **マルチプラットフォーム対応**: YouTube、YouTube Shorts、TikTok、Instagram、Vimeo、X (Twitter)の動画を完全サポート 🎥
- **世界ニュース自動収集・翻訳**: 毎日15:00に世界中のクライミングニュースを収集し、4言語にAI翻訳 🌍🤖
- **リアルタイム翻訳**: オンデマンドで記事をユーザーの言語に自動翻訳（Gemini API）
- **スマートサムネイル生成**: プラットフォームごとに最適化されたサムネイル表示
- **横カルーセルUI**: 全セクションで滑らかなスクロール体験
- **拡張ランキング**: デイリー・週間・月間・年間の4期間対応
- **充実のサンプルデータ**: 10本の動画（6プラットフォーム）と5本のニュース記事（永続化済み）📦
- **自動バックアップシステム**: デプロイ前に自動でバックアップを作成してGitHub同期 🔄
- **プレミアムプラン**: $20/月 + 15日間無料トライアル
- **完全なフッター**: 会社情報、リンク、連絡先を網羅
- **動画投稿機能**: URLを入力するだけで簡単投稿

## 🌐 公開URL

- **本番環境**: https://f6ea0210.project-02ceb497.pages.dev ⭐ **最新デプロイ（統合お気に入り一覧完全実装）**
- **開発環境**: https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai ⚡ **統合お気に入り一覧実装済み**
- **本番URL（メイン）**: https://project-02ceb497.pages.dev
- **GitHub**: https://github.com/goodbouldering-collab/Climbhero ✅
- **OpenAPI仕様**: https://project-02ceb497.pages.dev/openapi.json
- **AI Plugin**: https://project-02ceb497.pages.dev/.well-known/ai-plugin.json
- **LLMO**: https://project-02ceb497.pages.dev/llmo.txt

### 本番環境の確認

```bash
# 動画データ確認（25本 - 4プラットフォーム）
curl "https://fb4d2735.project-02ceb497.pages.dev/api/videos?limit=3&lang=ja"

# YouTube動画（10本）
curl "https://fb4d2735.project-02ceb497.pages.dev/api/videos?limit=30" | jq '.videos[] | select(.media_source == "youtube")'

# TikTok動画（5本）
curl "https://fb4d2735.project-02ceb497.pages.dev/api/videos?limit=30" | jq '.videos[] | select(.media_source == "tiktok")'

# Instagram動画（5本）
curl "https://fb4d2735.project-02ceb497.pages.dev/api/videos?limit=30" | jq '.videos[] | select(.media_source == "instagram")'

# Vimeo動画（5本）
curl "https://fb4d2735.project-02ceb497.pages.dev/api/videos?limit=30" | jq '.videos[] | select(.media_source == "vimeo")'

# ブログデータ確認（5本）
curl "https://fb4d2735.project-02ceb497.pages.dev/api/blog?lang=ja"

# 多言語対応確認
curl "https://fb4d2735.project-02ceb497.pages.dev/api/videos/1?lang=en"  # English
curl "https://fb4d2735.project-02ceb497.pages.dev/api/videos/1?lang=zh"  # Chinese
curl "https://fb4d2735.project-02ceb497.pages.dev/api/videos/1?lang=ko"  # Korean
```

## ✨ 完成済み機能

### フロントエンド機能
- ✅ **マルチプラットフォーム動画対応** 🎥 NEW
  - YouTube/YouTube Shorts: 自動サムネイル生成、iframe埋め込み
  - TikTok: 高品質フォールバック画像、TikTok Embed v2統合
  - Instagram Reels: 高品質フォールバック画像、Instagram埋め込み統合
  - Vimeo: 高品質フォールバック画像、Vimeo Player統合
  - プラットフォーム別バッジ表示（アイコン + ブランドカラー）
  - エラーハンドリング（onerror画像フォールバック）
- ✅ **スマートビデオ順序ランダム化** 🎲 NEW
  - YouTube以外のプラットフォーム（Instagram、TikTok、Vimeo）を優先表示
  - 各リクエストごとにランダムな順序で配置
  - 多様なコンテンツを先頭に表示して視覚的興味を向上
- ✅ **横カルーセルUI** - ランキング、動画、ブログの全セクションに実装
- ✅ **注目の動画セクション** - いいね増加率が高い動画を上位表示 🔥
- ✅ **Instagramギャラリー** - Instagram Reels専用の表示エリア 📸
- ✅ **広告バナー管理システム** 🎯 NEW
  - ヒーロー下とブログ上の2箇所に表示
  - 高さ60px、両端にマージン付きで美しく表示
  - 管理画面から画像とテキストを編集可能
  - 表示位置、優先度、公開期間を設定
  - クリック数・表示回数を自動追跡
- ✅ **4期間ランキング** - デイリー、週間、月間、年間の切り替え
- ✅ **インタラクティブUI** ✨ NEW
  - ホバーアニメーション（サムネイル拡大、シマーエフェクト）
  - エントランスアニメーション（バウンスイン）
  - スクロール進捗インジケーター
  - トップ3ランキングのパルスグロー効果
  - ツールチップ表示
- ✅ **統一タブデザイン** - 動画フィルター/ランキング期間切り替えの一貫性
- ✅ **コンパクトカード** - サムネイル220px、情報密度最適化
- ✅ **レスポンシブデザイン** - PC/タブレット/モバイル対応
- ✅ **ヒーローセクション** - グラデーション背景 + CTA
- ✅ **動画詳細モーダル** - YouTube/Vimeo: iframe埋め込み、TikTok/Instagram: サムネイル+外部リンク 📱
- ✅ **いいね・お気に入り機能** 💖 **COMPLETED**
  - **動画**: いいね・お気に入り対応（既存機能）
  - **ブログ**: いいね・お気に入り対応（✅ 実装完了）
  - **ニュース**: いいね・お気に入り対応（✅ 実装完了）
  - **統合お気に入り一覧**: 動画・ブログ・ニュースを時系列でミックス表示（✅ 実装完了）
  - **多言語対応**: 全コンテンツタイプで日本語・英語・中国語・韓国語対応
  - **動的カウント**: リアルタイムでいいね数を集計表示
  - **カウント表示**: 各コンテンツタイプ別の件数表示
- ✅ **ユーザー認証** - ログイン/登録
- ✅ **動画投稿フォーム** - モーダル形式
- ✅ **ブログ記事詳細ページ**
- ✅ **完全なフッター** - 4カラムレイアウト

### プレミアムプラン機能
- ✅ **15日間無料トライアル** - クレジットカード入力あり
- ✅ **$20/月プラン** - 明確な料金表示
- ✅ **プランモーダル** - 登録フォーム統合
- ✅ **特典リスト** - 無料 vs プレミアムの比較表示

### Admin管理機能
- ✅ **管理者ダッシュボード** - `#admin`でアクセス
- ✅ **ブログ管理** - 投稿・編集・削除
- ✅ **広告バナー管理** 🎯 NEW
  - 画像URL、リンクURL、タイトル編集
  - 表示位置（hero_bottom/blog_top）選択
  - 優先度設定（数値が小さいほど優先）
  - 公開/非公開ステータス切り替え
  - 公開期間設定（開始日時・終了日時）
  - クリック数・表示回数の確認
- ✅ **権限ベースのアクセス制御**

### バックエンドAPI
- ✅ `/api/auth/*` - 認証エンドポイント
- ✅ `/api/videos` - 動画CRUD操作
- ✅ `/api/videos/:id/like` - いいね機能
- ✅ `/api/videos/:id/favorite` - お気に入り機能
- ✅ `/api/videos/trending` - トレンド動画（いいね急増中）✨ NEW
- ✅ `/api/rankings/:type` - ランキング（daily, weekly, monthly, yearly, total）
- ✅ `/api/blog` - ブログ記事CRUD操作
- ✅ `/api/ad-banners` - 広告バナー取得・管理 🎯 NEW
- ✅ `/api/ad-banners/:id/impression` - 表示回数追跡 🎯 NEW
- ✅ `/api/ad-banners/:id/click` - クリック数追跡 🎯 NEW
- ✅ `/api/admin/ad-banners` - 広告バナー作成・編集・削除（管理者専用） 🎯 NEW
- ✅ Admin権限チェック機能

## 🗄️ データアーキテクチャ

### ストレージサービス
- **Cloudflare D1 Database** (SQLite): メインデータストア

### データベーステーブル

**Users テーブル**
- id, email, username, password_hash
- is_admin (管理者権限)
- membership_type (free/premium)
- session_token, created_at

**Videos テーブル**
- id, title, description, url, thumbnail_url
- duration, channel_name, category
- views, likes, created_at

**Video Rankings テーブル**
- video_id
- daily_score, weekly_score, monthly_score, yearly_score, total_score
- last_updated

**Blog Posts テーブル**
- id, title, content, image_url, published_date

**Ad Banners テーブル** 🎯 NEW
- id, title, image_url, link_url
- position (hero_bottom/blog_top)
- is_active, priority
- start_date, end_date
- click_count, impression_count
- created_at, updated_at

**その他**: likes, favorites, comments テーブル

## 📊 本番環境データ（Production Database）

### ✅ データ投入完了 (2025-11-17)

**動画**: 25本（全4言語翻訳対応）
- **YouTube**: 10本（Alex Honnold, Magnus Midtbø, Adam Ondra等のプロクライマー動画）
- **Instagram**: 5本（クライミングジム、コンペ、アウトドア等のリール）
- **TikTok**: 5本（ボルダリング、トレーニング、テクニック等）
- **Vimeo**: 5本（ドキュメンタリー、アウトドアクライミング等）

**ブログ**: 5本（完全4言語対応: 日/英/中/韓）
1. クライミングジム10施設と新規提携！全国200箇所以上で動画撮影が可能に
2. 第1回クライミング動画コンテスト開催！賞金総額$10,000
3. クライマー向け安全な撮影ガイドラインを公開
4. プレミアム会員限定：AI自動グレード検出機能をリリース
5. ClimbHero、動画投稿数10,000本を突破！

**お知らせ**: 4件（完全4言語対応）
- 🎉 新機能リリース
- 🏆 コンテスト開催
- 📍 提携ジム拡大
- 🔔 コミュニティマイルストーン

**ユーザー**: 3名
- admin@climbhero.com (管理者)
- demo@example.com (デモユーザー)
- premium@example.com (プレミアム会員)

## 🎨 UIデザイン特徴

### 横カルーセル
- スムーズなスクロール
- 左右ナビゲーションボタン
- スワイプ対応（モバイル）
- **スクロール進捗インジケーター** - カルーセル下部にプログレスバー表示
- カード幅: 220px (PC), 200px (モバイル) - コンパクト設計

### カラースキーム
- メインカラー: Purple (#667eea → #764ba2)
- アクセント: Yellow (ランキング), Red (いいね)
- 背景: Gray-50 / White

### レイアウトパターン
- ヒーローセクション（フル幅グラデーション）
- 横カルーセルセクション（ランキング、動画、ブログ）
- 料金プラン（2カラムカード）
- フッター（4カラム）

### インタラクティブ要素 ✨ NEW
- **ランキングカード**: 最新動画と同じカード形式で統一感向上
- **ホバーアニメーション**: 
  - カード上にマウスを乗せるとサムネイル拡大
  - シマーエフェクト（光の流れ）
  - ランキングスコアのオーバーレイ表示
- **トップ3特別効果**: 
  - 1位のカードにパルスグローアニメーション
  - メダルバッジの立体的なグラデーション
  - シャドウ効果でランク強調
- **エントランスアニメーション**: 
  - カードが順次バウンスインで登場
  - タブ切り替え時のフェードアニメーション
- **ツールチップ**: 
  - 統計バッジにホバーで説明表示
  - カテゴリーバッジにホバー効果
- **ランキング変動表示**: 
  - 1位: 👑 王冠マーク
  - 2-3位: 🔥 急上昇マーク
  - 4-10位: 📈 順位変動数
  - 11位以降: ⭐ NEWマーク
- **タブボタン統一**: 
  - 動画カテゴリーとランキング期間の切り替えボタンを統一デザイン
  - アクティブ状態の視覚的フィードバック強化

## 💰 料金プラン

### 無料プラン ($0/月)
- 動画閲覧無制限
- ランキング閲覧
- ブログ閲覧
- 動画投稿（月5本まで）
- いいね・お気に入り（制限あり）

### プレミアムプラン ($20/月)
- **15日間無料トライアル**
- 動画閲覧無制限
- ランキング閲覧
- ブログ閲覧
- **動画投稿無制限**
- **いいね・お気に入り無制限**
- **広告非表示**
- **AIグレード判定機能**
- **優先サポート**

## 🔐 管理者アクセス

### デフォルト管理者アカウント
- **Email**: `admin@climbhero.com`
- **Password**: `admin123`

### アクセス方法

**方法1: モーダルからクイックログイン（推奨）** 👑
1. ヘッダー右上の「ログイン」ボタンをクリック
2. ログインモーダルの下部にある**「👑 管理者としてログイン」ボタン**をクリック
3. 自動的に管理者としてログインし、マイページへ遷移
4. マイページの「クイックアクション」から管理画面へアクセス

**方法2: 通常ログイン**
1. 「ログイン」ボタンをクリック
2. Email: `admin@climbhero.com` / Password: `admin123` を入力
3. マイページへ移動
4. 「👑 管理画面を開く」ボタンをクリック

### 管理者機能
1. **ブログ管理** - 投稿作成、編集、削除
2. **広告バナー管理** - バナー作成、編集、削除、統計確認
3. **動画管理** - （開発中）
4. **ユーザー管理** - （開発中）
5. **サイト設定** - （開発中）

## 📡 APIエンドポイント

### 認証API
- `POST /api/auth/register` - 新規ユーザー登録
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `GET /api/auth/me` - 現在のユーザー情報取得

### 動画API
- `GET /api/videos` - 動画一覧取得 🎲 **ランダム順序対応**
  - Query: `?page=1&limit=20&category=bouldering&search=keyword&lang=ja`
  - **ソート戦略**: Instagram/TikTok/Vimeoを優先し、YouTube動画を後に配置
  - 各優先度グループ内でRANDOM()によるランダムソート
  - 毎回異なる順序で多様なコンテンツを表示
- `GET /api/videos/:id` - 動画詳細取得
- `GET /api/videos/trending` - 注目の動画取得（増加率順） 🔥 NEW
  - Query: `?limit=10&lang=ja`
  - いいね増加率で計算: (recent_24h - previous_24h) / previous_24h * 100
  - previous=0の場合は優先順位を最高に設定 (recent * 1000)
  - **ランダムソート**: 非YouTubeプラットフォーム優先でランダム配置
- `GET /api/videos/instagram` - Instagram動画一覧取得 📸 NEW
  - Query: `?limit=10&lang=ja`
  - media_source='instagram'でフィルタリング
  - **ランダムソート**: 毎回異なる順序で表示
- `POST /api/videos` - 動画投稿（認証必須）
- `POST /api/videos/:id/like` - いいね/いいね解除
- `POST /api/videos/:id/favorite` - お気に入り追加/削除

### ランキングAPI 🎲 **プラットフォーム多様性対応**
- `GET /api/rankings/daily` - デイリーランキング
- `GET /api/rankings/weekly` - 週間ランキング
- `GET /api/rankings/monthly` - 月間ランキング
- `GET /api/rankings/yearly` - 年間ランキング
- `GET /api/rankings/total` - 総合ランキング
  - Query: `?limit=20`
  - **ソート戦略**: 非YouTubeプラットフォーム優先 → スコア降順 → ランダム
  - ランキング内でもプラットフォームの多様性を確保

### ブログAPI
- `GET /api/blog?lang={ja|en|zh|ko}` - ブログ記事一覧（多言語対応） 🌐 NEW
- `GET /api/blog/:id?lang={ja|en|zh|ko}` - ブログ記事詳細（IDまたはslug対応） 🌐 NEW
- `POST /api/blog` - ブログ投稿（認証必須）
- `PUT /api/blog/:id` - ブログ更新（認証必須）
- `DELETE /api/blog/:id` - ブログ削除（認証必須）

### Genspark AI連携API 🤖 NEW
- `POST /api/genspark/blog-url` - ブログURL生成（4言語対応）
  - 入力: `title_ja`（必須）、`title_en`, `title_zh`, `title_ko`, `custom_slug`（任意）
  - 出力: 4言語分のURL、slug、SEOプレビュー
  - 詳細: [GENSPARK_INTEGRATION.md](./GENSPARK_INTEGRATION.md)

## 💻 ローカル開発

### 必要要件
- Node.js 18+
- npm or pnpm
- Cloudflare account (本番デプロイ用)

### セットアップ
```bash
# 依存関係のインストール
npm install

# データベースマイグレーション
npm run db:migrate:local

# サンプルデータ投入（全プラットフォーム対応）
npm run db:seed:all

# ビルド
npm run build

# 開発サーバー起動（PM2）
pm2 start ecosystem.config.cjs

# サーバーテスト
npm test
```

### 開発用コマンド
```bash
# ポートクリーンアップ
npm run clean-port

# データベースリセット
npm run db:reset

# ログ確認
pm2 logs webapp --nostream

# サービス再起動
pm2 restart webapp
```

### 💖 いいね・お気に入り機能

**動画・ブログ・ニュースの全コンテンツに対応**

#### API エンドポイント

**ニュース記事**:
```bash
# いいね追加
curl -X POST http://localhost:3000/api/news/1/like \
  -H "Cookie: session_token=YOUR_TOKEN"

# いいね削除
curl -X DELETE http://localhost:3000/api/news/1/like \
  -H "Cookie: session_token=YOUR_TOKEN"

# お気に入り追加
curl -X POST http://localhost:3000/api/news/1/favorite \
  -H "Cookie: session_token=YOUR_TOKEN"

# お気に入り削除
curl -X DELETE http://localhost:3000/api/news/1/favorite \
  -H "Cookie: session_token=YOUR_TOKEN"
```

**ブログ記事**:
```bash
# いいね追加
curl -X POST http://localhost:3000/api/blog/1/like \
  -H "Cookie: session_token=YOUR_TOKEN"

# いいね削除
curl -X DELETE http://localhost:3000/api/blog/1/like \
  -H "Cookie: session_token=YOUR_TOKEN"

# お気に入り追加
curl -X POST http://localhost:3000/api/blog/1/favorite \
  -H "Cookie: session_token=YOUR_TOKEN"

# お気に入り削除
curl -X DELETE http://localhost:3000/api/blog/1/favorite \
  -H "Cookie: session_token=YOUR_TOKEN"
```

**統合お気に入り一覧**:
```bash
# 全お気に入り取得（動画・ブログ・ニュースをミックス）
curl http://localhost:3000/api/favorites?lang=ja \
  -H "Cookie: session_token=YOUR_TOKEN"

# レスポンス例
{
  "favorites": [
    {
      "id": 5,
      "title": "最新V14セッション",
      "content_type": "video",
      "favorited_at": "2025-11-25 10:30:00"
    },
    {
      "id": 3,
      "title": "クライミングシューズの選び方",
      "content_type": "blog",
      "favorited_at": "2025-11-25 10:15:00"
    },
    {
      "id": 1,
      "title": "Adam Ondra V17完登",
      "content_type": "news",
      "favorited_at": "2025-11-25 10:00:00"
    }
  ],
  "counts": {
    "videos": 15,
    "blogs": 8,
    "news": 12,
    "total": 35
  }
}
```

#### 特徴

- **認証必須**: 全てのいいね・お気に入り操作は認証が必要
- **重複防止**: 同じコンテンツに複数回いいね/お気に入りできない
- **自動カウント**: いいね数は自動的にカウントアップ/ダウン
- **時系列表示**: お気に入り一覧は最新順にソート
- **多言語対応**: ブログとニュースは指定言語で表示
- **ミックス表示**: 動画・ブログ・ニュースを1つの一覧で管理

### 🌍 世界ニュース自動収集・翻訳システム

**ClimbHeroは世界中のクライミングニュースを自動収集し、4言語にAI翻訳します。**

#### 特徴

- **毎日自動巡回**: 毎日15:00（UTC）に世界のクライミングメディアから最新記事を収集
- **4言語対応**: 日本語・英語・中国語・韓国語に自動翻訳（Gemini API使用）
- **オンデマンド翻訳**: 記事を初回リクエスト時に翻訳し、結果をキャッシュ
- **AIジャンル分類**: 記事を自動的にカテゴリ分け（達成・イベント・施設・研究等）
- **重複防止**: URL単位で重複記事をスキップ

#### ニュースソース

- **Rock and Ice**: https://rockandice.com/feed/
- **Climbing Magazine**: https://www.climbing.com/feed/
- **UKClimbing**: https://www.ukclimbing.com/news/rss.php

#### API エンドポイント

```bash
# 手動でニュースクロール実行（管理者用）
curl -X POST http://localhost:3000/api/admin/news/crawl-now

# 記事をオンデマンドで翻訳（ユーザー用）
curl http://localhost:3000/api/news/1/translate/zh  # 中国語
curl http://localhost:3000/api/news/2/translate/ko  # 韓国語
curl http://localhost:3000/api/news/3/translate/en  # 英語
```

#### 環境変数設定

**Gemini API Keyが必要です**:

```bash
# ローカル開発用
echo "GEMINI_API_KEY=your-gemini-api-key" > .dev.vars

# 本番環境用（Cloudflare Pages）
npx wrangler secret put GEMINI_API_KEY --project-name project-02ceb497
```

#### スケジュール設定

Cloudflare Cron Triggersで自動実行されます：

- **頻度**: 毎日
- **時刻**: 15:00 UTC（日本時間 0:00）
- **設定ファイル**: `wrangler.toml`

```toml
[triggers]
crons = ["0 15 * * *"]
```

#### 動作フロー

1. **15:00 UTC**: Cloudflare Cron Triggerが自動起動
2. **RSS取得**: 3つのメディアから最新記事を取得（最大20件）
3. **重複チェック**: URLで既存記事をチェック
4. **AI翻訳**: Gemini APIで4言語に並行翻訳
5. **ジャンル分類**: AI が記事をカテゴリ分類
6. **データベース保存**: 翻訳結果とメタデータを保存
7. **統計更新**: 最終クロール時刻を記録

### 📦 サンプルデータ管理（重要）

**サンプルデータの永続化**: すべてのプラットフォーム（YouTube, YouTube Shorts, Vimeo, Instagram, TikTok, X）のサンプルデータは永続的に維持されます。

#### サンプルデータコマンド

```bash
# 動画サンプル投入（全プラットフォーム）
npm run db:seed:videos

# ニュースサンプル投入
npm run db:seed:news

# すべてのサンプルデータ投入
npm run db:seed:all

# サンプルデータ検証（ローカル）
npm run db:verify

# サンプルデータ検証（本番）
npm run db:verify -- --remote
```

#### 自動バックアップシステム

```bash
# 手動バックアップ作成
npm run backup

# 自動バックアップ + Git コミット
npm run backup:auto

# デプロイ前自動バックアップ（predeploy hook）
npm run deploy  # 自動的にbackup:autoが実行されます
```

#### サンプルデータファイル

- `seed_real_videos.sql`: 全プラットフォームの動画サンプル（10件）
  - YouTube: 実在する動画ID
  - YouTube Shorts: 実在する動画ID
  - Vimeo: 実在する動画ID
  - Instagram Reels: 埋め込み対応形式
  - TikTok: 動画ID
  - X (Twitter): ツイートID

- `seed_news_mock.sql`: クライミングニュースサンプル（5件）
  - 全カテゴリ対応
  - 完全4言語翻訳
  - AIジャンル分類

#### デプロイ時の自動化

`npm run deploy`により、以下が自動実行されます：

1. **自動バックアップ**: `predeploy`フックでbackups/ディレクトリに保存
2. **Git自動コミット**: バックアップファイルを自動的にGitHubに同期
3. **プロジェクトビルド**: Viteによる最適化ビルド
4. **Cloudflareデプロイ**: 本番環境に自動デプロイ

**注意**: データベースマイグレーションは手動で実行する必要があります：
```bash
npm run db:migrate:prod     # 本番マイグレーション
npm run db:seed:prod        # 本番サンプルデータ投入
npm run db:verify -- --remote  # 本番データ検証
```
3. **サンプルデータ投入**: 本番環境に自動適用
4. **Cloudflareデプロイ**: 本番環境に自動デプロイ

**重要**: GitHubにプッシュするだけで、すべてのサンプルデータが自動的に本番環境に同期されます。

## 🌍 デプロイ

### GitHub + Cloudflare Pages 自動デプロイ（推奨）🎯 NEW

**✅ 自動CI/CD**: GitHubへのプッシュで自動デプロイ

#### セットアップ手順

1. **GitHubリポジトリ**: `https://github.com/goodbouldering-collab/Climbhero`

2. **GitHub Secretsの設定** (Settings → Secrets and variables → Actions):
   ```
   CLOUDFLARE_API_TOKEN: Cloudflare API トークン
   CLOUDFLARE_ACCOUNT_ID: CloudflareアカウントID
   ```

3. **自動デプロイフロー**:
   - `main`ブランチへのプッシュ → 自動ビルド＆デプロイ
   - Pull Request → プレビュー環境作成
   - デプロイ状況はGitHub Actionsで確認

4. **デプロイURL**: `https://project-02ceb497.pages.dev`

#### 手動デプロイ（ローカルマシンから）

```bash
# リポジトリをクローン
git clone https://github.com/goodbouldering-collab/Climbhero.git
cd Climbhero

# 依存関係インストール
npm install

# ビルド
npm run build

# Cloudflare認証
npx wrangler login

# デプロイ
npm run deploy:prod
```

#### データベースマイグレーション

**手動実行（本番環境）**:
```bash
npm run db:migrate:prod
```

**GitHub Actionsから実行**:
1. GitHub → Actions → "Database Migrations"
2. "Run workflow" → Environment: `production`
3. マイグレーション実行

#### 設定情報
- **プロジェクト名**: `project-02ceb497`
- **GitHubリポジトリ**: `goodbouldering-collab/Climbhero`
- **ビルドコマンド**: `npm run build`
- **出力ディレクトリ**: `dist`
- **Node.js バージョン**: 18.x
- **自動デプロイ**: ✅ GitHub Actions

## 📦 技術スタック

- **フロントエンド**: Vanilla JavaScript, Tailwind CSS, Font Awesome
- **バックエンド**: Hono (Cloudflare Workers)
- **データベース**: Cloudflare D1 (SQLite)
- **ビルドツール**: Vite
- **デプロイ**: Cloudflare Pages
- **プロセス管理**: PM2
- **HTTP クライアント**: Axios
- **AI連携**: OpenAPI 3.0, AI Plugin, LLMO最適化 🤖 NEW
- **多言語対応**: 日本語・英語・中国語・韓国語（ja/en/zh/ko） 🌐 NEW

## 🎯 参考サイト

デザイン参考: https://climbhero.info

以下の要素を模倣：
- ビジュアル重視のワイドレイアウト
- サムネイル中心のカード設計
- 横スクロールカルーセル
- 明確な会員プランCTA
- シンプルな投稿フォーム
- 信頼性を補強するフッター

## 🏢 運営会社

**グッぼる - ボルダリングCafe & Shop**
- 所在地: 滋賀県彦根市
- 営業時間: 10:00-22:00
- Email: info@climbhero.info
- ジム年間利用者: 2.5万人
- クライミングシューズ在庫: 約120モデル
- クライミング歴30年以上の権威により運営

## 📝 ライセンス

MIT License

## 👤 作成者

**由井辰美 (Yui Tatsumi)**
- グッぼる ボルダリングCafe & Shop オーナー
- プロダクトマネージャー / ロッククライマー
- クライミング歴30年以上
- クライミング施設14件の立ち上げ支援実績

---

**最終更新日**: 2025-11-17 20:30 JST
**プロジェクト状態**: ✅ **本番稼働中（管理者ログインUI改善版）**
**本番URL**: https://9fa95b71.project-02ceb497.pages.dev ⭐ 最新デプロイ（モーダル内クイックログイン）
**GitHubリポジトリ**: https://github.com/goodbouldering-collab/Climbhero
**参考サイト**: https://climbhero.info

### 本番環境データ統計
- **動画**: 25本（**4プラットフォーム完全対応**）
  - YouTube: 10本（自動サムネイル）
  - Instagram: 5本（高品質フォールバック）
  - TikTok: 5本（高品質フォールバック）
  - Vimeo: 5本（高品質フォールバック）
- **ブログ**: 5本（全4言語完全翻訳済み）
- **お知らせ**: 4件（全4言語対応）
- **ユーザー**: 3名（admin、demo、premium）
- **多言語対応**: 日本語・英語・中国語・韓国語（ja/en/zh/ko）

### 新機能ハイライト 🎥
- **video-helpers.js**: プラットフォーム固有のサムネイル・表示ロジック
- **スマートサムネイル**: YouTubeは自動生成、その他はUnsplash高品質画像
- **プラットフォーム別最適表示**: 
  - YouTube/Vimeo: iframe埋め込みで直接再生
  - TikTok/Instagram: サムネイル+ボタンで外部リンク
- **エラーハンドリング**: onerror属性で自動フォールバック
- **URL自動検出**: URLから自動的にプラットフォーム判定

## 🚀 クイックスタート（開発環境）

```bash
# 1. リポジトリクローン
git clone https://github.com/goodbouldering-collab/Climbhero.git
cd Climbhero

# 2. 依存関係インストール
npm install

# 3. ローカルデータベース初期化
npm run db:migrate:local
npm run db:seed

# 4. ビルド
npm run build

# 5. 開発サーバー起動（PM2）
pm2 start ecosystem.config.cjs

# 6. ブラウザで確認
# http://localhost:3000
```

## 📖 詳細ドキュメント

- **デプロイガイド**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Cloudflare Pages + D1完全手順
- **Cloudflare設定**: [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) - 旧マニュアルデプロイ手順
- **Genspark連携**: [GENSPARK_INTEGRATION.md](./GENSPARK_INTEGRATION.md) - AI連携API仕様

## 💡 推奨追加機能（実装検討中）

以下の機能は、ClimbHeroプラットフォームをより強化するための提案です：

### 🎯 データ分析機能
- **完登データ分析**: 動画ごとの視聴完了率・リピート率の追跡
- **ユーザー行動分析**: 視聴パターン、お気に入り傾向の分析ダッシュボード
- **動画パフォーマンス**: 視聴時間、エンゲージメント率の可視化

### 🏪 EC機能統合
- **商品カタログ**: クライミングシューズ、クラッシュパッド、ギアの販売
- **在庫管理**: リアルタイム在庫確認、予約システム
- **LINE連携**: LINEでの在庫確認・予約完結
- **試し履き予約**: ジムでの試着・試登予約機能

### 📅 イベント管理
- **コンテスト機能**: 動画コンテスト開催・投票システム
- **外岩講習予約**: ビギナー向け外岩講習のオンライン予約
- **ジムイベント**: セッション、コーチング予約システム

### 🤖 AI機能強化
- **グレード自動判定**: 動画からクライミンググレードを推定
- **フォーム分析**: 登攀動作の分析とアドバイス提供
- **レコメンデーション**: ユーザーのレベル・好みに応じた動画推薦

### 🎥 動画機能拡張
- **動画編集ツール**: トリミング、スロー再生機能
- **比較再生**: 2つの動画を並べて比較
- **プレイリスト**: ユーザー作成のプレイリスト機能

### 💬 コミュニティ機能
- **コメントシステム**: 動画へのコメント・ディスカッション
- **メンタリング**: 上級者と初心者のマッチング
- **チーム機能**: グループでの動画共有・競争

### 📊 パフォーマンストラッキング
- **登攀ログ**: 完登履歴、トライ回数の記録
- **進捗グラフ**: レベル向上の可視化
- **目標設定**: 個人目標の設定と達成管理

---

## 🎉 最新アップデート (2025-11-17)

### 🎬 モーダル表示の最適化 + URL自動検出 🆕

**プラットフォームごとに最適な表示方法を実装！**
- ✅ **統一モーダルサイズ**: 全プラットフォーム共通（max-w-4xl、aspect-video 16:9）
- ✅ **YouTube / Vimeo**: iframe埋め込みで直接再生可能
- ✅ **TikTok / Instagram**: サムネイル表示 + 再生ボタン + 外部リンク
  - iframe埋め込みの動作不安定性を考慮し、サムネイル+ボタン方式に変更
  - 「〇〇で視聴」メッセージと外部リンクボタンで明確な誘導
  - ユーザー体験の安定性を優先
- ✅ **URL自動検出機能** 🤖:
  - `detectMediaSource(url)`関数でURLから自動的にプラットフォーム判定
  - URLから自動的にプラットフォームを判定（YouTube/Vimeo/TikTok/Instagram）
  - Y