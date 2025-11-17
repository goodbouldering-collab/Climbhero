# 🚀 ClimbHero デプロイガイド

## ✅ 完了した設定

### 1. GitHubリポジトリ
- **URL**: https://github.com/goodbouldering-collab/Climbhero
- **ブランチ**: `main`
- **状態**: ✅ コード同期済み

### 2. Cloudflare Pages プロジェクト
- **プロジェクト名**: `project-02ceb497`
- **本番URL**: https://project-02ceb497.pages.dev
- **最新デプロイURL**: https://17371dc4.project-02ceb497.pages.dev
- **状態**: ✅ デプロイ成功

### 3. Cloudflare D1 データベース
- **データベース名**: `webapp-production`
- **Database ID**: `2faec3c4-115c-434f-9144-af1380440b7c`
- **リージョン**: ENAM (Eastern North America)
- **状態**: ✅ 作成済み（マイグレーション未実行）

---

## 🔧 必要な手動設定

### Cloudflare Dashboardでの設定（重要）

#### 1. D1データベースのバインディング設定

1. **Cloudflare Dashboard** にアクセス: https://dash.cloudflare.com
2. **Pages** → **project-02ceb497** を選択
3. **Settings** → **Functions** → **D1 database bindings** に移動
4. **Add binding** をクリック:
   - **Variable name**: `DB`
   - **D1 database**: `webapp-production`
   - **Environment**: `Production` と `Preview` の両方に追加
5. **Save** をクリック

#### 2. データベースマイグレーション実行

**方法1: Wrangler CLI（ローカル環境から推奨）**
```bash
# ローカルマシンでリポジトリをクローン
git clone https://github.com/goodbouldering-collab/Climbhero.git
cd Climbhero

# 依存関係インストール
npm install

# Cloudflare認証
npx wrangler login

# 本番データベースにマイグレーション適用
npm run db:migrate:prod
```

**方法2: Cloudflare Dashboard（データベースコンソール）**
1. **Cloudflare Dashboard** → **D1**
2. **webapp-production** データベースを選択
3. **Console** タブで各マイグレーションSQLを手動実行:
   - `migrations/0001_initial_schema.sql`
   - `migrations/0002_add_comments_and_rankings.sql`
   - ... （全25ファイル）

#### 3. 環境変数設定（必要に応じて）

**Cloudflare Pages Settings** → **Environment variables**:
```
# 本番環境用
ENVIRONMENT=production
NODE_ENV=production

# Stripe統合（プレミアムプラン決済）
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# メール送信（SendGrid推奨）
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@climbhero.com
```

---

## 🔄 自動デプロイフロー

### 現在の設定（手動デプロイ）
```bash
# コード変更をプッシュ
git add .
git commit -m "新機能追加"
git push origin main

# 手動デプロイ
npm run deploy:prod
```

### 推奨設定（GitHub + Cloudflare Pages連携）

#### Cloudflare Dashboard設定
1. **Pages** → **project-02ceb497** → **Settings** → **Builds & deployments**
2. **Configure Production deployments** → **Connect to Git**
3. GitHubアカウントを認証
4. リポジトリ選択: `goodbouldering-collab/Climbhero`
5. ビルド設定:
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
   - **Node version**: `18`

#### 設定完了後の自動フロー
```
GitHubへプッシュ → Cloudflare Pages自動ビルド → 自動デプロイ → 本番反映
```

**所要時間**: 約2-3分

---

## 📊 デプロイ状態確認

### Cloudflare Pages デプロイログ
```bash
# Cloudflare Dashboard → Pages → project-02ceb497 → Deployments
# または
npx wrangler pages deployment list --project-name project-02ceb497
```

### データベース接続確認
```bash
# API疎通確認
curl https://project-02ceb497.pages.dev/api/videos?limit=1

# 正常レスポンス例:
# {"videos":[{"id":1,"title":"...","views":100}],"pagination":{...}}

# エラー例（DB未接続）:
# {"error":"D1_ERROR: no such table: videos: SQLITE_ERROR"}
```

### ローカル環境テスト
```bash
# ローカルビルド
npm run build

# Wranglerローカルプレビュー
npx wrangler pages dev dist --d1=webapp-production --local --port 3000

# ブラウザで確認
# http://localhost:3000
```

---

## 🐛 トラブルシューティング

### エラー: "no such table: videos"
**原因**: D1データベースがPages Functionにバインドされていない、またはマイグレーション未実行

**解決策**:
1. Cloudflare Dashboard → Pages Settings → Functions → D1 bindingsを確認
2. `DB` バインディングが存在しない場合は追加
3. マイグレーション実行: `npm run db:migrate:prod`

### エラー: "Project not found"
**原因**: プロジェクト名の不一致

**解決策**:
```bash
# 正しいプロジェクト名を確認
npx wrangler pages project list

# package.jsonを修正
"deploy:prod": "wrangler pages deploy dist --project-name 正しい名前"
```

### ビルドエラー: "Module not found"
**原因**: 依存関係の不足

**解決策**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### デプロイ後に動画が表示されない
**原因**: データベースが空（シードデータ未投入）

**解決策**:
```bash
# ローカルでシードデータ作成
npm run db:migrate:local
npm run db:seed

# 本番データベースにデータをコピー（wrangler d1 execute）
# または管理画面からデータ投稿
```

---

## 📝 次のステップ

### 1. データベースマイグレーション実行 ⚠️ 必須
```bash
npm run db:migrate:prod
```

### 2. シードデータ投入（任意）
```bash
# ローカルでseed.sqlを生成 → 本番に適用
npx wrangler d1 execute webapp-production --file=./seed.sql
```

### 3. Cloudflare Pages Git連携設定（推奨）
- Dashboard → Pages → Settings → Builds & deployments
- "Connect to Git" でGitHubリポジトリ連携

### 4. カスタムドメイン設定（任意）
- Dashboard → Pages → Custom domains
- `climbhero.com` などを追加

### 5. 本番環境監視
- **Analytics**: Cloudflare Dashboard → Pages → Analytics
- **Logs**: Cloudflare Dashboard → Workers & Pages → Logs
- **Alerts**: 設定 → Email alerts for errors/downtime

---

## 🎯 デプロイチェックリスト

- [x] GitHubリポジトリ作成・プッシュ完了
- [x] Cloudflare Pagesプロジェクト作成
- [x] Cloudflare D1データベース作成
- [x] wrangler.jsonc設定完了
- [ ] Cloudflare Dashboard: D1バインディング設定
- [ ] 本番データベース: マイグレーション実行
- [ ] 本番環境: 疎通確認（APIテスト）
- [ ] Cloudflare Pages Git連携設定（自動デプロイ）
- [ ] カスタムドメイン設定（任意）
- [ ] 環境変数設定（Stripe, SendGrid等）

---

## 📚 関連ドキュメント

- **Cloudflare Pages**: https://developers.cloudflare.com/pages/
- **Cloudflare D1**: https://developers.cloudflare.com/d1/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/
- **Hono Framework**: https://hono.dev/
- **GitHubリポジトリ**: https://github.com/goodbouldering-collab/Climbhero

---

**最終更新**: 2025-11-17  
**担当**: YUI (由井辰美)  
**プロジェクト**: ClimbHero - クライミング動画共有プラットフォーム
