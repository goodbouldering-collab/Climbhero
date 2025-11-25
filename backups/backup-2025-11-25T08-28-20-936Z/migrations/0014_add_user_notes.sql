-- Add notes field to users table for admin remarks
ALTER TABLE users ADD COLUMN notes TEXT DEFAULT '';

-- Add index for faster user management queries
CREATE INDEX IF NOT EXISTS idx_users_membership ON users(membership_type);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);
