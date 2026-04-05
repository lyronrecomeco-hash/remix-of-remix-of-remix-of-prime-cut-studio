import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { nodes, edges, prospect_context, output_type, user_instruction, chat_history } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const nodesSummary = (nodes || []).map((n: any) => {
      const type = n.data?.nodeType || n.type || 'unknown';
      const label = n.data?.label || n.type;
      const content = n.data?.content || n.data?.description || '';
      return `[${type.toUpperCase()} - ${label}]:\n${content || '(vazio)'}`;
    }).join("\n\n");

    const edgesSummary = (edges || []).map((e: any) => `${e.source} → ${e.target}`).join(", ");

    const qa = prospect_context?.questionnaire_answers || {};
    const prospectInfo = prospect_context ? `
EMPRESA: ${prospect_context.company_name || 'N/A'}
NICHO: ${prospect_context.niche || qa.niche || 'N/A'}
CONTATO: ${prospect_context.contact_name || 'N/A'}
TELEFONE: ${prospect_context.company_phone || 'N/A'}
EMAIL: ${prospect_context.company_email || 'N/A'}
CNPJ: ${prospect_context.company_cnpj || 'N/A'}
WEBSITE: ${qa.website || prospect_context.company_website || 'N/A'}
INSTAGRAM: ${qa.instagram || prospect_context.instagram || 'N/A'}
ENDEREÇO: ${qa.address || prospect_context.company_address || 'N/A'}
CIDADE: ${qa.city || prospect_context.company_city || 'N/A'}
ESTADO: ${qa.state || prospect_context.company_state || 'N/A'}
SERVIÇOS: ${qa.services || prospect_context.services || 'N/A'}
HORÁRIO: ${qa.opening_hours || prospect_context.opening_hours || 'N/A'}
OBJETIVO: ${qa.objective || 'N/A'}
RESPOSTAS: ${JSON.stringify(qa)}
NOTAS: ${prospect_context.notes || 'N/A'}
` : 'Sem contexto de prospect';

    // ─── CHAT MODE (Intent Engine) ───
    if (output_type === 'chat') {
      const chatSystemPrompt = `Você é o Copiloto do Genesis Engine — um assistente de IA conversacional, inteligente e estratégico.

CONTEXTO DO PROSPECT:
${prospectInfo}

CANVAS ATUAL (${(nodes || []).length} blocos):
${nodesSummary || 'Vazio'}

CONEXÕES: ${edgesSummary || 'Nenhuma'}

## MOTOR DE INTENÇÃO — REGRAS OBRIGATÓRIAS

Antes de responder, CLASSIFIQUE a intenção do usuário:

1. **SAUDAÇÃO** (oi, olá, eai, bom dia, etc.) → Responda de forma amigável e curta. Pergunte como pode ajudar. NÃO gere nenhum documento, análise ou estrutura.

2. **PERGUNTA SIMPLES** (o que é, como funciona, me explica, etc.) → Responda a pergunta de forma clara e direta. Curta.

3. **PEDIDO DE ANÁLISE** (analisa, avalia, o que acha, revisa, etc.) → Analise o canvas/prospect e dê insights acionáveis.

4. **PEDIDO DE ESTRATÉGIA** (estratégia, como vender, como abordar, etc.) → Gere estratégia comercial focada.

5. **PEDIDO DE COPY/MENSAGEM** (cria mensagem, escreve abordagem, copy, etc.) → Gere copy curta e profissional.

6. **PEDIDO DE ESTRUTURA/CANVAS** (monta canvas, cria blocos, estrutura, etc.) → Responda que o usuário deve usar o botão "Montar canvas" ou diga que vai preparar um plano.

7. **PEDIDO DE BUILD SPEC/PROMPT/BLUEPRINT** → Responda que o usuário pode usar os botões de ação rápida no topo, ou diga que vai gerar.

8. **DESCRIÇÃO DE IDEIA/PROJETO** (quero criar um..., minha ideia é..., preciso de um sistema que...) → Monte um PLANO DE AÇÃO profissional e compacto com:
   - Visão geral do que será construído
   - Módulos principais (máximo 6)
   - Tecnologias recomendadas
   - Estimativa de complexidade
   
   E termine com EXATAMENTE este bloco:
   \`\`\`action
   {"type":"approval","title":"Plano de Ação","description":"Deseja que eu implemente este plano no canvas?"}
   \`\`\`

9. **APROVAÇÃO** (aprovo, pode fazer, sim, manda ver, implementa, etc.) → Responda confirmando e inclua:
   \`\`\`action
   {"type":"execute_plan"}
   \`\`\`

10. **CONVERSA GERAL** → Converse naturalmente sobre o tema.

## REGRAS DE COMPORTAMENTO

- NUNCA gere documentos longos sem pedido explícito
- NUNCA gere build spec, blueprint, escopo automaticamente
- Respostas conversacionais devem ter no MÁXIMO 4-6 linhas
- Seja amigável, profissional e direto
- Use o nome da empresa do prospect quando relevante
- Mantenha contexto da conversa anterior
- Português brasileiro sempre
- Markdown limpo e bem formatado`;

      // Build messages array with history
      const aiMessages: any[] = [{ role: "system", content: chatSystemPrompt }];

      // Add chat history for context continuity
      if (Array.isArray(chat_history) && chat_history.length > 0) {
        for (const msg of chat_history.slice(-10)) {
          if (msg.role === 'user' || msg.role === 'assistant') {
            aiMessages.push({ role: msg.role, content: msg.content });
          }
        }
      }

      // Add current message
      aiMessages.push({ role: "user", content: user_instruction || "Olá" });

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: aiMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        return handleAIError(response);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

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
      "content": "Conteúdo detalhado, útil e específico para este prospect.",
      "position": { "x": 400, "y": 100 }
    }
  ],
  "edges": [
    { "source": "prospect-1", "target": "unique-id" }
  ]
}

REGRAS:
1. Crie entre 6 e 10 blocos baseados no contexto REAL do prospect
2. NÃO crie blocos que já existem no canvas
3. Preencha CADA bloco com conteúdo relevante (mínimo 3 linhas)
4. Posicione em grid: col1 x=400, col2 x=700, col3 x=1000, rows y espaçados ~180px
5. Conecte ao prospect-1 e entre si
6. Use dados reais do prospect, NUNCA placeholders`;

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

      if (!response.ok) return handleAIError(response);

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // ─── ENRICH CONTEXT ───
    if (output_type === 'enrich_context') {
      const enrichPrompt = `Você é um analista de negócios digital especialista. Analise o prospect abaixo e enriqueça o contexto com insights estratégicos.

DADOS DO PROSPECT:
${prospectInfo}

BLOCOS DO CANVAS:
${nodesSummary || 'Nenhum'}

${user_instruction ? `INSTRUÇÃO: ${user_instruction}` : ''}

Gere uma análise completa:

## PERFIL DO NEGÓCIO
- Tipo, posicionamento, público-alvo, maturidade digital (1-10)

## PRESENÇA DIGITAL
- Análise de website/redes sociais, pontos fortes, lacunas

## OPORTUNIDADES COMERCIAIS
- Serviços indicados, ticket estimado, recorrência, urgência

## DORES PROVÁVEIS
- Top 5 dores com impacto no faturamento e argumento comercial

## CONCORRÊNCIA E DIFERENCIAÇÃO
- Posicionamento de similares, oportunidades, benchmarks

## BRANDING SUGERIDO
- Paleta de cores (hex), estilo visual, tom de comunicação

Seja específico. Use dados do prospect. Nada genérico.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: enrichPrompt }],
          stream: true,
        }),
      });

      if (!response.ok) return handleAIError(response);

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // ─── DOCUMENT OUTPUTS ───
    const outputInstructions: Record<string, string> = {
      prompt: `Você é um arquiteto de software sênior e estrategista de produto digital de classe mundial. Gere um BUILD SPEC SUPREMO — o documento mais completo, profissional e encantador que uma IA de desenvolvimento já recebeu.

Este documento deve ser TÃO BOM que qualquer IA de desenvolvimento consiga construir o sistema inteiro sem uma única pergunta.

REGRAS:
- Use dados REAIS do prospect nos exemplos
- NUNCA use placeholders genéricos
- Cada endpoint com método, rota, payload e resposta
- Cada tabela com TODOS os campos
- O resultado deve ser PRONTO PARA USO

Inclua: Identidade do Produto, Design System, Frontend (páginas e rotas), Backend (endpoints), Banco de Dados (schema SQL), Integrações, Automações, Painel Admin, UX, Segurança, Deploy, Estrutura de Pastas, Checklist.`,

      scope: `Gere um ESCOPO TÉCNICO COMPLETO:
- Módulos do sistema com descrição
- Funcionalidades por módulo com critérios de aceite
- Tecnologias recomendadas
- Estimativa de complexidade (horas)
- Prioridades (P0, P1, P2)
- O que entra e o que NÃO entra
- Cronograma sugerido`,

      blueprint: `Gere um BLUEPRINT TÉCNICO COMPLETO:
- Arquitetura geral (diagrama textual)
- Stack frontend e backend
- Modelo de dados completo
- APIs e endpoints
- Autenticação e autorização
- Integrações externas
- Deploy e monitoramento`,

      strategy: `Gere a MELHOR ESTRATÉGIA COMERCIAL:
- Diagnóstico comercial
- Proposta de valor
- Argumentos principais (mínimo 5)
- Objeções e contra-argumentos
- Diferenciação competitiva
- Precificação sugerida
- Sequência de abordagem
- Follow-up strategy`,

      checklist: `Gere um CHECKLIST DE IMPLEMENTAÇÃO por fases:
## FASE 1 - SETUP (Semana 1)
## FASE 2 - CORE (Semanas 2-3)
## FASE 3 - FEATURES (Semanas 3-4)
## FASE 4 - ADMIN (Semana 5)
## FASE 5 - POLISH (Semana 5-6)
## FASE 6 - DEPLOY (Semana 6)
Cada item específico e acionável.`,

      executive: `Gere um RESUMO EXECUTIVO profissional:
- Contexto e diagnóstico
- Solução proposta
- Benefícios e impacto
- Diferenciais
- Cronograma
- Investimento e ROI
- Próximos passos`,

      analyze: `Analise TODOS os blocos do canvas:
1. DIAGNÓSTICO GERAL
2. GAPS IDENTIFICADOS
3. OPORTUNIDADES
4. RISCOS
5. SUGESTÕES DE MELHORIA
6. QUALIDADE DO CONTEÚDO
7. PRÓXIMOS PASSOS
8. SCORE DE COMPLETUDE (0-100%)`,

      objections: `Gere um FLUXO DE OBJEÇÕES (mínimo 8):
Para cada: título, probabilidade, momento, argumento do cliente, resposta, evidência, contra-argumento final.`,

      deploy_plan: `Gere um PLANO DE ENTREGA:
- Timeline com marcos
- Fases com entregáveis e critérios de aceite
- Ambiente (staging/produção)
- Pós-entrega (monitoramento, suporte, iterações)`,
    };

    const systemPrompt = `Você é o Genesis Engine, um motor de conversão e planejamento estratégico de alta performance.

CONTEXTO DO PROSPECT:
${prospectInfo}

BLOCOS DO CANVAS:
${nodesSummary || 'Nenhum bloco'}

CONEXÕES: ${edgesSummary || 'Nenhuma'}

${user_instruction ? `INSTRUÇÃO DO USUÁRIO: ${user_instruction}` : ''}

REGRAS:
- Português brasileiro sempre
- Extremamente detalhado, técnico e profissional
- Use dados REAIS do prospect. NUNCA placeholders
- Markdown limpo: ## seções, **negrito**, - listas
- Resultado PRONTO PARA USO`;

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

    if (!response.ok) return handleAIError(response);

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

async function handleAIError(response: Response) {
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
