# Memory: technical/genesis-phase10-metrics-alerts
Updated: now

## FASE 10: Métricas e Alertas Avançados

### Tabelas Criadas

1. **genesis_instance_metrics**: Métricas agregadas por período
   - Período horário, diário, semanal, mensal
   - Contadores de mensagens (enviadas, recebidas, falhas)
   - Métricas de conexão (uptime, desconexões, reconexões)
   - Métricas de performance (tempo de resposta)
   - Uso de recursos (CPU, memória)

2. **genesis_alerts**: Sistema de alertas
   - Tipos: disconnection, high_failure_rate, high_latency, resource_exhaustion, quota_exceeded, node_offline
   - Severidades: info, warning, critical
   - Estados: active, acknowledged, resolved, dismissed
   - Auto-resolução configurável

3. **genesis_alert_rules**: Regras de alerta configuráveis
   - Métricas monitoradas: disconnection_count, failure_rate, response_time, cpu_usage, memory_usage, health_score
   - Operadores: gt, gte, lt, lte, eq
   - Janela de avaliação configurável
   - Cooldown entre alertas
   - Notificações (email, webhook)

4. **genesis_realtime_metrics**: Snapshot em tempo real
   - Status atual da instância
   - Mensagens do dia
   - Health score (0-100) com fatores

### Funções SQL

- `genesis_record_metrics()`: Registra métricas de uma instância
- `genesis_create_alert()`: Cria ou atualiza alertas
- `genesis_evaluate_alert_rules()`: Avalia regras e dispara alertas
- `genesis_calculate_health_score()`: Calcula score de saúde (0-100)

### Edge Function: genesis-metrics

Ações disponíveis:
- `record_metrics`: Registra métricas e avalia regras
- `get_metrics`: Busca métricas históricas
- `get_realtime_metrics`: Busca métricas em tempo real
- `get_dashboard_summary`: Resumo completo para dashboard
- `create_alert`, `get_alerts`, `acknowledge_alert`, `resolve_alert`, `dismiss_alert`
- `create_alert_rule`, `get_alert_rules`, `update_alert_rule`, `delete_alert_rule`, `toggle_alert_rule`
- `calculate_health`, `evaluate_rules`

### VPS Script v8.0 - Métricas

Métodos adicionados ao InstanceManager:
- `initMetricsCollector()`: Inicializa coleta automática (5 min)
- `collectAndSendMetrics()`: Coleta e envia métricas ao backend
- `trackMessageSent()`, `trackMessageReceived()`: Rastreia mensagens
- `trackDisconnection()`, `trackReconnection()`: Rastreia conexões
- `calculateLocalHealthScore()`: Calcula health score local

### Componente: GenesisMetricsDashboard

Dashboard completo com:
- Cards de estatísticas (health score, mensagens, alertas, instâncias)
- Tabs: Visão Geral, Alertas, Saúde
- Lista de alertas com ações (acknowledge, dismiss)
- Cards de saúde por instância com progress bar
- Atualização automática a cada 30 segundos

### Health Score (0-100)

Fatores que reduzem o score:
- Desconectado: -30
- Heartbeat stale (>5min): -20
- Taxa de falha >10%: -25, >5%: -10
- Tempo de resposta >5000ms: -15, >2000ms: -5
- Desconexões frequentes: -10 por desconexão (max -30)
