-- Drop the global unique constraint on event_type
ALTER TABLE public.message_templates DROP CONSTRAINT IF EXISTS message_templates_event_type_key;

-- Create a unique constraint per tenant (event_type + tenant_id)
CREATE UNIQUE INDEX IF NOT EXISTS message_templates_event_type_tenant_unique 
ON public.message_templates (event_type, tenant_id);