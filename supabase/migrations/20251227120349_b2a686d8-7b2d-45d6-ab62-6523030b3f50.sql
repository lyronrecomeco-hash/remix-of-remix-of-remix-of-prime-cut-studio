-- Add new settings columns for overload alert and daily limit
ALTER TABLE public.shop_settings 
ADD COLUMN IF NOT EXISTS overload_alert_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS daily_appointment_limit integer DEFAULT 20;

-- Update existing rows
UPDATE public.shop_settings 
SET overload_alert_enabled = false, daily_appointment_limit = 20 
WHERE overload_alert_enabled IS NULL;