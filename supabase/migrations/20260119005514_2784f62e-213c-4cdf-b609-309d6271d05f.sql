-- Add custom_slug column to affiliate_template_configs for custom routes
ALTER TABLE public.affiliate_template_configs 
ADD COLUMN IF NOT EXISTS custom_slug TEXT UNIQUE;

-- Create index for faster lookups by custom_slug
CREATE INDEX IF NOT EXISTS idx_affiliate_template_configs_custom_slug 
ON public.affiliate_template_configs(custom_slug) 
WHERE custom_slug IS NOT NULL;

-- Update views_count trigger to track real views
CREATE OR REPLACE FUNCTION public.increment_template_views(p_unique_code TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.affiliate_template_configs
  SET views_count = views_count + 1,
      updated_at = now()
  WHERE unique_code = p_unique_code OR custom_slug = p_unique_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Allow public access to increment views (for tracking)
GRANT EXECUTE ON FUNCTION public.increment_template_views(TEXT) TO anon, authenticated;

-- Create RLS policy to allow public read for active portfolios
DROP POLICY IF EXISTS "Public can view active portfolios" ON public.affiliate_template_configs;
CREATE POLICY "Public can view active portfolios" 
ON public.affiliate_template_configs 
FOR SELECT 
USING (is_active = true);