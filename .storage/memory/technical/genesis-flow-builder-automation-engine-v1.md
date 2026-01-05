# Genesis Flow Builder - Automation Engine v1

## Resumo

O Genesis Flow Builder foi evoluído para ser um motor de automação genérico, independente de canais específicos (como WhatsApp). Agora funciona como um workflow engine estilo n8n/Zapier, suportando automações complexas sem depender de instâncias conectadas.

## Novos Componentes Implementados

### 1. HTTP Request Advanced (`http_request_advanced`)
- **Categoria**: automation
- **Cor**: #7c3aed
- **Configurações**:
  - `method`: GET, POST, PUT, PATCH, DELETE
  - `url`: URL do endpoint
  - `headers`: Headers HTTP (JSON)
  - `query_params`: Query parameters (JSON)
  - `body`: Body da requisição (JSON)
  - `timeout_seconds`: Timeout em segundos (5-120)
  - `retries`: Número de retentativas (0-5)
  - `auth_type`: none, bearer, basic, api_key
  - `save_response_to`: Variável para salvar resposta

### 2. Webhook Trigger (`webhook_trigger`)
- **Categoria**: automation
- **Cor**: #8b5cf6
- **Configurações**:
  - `method`: POST, GET, PUT
  - `path`: Path do webhook
  - `secret`: Chave secreta para validação
  - `validate_payload`: Validar estrutura JSON
  - `custom_response`: Resposta customizada (JSON)

### 3. Cron Trigger (`cron_trigger`)
- **Categoria**: automation
- **Cor**: #a78bfa
- **Configurações**:
  - `cron_expression`: Expressão cron (ex: "0 9 * * *")
  - `timezone`: Fuso horário
  - `active_window`: Janela ativa (start/end)
  - `on_fail`: retry, skip, alert

### 4. Set Variable (`set_variable`)
- **Categoria**: automation
- **Cor**: #c4b5fd
- **Configurações**:
  - `name`: Nome da variável
  - `value`: Valor ou expressão
  - `scope`: flow, session, global
  - `type`: string, number, boolean, json

### 5. If Expression (`if_expression`)
- **Categoria**: automation (condição)
- **Cor**: #ddd6fe
- **Configurações**:
  - `expression`: Expressão lógica
  - `logic`: and, or
  - `fallback`: no, end

### 6. Loop For Each (`loop_for_each`)
- **Categoria**: automation
- **Cor**: #6d28d9
- **Configurações**:
  - `array_source`: Fonte do array
  - `item_variable`: Nome da variável do item
  - `index_variable`: Nome da variável do índice
  - `limit`: Limite de iterações (1-1000)
  - `delay_between`: Delay entre iterações (seg)
  - `on_error`: continue, break, retry

### 7. Switch/Case (`switch_case`)
- **Categoria**: automation (condição)
- **Cor**: #5b21b6
- **Configurações**:
  - `expression`: Expressão base
  - `cases_raw`: Cases (valor|node_id por linha)
  - `default_case`: end, continue, goto

### 8. Subflow Call (`subflow_call`)
- **Categoria**: automation
- **Cor**: #4c1d95
- **Configurações**:
  - `flow_id`: ID do fluxo a chamar
  - `parameters`: Parâmetros (JSON)
  - `wait_for_completion`: Aguardar conclusão
  - `timeout_seconds`: Timeout (5-3600)
  - `return_variable`: Variável para retorno

### 9. Event Emitter (`event_emitter`)
- **Categoria**: automation
- **Cor**: #9333ea
- **Configurações**:
  - `event_name`: Nome do evento
  - `payload`: Payload do evento (JSON)
  - `scope`: project, instance, global

### 10. Data Transform (`data_transform`)
- **Categoria**: automation
- **Cor**: #a855f7
- **Configurações**:
  - `operation`: map, filter, reduce, merge, template
  - `source`: Fonte de dados
  - `expression`: Expressão de transformação
  - `output_variable`: Variável de saída

## Arquivos Modificados

### Frontend
- `src/components/owner/whatsapp/flow-builder/types.ts`
  - Novos NodeTypes adicionados
  - Nova categoria `automation`
  - `AUTOMATION_TEMPLATES` array
  - Cores e regras de conexão atualizadas

- `src/components/owner/whatsapp/flow-builder/FlowNode.tsx`
  - Ícones para novos tipos
  - Categoria AUTOMAÇÃO

- `src/components/owner/whatsapp/flow-builder/NodeConfigPanel.tsx`
  - Configurações UI para todos os 10 novos nós

- `src/components/owner/whatsapp/flow-builder/ComponentsModal.tsx`
  - Import de AUTOMATION_TEMPLATES
  - Novos ícones

- `src/components/owner/whatsapp/flow-builder/NodeSidebar.tsx`
  - Import de AUTOMATION_TEMPLATES
  - Categoria automation no estado

### Backend
- `supabase/functions/whatsapp-automation-worker/index.ts`
  - Handlers para todos os 10 novos action types
  - Suporte a context flow variables
  - HTTP requests com retry
  - Expression evaluation
  - Loop iteration context
  - Subflow queuing
  - Event emission
  - Data transformation

## Princípio Fundamental

O Flow Builder agora:
- Executa fluxos **sem WhatsApp**
- Funciona **sem instância conectada**
- Trata WhatsApp como **apenas mais um canal**
- Suporta **automações complexas e encadeadas**
- Opera de forma **assíncrona, persistente e resiliente**

## Regras Respeitadas

✅ Nenhum design visual alterado
✅ Nenhum layout/UX modificado
✅ Nenhuma lógica de negócio existente alterada
✅ Nenhuma refatoração de arquitetura
✅ Nenhum nó existente removido/modificado
✅ Nenhum comportamento implícito criado
✅ Apenas novos componentes e configurações adicionados
