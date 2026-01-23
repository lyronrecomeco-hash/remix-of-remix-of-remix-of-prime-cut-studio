-- Add new fields to affiliate_template_configs for library features
ALTER TABLE public.affiliate_template_configs
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'lovable',
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS last_prompt TEXT,
  ADD COLUMN IF NOT EXISTS evolution_history JSONB DEFAULT '[]'::jsonb;

-- Create project_evolutions table for tracking evolution history
CREATE TABLE public.project_evolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.affiliate_template_configs(id) ON DELETE CASCADE,
  evolution_type TEXT NOT NULL,
  prompt_generated TEXT NOT NULL,
  answers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_evolutions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_evolutions
CREATE POLICY "Users can view their project evolutions"
ON public.project_evolutions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.affiliate_template_configs atc
    JOIN public.affiliates a ON atc.affiliate_id = a.id
    WHERE atc.id = project_evolutions.project_id
    AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their project evolutions"
ON public.project_evolutions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.affiliate_template_configs atc
    JOIN public.affiliates a ON atc.affiliate_id = a.id
    WHERE atc.id = project_evolutions.project_id
    AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their project evolutions"
ON public.project_evolutions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.affiliate_template_configs atc
    JOIN public.affiliates a ON atc.affiliate_id = a.id
    WHERE atc.id = project_evolutions.project_id
    AND a.user_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX idx_project_evolutions_project_id ON public.project_evolutions(project_id);
CREATE INDEX idx_project_evolutions_created_at ON public.project_evolutions(created_at DESC);