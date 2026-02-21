-- Add support for Google OAuth authentication
-- Existing users keep auth_provider='password', password_hash set
-- Google users have auth_provider='google', firebase_uid set, password_hash=NULL

-- Add auth_provider column (default 'password' for existing rows)
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'password';

-- Add firebase_uid for Google users (nullable, unique)
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE;

-- Make password_hash nullable (Google users have no password)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Index for firebase_uid lookups
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
