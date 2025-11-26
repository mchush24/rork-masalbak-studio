-- MasalBak Studio - Supabase Database Schema
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın

-- ==========================================
-- 1. STORYBOOKS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS storybooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NULL,  -- nullable, anonim kullanıcılar için
  title TEXT NOT NULL,
  pages JSONB NOT NULL,  -- [{ text: string, imageUrl: string }, ...]
  pdf_url TEXT NULL,
  voice_urls TEXT[] NULL  -- array of audio URLs
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_storybooks_user_id ON storybooks(user_id);
CREATE INDEX IF NOT EXISTS idx_storybooks_created_at ON storybooks(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE storybooks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read, insert, update their own storybooks
CREATE POLICY "Enable read access for all users" ON storybooks
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON storybooks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for users based on user_id" ON storybooks
  FOR UPDATE USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Enable delete for users based on user_id" ON storybooks
  FOR DELETE USING (auth.uid()::text = user_id::text OR user_id IS NULL);


-- ==========================================
-- 2. COLORINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS colorings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NULL,  -- nullable, anonim kullanıcılar için
  title TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  page_count INTEGER NOT NULL DEFAULT 1
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_colorings_user_id ON colorings(user_id);
CREATE INDEX IF NOT EXISTS idx_colorings_created_at ON colorings(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE colorings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read, insert, update their own colorings
CREATE POLICY "Enable read access for all users" ON colorings
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON colorings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for users based on user_id" ON colorings
  FOR UPDATE USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Enable delete for users based on user_id" ON colorings
  FOR DELETE USING (auth.uid()::text = user_id::text OR user_id IS NULL);


-- ==========================================
-- 3. STORAGE BUCKET (masalbak)
-- ==========================================
-- Supabase Dashboard > Storage'da manuel olarak "masalbak" bucket'ı oluşturun
-- Public bucket olarak ayarlayın (herkes okuyabilsin)

-- NOTLAR:
-- - user_id NULL olabilir çünkü anonim kullanıcılar da içerik oluşturabilir
-- - RLS politikaları herkesin okuma ve yazma yapmasına izin verir
-- - Gelecekte auth eklendiğinde user_id doldurulabilir
-- - pages JSONB tipinde, esnek yapı için
-- - voice_urls TEXT[] tipinde, birden fazla ses dosyası için
