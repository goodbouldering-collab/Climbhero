-- Production seed data (simplified - no foreign key dependencies)

-- Disable foreign key constraints temporarily
PRAGMA foreign_keys = OFF;

-- Insert admin user
INSERT OR IGNORE INTO users (id, email, username, password_hash, is_admin, membership_type, created_at) VALUES 
  (1, 'admin@climbhero.com', 'Admin', 'YWRtaW4xMjM=', 1, 'premium', datetime('now'));

-- Insert sample users
INSERT OR IGNORE INTO users (id, email, username, password_hash, membership_type, created_at) VALUES 
  (2, 'demo@example.com', 'Demo User', 'ZGVtbw==', 'free', datetime('now')),
  (3, 'premium@example.com', 'Premium Member', 'cHJlbWl1bQ==', 'premium', datetime('now'));

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;
