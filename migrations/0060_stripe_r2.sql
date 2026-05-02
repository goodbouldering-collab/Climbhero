-- Migration: Stripe subscriptions + R2 upload tracking
-- Date: 2026-04-26

-- Stripe customer / subscription tracking on users
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN subscription_status TEXT;          -- active/trialing/canceled/...
ALTER TABLE users ADD COLUMN subscription_current_period_end DATETIME;
ALTER TABLE users ADD COLUMN trial_ends_at DATETIME;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription ON users(stripe_subscription_id);

-- Webhook event idempotency
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id TEXT PRIMARY KEY,             -- Stripe event id (evt_...)
  event_type TEXT NOT NULL,
  processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  payload TEXT
);

-- R2 upload registry (track what we have in storage)
CREATE TABLE IF NOT EXISTS r2_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  kind TEXT NOT NULL,              -- avatar / thumbnail / user_media / video_post
  r2_key TEXT NOT NULL UNIQUE,
  content_type TEXT,
  size INTEGER,
  url TEXT,                        -- public URL (custom domain or /api/uploads/<key>)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_r2_uploads_user ON r2_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_r2_uploads_kind ON r2_uploads(kind);
