-- Add admin role to users table
ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;

-- Mark admin@climbhero.com as admin. Password must be set via ADMIN_BOOTSTRAP_PASSWORD env on first login.
-- Note: a legacy hardcoded credential (admin123) was previously inserted here. See migration 0061 for the lockout.
UPDATE users SET is_admin = 1 WHERE email = 'admin@climbhero.com';
