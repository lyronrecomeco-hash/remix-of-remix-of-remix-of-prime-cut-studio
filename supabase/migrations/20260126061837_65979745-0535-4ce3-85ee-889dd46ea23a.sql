-- Create table for storing multiple Serper API keys with rotation support
CREATE TABLE public.genesis_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL,
  api_key_preview TEXT NOT NULL, -- Last 4 chars for display
  provider TEXT NOT NULL DEFAULT 'serper',
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0, -- Lower = higher priority
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.genesis_api_keys ENABLE ROW LEVEL SECURITY;

-- Only super_admin can manage API keys (via edge function with service role)
-- No direct access from client - all operations go through edge functions

-- Create index for efficient rotation queries
CREATE INDEX idx_genesis_api_keys_rotation ON public.genesis_api_keys (provider, is_active, usage_count, priority);

-- Create updated_at trigger
CREATE TRIGGER update_genesis_api_keys_updated_at
  BEFORE UPDATE ON public.genesis_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();