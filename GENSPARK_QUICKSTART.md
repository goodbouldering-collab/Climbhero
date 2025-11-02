# Genspark AI連携 - クイックスタートガイド

## 🚀 即座に試せる公開URL

ClimbHeroのGenspark AI連携機能は、以下の公開URLで**今すぐ**利用可能です：

### 📡 メインエンドポイント
```
https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai
```

### 🤖 AI連携用URL

| 種類 | URL |
|------|-----|
| **OpenAPI仕様** | https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai/openapi.json |
| **AI Plugin設定** | https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai/.well-known/ai-plugin.json |
| **LLMO最適化** | https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai/llmo.txt |
| **Sitemap** | https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai/sitemap.xml |

---

## ⚡ 1分で試す - ブログURL生成

### curl コマンドで即実行

```bash
curl -X POST https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai/api/genspark/blog-url \
  -H "Content-Type: application/json" \
  -d '{
    "title_ja": "グッぼるで新しいボルダリング課題が追加されました",
    "title_en": "New Bouldering Problems Added at Guboru"
  }'
```

### レスポンス例

```json
{
  "slug": "new-bouldering-problems-added-at-guboru",
  "urls": {
    "ja": "https://climbhero.pages.dev/blog/new-bouldering-problems-added-at-guboru?lang=ja",
    "en": "https://climbhero.pages.dev/blog/new-bouldering-problems-added-at-guboru?lang=en",
    "zh": "https://climbhero.pages.dev/blog/new-bouldering-problems-added-at-guboru?lang=zh",
    "ko": "https://climbhero.pages.dev/blog/new-bouldering-problems-added-at-guboru?lang=ko"
  },
  "titles": {
    "ja": "グッぼるで新しいボルダリング課題が追加されました",
    "en": "New Bouldering Problems Added at Guboru",
    "zh": "...",
    "ko": "..."
  },
  "seo_preview": {
    "og_url": "https://climbhero.pages.dev/blog/new-bouldering-problems-added-at-guboru",
    "canonical": "https://climbhero.pages.dev/blog/new-bouldering-problems-added-at-guboru",
    "alternate_langs": [
      "<link rel=\"alternate\" hreflang=\"ja\" href=\"...\" />",
      "<link rel=\"alternate\" hreflang=\"en\" href=\"...\" />",
      "<link rel=\"alternate\" hreflang=\"zh\" href=\"...\" />",
      "<link rel=\"alternate\" hreflang=\"ko\" href=\"...\" />"
    ]
  }
}
```

---

## 🔧 Genspark Devで設定する方法

### ステップ1: プラグインを追加

1. **Genspark AI デベロッパーコンソール**にアクセス
   - URL: https://genspark.ai/dev (例)

2. **"Add Plugin"** または **"Connect API"** をクリック

3. **API URL を入力:**
   ```
   https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai
   ```

4. **OpenAPI仕様が自動検出**されます
   - OpenAPI URL: https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai/openapi.json
   - プラグイン名: `climbhero`
   - 説明: "ClimbHero API - Climbing video platform with blog URL generation"

### ステップ2: Genspark AIチャットで使用

プラグイン追加後、Genspark AIチャットで以下のように依頼：

#### 例1: 基本的なURL生成
```
ClimbHeroのブログURL生成APIを使って、
「クライミングジム10施設と新規提携！」という記事の
4言語対応URLを生成してください。
```

#### 例2: 複数記事のURL生成
```
以下の3つのブログ記事タイトルについて、
ClimbHeroのAPIで4言語対応URLを生成してください：

1. クライミングシューズの選び方完全ガイド
2. グッぼるジムの新課題V10追加
3. 2025年春季コンペ開催のお知らせ
```

#### 例3: SEO情報も含めて取得
```
「初心者向けボルダリング入門」というタイトルで、
ClimbHeroのAPIを使ってURLとSEO設定を生成してください。
hreflangタグも含めてください。
```

---

## 📋 使用可能なパラメータ

| パラメータ | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| `title_ja` | ✅ 必須 | 日本語タイトル | "グッぼるで新課題追加" |
| `title_en` | ❌ 任意 | 英語タイトル | "New Problems at Guboru" |
| `title_zh` | ❌ 任意 | 中国語タイトル | "Guboru新增问题" |
| `title_ko` | ❌ 任意 | 韓国語タイトル | "Guboru 새 문제" |
| `custom_slug` | ❌ 任意 | カスタムURL slug | "new-guboru-problems" |

### slug生成ルール

1. **カスタムslug指定時**: そのまま使用
2. **英語タイトル指定時**: 自動変換
   - 小文字化
   - 特殊文字削除
   - スペース → ハイフン
   - 連続ハイフン → 単一化
   - 先頭・末尾ハイフン削除
3. **日本語のみ**: タイムスタンプベース (`blog-post-1762098572298`)

---

## 🎯 実用例

### 例1: グッぼるジムのブログ記事
```bash
curl -X POST https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai/api/genspark/blog-url \
  -H "Content-Type: application/json" \
  -d '{
    "title_ja": "グッぼるボルダリングCafe新メニュー「エスプレッソマティーニ」登場",
    "title_en": "Guboru Cafe New Menu: Espresso Martini Now Available"
  }'
```

### 例2: クライミング施設紹介
```bash
curl -X POST https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai/api/genspark/blog-url \
  -H "Content-Type: application/json" \
  -d '{
    "title_ja": "全国200箇所以上のパートナージムと連携開始",
    "title_en": "Partnership with 200+ Climbing Gyms Nationwide",
    "custom_slug": "200-partner-gyms"
  }'
```

### 例3: イベント告知
```bash
curl -X POST https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai/api/genspark/blog-url \
  -H "Content-Type: application/json" \
  -d '{
    "title_ja": "2025年春季クライミングコンテスト開催決定！賞金総額100万円",
    "title_en": "Spring 2025 Climbing Contest Announced - 1M Yen Prize Pool",
    "title_zh": "2025年春季攀岩比赛确定举办！总奖金100万日元",
    "title_ko": "2025년 봄 클라이밍 대회 개최 확정! 총 상금 100만엔"
  }'
```

---

## 🌐 多言語ブログ記事の活用

生成されたURLは、ClimbHeroのブログシステムで以下のように使用できます：

### URL構造
```
https://climbhero.pages.dev/blog/{slug}?lang={ja|en|zh|ko}
```

### hreflangタグの活用
SEOプレビューに含まれる`alternate_langs`をHTMLのheadセクションに追加：

```html
<head>
  <link rel="canonical" href="https://climbhero.pages.dev/blog/your-slug" />
  <link rel="alternate" hreflang="ja" href="https://climbhero.pages.dev/blog/your-slug?lang=ja" />
  <link rel="alternate" hreflang="en" href="https://climbhero.pages.dev/blog/your-slug?lang=en" />
  <link rel="alternate" hreflang="zh" href="https://climbhero.pages.dev/blog/your-slug?lang=zh" />
  <link rel="alternate" hreflang="ko" href="https://climbhero.pages.dev/blog/your-slug?lang=ko" />
</head>
```

---

## 📊 技術仕様

- **認証**: 不要（公開API）
- **レート制限**: 無制限（現在）
- **レスポンス形式**: JSON
- **文字コード**: UTF-8
- **HTTPメソッド**: POST
- **Content-Type**: application/json
- **タイムアウト**: 30秒

---

## 🔗 関連ドキュメント

- **詳細ガイド**: [GENSPARK_INTEGRATION.md](./GENSPARK_INTEGRATION.md)
- **API仕様**: [openapi.json](https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai/openapi.json)
- **README**: [README.md](./README.md)

---

## 💡 Tips

### 1. 英語タイトルを指定すると、より良いslugが生成されます
```json
{
  "title_ja": "クライミングシューズ完全ガイド",
  "title_en": "Complete Guide to Climbing Shoes"
}
// → slug: "complete-guide-to-climbing-shoes"
```

### 2. カスタムslugで短縮URLを作成
```json
{
  "title_ja": "グッぼるボルダリングCafe新メニュー",
  "custom_slug": "guboru-new-menu"
}
// → slug: "guboru-new-menu"
```

### 3. 複数言語タイトルを一度に設定
```json
{
  "title_ja": "...",
  "title_en": "...",
  "title_zh": "...",
  "title_ko": "..."
}
// → 4言語すべてのタイトルが保持されます
```

---

## 🆘 サポート

- **Email**: support@climbhero.com
- **ドキュメント**: https://3000-iekbypsjbezyid8wqeonx-2e77fc33.sandbox.novita.ai/
- **GitHub Issues**: (要設定)

---

**最終更新**: 2025-11-02  
**バージョン**: 1.0.0  
**ステータス**: ✅ 公開中
