# Genspark AI連携 - ブログURL生成機能

## 概要
ClimbHeroは、Genspark AIデベロッパー機能（AI Plugin / LLMOps）に対応しています。日本語タイトルから4言語対応のSEO最適化されたブログURLを自動生成できます。

## エンドポイント

### POST /api/genspark/blog-url

日本語タイトルから4言語（ja/en/zh/ko）対応のブログURLを生成します。

#### リクエスト

```bash
POST https://climbhero.pages.dev/api/genspark/blog-url
Content-Type: application/json

{
  "title_ja": "クライミングジム10施設と新規提携！",
  "title_en": "10 New Climbing Gym Partners Join ClimbHero!",  // Optional
  "title_zh": "ClimbHero新增10家攀岩馆合作伙伴！",  // Optional
  "title_ko": "ClimbHero 10개 클라이밍 체육관 파트너 추가！",  // Optional
  "custom_slug": "10-new-gym-partners"  // Optional
}
```

#### パラメータ

| パラメータ | 必須 | 説明 |
|-----------|------|------|
| `title_ja` | ✅ 必須 | 日本語タイトル |
| `title_en` | ❌ 任意 | 英語タイトル（省略時は日本語タイトルを使用） |
| `title_zh` | ❌ 任意 | 中国語タイトル（省略時は日本語タイトルを使用） |
| `title_ko` | ❌ 任意 | 韓国語タイトル（省略時は日本語タイトルを使用） |
| `custom_slug` | ❌ 任意 | カスタムURL slug（省略時は英語タイトルから自動生成） |

#### レスポンス

```json
{
  "slug": "10-new-climbing-gym-partners-join-climbhero",
  "urls": {
    "ja": "https://climbhero.pages.dev/blog/10-new-climbing-gym-partners-join-climbhero?lang=ja",
    "en": "https://climbhero.pages.dev/blog/10-new-climbing-gym-partners-join-climbhero?lang=en",
    "zh": "https://climbhero.pages.dev/blog/10-new-climbing-gym-partners-join-climbhero?lang=zh",
    "ko": "https://climbhero.pages.dev/blog/10-new-climbing-gym-partners-join-climbhero?lang=ko"
  },
  "titles": {
    "ja": "クライミングジム10施設と新規提携！",
    "en": "10 New Climbing Gym Partners Join ClimbHero!",
    "zh": "ClimbHero新增10家攀岩馆合作伙伴！",
    "ko": "ClimbHero 10개 클라이밍 체육관 파트너 추가！"
  },
  "seo_preview": {
    "og_url": "https://climbhero.pages.dev/blog/10-new-climbing-gym-partners-join-climbhero",
    "canonical": "https://climbhero.pages.dev/blog/10-new-climbing-gym-partners-join-climbhero",
    "alternate_langs": [
      "<link rel=\"alternate\" hreflang=\"ja\" href=\"https://climbhero.pages.dev/blog/10-new-climbing-gym-partners-join-climbhero?lang=ja\" />",
      "<link rel=\"alternate\" hreflang=\"en\" href=\"https://climbhero.pages.dev/blog/10-new-climbing-gym-partners-join-climbhero?lang=en\" />",
      "<link rel=\"alternate\" hreflang=\"zh\" href=\"https://climbhero.pages.dev/blog/10-new-climbing-gym-partners-join-climbhero?lang=zh\" />",
      "<link rel=\"alternate\" hreflang=\"ko\" href=\"https://climbhero.pages.dev/blog/10-new-climbing-gym-partners-join-climbhero?lang=ko\" />"
    ]
  },
  "message": "Blog URLs generated successfully for 4 languages (ja/en/zh/ko)",
  "usage_note": "Use these URLs in your blog posts. The slug is SEO-optimized and supports multilingual content."
}
```

## 使用例

### 1. 基本的な使用（日本語タイトルのみ）

```bash
curl -X POST https://climbhero.pages.dev/api/genspark/blog-url \
  -H "Content-Type: application/json" \
  -d '{
    "title_ja": "クライミング初心者向けシューズ選びガイド"
  }'
```

この場合、slugはタイムスタンプベースで自動生成されます（例: `blog-post-1762098572298`）

### 2. 英語タイトルを指定してSEO対応slug生成

```bash
curl -X POST https://climbhero.pages.dev/api/genspark/blog-url \
  -H "Content-Type: application/json" \
  -d '{
    "title_ja": "クライミング初心者向けシューズ選びガイド",
    "title_en": "Climbing Shoes Guide for Beginners"
  }'
```

slugは `climbing-shoes-guide-for-beginners` のように自動生成されます。

### 3. カスタムslugを指定

```bash
curl -X POST https://climbhero.pages.dev/api/genspark/blog-url \
  -H "Content-Type: application/json" \
  -d '{
    "title_ja": "クライミング初心者向けシューズ選びガイド",
    "custom_slug": "beginner-shoes-guide"
  }'
```

### 4. 4言語完全対応

```bash
curl -X POST https://climbhero.pages.dev/api/genspark/blog-url \
  -H "Content-Type: application/json" \
  -d '{
    "title_ja": "クライミングジム10施設と新規提携！",
    "title_en": "10 New Climbing Gym Partners Join ClimbHero!",
    "title_zh": "ClimbHero新增10家攀岩馆合作伙伴！",
    "title_ko": "ClimbHero 10개 클라이밍 체육관 파트너 추가！"
  }'
```

## AI Plugin連携

### OpenAPI仕様
https://climbhero.pages.dev/openapi.json

### AI Plugin設定
https://climbhero.pages.dev/.well-known/ai-plugin.json

### LLMO最適化情報
https://climbhero.pages.dev/llmo.txt

## Genspark AIでの使用方法

### ステップ1: Genspark Devでプラグインを追加

1. Genspark AIデベロッパーコンソールにアクセス
2. "Add Plugin" または "Connect API"
3. ClimbHero API URLを入力: `https://climbhero.pages.dev`
4. OpenAPI仕様が自動検出されます

### ステップ2: APIを呼び出す

Genspark AIチャットで以下のように依頼：

```
ClimbHeroのブログURL生成APIを使って、
「クライミングジム10施設と新規提携！」という記事の
4言語対応URLを生成してください。
```

Genspark AIが自動的に `/api/genspark/blog-url` エンドポイントを呼び出し、
4言語分のURLを生成します。

### ステップ3: 生成されたURLを活用

生成されたURLをブログ記事作成時に使用：
- SEO対応のslugが自動生成される
- 4言語すべてのURLが一度に取得できる
- Open Graph設定やhreflangタグも同時に取得

## slug生成ルール

1. **カスタムslug指定時**: そのまま使用（英数字と`-`のみ許可）
2. **英語タイトル指定時**: 
   - 小文字に変換
   - 特殊文字を削除
   - スペースをハイフンに変換
   - 連続するハイフンを1つに統一
   - 先頭・末尾のハイフンを削除
3. **日本語タイトルのみ**: タイムスタンプベースのslug生成（例: `blog-post-1762098572298`）

## SEO最適化機能

生成されたURLには以下のSEO機能が含まれます：

1. **Canonical URL**: 重複コンテンツ回避
2. **hreflang設定**: 多言語サイトのSEO最適化
3. **Open Graph URL**: ソーシャルメディア共有時の最適化
4. **Clean URL slug**: 検索エンジンフレンドリーなURL

## エラーハンドリング

### 400 Bad Request
```json
{
  "error": "title_ja is required"
}
```

`title_ja`パラメータは必須です。

### 500 Internal Server Error
```json
{
  "error": "Error message details"
}
```

サーバーエラーの詳細が返されます。

## 技術仕様

- **認証**: 不要（公開API）
- **レート制限**: 無制限（現在）
- **レスポンス形式**: JSON
- **文字コード**: UTF-8
- **HTTPメソッド**: POST
- **Content-Type**: application/json

## サポート

- メール: support@climbhero.com
- ドキュメント: https://climbhero.pages.dev/#api
- OpenAPI仕様: https://climbhero.pages.dev/openapi.json

---

**更新日**: 2025-11-02  
**バージョン**: 1.0.0
