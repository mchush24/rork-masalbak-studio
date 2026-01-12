-- MasalBak Studio - Interactive Story Migration
-- Bu SQL'i Supabase Dashboard > SQL Editor'de calistirin
-- Interaktif masal sistemi icin yeni tablolar ve sutunlar ekler

-- ==========================================
-- 1. STORYBOOKS TABLOSUNA YENI SUTUNLAR
-- ==========================================

-- Interaktif hikaye icin yeni sutunlar
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS is_interactive BOOLEAN DEFAULT FALSE;
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS story_graph JSONB;
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS total_choice_points INTEGER DEFAULT 0;

-- user_id_fk sutunu (eski user_id yerine)
-- Not: Eger users tablosu varsa foreign key ekleyin
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS user_id_fk UUID;

-- Index for interactive stories
CREATE INDEX IF NOT EXISTS idx_storybooks_is_interactive ON storybooks(is_interactive) WHERE is_interactive = true;


-- ==========================================
-- 2. INTERACTIVE_STORY_SESSIONS TABLE
-- Kullanicinin hikaye oturumunu takip eder
-- ==========================================

CREATE TABLE IF NOT EXISTS interactive_story_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_fk UUID,
  storybook_id UUID REFERENCES storybooks(id) ON DELETE CASCADE,

  -- Oturum durumu
  current_segment_id TEXT NOT NULL,
  choices_made JSONB DEFAULT '[]'::jsonb,
  path_taken TEXT[] DEFAULT '{}',

  -- Status
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Ebeveyn raporu olusturuldu mu?
  parent_report_generated BOOLEAN DEFAULT FALSE,

  -- Her kullanici icin bir hikayede tek oturum
  UNIQUE(user_id_fk, storybook_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user ON interactive_story_sessions(user_id_fk);
CREATE INDEX IF NOT EXISTS idx_sessions_storybook ON interactive_story_sessions(storybook_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON interactive_story_sessions(status);

-- Enable RLS
ALTER TABLE interactive_story_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own sessions" ON interactive_story_sessions
  FOR SELECT USING (user_id_fk::text = auth.uid()::text OR user_id_fk IS NULL);

CREATE POLICY "Users can insert own sessions" ON interactive_story_sessions
  FOR INSERT WITH CHECK (user_id_fk::text = auth.uid()::text OR user_id_fk IS NULL);

CREATE POLICY "Users can update own sessions" ON interactive_story_sessions
  FOR UPDATE USING (user_id_fk::text = auth.uid()::text OR user_id_fk IS NULL);


-- ==========================================
-- 3. CHOICE_ANALYTICS TABLE
-- Secim analizleri icin
-- ==========================================

CREATE TABLE IF NOT EXISTS choice_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES interactive_story_sessions(id) ON DELETE CASCADE,
  choice_point_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  trait TEXT NOT NULL,
  chosen_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_session ON choice_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_trait ON choice_analytics(trait);

-- Enable RLS
ALTER TABLE choice_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (session uzerinden kontrol)
CREATE POLICY "Users can read own analytics" ON choice_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interactive_story_sessions s
      WHERE s.id = choice_analytics.session_id
      AND (s.user_id_fk::text = auth.uid()::text OR s.user_id_fk IS NULL)
    )
  );

CREATE POLICY "Users can insert own analytics" ON choice_analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM interactive_story_sessions s
      WHERE s.id = choice_analytics.session_id
      AND (s.user_id_fk::text = auth.uid()::text OR s.user_id_fk IS NULL)
    )
  );


-- ==========================================
-- 4. PARENT_CHOICE_REPORTS TABLE
-- Ebeveyn raporlari icin
-- ==========================================

CREATE TABLE IF NOT EXISTS parent_choice_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES interactive_story_sessions(id) ON DELETE CASCADE,
  user_id_fk UUID,
  child_name TEXT,

  -- Analiz sonuclari
  dominant_traits JSONB NOT NULL,
  trait_insights JSONB NOT NULL,
  choice_timeline JSONB NOT NULL,

  -- Oneriler
  activity_suggestions JSONB,
  conversation_starters JSONB,

  -- Terapotik baglam (opsiyonel - sadece terapotik hikayeler icin)
  therapeutic_section JSONB,

  -- Meta
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  story_title TEXT,

  -- Her oturum icin tek rapor
  UNIQUE(session_id)
);

-- Mevcut tabloya therapeutic_section ekle (eger tablo zaten varsa)
ALTER TABLE parent_choice_reports ADD COLUMN IF NOT EXISTS therapeutic_section JSONB;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_user ON parent_choice_reports(user_id_fk);
CREATE INDEX IF NOT EXISTS idx_reports_session ON parent_choice_reports(session_id);

-- Enable RLS
ALTER TABLE parent_choice_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own reports" ON parent_choice_reports
  FOR SELECT USING (user_id_fk::text = auth.uid()::text OR user_id_fk IS NULL);

CREATE POLICY "Users can insert own reports" ON parent_choice_reports
  FOR INSERT WITH CHECK (user_id_fk::text = auth.uid()::text OR user_id_fk IS NULL);


-- ==========================================
-- 5. YARDIMCI FONKSIYONLAR
-- ==========================================

-- Interaktif hikaye istatistikleri icin view
CREATE OR REPLACE VIEW interactive_story_stats AS
SELECT
  user_id_fk,
  COUNT(DISTINCT storybook_id) as total_interactive_stories,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_stories,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_stories,
  AVG(jsonb_array_length(choices_made)) as avg_choices_per_story
FROM interactive_story_sessions
GROUP BY user_id_fk;


-- ==========================================
-- NOTLAR
-- ==========================================
--
-- 1. Bu migration'i calistirmadan once SUPABASE_SCHEMA.sql'in calistirilmis olmasi gerekir
--
-- 2. story_graph JSONB yapisi:
--    {
--      "segments": { "seg_id": { pages, endsWithChoice, ... } },
--      "choicePoints": { "choice_id": { question, options, ... } },
--      "startSegmentId": "seg_start",
--      "endingSegmentIds": ["seg_ending_0", ...],
--      "mainCharacter": { name, type, appearance, ... },
--      "totalChoicePoints": 5,
--      "mood": "adventure"
--    }
--
-- 3. choices_made JSONB yapisi:
--    [
--      { "choicePointId": "choice_1", "optionId": "opt_1_0", "trait": "empathy", "timestamp": "..." },
--      ...
--    ]
--
-- 4. dominant_traits JSONB yapisi:
--    [
--      { "trait": "empathy", "count": 3, "percentage": 60 },
--      ...
--    ]
