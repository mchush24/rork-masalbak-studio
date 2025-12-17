-- Migration: Update Language Options
-- Created: 2025-01-26
-- Description: Update language options to tr, en, de, ru (remove ar)

-- ==========================================
-- 1. UPDATE USERS TABLE LANGUAGE CHECK
-- ==========================================
-- Drop old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_language_check;

-- Add new constraint with updated languages
ALTER TABLE users ADD CONSTRAINT users_language_check
  CHECK (language IN ('tr', 'en', 'de', 'ru'));

-- Update any existing invalid language values to 'tr' (default)
UPDATE users SET language = 'tr'
WHERE language NOT IN ('tr', 'en', 'de', 'ru');


-- ==========================================
-- 2. UPDATE USER_SETTINGS TABLE LANGUAGE CHECK
-- ==========================================
-- Drop old constraint
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_language_check;

-- Add new constraint with updated languages
ALTER TABLE user_settings ADD CONSTRAINT user_settings_language_check
  CHECK (language IN ('tr', 'en', 'de', 'ru'));

-- Update any existing invalid language values to 'tr' (default)
UPDATE user_settings SET language = 'tr'
WHERE language NOT IN ('tr', 'en', 'de', 'ru');
