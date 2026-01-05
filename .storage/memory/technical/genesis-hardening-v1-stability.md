# Memory: technical/genesis-hardening-v1-stability
Updated: just now

## Sistema de Hardening WhatsApp Genesis v8.1

O sistema de hardening implementa proteções de estabilidade, anti-loop, anti-ban e resiliência sem modificar a lógica de negócio ou UX.

### 1. Hardening de Conexão (Anti-Loop)

**VPS Script v8.1:**
- `calculateBackoffDelay()`: Backoff exponencial com jitter (±30%)
- `RECONNECT_BASE_DELAY`: 8s base, max 5 minutos
- `RECONNECT_MAX_ATTEMPTS`: 5 tentativas antes de cooldown de 10 minutos
- `isInCooldown()`: Verifica e respeita períodos de cooldown
- Reconexão automática desativada após logout (aceita QR como ciclo normal)

**Frontend Hook:**
- `connectAttemptsRef`: Contador de tentativas por sessão
- `cooldownUntilRef`: Timestamp de fim do cooldown
- `MAX_CONNECT_ATTEMPTS`: 5 tentativas → cooldown de 2 minutos
- `MIN_OPERATION_INTERVAL`: 2s mínimo entre operações

### 2. Proteção de Sessão (Anti-Ban)

**Rate Limiting de Mensagens:**
- `MSG_LIMIT_PER_MINUTE`: 20 msgs/min
- `MSG_LIMIT_PER_HOUR`: 200 msgs/hora
- `MSG_LIMIT_PER_DAY`: 1000 msgs/dia
- `MSG_MIN_INTERVAL`: 1.5s mínimo entre mensagens
- `MSG_COOLDOWN_AFTER_BURST`: 30s após burst

**Detecção de Degradação:**
- `DEGRADATION_THRESHOLD_FAILURES`: 3 falhas consecutivas = modo degradado
- `DEGRADATION_SLOW_MODE_FACTOR`: 3x mais lento em degradação
- `checkSessionDegradation()`: Detecta e ativa modo lento automaticamente

### 3. Heartbeat Inteligente

**Configuração:**
- `HEARTBEAT_BASE_INTERVAL`: 25s (não fixo)
- `HEARTBEAT_JITTER_MAX`: até +8s (total 25-33s)
- `HEARTBEAT_DEGRADED_MULTIPLIER`: 1.5x mais lento em degradação

**Implementação:**
- `getHeartbeatInterval()`: Calcula intervalo dinâmico
- `startHeartbeat()`: Usa setTimeout recursivo (não setInterval) para variar a cada ciclo
- Padrão humanizado, não detectável como robô

### 4. Session Health Check

**Verificação Periódica:**
- `SESSION_HEALTH_CHECK_INTERVAL`: 60s
- `startSessionHealthCheck()`: Testa sessão com operação leve
- Detecta degradação antes da queda real
- Ativa pausa silenciosa automaticamente

### 5. Pausas Silenciosas

**Configuração:**
- `SILENT_PAUSE_ENABLED`: true
- `SILENT_PAUSE_DURATION`: 30s
- `triggerSilentPause()`: Ativa pausa manualmente
- Invisível ao cliente, bloqueia envios temporariamente

### 6. Estabilização Pós-Conexão

**Delay Aumentado:**
- `STABILIZATION_DELAY`: 5s (era 3s)
- `SOCKET_WARMUP_DELAY`: 2s warmup antes de marcar ready
- Warmup: operação leve (fetchStatus) para estabilizar socket

### 7. Limites Operacionais

**API Rate Limit:**
- `RATE_LIMIT_MAX`: 60 req/min (era 100)
- `RATE_LIMIT_BURST`: 10 simultâneos

**Status Exposto:**
- `/api/instance/:id/status` agora retorna:
  - `degraded`, `inCooldown`, `cooldownRemaining`
  - `messagesThisMinute`, `messagesThisHour`, `messagesToday`
  - `sessionHealthy`

### Arquivos Modificados

- `src/components/genesis/scripts/vps-script-v8.ts` - CONFIG expandido, InstanceManager hardened
- `src/components/genesis/hooks/useGenesisWhatsAppConnection.ts` - HARDENING object, anti-loop

### Comportamento Resultante

✓ Menos reconexões desnecessárias  
✓ Sem loops de reconexão  
✓ QR aceito como ciclo normal  
✓ Proteção automática contra burst  
✓ Degradação detectada antes da queda  
✓ Aparência de estabilidade mantida  
✓ Heartbeat humanizado  
✓ Funciona melhor em revenda não oficial
