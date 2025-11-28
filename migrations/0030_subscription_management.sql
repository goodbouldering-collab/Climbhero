-- Migration: Subscription Management System
-- Add proper subscription tracking for Stripe integration

-- Subscriptions table for tracking all subscription details
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- Stripe IDs
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  
  -- Plan details
  plan_type TEXT NOT NULL DEFAULT 'free', -- 'free', 'monthly', 'annual'
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'canceled', 'past_due', 'inactive'
  
  -- Billing cycle
  current_period_start DATETIME,
  current_period_end DATETIME,
  
  -- Auto-renewal setting
  auto_renew INTEGER DEFAULT 1, -- 1 = ON, 0 = OFF
  cancel_at_period_end INTEGER DEFAULT 0, -- 1 if scheduled to cancel
  
  -- Price info (in JPY)
  price_amount INTEGER,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  canceled_at DATETIME,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payment history
CREATE TABLE IF NOT EXISTS payment_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  subscription_id INTEGER,
  
  -- Stripe payment info
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  
  -- Amount
  amount INTEGER NOT NULL, -- in JPY
  currency TEXT DEFAULT 'jpy',
  
  -- Status
  status TEXT NOT NULL, -- 'succeeded', 'failed', 'pending', 'refunded'
  
  -- Description
  description TEXT,
  plan_type TEXT, -- 'monthly', 'annual'
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_payment_history_user ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe ON payment_history(stripe_payment_intent_id);

-- Add Stripe customer ID to users table if not exists
-- Note: This may already exist, so we use a safe approach
-- ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
