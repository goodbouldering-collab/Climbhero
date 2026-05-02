/**
 * Email sending — Cloudflare-native via MailChannels (free, no API key needed
 * when sending from a Cloudflare-routed domain) with Resend fallback.
 *
 * For full inbox delivery on a custom domain, configure these DNS records:
 *   - SPF:    v=spf1 include:_spf.mx.cloudflare.net ~all
 *   - DKIM:   handled by Cloudflare automatically when using MailChannels
 *   - DMARC:  v=DMARC1; p=none; rua=mailto:dmarc@<domain>
 *
 * On the default *.pages.dev hostname, MailChannels rejects the request, so
 * Resend (RESEND_API_KEY) is required if you have not yet attached a custom
 * domain. The function tries MailChannels first, then falls back to Resend.
 */

export interface EmailMessage {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  from?: string
  replyTo?: string
}

export interface EmailEnv {
  EMAIL_FROM?: string             // e.g. "ClimbHero <noreply@climbhero.com>"
  RESEND_API_KEY?: string         // optional fallback
}

export interface SendResult {
  ok: boolean
  provider: 'mailchannels' | 'resend' | 'none'
  error?: string
}

const DEFAULT_FROM = 'ClimbHero <noreply@climbhero.info>'

function normalizeRecipients(to: string | string[]): { email: string }[] {
  return (Array.isArray(to) ? to : [to]).map(email => ({ email }))
}

function parseFrom(raw: string): { name?: string; email: string } {
  const m = /^(.+?)\s*<(.+?)>$/.exec(raw.trim())
  if (m) return { name: m[1].replace(/^"|"$/g, ''), email: m[2] }
  return { email: raw.trim() }
}

async function sendViaMailChannels(msg: EmailMessage, env: EmailEnv): Promise<SendResult> {
  const fromRaw = msg.from || env.EMAIL_FROM || DEFAULT_FROM
  const from = parseFrom(fromRaw)

  const body: any = {
    personalizations: [{ to: normalizeRecipients(msg.to) }],
    from,
    subject: msg.subject,
    content: [],
  }
  if (msg.text) body.content.push({ type: 'text/plain', value: msg.text })
  if (msg.html) body.content.push({ type: 'text/html', value: msg.html })
  if (body.content.length === 0) {
    return { ok: false, provider: 'mailchannels', error: 'no body' }
  }
  if (msg.replyTo) body.reply_to = { email: msg.replyTo }

  try {
    const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 202 || res.ok) return { ok: true, provider: 'mailchannels' }
    const text = await res.text()
    return { ok: false, provider: 'mailchannels', error: `${res.status}: ${text.slice(0, 200)}` }
  } catch (e: any) {
    return { ok: false, provider: 'mailchannels', error: e.message }
  }
}

async function sendViaResend(msg: EmailMessage, env: EmailEnv): Promise<SendResult> {
  if (!env.RESEND_API_KEY) {
    return { ok: false, provider: 'resend', error: 'RESEND_API_KEY not set' }
  }
  const from = msg.from || env.EMAIL_FROM || DEFAULT_FROM
  const to = Array.isArray(msg.to) ? msg.to : [msg.to]

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
        reply_to: msg.replyTo,
      }),
    })
    if (res.ok) return { ok: true, provider: 'resend' }
    const text = await res.text()
    return { ok: false, provider: 'resend', error: `${res.status}: ${text.slice(0, 200)}` }
  } catch (e: any) {
    return { ok: false, provider: 'resend', error: e.message }
  }
}

/**
 * Try MailChannels first (free); fall back to Resend.
 * In dev / unconfigured env this returns ok:false so callers can surface
 * the email content via console.log if needed.
 */
export async function sendEmail(msg: EmailMessage, env: EmailEnv): Promise<SendResult> {
  // MailChannels works only when the from-domain has SPF/DKIM verified for it.
  // On *.pages.dev with no DNS, this will 401 — caller should fall through.
  const mc = await sendViaMailChannels(msg, env)
  if (mc.ok) return mc

  if (env.RESEND_API_KEY) {
    const r = await sendViaResend(msg, env)
    if (r.ok) return r
    return r
  }

  return { ok: false, provider: 'none', error: mc.error }
}

// =====================================================================
// Templates
// =====================================================================

export function buildPasswordResetEmail(
  toEmail: string,
  resetUrl: string,
  expiresInMinutes = 60
): EmailMessage {
  const html = `<!DOCTYPE html><html><body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height:1.6; color:#1f2937; max-width:560px; margin:auto; padding:24px;">
<h1 style="color:#7c3aed;">パスワード再設定</h1>
<p>ClimbHero アカウントのパスワード再設定リクエストを受け付けました。</p>
<p>下のボタンから新しいパスワードを設定してください（${expiresInMinutes}分間有効）:</p>
<p style="margin:24px 0;"><a href="${resetUrl}" style="display:inline-block; background:linear-gradient(135deg,#7c3aed,#ec4899); color:white; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:bold;">パスワードを再設定</a></p>
<p style="color:#6b7280; font-size:13px;">心当たりがない場合はこのメールを無視してください。</p>
<hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;">
<p style="color:#9ca3af; font-size:12px;">ClimbHero — クライミング動画共有プラットフォーム</p>
</body></html>`
  const text = `ClimbHero パスワード再設定\n\n${resetUrl}\n\n${expiresInMinutes}分間有効です。`
  return { to: toEmail, subject: '【ClimbHero】パスワード再設定リンク', html, text }
}

export function buildEmailVerification(
  toEmail: string,
  verifyUrl: string
): EmailMessage {
  const html = `<!DOCTYPE html><html><body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height:1.6; color:#1f2937; max-width:560px; margin:auto; padding:24px;">
<h1 style="color:#7c3aed;">メールアドレス確認</h1>
<p>ClimbHero へようこそ！下のボタンをクリックしてメールアドレスを確認してください:</p>
<p style="margin:24px 0;"><a href="${verifyUrl}" style="display:inline-block; background:linear-gradient(135deg,#7c3aed,#ec4899); color:white; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:bold;">メールアドレスを確認する</a></p>
<hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;">
<p style="color:#9ca3af; font-size:12px;">ClimbHero</p>
</body></html>`
  const text = `ClimbHero メールアドレス確認\n\n${verifyUrl}`
  return { to: toEmail, subject: '【ClimbHero】メールアドレスを確認してください', html, text }
}
