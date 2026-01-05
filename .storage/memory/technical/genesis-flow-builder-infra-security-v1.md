# Memory: technical/genesis-flow-builder-infra-security-v1

## Resumo
Implementados 10 novos nós de infraestrutura e segurança no Genesis Flow Builder.

## Nós de Infraestrutura (6)
1. **proxy_assign** - Associa proxy à execução (pool, tipo, sticky, TTL, fallback)
2. **proxy_rotate** - Rotação controlada de proxy (condição, intervalo, on_fail)
3. **worker_assign** - Seleciona VPS/worker (região, capacidade, sticky, fallback)
4. **worker_release** - Libera recursos (ao concluir, em erro, timeout retenção)
5. **dispatch_execution** - Disparo controlado (quantidade, espaçamento, paralelismo, janela)
6. **identity_rotate** - Rotação de identidade (proxy, worker, instância, condição)

## Nós de Segurança (4)
1. **execution_quota_guard** - Limite de execuções (simultâneas, por hora, por dia)
2. **infra_rate_limit** - Limite de recursos (CPU, memória, throughput, cooldown)
3. **if_infra_health** - Condição por saúde (proxy, worker, latência, fallback)
4. **secure_context_guard** - Proteção de contexto (isolamento, vazamento, reset)

## Arquivos Modificados
- `types.ts` - NodeType, categorias, cores, templates
- `FlowNode.tsx` - Ícones e categorias visuais
- `NodeConfigPanel.tsx` - UI de configuração de todos os nós
- `ComponentsModal.tsx` - Templates disponíveis
- `NodeSidebar.tsx` - Templates disponíveis
- `whatsapp-automation-worker/index.ts` - Lógica de execução backend
- `flow-ai-builder/index.ts` - Luna AI com suporte a todos os 40+ nós

## Luna AI Atualizada
- Suporta todos os 40+ tipos de nós
- 8 sugestões rápidas expandidas (era 4)
- Prompts complexos de exemplo (e-commerce, cron, resiliente)
- Mensagem de boas-vindas atualizada
- Fundo da foto removido
