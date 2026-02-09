-- Migration: Phase 5 - Token-Based Quota Triggers
-- Created: 2025-02-09
-- Description: Token-based quota system. Each AI action costs tokens.
-- Costs: analysis=10, storybook=15, coloring=8
-- Limits: free=50/mo, pro=500/mo, premium=unlimited
-- quota_used format: {"tokens": 35}

-- ==========================================
-- 0. MIGRATE EXISTING DATA
-- ==========================================
-- Convert old per-resource format to token format
UPDATE users
SET quota_used = '{"tokens": 0}'::jsonb
WHERE quota_used IS NULL
   OR NOT (quota_used ? 'tokens');

-- ==========================================
-- 1. OVERRIDE ANALYSIS TRIGGER (was per-resource, now tokens +10)
-- ==========================================
CREATE OR REPLACE FUNCTION increment_analysis_quota()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET quota_used = jsonb_set(
    COALESCE(quota_used, '{"tokens": 0}'::jsonb),
    '{tokens}',
    to_jsonb(COALESCE((quota_used->>'tokens')::int, 0) + 10)
  )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 2. STORYBOOK TRIGGER (tokens +15)
-- ==========================================
CREATE OR REPLACE FUNCTION increment_storybook_quota()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET quota_used = jsonb_set(
    COALESCE(quota_used, '{"tokens": 0}'::jsonb),
    '{tokens}',
    to_jsonb(COALESCE((quota_used->>'tokens')::int, 0) + 15)
  )
  WHERE id = NEW.user_id_fk;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_storybook_quota_trigger
AFTER INSERT ON storybooks
FOR EACH ROW
EXECUTE FUNCTION increment_storybook_quota();

-- ==========================================
-- 3. COLORING TRIGGER (tokens +8)
-- ==========================================
CREATE OR REPLACE FUNCTION increment_coloring_quota()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET quota_used = jsonb_set(
    COALESCE(quota_used, '{"tokens": 0}'::jsonb),
    '{tokens}',
    to_jsonb(COALESCE((quota_used->>'tokens')::int, 0) + 8)
  )
  WHERE id = NEW.user_id_fk;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_coloring_quota_trigger
AFTER INSERT ON colorings
FOR EACH ROW
EXECUTE FUNCTION increment_coloring_quota();
