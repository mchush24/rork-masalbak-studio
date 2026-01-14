-- Migration: User Badges (Rozetler)
-- Created: 2026-01-13
-- Description: Badge system for gamification

-- ==========================================
-- 1. USER_BADGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Foreign key to users
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Badge identification (matches badge.id from constants/badges.ts)
  badge_id TEXT NOT NULL,

  -- When the badge was unlocked
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Optional: Progress data for partial completion tracking
  progress_data JSONB DEFAULT '{}'::jsonb,
  -- Example: {"current": 3, "target": 5}

  -- Ensure unique badge per user
  UNIQUE(user_id, badge_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_unlocked_at ON user_badges(unlocked_at DESC);

-- RLS Policies
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Users can view their own badges
CREATE POLICY "Users can view their own badges" ON user_badges
  FOR SELECT USING (true);

-- Users can insert their own badges (via backend)
CREATE POLICY "Users can insert badges" ON user_badges
  FOR INSERT WITH CHECK (true);

-- Users can update their badge progress
CREATE POLICY "Users can update badge progress" ON user_badges
  FOR UPDATE USING (true);


-- ==========================================
-- 2. USER_ACTIVITY TABLE (for tracking streaks)
-- ==========================================
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Foreign key to users
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Activity date (only date, no time)
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Activity counts for this day
  analyses_count INTEGER DEFAULT 0,
  stories_count INTEGER DEFAULT 0,
  colorings_count INTEGER DEFAULT 0,

  -- First activity time of the day (for secret badges)
  first_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Unique activity per user per day
  UNIQUE(user_id, activity_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON user_activity(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity(user_id, activity_date DESC);

-- RLS Policies
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity" ON user_activity
  FOR SELECT USING (true);

CREATE POLICY "Users can insert activity" ON user_activity
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update activity" ON user_activity
  FOR UPDATE USING (true);


-- ==========================================
-- 3. ADD STREAK TRACKING TO USERS TABLE
-- ==========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_date DATE;


-- ==========================================
-- 4. HELPER FUNCTION: Calculate Consecutive Days
-- ==========================================
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_activity_date DATE;
BEGIN
  -- Loop through activity days backwards
  FOR v_activity_date IN
    SELECT activity_date
    FROM user_activity
    WHERE user_id = p_user_id
    ORDER BY activity_date DESC
  LOOP
    IF v_activity_date = v_current_date OR v_activity_date = v_current_date - 1 THEN
      v_streak := v_streak + 1;
      v_current_date := v_activity_date;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;


-- ==========================================
-- 5. TRIGGER: Update streak on activity insert
-- ==========================================
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_new_streak INTEGER;
BEGIN
  -- Calculate new streak
  v_new_streak := calculate_user_streak(NEW.user_id);

  -- Update user's streak
  UPDATE users
  SET
    current_streak = v_new_streak,
    longest_streak = GREATEST(longest_streak, v_new_streak),
    last_activity_date = NEW.activity_date
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_streak
  AFTER INSERT OR UPDATE ON user_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();
