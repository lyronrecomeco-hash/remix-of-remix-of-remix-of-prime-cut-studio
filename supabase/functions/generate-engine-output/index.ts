import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type AIMessage = { role: string; content: string };

type LocalFallbackContext = {
  outputType: string;
  userInstruction?: string;
  prospectContext?: Record<string, any> | null;
  nodes?: Array<{ type?: string; data?: Record<string, any> }>;
  edges?: Array<{ source?: string; target?: string }>;
  chatHistory?: AIMessage[];
};

const OPENAI_MODEL = "gpt-4o-mini";
const GEMINI_MODEL = "gemini-2.0-flash";
const LOVABLE_MODEL = "google/gemini-2.5-flash";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { nodes, edges, prospect_context, output_type, user_instruction, chat_history } = await req.json();

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

    const fallbackContext: LocalFallbackContext = {
      outputType: output_type || 'chat',
      userInstruction: user_instruction,
      prospectContext: prospect_context,
      nodes: Array.isArray(nodes) ? nodes : [],
      edges: Array.isArray(edges) ? edges : [],
      chatHistory: Array.isArray(chat_history) ? chat_history : [],
    };

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

      return await streamAIResponse(aiMessages, {}, fallbackContext);
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

      return await streamAIResponse([{ role: "user", content: structurePrompt }], { forceJson: true }, fallbackContext);
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

      return await streamAIResponse([{ role: "user", content: enrichPrompt }], {}, fallbackContext);
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

    return await streamAIResponse([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ], {}, fallbackContext);
  } catch (e) {
    console.error("Engine error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function streamAIResponse(
  messages: AIMessage[],
  options: { forceJson?: boolean } = {},
  fallbackContext: LocalFallbackContext,
) {
  const response = await callAIWithFallback(messages, options, fallbackContext);

  if (!response.ok) {
    return response;
  }

  return new Response(response.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

async function callAIWithFallback(
  messages: AIMessage[],
  options: { forceJson?: boolean } = {},
  fallbackContext: LocalFallbackContext,
): Promise<Response> {
  const providers = [
    {
      name: "OpenAI",
      enabled: !!Deno.env.get("OPENAI_API_KEY"),
      execute: () => callOpenAI(messages, options),
    },
    {
      name: "Gemini",
      enabled: !!Deno.env.get("GEMINI_API_KEY"),
      execute: () => callGemini(messages, options),
    },
    {
      name: "Lovable AI",
      enabled: !!Deno.env.get("LOVABLE_API_KEY"),
      execute: () => callLovableAI(messages),
    },
  ].filter((provider) => provider.enabled);

  if (providers.length === 0) {
    const localFallback = buildLocalFallbackResponse(fallbackContext);
    if (localFallback) return localFallback;
    return buildErrorResponse("Nenhum provedor de IA configurado.", 500);
  }

  const failures: Array<{ name: string; status?: number; body: string }> = [];

  for (const provider of providers) {
    try {
      const response = await provider.execute();

      if (response.ok) {
        console.log(`[generate-engine-output] Using ${provider.name}`);
        return response;
      }

      const body = await response.text();
      failures.push({ name: provider.name, status: response.status, body });
      console.error(`[generate-engine-output] ${provider.name} failed`, response.status, body);

      if (!shouldFallback(response.status, body)) {
        return handleProviderFailure(provider.name, response.status, body);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      failures.push({ name: provider.name, body: message });
      console.error(`[generate-engine-output] ${provider.name} threw`, message);
    }
  }

  const localFallback = buildLocalFallbackResponse(fallbackContext, failures);
  if (localFallback) {
    return localFallback;
  }

  const hasOnlyRateLimit = failures.length > 0 && failures.every((failure) => failure.status === 429);
  if (hasOnlyRateLimit) {
    return buildErrorResponse("Todos os provedores de IA atingiram limite de requisições no momento.", 429);
  }

  const hasOnlyCreditsIssue = failures.length > 0 && failures.every((failure) => failure.status === 402);
  if (hasOnlyCreditsIssue) {
    return buildErrorResponse("Todos os provedores de IA estão sem créditos disponíveis no momento.", 402);
  }

  return buildErrorResponse("Os provedores de IA falharam temporariamente. Tente novamente em instantes.", 500);
}

async function callOpenAI(messages: AIMessage[], options: { forceJson?: boolean }) {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    return buildErrorResponse("OPENAI_API_KEY não configurada.", 500);
  }

  return await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      temperature: 0.7,
      stream: true,
      ...(options.forceJson ? { response_format: { type: "json_object" } } : {}),
    }),
  });
}

async function callGemini(messages: AIMessage[], options: { forceJson?: boolean }) {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    return buildErrorResponse("GEMINI_API_KEY não configurada.", 500);
  }

  const systemMessage = messages.find((message) => message.role === "system")?.content;
  const contents = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(systemMessage ? { systemInstruction: { parts: [{ text: systemMessage }] } } : {}),
        contents: contents.length > 0 ? contents : [{ role: "user", parts: [{ text: "Olá" }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          ...(options.forceJson ? { responseMimeType: "application/json" } : {}),
        },
      }),
    }
  );

  if (!response.ok) {
    return response;
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("") || "";

  if (!text) {
    return buildErrorResponse("Gemini retornou resposta vazia.", 500);
  }

  return new Response(createSSEStreamFromText(text), {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

async function callLovableAI(messages: AIMessage[]) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return buildErrorResponse("LOVABLE_API_KEY não configurada.", 500);
  }

  return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: LOVABLE_MODEL,
      messages,
      temperature: 0.7,
      stream: true,
    }),
  });
}

function shouldFallback(status: number, body = "") {
  if (status === 400) {
    return /API_KEY_INVALID|invalid api key|api key not valid|incorrect api key|invalid_request_error/i.test(body);
  }

  return status === 401 || status === 402 || status === 403 || status === 404 || status === 429 || status >= 500;
}

function handleProviderFailure(providerName: string, status: number, body: string) {
  if (status === 429) {
    return buildErrorResponse(`${providerName} atingiu o limite de requisições.`, 429);
  }
  if (status === 402) {
    return buildErrorResponse(`${providerName} está sem créditos disponíveis.`, 402);
  }

  console.error(`[generate-engine-output] ${providerName} non-fallbackable error`, status, body);
  return buildErrorResponse(`Erro no provedor ${providerName}.`, 500);
}

function buildLocalFallbackResponse(
  context: LocalFallbackContext,
  failures: Array<{ name: string; status?: number; body: string }> = [],
) {
  const content = buildLocalFallbackOutput(context);
  if (!content) return null;

  console.warn(`[generate-engine-output] Using local fallback for ${context.outputType}`, failures);

  return new Response(createSSEStreamFromText(content), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "X-Genesis-Fallback": "local",
    },
  });
}

function buildLocalFallbackOutput(context: LocalFallbackContext) {
  switch (context.outputType) {
    case "chat":
      return buildLocalChatResponse(context);
    case "build_structure":
      return JSON.stringify(buildLocalStructure(context), null, 2);
    case "enrich_context":
      return buildLocalEnrichment(context);
    case "analyze":
      return buildLocalAnalysis(context);
    case "strategy":
      return buildLocalStrategy(context);
    case "scope":
      return buildLocalScope(context);
    case "blueprint":
      return buildLocalBlueprint(context);
    case "prompt":
      return buildLocalPrompt(context);
    case "checklist":
      return buildLocalChecklist(context);
    case "executive":
      return buildLocalExecutive(context);
    case "objections":
      return buildLocalObjections(context);
    case "deploy_plan":
      return buildLocalDeployPlan(context);
    default:
      return null;
  }
}

function buildLocalChatResponse(context: LocalFallbackContext) {
  const facts = extractProspectFacts(context.prospectContext);
  const message = getLatestUserMessage(context).toLowerCase();
  const existingTypes = getExistingNodeTypes(context.nodes || []);
  const priorityBlocks = recommendPriorityBlocks(existingTypes).slice(0, 5).map((type) => NODE_LABELS[type]);

  if (isApprovalIntent(message)) {
    return [
      `Perfeito — vou aplicar o plano no canvas da ${facts.companyName} agora.`,
      "",
      "```action",
      '{"type":"execute_plan"}',
      "```",
    ].join("\n");
  }

  if (isGreetingIntent(message)) {
    return [
      `Oi! Já revisei o canvas da ${facts.companyName}.`,
      `Hoje a prioridade é conectar contexto, oferta e execução para ${facts.niche}.`,
      `Se quiser, eu já monto a próxima estrutura ideal em cima do que falta no fluxo.`,
    ].join("\n");
  }

  if (isCanvasIntent(message)) {
    return [
      `Posso deixar o canvas da ${facts.companyName} funcional em ${priorityBlocks.length} frentes:`,
      ...priorityBlocks.map((item) => `- ${item}`),
      "",
      "```action",
      '{"type":"approval","title":"Plano de Ação","description":"Deseja que eu implemente esta estrutura no canvas?"}',
      "```",
    ].join("\n");
  }

  if (isAnalysisIntent(message)) {
    const gaps = recommendPriorityBlocks(existingTypes).slice(0, 3).map((type) => NODE_LABELS[type]).join(", ");
    return [
      `### Leitura rápida do canvas`,
      `- Negócio: **${facts.companyName}** (${facts.niche}${facts.location ? ` • ${facts.location}` : ""})`,
      `- Estrutura atual cobre **${existingTypes.size || 1}** frente(s), mas ainda faltam: **${gaps || 'ajustes finos de execução'}**.`,
      `- Melhor caminho agora: fechar proposta, abordagem e rotina de follow-up antes de escalar o envio.`,
    ].join("\n");
  }

  if (isStrategyIntent(message)) {
    return [
      `### Estratégia recomendada`,
      `- Posicione ${facts.companyName} com foco em resultado visível para ${facts.niche}.`,
      `- Abra contato com diagnóstico curto, prova de oportunidade e CTA para reunião rápida.`,
      `- Depois conecte oferta, objeções e follow-up em uma trilha única de conversão.`,
    ].join("\n");
  }

  if (isCopyIntent(message)) {
    return [
      `Posso te sugerir esta abordagem inicial para ${facts.companyName}:`,
      `"Notei uma oportunidade clara para ${facts.niche} ganhar previsibilidade comercial${facts.location ? ` em ${facts.location}` : ""}.`,
      `Montei uma estrutura simples para diagnosticar gargalos, organizar a oferta e acelerar conversão.`,
      `Se fizer sentido, te mostro em 10 minutos como isso entra no fluxo atual."`,
    ].join("\n");
  }

  return [
    `Entendi. Para ${facts.companyName}, eu seguiria em três passos:`,
    `1. consolidar diagnóstico e proposta,`,
    `2. transformar isso em abordagem comercial,`,
    `3. fechar com execução e follow-up.`,
    `Se quiser, eu monto isso no canvas agora sem mexer no restante do fluxo.`,
  ].join("\n");
}

function buildLocalStructure(context: LocalFallbackContext) {
  const facts = extractProspectFacts(context.prospectContext);
  const existingTypes = getExistingNodeTypes(context.nodes || []);
  const selectedTypes = recommendPriorityBlocks(existingTypes).slice(0, 8);
  const finalTypes = selectedTypes.length > 0 ? selectedTypes : ["notes"];
  const columns = [400, 700, 1000];

  const nodes = finalTypes.map((type, index) => ({
    id: `${type}-${Date.now()}-${index + 1}`,
    type,
    label: NODE_LABELS[type],
    content: buildNodeContent(type, facts, existingTypes),
    position: {
      x: columns[index % columns.length],
      y: 100 + Math.floor(index / columns.length) * 180,
    },
  }));

  const edges = nodes.flatMap((node, index) => {
    if (index === 0) {
      return [{ source: "prospect-1", target: node.id }];
    }
    return [{ source: nodes[index - 1].id, target: node.id }];
  });

  return { nodes, edges };
}

function buildLocalEnrichment(context: LocalFallbackContext) {
  const facts = extractProspectFacts(context.prospectContext);
  const existingTypes = getExistingNodeTypes(context.nodes || []);

  return [
    "## PERFIL DO NEGÓCIO",
    `- Empresa: **${facts.companyName}**`,
    `- Nicho: **${facts.niche}**${facts.location ? ` • ${facts.location}` : ""}`,
    `- Maturidade digital estimada: **${estimateDigitalMaturity(facts, existingTypes)}/10**`,
    "",
    "## PRESENÇA DIGITAL",
    `- Ativos identificados: site **${facts.website ? 'presente' : 'não informado'}**, Instagram **${facts.instagram ? 'presente' : 'não informado'}**.`,
    "- Gap principal: transformar presença em jornada clara de captação, prova e conversão.",
    "",
    "## OPORTUNIDADES COMERCIAIS",
    `- Oferta recomendada: diagnóstico + estrutura de conversão para ${facts.niche}.`,
    "- Melhor ângulo comercial: previsibilidade, diferenciação e follow-up operacional.",
    "- Urgência estimada: média/alta quando já existe tráfego ou operação rodando sem rotina comercial.",
    "",
    "## DORES PROVÁVEIS",
    "- Falta de clareza da proposta de valor.",
    "- Abordagem comercial sem cadência e sem prova.",
    "- Processo de follow-up inconsistente.",
    "- Execução desconectada entre estratégia e operação.",
    "- Dependência excessiva de atendimento manual.",
    "",
    "## CONCORRÊNCIA E DIFERENCIAÇÃO",
    `- Diferencial viável: posicionar ${facts.companyName} com mensagem objetiva, oferta enxuta e resposta rápida.`,
    "- Benchmark implícito: operações locais que convertem melhor tendem a unir prova, urgência e CTA curto.",
    "",
    "## BRANDING SUGERIDO",
    "- Paleta: #0F172A, #1D4ED8, #22C55E, #F8FAFC",
    "- Estilo visual: direto, confiável e orientado a performance.",
    "- Tom de voz: consultivo, seguro e sem excesso de promessa.",
  ].join("\n");
}

function buildLocalAnalysis(context: LocalFallbackContext) {
  const facts = extractProspectFacts(context.prospectContext);
  const existingTypes = getExistingNodeTypes(context.nodes || []);
  const missing = recommendPriorityBlocks(existingTypes);
  const score = Math.max(35, Math.min(96, Math.round((existingTypes.size / ESSENTIAL_BLOCKS.length) * 100)));

  return [
    "## DIAGNÓSTICO GERAL",
    `- O canvas de **${facts.companyName}** já tem base para ${facts.niche}, mas ainda está incompleto para execução comercial contínua.`,
    "",
    "## GAPS IDENTIFICADOS",
    ...missing.slice(0, 5).map((type) => `- ${NODE_LABELS[type]}`),
    "",
    "## OPORTUNIDADES",
    "- Encadear descoberta, oferta e follow-up no mesmo fluxo.",
    "- Reduzir atrito no primeiro contato com mensagem mais objetiva.",
    "",
    "## RISCOS",
    "- Excesso de blocos soltos sem prioridade de execução.",
    "- WhatsApp/ação sem uma proposta bem amarrada antes.",
    "",
    "## SUGESTÕES DE MELHORIA",
    "- Consolidar diagnóstico, oportunidade e estratégia antes de disparar execução.",
    "- Criar bloco de objeções e bloco de follow-up se ainda não existirem.",
    "",
    "## QUALIDADE DO CONTEÚDO",
    `- Conteúdo atual: **${existingTypes.size >= 6 ? 'bom' : 'inicial'}**`,
    "",
    "## PRÓXIMOS PASSOS",
    "- Fechar a estrutura mínima e então revisar a copy de abordagem.",
    "",
    `## SCORE DE COMPLETUDE\n- **${score}%**`,
  ].join("\n");
}

function buildLocalStrategy(context: LocalFallbackContext) {
  const facts = extractProspectFacts(context.prospectContext);
  return [
    "## Diagnóstico Comercial",
    `- ${facts.companyName} precisa transformar contexto de ${facts.niche} em proposta clara e repetível.`,
    "",
    "## Proposta de Valor",
    `- Estruturar uma jornada comercial enxuta para gerar mais resposta, mais reunião e mais fechamento.`,
    "",
    "## Argumentos Principais",
    "- Clareza de posicionamento.",
    "- Redução de gargalos no primeiro contato.",
    "- Follow-up menos improvisado.",
    "- Melhor leitura de oportunidade comercial.",
    "- Execução com menos retrabalho.",
    "",
    "## Sequência de Abordagem",
    "- Diagnóstico curto → oportunidade visível → proposta objetiva → CTA de próxima etapa.",
    "",
    "## Follow-up Strategy",
    "- D0 contato inicial, D2 reforço com prova, D5 fechamento de agenda, D7 última tentativa com CTA simples.",
  ].join("\n");
}

function buildLocalScope(context: LocalFallbackContext) {
  const facts = extractProspectFacts(context.prospectContext);
  return [
    "## Módulos do Sistema",
    "- Diagnóstico comercial",
    "- Estrutura de oferta",
    "- Abordagem e objeções",
    "- Execução e follow-up",
    "",
    "## Funcionalidades por Módulo",
    `- Contexto do prospect de ${facts.companyName}`,
    "- Blocos de decisão e ação conectados",
    "- Saídas de estratégia, escopo e checklist",
    "",
    "## Tecnologias Recomendadas",
    "- React + TypeScript no frontend",
    "- Backend integrado para persistência e funções",
    "- Execução orientada por blocos no canvas",
    "",
    "## Prioridades",
    "- P0: diagnóstico, estratégia, abordagem",
    "- P1: objeções, follow-up, automação",
    "- P2: refinamentos e otimização",
  ].join("\n");
}

function buildLocalBlueprint(context: LocalFallbackContext) {
  const facts = extractProspectFacts(context.prospectContext);
  return [
    "## Arquitetura Geral",
    `- Entrada de contexto do prospect (${facts.companyName}) → processamento no engine → saídas acionáveis no canvas.`,
    "",
    "## Frontend",
    "- Canvas de blocos, chat copiloto, histórico de outputs e painel de execução.",
    "",
    "## Backend",
    "- Função de geração, persistência de sessões e conectores de execução.",
    "",
    "## Modelo de Dados",
    "- Sessão do engine, blocos/nodes, edges, outputs e logs de execução.",
    "",
    "## Segurança",
    "- Validação de entrada, isolamento por usuário e respostas resilientes a falhas de provedor.",
  ].join("\n");
}

function buildLocalPrompt(context: LocalFallbackContext) {
  const facts = extractProspectFacts(context.prospectContext);
  return [
    "## Prompt Consolidado",
    `Crie uma solução para ${facts.companyName}, do nicho ${facts.niche}${facts.location ? `, em ${facts.location}` : ""}.`,
    "Priorize diagnóstico comercial, oferta, objeções, abordagem, automação e follow-up.",
    "A resposta deve ser prática, orientada a conversão e pronta para virar blocos executáveis no canvas.",
    "Evite genericidade e use sempre o contexto real informado pelo prospect.",
  ].join("\n");
}

function buildLocalChecklist(context: LocalFallbackContext) {
  const facts = extractProspectFacts(context.prospectContext);
  return [
    "## FASE 1 - SETUP",
    `- Validar contexto de ${facts.companyName}`,
    "- Definir proposta central",
    "",
    "## FASE 2 - CORE",
    "- Montar blocos de diagnóstico, dor, oportunidade e estratégia",
    "- Validar sequência principal do canvas",
    "",
    "## FASE 3 - EXECUÇÃO",
    "- Fechar abordagem, objeções e follow-up",
    "- Testar conectores reais antes de escalar",
    "",
    "## FASE 4 - POLISH",
    "- Revisar copy, clareza e ordem dos blocos",
    "- Remover redundâncias e reforçar CTAs",
  ].join("\n");
}

function buildLocalExecutive(context: LocalFallbackContext) {
  const facts = extractProspectFacts(context.prospectContext);
  return [
    "## Contexto e Diagnóstico",
    `- ${facts.companyName} opera em ${facts.niche} e precisa de uma estrutura comercial mais previsível.`,
    "",
    "## Solução Proposta",
    "- Organizar o canvas em descoberta, proposta, abordagem e execução.",
    "",
    "## Benefícios",
    "- Menos improviso comercial",
    "- Mais clareza na proposta",
    "- Melhor cadência de follow-up",
    "",
    "## Próximos Passos",
    "- Aprovar a estrutura sugerida e aplicar no canvas.",
  ].join("\n");
}

function buildLocalObjections(context: LocalFallbackContext) {
  const facts = extractProspectFacts(context.prospectContext);
  return [
    `## Objeções prováveis para ${facts.companyName}`,
    "1. Já fazemos isso hoje → mostrar gargalos atuais e oportunidade perdida.",
    "2. Agora não é prioridade → conectar com impacto direto em resposta e fechamento.",
    "3. Parece complexo → quebrar em etapas simples e de rápida implementação.",
    "4. Preciso pensar melhor → propor próxima ação objetiva com baixo compromisso.",
    "5. Está caro → reposicionar em ganho operacional e previsibilidade comercial.",
    "6. Não tenho tempo → destacar redução de retrabalho e clareza na execução.",
    "7. Minha equipe não vai usar → estruturar rotina simples e acionável.",
    "8. Já tentei algo parecido → diferenciar pela organização do fluxo e follow-up real.",
  ].join("\n");
}

function buildLocalDeployPlan(context: LocalFallbackContext) {
  return [
    "## Timeline com Marcos",
    "- M1: estrutura mínima do canvas",
    "- M2: abordagem e objeções prontas",
    "- M3: execução e follow-up validados",
    "",
    "## Fases",
    "- Staging: validar fluxo e mensagens",
    "- Produção: ativar conectores e monitorar resposta",
    "",
    "## Pós-entrega",
    "- Ajustar gargalos, acompanhar uso real e iterar por prioridade.",
  ].join("\n");
}

const ESSENTIAL_BLOCKS = [
  "diagnosis",
  "pain",
  "opportunity",
  "strategy",
  "offer",
  "objections",
  "approach",
  "structure",
  "followup",
  "checklist",
] as const;

const NODE_LABELS: Record<string, string> = {
  diagnosis: "Diagnóstico",
  pain: "Dor Principal",
  opportunity: "Oportunidade",
  strategy: "Estratégia",
  offer: "Oferta",
  objections: "Objeções",
  approach: "Abordagem",
  structure: "Estrutura Técnica",
  integrations: "Integrações",
  automation: "Automações",
  followup: "Follow-up",
  checklist: "Checklist",
  deploy: "Deploy",
  prompt: "Prompt Final",
  notes: "Notas",
};

function extractProspectFacts(prospectContext?: Record<string, any> | null) {
  const qa = prospectContext?.questionnaire_answers || {};
  const companyName = prospectContext?.company_name || "o negócio";
  const niche = prospectContext?.niche || qa.niche || "negócio local";
  const city = prospectContext?.company_city || qa.city || "";
  const state = prospectContext?.company_state || qa.state || "";
  const website = prospectContext?.company_website || qa.website || "";
  const instagram = prospectContext?.instagram || qa.instagram || "";
  const services = prospectContext?.services || qa.services || "";
  const location = [city, state].filter(Boolean).join(" • ");

  return { companyName, niche, city, state, website, instagram, services, location };
}

function getExistingNodeTypes(nodes: Array<{ type?: string; data?: Record<string, any> }>) {
  return new Set(
    nodes
      .map((node) => node?.data?.nodeType || node?.type)
      .filter((value): value is string => typeof value === "string" && value.length > 0),
  );
}

function recommendPriorityBlocks(existingTypes: Set<string>) {
  return [
    "diagnosis",
    "pain",
    "opportunity",
    "strategy",
    "offer",
    "objections",
    "approach",
    "structure",
    "integrations",
    "automation",
    "followup",
    "checklist",
    "deploy",
    "prompt",
    "notes",
  ].filter((type) => !existingTypes.has(type));
}

function buildNodeContent(type: string, facts: ReturnType<typeof extractProspectFacts>, existingTypes: Set<string>) {
  const base = {
    diagnosis: [
      `Negócio analisado: ${facts.companyName} no nicho ${facts.niche}${facts.location ? `, em ${facts.location}` : ""}.`,
      "O canvas precisa ligar leitura de cenário, proposta de valor e ação comercial em sequência única.",
      "Prioridade imediata: reduzir dispersão e concentrar o fluxo em conversão.",
    ],
    pain: [
      `A dor mais provável de ${facts.companyName} é ter operação ativa sem uma rotina comercial suficientemente clara.`,
      "Isso costuma gerar perda de timing, baixa resposta e follow-up inconsistente.",
      "O bloco deve orientar a conversa para impacto de faturamento e previsibilidade.",
    ],
    opportunity: [
      `Existe espaço para posicionar ${facts.companyName} com mais clareza diante do mercado de ${facts.niche}.`,
      "A melhor oportunidade é unir proposta objetiva, abordagem simples e prova de valor rápida.",
      "Isso encurta decisão e melhora a qualidade do próximo passo comercial.",
    ],
    strategy: [
      `Estratégia central: transformar o contexto de ${facts.companyName} em uma oferta simples de entender e fácil de vender.`,
      "Sequência sugerida: diagnóstico curto → oportunidade → proposta → CTA.",
      "Tudo no canvas deve servir para aproximar esse fechamento.",
    ],
    offer: [
      `Oferta recomendada: estrutura de conversão orientada a resultado para ${facts.niche}.`,
      "A entrega precisa ser clara, com início rápido e ganho percebido logo no começo.",
      "Evite amplitude demais; foque em poucos elementos com alta utilidade prática.",
    ],
    objections: [
      "Antecipe as objeções antes da execução para não travar o fluxo no momento do contato.",
      "Principais respostas devem cobrir prioridade, custo, tempo e confiança na implementação.",
      "Esse bloco protege o fechamento e melhora a consistência da abordagem.",
    ],
    approach: [
      `Abordagem sugerida: abrir com diagnóstico enxuto e oportunidade específica para ${facts.companyName}.`,
      "Depois apresentar a proposta em linguagem direta, sem excesso de detalhe técnico no primeiro contato.",
      "Finalizar sempre com CTA curto e fácil de responder.",
    ],
    structure: [
      "A estrutura técnica deve sustentar captação, decisão e execução sem retrabalho.",
      "Organize frontend, dados e automações em blocos independentes, mas conectados pela mesma lógica comercial.",
      "O objetivo é deixar o canvas operável e fácil de evoluir.",
    ],
    integrations: [
      "Mapeie apenas integrações que destravam execução real: comunicação, coleta de dados e acompanhamento.",
      "Cada integração precisa ter papel claro no fluxo e não aumentar complexidade sem retorno.",
      "Integrações boas aceleram a operação; integrações demais bagunçam a entrega.",
    ],
    automation: [
      "Automatize apenas o que já estiver validado manualmente dentro do fluxo.",
      "Priorize gatilhos simples: follow-up, atualização de estado e registro de saída.",
      "A automação deve reduzir atrito, não esconder problemas do processo.",
    ],
    followup: [
      "Defina uma cadência curta e previsível para não depender de memória operacional.",
      "Cada follow-up deve ter um objetivo: retomar contexto, reforçar valor ou pedir decisão.",
      "O bloco precisa dizer quando insistir, quando ajustar e quando encerrar.",
    ],
    checklist: [
      "Transforme a estratégia em itens acionáveis por ordem de impacto.",
      `Como o canvas já possui ${existingTypes.size} bloco(s), use este checklist para priorizar o que entra primeiro.`,
      "Checklist bom reduz dispersão e mantém a execução limpa.",
    ],
    deploy: [
      "Só avance para deploy depois de validar a narrativa comercial e a ordem dos blocos.",
      "Ambiente de teste deve confirmar clareza, conexão entre etapas e ausência de pontos mortos.",
      "Deploy aqui significa colocar o fluxo para operar sem perder controle.",
    ],
    prompt: [
      `Consolidar um prompt final específico para ${facts.companyName} e para o nicho ${facts.niche}.`,
      "Esse prompt deve refletir contexto real, objetivo comercial e ordem correta de construção.",
      "Ele serve como base de execução consistente para as próximas iterações.",
    ],
    notes: [
      "Use este bloco para registrar ajustes de priorização, observações do prospect e decisões importantes.",
      "Notas boas evitam retrabalho e preservam o raciocínio do canvas.",
      "Se algo ainda estiver difuso, anote antes de expandir a estrutura.",
    ],
  } as Record<string, string[]>;

  return (base[type] || base.notes).join("\n");
}

function getLatestUserMessage(context: LocalFallbackContext) {
  const historyMessage = [...(context.chatHistory || [])].reverse().find((message) => message.role === "user")?.content;
  return context.userInstruction || historyMessage || "";
}

function estimateDigitalMaturity(facts: ReturnType<typeof extractProspectFacts>, existingTypes: Set<string>) {
  let score = 4;
  if (facts.website) score += 1;
  if (facts.instagram) score += 1;
  if (facts.services) score += 1;
  if (existingTypes.size >= 5) score += 1;
  if (existingTypes.has("followup") || existingTypes.has("automation")) score += 1;
  return Math.min(score, 9);
}

function isGreetingIntent(message: string) {
  return /^(oi|olá|ola|eai|opa|bom dia|boa tarde|boa noite)\b/.test(message.trim());
}

function isApprovalIntent(message: string) {
  return /\b(sim|aprovado|aprovo|pode|manda|manda ver|implementa|executa|pode fazer|fechado)\b/.test(message);
}

function isCanvasIntent(message: string) {
  return /\b(canvas|canva|estrutura|estruturar|organiza|organizar|blocos|monta|monte)\b/.test(message);
}

function isAnalysisIntent(message: string) {
  return /\b(analisa|analise|avalia|revisa|o que acha|diagnóstico|diagnostico)\b/.test(message);
}

function isStrategyIntent(message: string) {
  return /\b(estratégia|estrategia|como vender|abordar|abordagem|plano comercial)\b/.test(message);
}

function isCopyIntent(message: string) {
  return /\b(copy|mensagem|abordagem|escreve|cria mensagem|texto)\b/.test(message);
}

function buildErrorResponse(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function createSSEStreamFromText(text: string) {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      const chunkSize = 1200;

      for (let index = 0; index < text.length; index += chunkSize) {
        const chunk = text.slice(index, index + chunkSize);
        const payload = JSON.stringify({ choices: [{ delta: { content: chunk } }] });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}
