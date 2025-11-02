# Cloudflare Pages デプロイメントガイド

## 🚨 IP制限エラーの解決方法

現在、Cloudflare API tokenにIP制限がかかっているため、サンドボックス環境からの直接デプロイができません：

```
Cannot use the access token from location: 170.106.202.227 [code: 9109]
```

### 解決方法

以下の2つの方法から選択してください：

---

## 方法1: Cloudflare Dashboard から直接デプロイ（推奨）

### ステップ1: GitHub にプッシュ

```bash
cd /home/user/webapp

# GitHub環境をセットアップ（初回のみ）
# このツールを使って認証設定
setup_github_environment

# リモートリポジトリを追加（初回のみ）
git remote add origin https://github.com/<YOUR-USERNAME>/webapp.git

# mainブランチにプッシュ
git push origin main
```

### ステップ2: Cloudflare Pages で連携

1. **Cloudflare Dashboard** にアクセス
   - https://dash.cloudflare.com/

2. **Pages** セクションに移動
   - 左メニューから「Workers & Pages」→「Pages」

3. **"Create application"** をクリック

4. **"Connect to Git"** を選択

5. **GitHubアカウントを連携**
   - リポジトリ一覧から `webapp` を選択

6. **ビルド設定**
   ```
   Framework preset: None
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

7. **環境変数（必要に応じて）**
   ```
   NODE_VERSION = 18
   ```

8. **"Save and Deploy"** をクリック

9. **デプロイ完了を待つ**（約2-3分）

10. **デプロイ成功！**
    - URL: `https://<random-id>.project-02ceb497.pages.dev`
    - Custom domain設定も可能

---

## 方法2: API Token のIP制限を解除

### ステップ1: Cloudflare Dashboard でAPI Token を編集

1. **Cloudflare Dashboard** にアクセス
   - https://dash.cloudflare.com/profile/api-tokens

2. **既存のAPI Token** を探す
   - "Edit Cloudflare Workers"など

3. **"Edit"** をクリック

4. **IP制限を削除または修正**
   - "IP Address Filtering" セクション
   - サンドボックスIP `170.106.202.227` を追加
   - または制限を完全に削除（セキュリティリスクあり）

5. **"Continue to summary"** → **"Update Token"**

### ステップ2: 新しいトークンで再デプロイ

```bash
# 新しいトークンを設定（Deploy タブで再設定）
# setup_cloudflare_api_key ツールを再実行

# 認証確認
cd /home/user/webapp
npx wrangler whoami

# デプロイ実行
npm run deploy:prod
```

---

## 📦 ローカルマシンからのデプロイ

もしローカル環境がある場合：

### ステップ1: リポジトリをクローン

```bash
git clone https://github.com/<YOUR-USERNAME>/webapp.git
cd webapp
```

### ステップ2: 依存関係をインストール

```bash
npm install
```

### ステップ3: ビルド

```bash
npm run build
```

### ステップ4: Cloudflare にログイン

```bash
npx wrangler login
```

ブラウザが開き、Cloudflare認証画面が表示されます。

### ステップ5: デプロイ

```bash
npm run deploy:prod
```

または：

```bash
npx wrangler pages deploy dist --project-name project-02ceb497
```

---

## 🌐 デプロイ後の確認

### 1. デプロイURLの確認

Cloudflare Dashboard で確認：
- Production URL: `https://<random-id>.project-02ceb497.pages.dev`
- Branch URL: `https://main.project-02ceb497.pages.dev`

### 2. OpenAPI仕様の確認

```bash
curl https://<your-url>.pages.dev/openapi.json
```

### 3. AI Plugin設定の確認

```bash
curl https://<your-url>.pages.dev/.well-known/ai-plugin.json
```

### 4. Genspark API テスト

```bash
curl -X POST https://<your-url>.pages.dev/api/genspark/blog-url \
  -H "Content-Type: application/json" \
  -d '{
    "title_ja": "テスト記事",
    "title_en": "Test Article"
  }'
```

---

## 🔧 デプロイ設定ファイル

### wrangler.jsonc

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "project-02ceb497",
  "main": "src/index.tsx",
  "compatibility_date": "2024-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": "./dist"
}
```

### package.json (デプロイ用スクリプト)

```json
{
  "scripts": {
    "build": "vite build && ...",
    "deploy": "npm run build && wrangler pages deploy dist",
    "deploy:prod": "npm run build && wrangler pages deploy dist --project-name project-02ceb497"
  }
}
```

---

## 🗄️ データベースマイグレーション（本番）

デプロイ後、データベースマイグレーションを実行：

```bash
# D1データベースがある場合
npm run db:migrate:prod

# または
npx wrangler d1 migrations apply webapp-production
```

---

## 🔐 環境変数の設定（オプション）

Cloudflare Dashboard で環境変数を設定：

1. **Pages プロジェクト** を開く
2. **Settings** → **Environment variables**
3. 変数を追加：
   ```
   API_KEY = your-secret-key
   DATABASE_URL = your-database-url
   ```
4. **Save** をクリック
5. 再デプロイが自動的に開始

---

## 📊 カスタムドメインの設定

1. **Pages プロジェクト** を開く
2. **Custom domains** タブ
3. **"Set up a custom domain"** をクリック
4. ドメイン名を入力（例: `climbhero.com`）
5. DNS設定の指示に従う
6. SSL証明書が自動的に発行される（数分）

---

## 🎯 Genspark AI連携の更新

デプロイ後、Genspark AIの設定を更新：

### OpenAPI URL を更新

```
https://<your-url>.pages.dev/openapi.json
```

### AI Plugin URL を更新

```
https://<your-url>.pages.dev/.well-known/ai-plugin.json
```

---

## 📝 トラブルシューティング

### エラー: "Cannot use the access token from location"

**原因**: API TokenにIP制限がかかっている

**解決**:
- 方法1: Cloudflare Dashboard から直接デプロイ（推奨）
- 方法2: API TokenのIP制限を解除または修正

### エラー: "Project not found"

**原因**: プロジェクト名が間違っている

**解決**:
```bash
# 正しいプロジェクト名: project-02ceb497
npx wrangler pages deploy dist --project-name project-02ceb497
```

### ビルドエラー

**原因**: 依存関係が不足している

**解決**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🆘 サポート

- **Cloudflare ドキュメント**: https://developers.cloudflare.com/pages/
- **Wrangler ドキュメント**: https://developers.cloudflare.com/workers/wrangler/
- **GitHub Issues**: (要設定)

---

## ✅ デプロイチェックリスト

- [ ] GitHubにコードをプッシュ済み
- [ ] Cloudflare Dashboardでプロジェクト作成済み
- [ ] ビルド設定を正しく構成
- [ ] デプロイが成功
- [ ] OpenAPI仕様が正しく公開されている
- [ ] AI Plugin設定が正しく公開されている
- [ ] Genspark APIが動作している
- [ ] Genspark AIでプラグイン設定を更新

---

**最終更新**: 2025-11-02  
**プロジェクト名**: project-02ceb497  
**現在のURL**: https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai
