# Genesis Webhook Universal Gateway - v1

## Overview

O Genesis Flow Builder agora inclui um sistema de Webhook Universal, capaz de receber, validar, transformar e orquestrar webhooks de qualquer sistema externo (pagamentos, SaaS, internos, legados).

## Database Schema

### Novas Tabelas

1. **genesis_webhook_configs** - Configurações de webhooks
   - `webhook_id`: Identificador único para URL do webhook
   - `flow_id`: Referência ao fluxo vinculado
   - `auth_type`: none | token | header | hmac | ip_whitelist | basic
   - `rate_limit_per_minute/hour`: Limites de requisições
   - `dedup_enabled/window_seconds`: Configuração de deduplicação
   - `custom_response`: Resposta HTTP personalizada

2. **genesis_webhook_events** - Eventos recebidos
   - `event_id`: ID externo para deduplicação
   - `execution_id`: Referência à execução do fluxo
   - `method, path, headers, query_params, body_raw, body_parsed`
   - `status`: received | validated | queued | processing | completed | failed | duplicate | rejected
   - `source_ip, user_agent`: Dados de origem

3. **genesis_webhook_dead_letters** - Eventos falhos para reprocessamento
   - `failure_reason, failure_details`
   - `retry_count, max_retries`
   - `status`: pending | retrying | reprocessed | abandoned

4. **genesis_webhook_rate_limits** - Controle de rate limiting
   - Contadores por minuto/hora
   - Bloqueio automático

### Funções SQL

- `genesis_check_webhook_rate_limit(config_id, source_ip)` - Valida limites
- `genesis_check_webhook_dedup(config_id, event_id)` - Verifica duplicatas

## Edge Functions

### genesis-webhook-gateway

Gateway universal que recebe webhooks via:
```
POST /genesis-webhook-gateway/{webhook_id}
```

Funcionalidades:
- Aceita qualquer método e payload (JSON, form, raw)
- Captura headers, body, query, IP, timestamp
- Rate limiting por IP e webhook
- Validação de autenticação (token, HMAC, IP whitelist, basic)
- Deduplicação por event_id
- Resposta HTTP customizável
- Dispara execução apenas para fluxos ACTIVE
- Cria dead letters para falhas

## Novos Nós (Categoria: Webhooks - Cor Ciano)

1. **webhook_universal_trigger** - Entrada do fluxo via webhook
2. **webhook_auth_guard** - Validação por token/header/IP/HMAC
3. **webhook_signature_verify** - Verificação de assinatura (Stripe/GitHub style)
4. **webhook_rate_limit** - Limite por webhook e por IP
5. **webhook_queue** - Enfileiramento para execução assíncrona
6. **webhook_deduplication** - Prevenção de eventos duplicados
7. **webhook_payload_parser** - Parsing com JSONPath/XPath/Regex
8. **webhook_event_router** - Roteamento por tipo de evento
9. **webhook_response** - Resposta HTTP configurável
10. **webhook_dead_letter** - Captura de falhas para reprocessamento

## Segurança

- RLS em todas as tabelas
- Suporte a múltiplos métodos de autenticação
- Proteção contra replay attacks via deduplicação
- Rate limiting granular
- Secrets não expostos no frontend

## Fluxo de Execução

1. Webhook recebido pelo gateway
2. Rate limit verificado
3. Autenticação validada
4. Deduplicação checada
5. Evento armazenado com status 'validated'
6. Fluxo verificado se ACTIVE
7. Execução disparada para worker
8. Dead letter criado em caso de falha

## Uso

```typescript
// URL do webhook
https://{project}.supabase.co/functions/v1/genesis-webhook-gateway/{webhook_id}

// Exemplo de payload
POST /genesis-webhook-gateway/abc123
{
  "event_type": "payment.created",
  "data": { ... }
}
```

## Observabilidade

- Todos os eventos são registrados em genesis_webhook_events
- execution_id vinculado ao flow_execution_history
- Status granular por etapa
- Dead letters para reprocessamento manual
