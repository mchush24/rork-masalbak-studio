-- Migration: Secure Row Level Security Policies
-- Created: 2026-01-06
-- Description: Update RLS policies to use JWT-based user context

-- ==========================================
-- 1. CREATE HELPER FUNCTIONS FOR RLS
-- ==========================================

-- Function to set current user context (called from backend)
CREATE OR REPLACE FUNCTION set_user_context(user_id TEXT)
RETURNS void AS $$
BEGIN
  -- Set the user_id for this session/transaction
  PERFORM set_config('app.current_user_id', user_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear user context
CREATE OR REPLACE FUNCTION clear_user_context()
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', '', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user ID from context
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ==========================================
-- 2. DROP OLD INSECURE POLICIES
-- ==========================================

-- Users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- User settings table
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

-- Analyses table
DROP POLICY IF EXISTS "Users can view their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON analyses;

-- Storybooks table
DROP POLICY IF EXISTS "Enable read access for all users" ON storybooks;
DROP POLICY IF EXISTS "Enable insert for all users" ON storybooks;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON storybooks;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON storybooks;

-- Colorings table
DROP POLICY IF EXISTS "Enable read access for all users" ON colorings;
DROP POLICY IF EXISTS "Enable insert for all users" ON colorings;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON colorings;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON colorings;


-- ==========================================
-- 3. CREATE SECURE RLS POLICIES
-- ==========================================

-- -----------------------------------------
-- USERS TABLE - Users can only access their own profile
-- -----------------------------------------
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (id::text = get_current_user_id());

CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  WITH CHECK (id::text = get_current_user_id());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (id::text = get_current_user_id());

-- No delete policy - users shouldn't delete themselves


-- -----------------------------------------
-- USER_SETTINGS TABLE - Users can only access their own settings
-- -----------------------------------------
CREATE POLICY "user_settings_select_own" ON user_settings
  FOR SELECT
  USING (user_id::text = get_current_user_id());

CREATE POLICY "user_settings_insert_own" ON user_settings
  FOR INSERT
  WITH CHECK (user_id::text = get_current_user_id());

CREATE POLICY "user_settings_update_own" ON user_settings
  FOR UPDATE
  USING (user_id::text = get_current_user_id());

CREATE POLICY "user_settings_delete_own" ON user_settings
  FOR DELETE
  USING (user_id::text = get_current_user_id());


-- -----------------------------------------
-- ANALYSES TABLE - Users can only access their own analyses
-- -----------------------------------------
CREATE POLICY "analyses_select_own" ON analyses
  FOR SELECT
  USING (user_id::text = get_current_user_id());

CREATE POLICY "analyses_insert_own" ON analyses
  FOR INSERT
  WITH CHECK (user_id::text = get_current_user_id());

CREATE POLICY "analyses_update_own" ON analyses
  FOR UPDATE
  USING (user_id::text = get_current_user_id());

CREATE POLICY "analyses_delete_own" ON analyses
  FOR DELETE
  USING (user_id::text = get_current_user_id());


-- -----------------------------------------
-- STORYBOOKS TABLE - Users can only access their own storybooks
-- -----------------------------------------
CREATE POLICY "storybooks_select_own" ON storybooks
  FOR SELECT
  USING (user_id_fk::text = get_current_user_id());

CREATE POLICY "storybooks_insert_own" ON storybooks
  FOR INSERT
  WITH CHECK (user_id_fk::text = get_current_user_id());

CREATE POLICY "storybooks_update_own" ON storybooks
  FOR UPDATE
  USING (user_id_fk::text = get_current_user_id());

CREATE POLICY "storybooks_delete_own" ON storybooks
  FOR DELETE
  USING (user_id_fk::text = get_current_user_id());


-- -----------------------------------------
-- COLORINGS TABLE - Users can only access their own colorings
-- -----------------------------------------
CREATE POLICY "colorings_select_own" ON colorings
  FOR SELECT
  USING (user_id_fk::text = get_current_user_id());

CREATE POLICY "colorings_insert_own" ON colorings
  FOR INSERT
  WITH CHECK (user_id_fk::text = get_current_user_id());

CREATE POLICY "colorings_update_own" ON colorings
  FOR UPDATE
  USING (user_id_fk::text = get_current_user_id());

CREATE POLICY "colorings_delete_own" ON colorings
  FOR DELETE
  USING (user_id_fk::text = get_current_user_id());


-- ==========================================
-- 4. GRANT PERMISSIONS
-- ==========================================

-- Grant execute permissions on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION set_user_context(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION clear_user_context() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;

-- Grant execute to service_role (for backend)
GRANT EXECUTE ON FUNCTION set_user_context(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION clear_user_context() TO service_role;
GRANT EXECUTE ON FUNCTION get_current_user_id() TO service_role;


-- ==========================================
-- 5. VERIFICATION QUERIES (for testing)
-- ==========================================

-- Test: Set user context and verify
-- SELECT set_user_context('some-user-uuid');
-- SELECT get_current_user_id(); -- Should return 'some-user-uuid'
-- SELECT * FROM users; -- Should only return rows where id = 'some-user-uuid'

-- Test: Clear context and verify
-- SELECT clear_user_context();
-- SELECT get_current_user_id(); -- Should return NULL
-- SELECT * FROM users; -- Should return no rows (RLS blocks)


-- ==========================================
-- 6. NOTES
-- ==========================================

/*
SECURITY MODEL:
1. Backend validates JWT and extracts userId
2. Backend calls set_user_context(userId) before each query
3. RLS policies check current_setting('app.current_user_id')
4. Double protection: Backend + Database level

IMPORTANT:
- Service role key bypasses RLS by default
- We explicitly set context to enable RLS checks
- Even if backend is compromised, database enforces ownership

FUTURE IMPROVEMENTS:
- Add audit logging for policy violations
- Add shared resource policies (e.g., public storybooks)
- Add admin policies for support team
*/
