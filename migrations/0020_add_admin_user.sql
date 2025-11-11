-- Create admin user with temporary password
-- Email: admin@climbhero.com
-- Password: Admin@2024 (Base64 encoded: QWRtaW5AMjAyNA==)

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
