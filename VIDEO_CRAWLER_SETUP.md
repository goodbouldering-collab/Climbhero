# 動画クローラー セットアップガイド

ClimbHero に **YouTube / Vimeo の自動巡回** と **Gemini AI 解析（翻訳・ジャンル分類・グレード抽出・品質スコア）** を実装しました。
TikTok / Instagram は将来的に RapidAPI 経由のスクレイパで対応予定（フェーズ2）。

## 機能概要

- **巡回ソース管理**: 検索クエリごとに優先度・最低再生数・地域・言語を設定。10件のシード入り
- **自動巡回**: Cloudflare Cron Triggers で 6時間おきに実行（3, 9, 15, 21時 UTC）
- **AI解析パイプライン**: Gemini 2.0 Flash で
  - タイトル/説明の 4言語翻訳（ja/en/zh/ko）
  - ジャンル分類（bouldering / lead / speed / alpine / training / competition / news）
  - クライミンググレード抽出（V0-V17、5.6-5.15d、4-9c+）
  - 0-100 の quality score
  - 4言語のSEO/LLMO要約
- **重複排除**: URL UNIQUE 制約 + INSERT OR IGNORE 相当のロジック。既存動画は views/likes だけ更新
- **管理画面**: `/admin/crawler` で全操作可能（手動実行、ソース追加・編集、ログ閲覧）
- **公開API**: `/api/videos/curated` で AI スコア順の自動取り込み動画を取得

## セットアップ手順

### 1. APIキーを取得

#### YouTube Data API v3
1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. **API & Services → Library** で "YouTube Data API v3" を有効化
3. **Credentials → Create Credentials → API key**
4. 無料枠: **10,000 units/日**。1巡回（25動画取得）で約 **103 units** 消費。1日で約100クエリ実行可能

#### Vimeo API
1. [Vimeo Developer](https://developer.vimeo.com/) で App を作成
2. **Personal access token** を発行（scopes: `public`）

#### Gemini API（既に設定済みなら不要）
1. [Google AI Studio](https://makersuite.google.com/) で APIキー取得
2. `gemini-2.0-flash-exp` は無料枠あり

### 2. ローカルで動かす

`.dev.vars` ファイルに記載（`.gitignore` 対象）:

```
GEMINI_API_KEY=AIzaSy...
YOUTUBE_API_KEY=AIzaSy...
VIMEO_ACCESS_TOKEN=xxxxx...
```

または管理画面 `/admin/crawler` の「クローラー設定」フォームで保存可能（D1に保存）。
※ 環境変数の方が優先されるので、本番では env vars 推奨。

DBマイグレーション適用:

```bash
npm run db:migrate:local
```

dev サーバー起動:

```bash
npm run dev
```

管理画面: http://localhost:3001/admin/crawler

### 3. 本番デプロイ（Cloudflare Pages + D1）

#### マイグレーション適用

```bash
npm run db:migrate:prod
```

#### Secrets を設定

```bash
npx wrangler pages secret put GEMINI_API_KEY --project-name project-02ceb497
npx wrangler pages secret put YOUTUBE_API_KEY --project-name project-02ceb497
npx wrangler pages secret put VIMEO_ACCESS_TOKEN --project-name project-02ceb497
```

#### デプロイ

```bash
npm run deploy
```

#### Cron Triggers を有効化

`wrangler.jsonc` に既に以下を追記済み:

```jsonc
"triggers": {
  "crons": [
    "0 0 * * *",  // 毎日 9:00 JST (ニュース朝)
    "0 9 * * *",  // 毎日 18:00 JST (ニュース夕)
    "0 3 * * *",  // 毎日 12:00 JST (動画)
    "0 15 * * *"  // 毎日 24:00 JST (動画)
  ]
}
```

Cloudflare Dashboard → Pages → project-02ceb497 → **Settings → Functions → Cron Triggers** で確認可能。

### 4. 動作確認

#### 手動巡回テスト

```bash
curl -X POST http://localhost:3001/api/admin/video-crawler/run \
  -H "Content-Type: application/json" \
  -d '{"limit": 1, "run_ai": false}'
```

期待されるレスポンス:
```json
{ "success": true, "result": { "total_fetched": 25, "total_inserted": 23, ... } }
```

#### キュレーション動画API

```bash
curl "http://localhost:3001/api/videos/curated?limit=10&lang=en"
```

#### 巡回ログ確認

```bash
curl http://localhost:3001/api/admin/video-crawler/log?limit=10
```

## API エンドポイント一覧

| メソッド | パス | 用途 |
|---|---|---|
| GET | `/api/admin/video-crawler/sources` | ソース一覧 |
| POST | `/api/admin/video-crawler/sources` | ソース追加 |
| PUT | `/api/admin/video-crawler/sources/:id` | ソース更新 |
| DELETE | `/api/admin/video-crawler/sources/:id` | ソース削除 |
| GET | `/api/admin/video-crawler/settings` | 設定取得 |
| PUT | `/api/admin/video-crawler/settings` | 設定更新 |
| POST | `/api/admin/video-crawler/run` | 手動巡回 |
| POST | `/api/admin/video-crawler/backfill-ai` | 既存動画にAI解析 |
| GET | `/api/admin/video-crawler/log` | 巡回ログ |
| GET | `/api/videos/curated` | 公開: AI品質スコア順動画 |

## DB スキーマ

`migrations/0058_video_crawler.sql` で追加:

- `video_crawler_sources` — 巡回ソース定義（platform/query/priority/min_views等）
- `video_crawler_log` — 巡回実行ログ（取得・新規・エラー数・所要時間）
- `video_crawler_settings` — 全体設定（API キー、Cron スケジュール、フラグ）
- `videos` テーブルに以下カラム追加:
  - `source_query` / `crawled_at` / `auto_imported`
  - `ai_processed_at` / `ai_genre` / `ai_grade` / `ai_quality_score`
  - `ai_summary` / `ai_summary_en` / `ai_summary_zh` / `ai_summary_ko`

## コスト試算

| 項目 | 単価 | 1日の使用量 | 月コスト |
|---|---|---|---|
| YouTube Data API | 無料（10,000units/日） | 約 412 units（1日4回×25件） | $0 |
| Vimeo API | 無料 | 100req/日 | $0 |
| Gemini 2.0 Flash | 入力 $0.075 / 1Mトークン | 約 50万トークン/日 | 約$1〜$3 |

**月$3以下**で動画自動巡回 + AI解析が回ります。

## TikTok / Instagram 対応（将来）

公式APIでは公開動画の網羅的巡回は不可能なので、3rd-party scraper を使う必要あり:

- **Apify Climb crawler**（推奨）: 月$49〜
- **RapidAPI tiktok-scraper / instagram-scraper**: 月$10〜$30

`src/video-crawler.ts` に `crawlTikTok()` / `crawlInstagram()` を実装し、
`video-crawler-orchestrator.ts` の switch 文に追加すれば動きます。
キーは `video_crawler_settings.rapidapi_key` または env `RAPIDAPI_KEY`。

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| 「YouTube API key not configured」 | `.dev.vars` または管理画面で設定 |
| 「quotaExceeded」 | YouTube無料枠の10,000units/日を超過。翌日まで待つ |
| AI解析されない | `GEMINI_API_KEY` が設定されているか確認、`ai_analysis_enabled` がオンか確認 |
| Cron が走らない | `wrangler.jsonc` の triggers 設定 + Cloudflare Dashboard で有効化 |
