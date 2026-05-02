# Cloudflare 完全集約 セットアップガイド

ClimbHero は Cloudflare 一社に集約済み。このドキュメントは **Phase 3 (R2)・Phase 5 (Access)・Phase 6 (Stripe)** を有効化するための手動作業を網羅。

すべてコードはデプロイ済み。**シークレット・バインディング・Dashboard 設定だけ**で各機能が立ち上がります。

---

## Phase 3: R2 ストレージ有効化

### 1. R2 を Dashboard で有効化（初回のみ）

1. https://dash.cloudflare.com → 左メニュー「R2 Object Storage」
2. **Subscribe to R2**（無料枠あり、料金カード登録だけ）

### 2. バケット作成

```bash
cd Climbhero/  # クライアントディレクトリで
npx wrangler r2 bucket create climbhero-uploads
```

### 3. wrangler.jsonc にバインディングを追加

[wrangler.jsonc](wrangler.jsonc) のコメントアウト部分を有効化:

```jsonc
"r2_buckets": [
  { "binding": "UPLOADS", "bucket_name": "climbhero-uploads" }
]
```

### 4. （任意）カスタムドメインで配信

Dashboard → R2 → climbhero-uploads → **Settings → Public access → Connect a domain**
例: `uploads.climbhero.com`

→ 設定後、Pages の env vars に追加:
```
R2_PUBLIC_BASE = https://uploads.climbhero.com
```

未設定の場合は `/api/uploads/<key>` 経由で配信されます（Workers経由なので少し遅いがOK）。

### 5. 再デプロイ

```bash
npm run deploy
```

### 6. 動作確認

```bash
# アバターアップロード（要ログインCookie）
curl -X POST https://project-02ceb497.pages.dev/api/upload/avatar \
  -H "Cookie: session_token=..." \
  -H "Content-Type: image/png" \
  --data-binary @avatar.png
```

---

## Phase 5: Cloudflare Access で /admin/* を保護

Workers AI / Stripe を有効化する**前**にやっておくのが推奨。

### 1. Zero Trust の有効化

https://dash.cloudflare.com → 左メニュー「Zero Trust」 → 初回はチーム名（例: `climbhero`）登録 → Free プラン選択（50ユーザーまで無料）

### 2. Access Application 作成

Zero Trust → **Access → Applications → Add an application**

| 項目 | 値 |
|---|---|
| Type | **Self-hosted** |
| Application name | ClimbHero Admin |
| Session Duration | 24 hours |
| Application domain | `project-02ceb497.pages.dev/admin` |
| Path | `/admin` (subpath全体) |

### 3. アクセスポリシー設定

**Add a policy**:
- Policy name: `Admins`
- Action: **Allow**
- Include: **Emails** = `goodbouldering@gmail.com`（必要なら他の管理者も追加）

### 4. Identity Provider 設定

Zero Trust → **Settings → Authentication → Login methods → Add new**
- **Google** を追加（クリック数回・無料）
- 既に Google アカウントなら認可するだけ

### 5. AUD タグを取得

作成した Application を開く → **Overview → Application Audience (AUD) Tag** をコピー

### 6. Pages Secrets に登録

```bash
echo "<your-team-name>.cloudflareaccess.com" | npx wrangler pages secret put CF_ACCESS_TEAM --project-name project-02ceb497
echo "<aud-tag-here>" | npx wrangler pages secret put CF_ACCESS_AUD --project-name project-02ceb497
```

### 7. 動作確認

```bash
curl -I https://project-02ceb497.pages.dev/admin/crawler
# → Cloudflare Access のログイン画面にリダイレクトされる（HTTP 302 + Set-Cookie で `CF_Authorization`）
```

ブラウザで `/admin/crawler` を開くと Google SSO ログイン画面 → 承認後管理画面が表示。

> ⚠️ `CF_ACCESS_TEAM` を**設定していないと素通り**します（開発モード）。本番運用では必ず設定してください。

---

## Phase 6: Stripe サブスクリプション

### 1. Stripe アカウント

1. https://stripe.com で登録
2. **テストモード**で動作確認 → 本番化は後で

### 2. Product と Price を作成

Stripe Dashboard → **Products → Add product**
- Name: `ClimbHero Premium`
- Pricing: **Recurring** $20.00 USD/month
- 作成すると `price_xxxxxxx` が発行される（これが Price ID）

### 3. Webhook エンドポイント登録

Stripe Dashboard → **Developers → Webhooks → Add endpoint**
- URL: `https://project-02ceb497.pages.dev/api/billing/webhook`
- Events to send:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- 作成後 **Signing secret** (`whsec_xxxxx`) をコピー

### 4. Customer Portal を有効化

Stripe Dashboard → **Settings → Billing → Customer portal**
- **Activate** ボタン
- ユーザーが自分でプラン変更・キャンセル可能になる

### 5. Pages Secrets に登録

```bash
echo "sk_test_xxxxx" | npx wrangler pages secret put STRIPE_SECRET_KEY --project-name project-02ceb497
echo "whsec_xxxxx"  | npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name project-02ceb497
echo "price_xxxxx"  | npx wrangler pages secret put STRIPE_PRICE_ID --project-name project-02ceb497
echo "15"           | npx wrangler pages secret put STRIPE_TRIAL_DAYS --project-name project-02ceb497
```

### 6. 動作確認

```bash
# 設定状態をチェック
curl https://project-02ceb497.pages.dev/api/billing/status
# {"configured":true, ...}

# ログイン後、チェックアウトURL取得
curl -X POST https://project-02ceb497.pages.dev/api/billing/checkout \
  -H "Cookie: session_token=..."
# {"success":true, "url":"https://checkout.stripe.com/c/pay/cs_test_xxx..."}

# ブラウザでそのURLを開けばStripe Checkoutへ遷移
```

### 7. テストカード

Stripe テストモードでは:
- `4242 4242 4242 4242` (成功)
- `4000 0000 0000 0341` (失敗 - decline)
- 有効期限: 任意の未来日 / CVC: 任意の3桁

### 8. クライアント側の使い方（参考）

```javascript
// ログイン後に「Premiumに登録」ボタンが押されたら
const r = await fetch('/api/billing/checkout', { method: 'POST' })
const { url } = await r.json()
window.location.href = url  // Stripe Checkout に遷移

// 既存ユーザーの請求書管理
const p = await fetch('/api/billing/portal', { method: 'POST' })
const { url } = await p.json()
window.location.href = url  // Customer Portal
```

### 9. 本番化チェックリスト

- [ ] Stripe Dashboard で**本番モード**に切替
- [ ] 本番用の Product/Price を作り直し（テスト用は使えない）
- [ ] Webhook も本番モードで再登録（URL同じ、署名鍵は別）
- [ ] Pages Secrets を `sk_live_xxx` / `whsec_xxx`（本番用） に差し替え
- [ ] テストモードで一周動作確認してから本番化

---

## 全 Secrets 一覧（最終構成）

```bash
# 必須
JWT_SECRET                   # ✅ 設定済（強い乱数）

# 動画クローラー
GEMINI_API_KEY               # 推奨：AI解析の最高品質
YOUTUBE_API_KEY              # 推奨：YouTube Data API v3
VIMEO_ACCESS_TOKEN           # 推奨：Vimeo API

# OAuth
GOOGLE_CLIENT_ID             # 任意：Googleログイン
GOOGLE_CLIENT_SECRET
X_CLIENT_ID                  # 任意：X(Twitter)ログイン
X_CLIENT_SECRET

# CAPTCHA
TURNSTILE_SECRET             # 任意：未設定なら素通り
TURNSTILE_SITE_KEY

# R2
R2_PUBLIC_BASE               # 任意：カスタムドメイン使うなら

# Cloudflare Access
CF_ACCESS_TEAM               # 推奨：本番では必ず設定
CF_ACCESS_AUD

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID
STRIPE_TRIAL_DAYS            # 任意：デフォルト15日

# メール（任意）
RESEND_API_KEY
EMAIL_FROM
```

---

## 全機能の確認チェックリスト

- [ ] `/api/auth/login` で admin ログイン成功（**確認済**）
- [ ] `/api/auth/oauth/providers` で `google: true` / `x: true` （ClientID 設定後）
- [ ] `/admin/crawler` が Cloudflare Access で保護される（CF_ACCESS_TEAM 設定後）
- [ ] `/api/upload/avatar` で R2 にアバターアップロード可能（R2 有効化後）
- [ ] `/api/billing/checkout` で Stripe Checkout URL 取得可能（Stripe 設定後）
- [ ] `/api/billing/webhook` で Stripe Webhook 受信できる（Webhook 設定後）

---

## トラブルシューティング

### R2 が "10042: Please enable R2" エラー
- Dashboard で R2 を Subscribe する必要あり

### Stripe Webhook が 400 で返る
- `STRIPE_WEBHOOK_SECRET` が一致してるか確認（テスト用と本番用が別）
- Webhook URL の HTTPS が機能してるか確認

### Cloudflare Access JWT verify が失敗
- `CF_ACCESS_TEAM` は `<team>.cloudflareaccess.com` の形式
- `CF_ACCESS_AUD` は Application の Overview に表示されている AUD タグ

### OAuth で 503 "Google OAuth is not configured"
- `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` 両方設定が必要
- Google Cloud Console で Authorized redirect URI に
  `https://project-02ceb497.pages.dev/api/auth/oauth/google/callback` を追加
