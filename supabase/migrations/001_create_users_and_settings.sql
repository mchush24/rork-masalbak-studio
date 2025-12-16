-- Migration: User Profile Management
-- Created: 2025-01-26
-- Description: Extended users table with profile, children, preferences, and settings

-- ==========================================
-- 1. USERS TABLE (Extended)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Auth bilgileri (Şimdilik email-based, sonra Supabase Auth entegrasyonu)
  email TEXT UNIQUE NOT NULL,
  auth_user_id UUID, -- Future: REFERENCES auth.users(id) ON DELETE CASCADE

  -- Profil bilgileri
  name TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'tr' CHECK (language IN ('tr', 'en', 'de', 'ar')),

  -- Çocuk bilgileri (birden fazla çocuk için JSONB)
  children JSONB DEFAULT '[]'::jsonb,
  -- Örnek: [{"name": "Ali", "age": 5, "birthDate": "2019-01-15"}]

  -- Kullanıcı tercihleri
  preferences JSONB DEFAULT '{}'::jsonb,
  -- Örnek: {"theme": "light", "notifications": true, "autoSave": true}

  -- Abonelik bilgileri
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,

  -- Kullanım kotaları
  quota_used JSONB DEFAULT '{"analyses": 0, "storybooks": 0, "colorings": 0}'::jsonb,
  quota_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '1 month'),

  -- Metadata
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier, subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow all users to read their own profile (for now, no auth)
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (true);

-- Allow users to insert their profile
CREATE POLICY "Users can insert their profile" ON users
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (true);


-- ==========================================
-- 2. USER_SETTINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Genel ayarlar
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'tr' CHECK (language IN ('tr', 'en', 'de', 'ar')),

  -- Bildirim tercihleri
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,

  -- Gizlilik ayarları
  profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private')),
  data_sharing_consent BOOLEAN DEFAULT false,
  analytics_consent BOOLEAN DEFAULT true,

  -- Uygulama davranışları
  auto_save BOOLEAN DEFAULT true,
  show_tips BOOLEAN DEFAULT true,
  child_lock_enabled BOOLEAN DEFAULT false,

  -- Özel ayarlar (JSONB for extensibility)
  custom_settings JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR ALL USING (true);


-- ==========================================
-- 3. UPDATE STORYBOOKS TABLE
-- ==========================================
-- Add user_id foreign key reference
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS user_id_fk UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add new columns
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS favorited BOOLEAN DEFAULT false;
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS shared BOOLEAN DEFAULT false;
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'tr';
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS source_drawing_url TEXT;
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_storybooks_user_id_fk ON storybooks(user_id_fk);
CREATE INDEX IF NOT EXISTS idx_storybooks_favorited ON storybooks(favorited) WHERE favorited = true;
CREATE INDEX IF NOT EXISTS idx_storybooks_language ON storybooks(language);


-- ==========================================
-- 4. UPDATE COLORINGS TABLE
-- ==========================================
-- Add user_id foreign key reference
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS user_id_fk UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add new columns
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS favorited BOOLEAN DEFAULT false;
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS original_drawing_url TEXT;
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS coloring_image_url TEXT;
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS style TEXT DEFAULT 'simple' CHECK (style IN ('simple', 'detailed', 'educational'));
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS age_group INTEGER;
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS completion_time_seconds INTEGER;
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_colorings_user_id_fk ON colorings(user_id_fk);
CREATE INDEX IF NOT EXISTS idx_colorings_favorited ON colorings(favorited) WHERE favorited = true;
CREATE INDEX IF NOT EXISTS idx_colorings_style ON colorings(style);


-- ==========================================
-- 5. HELPER FUNCTIONS
-- ==========================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storybooks_updated_at BEFORE UPDATE ON storybooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colorings_updated_at BEFORE UPDATE ON colorings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- 6. INITIAL DATA (Optional)
-- ==========================================

-- You can add seed data here if needed
-- Example:
-- INSERT INTO users (email, name, onboarding_completed)
-- VALUES ('test@example.com', 'Test User', true);
