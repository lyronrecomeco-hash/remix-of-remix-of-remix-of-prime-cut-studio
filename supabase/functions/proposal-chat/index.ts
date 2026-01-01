import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, proposalContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é a assistente virtual do Genesis Hub, um sistema de gestão empresarial inovador. Você está em uma página de proposta comercial personalizada para a empresa "${proposalContext?.companyName || 'Cliente'}".

CONTEXTO DA PROPOSTA:
- Empresa: ${proposalContext?.companyName || 'Não informado'}
- Contato: ${proposalContext?.contactName || 'Não informado'}
- Dores identificadas: ${proposalContext?.painPoints?.join(', ') || 'Não informado'}
- Benefícios propostos: ${proposalContext?.benefits?.join(', ') || 'Não informado'}
- ROI esperado: Economia de R$${proposalContext?.roiAnalysis?.estimatedSavings || 0}/mês, ${proposalContext?.roiAnalysis?.timeRecovery || 0}h economizadas/semana
- Plano recomendado: ${proposalContext?.pricing || 'Não informado'}

SEU OBJETIVO:
1. Responder dúvidas sobre a proposta de forma clara e persuasiva
2. Destacar os benefícios específicos para o negócio do cliente
3. Criar urgência e valor percebido
4. Guiar o prospect para fechar negócio (entrar em contato via WhatsApp)
5. Ser amigável, profissional e consultivo

REGRAS:
- Respostas curtas e diretas (máximo 3 parágrafos)
- Use emojis moderadamente para criar conexão
- Sempre mencione benefícios específicos da proposta
- Se perguntarem preço, destaque o ROI e economia
- Termine com um CTA suave (ex: "Quer tirar mais alguma dúvida?" ou "Posso ajudar com algo mais?")
- NUNCA invente informações que não estejam no contexto
- Se não souber algo, sugira que entrem em contato pelo WhatsApp

PERSONALIDADE:
- Nome: Luna (assistente Genesis Hub)
- Tom: Consultivo, amigável, profissional
- Objetivo: Converter o visitante em cliente`;

    console.log("Starting streaming chat for proposal:", proposalContext?.companyName);

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições, aguarde um momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Serviço temporariamente indisponível." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar mensagem" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream the response
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Proposal chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
