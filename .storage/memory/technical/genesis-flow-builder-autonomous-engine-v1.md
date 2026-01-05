# Genesis Flow Builder - Motor de Automação Autônomo v1
**Data:** 2026-01-05
**Status:** Implementado

## Resumo
O Genesis Flow Builder foi transformado em um motor de automação profissional, estável e autônomo, similar ao n8n. Os fluxos agora têm vida útil própria, podendo ser configurados, ativados e executados de forma contínua.

## Ciclo de Vida Formal do Fluxo

### Estados
- **draft**: Fluxo em construção, não validado
- **validated**: Fluxo passou na validação, pronto para ativação
- **active**: Fluxo em execução, processando eventos
- **paused**: Fluxo pausado temporariamente
- **error**: Fluxo em estado de erro

### Transições Permitidas
```
draft → validated
validated → active | draft
active → paused | error
paused → active | draft
error → draft | paused
```

## Novas Colunas em `whatsapp_automation_rules`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `lifecycle_status` | text | Estado atual do fluxo |
| `global_config` | jsonb | Configurações globais |
| `validated_at` | timestamptz | Data da validação |
| `validation_result` | jsonb | Resultado da validação |
| `activated_at` | timestamptz | Data da ativação |
| `paused_at` | timestamptz | Data da pausa |

## Configuração Global por Fluxo (`global_config`)
```json
{
  "timeout_seconds": 300,
  "default_retries": 3,
  "max_concurrency": 10,
  "error_mode": "pause",
  "persist_context": true,
  "distributed_execution": false,
  "ai_config": {
    "provider": "lovable",
    "fallback_provider": null,
    "max_tokens": 4096,
    "temperature": 0.7
  }
}
```

## Novas Tabelas de Observabilidade

### `flow_execution_history`
Histórico completo de execuções:
- `execution_id`: ID único da execução
- `status`: running, completed, failed
- `node_timeline`: Timeline de execução por nó
- `context_snapshot`: Snapshot do contexto
- `error_details`: Detalhes de erros
- Realtime habilitado

### `flow_node_executions`
Log granular por nó:
- `node_id`, `node_type`, `node_label`
- `duration_ms`: Tempo de execução
- `input_data`, `output_data`
- `error_message`
- Realtime habilitado

### `flow_ai_settings`
Configurações de IA por projeto/owner:
- `provider`: lovable, openai, custom
- `model`, `max_tokens`, `temperature`
- `fallback_provider`, `fallback_model`
- `rate_limit_per_minute`

### `flow_execution_context`
Persistência de contexto entre execuções:
- `context_key`, `context_value`
- `scope`: execution, flow, global
- `expires_at`

## Novos Nós de IA (Categoria "ai" - Amarelo)

### `ai_prompt_execute`
Executa prompt em modelo configurável (Lovable AI / OpenAI).
```json
{
  "prompt": "",
  "system_prompt": "Você é um assistente útil.",
  "model": "google/gemini-2.5-flash",
  "max_tokens": 1024,
  "temperature": 0.7,
  "save_response_to": "ai_response",
  "use_context": true,
  "fallback_response": "Desculpe, não consegui processar."
}
```

### `ai_chat_context`
Mantém contexto conversacional persistente.
```json
{
  "context_scope": "execution",
  "max_history": 10,
  "context_key": "chat_history",
  "include_system": true,
  "auto_summarize": false
}
```

### `ai_decision`
Retorna decisão estruturada (JSON) baseada em prompt + contexto.
```json
{
  "decision_prompt": "Analise a mensagem e decida a melhor ação.",
  "options": [
    { "value": "option_a", "description": "Primeira opção" },
    { "value": "option_b", "description": "Segunda opção" }
  ],
  "default_option": "option_a",
  "confidence_threshold": 0.7,
  "save_decision_to": "ai_decision"
}
```

### `ai_embedding`
Gera embeddings para busca semântica.
```json
{
  "text_source": "{{message}}",
  "model": "text-embedding-ada-002",
  "save_embedding_to": "embedding",
  "search_collection": "",
  "top_k": 5
}
```

## Edge Functions

### `flow-validator`
Valida fluxos antes da ativação:
- Detecta loops perigosos
- Valida nós obrigatórios (triggers)
- Verifica configurações ausentes
- Identifica nós órfãos
- Bloqueia ativação se houver erros críticos

### Ações Disponíveis
- `validate`: Valida flow_data ou busca por flow_id
- `transition`: Transiciona status do fluxo

## Função de Banco: `update_flow_lifecycle_status`
```sql
SELECT update_flow_lifecycle_status(
  p_flow_id uuid,
  p_new_status text,
  p_validation_result jsonb
);
```
- Valida transições permitidas
- Atualiza timestamps apropriados
- Sincroniza `is_active` com status

## Handlers de IA no Worker

Os 4 novos nós de IA estão implementados no `whatsapp-automation-worker`:
- `ai_prompt_execute`: Integração completa com Lovable AI
- `ai_chat_context`: Gestão de histórico de conversa
- `ai_decision`: Decisão estruturada com fallback
- `ai_embedding`: Placeholder para embeddings (futura integração)

## Princípio Fundamental
> "O Genesis Flow Builder agora é um motor de automação completo, autônomo, observável e extensível, com IA integrada como componente, não como controlador."

## Arquivos Modificados
- `src/components/owner/whatsapp/flow-builder/types.ts`: Novos tipos e templates AI
- `supabase/functions/whatsapp-automation-worker/index.ts`: Handlers AI
- `supabase/functions/flow-validator/index.ts`: Nova função de validação
- `supabase/config.toml`: Registro da nova função

## Próximos Passos
1. Integrar UI para controle de lifecycle
2. Dashboard de execuções em tempo real
3. Integração real com embeddings
4. Scheduler para cron_trigger
