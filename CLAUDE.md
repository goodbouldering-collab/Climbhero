# ClimbHero

クライミング動画共有プラットフォーム。**世界中のクライミング動画（YouTube/Vimeo/TikTok/Instagram）を自動収集 + AI多言語解析 + 公開**するグローバルサービス。

## デプロイ構成（**Cloudflare 完全集約**）

このプロジェクトは **Cloudflare 1社に完全集約** する方針で運用する。親 CLAUDE.md の「Render+Supabase 推奨」は**新規プロジェクト向けデフォルト**であり、ClimbHero は動画配信特性とエッジ性能・コスト面の優位性から例外として **Cloudflare 完全集約**を採用する。

| レイヤー | サービス | 役割 |
|---|---|---|
| ホスティング | **Cloudflare Pages** | フロント + Workers (Hono) |
| DB | **Cloudflare D1** | 動画・ニュース・ユーザー全データ |
| セッション | **Cloudflare KV** (`SESSIONS`) | JWT セッション・OAuth state・パスワードリセットtoken |
| ストレージ | **Cloudflare R2** (`UPLOADS`、未有効) | 投稿動画・サムネ・プロフ画像 |
| AI | **Cloudflare Workers AI** + Gemini API | 翻訳・分類・要約。Workers AI フォールバック |
| 認証 | **自前 PBKDF2 + JWT (HS256)** + KV revocation | + OAuth (Google/X) |
| 課金 | **Stripe** | サブスクリプション（外部依存はこれだけ） |
| Cron | **Cloudflare Cron Triggers** | 動画自動巡回 (1日4回) |
| メール | **Cloudflare Email Workers** | 確認メール・通知（無料） |
| CAPTCHA | **Cloudflare Turnstile** | ログイン/登録フォーム保護 |
| 管理画面 | **Cloudflare Access** (Zero Trust) | `/admin/*` を Google SSO で保護 |
| CDN/WAF/DDoS | **Cloudflare 標準** | 全 CDN/セキュリティ無料 |

**外部依存は Stripe のみ**。Render / Supabase / Firebase は使わない。

### 移行プラン（段階実施中）

| Phase | 内容 | 状態 |
|---|---|---|
| 1 | PBKDF2 + JWT + KV セッション + 既存 legacy hash 自動アップグレード | ✅ 完了 |
| 2 | Google / X OAuth 自前実装 | ✅ 完了（要 ClientID/Secret 設定） |
| 3 | R2 アップロードAPI (アバター/サムネ) | 待機 (R2 Dashboard 有効化必要) |
| 4 | Workers AI による翻訳・分類フォールバック | ✅ 完了 |
| 5 | Cloudflare Access で `/admin/*` を SSO 保護 | 待機 (Dashboard 設定) |
| 6 | Stripe Customer Portal | 待機 |

## サブディレクトリ

- `src/` — Hono アプリ本体 (Workers + Pages)
  - `index.tsx` — メインエントリ・全 API ルート（6,800行）
  - `auth.ts` — PBKDF2/JWT/Turnstile 認証ライブラリ
  - `oauth.ts` — Google/X OAuth 2.0
  - `video-crawler.ts` — YouTube/Vimeo 巡回 + Gemini/Workers AI 解析
  - `video-crawler-orchestrator.ts` — 巡回オーケストレーション
  - `news-crawler.ts` — ニュース RSS 巡回
- `migrations/` — D1 SQL マイグレーション（59件）
- `public/static/` — 静的ファイル + 管理画面 HTML
- `wrangler.jsonc` — D1 / KV / AI バインディング設定

## 開発コマンド

```bash
npm install              # 初回のみ
npm run dev              # ローカル開発 (port 3001)
npm run db:migrate:local # ローカル D1 にマイグレーション適用
npm run build            # ビルド
npm run deploy           # 本番デプロイ
```

## 本番運用情報

- **本番 URL**: https://project-02ceb497.pages.dev
- **管理画面**: https://project-02ceb497.pages.dev/admin/crawler
- **Cloudflare Account**: goodbouldering@gmail.com (`2cc53dc7f0cadb5f36fa48d256e10cc7`)
- **D1 Database**: `webapp-production` (`2faec3c4-115c-434f-9144-af1380440b7c`)
- **KV Namespace `SESSIONS`**: `49a709137acb49a6a897613f43abda93`
- **Pages Project**: `project-02ceb497`

### 必須シークレット（Pages → Settings → Environment variables）

| 変数名 | 必須 | 用途 |
|---|---|---|
| `JWT_SECRET` | ✅ 設定済 | JWT 署名鍵（再生成は全セッション無効化） |
| `GEMINI_API_KEY` | 推奨 | AI 解析（最高品質） |
| `YOUTUBE_API_KEY` | 推奨 | YouTube Data API v3 |
| `VIMEO_ACCESS_TOKEN` | 推奨 | Vimeo API |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | 任意 | Google OAuth |
| `X_CLIENT_ID` / `X_CLIENT_SECRET` | 任意 | X (Twitter) OAuth |
| `TURNSTILE_SECRET` / `TURNSTILE_SITE_KEY` | 任意 | CAPTCHA（未設定時は素通り） |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Phase 6 | サブスクリプション |
| `RESEND_API_KEY` | 任意 | メール送信（Email Workers の代替） |
| `EMAIL_FROM` | 任意 | 送信元メールアドレス |

ローカル開発時は `.dev.vars` (gitignore対象) に同名で設定。

### Cron Triggers（Cloudflare Dashboard で設定）

```
0 0 * * *   毎日 9:00 JST  ニュース朝
0 9 * * *   毎日 18:00 JST ニュース夕
0 3 * * *   毎日 12:00 JST 動画
0 15 * * *  毎日 24:00 JST 動画
```

## コスト試算（無料運用前提）

- **〜1万 MAU**: $0/月（Workers Free Plan で完結）
- **1万〜10万 MAU**: $5/月（Workers Paid Plan、Gemini併用なら+$1〜$3）
- **10万〜100万 MAU**: $30〜$130/月

R2 のエグレス無料 + D1 の 5GB 無料枠 + Workers AI 無料枠で、長期間 $0 運用が現実的に可能。

## 認証フロー

1. ユーザーがログイン → PBKDF2 で `password_hash` 検証 → 旧 Base64 ハッシュは自動アップグレード
2. JWT (HS256) を発行、Cookie `session_token` にセット
3. KV に `sess:<jti>` で revoke 用レコード保存
4. リクエスト毎に `getUserFromSession(db, cookie, env)` が JWT 検証 + KV revoke チェック
5. ログアウト時は KV からセッション削除 (即時 revoke)

OAuth の場合: state を KV に保存 → コールバックで code 交換 → ユーザー情報取得 → `users` テーブルへ upsert（既存メールアドレスがあれば紐付け） → 通常のセッション発行。

## 関連ドキュメント

- [VIDEO_CRAWLER_SETUP.md](VIDEO_CRAWLER_SETUP.md) — 動画クローラーセットアップ
- [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md) — デプロイ手順
- [PROJECT_INFO.md](PROJECT_INFO.md) — URL・GitHub 情報
- [親 CLAUDE.md](../CLAUDE.md) — 全プロジェクト共通方針（このプロジェクトは例外として Cloudflare 集約）
