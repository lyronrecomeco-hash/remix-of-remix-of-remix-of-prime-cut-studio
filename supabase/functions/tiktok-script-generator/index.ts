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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista em criação de roteiros virais para TikTok, Reels e Shorts. Seu foco é criar conteúdo que promova a Genesis IA - uma plataforma de automação e atendimento inteligente por WhatsApp.

REGRAS IMPORTANTES:
1. TODOS os roteiros devem ser focados em promover a Genesis IA
2. Use linguagem jovem, dinâmica e engajante
3. Sempre inclua ganchos poderosos nos primeiros 3 segundos
4. Aplique técnicas de retenção (pattern interrupts, loops, suspense)
5. Inclua CTAs claros direcionando para conhecer a Genesis

ESTRUTURA DE ROTEIRO:
- GANCHO (0-3s): Frase impactante que prende atenção
- DESENVOLVIMENTO (3-20s): Apresentação do problema/solução
- PROVA/DEMONSTRAÇÃO (20-40s): Mostrar resultados ou funcionalidades
- CTA (40-60s): Chamada para ação clara

TEMAS PARA ROTEIROS GENESIS:
- Automação de atendimento WhatsApp
- IA que responde clientes 24h
- Geração automática de leads
- Chatbots inteligentes
- Aumento de vendas com automação
- Economia de tempo com atendimento automático
- Cases de sucesso fictícios mas realistas

Sempre forneça roteiros completos com:
- Texto exato para falar
- Indicações de cortes e transições
- Sugestões de áudio/música trending
- Hashtags relevantes

Mantenha tom profissional mas acessível. Use emojis quando apropriado.`;

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
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content
          }))
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Aguarde um momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "Não foi possível gerar o roteiro.";

    return new Response(
      JSON.stringify({ response: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
