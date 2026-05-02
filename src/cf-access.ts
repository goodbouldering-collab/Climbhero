/**
 * Cloudflare Access JWT verification.
 *
 * When you put a Self-hosted application in front of /admin/* via Cloudflare
 * Zero Trust, every request reaches the origin with a `Cf-Access-Jwt-Assertion`
 * header signed by Cloudflare's RS256 keys. We verify it against the team's
 * JWKS endpoint and the application's AUD tag.
 *
 * If CF_ACCESS_TEAM is not configured, the middleware short-circuits to
 * "allow everything" (useful in development; admin protection is then
 * delegated to the in-app session-based admin check).
 */

interface JWK {
  kty: string
  kid: string
  alg?: string
  n?: string
  e?: string
}

interface JWKSet {
  keys: JWK[]
}

let cachedJwks: { teamDomain: string; fetchedAt: number; data: JWKSet } | null = null
const JWKS_TTL_MS = 60 * 60 * 1000  // 1 hour

async function fetchJwks(teamDomain: string): Promise<JWKSet> {
  const now = Date.now()
  if (
    cachedJwks &&
    cachedJwks.teamDomain === teamDomain &&
    now - cachedJwks.fetchedAt < JWKS_TTL_MS
  ) {
    return cachedJwks.data
  }
  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`)
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`)
  const data = await res.json() as JWKSet
  cachedJwks = { teamDomain, fetchedAt: now, data }
  return data
}

function base64UrlToUint8(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
    + '='.repeat((4 - (b64url.length % 4)) % 4)
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function decodeJwtPart(part: string): any {
  const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    + '='.repeat((4 - (part.length % 4)) % 4)
  return JSON.parse(atob(b64))
}

async function importJwk(jwk: JWK): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'jwk',
    jwk as JsonWebKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  )
}

export interface AccessClaims {
  email?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  identity_nonce?: string
  [k: string]: any
}

/**
 * Verify a Cf-Access-Jwt-Assertion. Returns the claims on success, throws on failure.
 */
export async function verifyAccessJwt(
  jwt: string,
  teamDomain: string,
  expectedAud?: string
): Promise<AccessClaims> {
  const parts = jwt.split('.')
  if (parts.length !== 3) throw new Error('Malformed JWT')

  const header = decodeJwtPart(parts[0]) as { alg: string; kid: string }
  const payload = decodeJwtPart(parts[1]) as AccessClaims

  if (header.alg !== 'RS256') throw new Error(`Unexpected alg: ${header.alg}`)

  const now = Math.floor(Date.now() / 1000)
  if (payload.exp && payload.exp < now) throw new Error('JWT expired')

  if (expectedAud && payload.aud) {
    const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
    if (!auds.includes(expectedAud)) throw new Error('AUD mismatch')
  }

  const jwks = await fetchJwks(teamDomain)
  const jwk = jwks.keys.find(k => k.kid === header.kid)
  if (!jwk) throw new Error('Signing key not found in JWKS')

  const key = await importJwk(jwk)
  const sig = base64UrlToUint8(parts[2])
  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, data)
  if (!ok) throw new Error('JWT signature invalid')

  return payload
}

/**
 * Hono middleware. Place before /admin/* routes:
 *
 *   app.use('/admin/*', cfAccessMiddleware())
 *
 * Behavior:
 *   - If CF_ACCESS_TEAM is not set → allow (dev mode)
 *   - If header missing → 403
 *   - If verification fails → 403
 */
export function cfAccessMiddleware() {
  return async (c: any, next: () => Promise<void>) => {
    const env = c.env as {
      CF_ACCESS_TEAM?: string
      CF_ACCESS_AUD?: string
    }
    if (!env.CF_ACCESS_TEAM) {
      // Not configured — allow (rely on in-app admin session check)
      return next()
    }
    const jwt = c.req.header('cf-access-jwt-assertion')
    if (!jwt) {
      return c.json({ error: 'Cloudflare Access required' }, 403)
    }
    try {
      const claims = await verifyAccessJwt(jwt, env.CF_ACCESS_TEAM, env.CF_ACCESS_AUD)
      c.set('access_claims', claims)
      return next()
    } catch (err: any) {
      return c.json({ error: 'Access JWT invalid', detail: err.message }, 403)
    }
  }
}
