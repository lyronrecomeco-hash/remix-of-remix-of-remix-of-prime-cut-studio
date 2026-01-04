
-- FASE 12 PREP: Corrigir transições de estado faltantes

-- Adicionar transições que faltam para garantir fluxo correto
INSERT INTO genesis_instance_state_transitions (from_state, to_state) VALUES
  ('idle', 'qr_pending'),           -- Caso QR seja gerado diretamente
  ('idle', 'disconnected'),         -- Heartbeat pode reportar disconnected
  ('qr_pending', 'connected'),      -- Conexão direta sem stabilizing
  ('qr_pending', 'disconnected'),   -- Timeout/cancelamento
  ('connecting', 'connected'),      -- Conexão direta rápida
  ('connecting', 'disconnected'),   -- Falha ao conectar
  ('stabilizing', 'disconnected'),  -- Falha durante estabilização
  ('connected', 'connecting'),      -- Reconexão sem passar por disconnected
  ('disconnected', 'qr_pending'),   -- Novo QR gerado diretamente
  ('disconnected', 'idle'),         -- Reset para idle
  ('error', 'idle'),                -- Reset após erro
  ('error', 'qr_pending'),          -- Retry direto com QR
  ('error', 'disconnected')         -- Transição para disconnected
ON CONFLICT DO NOTHING;

-- Garantir que todas as transições "circular" existam para maior flexibilidade
INSERT INTO genesis_instance_state_transitions (from_state, to_state) VALUES
  ('qr_pending', 'connecting'),     -- Pode voltar a connecting
  ('stabilizing', 'connecting'),    -- Retry de conexão
  ('stabilizing', 'qr_pending'),    -- Voltar para QR
  ('connected', 'qr_pending'),      -- Reconexão com novo QR
  ('connected', 'stabilizing'),     -- Re-estabilização
  ('connected', 'idle')             -- Reset completo
ON CONFLICT DO NOTHING;
