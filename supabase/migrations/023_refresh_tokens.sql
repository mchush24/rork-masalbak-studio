-- Migration: Refresh Token Revocation
-- Created: 2026-02-09
-- Description: Tracks issued refresh tokens for revocation support

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for user lookups (revoke all tokens for a user)
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
-- Index for token hash lookups (check if token is revoked)
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
-- Index for cleanup of expired tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at) WHERE revoked_at IS NULL;

-- RLS
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Service role full access (backend only, no direct client access)
CREATE POLICY "Service role full access on refresh_tokens" ON refresh_tokens
  USING (true) WITH CHECK (true);
