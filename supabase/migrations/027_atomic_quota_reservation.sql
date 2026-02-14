-- Migration: 027 - Atomic Quota Reservation
-- Created: 2026-02-13
-- Description: Replaces check-then-act quota pattern with atomic reservation.
--   The old system had a race condition: middleware checks quota (read),
--   then the operation proceeds and DB triggers increment quota (write).
--   Between check and write, concurrent requests could exceed the limit.
--
--   New system: middleware calls reserve_quota_tokens() which locks the row,
--   checks quota, and reserves tokens in a single atomic transaction.
--   DB triggers are removed to prevent double-counting.

-- ==========================================
-- 1. CREATE ATOMIC RESERVATION FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION reserve_quota_tokens(
  p_user_id UUID,
  p_cost INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
  v_tokens_used INTEGER;
  v_limit INTEGER;
  v_remaining INTEGER;
BEGIN
  -- Lock the user row to prevent concurrent quota checks
  SELECT subscription_tier, quota_used, quota_reset_at
  INTO v_user
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'user_not_found');
  END IF;

  -- Premium = unlimited
  IF v_user.subscription_tier = 'premium' THEN
    RETURN jsonb_build_object('allowed', true, 'tier', 'premium');
  END IF;

  -- Determine limit based on tier
  v_limit := CASE v_user.subscription_tier
    WHEN 'pro' THEN 500
    ELSE 50
  END;

  v_tokens_used := COALESCE((v_user.quota_used->>'tokens')::INTEGER, 0);

  -- Lazy monthly reset: if reset date has passed, zero out and advance
  IF v_user.quota_reset_at IS NULL OR v_user.quota_reset_at <= NOW() THEN
    v_tokens_used := 0;
    UPDATE users
    SET quota_used = jsonb_build_object('tokens', p_cost),
        quota_reset_at = NOW() + INTERVAL '1 month'
    WHERE id = p_user_id;

    RETURN jsonb_build_object(
      'allowed', true,
      'tokens_used', p_cost,
      'remaining', v_limit - p_cost,
      'tier', v_user.subscription_tier,
      'was_reset', true
    );
  END IF;

  v_remaining := v_limit - v_tokens_used;

  -- Not enough tokens
  IF v_remaining < p_cost THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'tokens_used', v_tokens_used,
      'remaining', v_remaining,
      'token_limit', v_limit,
      'tier', v_user.subscription_tier,
      'cost', p_cost
    );
  END IF;

  -- Reserve tokens atomically
  UPDATE users
  SET quota_used = jsonb_build_object('tokens', v_tokens_used + p_cost)
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'allowed', true,
    'tokens_used', v_tokens_used + p_cost,
    'remaining', v_remaining - p_cost,
    'tier', v_user.subscription_tier
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute to service role (backend uses service role key)
GRANT EXECUTE ON FUNCTION reserve_quota_tokens(UUID, INTEGER) TO service_role;

-- ==========================================
-- 2. REMOVE INSERT TRIGGERS (prevent double-counting)
-- ==========================================
-- The middleware now handles token deduction atomically,
-- so these triggers would cause double-counting.

-- Analysis trigger (created in migration 002, updated in 025)
DROP TRIGGER IF EXISTS trg_increment_analysis_quota ON analyses;
DROP TRIGGER IF EXISTS increment_analysis_quota_trigger ON analyses;

-- Storybook trigger (created in migration 025)
DROP TRIGGER IF EXISTS increment_storybook_quota_trigger ON storybooks;

-- Coloring trigger (created in migration 025)
DROP TRIGGER IF EXISTS increment_coloring_quota_trigger ON colorings;

-- Keep the functions (don't drop) for rollback safety.
-- They are harmless without triggers attached.
