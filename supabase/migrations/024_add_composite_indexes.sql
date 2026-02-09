-- Migration: Additional composite and partial indexes for performance
-- Created: 2026-02-09
-- Description: Optimizes frequently used queries (discover feed, like lookups)

-- Partial index for approved gallery items sorted by date (discover feed query)
CREATE INDEX IF NOT EXISTS idx_community_gallery_approved_date
  ON community_gallery(created_at DESC)
  WHERE is_approved = true;

-- Partial index for approved stories sorted by date
CREATE INDEX IF NOT EXISTS idx_success_stories_approved_date
  ON success_stories(created_at DESC)
  WHERE is_approved = true;

-- Composite index for analyses by user + date (history listing)
CREATE INDEX IF NOT EXISTS idx_analyses_user_created
  ON analyses(user_id, created_at DESC);

-- Composite index for storybooks by user + date (history listing)
CREATE INDEX IF NOT EXISTS idx_storybooks_user_created
  ON storybooks(user_id_fk, created_at DESC);

-- Composite index for colorings by user + date (history listing)
CREATE INDEX IF NOT EXISTS idx_colorings_user_created
  ON colorings(user_id_fk, created_at DESC);

-- Index for refresh_tokens cleanup (Phase 2 addition)
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_active
  ON refresh_tokens(user_id)
  WHERE revoked_at IS NULL;
