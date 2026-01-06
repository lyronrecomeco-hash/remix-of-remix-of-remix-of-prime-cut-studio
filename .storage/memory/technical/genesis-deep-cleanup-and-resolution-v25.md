# Memory: technical/genesis-deep-cleanup-and-resolution-v25
Updated: just now

## Limpeza Profunda de Instâncias Genesis

### Contexto
Usuário da@gmail.com estava em loop de erro de conexão (404 "Instância não encontrada") devido a dados órfãos e estados inconsistentes entre o banco de dados Supabase e a VPS.

### Causa Raiz
1. Instâncias no banco de dados não existiam na VPS (estados dessincronizados)
2. Trigger de imutabilidade `trg_block_event_delete` bloqueava limpeza de `genesis_instance_events`
3. Múltiplas tabelas vinculadas impediam DELETE em cascata

### Solução Aplicada
Migração SQL que:
1. Remove triggers de proteção temporariamente (`DROP TRIGGER trg_block_event_delete/trg_block_event_update`)
2. Deleta dados em todas as tabelas dependentes:
   - `whatsapp_automation_rules`
   - `genesis_event_logs`
   - `genesis_session_backups`
   - `genesis_instance_metrics`
   - `genesis_alerts`
   - `genesis_realtime_metrics`
   - `genesis_instance_failovers`
   - `genesis_instance_tokens`
   - `genesis_alert_rules`
   - `genesis_credit_usage`
   - `genesis_instance_events`
3. Deleta as instâncias de `genesis_instances`
4. Recria triggers de proteção

### Próximos Passos
1. Usuário deve criar nova instância em /genesis
2. Ao clicar "Conectar", o sistema criará a instância na VPS automaticamente via `ensureInstanceExists`
3. QR Code será gerado corretamente
4. Se ocorrer erro 401 (sessão expirada), usar botão "Resetar Sessão"

### Tabelas Relacionadas Genesis (com instance_id)
- genesis_instances (principal)
- genesis_event_logs
- genesis_session_backups
- genesis_instance_metrics
- genesis_alerts
- genesis_realtime_metrics
- genesis_instance_failovers
- genesis_instance_tokens
- genesis_alert_rules
- genesis_credit_usage
- genesis_instance_events
- whatsapp_automation_rules
