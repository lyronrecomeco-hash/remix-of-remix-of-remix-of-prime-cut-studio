-- Create enum for application status
CREATE TYPE public.partner_application_status AS ENUM ('pending', 'approved', 'rejected');

-- Create partner applications table
CREATE TABLE public.partner_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER NOT NULL,
    whatsapp TEXT NOT NULL,
    instagram TEXT,
    tiktok TEXT,
    status partner_application_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Enable RLS
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (public application)
CREATE POLICY "Anyone can submit application"
ON public.partner_applications
FOR INSERT
WITH CHECK (true);

-- Policy: Only super_admin can view applications
CREATE POLICY "Super admins can view applications"
ON public.partner_applications
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

-- Policy: Only super_admin can update applications
CREATE POLICY "Super admins can update applications"
ON public.partner_applications
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'));

-- Create index for faster queries
CREATE INDEX idx_partner_applications_status ON public.partner_applications(status);
CREATE INDEX idx_partner_applications_created_at ON public.partner_applications(created_at DESC);