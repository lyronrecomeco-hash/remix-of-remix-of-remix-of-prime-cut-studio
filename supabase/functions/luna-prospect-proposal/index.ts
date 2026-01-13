import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProposalRequest {
  businessName: string;
  businessNiche: string;
  businessAddress?: string;
  businessPhone?: string;
  businessWebsite?: string;
  businessRating?: number;
  affiliateName: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      businessName,
      businessNiche,
      businessAddress,
      businessPhone,
      businessWebsite,
      businessRating,
      affiliateName,
    }: ProposalRequest = await req.json();

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY não configurado');
    }

    // Build context about the business
    const hasWebsite = !!businessWebsite;
    const hasHighRating = businessRating && businessRating >= 4.0;
    const hasLowRating = businessRating && businessRating < 3.5;

    const systemPrompt = `Você é Luna, uma IA especialista em vendas consultivas para a Genesis Hub.
Sua missão é criar mensagens de prospecção personalizadas, naturais e persuasivas.

REGRAS:
- Mensagem deve ser informal mas profissional
- Use emojis com moderação (máximo 3-4)
- Personalize baseado no nicho e informações do negócio
- Foque em DOR + SOLUÇÃO
- Não seja genérico - mencione o nome do negócio
- Mensagem entre 150-250 palavras
- Use quebras de linha para facilitar leitura
- Finalize com uma pergunta aberta

ESTRUTURA:
1. Saudação personalizada
2. Apresentação breve do consultor
3. Identificação de oportunidades específicas para o nicho
4. Benefícios concretos (site, Google, automação, WhatsApp)
5. Chamada para ação suave`;

    const userPrompt = `Crie uma mensagem de prospecção para:

NEGÓCIO: ${businessName}
NICHO: ${businessNiche}
${businessAddress ? `LOCALIZAÇÃO: ${businessAddress}` : ''}
${hasWebsite ? `TEM WEBSITE: Sim (${businessWebsite})` : 'TEM WEBSITE: Não - oportunidade de criar um'}
${businessRating ? `AVALIAÇÃO: ${businessRating} estrelas${hasLowRating ? ' - oportunidade de melhorar presença online' : hasHighRating ? ' - bom potencial de crescimento' : ''}` : ''}

CONSULTOR: ${affiliateName}

Gere uma mensagem personalizada para este ${businessNiche} considerando:
${!hasWebsite ? '- Eles não têm site - mencione a importância de ter um site profissional' : '- Eles já têm site - foque em otimização e automação'}
${hasLowRating ? '- A avaliação está baixa - foque em melhorar presença online e reputação' : ''}
${hasHighRating ? '- Boa avaliação - mencione que podem crescer ainda mais com automação' : ''}

A mensagem deve ser ÚNICA para este negócio, não genérica.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Entre em contato com o suporte.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`Erro na API de IA: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content?.trim() || '';

    return new Response(
      JSON.stringify({ success: true, message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao gerar proposta' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
