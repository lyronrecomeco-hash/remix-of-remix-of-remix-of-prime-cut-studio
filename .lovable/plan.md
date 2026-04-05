
# Genesis Engine v3.0 — Plano de Evolução

## DIAGNÓSTICO ATUAL

### 1. Bug de Desconexão WhatsApp
- **Causa**: O proxy tenta `logout` → `disconnect` → `restart` mas se o primeiro falha, `disconnectOk` fica false. Mesmo com restart OK, se `stillConnected && !disconnectOk` retorna erro 400
- **Fix**: Considerar restart bem-sucedido como desconexão válida. Forçar status `disconnected` no DB independentemente. Frontend precisa limpar `qrCode` e polling

### 2. Canvas é estático
- Blocos são apenas cartões visuais sem estado de execução
- Não há conceito de "rodar" um fluxo
- Sem validação de completude antes de executar

### 3. Logs ao vivo visíveis ao usuário
- O card "Logs ao vivo" no AICommandPanel está exposto — precisa ser ocultado

---

## PLANO DE IMPLEMENTAÇÃO

### P0 — Fix Desconexão (Crítico)
1. **chatpro-proxy**: Corrigir lógica de disconnect para SEMPRE marcar como disconnected no DB após tentativa, mesmo se provider não confirmar
2. **WhatsAppConfigModal**: Após disconnect, forçar reload dos connectors e limpar todo estado local (qr, polling, activeConnector)
3. Adicionar botão "Forçar Desconexão" como fallback

### P1 — Runtime de Execução do Canvas
1. **Novo tipo `EngineNodeData`**: Adicionar campos `executionStatus`, `executionLogs`, `executionError`
2. **Status dos blocos**: `idle` | `ready` | `running` | `success` | `failed` | `skipped`
3. **Visual**: Indicador de status no canto do bloco (bolinha colorida) — sem mudar design
4. **Hook `useFlowRuntime`**: Motor que interpreta edges como dependências, executa em ordem topológica
5. **Validação pré-execução**: Verificar blocos obrigatórios, configs faltantes, conexões quebradas

### P2 — Controles de Execução
1. **Barra de execução no header**: Botões Validar | Executar | Pausar (inline, minimalista)
2. **Validação visual**: Shake + highlight vermelho nos blocos com problema
3. **Execução sequencial**: Percorre edges source→target, marca status em cada bloco

### P3 — Bloco WhatsApp Executável
1. Ao executar, verifica se connector está connected
2. Extrai telefone do bloco Prospect
3. Extrai mensagem do bloco Approach
4. Envia via chatpro-proxy
5. Marca status: enviado/falhou com log

### P4 — Ocultar Logs do Card
1. Remover o card "Logs ao vivo" do `AICommandPanel` (seção `recentLogs`)
2. Manter logs internamente para debug mas não exibir ao usuário

### P5 — IA mais precisa no contexto do flow
1. Passar `executionStatus` dos blocos no prompt
2. IA pode sugerir "execute o fluxo" quando tudo está pronto
3. IA entende estado de execução e sugere correções

---

## ESTADOS DOS BLOCOS
```
idle → ready → running → success
                    ↘ failed → (retry) → running
                    ↘ skipped
```

## ARQUITETURA DO RUNTIME
- **Client-side**: useFlowRuntime interpreta o grafo
- **Execução**: Blocos conceituais (prospect, diagnosis...) = auto-success se preenchidos
- **Blocos executáveis** (whatsapp, automation) = chamam edge function
- **Validação**: Verifica preenchimento, conexões, dependências

## ROADMAP
1. P0: Fix disconnect (imediato)
2. P4: Ocultar logs (imediato)
3. P1: Runtime + estados dos blocos
4. P2: Controles de execução
5. P3: WhatsApp executável
6. P5: IA contextual com execução
