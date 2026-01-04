# Genesis FASE 9: Pool de VPS - Gerenciamento Distribuído

## Resumo
Sistema de balanceamento de carga e failover automático entre múltiplos nós VPS, permitindo alta disponibilidade e escalabilidade horizontal.

## Componentes Implementados

### 1. Banco de Dados

#### Tabela `genesis_vps_nodes`
```sql
- id: UUID (PK)
- name, region, base_url: Identificação do nó
- max_instances, current_instances: Controle de capacidade
- cpu_load, memory_load, avg_latency_ms: Métricas de saúde
- status: 'online' | 'offline' | 'draining' | 'maintenance'
- health_score: 0-100 (calculado automaticamente)
- api_token: Autenticação do nó
- last_heartbeat_at: Último ping
```

#### Tabela `genesis_instance_failovers`
```sql
- instance_id: Instância sendo migrada
- source_node_id, target_node_id: Nós envolvidos
- reason: 'node_failure' | 'load_balance' | 'manual' | 'maintenance' | 'health_degraded'
- status: 'pending' | 'backing_up' | 'migrating' | 'restoring' | 'completed' | 'failed'
- backup_id: Referência ao backup usado
```

#### Colunas adicionadas em `genesis_instances`
- `vps_node_id`: Nó atual da instância
- `preferred_region`: Região preferida para failover
- `failover_enabled`: Habilitar failover automático
- `last_failover_at`: Última migração

### 2. Funções SQL

- `genesis_select_best_node(region, exclude)`: Seleciona nó com maior health_score e capacidade
- `genesis_node_heartbeat(...)`: Atualiza métricas e calcula health_score
- `genesis_initiate_failover(...)`: Inicia processo de migração
- `genesis_complete_failover(...)`: Finaliza migração (sucesso/falha)
- `genesis_detect_offline_nodes()`: Detecta nós offline e inicia failovers automáticos

### 3. Edge Function `genesis-vps-pool`

Actions:
- `node_heartbeat`: VPS reporta CPU, memória, latência
- `select_node`: Frontend seleciona melhor nó para nova instância
- `list_nodes`: Lista nós disponíveis
- `register_node`: Admin registra novo nó
- `assign_instance`: Atribui instância a um nó
- `initiate_failover`: Inicia migração manual
- `execute_failover`: Executa processo completo (backup → migrate → restore)
- `complete_failover`: Finaliza migração
- `check_offline`: Detecta nós offline e inicia failovers

### 4. VPS Script v8.0

#### Novas variáveis de ambiente
```bash
NODE_ID=uuid-do-node         # ID do nó no pool
NODE_TOKEN=token-do-node     # Token de autenticação
NODE_REGION=br-south         # Região do nó
NODE_MAX_INSTANCES=50        # Capacidade máxima
```

#### Node Heartbeat automático
- Coleta métricas: CPU (loadavg), memória, contagem de instâncias
- Envia para `genesis-vps-pool` a cada 30 segundos
- Calcula health_score baseado em:
  - CPU load (40% peso)
  - Memory load (30% peso)
  - Latência (30% peso, max 30 pontos)

## Fluxo de Failover

### Automático (node_failure)
1. `genesis_detect_offline_nodes()` detecta nó sem heartbeat > 2 min
2. Inicia failover para instâncias com `failover_enabled = true`
3. Seleciona melhor nó alternativo via `genesis_select_best_node`

### Manual
1. Admin chama `initiate_failover` com instance_id
2. Sistema cria backup da sessão (FASE 8)
3. Envia restore para nó destino
4. Atualiza registros após sucesso

## Algoritmo de Seleção de Nó

```sql
ORDER BY 
  health_score DESC,
  (max_instances - current_instances) DESC,
  priority DESC
```

Prioriza:
1. Saúde do nó (score calculado)
2. Capacidade disponível
3. Prioridade manual (para nós premium)

## RLS Policies

- Super admins: gerenciamento total de nós e failovers
- Usuários: visualizam nós online e failovers das suas instâncias

## Próximas Fases

- **FASE 10**: Métricas e alertas avançados
- **FASE 11**: Auto-scaling baseado em demanda
