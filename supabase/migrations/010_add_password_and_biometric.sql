-- Migration: Add Password and Biometric Authentication Support
-- Created: 2025-01-24
-- Description: Extends users table with password_hash and biometric fields

-- ==========================================
-- 1. ADD PASSWORD AND BIOMETRIC COLUMNS
-- ==========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_enrolled_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMPTZ;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_password_reset ON users(password_reset_required) WHERE password_reset_required = true;
CREATE INDEX IF NOT EXISTS idx_users_biometric ON users(biometric_enabled) WHERE biometric_enabled = true;

-- Add comments
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password (nullable for legacy users during migration)';
COMMENT ON COLUMN users.biometric_enabled IS 'Whether user has enabled Face ID/Touch ID';
COMMENT ON COLUMN users.password_reset_required IS 'Forces user to set password on next login (for migration)';

-- ==========================================
-- 2. PASSWORD RESET TOKENS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),

  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,

  -- Optional: Link to user for cleanup
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_code ON password_reset_tokens(code);

-- RLS Policies
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert password reset tokens" ON password_reset_tokens
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can select their password reset tokens" ON password_reset_tokens
  FOR SELECT USING (true);

-- ==========================================
-- 3. CLEANUP FUNCTION FOR EXPIRED TOKENS
-- ==========================================
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < now() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_password_reset_tokens IS 'Deletes password reset tokens that expired more than 1 hour ago';

-- ==========================================
-- 4. MIGRATION DATA - Mark existing users
-- ==========================================
-- Mark all existing users without password_hash as requiring password reset
UPDATE users
SET password_reset_required = true
WHERE password_hash IS NULL AND email IS NOT NULL;
