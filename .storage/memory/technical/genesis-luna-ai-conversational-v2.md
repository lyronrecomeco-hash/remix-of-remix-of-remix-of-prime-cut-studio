# Memory: Luna AI - IA Conversacional da Genesis
Updated: 2026-01-05

## Visão Geral

A Luna foi transformada de uma "arquiteta de fluxos" rígida para uma **IA conversacional completa** que também pode criar fluxos quando solicitado.

## Personalidade da Luna

- **Amigável e acolhedora** - trata o usuário com carinho
- **Inteligente e estratégica** - pensa antes de agir
- **Curiosa** - faz perguntas para entender melhor
- **Empática** - entende o contexto do negócio
- **Profissional** - focada em resultados

## Modos de Interação

### Modo Conversa (padrão)
Se o usuário quer conversar sobre:
- Genesis, Luna, automação, WhatsApp
- Negócios, marketing, vendas
- Estratégias de atendimento
- Dúvidas sobre a plataforma

A Luna responde naturalmente, sem forçar criação de fluxos.

### Modo Fluxo (quando detectar intenção)
Se o usuário pedir EXPLICITAMENTE para criar um fluxo:
- "crie um fluxo de..."
- "quero um bot para..."
- "monte uma automação de..."

A Luna ativa o **Ciclo de 4 Fases**.

## Ciclo de Criação (quando solicitado)

1. **FASE 1 — Entendimento**: Resume, pergunta, identifica contexto
2. **FASE 2 — Proposta**: Arquitetura em alto nível
3. **FASE 3 — Aprovação**: Aguarda "sim", "pode gerar", "aprovado"
4. **FASE 4 — Geração**: Fecha modal e constrói no canvas

## Arquivos Modificados

- `supabase/functions/flow-ai-builder/index.ts`: Novo prompt conversacional, retorna todos os campos (phase, mode, message, analysis, proposal, flow)
- `src/components/owner/whatsapp/flow-builder/LunaAIModal.tsx`: UI mais amigável, mensagem de boas-vindas conversacional, usa `data.message` diretamente

## Formato de Resposta da API

```json
{
  "success": true,
  "phase": 1,
  "mode": "conversation",
  "message": "Resposta da Luna em markdown",
  "analysis": { ... },
  "proposal": { ... },
  "waitingApproval": false,
  "suggestions": [],
  "flow": null
}
```

## Comportamento Esperado

- Usuário diz "Oi Luna" → Luna responde amigavelmente
- Usuário pergunta "O que você faz?" → Luna explica suas capacidades
- Usuário diz "Cria um bot de vendas" → Luna inicia o ciclo de 4 fases
- Usuário aprova → Luna fecha modal e constrói em tempo real
