-- Chatbot Unanswered Queries Table
-- Migration: 015_chatbot_unanswered_queries.sql
-- Faz 6: Cevaplanamayan sorulari kaydet ve analiz et

-- 1. Cevaplanamayan sorular tablosu
CREATE TABLE IF NOT EXISTS chatbot_unanswered_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,

  -- Query details
  query TEXT NOT NULL,
  normalized_query TEXT NOT NULL,
  detected_intent TEXT,
  detected_emotion TEXT,

  -- Why it wasn't answered
  reason TEXT NOT NULL, -- 'no_faq_match', 'low_confidence', 'ai_fallback', 'error'
  confidence FLOAT, -- if low_confidence, what was the score
  attempted_faq_id TEXT, -- if there was a low-confidence match

  -- Context
  current_screen TEXT,
  child_age INTEGER,
  conversation_length INTEGER DEFAULT 0,

  -- AI response (if generated)
  ai_response TEXT,
  ai_response_helpful BOOLEAN, -- user feedback if available

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- For clustering similar queries
  query_hash TEXT GENERATED ALWAYS AS (md5(normalized_query)) STORED
);

-- 2. Indexes for analytics
CREATE INDEX IF NOT EXISTS unanswered_queries_reason_idx
  ON chatbot_unanswered_queries(reason);
CREATE INDEX IF NOT EXISTS unanswered_queries_intent_idx
  ON chatbot_unanswered_queries(detected_intent);
CREATE INDEX IF NOT EXISTS unanswered_queries_created_idx
  ON chatbot_unanswered_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS unanswered_queries_hash_idx
  ON chatbot_unanswered_queries(query_hash);
CREATE INDEX IF NOT EXISTS unanswered_queries_screen_idx
  ON chatbot_unanswered_queries(current_screen);

-- 3. View for common unanswered queries (grouped)
CREATE OR REPLACE VIEW chatbot_common_unanswered AS
SELECT
  normalized_query,
  query_hash,
  detected_intent,
  COUNT(*) as occurrence_count,
  MAX(created_at) as last_seen,
  MIN(created_at) as first_seen,
  ARRAY_AGG(DISTINCT reason) as reasons,
  AVG(confidence) as avg_confidence
FROM chatbot_unanswered_queries
GROUP BY normalized_query, query_hash, detected_intent
ORDER BY occurrence_count DESC;

-- 4. Function to get top unanswered queries
CREATE OR REPLACE FUNCTION get_top_unanswered_queries(
  days_back INTEGER DEFAULT 30,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  normalized_query TEXT,
  detected_intent TEXT,
  occurrence_count BIGINT,
  last_seen TIMESTAMP WITH TIME ZONE,
  reasons TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    uq.normalized_query,
    uq.detected_intent,
    COUNT(*) as occurrence_count,
    MAX(uq.created_at) as last_seen,
    ARRAY_AGG(DISTINCT uq.reason) as reasons
  FROM chatbot_unanswered_queries uq
  WHERE uq.created_at > NOW() - (days_back || ' days')::INTERVAL
  GROUP BY uq.normalized_query, uq.detected_intent
  ORDER BY occurrence_count DESC
  LIMIT limit_count;
END;
$$;

-- 5. Function to get unanswered queries stats
CREATE OR REPLACE FUNCTION get_unanswered_stats(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_unanswered BIGINT,
  by_reason JSONB,
  by_intent JSONB,
  by_screen JSONB,
  avg_confidence FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_unanswered,
    (
      SELECT jsonb_object_agg(reason, cnt)
      FROM (
        SELECT reason, COUNT(*) as cnt
        FROM chatbot_unanswered_queries
        WHERE created_at > NOW() - (days_back || ' days')::INTERVAL
        GROUP BY reason
      ) r
    ) as by_reason,
    (
      SELECT jsonb_object_agg(COALESCE(detected_intent, 'unknown'), cnt)
      FROM (
        SELECT detected_intent, COUNT(*) as cnt
        FROM chatbot_unanswered_queries
        WHERE created_at > NOW() - (days_back || ' days')::INTERVAL
        GROUP BY detected_intent
      ) i
    ) as by_intent,
    (
      SELECT jsonb_object_agg(COALESCE(current_screen, 'unknown'), cnt)
      FROM (
        SELECT current_screen, COUNT(*) as cnt
        FROM chatbot_unanswered_queries
        WHERE created_at > NOW() - (days_back || ' days')::INTERVAL
        GROUP BY current_screen
      ) s
    ) as by_screen,
    AVG(confidence) as avg_confidence
  FROM chatbot_unanswered_queries
  WHERE created_at > NOW() - (days_back || ' days')::INTERVAL;
END;
$$;

-- 6. RLS policies
ALTER TABLE chatbot_unanswered_queries ENABLE ROW LEVEL SECURITY;

-- Service role icin tam erisim
CREATE POLICY "Service role has full access to unanswered_queries"
  ON chatbot_unanswered_queries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Authenticated users can only insert (not read others' data)
CREATE POLICY "Authenticated users can insert unanswered queries"
  ON chatbot_unanswered_queries
  FOR INSERT
  WITH CHECK (true);

-- Users can read their own queries
CREATE POLICY "Users can read their own unanswered queries"
  ON chatbot_unanswered_queries
  FOR SELECT
  USING (auth.uid() = user_id);

-- 7. Permissions
GRANT ALL ON chatbot_unanswered_queries TO service_role;
GRANT SELECT, INSERT ON chatbot_unanswered_queries TO authenticated;
GRANT INSERT ON chatbot_unanswered_queries TO anon;

COMMENT ON TABLE chatbot_unanswered_queries IS 'Cevaplanamayan sorular - FAQ gelistirme ve chatbot iyilestirme icin';
COMMENT ON VIEW chatbot_common_unanswered IS 'En sik cevaplanamayan sorular - kume halinde';
