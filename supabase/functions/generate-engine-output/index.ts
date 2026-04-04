import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { nodes, edges, prospect_context, output_type, user_instruction } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build rich context from nodes
    const nodesSummary = (nodes || []).map((n: any) => {
      const type = n.data?.nodeType || n.type || 'unknown';
      const label = n.data?.label || n.type;
      const content = n.data?.content || n.data?.description || '';
      return `[${type.toUpperCase()} - ${label}]:\n${content || '(vazio)'}`;
    }).join("\n\n");

    const edgesSummary = (edges || []).map((e: any) => `${e.source} → ${e.target}`).join(", ");

    const prospectInfo = prospect_context ? `
EMPRESA: ${prospect_context.company_name || 'N/A'}
NICHO: ${prospect_context.niche || prospect_context.questionnaire_answers?.niche || 'N/A'}
CONTATO: ${prospect_context.contact_name || 'N/A'}
TELEFONE: ${prospect_context.company_phone || 'N/A'}
EMAIL: ${prospect_context.company_email || 'N/A'}
CNPJ: ${prospect_context.company_cnpj || 'N/A'}
RESPOSTAS DO QUESTIONÁRIO: ${JSON.stringify(prospect_context.questionnaire_answers || {})}
NOTAS: ${prospect_context.notes || 'N/A'}
` : 'Sem contexto de prospect';

    // ─── BUILD STRUCTURE ───
    if (output_type === 'build_structure') {
      const structurePrompt = `Você é o Genesis Engine, um motor de conversão e planejamento estratégico. Analise o prospect e gere uma estrutura de blocos para o canvas.

CONTEXTO DO PROSPECT:
${prospectInfo}

BLOCOS JÁ EXISTENTES NO CANVAS:
${nodesSummary || 'Apenas o bloco Prospect inicial'}

CONEXÕES EXISTENTES:
${edgesSummary || 'Nenhuma'}

${user_instruction ? `INSTRUÇÃO DO USUÁRIO: ${user_instruction}` : ''}

TIPOS DE BLOCOS DISPONÍVEIS (use EXATAMENTE estes types):
- diagnosis: Diagnóstico da situação atual
- pain: Dor principal do cliente
- opportunity: Oportunidade identificada
- strategy: Estratégia de conversão
- offer: Oferta/proposta de valor
- differentials: Diferenciais competitivos
- objections: Objeções e respostas
- approach: Estratégia de abordagem
- scope: Escopo técnico
- structure: Estrutura técnica (frontend/backend/DB)
- integrations: Integrações e APIs
- automation: Automações
- followup: Follow-up comercial
- checklist: Checklist de implementação
- deploy: Estratégia de entrega
- prompt: Prompt final consolidado
- notes: Notas gerais

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`, sem texto antes ou depois) com esta estrutura:
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "diagnosis",
      "label": "Nome do bloco",
      "content": "Conteúdo detalhado, útil e específico para este prospect. Preencha com análise real baseada nos dados disponíveis.",
      "position": { "x": 400, "y": 100 }
    }
  ],
  "edges": [
    { "source": "prospect-1", "target": "unique-id" }
  ]
}

REGRAS OBRIGATÓRIAS:
1. Crie entre 6 e 10 blocos baseados no contexto REAL do prospect
2. NÃO crie blocos que já existem no canvas
3. Preencha CADA bloco com conteúdo relevante e específico (mínimo 3 linhas por bloco)
4. Posicione em grid organizado: coluna 1 (x=400), coluna 2 (x=700), coluna 3 (x=1000), linhas com y espaçados de ~180px começando em y=80
5. Conecte ao prospect-1 e entre si em ordem lógica de fluxo
6. Siga esta ordem: diagnóstico → dor → oportunidade → estratégia → oferta → escopo → estrutura → deploy
7. O conteúdo deve ser ACIONÁVEL e não genérico. Use dados reais do prospect`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: structurePrompt }],
          stream: true,
        }),
      });

      if (!response.ok) {
        const t = await response.text();
        console.error("AI gateway error:", response.status, t);
        return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
          status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // ─── TEXT-BASED OUTPUTS ───
    const outputInstructions: Record<string, string> = {
      prompt: `Gere um PROMPT COMPLETO, EXTREMAMENTE DETALHADO e PROFISSIONAL para construir a solução ideal para este cliente.

O prompt deve ser estruturado nas seguintes seções obrigatórias:

## 1. VISÃO GERAL DO PROJETO
- Nome do projeto
- Objetivo principal
- Público-alvo
- Proposta de valor

## 2. FRONTEND
- Framework e tecnologias
- Páginas e rotas
- Componentes principais
- Design system (cores, tipografia, espaçamento)
- Responsividade
- Animações e interações
- SEO

## 3. BACKEND
- Arquitetura
- Autenticação e autorização
- APIs e endpoints
- Regras de negócio
- Validações

## 4. BANCO DE DADOS
- Tabelas e relações
- Campos de cada tabela
- Indexes e constraints
- RLS policies

## 5. INTEGRAÇÕES
- APIs externas
- Webhooks
- Serviços terceiros

## 6. AUTOMAÇÕES
- Fluxos automáticos
- Triggers
- Notificações
- Agendamentos

## 7. PAINEL ADMINISTRATIVO
- Funcionalidades
- Dashboard
- Gestão de dados
- Relatórios

## 8. EXPERIÊNCIA DO USUÁRIO
- Fluxos do usuário
- Onboarding
- Feedback visual
- Acessibilidade

## 9. PERFORMANCE E SEGURANÇA
- Cache
- Lazy loading
- Rate limiting
- Proteção de dados

## 10. PLANO DE EXECUÇÃO
- Ordem de implementação
- Prioridades
- Dependências

O prompt deve ser COMPLETO e PRONTO para copiar e usar diretamente em uma IA de desenvolvimento.
Deve gerar um sistema funcional, profissional e de alta qualidade.`,

      scope: `Gere um ESCOPO TÉCNICO COMPLETO e DETALHADO incluindo:
- Módulos do sistema com descrição detalhada
- Funcionalidades por módulo com critérios de aceite
- Tecnologias recomendadas com justificativa
- Estimativa de complexidade por módulo
- Prioridades (P0 = crítico, P1 = importante, P2 = desejável)
- Dependências entre módulos
- O que ENTRA no escopo (com detalhe)
- O que NÃO ENTRA no escopo
- Entregáveis finais
- Premissas e restrições`,

      blueprint: `Gere um BLUEPRINT TÉCNICO COMPLETO incluindo:
- Arquitetura geral (diagrama textual)
- Stack de frontend com justificativa
- Stack de backend com justificativa
- Modelo de dados completo (tabelas, campos, relações)
- APIs e endpoints (método, rota, payload, resposta)
- Sistema de autenticação e autorização
- Integrações externas
- Estratégia de deploy
- Estratégia de monitoramento
- Plano de escalabilidade`,

      strategy: `Gere a MELHOR ESTRATÉGIA COMERCIAL para fechar este cliente:
- Diagnóstico comercial do cenário
- Proposta de valor clara e diferenciada
- Argumentos principais (mínimo 5)
- Objeções prováveis e contra-argumentos
- Diferenciação competitiva
- Modelo de precificação sugerido
- Sequência de abordagem (passo a passo)
- Gatilhos mentais aplicáveis
- Follow-up strategy
- Métricas de sucesso do projeto para o cliente`,

      checklist: `Gere um CHECKLIST DE IMPLEMENTAÇÃO completo organizado por fases:

## FASE 1 - SETUP (Semana 1)
- [ ] itens...

## FASE 2 - CORE (Semanas 2-3)
- [ ] itens...

## FASE 3 - FEATURES (Semanas 3-4)
- [ ] itens...

## FASE 4 - POLISH (Semana 5)
- [ ] itens...

## FASE 5 - DEPLOY (Semana 6)
- [ ] itens...

Cada item deve ser específico, acionável e ter critério claro de conclusão.`,

      executive: `Gere um RESUMO EXECUTIVO profissional para apresentar ao cliente:
- Contexto e diagnóstico
- Solução proposta (visão geral)
- Benefícios e impacto esperado
- Diferenciais da solução
- Cronograma resumido
- Investimento e retorno esperado
- Próximos passos
Formate para ser apresentável diretamente ao decisor.`,

      analyze: `Analise TODOS os blocos do canvas, o contexto do prospect e as conexões.

Retorne:
1. DIAGNÓSTICO GERAL - estado atual do canvas
2. GAPS IDENTIFICADOS - o que falta ser coberto
3. OPORTUNIDADES - o que pode ser explorado
4. RISCOS - pontos de atenção
5. SUGESTÕES DE MELHORIA - ações específicas para cada bloco
6. PRÓXIMOS PASSOS RECOMENDADOS - em ordem de prioridade
7. SCORE DE COMPLETUDE - de 0 a 100%`,

      objections: `Analise o contexto e gere um FLUXO COMPLETO DE OBJEÇÕES:

Para cada objeção:
### OBJEÇÃO: [título]
- **Probabilidade**: Alta/Média/Baixa
- **Momento**: Quando surge no processo
- **Argumento do cliente**: O que ele diz
- **Resposta recomendada**: Como responder
- **Evidência de suporte**: Dados ou casos
- **Contra-argumento final**: Fechamento

Liste pelo menos 8 objeções ordenadas por probabilidade.`,

      deploy_plan: `Gere um PLANO DE ENTREGA completo:

## TIMELINE
- Marcos principais com datas relativas

## FASES
Para cada fase:
- Objetivo
- Entregáveis
- Critérios de aceite
- Dependências
- Riscos e mitigações

## AMBIENTE
- Staging
- Produção
- CI/CD

## PÓS-ENTREGA
- Monitoramento
- Suporte
- Iterações planejadas`,
    };

    const systemPrompt = `Você é o Genesis Engine, um motor de conversão e planejamento estratégico de alta performance.

Você analisa contextos comerciais, dados de prospects e estratégias visuais para gerar saídas altamente precisas, detalhadas e acionáveis.

CONTEXTO DO PROSPECT:
${prospectInfo}

BLOCOS DO CANVAS:
${nodesSummary || 'Nenhum bloco adicionado'}

CONEXÕES:
${edgesSummary || 'Nenhuma conexão'}

${user_instruction ? `INSTRUÇÃO ADICIONAL DO USUÁRIO: ${user_instruction}` : ''}

REGRAS:
- Responda SEMPRE em português brasileiro
- Seja EXTREMAMENTE detalhado, técnico e profissional
- Use dados REAIS do prospect (não genéricos)
- Formate com markdown (headers, listas, negrito, código)
- Cada seção deve ter conteúdo substancial
- O resultado deve ser PRONTO PARA USO, não um rascunho`;

    const userMessage = outputInstructions[output_type] || outputInstructions.prompt;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Engine error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
