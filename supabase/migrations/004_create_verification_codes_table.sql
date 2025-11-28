-- Create verification_codes table for email verification
CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);

-- Add RLS policies
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for verification codes (they expire in 10 minutes anyway)
CREATE POLICY "Allow public insert" ON verification_codes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public select" ON verification_codes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public delete" ON verification_codes FOR DELETE TO anon, authenticated USING (true);

-- Optional: Create a function to clean up expired codes (can be run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_codes WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
