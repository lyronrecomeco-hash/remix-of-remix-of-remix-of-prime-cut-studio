-- Add missing columns to gym_classes
ALTER TABLE public.gym_classes ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'geral';