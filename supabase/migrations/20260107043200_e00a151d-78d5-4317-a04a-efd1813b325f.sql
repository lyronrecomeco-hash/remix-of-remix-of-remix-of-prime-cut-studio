-- Seed da máquina de estados do Genesis (FASE 7)
-- Corrige cenário onde a tabela de transições está vazia e toda transição vira "Invalid transition".
-- Idempotente via PK (from_state,to_state) + ON CONFLICT DO NOTHING.

INSERT INTO public.genesis_instance_state_transitions (from_state, to_state)
VALUES
  -- De idle
  ('idle', 'connecting'),
  ('idle', 'error'),

  -- De connecting
  ('connecting', 'qr_pending'),
  ('connecting', 'stabilizing'),
  ('connecting', 'connected'),
  ('connecting', 'error'),
  ('connecting', 'disconnected'),
  ('connecting', 'idle'),

  -- De qr_pending
  ('qr_pending', 'connected'),
  ('qr_pending', 'stabilizing'),
  ('qr_pending', 'error'),
  ('qr_pending', 'disconnected'),
  ('qr_pending', 'idle'),
  ('qr_pending', 'connecting'),

  -- De stabilizing
  ('stabilizing', 'connected'),
  ('stabilizing', 'error'),
  ('stabilizing', 'disconnected'),
  ('stabilizing', 'qr_pending'),

  -- De connected
  ('connected', 'disconnected'),
  ('connected', 'error'),
  ('connected', 'idle'),
  ('connected', 'connecting'),
  ('connected', 'stabilizing'),

  -- De disconnected
  ('disconnected', 'connecting'),
  ('disconnected', 'idle'),
  ('disconnected', 'error'),
  ('disconnected', 'qr_pending'),

  -- De error
  ('error', 'idle'),
  ('error', 'connecting'),
  ('error', 'disconnected'),
  ('error', 'qr_pending'),
  ('error', 'connected')
ON CONFLICT (from_state, to_state) DO NOTHING;