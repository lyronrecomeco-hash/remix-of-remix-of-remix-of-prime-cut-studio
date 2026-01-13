import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuestionnaireRequest {
  companyName: string;
  companyNiche: string;
  mainProblem: string;
  affiliateName: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      companyName,
      companyNiche,
      mainProblem,
      affiliateName,
    }: QuestionnaireRequest = await req.json();

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY não configurado');
    }

    const systemPrompt = `Você é Luna, uma IA especialista em vendas consultivas.
Sua tarefa é criar 2-3 perguntas de follow-up para um questionário de prospecção.

REGRAS:
- Perguntas devem ser específicas para o nicho informado
- Foque em entender melhor as dores e oportunidades
- Perguntas curtas e diretas
- Máximo 3 perguntas
- Retorne em formato JSON

FORMATO DE RESPOSTA (JSON):
{
  "questions": [
    {
      "question": "Pergunta aqui?",
      "placeholder": "Ex: texto de exemplo",
      "type": "text",
      "helperText": "Dica opcional"
    }
  ]
}`;

    const userPrompt = `Crie perguntas de follow-up para prospecção:

EMPRESA: ${companyName}
NICHO: ${companyNiche}
PROBLEMA IDENTIFICADO: ${mainProblem}
CONSULTOR: ${affiliateName}

Gere 2-3 perguntas específicas para entender melhor este negócio e criar uma proposta matadora.
As perguntas devem ajudar a descobrir mais dores, oportunidades e como a Genesis pode ajudar.`;

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
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    // Parse JSON from response
    let questions = [];
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        questions = parsed.questions || [];
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      // Return default questions
      questions = [
        {
          question: `Como é o atendimento atual da ${companyName}? Usam WhatsApp?`,
          placeholder: 'Descreva como funciona hoje...',
          type: 'textarea',
          helperText: 'Isso ajuda a identificar oportunidades de automação'
        },
        {
          question: 'Qual o principal objetivo de crescimento nos próximos meses?',
          placeholder: 'Ex: mais clientes, melhor atendimento, mais vendas...',
          type: 'text',
          helperText: 'Entender a meta ajuda a personalizar a proposta'
        }
      ];
    }

    return new Response(
      JSON.stringify({ success: true, questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro',
        questions: [] 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
