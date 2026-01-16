-- Phase 2: User Coloring Stats Table
-- Tracks coloring-specific statistics for achievements

CREATE TABLE IF NOT EXISTS user_coloring_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Completion stats
  completed_colorings INTEGER DEFAULT 0,

  -- Color usage stats
  colors_used_total INTEGER DEFAULT 0,
  colors_used_single_max INTEGER DEFAULT 0,
  colors_used_array JSONB DEFAULT '[]'::jsonb,

  -- Brush usage stats
  brush_types_used INTEGER DEFAULT 0,
  brush_types_array JSONB DEFAULT '[]'::jsonb,
  premium_brushes_used INTEGER DEFAULT 0,
  premium_brushes_array JSONB DEFAULT '[]'::jsonb,

  -- Smart features usage
  ai_suggestions_used INTEGER DEFAULT 0,
  harmony_colors_used INTEGER DEFAULT 0,
  reference_images_used INTEGER DEFAULT 0,

  -- Session stats
  coloring_time_total INTEGER DEFAULT 0, -- in minutes
  quick_colorings INTEGER DEFAULT 0,
  marathon_colorings INTEGER DEFAULT 0,

  -- Streak stats
  coloring_streak INTEGER DEFAULT 0,
  last_coloring_date DATE,

  -- Persistence
  undo_and_continue INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Create index for user lookup
CREATE INDEX IF NOT EXISTS idx_user_coloring_stats_user_id ON user_coloring_stats(user_id);

-- RLS policies
ALTER TABLE user_coloring_stats ENABLE ROW LEVEL SECURITY;

-- Users can read their own stats
CREATE POLICY "Users can view own coloring stats"
  ON user_coloring_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own stats
CREATE POLICY "Users can insert own coloring stats"
  ON user_coloring_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own stats
CREATE POLICY "Users can update own coloring stats"
  ON user_coloring_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do anything (for backend)
CREATE POLICY "Service role full access"
  ON user_coloring_stats
  USING (true)
  WITH CHECK (true);
