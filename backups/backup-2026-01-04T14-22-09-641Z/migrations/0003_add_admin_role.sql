-- Add admin role to users table
ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;

-- Create admin user (password: admin123)
UPDATE users SET is_admin = 1 WHERE email = 'admin@climbhero.com';

-- If admin user doesn't exist, create one
INSERT OR IGNORE INTO users (email, username, password_hash, is_admin, membership_type, session_token)
VALUES ('admin@climbhero.com', 'Admin', 'YWRtaW4xMjM=', 1, 'premium', NULL);
