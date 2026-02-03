-- Social Feed Tables
-- Migration: 022_social_feed_tables.sql
-- Description: Creates tables for Social Feed feature (Expert Tips, Activities, Gallery, Stories)

-- ============================================
-- 1. Expert Tips Table
-- ============================================
CREATE TABLE IF NOT EXISTS expert_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  source TEXT,
  source_title TEXT, -- e.g., "Çocuk Psikoloğu", "Pedagog"
  category TEXT NOT NULL CHECK (category IN ('development', 'creativity', 'emotions', 'behavior', 'communication')),
  is_featured BOOLEAN DEFAULT false,
  display_date DATE,
  icon TEXT DEFAULT 'lightbulb', -- lucide icon name
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. Activity Suggestions Table
-- ============================================
CREATE TABLE IF NOT EXISTS activity_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT, -- '15 dk', '30 dk'
  category TEXT NOT NULL CHECK (category IN ('coloring', 'story', 'game', 'outdoor', 'creative', 'mindfulness')),
  age_min INTEGER DEFAULT 3,
  age_max INTEGER DEFAULT 12,
  icon TEXT DEFAULT 'palette', -- lucide icon name
  action_url TEXT, -- deep link to activity
  gradient_colors TEXT[] DEFAULT ARRAY['#E8F5E9', '#C8E6C9'],
  is_daily BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. Community Gallery Table
-- ============================================
CREATE TABLE IF NOT EXISTS community_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  child_age INTEGER CHECK (child_age >= 1 AND child_age <= 18),
  theme TEXT CHECK (theme IN ('family', 'nature', 'animals', 'fantasy', 'emotions', 'seasons', 'holidays', 'other')),
  content_type TEXT NOT NULL CHECK (content_type IN ('coloring', 'drawing', 'story_illustration')),
  likes_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  moderator_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. Gallery Likes Table (for tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS gallery_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES community_gallery(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gallery_id, user_id)
);

-- ============================================
-- 5. Success Stories Table
-- ============================================
CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  child_age INTEGER CHECK (child_age >= 1 AND child_age <= 18),
  author_type TEXT DEFAULT 'parent' CHECK (author_type IN ('parent', 'teacher', 'therapist', 'caregiver')),
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  likes_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  moderator_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 6. Story Likes Table (for tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS story_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES success_stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_expert_tips_category ON expert_tips(category);
CREATE INDEX IF NOT EXISTS idx_expert_tips_featured ON expert_tips(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_expert_tips_display_date ON expert_tips(display_date);

CREATE INDEX IF NOT EXISTS idx_activity_suggestions_category ON activity_suggestions(category);
CREATE INDEX IF NOT EXISTS idx_activity_suggestions_daily ON activity_suggestions(is_daily) WHERE is_daily = true;
CREATE INDEX IF NOT EXISTS idx_activity_suggestions_age ON activity_suggestions(age_min, age_max);

CREATE INDEX IF NOT EXISTS idx_community_gallery_approved ON community_gallery(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_community_gallery_theme ON community_gallery(theme);
CREATE INDEX IF NOT EXISTS idx_community_gallery_content_type ON community_gallery(content_type);
CREATE INDEX IF NOT EXISTS idx_community_gallery_created ON community_gallery(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gallery_likes_gallery ON gallery_likes(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_likes_user ON gallery_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_success_stories_approved ON success_stories(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_success_stories_featured ON success_stories(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_success_stories_created ON success_stories(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_story_likes_story ON story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_user ON story_likes(user_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE expert_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can read expert tips" ON expert_tips
  FOR SELECT USING (true);

CREATE POLICY "Public can read activity suggestions" ON activity_suggestions
  FOR SELECT USING (true);

CREATE POLICY "Public can read approved gallery items" ON community_gallery
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Public can read approved stories" ON success_stories
  FOR SELECT USING (is_approved = true);

-- Users can submit their own content
CREATE POLICY "Authenticated users can insert gallery items" ON community_gallery
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert stories" ON success_stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own submissions (even if not approved)
CREATE POLICY "Users can view own gallery submissions" ON community_gallery
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own story submissions" ON success_stories
  FOR SELECT USING (auth.uid() = user_id);

-- Like management
CREATE POLICY "Authenticated users can like gallery items" ON gallery_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own gallery likes" ON gallery_likes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view gallery likes" ON gallery_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like stories" ON story_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own story likes" ON story_likes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view story likes" ON story_likes
  FOR SELECT USING (true);

-- ============================================
-- Functions for like count management
-- ============================================
CREATE OR REPLACE FUNCTION update_gallery_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_gallery SET likes_count = likes_count + 1 WHERE id = NEW.gallery_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_gallery SET likes_count = likes_count - 1 WHERE id = OLD.gallery_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_story_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE success_stories SET likes_count = likes_count + 1 WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE success_stories SET likes_count = likes_count - 1 WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Triggers for automatic like count updates
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_gallery_likes ON gallery_likes;
CREATE TRIGGER trigger_update_gallery_likes
  AFTER INSERT OR DELETE ON gallery_likes
  FOR EACH ROW EXECUTE FUNCTION update_gallery_likes_count();

DROP TRIGGER IF EXISTS trigger_update_story_likes ON story_likes;
CREATE TRIGGER trigger_update_story_likes
  AFTER INSERT OR DELETE ON story_likes
  FOR EACH ROW EXECUTE FUNCTION update_story_likes_count();

-- ============================================
-- Seed Data: Expert Tips (Turkish)
-- ============================================
INSERT INTO expert_tips (content, source, source_title, category, is_featured, icon) VALUES
('Çocuğunuzun çizimlerinde kullandığı renkler, o anki duygusal durumunu yansıtabilir. Parlak renkler genellikle mutluluğu, koyu tonlar ise düşünceli bir ruh halini gösterir.', 'Dr. Ayşe Yılmaz', 'Çocuk Psikoloğu', 'emotions', true, 'palette'),
('Çocuklar çizerken kendilerini ifade ederler. Eleştirmek yerine "Bana bu çizimi anlatır mısın?" diye sorun.', 'Prof. Mehmet Kaya', 'Pedagog', 'communication', false, 'message-circle'),
('Yaratıcılığı desteklemek için çocuğunuza farklı malzemeler sunun: boya kalemleri, pastel boyalar, parmak boyaları...', 'Zeynep Demir', 'Sanat Terapisti', 'creativity', false, 'brush'),
('Çizim sırasında müzik çalmak, çocukların odaklanmasını ve yaratıcılığını artırabilir.', 'Dr. Can Özkan', 'Gelişim Psikoloğu', 'creativity', false, 'music'),
('Çocuğunuzun çizdiği aile resimlerindeki figür boyutları, aile içi ilişkileri hakkında ipuçları verebilir.', 'Prof. Elif Arslan', 'Çocuk Psikiyatristi', 'development', true, 'users'),
('Düzenli boyama aktiviteleri, çocukların ince motor becerilerini geliştirmesine yardımcı olur.', 'Uzm. Psk. Deniz Yıldız', 'Çocuk Psikoloğu', 'development', false, 'hand'),
('Çocuğunuzla birlikte boyama yapmak, kaliteli zaman geçirmenin harika bir yoludur.', 'Dr. Selin Koç', 'Aile Danışmanı', 'communication', false, 'heart'),
('Çocukların korkularını çizmelerine izin vermek, onların bu duygularla başa çıkmalarına yardımcı olabilir.', 'Prof. Ahmet Şahin', 'Klinik Psikolog', 'emotions', true, 'shield')
ON CONFLICT DO NOTHING;

-- ============================================
-- Seed Data: Activity Suggestions (Turkish)
-- ============================================
INSERT INTO activity_suggestions (title, description, duration, category, age_min, age_max, icon, action_url, gradient_colors, is_daily, display_order) VALUES
('Duygular Boyama', 'Bugün nasıl hissediyorsun? Duygunu bir renk seç ve boya!', '15 dk', 'coloring', 3, 8, 'heart', '/(tabs)/coloring-history', ARRAY['#FCE4EC', '#F8BBD0'], true, 1),
('Hayaller Ülkesi', 'Kendi hayal ülkeni çiz! Orada neler var?', '20 dk', 'creative', 4, 10, 'cloud', '/(tabs)/hayal-atolyesi', ARRAY['#E3F2FD', '#BBDEFB'], true, 2),
('Doğa Keşfi', 'Dışarı çık ve gördüğün bir çiçeği çiz!', '30 dk', 'outdoor', 5, 12, 'flower', null, ARRAY['#E8F5E9', '#C8E6C9'], false, 3),
('Hikaye Zamanı', 'Bugünün interaktif hikayesini keşfet!', '10 dk', 'story', 3, 7, 'book-open', '/(tabs)/stories', ARRAY['#FFF3E0', '#FFE0B2'], true, 4),
('Mandala Boyama', 'Sakinleştirici mandala desenleri ile rahatlayın.', '20 dk', 'mindfulness', 6, 12, 'target', '/(tabs)/coloring-history', ARRAY['#F3E5F5', '#E1BEE7'], false, 5),
('Aile Portresi', 'Aileni çiz ve her birinin en sevdiği şeyi ekle!', '25 dk', 'creative', 4, 10, 'users', '/(tabs)/coloring-history', ARRAY['#FFEBEE', '#FFCDD2'], false, 6),
('Müzikli Boyama', 'Müzik dinleyerek serbest çizim yap!', '15 dk', 'creative', 3, 12, 'music', '/(tabs)/coloring-history', ARRAY['#E8EAF6', '#C5CAE9'], false, 7),
('Duygu Günlüğü', 'Bu haftanın duygularını çizerek kaydet.', '15 dk', 'mindfulness', 5, 12, 'book', null, ARRAY['#E0F7FA', '#B2EBF2'], false, 8)
ON CONFLICT DO NOTHING;

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trigger_expert_tips_updated ON expert_tips;
CREATE TRIGGER trigger_expert_tips_updated
  BEFORE UPDATE ON expert_tips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_activity_suggestions_updated ON activity_suggestions;
CREATE TRIGGER trigger_activity_suggestions_updated
  BEFORE UPDATE ON activity_suggestions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_community_gallery_updated ON community_gallery;
CREATE TRIGGER trigger_community_gallery_updated
  BEFORE UPDATE ON community_gallery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_success_stories_updated ON success_stories;
CREATE TRIGGER trigger_success_stories_updated
  BEFORE UPDATE ON success_stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
