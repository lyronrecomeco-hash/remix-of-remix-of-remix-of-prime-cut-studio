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
Sua missão é adaptar a mensagem base de prospecção para cada nicho específico.

MENSAGEM BASE (adaptar para o nicho):
"""
Olá, tudo bem?

Me chamo {NOME_CONSULTOR} e trabalho ajudando negócios locais a ter presença no Google e automatizar agendamentos e atendimentos.

Hoje desenvolvemos:

✅ Sites profissionais
✅ Sistema de agendamento automático  
✅ Automação de WhatsApp, reduzindo atendimento manual

Entrei em contato porque acredito que essas soluções podem otimizar o dia a dia do seu negócio e aumentar a conversão de clientes.

Se fizer sentido, posso te explicar rapidamente como funciona.
"""

REGRAS DE ADAPTAÇÃO:
- Mantenha a estrutura da mensagem base
- Personalize os exemplos para o nicho específico
- Use emojis ✅ para os benefícios
- Mensagem curta e direta
- Substitua {NOME_CONSULTOR} pelo nome real
- Finalize com pergunta aberta

IMPORTANTE: 
- Não invente serviços - mantenha: site, agendamento automático e automação WhatsApp
- Adapte os exemplos para o contexto do nicho
- Mantenha tom profissional mas acessível`;

    const userPrompt = `Adapte a mensagem base para:

NEGÓCIO: ${businessName}
NICHO: ${businessNiche}
CONSULTOR: ${affiliateName}
${businessAddress ? `LOCAL: ${businessAddress}` : ''}
${hasWebsite ? `TEM SITE: Sim` : 'TEM SITE: Não'}
${businessRating ? `AVALIAÇÃO: ${businessRating} estrelas` : ''}

Gere a mensagem adaptada para este ${businessNiche}, mantendo a estrutura base mas personalizando os exemplos para o nicho.`;

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
