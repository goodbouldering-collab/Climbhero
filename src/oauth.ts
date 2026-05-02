/**
 * OAuth 2.0 providers (Google, X/Twitter)
 * Pure Workers fetch — no external libraries.
 *
 * Flow:
 *   1. /api/auth/oauth/<provider> → redirect to provider authorize URL with state
 *   2. /api/auth/oauth/<provider>/callback → exchange code for token, fetch user, upsert in DB, issue session
 */

export interface OAuthUser {
  provider: 'google' | 'x'
  external_id: string
  email: string | null
  username: string
  avatar_url: string | null
}

const STATE_TTL = 600  // 10 minutes

// =====================================================================
// State / PKCE helpers (stored in KV)
// =====================================================================

export async function createOAuthState(
  kv: KVNamespace,
  data: { provider: string; redirect_to?: string; code_verifier?: string }
): Promise<string> {
  const state = crypto.randomUUID()
  await kv.put(`oauth_state:${state}`, JSON.stringify(data), {
    expirationTtl: STATE_TTL,
  })
  return state
}

export async function consumeOAuthState(
  kv: KVNamespace,
  state: string
): Promise<{ provider: string; redirect_to?: string; code_verifier?: string } | null> {
  const raw = await kv.get(`oauth_state:${state}`, 'json')
  if (!raw) return null
  await kv.delete(`oauth_state:${state}`)
  return raw as any
}

async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const buf = crypto.getRandomValues(new Uint8Array(32))
  const verifier = base64UrlEncode(buf)
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  const challenge = base64UrlEncode(new Uint8Array(hash))
  return { verifier, challenge }
}

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// =====================================================================
// Google OAuth 2.0
// =====================================================================

export async function buildGoogleAuthUrl(
  clientId: string,
  redirectUri: string,
  state: string
): Promise<string> {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeGoogleCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; id_token: string } | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) return null
  return await res.json() as any
}

export async function fetchGoogleUser(accessToken: string): Promise<OAuthUser | null> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  const data = await res.json() as any
  return {
    provider: 'google',
    external_id: data.sub,
    email: data.email || null,
    username: data.name || data.email?.split('@')[0] || `google_${data.sub.slice(0, 8)}`,
    avatar_url: data.picture || null,
  }
}

// =====================================================================
// X (Twitter) OAuth 2.0 with PKCE
// =====================================================================

export async function buildXAuthUrl(
  clientId: string,
  redirectUri: string,
  state: string,
  challenge: string
): Promise<string> {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'tweet.read users.read',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })
  return `https://twitter.com/i/oauth2/authorize?${params}`
}

export async function exchangeXCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  codeVerifier: string
): Promise<{ access_token: string } | null> {
  const auth = btoa(`${clientId}:${clientSecret}`)
  const res = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
      client_id: clientId,
    }),
  })
  if (!res.ok) return null
  return await res.json() as any
}

export async function fetchXUser(accessToken: string): Promise<OAuthUser | null> {
  const res = await fetch(
    'https://api.twitter.com/2/users/me?user.fields=profile_image_url,username,name',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) return null
  const data = await res.json() as any
  if (!data.data) return null
  return {
    provider: 'x',
    external_id: data.data.id,
    email: null,                  // X does not return email by default
    username: data.data.name || data.data.username,
    avatar_url: data.data.profile_image_url || null,
  }
}

// =====================================================================
// User upsert from OAuth profile
// =====================================================================

export async function upsertOAuthUser(
  db: D1Database,
  oauth: OAuthUser
): Promise<{ id: number; email: string; username: string; is_admin: number; membership_type: string }> {
  // Try to match by oauth_external_id first, then by email (Google only)
  let user: any = null

  user = await db
    .prepare('SELECT * FROM users WHERE oauth_provider = ? AND oauth_external_id = ?')
    .bind(oauth.provider, oauth.external_id)
    .first()

  if (!user && oauth.email) {
    user = await db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(oauth.email)
      .first()
    if (user) {
      // Link existing email account to OAuth
      await db
        .prepare('UPDATE users SET oauth_provider = ?, oauth_external_id = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?')
        .bind(oauth.provider, oauth.external_id, oauth.avatar_url, user.id)
        .run()
    }
  }

  if (!user) {
    // Create new account
    const email = oauth.email || `${oauth.provider}_${oauth.external_id}@oauth.local`
    const result = await db
      .prepare(
        `INSERT INTO users (email, username, password_hash, membership_type, oauth_provider, oauth_external_id, avatar_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        email,
        oauth.username,
        '!oauth-only',                  // password disabled marker
        'free',
        oauth.provider,
        oauth.external_id,
        oauth.avatar_url
      )
      .run()

    user = {
      id: result.meta?.last_row_id,
      email,
      username: oauth.username,
      is_admin: 0,
      membership_type: 'free',
    }
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    is_admin: user.is_admin || 0,
    membership_type: user.membership_type || 'free',
  }
}

export { generatePKCE }
