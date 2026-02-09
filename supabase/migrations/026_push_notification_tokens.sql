-- Migration: Phase 5 - Push Notification Token Storage
-- Created: 2025-02-09
-- Description: Store Expo push tokens for multi-device push notification support

-- ==========================================
-- 1. PUSH TOKENS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Token info
  push_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_id TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Ensure one token per user-token combo
  UNIQUE(user_id, push_token)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON user_push_tokens(user_id, is_active) WHERE is_active = true;

-- RLS
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own push tokens" ON user_push_tokens
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own push tokens" ON user_push_tokens
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own push tokens" ON user_push_tokens
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own push tokens" ON user_push_tokens
  FOR DELETE USING (true);

-- Auto-update updated_at
CREATE TRIGGER update_push_tokens_updated_at BEFORE UPDATE ON user_push_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
