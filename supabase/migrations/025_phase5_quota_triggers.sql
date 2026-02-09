-- Migration: Phase 5 - Storybook & Coloring Quota Triggers
-- Created: 2025-02-09
-- Description: Add INSERT triggers for storybooks and colorings to auto-increment quota_used
-- Pattern: follows analyses trigger from 002_create_analyses_table.sql

-- ==========================================
-- 1. STORYBOOK QUOTA TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION increment_storybook_quota()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET quota_used = jsonb_set(
    quota_used,
    '{storybooks}',
    to_jsonb(COALESCE((quota_used->>'storybooks')::int, 0) + 1)
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
-- 2. COLORING QUOTA TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION increment_coloring_quota()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET quota_used = jsonb_set(
    quota_used,
    '{colorings}',
    to_jsonb(COALESCE((quota_used->>'colorings')::int, 0) + 1)
  )
  WHERE id = NEW.user_id_fk;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_coloring_quota_trigger
AFTER INSERT ON colorings
FOR EACH ROW
EXECUTE FUNCTION increment_coloring_quota();
