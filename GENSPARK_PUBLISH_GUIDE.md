# GenSpark「ウェブサイトを公開」機能 - 使用ガイド

このドキュメントでは、GenSparkのAIデベロッパー機能で **「ウェブサイトを公開」ボタン** を使用してClimbHeroをデプロイする方法を説明します。

## 📋 前提条件

✅ **すでに完了していること:**
- `.genspark/config.json` - GenSpark設定ファイル
- `.genspark/deployment.yaml` - デプロイメント設定
- `genspark-deploy.json` - デプロイ定義
- `.gensparkignore` - 除外ファイルリスト
- `genspark-build.sh` - ビルドスクリプト

これらのファイルは既に作成済みです。

## 🚀 デプロイ手順

### ステップ1: GenSpark AIデベロッパーを開く

1. GenSparkのWebサイトにアクセス
2. AIデベロッパー機能を開く
3. `webapp` (ClimbHero) プロジェクトを選択

### ステップ2: 「公開」タブを選択

画面上部に3つのタブがあります：
- 📊 **データベース** - データベース管理
- 🌐 **公開** ← **これを選択**
- 📖 **チュートリアル** - ヘルプ

**「公開」タブをクリックしてください。**

### ステップ3: 「ウェブサイトを公開」ボタンをクリック

画面中央に黒いボタン **「ウェブサイトを公開」** が表示されます。

**このボタンをクリックすると、以下の処理が自動実行されます：**

1. **依存関係のインストール** (約30秒)
   ```bash
   npm install
   ```

2. **プロジェクトのビルド** (約20秒)
   ```bash
   npm run build
   ```
   - Viteでビルド
   - 静的ファイルのコピー
   - OpenAPI/AI Plugin のコピー

3. **GenSparkホスティングへのデプロイ** (約60秒)
   - `dist/` ディレクトリをアップロード
   - DNSの設定
   - CDNキャッシュの初期化

4. **URL生成** (即座)
   - `https://〜.gensparksite.com` 形式のURLが生成されます

### ステップ4: 公開URLの確認

デプロイが完了すると、「URL:」欄に以下のような公開URLが表示されます：

```
https://climbhero-xxxxx.gensparksite.com
```

または

```
https://xxxxx-yyyyy.gensparksite.com
```

**このURLをクリックすると、デプロイされたClimbHeroアプリケーションにアクセスできます。**

## 📊 デプロイされる内容

### 🎯 主要機能

- ✅ **ホームページ** - 動画一覧表示
- ✅ **ランキング** - デイリー/ウィークリー/マンスリー/イヤリー
- ✅ **動画詳細** - 動画情報表示
- ✅ **いいね機能** - 動画へのいいね
- ✅ **多言語対応** - 日本語/英語/中国語/韓国語
- ✅ **AI統合** - Genspark URL生成API

### 🌐 エンドポイント

| エンドポイント | 説明 |
|--------------|------|
| `/` | ホームページ |
| `/api/videos/trending` | トレンド動画 |
| `/api/rankings/daily` | デイリーランキング |
| `/api/rankings/weekly` | ウィークリーランキング |
| `/api/rankings/monthly` | マンスリーランキング |
| `/api/rankings/yearly` | イヤリーランキング |
| `/api/videos/:id` | 動画詳細 |
| `/api/videos/:id/like` | いいね追加 |
| `/api/genspark/blog-url` | Genspark URL生成 |

### 📄 静的ファイル

| ファイル | 説明 |
|---------|------|
| `/static/app.js` | フロントエンドJavaScript |
| `/static/i18n.js` | 多言語翻訳 |
| `/static/styles.css` | CSSスタイル |
| `/logo-cool.png` | ロゴ画像 |

### 🤖 SEO/AI関連

| ファイル | 説明 |
|---------|------|
| `/openapi.json` | OpenAPI 3.0仕様 |
| `/.well-known/ai-plugin.json` | AI Plugin設定 |
| `/sitemap.xml` | サイトマップ |
| `/robots.txt` | Robots.txt |
| `/llmo.txt` | LLMO設定 |

## ⚠️ 制約事項

### GenSparkホスティングの制限

1. **データベース (D1) 未対応**
   - GenSparkホスティングではCloudflare D1データベースが使用できません
   - いいね数のカウントなど、データベース依存機能は動作しません
   - 代替案: Cloudflare Pagesでのデプロイ（D1対応）

2. **カスタムドメイン未対応**
   - `.gensparksite.com` サブドメインのみ使用可能
   - 独自ドメインは設定できません

3. **環境変数の制限**
   - `.env` ファイルの環境変数は自動的には読み込まれません
   - APIキーなどは設定画面から手動設定が必要

### 動作する機能

✅ **フロントエンド表示** - 完全動作  
✅ **ランキング表示** - サンプルデータで動作  
✅ **動画一覧** - サンプルデータで動作  
✅ **多言語切り替え** - 完全動作  
✅ **レスポンシブデザイン** - 完全動作  

### 動作しない機能

❌ **いいね機能** - D1データベースが必要  
❌ **動画投稿** - D1データベースが必要  
❌ **ユーザー認証** - 未実装  

## 🔧 トラブルシューティング

### ❌ ビルドエラーが発生する

**症状**: デプロイ中にエラーが表示される

**解決方法**:
1. ローカルでビルドを確認
   ```bash
   cd /home/user/webapp
   npm run build
   ```

2. エラーメッセージを確認して修正

3. 再度「ウェブサイトを公開」ボタンをクリック

### ❌ URLが表示されない

**症状**: デプロイ完了後もURL欄が空白

**解決方法**:
1. **30秒〜2分待つ** - デプロイには時間がかかります
2. **ページをリロード** - ブラウザをリフレッシュ
3. **ボタンを再クリック** - もう一度「ウェブサイトを公開」をクリック

### ❌ デプロイ後にアクセスできない

**症状**: URLが表示されたがアクセスすると404エラー

**解決方法**:
1. **数分待つ** - DNS伝播に時間がかかる場合があります
2. **キャッシュクリア** - ブラウザのキャッシュを削除
3. **別ブラウザで確認** - プライベートブラウジングで確認

### ❌ いいね機能が動作しない

**症状**: いいねボタンをクリックしてもカウントが増えない

**原因**: GenSparkホスティングではD1データベースが使用できません

**解決方法**: 
- **本番環境**: Cloudflare Pagesにデプロイしてください
- **デモ用途**: フロントエンド表示とランキング表示のみ使用

## 🆚 GenSpark vs Cloudflare Pages

### GenSparkホスティング（今回の方法）

**メリット:**
- ✅ ワンクリックでデプロイ
- ✅ 設定不要
- ✅ 無料で使用可能
- ✅ 即座にURL生成

**デメリット:**
- ❌ D1データベース未対応
- ❌ カスタムドメイン未対応
- ❌ 環境変数の管理が困難

**用途:** デモ、プレビュー、静的サイト

### Cloudflare Pages（本番推奨）

**メリット:**
- ✅ D1データベース完全対応
- ✅ カスタムドメイン設定可能
- ✅ 環境変数・シークレット管理
- ✅ Cloudflare CDN統合
- ✅ 無制限のリクエスト

**デメリット:**
- ⚠️ Cloudflare APIトークンが必要
- ⚠️ 初回設定が複雑

**用途:** 本番環境、完全機能版

## 📚 関連ドキュメント

- **Cloudflareデプロイ**: [`CLOUDFLARE_DEPLOYMENT.md`](./CLOUDFLARE_DEPLOYMENT.md)
- **GenSpark統合**: [`GENSPARK_INTEGRATION.md`](./GENSPARK_INTEGRATION.md)
- **クイックスタート**: [`GENSPARK_QUICKSTART.md`](./GENSPARK_QUICKSTART.md)
- **GenSpark設定**: [`.genspark/README.md`](./.genspark/README.md)
- **プロジェクト全体**: [`README.md`](./README.md)

## 🎯 次のステップ

### デモ用途の場合

1. ✅ GenSparkで公開（このガイドの手順）
2. 🔗 公開URLを共有
3. 📊 フロントエンドとランキング表示を確認

### 本番環境の場合

1. 📘 [`CLOUDFLARE_DEPLOYMENT.md`](./CLOUDFLARE_DEPLOYMENT.md) を参照
2. 🔑 Cloudflare APIトークンを取得
3. 🗄️ D1データベースを設定
4. 🚀 Cloudflare Pagesにデプロイ

## 💡 ヒント

- **プレビュー用途**: GenSparkホスティングが最適
- **本番用途**: Cloudflare Pagesが必須
- **開発用途**: ローカルサーバー（PM2）を使用

---

## 📞 サポート

質問がある場合は、以下のドキュメントを参照してください：

- [GenSpark公式ドキュメント](https://genspark.ai/docs)
- [Cloudflare Pages公式ドキュメント](https://developers.cloudflare.com/pages/)

---

**作成者**: 由井辰美 (YUI Tatsumi) - グッぼる ボルダリングCafe & Shop  
**プロジェクト**: ClimbHero - クライミング動画共有プラットフォーム  
**更新日**: 2025-11-03
