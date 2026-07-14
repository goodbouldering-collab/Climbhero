# ClimbHero

世界のクライミング動画を集め、ニュース・ランキング・多言語表示と一緒に届ける動画プラットフォーム。

## 正規の公開構成

2026-07-14から、利用者と管理者が使う正規ホストは **Vercel** とする。

| レイヤー | サービス | 役割 |
|---|---|---|
| 正規公開・CDN | **Vercel** | 静的フロント、管理画面、`/api/*` の同一オリジン入口 |
| API実行 | **Cloudflare Pages Functions / Hono** | 動画・ニュース・認証・クロールAPI |
| DB | **Cloudflare D1** | 動画、ニュース、ユーザー等のデータ |
| セッション | **Cloudflare KV** (`SESSIONS`) | JWTセッション、OAuth state、トークン失効 |
| ストレージ | **Cloudflare R2** (`UPLOADS`、未有効) | 投稿動画、サムネイル等 |
| AI | **Cloudflare Workers AI** + Gemini API | 翻訳、分類、要約 |
| 課金 | **Stripe** | サブスクリプション |
| Cron | **Cloudflare Cron Triggers** | 動画・ニュース巡回 |

- 正規URL: `https://climbhero.vercel.app`
- Vercel project: `goodboulderings-projects/climbhero`
- Cloudflare API origin: `https://project-02ceb497.pages.dev`
- GitHub: `https://github.com/goodbouldering-collab/Climbhero`

`vercel.json` が Vercel の `/api/:path*` をCloudflare API originへ転送する。公開URLをCloudflare Pagesへ戻したり、フロントからPages URLを直書きしたりしない。Cloudflare Pagesは当面バックエンド実行基盤として維持する。

## ディレクトリ

- `src/` — Hono API本体（Cloudflare backend）
- `public/` — 正規公開する静的フロントと管理画面
- `public/vercel-index.html` — Vercel用トップページ
- `public/static/` — JavaScript、CSS、画像、管理画面
- `scripts/build-vercel.mjs` — `public/` から `vercel-dist/` を生成
- `migrations/` — D1 SQLマイグレーション
- `wrangler.jsonc` — D1 / KV / AIバインディング
- `vercel.json` — VercelビルドとAPI rewrite

## 開発とビルド

```bash
npm install
npm run dev
npm run build
npm run build:vercel
```

- `npm run build` はCloudflare backend用の `dist/` を生成する。
- `npm run build:vercel` は正規公開用の `vercel-dist/` を生成する。
- Vercelのビルド設定は `npm run build:vercel` / `vercel-dist` とする。

## デプロイ

```bash
# 正規公開（Vercel）
npm run deploy

# Cloudflare API実装を変更した場合だけ実行
npm run deploy:cloudflare-backend
```

`npm run deploy` と `npm run deploy:prod` はVercel本番を指す。Cloudflare backendのデプロイを公開サイトのデプロイと混同しない。

標準の完了確認:

```text
https://climbhero.vercel.app/
https://climbhero.vercel.app/api/videos
https://climbhero.vercel.app/api/news
https://climbhero.vercel.app/admin/crawler
https://climbhero.vercel.app/static/admin/content-studio/blog.html
https://climbhero.vercel.app/static/admin/content-studio/reel.html
```

ビルドやpushだけで完了にせず、上記の正規URLで画面とAPI応答を確認する。

## Cloudflare backend運用

- D1 database: `webapp-production` (`2faec3c4-115c-434f-9144-af1380440b7c`)
- KV namespace `SESSIONS`: `49a709137acb49a6a897613f43abda93`
- Pages project: `project-02ceb497`
- Account ID: `2cc53dc7f0cadb5f36fa48d256e10cc7`

Cloudflare側の環境変数・secretには、必要に応じて `JWT_SECRET`、`GEMINI_API_KEY`、`YOUTUBE_API_KEY`、`VIMEO_ACCESS_TOKEN`、OAuth、Turnstile、Stripe、メール関連を設定する。値そのものはリポジトリへ保存しない。

完全にCloudflareを廃止する場合は、D1/KV/R2/Cron/Workers AI/AuthをSupabaseまたはVercel互換基盤へ移す別工程として扱う。今回の公開ホスト移行だけでデータ基盤を削除しない。

## 関連文書

- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) — 正規公開の手順
- [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md) — API backendの保守手順
- [PROJECT_INFO.md](PROJECT_INFO.md) — URLとプロジェクト情報
- [VIDEO_CRAWLER_SETUP.md](VIDEO_CRAWLER_SETUP.md) — 動画クローラー設定
