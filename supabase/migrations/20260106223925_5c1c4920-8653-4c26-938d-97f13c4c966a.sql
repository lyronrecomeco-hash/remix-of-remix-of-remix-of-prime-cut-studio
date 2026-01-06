-- CLEANUP PROFUNDO: Remove todas as instâncias do usuário da@gmail.com
-- Estratégia: Dropar triggers de proteção, deletar dados, recriar triggers

-- 1. Dropar triggers de proteção com nomes corretos
DROP TRIGGER IF EXISTS trg_block_event_delete ON public.genesis_instance_events;
DROP TRIGGER IF EXISTS trg_block_event_update ON public.genesis_instance_events;

-- 2. Limpar dados vinculados (em ordem de dependência)
DELETE FROM public.whatsapp_automation_rules 
WHERE instance_id IN ('48cfea78-e9af-4ca0-8bb0-bf39a833a1ea', '01be38b6-6d00-4ee1-ac54-8aadd204be1c', '2c6aca24-3ba1-4b49-b7ee-ca2e62a391ae');

DELETE FROM public.genesis_event_logs 
WHERE instance_id IN ('48cfea78-e9af-4ca0-8bb0-bf39a833a1ea', '01be38b6-6d00-4ee1-ac54-8aadd204be1c', '2c6aca24-3ba1-4b49-b7ee-ca2e62a391ae');

DELETE FROM public.genesis_session_backups 
WHERE instance_id IN ('48cfea78-e9af-4ca0-8bb0-bf39a833a1ea', '01be38b6-6d00-4ee1-ac54-8aadd204be1c', '2c6aca24-3ba1-4b49-b7ee-ca2e62a391ae');

DELETE FROM public.genesis_instance_metrics 
WHERE instance_id IN ('48cfea78-e9af-4ca0-8bb0-bf39a833a1ea', '01be38b6-6d00-4ee1-ac54-8aadd204be1c', '2c6aca24-3ba1-4b49-b7ee-ca2e62a391ae');

DELETE FROM public.genesis_alerts 
WHERE instance_id IN ('48cfea78-e9af-4ca0-8bb0-bf39a833a1ea', '01be38b6-6d00-4ee1-ac54-8aadd204be1c', '2c6aca24-3ba1-4b49-b7ee-ca2e62a391ae');

DELETE FROM public.genesis_realtime_metrics 
WHERE instance_id IN ('48cfea78-e9af-4ca0-8bb0-bf39a833a1ea', '01be38b6-6d00-4ee1-ac54-8aadd204be1c', '2c6aca24-3ba1-4b49-b7ee-ca2e62a391ae');

DELETE FROM public.genesis_instance_failovers 
WHERE instance_id IN ('48cfea78-e9af-4ca0-8bb0-bf39a833a1ea', '01be38b6-6d00-4ee1-ac54-8aadd204be1c', '2c6aca24-3ba1-4b49-b7ee-ca2e62a391ae');

DELETE FROM public.genesis_instance_tokens 
WHERE instance_id IN ('48cfea78-e9af-4ca0-8bb0-bf39a833a1ea', '01be38b6-6d00-4ee1-ac54-8aadd204be1c', '2c6aca24-3ba1-4b49-b7ee-ca2e62a391ae');

DELETE FROM public.genesis_alert_rules 
WHERE instance_id IN ('48cfea78-e9af-4ca0-8bb0-bf39a833a1ea', '01be38b6-6d00-4ee1-ac54-8aadd204be1c', '2c6aca24-3ba1-4b49-b7ee-ca2e62a391ae');

DELETE FROM public.genesis_credit_usage 
WHERE instance_id IN ('48cfea78-e9af-4ca0-8bb0-bf39a833a1ea', '01be38b6-6d00-4ee1-ac54-8aadd204be1c', '2c6aca24-3ba1-4b49-b7ee-ca2e62a391ae');

-- 3. Agora deletar os eventos (triggers removidos)
DELETE FROM public.genesis_instance_events 
WHERE instance_id IN ('48cfea78-e9af-4ca0-8bb0-bf39a833a1ea', '01be38b6-6d00-4ee1-ac54-8aadd204be1c', '2c6aca24-3ba1-4b49-b7ee-ca2e62a391ae');

-- 4. Deletar as instâncias
DELETE FROM public.genesis_instances 
WHERE id IN ('48cfea78-e9af-4ca0-8bb0-bf39a833a1ea', '01be38b6-6d00-4ee1-ac54-8aadd204be1c', '2c6aca24-3ba1-4b49-b7ee-ca2e62a391ae');

-- 5. Recriar triggers de proteção
CREATE TRIGGER trg_block_event_delete
BEFORE DELETE ON public.genesis_instance_events
FOR EACH ROW EXECUTE FUNCTION genesis_block_event_delete();

CREATE TRIGGER trg_block_event_update
BEFORE UPDATE ON public.genesis_instance_events
FOR EACH ROW EXECUTE FUNCTION genesis_block_event_update();