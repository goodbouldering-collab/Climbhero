-- Create or update admin user with temporary password
-- Email: admin@climbhero.com
-- Password: Admin@2024 (Base64 encoded: QWRtaW5AMjAyNA==)

-- First, try to insert the admin user
INSERT OR IGNORE INTO users (
  email, 
  username, 
  password_hash, 
  membership_type, 
  is_admin,
  created_at
) VALUES (
  'admin@climbhero.com',
  'Admin',
  'QWRtaW5AMjAyNA==',
  'premium',
  1,
  datetime('now')
);

-- Then, update the password and admin status (in case user already exists)
UPDATE users 
SET 
  password_hash = 'QWRtaW5AMjAyNA==',
  is_admin = 1,
  membership_type = 'premium',
  username = 'Admin'
WHERE email = 'admin@climbhero.com';
