-- Migration: Analysis History System
-- Created: 2025-01-26
-- Description: Comprehensive analysis tracking and history

-- ==========================================
-- 1. ANALYSES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Relations
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Analysis details
  task_type TEXT NOT NULL CHECK (task_type IN ('DAP', 'HTP', 'Family', 'Cactus', 'Tree', 'Garden', 'BenderGestalt2', 'ReyOsterrieth', 'Aile', 'Kaktus', 'Agac', 'Bahce', 'Bender', 'Rey', 'Luscher')),
  child_age INTEGER,
  child_name TEXT,

  -- Image information
  original_image_url TEXT,
  processed_image_url TEXT,
  drawing_description TEXT,
  child_quote TEXT,

  -- Analysis results (JSONB for flexibility)
  analysis_result JSONB NOT NULL,
  -- Structure:
  -- {
  --   "meta": {...},
  --   "insights": [...],
  --   "homeTips": [...],
  --   "riskFlags": [...],
  --   "conversationGuide": {...},
  --   "traumaAssessment": {...}
  -- }

  -- AI metadata
  ai_model TEXT DEFAULT 'gpt-4-vision-preview',
  ai_confidence DECIMAL(3, 2),
  processing_time_ms INTEGER,

  -- User interaction
  favorited BOOLEAN DEFAULT false,
  notes TEXT,
  tags TEXT[],
  shared BOOLEAN DEFAULT false,

  -- Metadata
  language TEXT DEFAULT 'tr' CHECK (language IN ('tr', 'en', 'ru', 'tk', 'uz')),
  cultural_context TEXT
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_task_type ON analyses(task_type);
CREATE INDEX IF NOT EXISTS idx_analyses_favorited ON analyses(favorited) WHERE favorited = true;
CREATE INDEX IF NOT EXISTS idx_analyses_child_name ON analyses(child_name);

-- Full-text search index for notes
CREATE INDEX IF NOT EXISTS idx_analyses_notes ON analyses USING gin(to_tsvector('english', coalesce(notes, '')));

-- GIN index for tags array
CREATE INDEX IF NOT EXISTS idx_analyses_tags ON analyses USING gin(tags);

-- RLS Policies
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Users can view their own analyses
CREATE POLICY "Users can view their own analyses" ON analyses
  FOR SELECT USING (true);  -- For now, allow all (will add auth later)

-- Users can insert their own analyses
CREATE POLICY "Users can insert their own analyses" ON analyses
  FOR INSERT WITH CHECK (true);

-- Users can update their own analyses
CREATE POLICY "Users can update their own analyses" ON analyses
  FOR UPDATE USING (true);

-- Users can delete their own analyses
CREATE POLICY "Users can delete their own analyses" ON analyses
  FOR DELETE USING (true);

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- 2. HELPER VIEWS
-- ==========================================

-- View for analysis summary (useful for listings)
CREATE OR REPLACE VIEW analysis_summary AS
SELECT
  id,
  created_at,
  user_id,
  task_type,
  child_age,
  child_name,
  favorited,
  tags,
  ai_confidence,
  -- Extract summary from JSONB
  (analysis_result->'meta'->>'confidence')::decimal as meta_confidence,
  jsonb_array_length(analysis_result->'insights') as insights_count,
  jsonb_array_length(analysis_result->'homeTips') as tips_count,
  jsonb_array_length(analysis_result->'riskFlags') as risk_count
FROM analyses;


-- ==========================================
-- 3. UPDATE USERS TABLE - QUOTA TRACKING
-- ==========================================

-- Function to increment analysis quota
CREATE OR REPLACE FUNCTION increment_analysis_quota()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET quota_used = jsonb_set(
    quota_used,
    '{analyses}',
    to_jsonb(COALESCE((quota_used->>'analyses')::int, 0) + 1)
  )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment quota on analysis creation
CREATE TRIGGER increment_analysis_quota_trigger
AFTER INSERT ON analyses
FOR EACH ROW
EXECUTE FUNCTION increment_analysis_quota();


-- ==========================================
-- 4. SAMPLE DATA (for testing)
-- ==========================================

-- Uncomment to insert sample data
/*
INSERT INTO analyses (user_id, task_type, child_age, child_name, analysis_result, ai_confidence, favorited)
SELECT
  id as user_id,
  'DAP' as task_type,
  5 as child_age,
  'Test Child' as child_name,
  '{"meta": {"confidence": 0.85}, "insights": [{"title": "Test Insight"}], "homeTips": [], "riskFlags": []}'::jsonb as analysis_result,
  0.85 as ai_confidence,
  false as favorited
FROM users
LIMIT 1;
*/
