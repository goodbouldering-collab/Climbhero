# ClimbHero

ボルダリングジム向けの会員管理・予約・LINE 連携系プロジェクト。詳細仕様は同フォルダ内の各種 `*.md`（`DEPLOYMENT_GUIDE.md`・`CAPACITY_ANALYSIS.md`・`GENSPARK_*.md` など）を参照。

## サブディレクトリ

- `Climbhero/` — メインアプリ本体
- 各種 `*.md` — 仕様・デプロイ・連携ガイド類

## デプロイ構成

Cloudflare 系で構築（[CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md) 参照）。Render は使用していない。

## Render プラン運用（将来 Render を使う場合）

このプロジェクトは現在 Render を使っていないが、もし Render に切り替える / 追加機能を載せる場合は **親 CLAUDE.md の「Render プラン運用ルール」に従う**:

- 新規サービスは **Free プラン + GitHub Actions keepalive (10分間隔)** で開始
- 本番運用が始まったら手動で Starter ($7/月) に昇格 + keepalive.yml を削除
- 永続データは Render Disk ではなく Supabase Storage に置く

詳細は [親 CLAUDE.md](../CLAUDE.md) 参照。
