-- Create table for dashboard layout configuration
CREATE TABLE public.dashboard_layouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  layout_name TEXT NOT NULL DEFAULT 'default',
  layout_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Allow public read access (everyone can see the layout)
CREATE POLICY "Anyone can view active layouts"
ON public.dashboard_layouts
FOR SELECT
USING (is_active = true);

-- Only admin email can modify
CREATE POLICY "Admin can insert layouts"
ON public.dashboard_layouts
FOR INSERT
WITH CHECK (auth.jwt() ->> 'email' = 'lyronrp@gmail.com');

CREATE POLICY "Admin can update layouts"
ON public.dashboard_layouts
FOR UPDATE
USING (auth.jwt() ->> 'email' = 'lyronrp@gmail.com');

CREATE POLICY "Admin can delete layouts"
ON public.dashboard_layouts
FOR DELETE
USING (auth.jwt() ->> 'email' = 'lyronrp@gmail.com');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dashboard_layouts_updated_at
BEFORE UPDATE ON public.dashboard_layouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();