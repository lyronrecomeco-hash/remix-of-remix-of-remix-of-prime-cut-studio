-- Remove the trigger that blocks event deletion
DROP TRIGGER IF EXISTS block_event_delete ON genesis_instance_events;