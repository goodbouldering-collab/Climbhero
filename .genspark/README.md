# GenSpark Deployment Configuration

このディレクトリには、GenSparkのAIデベロッパー機能で「ウェブサイトを公開」ボタンを使用してデプロイするための設定ファイルが含まれています。

## 📁 ファイル構成

### `config.json`
GenSparkプロジェクトの基本設定ファイル。プロジェクト名、フレームワーク、ビルド設定などを定義。

### `deployment.yaml`
デプロイメント設定のYAML形式版。ルーティング、ヘッダー、機能設定などを含む。

## 🚀 使用方法

### 1. GenSpark AIデベロッパーでプロジェクトを開く

GenSparkのAIデベロッパー画面で、このプロジェクト (`webapp`) を開いてください。

### 2. 「公開」タブを選択

画面上部の「公開」タブをクリックします。

### 3. 「ウェブサイトを公開」ボタンをクリック

黒いボタン「ウェブサイトを公開」をクリックすると、自動的に以下の処理が実行されます：

1. **依存関係のインストール**: `npm install`
2. **プロジェクトのビルド**: `npm run build`
3. **デプロイ**: GenSparkホスティングへのデプロイ
4. **URL生成**: `https://〜.gensparksite.com` 形式のURLが生成される

### 4. 公開URLの確認

デプロイが完了すると、「URL:」欄に公開URLが表示されます。
このURLをクリックすると、デプロイされたアプリケーションにアクセスできます。

## 📋 デプロイされる内容

### エンドポイント
- **ホームページ**: `/`
- **ランキング**: `/api/rankings/{period}`
- **動画**: `/api/videos/{id}`
- **いいね**: `/api/videos/{id}/like`
- **AI統合**: `/api/genspark/blog-url`

### 静的ファイル
- **JavaScript**: `/static/app.js`, `/static/i18n.js`
- **CSS**: `/static/styles.css`
- **画像**: `/logo-cool.png`, `/logo-original.png`

### SEO/AI関連
- **OpenAPI**: `/openapi.json`
- **AI Plugin**: `/.well-known/ai-plugin.json`
- **Sitemap**: `/sitemap.xml`
- **Robots**: `/robots.txt`
- **LLMO**: `/llmo.txt`

## ⚙️ 設定のカスタマイズ

### ビルドコマンドの変更

`config.json` の `buildConfig.buildCommand` を編集：

```json
{
  "buildConfig": {
    "buildCommand": "npm run build",
    "outputDirectory": "dist"
  }
}
```

### 環境変数の追加

`deployment.yaml` の `build.environmentVariables` に追加：

```yaml
build:
  environmentVariables:
    API_KEY: "your-api-key"
    NODE_ENV: "production"
```

## 🔍 トラブルシューティング

### ビルドエラーが出る場合

1. **ローカルでビルドを確認**:
   ```bash
   cd /home/user/webapp
   npm run build
   ```

2. **依存関係を確認**:
   ```bash
   npm install
   ```

3. **dist/ ディレクトリを確認**:
   ```bash
   ls -la dist/
   ```

### URLが表示されない場合

- ボタンをクリック後、30秒〜2分待ってください
- ページをリロードして再度確認してください
- エラーメッセージが表示されている場合は、その内容を確認してください

### デプロイ後にアクセスできない場合

1. **URLが正しいか確認**
2. **数分待ってから再度アクセス** (DNS伝播に時間がかかる場合があります)
3. **ブラウザのキャッシュをクリア**

## 📖 関連ドキュメント

- **プロジェクト全体**: `/home/user/webapp/README.md`
- **Cloudflareデプロイ**: `/home/user/webapp/CLOUDFLARE_DEPLOYMENT.md`
- **GenSpark統合**: `/home/user/webapp/GENSPARK_INTEGRATION.md`
- **クイックスタート**: `/home/user/webapp/GENSPARK_QUICKSTART.md`

## 💡 ヒント

- GenSparkデプロイは**無料**で利用できます
- カスタムドメインは設定できません（`.gensparksite.com` ドメインのみ）
- データベース（D1）は自動的に設定されません（Cloudflare Pagesデプロイが必要）
- APIエンドポイントは正常に動作しますが、D1を使用する機能は制限される可能性があります

---

**作成者**: 由井辰美 (YUI Tatsumi) - グッぼる ボルダリングCafe & Shop  
**更新日**: 2025-11-03
