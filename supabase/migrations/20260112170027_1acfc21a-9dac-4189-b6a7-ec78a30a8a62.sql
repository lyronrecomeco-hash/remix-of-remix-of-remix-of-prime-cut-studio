-- Fix foreign key: whatsapp_automations.instance_id must reference genesis_instances (current instances table)
ALTER TABLE public.whatsapp_automations
  DROP CONSTRAINT IF EXISTS whatsapp_automations_instance_id_fkey;

ALTER TABLE public.whatsapp_automations
  ADD CONSTRAINT whatsapp_automations_instance_id_fkey
  FOREIGN KEY (instance_id)
  REFERENCES public.genesis_instances(id)
  ON DELETE CASCADE;