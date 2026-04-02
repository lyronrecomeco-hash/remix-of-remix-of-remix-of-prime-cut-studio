import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é a Genesis IA, assistente de suporte inteligente da plataforma Genesis Hub.

A Genesis Hub é uma plataforma SaaS completa para consultores digitais que ajuda a:
- Encontrar empresas/estabelecimentos sem presença digital (Encontrar Cliente)
- Escanear oportunidades automaticamente em qualquer cidade (Radar Global)
- Criar sites/apps profissionais usando templates prontos (Biblioteca / Escolher Modelo)
- Criar projetos personalizados do zero com prompts inteligentes (Criar do Zero)
- Gerar propostas comerciais persuasivas com IA (Propostas Personalizadas)
- Gerenciar propostas aceitas e pipeline de vendas (Propostas Aceitas)
- Acompanhar métricas financeiras (Financeiro)
- Treinar técnicas de vendas e objeções (Academia Genesis)
- Automação de WhatsApp e chatbots (Genesis WhatsApp)
- Gerenciar instâncias de WhatsApp (Genesis Instâncias)

REGRAS:
1. Responda APENAS sobre a plataforma Genesis Hub e suas funcionalidades
2. Se perguntarem algo fora do escopo, diga educadamente que só pode ajudar com dúvidas sobre a Genesis
3. Seja cordial, cumprimente o usuário se for a primeira mensagem
4. Respostas concisas e diretas, máximo 3 parágrafos
5. Use português brasileiro
6. Não invente funcionalidades que não existem
7. Se não souber a resposta exata, oriente o usuário a explorar a aba de Ajuda no menu`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ reply: 'Serviço temporariamente indisponível. Tente novamente em instantes.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ reply: 'Muitas mensagens em pouco tempo. Aguarde alguns segundos e tente novamente.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ reply: 'Erro ao processar mensagem. Tente novamente.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Support chat error:', error);
    return new Response(
      JSON.stringify({ reply: 'Erro interno. Tente novamente em instantes.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});