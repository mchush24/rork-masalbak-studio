-- Migration: Ensure all user_id_fk columns are nullable
-- Date: 2025-12-05
-- Reason: Consistent handling of anonymous users across all tables

-- Make user_id_fk nullable in storybooks (if not already)
ALTER TABLE storybooks
ALTER COLUMN user_id_fk DROP NOT NULL;

-- Make user_id_fk nullable in colorings (if not already)
ALTER TABLE colorings
ALTER COLUMN user_id_fk DROP NOT NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_storybooks_user_id_fk ON storybooks(user_id_fk);
CREATE INDEX IF NOT EXISTS idx_colorings_user_id_fk ON colorings(user_id_fk);

-- Add index for created_at for list queries
CREATE INDEX IF NOT EXISTS idx_storybooks_created_at ON storybooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_colorings_created_at ON colorings(created_at DESC);

-- Optional: Add comments to document the nullable behavior
COMMENT ON COLUMN storybooks.user_id_fk IS 'Foreign key to users table. NULL = anonymous user.';
COMMENT ON COLUMN colorings.user_id_fk IS 'Foreign key to users table. NULL = anonymous user.';
