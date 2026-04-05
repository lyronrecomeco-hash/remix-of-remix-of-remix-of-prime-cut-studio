
# Genesis Engine v3.5 — Workflow Engine Executável

## DIAGNÓSTICO DO PROBLEMA ATUAL

### Por que o canvas ainda parece conceitual:
1. **Todos os blocos são tratados igualmente** — Prospect, WhatsApp, Deploy recebem o mesmo tratamento visual e lógico. Não há distinção entre "contexto" e "ação"
2. **Conexões são linhas visuais sem significado** — uma aresta de Prospect→Diagnóstico tem o mesmo peso que Abordagem→WhatsApp
3. **O runtime trata conteúdo como sucesso** — blocos preenchidos viram "success" automaticamente, sem execução real
4. **"Executar" roda tudo linearmente** — não distingue blocos informativos de ações reais
5. **Não há blocos de controle/espera** — sem aguardar resposta, delay, condição
6. **Validação é superficial** — checa texto vazio, não semântica do fluxo

---

## IMPLEMENTAÇÃO

### 1. Nova Taxonomia de Blocos (`types.ts`)

Reclassificar todos os blocos em 5 categorias funcionais:

```
CONTEXT_BLOCKS   → prospect, diagnosis, pain, opportunity (alimentam dados, auto-success)
DECISION_BLOCKS  → strategy, offer, differentials, objections (definem rumo, auto-success)
ACTION_BLOCKS    → whatsapp, automation, deploy, approach (executam algo real)
CONTROL_BLOCKS   → followup, checklist (gerenciam estado/timing)
OUTPUT_BLOCKS    → prompt, scope, structure, integrations, notes (geram saída/artefato)
```

Cada bloco ganha `blockCategory` no tipo, e um badge visual sutil (ícone de categoria no header do nó).

### 2. Conexões com Semântica (`types.ts` + `EngineWorkspace.tsx`)

Adicionar tipos de edge:
- `data_flow` — alimenta dados (default, cinza)
- `execution_flow` — executa depois de (azul)
- `success_path` — se sucesso (verde)
- `failure_path` — se falha (vermelho)

Visual: cor da linha muda conforme o tipo. Label opcional no edge.

### 3. Runtime Inteligente (`useFlowRuntime.ts`)

Refatorar para:
- **Classificar** nós antes de executar: context/decision → auto-validate, action → execute real
- **Pre-flight summary**: antes de rodar, retornar resumo: "Será enviada 1 msg WhatsApp, 2 blocos de contexto validados"
- **Execução apenas dos ACTION_BLOCKS**: contexto/decisão são validados (preenchidos?), ações são executadas
- **Respeitar edge types**: seguir success_path/failure_path conforme resultado

### 4. Validador de Fluxo Robusto (`useFlowRuntime.ts`)

Novo validador que checa:
- ✅ Existe pelo menos 1 bloco de contexto (Prospect)
- ✅ Existe pelo menos 1 bloco de ação
- ✅ Blocos de ação estão conectados (não soltos)
- ✅ WhatsApp tem telefone (do Prospect) + mensagem (da Abordagem)
- ✅ Conector WhatsApp está ativo
- ✅ Não há blocos de ação desconectados
- ✅ Fluxo tem caminho completo de entrada→ação→saída

### 5. Pre-flight Panel no "Executar" (`FlowControls.tsx`)

Ao clicar Executar, mostrar tooltip/popover com:
- "3 blocos de contexto ✓"
- "1 ação: Envio WhatsApp para +55..."
- "1 saída: Prompt Final"
- Botão "Confirmar Execução"

### 6. Visual dos Blocos por Categoria (`EngineNode.tsx`)

Sem mudar o design base, adicionar:
- Badge de categoria discreto (ex: "CONTEXTO", "AÇÃO", "SAÍDA") — text 8px, uppercase, no header
- Ícone de handle diferente: ação = handle com borda primary, contexto = handle neutro
- Indicador visual de "executável" vs "informativo" (bolinha no canto: azul = ação, cinza = contexto)

### 7. IA Contextual para Flows Executáveis

Atualizar `generate-engine-output` para:
- Ao montar estrutura, classificar blocos corretamente
- Conectar com edge types semânticos
- Incluir blocos de ação no ponto certo do fluxo

---

## ARQUIVOS MODIFICADOS

1. `src/components/genesis-ia/engine/types.ts` — nova taxonomia, edge types
2. `src/components/genesis-ia/engine/hooks/useFlowRuntime.ts` — runtime inteligente + validador robusto
3. `src/components/genesis-ia/engine/components/EngineNode.tsx` — badge de categoria
4. `src/components/genesis-ia/engine/components/FlowControls.tsx` — pre-flight summary
5. `src/components/genesis-ia/engine/components/ExecutionLogsPanel.tsx` — logs por categoria
6. `src/components/genesis-ia/engine/EngineWorkspace.tsx` — edge types + cores

## O QUE NÃO MUDA
- Layout, cores base, fonts, glassmorphism
- Estrutura de painéis (left/canvas/right)
- Design dos blocos (apenas badges sutis adicionados)
- AI Command Panel (mantém chat + aprovação)
