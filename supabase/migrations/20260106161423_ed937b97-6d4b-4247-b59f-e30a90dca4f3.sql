-- Adicionar transição que estava faltando na máquina de estados
-- Permite que o heartbeat/VPS marque instância como connected diretamente
INSERT INTO genesis_instance_state_transitions (from_state, to_state) VALUES
  ('disconnected', 'connected'),      -- Backend reporta conexão direta
  ('disconnected', 'stabilizing'),    -- Backend está estabilizando
  ('connecting', 'qr_pending'),       -- Garantir que existe
  ('stabilizing', 'qr_pending')       -- Fallback se QR expirar durante stabilizing
ON CONFLICT DO NOTHING;