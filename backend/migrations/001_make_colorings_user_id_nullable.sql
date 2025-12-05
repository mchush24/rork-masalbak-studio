-- Migration: Make user_id_fk nullable in colorings table
-- Date: 2025-12-05
-- Reason: Allow anonymous users to create colorings during development/testing

-- Make user_id_fk nullable to allow anonymous usage
ALTER TABLE colorings
ALTER COLUMN user_id_fk DROP NOT NULL;

-- Optional: Add an index for better query performance on user_id_fk
CREATE INDEX IF NOT EXISTS idx_colorings_user_id_fk ON colorings(user_id_fk);

-- Note: If you want to enforce user authentication later, you can:
-- 1. Migrate anonymous records to a default user
-- 2. Re-add the NOT NULL constraint with:
--    ALTER TABLE colorings ALTER COLUMN user_id_fk SET NOT NULL;
