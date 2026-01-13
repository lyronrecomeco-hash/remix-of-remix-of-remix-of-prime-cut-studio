import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProposalRequest {
  answers: Record<string, string>;
  affiliateName: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, affiliateName }: ProposalRequest = await req.json();

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY não configurado');
    }

    // Extract base answers
    const companyName = answers.company_name || 'a empresa';
    const companyNiche = answers.company_niche || 'negócio local';
    const mainProblem = answers.main_problem || '';

    // Get additional AI answers
    const additionalAnswers = Object.entries(answers)
      .filter(([key]) => key.startsWith('ai_q_'))
      .map(([_, value]) => value)
      .join('\n');

    const systemPrompt = `Você é Luna, uma IA especialista em vendas consultivas para a Genesis Hub.
Crie uma mensagem de prospecção completa, personalizada e persuasiva.

ESTRUTURA DA MENSAGEM:
1. Saudação calorosa e personalizada
2. Apresentação breve do consultor
3. Conexão com o problema/dor identificada
4. Soluções específicas que a Genesis oferece:
   - Site profissional
   - Presença no Google
   - Automação de atendimento
   - Chatbot WhatsApp
5. Benefícios concretos para o nicho
6. Casos de sucesso ou prova social
7. Chamada para ação suave (pergunta aberta)

REGRAS:
- Tom informal mas profissional
- Use emojis estratégicos (3-5 no máximo)
- Personalize para o nicho específico
- Mensagem entre 200-300 palavras
- Foque em VALOR, não em venda
- Quebre parágrafos para facilitar leitura no WhatsApp
- Finalize com pergunta que gere resposta`;

    const userPrompt = `Crie uma proposta de prospecção completa:

EMPRESA: ${companyName}
NICHO: ${companyNiche}
PROBLEMA PRINCIPAL: ${mainProblem}
${additionalAnswers ? `\nINFORMAÇÕES ADICIONAIS:\n${additionalAnswers}` : ''}

CONSULTOR: ${affiliateName}

Gere uma mensagem de prospecção MATADORA e PERSONALIZADA para esse negócio.
A mensagem deve parecer escrita por um humano, não por IA.
Use as informações coletadas para criar conexão e mostrar que você entende o negócio.`;

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
        temperature: 0.85,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const proposal = data.choices?.[0]?.message?.content?.trim() || '';

    return new Response(
      JSON.stringify({ success: true, proposal }),
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
