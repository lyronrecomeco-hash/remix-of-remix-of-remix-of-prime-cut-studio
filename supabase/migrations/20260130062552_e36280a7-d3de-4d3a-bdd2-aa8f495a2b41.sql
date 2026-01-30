-- Restore the triggers to protect events immutability
CREATE TRIGGER trg_block_event_delete
  BEFORE DELETE ON genesis_instance_events
  FOR EACH ROW
  EXECUTE FUNCTION genesis_block_event_delete();

CREATE TRIGGER trg_block_event_update
  BEFORE UPDATE ON genesis_instance_events
  FOR EACH ROW
  EXECUTE FUNCTION genesis_block_event_update();