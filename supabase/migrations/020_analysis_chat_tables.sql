-- Migration: Analysis Chat & Notes System
-- Created: 2026-01-30
-- Description: Tables for analysis chat conversations and parent notes

-- ==========================================
-- 1. ANALYSIS_CONVERSATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS analysis_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Relations
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Conversation data
  messages JSONB DEFAULT '[]',
  -- Structure:
  -- [
  --   {
  --     "id": "uuid",
  --     "role": "user" | "assistant",
  --     "content": "message text",
  --     "timestamp": "ISO date",
  --     "referenced_insight_index": 0 (optional),
  --     "metadata": {} (optional)
  --   }
  -- ]

  -- Tracking
  prompts_completed TEXT[] DEFAULT '{}',
  session_count INTEGER DEFAULT 1,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Context
  child_age INTEGER,
  child_name TEXT,
  language TEXT DEFAULT 'tr' CHECK (language IN ('tr', 'en', 'ru', 'tk', 'uz'))
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analysis_conversations_analysis_id ON analysis_conversations(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_conversations_user_id ON analysis_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_conversations_created_at ON analysis_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_conversations_last_message ON analysis_conversations(last_message_at DESC);

-- RLS Policies
ALTER TABLE analysis_conversations ENABLE ROW LEVEL SECURITY;

-- Secure policies using get_current_user_id function
CREATE POLICY "analysis_conversations_select_own" ON analysis_conversations
  FOR SELECT
  USING (user_id::text = get_current_user_id());

CREATE POLICY "analysis_conversations_insert_own" ON analysis_conversations
  FOR INSERT
  WITH CHECK (user_id::text = get_current_user_id());

CREATE POLICY "analysis_conversations_update_own" ON analysis_conversations
  FOR UPDATE
  USING (user_id::text = get_current_user_id());

CREATE POLICY "analysis_conversations_delete_own" ON analysis_conversations
  FOR DELETE
  USING (user_id::text = get_current_user_id());

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_analysis_conversations_updated_at
  BEFORE UPDATE ON analysis_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- 2. ANALYSIS_NOTES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS analysis_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Relations
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Note content
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'observation', 'question', 'follow_up', 'milestone')),

  -- Organization
  tags TEXT[] DEFAULT '{}',
  referenced_insight_index INTEGER,

  -- Professional sharing
  is_shared_with_professional BOOLEAN DEFAULT false,
  shared_at TIMESTAMP WITH TIME ZONE,

  -- Pinned notes appear at top
  is_pinned BOOLEAN DEFAULT false
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analysis_notes_analysis_id ON analysis_notes(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_notes_user_id ON analysis_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_notes_created_at ON analysis_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_notes_note_type ON analysis_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_analysis_notes_pinned ON analysis_notes(is_pinned) WHERE is_pinned = true;

-- GIN index for tags array
CREATE INDEX IF NOT EXISTS idx_analysis_notes_tags ON analysis_notes USING gin(tags);

-- Full-text search index for content
CREATE INDEX IF NOT EXISTS idx_analysis_notes_content ON analysis_notes USING gin(to_tsvector('simple', coalesce(content, '')));

-- RLS Policies
ALTER TABLE analysis_notes ENABLE ROW LEVEL SECURITY;

-- Secure policies using get_current_user_id function
CREATE POLICY "analysis_notes_select_own" ON analysis_notes
  FOR SELECT
  USING (user_id::text = get_current_user_id());

CREATE POLICY "analysis_notes_insert_own" ON analysis_notes
  FOR INSERT
  WITH CHECK (user_id::text = get_current_user_id());

CREATE POLICY "analysis_notes_update_own" ON analysis_notes
  FOR UPDATE
  USING (user_id::text = get_current_user_id());

CREATE POLICY "analysis_notes_delete_own" ON analysis_notes
  FOR DELETE
  USING (user_id::text = get_current_user_id());

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_analysis_notes_updated_at
  BEFORE UPDATE ON analysis_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- 3. HELPER VIEWS
-- ==========================================

-- View for conversation summary (useful for listings)
CREATE OR REPLACE VIEW analysis_conversation_summary AS
SELECT
  ac.id,
  ac.analysis_id,
  ac.user_id,
  ac.created_at,
  ac.updated_at,
  ac.session_count,
  ac.last_message_at,
  ac.child_name,
  jsonb_array_length(ac.messages) as message_count,
  array_length(ac.prompts_completed, 1) as prompts_completed_count,
  a.task_type,
  a.child_age as analysis_child_age
FROM analysis_conversations ac
LEFT JOIN analyses a ON ac.analysis_id = a.id;

-- View for notes with analysis context
CREATE OR REPLACE VIEW analysis_notes_with_context AS
SELECT
  an.id,
  an.analysis_id,
  an.user_id,
  an.content,
  an.note_type,
  an.tags,
  an.referenced_insight_index,
  an.is_shared_with_professional,
  an.is_pinned,
  an.created_at,
  an.updated_at,
  a.task_type,
  a.child_name,
  a.child_age
FROM analysis_notes an
LEFT JOIN analyses a ON an.analysis_id = a.id;


-- ==========================================
-- 4. UTILITY FUNCTIONS
-- ==========================================

-- Function to add a message to conversation
CREATE OR REPLACE FUNCTION add_conversation_message(
  p_conversation_id UUID,
  p_role TEXT,
  p_content TEXT,
  p_referenced_insight_index INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  new_message JSONB;
  updated_messages JSONB;
BEGIN
  -- Create new message object
  new_message := jsonb_build_object(
    'id', gen_random_uuid(),
    'role', p_role,
    'content', p_content,
    'timestamp', now(),
    'referenced_insight_index', p_referenced_insight_index
  );

  -- Get current messages and append new one
  SELECT messages || new_message INTO updated_messages
  FROM analysis_conversations
  WHERE id = p_conversation_id;

  -- Update conversation
  UPDATE analysis_conversations
  SET
    messages = updated_messages,
    last_message_at = now(),
    session_count = session_count + CASE WHEN (now() - last_message_at) > interval '30 minutes' THEN 1 ELSE 0 END
  WHERE id = p_conversation_id;

  RETURN new_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 5. NOTES
-- ==========================================

/*
USAGE NOTES:

1. Conversations are tied to specific analyses
2. Messages are stored as JSONB array for flexibility
3. Session count tracks conversation continuity (new session after 30 min gap)
4. prompts_completed tracks which reflection prompts user has answered
5. Notes can be organized by type and tags
6. Notes can be shared with professionals (therapists, psychologists)
7. Full-text search available on note content

SECURITY:
- RLS enabled on both tables
- Uses get_current_user_id() for context-based security
- CASCADE delete ensures cleanup when analysis is deleted
*/
