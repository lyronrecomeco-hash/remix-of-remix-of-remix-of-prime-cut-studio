-- Drop the correct trigger
DROP TRIGGER IF EXISTS trg_block_event_delete ON genesis_instance_events;
DROP TRIGGER IF EXISTS trg_block_event_update ON genesis_instance_events;