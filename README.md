# ClimbHero - クライミング動画共有プラットフォーム

## プロジェクト概要
- **名称**: ClimbHero
- **目的**: クライマー向けの本格的な動画共有プラットフォーム。YouTube等のクライミング動画URLを投稿・共有し、コミュニティで楽しむ。
- **主要機能**:
  - 動画URL投稿機能（AI自動ジャンル判定）
  - カテゴリー別フィルタリング（ボルダリング、競技、チュートリアル、ジムレビュー）
  - いいね・お気に入り機能
  - 会員プラン管理（無料/有料）
  - レスポンシブデザイン（PC・モバイル対応）

## アクセスURL
- **開発環境**: https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai
- **GitHub**: （未設定）

## データアーキテクチャ

### データモデル
1. **videos**: 動画情報（タイトル、URL、サムネイル、カテゴリー、いいね数、再生回数）
2. **users**: ユーザー情報（メール、ユーザー名、会員タイプ、投稿制限）
3. **likes**: いいね関連テーブル（ユーザー×動画の関連）
4. **favorites**: お気に入りテーブル（ユーザー×動画の関連）
5. **blog_posts**: ブログ記事情報

### ストレージサービス
- **Cloudflare D1 Database**: SQLiteベースの分散データベース
  - ローカル開発: `.wrangler/state/v3/d1`（自動生成）
  - 本番環境: Cloudflare D1（未デプロイ）

### データフロー
```
ユーザー → フロントエンド (TailwindCSS + Vanilla JS)
         ↓
      Hono API (/api/*)
         ↓
    Cloudflare D1 Database (SQLite)
```

## 技術スタック
- **バックエンド**: Hono (v4.10.3)
- **データベース**: Cloudflare D1 (SQLite)
- **フロントエンド**: TailwindCSS + Vanilla JavaScript
- **デプロイ**: Cloudflare Pages
- **開発**: Wrangler CLI + PM2

## ユーザーガイド

### 1. 動画閲覧
- トップページで最新動画を閲覧可能
- カテゴリーボタンでフィルタリング
- 動画カードをクリックで元のURL（YouTube等）へ遷移

### 2. 動画投稿
- 「動画投稿」セクションで動画URLを入力
- タイトル、説明、カテゴリーを選択して投稿
- **制限**: 一般会員10件/日、プレミアム会員30件/日

### 3. いいね・お気に入り
- 各動画カードのハートアイコンでいいね
- 星アイコンでお気に入り登録
- ※現在はデモユーザー(ID:1)で操作

### 4. 会員プラン
- **無料会員**: 閲覧のみ
- **有料会員（$20/月）**: 投稿、いいね、お気に入り機能利用可能

## API エンドポイント

### 動画関連
- `GET /api/videos` - 動画一覧取得
  - Query: `page`, `limit`, `category`
- `GET /api/videos/:id` - 動画詳細取得
- `POST /api/videos` - 動画投稿
  - Body: `{ title, description, url, thumbnail_url, duration, channel_name, category }`
- `POST /api/videos/:id/like` - いいね切替
  - Body: `{ user_id }`
- `POST /api/videos/:id/favorite` - お気に入り切替
  - Body: `{ user_id }`

### ブログ関連
- `GET /api/blog` - ブログ記事一覧取得

### ユーザー関連
- `GET /api/users/:id/stats` - ユーザー統計情報取得

## デプロイ情報
- **プラットフォーム**: Cloudflare Pages（未デプロイ）
- **ステータス**: ✅ ローカル開発環境で稼働中
- **最終更新**: 2025-10-26

## 開発コマンド

```bash
# ビルド
npm run build

# ローカル開発サーバー起動（PM2使用）
npm run clean-port          # ポート3000のクリーンアップ
pm2 start ecosystem.config.cjs

# データベース操作
npm run db:migrate:local    # マイグレーション実行（ローカル）
npm run db:seed             # テストデータ投入
npm run db:reset            # データベースリセット

# PM2操作
pm2 list                    # プロセス一覧
pm2 logs webapp --nostream  # ログ確認
pm2 restart webapp          # 再起動
pm2 stop webapp             # 停止
pm2 delete webapp           # 削除

# テスト
npm run test                # curl http://localhost:3000

# デプロイ（未実行）
npm run deploy:prod         # Cloudflare Pagesへデプロイ
```

## 完成済み機能
✅ 動画一覧表示（グリッド、サムネイル、カテゴリーバッジ、再生時間）  
✅ カテゴリー別フィルタリング（4カテゴリー対応）  
✅ 動画URL投稿フォーム（バリデーション付き）  
✅ いいね機能（トグル、カウント表示）  
✅ お気に入り機能（トグル）  
✅ ページネーション（もっと見るボタン）  
✅ レスポンシブデザイン（PC/タブレット/モバイル）  
✅ 会員プラン説明セクション  
✅ ブログ記事表示（最新3件）  
✅ Cloudflare D1データベース統合  
✅ RESTful API実装  

## 未実装機能
⏳ ユーザー認証機能（ログイン/ログアウト）  
⏳ YouTube API連携（自動サムネイル・タイトル取得）  
⏳ 実際のAI自動ジャンル判定  
⏳ 投稿制限機能（日次カウント）  
⏳ 決済機能統合（Stripe等）  
⏳ ユーザーダッシュボード  
⏳ 動画検索機能  
⏳ コメント機能  

## 推奨される次のステップ
1. **ユーザー認証の実装** - Cloudflare Access または Auth0 統合
2. **YouTube Data API v3連携** - 自動メタデータ取得
3. **本番デプロイ** - Cloudflare Pagesへデプロイ
4. **AI判定機能** - Cloudflare AI Workersでコンテンツフィルタリング
5. **決済統合** - Stripe Checkoutで会員プラン実装

## プロジェクト構成
```
webapp/
├── src/
│   ├── index.tsx           # メインHonoアプリケーション（API + HTML）
│   └── renderer.tsx        # JSXレンダラー（未使用）
├── public/
│   └── static/
│       └── app.js          # フロントエンドJavaScript
├── migrations/
│   └── 0001_initial_schema.sql  # D1マイグレーションSQL
├── seed.sql                # テストデータ
├── ecosystem.config.cjs    # PM2設定
├── wrangler.jsonc          # Cloudflare設定
├── package.json            # 依存関係・スクリプト
└── README.md               # このファイル
```

## ライセンス
MIT License

## 作成者
由井辰美 (Tatsumi Yui) - グッぼる / Notエステ / rasiku
