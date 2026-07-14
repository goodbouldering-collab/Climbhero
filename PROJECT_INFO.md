# ClimbHero プロジェクト情報

## 基本情報

- プロジェクト: ClimbHero — クライミング動画共有プラットフォーム
- GitHub: `goodbouldering-collab/Climbhero`
- 正規ホスティング: Vercel
- Vercel project: `goodboulderings-projects/climbhero`

## 正規URL

- 公開サイト: https://climbhero.vercel.app
- 管理画面: https://climbhero.vercel.app/admin/crawler
- ブログ App Server: https://climbhero.vercel.app/static/admin/content-studio/blog.html
- リール App Server: https://climbhero.vercel.app/static/admin/content-studio/reel.html
- OpenAPI: https://climbhero.vercel.app/openapi.json
- AI Plugin: https://climbhero.vercel.app/.well-known/ai-plugin.json
- LLMO: https://climbhero.vercel.app/llmo.txt

## バックエンド

- API origin: https://project-02ceb497.pages.dev
- D1 database: `webapp-production`
- Cloudflare Pages project: `project-02ceb497`

Cloudflare Pages URLはAPI実行・D1/KV接続のための内部originとして扱い、利用者向けの正規URLとして案内しない。Vercelの `/api/*` rewriteを通して利用する。

## デプロイフロー

1. クリーンなブランチで変更する。
2. `npm run build` と `npm run build:vercel` を実行する。
3. commitして `main` へpushする。
4. `npm run deploy` でVercel本番へ反映する。
5. 正規URLのトップ、管理画面、`/api/videos`、`/api/news` を確認する。
6. API backendを変更したときだけ `npm run deploy:cloudflare-backend` を実行する。

最終更新: 2026-07-14
