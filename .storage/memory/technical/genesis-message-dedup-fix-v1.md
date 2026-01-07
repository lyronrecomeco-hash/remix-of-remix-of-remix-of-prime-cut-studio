# Memory: technical/genesis-message-dedup-fix-v1
Updated: 2026-01-07

## Problema Corrigido: Mensagens Duplicadas no WhatsApp

O sistema de chatbot estava enviando mensagens DUPLICADAS porque:

1. **VPS Script** enviava mensagem para `chatbot-engine`
2. Se chatbot não tratava, VPS chamava `whatsapp-automation-worker`
3. **O worker NÃO verificava dedup** antes de processar
4. Resultado: mesma mensagem processada 2x

## Correção Implementada

### 1. Adicionado `checkAndRegisterDedup()` no worker
- Usa a mesma tabela `chatbot_inbound_dedup` que o chatbot-engine
- Verifica ANTES de qualquer processamento
- Se messageId já existe → marca evento como `completed` e PARA imediatamente

### 2. Fluxo de Verificação (3 camadas)
```
VPS Script (camada 1: isDuplicateInbound local)
    ↓
chatbot-engine (camada 2: checkAndRegisterDedup DB)
    ↓
whatsapp-automation-worker (camada 3: checkAndRegisterDedup DB)
```

### 3. Passagem de messageId
- VPS agora passa `messageId` em todas as chamadas
- Worker extrai `messageId` do payload e verifica dedup PRIMEIRO
- Se chatbot-engine retorna `dedup: true`, worker para imediatamente

## Arquivos Modificados
- `supabase/functions/whatsapp-automation-worker/index.ts`
  - Adicionada função `checkAndRegisterDedup()`
  - Modificada `callChatbotEngine()` para aceitar `messageId`
  - Modificada `processEvent()` para verificar dedup antes de processar

## Tabela de Dedup
```sql
CREATE TABLE public.chatbot_inbound_dedup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL,
  message_id text NOT NULL,
  from_jid text NULL,
  CONSTRAINT chatbot_inbound_dedup_instance_message_unique UNIQUE (instance_id, message_id)
);
```

## Resultado
- Cada mensagem é processada UMA ÚNICA VEZ
- Idempotência garantida em todas as camadas
- Nenhum reprocessamento ou envio duplicado
