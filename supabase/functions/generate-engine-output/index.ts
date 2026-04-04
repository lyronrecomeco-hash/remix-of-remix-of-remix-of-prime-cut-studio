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

    const nodesSummary = (nodes || []).map((n: any) => {
      return `[${n.data?.label || n.type}]: ${n.data?.content || n.data?.description || 'vazio'}`;
    }).join("\n");

    const edgesSummary = (edges || []).map((e: any) => `${e.source} → ${e.target}`).join(", ");

    const prospectInfo = prospect_context ? `
Empresa: ${prospect_context.company_name || 'N/A'}
Nicho: ${prospect_context.niche || prospect_context.questionnaire_answers?.niche || 'N/A'}
Contato: ${prospect_context.contact_name || 'N/A'}
Telefone: ${prospect_context.company_phone || 'N/A'}
Email: ${prospect_context.company_email || 'N/A'}
Respostas do questionário: ${JSON.stringify(prospect_context.questionnaire_answers || {})}
Notas: ${prospect_context.notes || 'N/A'}
` : 'Sem contexto de prospect';

    // Build structure: returns JSON for canvas nodes
    if (output_type === 'build_structure') {
      const structurePrompt = `Você é o Genesis Engine. Analise o contexto do prospect e gere uma estrutura de blocos para o canvas estratégico.

CONTEXTO DO PROSPECT:
${prospectInfo}

BLOCOS EXISTENTES:
${nodesSummary || 'Apenas o bloco Prospect inicial'}

${user_instruction ? `INSTRUÇÃO: ${user_instruction}` : ''}

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`) com esta estrutura:
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "diagnosis|pain|opportunity|strategy|offer|differentials|objections|approach|scope|structure|integrations|automation|followup|checklist|deploy|prompt|notes",
      "label": "Nome do bloco",
      "content": "Conteúdo detalhado e útil",
      "position": { "x": 400, "y": 100 }
    }
  ],
  "edges": [
    { "source": "prospect-1", "target": "unique-id" }
  ]
}

Regras:
- Crie 5-8 blocos estratégicos baseados no contexto real do prospect
- Posicione os blocos em grid organizado (x de 380 a 980, y de 80 a 500, espaçamento de ~200px)
- Preencha o conteúdo de cada bloco com informação relevante ao prospect
- Conecte os blocos ao prospect-1 existente e entre si logicamente
- Foque em conversão e valor real`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "user", content: structurePrompt },
          ],
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

    const outputInstructions: Record<string, string> = {
      prompt: `Gere um PROMPT COMPLETO e altamente detalhado para construir a solução ideal para este cliente. O prompt deve cobrir: frontend, backend, banco de dados, autenticação, integrações, regras de negócio, páginas, fluxos e estrutura técnica completa. Retorne pronto para copiar e usar.`,
      scope: `Gere um ESCOPO TÉCNICO COMPLETO da solução, incluindo: módulos, funcionalidades, tecnologias, estimativa de tempo, prioridades e dependências.`,
      blueprint: `Gere um BLUEPRINT TÉCNICO completo: arquitetura frontend, backend, banco de dados, APIs, integrações, autenticação e deploy.`,
      strategy: `Gere a MELHOR ESTRATÉGIA COMERCIAL para fechar este cliente: argumentos, objeções previstas, proposta de valor, diferenciação e follow-up.`,
      checklist: `Gere um CHECKLIST DE IMPLEMENTAÇÃO completo e organizado por fases, com todas as tarefas necessárias.`,
      executive: `Gere um RESUMO EXECUTIVO profissional da solução proposta, ideal para apresentar ao cliente.`,
      analyze: `Analise TODOS os blocos do canvas, o contexto do prospect e as conexões. Identifique gaps, oportunidades, riscos e sugira melhorias específicas.`,
      objections: `Analise o contexto e gere um FLUXO COMPLETO DE OBJEÇÕES: liste as objeções mais prováveis que este cliente terá, e para cada uma, dê a melhor resposta, argumento e contra-argumento. Organize por prioridade.`,
      deploy_plan: `Gere um PLANO DE ENTREGA completo: fases, marcos, dependências, ordem de implementação, estimativas e critérios de aceite. Organize cronologicamente.`,
    };

    const systemPrompt = `Você é o Genesis Engine, um motor de conversão e planejamento estratégico de alta performance. Você analisa contextos comerciais, dados de prospects e estratégias visuais para gerar saídas altamente precisas e acionáveis.

CONTEXTO DO PROSPECT:
${prospectInfo}

BLOCOS DO CANVAS:
${nodesSummary || 'Nenhum bloco adicionado'}

CONEXÕES:
${edgesSummary || 'Nenhuma conexão'}

${user_instruction ? `INSTRUÇÃO ADICIONAL DO USUÁRIO: ${user_instruction}` : ''}

Responda SEMPRE em português brasileiro. Seja extremamente detalhado, técnico e profissional. Formate com markdown.`;

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
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em instantes." }), {
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
