-- Migration: Add Composite Indexes for Common Query Patterns
-- Created: 2026-01-26
-- Description: Optimizes frequently used queries with composite indexes

-- ==========================================
-- 1. COMPOSITE INDEXES FOR USER HISTORY QUERIES
-- ==========================================

-- Analyses: user_id + created_at for fetching user's recent analyses
CREATE INDEX IF NOT EXISTS idx_analyses_user_created
  ON analyses(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Analyses: user_id + task_type for filtering by analysis type
CREATE INDEX IF NOT EXISTS idx_analyses_user_task_type
  ON analyses(user_id, task_type)
  WHERE user_id IS NOT NULL;

-- Storybooks: user_id + created_at for fetching user's recent stories
CREATE INDEX IF NOT EXISTS idx_storybooks_user_created
  ON storybooks(user_id_fk, created_at DESC)
  WHERE user_id_fk IS NOT NULL;

-- Colorings: user_id + created_at for fetching user's recent colorings
CREATE INDEX IF NOT EXISTS idx_colorings_user_created
  ON colorings(user_id_fk, created_at DESC)
  WHERE user_id_fk IS NOT NULL;

-- ==========================================
-- 2. PARTIAL INDEXES FOR FILTERED QUERIES
-- ==========================================

-- Analyses: Only non-null child_name (for child-specific queries)
CREATE INDEX IF NOT EXISTS idx_analyses_user_child
  ON analyses(user_id, child_name)
  WHERE user_id IS NOT NULL AND child_name IS NOT NULL;

-- User badges: Composite for checking if user has specific badge
CREATE INDEX IF NOT EXISTS idx_user_badges_user_badge_lookup
  ON user_badges(user_id, badge_id);

-- ==========================================
-- 3. JSONB INDEXES FOR ANALYSIS RESULTS
-- ==========================================

-- GIN index for searching inside analysis_result JSONB
CREATE INDEX IF NOT EXISTS idx_analyses_result_gin
  ON analyses USING GIN(analysis_result jsonb_path_ops);

-- ==========================================
-- 4. TEXT SEARCH INDEXES
-- ==========================================

-- Storybooks: Full-text search on title
CREATE INDEX IF NOT EXISTS idx_storybooks_title_search
  ON storybooks USING gin(to_tsvector('simple', coalesce(title, '')));

-- ==========================================
-- 5. CHATBOT ANALYTICS INDEXES
-- ==========================================

-- Chatbot logs: Combined index for session analytics
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_session_created
  ON chatbot_logs(session_id, created_at DESC)
  WHERE session_id IS NOT NULL;

-- Chatbot logs: User interaction history
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_user_source
  ON chatbot_logs(user_id, source)
  WHERE user_id IS NOT NULL;

-- ==========================================
-- COMMENTS
-- ==========================================
COMMENT ON INDEX idx_analyses_user_created IS 'Optimizes fetching user recent analyses sorted by date';
COMMENT ON INDEX idx_storybooks_user_created IS 'Optimizes fetching user recent stories sorted by date';
COMMENT ON INDEX idx_colorings_user_created IS 'Optimizes fetching user recent colorings sorted by date';
COMMENT ON INDEX idx_analyses_result_gin IS 'Enables efficient JSONB queries on analysis results';
