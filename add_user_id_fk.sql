-- Add user_id_fk to storybooks table
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS user_id_fk UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_storybooks_user_id_fk ON storybooks(user_id_fk);

-- Add user_id_fk to colorings table
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS user_id_fk UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_colorings_user_id_fk ON colorings(user_id_fk);
