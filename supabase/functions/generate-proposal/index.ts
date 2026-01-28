import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuestionnaireAnswer {
  questionId: string;
  question: string;
  answer: string;
  isAiGenerated?: boolean;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposalId, companyName, niche, answers } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('AI service not configured');
    }

    console.log(`Generating proposal for ${companyName} in niche ${niche}`);

    // Build context from answers
    const answersContext = (answers as QuestionnaireAnswer[])
      .map((a, i) => `${i + 1}. ${a.question}\n   Resposta: ${a.answer}`)
      .join('\n\n');

    const systemPrompt = `Você é um especialista em vendas B2B e consultor de negócios com 20 anos de experiência.
Sua tarefa é analisar as respostas do questionário e gerar uma proposta comercial ALTAMENTE PERSONALIZADA e PERSUASIVA.

REGRAS CRÍTICAS:
- NÃO seja genérico! Use EXATAMENTE as informações das respostas
- Mencione o NOME da empresa e detalhes específicos do negócio
- Calcule números REALISTAS baseados no nicho ${niche}
- Seja ESPECÍFICO sobre as dores e como resolvê-las

A proposta deve conter:

1. **painPoints**: Lista de 4-6 dores ESPECÍFICAS identificadas no negócio. NÃO USE frases genéricas como "falta de presença digital". 
   - Use exemplos: "Clientes ligam fora do horário e não conseguem agendar", "Concorrente X está dominando o Google na região"
   - Baseie-se nas respostas do cliente

2. **benefits**: Lista de 5-7 benefícios CONCRETOS com números:
   - "Agendamento online 24h - capture clientes às 23h quando sua concorrência está fechada"
   - "Redução de 80% nas ligações de agendamento - seu funcionário foca no atendimento"
   - Seja específico para o nicho

3. **roiAnalysis**: Análise de ROI REALISTA:
   - estimatedSavings: economia em R$/mês (considere: tempo de funcionário, ligações perdidas, clientes que vão para concorrência)
   - timeRecovery: horas economizadas por semana (seja conservador: 5-15h)
   - revenueIncrease: aumento de receita em % (seja realista: 15-40%)
   - paybackPeriod: período de retorno em meses (1-3 meses é ideal)

4. **pricing**: Objeto com:
   - plan: nome do plano recomendado
   - justification: POR QUE esse plano é ideal para ESSA empresa específica (mencione o nome e situação dela)

5. **personalizedPitch**: Pitch de 3 parágrafos PERSUASIVO:
   - Parágrafo 1: Identifique a DOR principal (use nome da empresa)
   - Parágrafo 2: Mostre a TRANSFORMAÇÃO possível com exemplos do nicho
   - Parágrafo 3: Crie URGÊNCIA (concorrência, perda de clientes, oportunidade)

6. **nextSteps**: Lista de 4 próximos passos ACIONÁVEIS:
   - Primeiro passo sempre: "Agende uma demonstração de 15 minutos para ver o sistema funcionando"
   - Inclua: timeline realista, o que o cliente precisa fornecer, expectativa de resultado

FORMATO: Retorne APENAS JSON válido, sem markdown ou explicações.
NICHO: ${niche}
EMPRESA: ${companyName}`;

    const userPrompt = `DADOS DA EMPRESA:
- Nome: ${companyName}
- Nicho: ${niche}

RESPOSTAS DO QUESTIONÁRIO (use essas informações para personalizar):
${answersContext}

INSTRUÇÕES FINAIS:
1. Use o nome "${companyName}" no pitch
2. Mencione detalhes específicos das respostas acima
3. Calcule ROI baseado no tipo de negócio (${niche})
4. Seja persuasivo mas realista nos números
5. Crie urgência mencionando concorrência ou perda de oportunidades

Gere a proposta comercial em formato JSON:`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA insuficientes.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI service error');
    }

    const data = await response.json();
    let proposalContent = data.choices?.[0]?.message?.content?.trim() || '';
    
    // Clean up the response - remove markdown code blocks if present
    proposalContent = proposalContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('Generated proposal content:', proposalContent.substring(0, 200));

    let proposal;
    try {
      proposal = JSON.parse(proposalContent);
    } catch (parseError) {
      console.error('Failed to parse proposal JSON:', parseError);
      throw new Error('Erro ao processar proposta gerada');
    }

    // Update the proposal in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('affiliate_proposals')
      .update({
        generated_proposal: proposal,
        proposal_generated_at: new Date().toISOString(),
        ai_analysis: {
          generatedAt: new Date().toISOString(),
          model: 'google/gemini-2.5-flash',
          answersCount: answers.length,
        }
      })
      .eq('id', proposalId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Erro ao salvar proposta');
    }

    console.log('Proposal saved successfully for:', proposalId);

    return new Response(
      JSON.stringify({
        success: true,
        proposal,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-proposal:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
