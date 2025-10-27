# ClimbHero - クライミング動画共有プラットフォーム

## 📋 プロジェクト概要

**ClimbHero**は、クライミング愛好家のための統合動画共有プラットフォームです。動画投稿、ランキング、ブログ記事を一つのインタラクティブなインターフェースで提供し、コミュニティの成長と情報共有を促進します。

### 主な特徴

- **統合ダッシュボード**: ランキング、最新動画、ブログを1ページで閲覧
- **インタラクティブUI**: ミニマルで直感的なデザイン、最適化されたマージンバランス
- **動画共有機能**: YouTubeリンクから簡単に動画を投稿・共有
- **ランキングシステム**: 週間・月間・総合ランキングで人気動画を追跡
- **ブログ機能**: クライミングテクニックやイベント情報を発信
- **管理者ダッシュボード**: ブログ投稿、アカウント管理、ページ編集を一元管理

## 🌐 公開URL

- **本番環境**: https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai
- **GitHub**: https://github.com/username/webapp (要設定)

## ✨ 完成済み機能

### フロントエンド機能
- ✅ 統合トップページ（ランキング + 動画 + ブログ）
- ✅ レスポンシブデザイン
- ✅ インタラクティブなカード表示
- ✅ カテゴリフィルター（ボルダリング、大会、解説、ジム紹介）
- ✅ 動画詳細モーダル（YouTubeプレイヤー統合）
- ✅ いいね・お気に入り機能
- ✅ ユーザー認証（ログイン/登録）
- ✅ 動画投稿機能
- ✅ ブログ記事詳細ページ

### Admin管理機能
- ✅ 管理者ダッシュボード（`#admin`でアクセス）
- ✅ ブログ投稿・編集・削除機能
- ✅ 管理サイドバーナビゲーション
- ✅ 権限ベースのアクセス制御

### バックエンドAPI
- ✅ `/api/auth/*` - 認証エンドポイント（登録、ログイン、ログアウト）
- ✅ `/api/videos` - 動画CRUD操作
- ✅ `/api/videos/:id/like` - いいね機能
- ✅ `/api/videos/:id/favorite` - お気に入り機能
- ✅ `/api/rankings/:type` - ランキング取得（weekly, monthly, total）
- ✅ `/api/blog` - ブログ記事CRUD操作
- ✅ Admin権限チェック機能

## 🗄️ データアーキテクチャ

### ストレージサービス
- **Cloudflare D1 Database** (SQLite): メインデータストア
  - `users` - ユーザー情報 + Admin権限
  - `videos` - 動画メタデータ
  - `blog_posts` - ブログ記事
  - `video_rankings` - ランキングスコア
  - `likes`, `favorites`, `comments` - ユーザーインタラクション

### データモデル

**Users テーブル**
```sql
- id: INTEGER PRIMARY KEY
- email: TEXT UNIQUE
- username: TEXT
- password_hash: TEXT
- is_admin: INTEGER (0 or 1) -- 新規追加
- membership_type: TEXT
- session_token: TEXT
- created_at: DATETIME
```

**Videos テーブル**
```sql
- id: INTEGER PRIMARY KEY
- title: TEXT
- description: TEXT
- url: TEXT (YouTube URL)
- thumbnail_url: TEXT
- duration: TEXT
- channel_name: TEXT
- category: TEXT (bouldering, competition, tutorial, gym_review)
- views: INTEGER
- likes: INTEGER
- created_at: DATETIME
```

**Blog Posts テーブル**
```sql
- id: INTEGER PRIMARY KEY
- title: TEXT
- content: TEXT
- image_url: TEXT
- published_date: DATE
```

**Video Rankings テーブル**
```sql
- video_id: INTEGER PRIMARY KEY
- total_score: INTEGER
- weekly_score: INTEGER
- monthly_score: INTEGER
- last_updated: DATETIME
```

## 📊 現在の機能エントリURI

### 認証API
- `POST /api/auth/register` - 新規ユーザー登録
  - Body: `{ email, username, password }`
- `POST /api/auth/login` - ログイン
  - Body: `{ email, password }`
- `POST /api/auth/logout` - ログアウト
- `GET /api/auth/me` - 現在のユーザー情報取得

### 動画API
- `GET /api/videos` - 動画一覧取得
  - Query: `?page=1&limit=12&category=bouldering&search=keyword`
- `GET /api/videos/:id` - 動画詳細取得
- `POST /api/videos` - 動画投稿（認証必須）
  - Body: `{ title, description, url, thumbnail_url, duration, channel_name, category }`
- `POST /api/videos/:id/like` - いいね/いいね解除（認証必須）
- `GET /api/videos/:id/liked` - いいね状態確認
- `POST /api/videos/:id/favorite` - お気に入り追加/削除（認証必須）
- `GET /api/videos/:id/favorited` - お気に入り状態確認
- `GET /api/videos/:id/comments` - コメント取得
- `POST /api/videos/:id/comments` - コメント投稿（認証必須）

### ランキングAPI
- `GET /api/rankings/weekly` - 週間ランキング
  - Query: `?limit=20`
- `GET /api/rankings/monthly` - 月間ランキング
- `GET /api/rankings/total` - 総合ランキング

### ブログAPI
- `GET /api/blog` - ブログ記事一覧
- `GET /api/blog/:id` - ブログ記事詳細
- `POST /api/blog` - ブログ投稿（認証必須）
  - Body: `{ title, content, image_url, published_date }`
- `PUT /api/blog/:id` - ブログ更新（認証必須）
- `DELETE /api/blog/:id` - ブログ削除（認証必須）

### ユーザープロフィールAPI
- `GET /api/users/:id/videos` - ユーザーの投稿動画
- `GET /api/users/:id/favorites` - ユーザーのお気に入り

## 🎨 UIデザイン特徴

### ミニマルデザインシステム
- **カラーパレット**: Purple/Indigo グラデーション
- **タイポグラフィ**: システムフォント、明確な階層
- **スペーシング**: 一貫した4px基準のマージン/パディング
- **カード**: シャドウとホバーエフェクトで立体感
- **ボタン**: 明確な視覚フィードバック、アイコン統合

### インタラクティブ要素
- ホバーアニメーション（transform、opacity）
- カードフリップエフェクト（動画カード）
- スムーズなモーダルトランジション
- トースト通知システム
- レスポンシブグリッドレイアウト

## 🔐 管理者アクセス

### デフォルト管理者アカウント
- **Email**: `admin@climbhero.com`
- **Password**: `admin123`
- **アクセス**: ログイン後、ヘッダーの「Admin」ボタンからダッシュボードへ

### 管理者機能
1. **ブログ管理** - 投稿作成、編集、削除
2. **動画管理** - （開発中）
3. **ユーザー管理** - （開発中）
4. **設定** - （開発中）

## 🚀 次のステップ（推奨）

1. **Admin機能拡張**
   - 動画の承認/削除機能
   - ユーザー管理画面
   - サイト設定パネル

2. **ユーザー体験向上**
   - コメント機能の強化
   - 通知システム
   - マイページのカスタマイズ

3. **パフォーマンス最適化**
   - 画像の遅延読み込み
   - 無限スクロール
   - キャッシュ戦略

4. **ソーシャル機能**
   - フォロー/フォロワー機能
   - プライベートメッセージ
   - グループ/コミュニティ機能

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

# シードデータ投入
npm run db:seed

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

## 🌍 デプロイ

### Cloudflare Pagesへのデプロイ
```bash
# ビルド
npm run build

# プロダクションデプロイ
npm run deploy:prod

# データベースマイグレーション（本番）
npm run db:migrate:prod
```

## 📦 技術スタック

- **フロントエンド**: Vanilla JavaScript, Tailwind CSS, Font Awesome
- **バックエンド**: Hono (Cloudflare Workers)
- **データベース**: Cloudflare D1 (SQLite)
- **ビルドツール**: Vite
- **デプロイ**: Cloudflare Pages
- **プロセス管理**: PM2
- **HTTP クライアント**: Axios

## 📝 ライセンス

MIT License

## 👤 作成者

**由井辰美 (Yui Tatsumi)**
- グッぼる ボルダリングCafe & Shop オーナー
- プロダクトマネージャー / ロッククライマー
- クライミング歴30年以上の権威として、本格的なクライミングコミュニティプラットフォームを構築

---

**最終更新日**: 2025-10-27
**プロジェクト状態**: ✅ 本番稼働中
