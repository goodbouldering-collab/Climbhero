/**
 * Stripe integration via raw fetch — no SDK, no Node deps.
 * Compatible with Cloudflare Workers runtime.
 *
 * Endpoints implemented:
 *   - createCheckoutSession  (subscription start)
 *   - createBillingPortal    (manage / cancel)
 *   - retrieveSubscription   (status verify)
 *   - verifyWebhookSignature (HMAC-SHA256 of timestamp + payload)
 */

const STRIPE_API = 'https://api.stripe.com/v1'

async function stripeRequest<T = any>(
  path: string,
  secretKey: string,
  body?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const params = body
    ? new URLSearchParams(
        Object.entries(body)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      )
    : undefined

  const res = await fetch(`${STRIPE_API}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })
  const json = await res.json() as any
  if (!res.ok) {
    const msg = json?.error?.message || `Stripe ${res.status}`
    throw new Error(msg)
  }
  return json as T
}

export interface CheckoutSession {
  id: string
  url: string
  customer: string | null
  subscription: string | null
}

/**
 * Create a Stripe Checkout Session for a subscription.
 * Pass priceId from your Stripe dashboard (Recurring price for the Premium plan).
 */
export async function createCheckoutSession(opts: {
  secretKey: string
  priceId: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  customerId?: string
  metadata?: Record<string, string>
  trialDays?: number
}): Promise<CheckoutSession> {
  const body: Record<string, any> = {
    mode: 'subscription',
    'line_items[0][price]': opts.priceId,
    'line_items[0][quantity]': 1,
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    allow_promotion_codes: true,
  }
  if (opts.customerEmail) body.customer_email = opts.customerEmail
  if (opts.customerId) body.customer = opts.customerId
  if (opts.trialDays) body['subscription_data[trial_period_days]'] = opts.trialDays
  if (opts.metadata) {
    for (const [k, v] of Object.entries(opts.metadata)) {
      body[`metadata[${k}]`] = v
    }
  }
  return stripeRequest<CheckoutSession>('/checkout/sessions', opts.secretKey, body)
}

/**
 * Open Stripe-hosted billing portal so the user can change plan / cancel.
 */
export async function createBillingPortal(opts: {
  secretKey: string
  customerId: string
  returnUrl: string
}): Promise<{ id: string; url: string }> {
  return stripeRequest('/billing_portal/sessions', opts.secretKey, {
    customer: opts.customerId,
    return_url: opts.returnUrl,
  })
}

/**
 * Retrieve a subscription by id (used after checkout success to confirm status).
 */
export async function retrieveSubscription(
  secretKey: string,
  subscriptionId: string
): Promise<any> {
  return stripeRequest(`/subscriptions/${subscriptionId}`, secretKey)
}

/**
 * Verify Stripe webhook signature (HMAC-SHA256 of `timestamp.payload`).
 * Returns parsed event on success, throws on failure.
 *
 * Stripe-Signature header format: `t=<timestamp>,v1=<sig>,v1=<sig>...`
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = 300
): Promise<any> {
  const parts = Object.fromEntries(
    signatureHeader.split(',').map(p => {
      const [k, v] = p.split('=')
      return [k, v]
    })
  ) as { t?: string; v1?: string }

  const timestamp = parts.t
  const signature = parts.v1
  if (!timestamp || !signature) throw new Error('Invalid Stripe-Signature')

  // Tolerance check
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(timestamp, 10)) > toleranceSeconds) {
    throw new Error('Stripe webhook timestamp outside tolerance')
  }

  // HMAC-SHA256
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${timestamp}.${rawBody}`)
  )
  const sigHex = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  // Constant-time compare
  if (sigHex.length !== signature.length) throw new Error('Stripe signature mismatch')
  let diff = 0
  for (let i = 0; i < sigHex.length; i++) {
    diff |= sigHex.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  if (diff !== 0) throw new Error('Stripe signature mismatch')

  return JSON.parse(rawBody)
}

// =====================================================================
// Subscription state sync helper
// =====================================================================

export type SubscriptionStatus =
  | 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete'
  | 'incomplete_expired' | 'paused' | 'inactive'

export function isActiveStatus(status: string): boolean {
  return status === 'active' || status === 'trialing'
}
