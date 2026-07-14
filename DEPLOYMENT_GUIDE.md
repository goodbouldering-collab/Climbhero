# ClimbHero デプロイガイド

## 現在の構成

ClimbHeroは、公開入口とデータ基盤を分けて運用する。

```text
利用者・管理者
  └─ https://climbhero.vercel.app  （正規公開）
       ├─ 静的フロント・管理画面: Vercel
       └─ /api/* rewrite
            └─ project-02ceb497.pages.dev
                 ├─ Hono API
                 ├─ D1
                 ├─ KV
                 ├─ Workers AI
                 └─ Cron
```

Cloudflare Pages URLはAPI backend originであり、利用者向けの正規URLとして案内しない。

## プロジェクト情報

| 項目 | 値 |
|---|---|
| GitHub | `goodbouldering-collab/Climbhero` |
| Branch | `main` |
| Vercel team/project | `goodboulderings-projects/climbhero` |
| 正規URL | `https://climbhero.vercel.app` |
| Vercel build | `npm run build:vercel` |
| Vercel output | `vercel-dist` |
| Cloudflare project | `project-02ceb497` |
| D1 database | `webapp-production` |

## 通常の公開手順

```bash
npm ci
npm run build
npm run build:vercel
git add <変更ファイル>
git commit -m "変更内容"
git push origin main
npm run deploy
```

VercelのGit連携でも `main` pushから本番deploymentが作成される。完了判定はpushやbuildではなく、正規URLの実測で行う。

## Cloudflare backendを変更した場合

Hono API、認証、Crawler、D1 bindingに関わる変更だけ、次を追加で実行する。

```bash
npx wrangler login
npm run build
npm run deploy:cloudflare-backend
```

D1 migrationは自動実行しない。

```bash
npm run backup
npm run db:migrate:prod
npm run db:verify -- --remote
```

## Cloudflare binding

- D1 binding: `DB` → `webapp-production`
- KV binding: `SESSIONS`
- 必要に応じて Workers AI binding: `AI`
- secretはCloudflare DashboardまたはWranglerで設定し、リポジトリへ保存しない。

## 本番確認

```bash
curl -I https://climbhero.vercel.app/
curl "https://climbhero.vercel.app/api/videos?limit=1"
curl "https://climbhero.vercel.app/api/news?limit=1"
curl -I https://climbhero.vercel.app/admin/crawler
curl -I https://climbhero.vercel.app/static/admin/content-studio/blog.html
curl -I https://climbhero.vercel.app/static/admin/content-studio/reel.html
```

次も確認する。

- トップの動画・ニュースが表示される。
- ログインCookieがVercelホストで保存される。
- 管理APIは未ログインで401になる。
- `robots.txt`、`sitemap.xml`、`llmo.txt`、OpenAPIがVercel URLを返す。
- 課金を有効にしている場合、成功・キャンセル・Customer Portalの戻り先がVercelになる。

## ロールバック

- フロント: Vercel Dashboardで直前の正常deploymentをPromoteする。
- API: Cloudflare Pagesで直前の正常deploymentへ戻す。
- DB: migration前に取得したバックアップから復旧する。

Cloudflare Pagesを公開の正規URLへ戻すことは、フロントのロールバック手段にしない。
