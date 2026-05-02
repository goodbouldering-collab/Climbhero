-- Lock out the legacy admin@climbhero.com user that was inserted in migration 0003 with hardcoded
-- password 'admin123' (legacy Base64 hash 'YWRtaW4xMjM='). This migration randomizes the password
-- so the legacy credential no longer grants access.
--
-- After this migration runs, the operator must:
--   1. Set ADMIN_BOOTSTRAP_PASSWORD (>= 16 chars) in Cloudflare Pages env
--   2. Log in via /api/auth/login with email=admin@climbhero.com and password=<bootstrap value>
--   3. The bootstrap path resets the password_hash to the bootstrap value (proper hash)
--   4. Change the password in the UI to a new secure value
--   5. Unset ADMIN_BOOTSTRAP_PASSWORD in env to fully disable the bootstrap path
--
-- Apply with: npx wrangler d1 migrations apply webapp-production --remote

UPDATE users
SET password_hash = lower(hex(randomblob(64)))
WHERE email = 'admin@climbhero.com'
  AND password_hash = 'YWRtaW4xMjM=';
