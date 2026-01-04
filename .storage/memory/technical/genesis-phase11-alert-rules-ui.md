# Memory: technical/genesis-phase11-alert-rules-ui
Updated: now

## FASE 11: UI de Regras de Alerta

### Componente: GenesisAlertRules

Interface completa para gerenciar regras de alerta customizáveis.

### Funcionalidades

1. **Listagem de Regras**
   - Cards com informações da regra
   - Ícone baseado no tipo de métrica
   - Badge de severidade colorido
   - Toggle para ativar/desativar
   - Contagem de disparos

2. **Criação de Regras**
   - Modal com formulário completo
   - Seleção de métrica monitorada
   - Operador de condição (>, >=, <, <=, =)
   - Valor limite
   - Severidade (info, warning, critical)
   - Janela de avaliação (minutos)
   - Cooldown entre alertas
   - Notificações (email, webhook)

3. **Edição de Regras**
   - Reutiliza mesmo formulário
   - Pré-preenche dados existentes

4. **Exclusão de Regras**
   - Confirmação antes de excluir

5. **Toggle Rápido**
   - Ativar/desativar sem abrir modal

### Métricas Disponíveis

- `disconnection_count`: Número de desconexões
- `failure_rate`: Taxa de falha em %
- `response_time`: Tempo de resposta em ms
- `cpu_usage`: Uso de CPU em %
- `memory_usage`: Uso de memória em %
- `health_score`: Score de saúde (0-100)

### Operadores

- `gt`: Maior que
- `gte`: Maior ou igual
- `lt`: Menor que
- `lte`: Menor ou igual
- `eq`: Igual

### Severidades

- `info`: Azul - Informativo
- `warning`: Amarelo - Aviso
- `critical`: Vermelho - Crítico

### Integração

Usa Edge Function `genesis-metrics` com ações:
- `get_alert_rules`
- `create_alert_rule`
- `update_alert_rule`
- `toggle_alert_rule`
- `delete_alert_rule`

### Export

Componente exportado via `src/components/genesis/index.ts`
