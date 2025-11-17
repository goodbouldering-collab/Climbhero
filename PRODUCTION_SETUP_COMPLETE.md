# 🎉 ClimbHero 本番環境セットアップ完了ガイド

## ✅ 完了した設定（2025-11-17）

### 1. GitHubリポジトリ ✅
- **URL**: https://github.com/goodbouldering-collab/Climbhero
- **ブランチ**: `main`
- **最新コミット**: すべてのコード同期済み
- **認証**: Git credentials設定完了

### 2. Cloudflare D1 データベース ✅
- **データベース名**: `webapp-production`
- **Database ID**: `2faec3c4-115c-434f-9144-af1380440b7c`
- **リージョン**: ENAM (Eastern North America)
- **マイグレーション**: ✅ 全25ファイル適用完了
- **テーブル数**: 37テーブル作成完了
- **シードデータ**: 管理者ユーザー + サンプルユーザー投入済み

### 3. Cloudflare Pages デプロイ ✅
- **プロジェクト名**: `project-02ceb497`
- **本番URL**: https://project-02ceb497.pages.dev
- **最新デプロイ**: https://1e221add.project-02ceb497.pages.dev
- **デプロイ状態**: ✅ 成功
- **API疎通**: ✅ 正常動作確認済み

### 4. D1バインディング設定 ⚠️ 自動設定（確認推奨）
Cloudflare Pagesは`wrangler.jsonc`の`d1_databases`設定を自動的に読み取ります。
ただし、ダッシュボードで明示的に確認することを推奨します。

---

## 🔧 現在の状態と次のステップ

### ✅ 正常動作している機能
1. **フロントエンド**: HTMLページ正常表示
2. **バックエンドAPI**: `/api/videos`等のエンドポイント動作
3. **データベース接続**: D1データベースに正常接続
4. **認証システム**: 管理者ログイン可能

### ⚠️ データが空の項目（追加データ投入が必要）
1. **動画データ**: 0件（動画投稿機能で追加可能）
2. **ブログ記事**: 0件（管理画面から追加可能）
3. **お知らせ**: 0件（管理画面から追加可能）

---

## 📝 データ投入方法

### 方法1: 管理画面から手動追加（推奨）

#### ステップ1: 管理者ログイン
```
URL: https://1e221add.project-02ceb497.pages.dev
1. 「ログイン」をクリック
2. Email: admin@climbhero.com
3. Password: admin123
4. ログイン後、マイページ → 「管理画面」ボタンをクリック
```

#### ステップ2: データ追加
**ブログ記事追加**:
1. 管理画面 → 「ブログ管理」セクション
2. 「新規記事作成」ボタンをクリック
3. タイトル、内容、画像URL、ジャンルを入力
4. 「投稿」ボタンで保存

**お知らせ追加**:
1. 管理画面 → 「お知らせ管理」セクション
2. 「新規お知らせ作成」ボタンをクリック
3. タイトル、内容、ジャンルを選択
4. 「投稿」ボタンで保存

**動画投稿**:
1. ヘッダーの「動画を投稿」ボタンをクリック（要プレミアム会員）
2. YouTube/Instagram/TikTok/VimeoのURLを入力
3. タイトル、説明、カテゴリを選択
4. 「投稿」ボタンで追加

### 方法2: seed.sqlを使用（開発環境データを一括投入）

**ローカル環境で実行**:
```bash
# リポジトリクローン
git clone https://github.com/goodbouldering-collab/Climbhero.git
cd Climbhero

# 依存関係インストール
npm install

# Cloudflare認証
npx wrangler login

# 本番データベースに一括投入
npx wrangler d1 execute webapp-production --remote --file=./seed.sql
```

**注意**: seed.sqlには25本の動画、5つのブログ記事、8つのお知らせが含まれています。
外部キー制約エラーが発生する場合は、管理画面から手動追加を推奨します。

---

## 🚀 自動デプロイ設定（GitHub連携）

### 現在の状態
- **手動デプロイ**: `npm run deploy:prod` で手動デプロイ可能
- **Git連携**: 未設定（Cloudflare Dashboard設定が必要）

### 自動デプロイ設定手順

#### ステップ1: Cloudflare Dashboardでの設定
1. https://dash.cloudflare.com にログイン
2. **Pages** → **project-02ceb497** を選択
3. **Settings** → **Builds & deployments** に移動
4. **Configure Production deployments** をクリック
5. **Connect to Git** を選択

#### ステップ2: GitHub連携
1. GitHubアカウント認証（`goodbouldering-collab`）
2. リポジトリ選択: `goodbouldering-collab/Climbhero`
3. ビルド設定:
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
   - **Environment variables**: （必要に応じて）
     ```
     NODE_VERSION=18
     ```

#### ステップ3: 保存して完了
設定後、`main`ブランチへのプッシュで自動デプロイが開始されます。

### 自動デプロイ後のフロー
```
コード変更 → git push origin main → Cloudflare自動ビルド → 自動デプロイ（2-3分）
```

---

## 🔍 動作確認チェックリスト

### フロントエンド
- [ ] トップページ表示: https://1e221add.project-02ceb497.pages.dev
- [ ] 多言語切り替え（🇯🇵🇺🇸🇨🇳🇰🇷）動作確認
- [ ] ログインフォーム表示
- [ ] 会員登録フォーム表示

### 管理者機能
- [ ] 管理者ログイン成功（admin@climbhero.com / admin123）
- [ ] 管理画面アクセス可能
- [ ] ブログ記事作成可能
- [ ] お知らせ作成可能

### API疎通
```bash
# 動画一覧API
curl https://1e221add.project-02ceb497.pages.dev/api/videos?limit=5

# ブログ一覧API
curl https://1e221add.project-02ceb497.pages.dev/api/blog?lang=ja

# お知らせ一覧API
curl https://1e221add.project-02ceb497.pages.dev/api/announcements?lang=ja

# 認証API（ログイン）
curl -X POST https://1e221add.project-02ceb497.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@climbhero.com","password":"admin123"}'
```

### データベース
```bash
# テーブル数確認（37テーブル期待）
npx wrangler d1 execute webapp-production --remote \
  --command="SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table'"

# ユーザー数確認（3ユーザー期待: admin, demo, premium）
npx wrangler d1 execute webapp-production --remote \
  --command="SELECT COUNT(*) as user_count FROM users"

# 動画数確認
npx wrangler d1 execute webapp-production --remote \
  --command="SELECT COUNT(*) as video_count FROM videos"
```

---

## 🐛 トラブルシューティング

### エラー: "D1_ERROR: no such table: videos"
**原因**: D1バインディングが設定されていない、またはデプロイが古い

**解決策**:
1. Cloudflare Dashboard → Pages → project-02ceb497 → Settings → Functions
2. D1 database bindingsセクションを確認
3. `DB` バインディングが `webapp-production` に設定されているか確認
4. 設定がない場合は追加:
   - Variable name: `DB`
   - D1 database: `webapp-production`
5. 再デプロイ: `npm run deploy:prod`

### エラー: "Authentication required"
**原因**: ログインしていない、またはセッショントークンが無効

**解決策**:
1. ログアウト → 再ログイン
2. ブラウザのCookieをクリア
3. 管理者アカウントで再ログイン（admin@climbhero.com / admin123）

### エラー: データが表示されない
**原因**: データベースが空

**解決策**:
1. 管理画面からデータを手動追加
2. または `seed.sql` を実行してサンプルデータ投入
3. ページをリロード

### デプロイ失敗: "Project not found"
**原因**: プロジェクト名の不一致

**解決策**:
```bash
# 正しいプロジェクト名を確認
npx wrangler pages project list

# package.jsonのデプロイスクリプトを確認
cat package.json | grep deploy

# 正しいプロジェクト名に修正
npm run deploy:prod
```

---

## 📊 本番環境の詳細情報

### プロジェクト構成
```
production/
├── Database: webapp-production (D1)
│   ├── Tables: 37
│   ├── Users: 3
│   ├── Videos: 0 (要追加)
│   ├── Blog Posts: 0 (要追加)
│   └── Announcements: 0 (要追加)
├── Pages: project-02ceb497
│   ├── URL: https://1e221add.project-02ceb497.pages.dev
│   ├── Branch: main
│   └── Auto Deploy: 未設定（手動設定推奨）
└── GitHub: goodbouldering-collab/Climbhero
    ├── Branch: main
    └── Commits: すべて同期済み
```

### アクセス情報
```
本番URL: https://1e221add.project-02ceb497.pages.dev
GitHub: https://github.com/goodbouldering-collab/Climbhero
Cloudflare Dashboard: https://dash.cloudflare.com

管理者ログイン:
  Email: admin@climbhero.com
  Password: admin123

デモユーザー:
  Email: demo@example.com
  Password: demo

プレミアムユーザー:
  Email: premium@example.com
  Password: premium
```

### データベース情報
```
Database Name: webapp-production
Database ID: 2faec3c4-115c-434f-9144-af1380440b7c
Region: ENAM (Eastern North America)
Tables: 37
Migrations: 25 applied
```

---

## 🎯 推奨される次のステップ

### 優先度 ⚠️ 高（今すぐ実施）
1. **Cloudflare Pages Git連携設定** - 自動デプロイ有効化
2. **管理画面からサンプルデータ追加** - 動画、ブログ、お知らせ各3-5件
3. **動作確認** - 全機能テスト（ログイン、投稿、検索、言語切替）

### 優先度 🌟 中（1週間以内）
4. **カスタムドメイン設定** - `climbhero.com` などの独自ドメイン
5. **環境変数設定** - Stripe, SendGrid等の認証情報
6. **監視・アラート設定** - エラー通知、ダウンタイムアラート
7. **バックアップ戦略** - 定期的なD1データベースバックアップ

### 優先度 💡 低（1ヶ月以内）
8. **SEO最適化** - sitemap.xml、robots.txt更新
9. **パフォーマンス最適化** - 画像圧縮、CDNキャッシュ設定
10. **アナリティクス統合** - Cloudflare Analytics、Google Analytics

---

## 📚 関連ドキュメント

- **DEPLOYMENT_GUIDE.md**: 詳細デプロイ手順
- **README.md**: プロジェクト概要とクイックスタート
- **GENSPARK_INTEGRATION.md**: AI連携API仕様

---

**セットアップ完了日**: 2025-11-17  
**担当**: YUI (由井辰美)  
**プロジェクト**: ClimbHero - クライミング動画共有プラットフォーム  
**状態**: ✅ 本番環境稼働中

---

## 🎉 おめでとうございます！

ClimbHeroの本番環境セットアップが完了しました。

以下のことが可能になりました:
- ✅ GitHubでのソースコード管理
- ✅ Cloudflare Pagesでの本番デプロイ
- ✅ Cloudflare D1での本番データベース運用
- ✅ 管理画面からのコンテンツ管理
- ✅ 4言語対応（日本語・英語・中国語・韓国語）

今後は管理画面からコンテンツを追加し、GitHubへのプッシュで自動デプロイが可能です。

**本番URL**: https://1e221add.project-02ceb497.pages.dev

良いクライミングライフを！🧗‍♀️🧗‍♂️
