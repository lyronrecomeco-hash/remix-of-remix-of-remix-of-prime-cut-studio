# Memory: technical/genesis-phase7-frontend-refactoring
Updated: just now

## FASE 7: Refatoração Frontend - Autoridade Central

A FASE 7 implementa o padrão onde o **frontend apenas consome estado** e **nunca escreve status diretamente**.

### Arquitetura Implementada

1. **Edge Function `genesis-connection-orchestrator`**
   - Única fonte de verdade para transições de status
   - Valida transições via state machine (`genesis_validate_state_transition`)
   - Registra eventos imutáveis (`genesis_instance_events`)
   - Aceita ações: `transition`, `health_ping`, `get_status`

2. **Hook `useOrchestratedStatus`**
   - Abstrai chamadas ao orquestrador
   - Métodos: `requestTransition`, `tryTransition`, `sendHealthPing`, `getStatus`
   - `tryTransition` aceita falha silenciosamente para compatibilidade

3. **Refatoração `useGenesisWhatsAppConnection`**
   - Função `updateInstanceInDB` agora:
     - Para mudanças de STATUS → chama `requestOrchestratedTransition`
     - Para outros campos (session_data, phone_number) → update direto permitido
   - Mantém compatibilidade com código existente

4. **Refatoração `InstancesManager`**
   - Não força mais sync de status no banco
   - Apenas atualiza visualização local para instâncias stale
   - Mostra "connecting" em vez de "disconnected" para evitar falsos negativos

5. **Refatoração `genesis-heartbeat`**
   - Atualiza heartbeat e health diretamente
   - Mudanças de status vão via RPC `genesis_orchestrate_status_change`
   - Lê `orchestrated_status` para comparação

### Fluxo de Transição

```
Frontend/VPS → genesis-connection-orchestrator → genesis_orchestrate_status_change (RPC)
                                                        ↓
                                               Valida via state machine
                                                        ↓
                                               Atualiza orchestrated_status
                                                        ↓
                                               Registra evento imutável
```

### Compatibilidade

- Código legado continua funcionando (transições inválidas são logadas mas não bloqueiam)
- Campos não-status (phone_number, session_data, etc) ainda podem ser atualizados diretamente
- genesis_event_logs legado mantido para backwards compatibility
