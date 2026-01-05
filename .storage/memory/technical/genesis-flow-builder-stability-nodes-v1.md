# Memory: technical/genesis-flow-builder-stability-nodes-v1
Updated: 2026-01-05

## Nós de Estabilidade do Flow Builder

O Genesis Flow Builder agora inclui 8 novos nós de estabilidade e resiliência para automações WhatsApp mais robustas:

### 1. queue_message (Fila de Envio)
- **Propósito**: Envia mensagens via fila com garantia de entrega
- **Configurações**: priority (low/normal/high), retry_limit, retry_interval_seconds, expiration_seconds, on_fail (goto/end)
- **Backend**: Persiste em `whatsapp_message_queue`, retry automático

### 2. session_guard (Proteção de Sessão)  
- **Propósito**: Limita comportamento do fluxo para evitar spam e ban
- **Configurações**: max_messages_per_minute (default: 20), burst_limit (default: 5), cooldown_minutes, on_violation (pause/goto/end)
- **Backend**: Verifica `whatsapp_message_logs` para contagem de mensagens

### 3. timeout_handler (Tratamento de Timeout)
- **Propósito**: Captura timeout de espera/envio e define fallback
- **Configurações**: timeout_seconds, on_timeout (goto/end), fallback_message
- **Conexões**: Condicionais (SIM = sucesso, NÃO = timeout)

### 4. if_instance_state (Condição por Estado)
- **Propósito**: Verifica estado atual da instância WhatsApp
- **Estados verificáveis**: connected, degraded, cooldown, disconnected
- **Conexões**: Condicionais baseadas no estado

### 5. retry_policy (Política de Retry)
- **Propósito**: Define retentativas com backoff controlado
- **Configurações**: max_attempts, delay_seconds, jitter_enabled, on_exhausted (goto/end)
- **Backend**: Adiciona jitter (variação de 30% do delay) quando habilitado

### 6. smart_delay (Pausa Inteligente)
- **Propósito**: Delay humanizado com aleatoriedade e contexto
- **Configurações**: min_seconds, max_seconds, randomize, respect_business_hours
- **Backend**: Dobra delay fora do horário comercial (09-18h, Seg-Sex)

### 7. rate_limit (Limite de Taxa)
- **Propósito**: Controla ritmo de execução do fluxo
- **Configurações**: messages_per_minute, burst_limit, cooldown_minutes, on_limit (pause/goto/end)
- **Backend**: Verifica `whatsapp_automation_executions`

### 8. enqueue_flow_step (Enfileirar Passo)
- **Propósito**: Executa próximo passo de forma assíncrona
- **Configurações**: queue_name, priority, delay_seconds
- **Backend**: Insere em `whatsapp_flow_queue` para execução posterior

## Arquivos Modificados
- `src/components/owner/whatsapp/flow-builder/types.ts` - Tipos e templates
- `src/components/owner/whatsapp/flow-builder/NodeConfigPanel.tsx` - Configurações UI
- `src/components/owner/whatsapp/flow-builder/ComponentsModal.tsx` - Lista de componentes
- `src/components/owner/whatsapp/flow-builder/NodeSidebar.tsx` - Sidebar de componentes
- `src/components/owner/whatsapp/flow-builder/FlowNode.tsx` - Ícones dos nós
- `supabase/functions/whatsapp-automation-worker/index.ts` - Backend de execução

## Categoria e Cores
- Categoria: `stability` (Estabilidade)
- Cor base: `#f97316` (Orange-500)
- Gradiente: Orange para diferentes tons por nó
