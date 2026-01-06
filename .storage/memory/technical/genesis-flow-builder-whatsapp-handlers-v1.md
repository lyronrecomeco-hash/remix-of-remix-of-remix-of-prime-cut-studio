# Memory: technical/genesis-flow-builder-whatsapp-handlers-v1
Updated: 2026-01-06

## Correções Implementadas no Worker de Automação

O `whatsapp-automation-worker` foi atualizado para suportar corretamente todos os nós nativos de WhatsApp do Flow Builder.

### 1. Função `normalizeBR(phone)`
- Garante que números brasileiros tenham o DDI `55`
- Se o número tem 10 ou 11 dígitos, adiciona prefixo `55`
- Evita falhas silenciosas de envio para números sem código do país

### 2. Função `sendViaProxy()`
- Usa a Edge Function `genesis-backend-proxy` para maior resiliência
- Busca instância na tabela `genesis_instances` (não `whatsapp_instances` legada)
- Valida status da instância antes de enviar
- Aplica normalização BR automaticamente
- Registra logs em `whatsapp_message_logs`

### 3. Handlers Nativos WhatsApp Implementados
- `wa_send_text` - Enviar texto com typing indicator
- `wa_send_buttons` - Enviar mensagem com botões
- `wa_send_list` - Enviar menu de lista
- `wa_wait_response` - Aguardar resposta do usuário
- `wa_receive` - Trigger de recebimento
- `wa_start` - Trigger de início do fluxo

### 4. Handlers Legados Mantidos (compatibilidade)
- `send_message` - Envio genérico
- `message` - Nó de mensagem do NODE_TEMPLATES
- `button` - Nó de botões do NODE_TEMPLATES
- `list` - Nó de lista do NODE_TEMPLATES

### Arquivo Modificado
- `supabase/functions/whatsapp-automation-worker/index.ts`

### Segurança
- Todos os envios passam pelo proxy seguro
- Token padrão: `genesis-master-token-2024-secure`
- Validação de instância conectada antes de enviar
