-- Create gym_theme_settings table for storing theme customization
CREATE TABLE public.gym_theme_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID,
  primary_color TEXT NOT NULL DEFAULT '#F97316',
  secondary_color TEXT NOT NULL DEFAULT '#EA580C',
  accent_color TEXT NOT NULL DEFAULT '#FB923C',
  background_color TEXT NOT NULL DEFAULT '#09090B',
  card_color TEXT NOT NULL DEFAULT '#18181B',
  text_color TEXT NOT NULL DEFAULT '#FAFAFA',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gym_theme_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read theme settings (public facing)
CREATE POLICY "Anyone can read theme settings"
ON public.gym_theme_settings
FOR SELECT
USING (true);

-- Only authenticated users can manage theme settings
CREATE POLICY "Authenticated users can insert theme settings"
ON public.gym_theme_settings
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update theme settings"
ON public.gym_theme_settings
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_gym_theme_settings_updated_at
BEFORE UPDATE ON public.gym_theme_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();