/**
 * Cloudflare Workers Auth
 * - PBKDF2 password hashing (Web Crypto API, no external deps)
 * - JWT issue + verify (HS256)
 * - Session storage in KV
 * - Backwards compatible: detects legacy Base64 hashes and re-hashes on next login
 */

import { sign, verify } from 'hono/jwt'

// =====================================================================
// Password hashing (PBKDF2-SHA256, 100k iterations)
// Format:  pbkdf2$<iterations>$<saltB64>$<hashB64>
// =====================================================================

const PBKDF2_ITERATIONS = 100_000
const SALT_BYTES = 16

function bufToB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

function b64ToBuf(b64: string): ArrayBuffer {
  const bin = atob(b64)
  const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf.buffer
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bufToB64(salt.buffer)}$${bufToB64(bits)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false

  // Legacy Base64 hash (insecure, used by old code) — accept for now, re-hash on success
  if (!stored.startsWith('pbkdf2$')) {
    try {
      const decoded = atob(stored)
      return decoded === password
    } catch {
      return false
    }
  }

  const parts = stored.split('$')
  if (parts.length !== 4) return false
  const iterations = parseInt(parts[1], 10)
  const salt = b64ToBuf(parts[2])
  const expected = parts[3]

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  return bufToB64(bits) === expected
}

export function isLegacyHash(stored: string): boolean {
  return !!stored && !stored.startsWith('pbkdf2$')
}

// =====================================================================
// JWT (HS256)
// =====================================================================

export interface JWTPayload {
  sub: number              // user_id
  email: string
  is_admin?: boolean
  membership?: string
  iat: number
  exp: number
  jti?: string             // session id
  [key: string]: unknown   // hono/jwt JWTPayload compatibility
}

const SESSION_DAYS = 30

export async function issueJWT(
  user: { id: number; email: string; is_admin?: number; membership_type?: string },
  secret: string,
  jti?: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    is_admin: !!user.is_admin,
    membership: user.membership_type || 'free',
    iat: now,
    exp: now + SESSION_DAYS * 86400,
    jti: jti || crypto.randomUUID(),
  }
  return await sign(payload, secret)
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const payload = await verify(token, secret)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// =====================================================================
// Session storage in KV (revocation support)
// Key:   sess:<jti>
// Value: JSON { user_id, created_at, ip, ua }
// =====================================================================

export interface SessionRecord {
  user_id: number
  created_at: number
  ip?: string
  ua?: string
  revoked?: boolean
}

export async function createSession(
  kv: KVNamespace,
  jti: string,
  record: SessionRecord
): Promise<void> {
  await kv.put(`sess:${jti}`, JSON.stringify(record), {
    expirationTtl: SESSION_DAYS * 86400,
  })
}

export async function getSession(
  kv: KVNamespace,
  jti: string
): Promise<SessionRecord | null> {
  const raw = await kv.get(`sess:${jti}`, 'json')
  return (raw as SessionRecord) || null
}

export async function revokeSession(kv: KVNamespace, jti: string): Promise<void> {
  await kv.delete(`sess:${jti}`)
}

// =====================================================================
// Token helpers (random tokens for email verification, password reset)
// =====================================================================

export function generateToken(bytes = 32): string {
  const buf = crypto.getRandomValues(new Uint8Array(bytes))
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('')
}

// =====================================================================
// Turnstile verification
// =====================================================================

export async function verifyTurnstile(
  token: string,
  secret: string,
  remoteIp?: string
): Promise<boolean> {
  if (!token || !secret) return false
  try {
    const form = new FormData()
    form.set('secret', secret)
    form.set('response', token)
    if (remoteIp) form.set('remoteip', remoteIp)

    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body: form }
    )
    const data = await res.json() as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}
