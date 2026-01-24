import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProposalRequest {
  answers: Record<string, string>;
  affiliateName: string;
  regenerate?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, affiliateName, regenerate }: ProposalRequest = await req.json();

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY não configurado');
    }

    // Extract base answers
    const companyName = answers.company_name || 'a empresa';
    const companyNiche = answers.company_niche || 'negócio local';
    const mainProblem = answers.main_problem || '';
    const decisionMaker = answers.decision_maker || '';
    const competitors = answers.competitors || '';
    const failedAttempts = answers.failed_attempts || '';
    const dreamResult = answers.dream_result || '';

    // Get additional AI answers
    const additionalAnswers = Object.entries(answers)
      .filter(([key]) => key.startsWith('ai_q_'))
      .map(([_, value]) => value)
      .join('\n');

    const systemPrompt = `Você é Luna, uma IA especialista em vendas consultivas para a Genesis Hub.
Sua única tarefa é GERAR A MENSAGEM DE PROSPECÇÃO diretamente, sem nenhuma introdução ou explicação.

IMPORTANTE - NÃO ESCREVA:
- "Olá! Aqui está uma proposta..."
- "Segue a mensagem..."
- "Aqui está a proposta estruturada..."
- Qualquer texto introdutório antes da mensagem

ESCREVA DIRETAMENTE a mensagem que será enviada ao cliente.

MENSAGEM BASE (adaptar para o nicho):
"""
Olá, tudo bem?

Me chamo {NOME_CONSULTOR} e trabalho ajudando negócios locais a ter presença no Google e automatizar agendamentos e atendimentos.

Hoje desenvolvemos:

✅ Sites profissionais
✅ Sistema de agendamento automático  
✅ Automação de WhatsApp, reduzindo atendimento manual

Entrei em contato porque acredito que essas soluções podem otimizar o dia a dia da {NOME_EMPRESA} e aumentar a conversão de clientes.

Se fizer sentido, posso te explicar rapidamente como funciona.
"""

REGRAS:
- COMECE a resposta com "Olá" - nunca com explicações
- Substitua {NOME_CONSULTOR} pelo nome do consultor
- Substitua {NOME_EMPRESA} pelo nome da empresa
- Mantenha a estrutura base
- Personalize levemente para o nicho se necessário
- Mantenha tom profissional e curto`;

    const userPrompt = `Gere a mensagem de prospecção:

EMPRESA: ${companyName}
NICHO: ${companyNiche}
CONSULTOR: ${affiliateName}

Responda APENAS com a mensagem pronta. Comece direto com "Olá".`;

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
        temperature: regenerate ? 0.95 : 0.85,
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
