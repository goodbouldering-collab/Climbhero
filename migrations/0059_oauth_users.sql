-- Migration: Add OAuth columns to users
-- Date: 2026-04-26

ALTER TABLE users ADD COLUMN oauth_provider TEXT;            -- google / x / null
ALTER TABLE users ADD COLUMN oauth_external_id TEXT;         -- provider-native id

CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_external_id);

-- Email verification table
CREATE TABLE IF NOT EXISTS email_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user ON email_verifications(user_id);

ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
