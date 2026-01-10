-- Create table for Genesis verification codes
CREATE TABLE IF NOT EXISTS public.genesis_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  code TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_genesis_verification_phone ON public.genesis_verification_codes(phone);

-- Enable RLS
ALTER TABLE public.genesis_verification_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access (edge functions use service role)
CREATE POLICY "Service role only" ON public.genesis_verification_codes
  FOR ALL USING (false);

-- Auto-cleanup old codes (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_old_genesis_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.genesis_verification_codes 
  WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;