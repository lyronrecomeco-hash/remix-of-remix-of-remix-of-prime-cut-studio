
-- Add custom_slug column to promo_links
ALTER TABLE public.promo_links ADD COLUMN IF NOT EXISTS custom_slug text UNIQUE;

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_promo_links_custom_slug ON public.promo_links(custom_slug) WHERE custom_slug IS NOT NULL;
