-- Migration: Add sample favorites for demo
-- Date: 2026-01-09
-- Purpose: Restore favorites list with sample data

-- Create a demo user if not exists (for testing)
INSERT OR IGNORE INTO users (id, email, username, membership_type, created_at)
VALUES (
  999,
  'demo@climbhero.jp',
  'デモユーザー',
  'free',
  CURRENT_TIMESTAMP
);

-- Add sample favorites (videos 1-5)
INSERT OR IGNORE INTO favorites (user_id, video_id, created_at)
VALUES 
  (999, 1, CURRENT_TIMESTAMP),
  (999, 2, CURRENT_TIMESTAMP),
  (999, 3, CURRENT_TIMESTAMP),
  (999, 4, CURRENT_TIMESTAMP),
  (999, 5, CURRENT_TIMESTAMP);
