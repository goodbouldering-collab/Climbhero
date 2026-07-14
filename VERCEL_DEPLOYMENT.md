# ClimbHero Vercel正規公開ガイド

ClimbHeroの正規公開先は `https://climbhero.vercel.app`。静的サイトと管理画面をVercelで配信し、`/api/*` は `vercel.json` のrewriteで既存Cloudflare backendへ接続する。

## プロジェクト設定

| 項目 | 値 |
|---|---|
| Team | `goodboulderings-projects` |
| Project | `climbhero` |
| Production branch | `main` |
| Build command | `npm run build:vercel` |
| Output directory | `vercel-dist` |
| Production URL | `https://climbhero.vercel.app` |

## 手動デプロイ

```bash
npm ci
npm run build
npm run build:vercel
npm run deploy
```

`npm run deploy` はVercel projectをlinkし、production deploymentを作成する。Cloudflare API backendは更新しない。

## API backendも変更した場合

```bash
npm run deploy:cloudflare-backend
npm run deploy
```

先にCloudflare backendを反映し、API originの応答を確認してからVercelを反映する。D1 migrationが必要な変更では、migrationを別途明示的に実行する。

### 動画クローラー管理APIの一時ロック

移行時点のCloudflare本番では `/api/admin/video-crawler/*` に管理者認証がなかったため、Vercelの `routes` でこの範囲を503にして外部操作を遮断している。`src/index.tsx` には `session_token` と `users.is_admin` を使う認証を実装済み。

Cloudflareへbackendをデプロイし、未ログイン401・一般ユーザー403・管理者200を確認した後だけ、`vercel.json` の一時503 routeを削除してVercelを再デプロイする。

## 本番確認

```bash
curl -I https://climbhero.vercel.app/
curl https://climbhero.vercel.app/api/videos?limit=1
curl https://climbhero.vercel.app/api/news?limit=1
curl -I https://climbhero.vercel.app/admin/crawler
```

追加でブラウザからトップ、ブログ App Server、リール App Serverを開き、レイアウトと主要操作を確認する。

## ロールバック

Vercel DashboardのDeploymentsから直前の正常なdeploymentをPromoteする。Cloudflare Pagesを公開の正規URLへ戻さない。API障害時はCloudflare backend側の直前deploymentをロールバックする。

## 将来の完全移行

Cloudflareを完全廃止するには、D1、KV、R2、Cron、Workers AI、認証・OAuthをVercel互換の基盤へ移す必要がある。公開ホスト移行とは分離し、データ移行・セッション移行・切り戻し手順を用意して実施する。
