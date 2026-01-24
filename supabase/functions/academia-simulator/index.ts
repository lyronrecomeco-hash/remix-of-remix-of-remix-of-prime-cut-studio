import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario, userResponse, conversationHistory } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um simulador de treinamento de vendas. Você vai agir como dois personagens:

1. CLIENTE: ${scenario.clientPersona}
   Você deve responder como este cliente responderia, mantendo a personalidade e objeções realistas.
   
2. COACH: Após a resposta do cliente, você vai dar um feedback construtivo sobre a resposta do vendedor.

CENÁRIO ATUAL: ${scenario.title}
OBJEÇÃO INICIAL: ${scenario.objection}

REGRAS:
- Responda APENAS em português brasileiro
- Seja realista nas reações do cliente
- O cliente pode ser convencido aos poucos se as respostas forem boas
- Dê feedback específico e acionável
- Use emojis moderadamente

FORMATO DE RESPOSTA (JSON):
{
  "clientResponse": "resposta do cliente à abordagem do vendedor",
  "feedback": "análise da resposta do vendedor com pontos fortes, pontos a melhorar e sugestões"
}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content
      })),
      { role: "user", content: userResponse }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON response
    let parsed;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      // Fallback: use raw content as client response
      parsed = {
        clientResponse: content,
        feedback: "Continue praticando! Tente usar técnicas de espelhamento e perguntas abertas."
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Academia simulator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
