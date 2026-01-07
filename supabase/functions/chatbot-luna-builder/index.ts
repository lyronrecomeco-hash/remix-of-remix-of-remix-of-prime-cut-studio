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
    const { description, businessType, instanceId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('AI service not configured');
    }

    console.log(`Luna building chatbot for: ${description?.slice(0, 100)}...`);

    const systemPrompt = `Você é a Luna, uma IA especialista em criar chatbots profissionais para WhatsApp.

Baseado na descrição do usuário, você deve gerar uma configuração COMPLETA e PROFISSIONAL de chatbot.

REGRAS IMPORTANTES:
1. Crie um nome criativo e profissional para o chatbot
2. Defina palavras-chave relevantes para o trigger (mínimo 5, máximo 15)
3. Escreva um system prompt DETALHADO e PROFISSIONAL para a IA responder
4. O system prompt deve incluir:
   - Personalidade do bot
   - Contexto do negócio
   - Tom de voz adequado
   - Limitações e o que NÃO deve fazer
   - Instruções específicas de atendimento
   - Como lidar com diferentes situações

RESPONDA APENAS com um JSON válido neste formato exato:
{
  "name": "Nome criativo do chatbot",
  "trigger_type": "keyword",
  "keywords": ["palavra1", "palavra2", "palavra3"],
  "response_type": "ai",
  "ai_enabled": true,
  "ai_model": "Luna IA",
  "ai_temperature": 0.7,
  "ai_system_prompt": "System prompt detalhado aqui...",
  "delay_seconds": 2,
  "welcome_message": "Mensagem de boas-vindas opcional",
  "personality_summary": "Resumo breve da personalidade",
  "suggested_responses": ["Resposta sugerida 1", "Resposta sugerida 2"]
}`;

    const userPrompt = `Crie um chatbot profissional para:

${description}

${businessType ? `Tipo de negócio: ${businessType}` : ''}

Gere uma configuração completa e profissional.`;

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
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded', success: false }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits insufficient', success: false }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI service error');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    
    console.log('Luna raw response:', content.slice(0, 500));

    // Extract JSON from response
    let config;
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        config = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('Failed to parse Luna response:', parseError);
      
      // Fallback config
      config = {
        name: `Chatbot - ${description.slice(0, 30)}`,
        trigger_type: 'keyword',
        keywords: ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'ajuda', 'informação'],
        response_type: 'ai',
        ai_enabled: true,
        ai_model: 'Luna IA',
        ai_temperature: 0.7,
        ai_system_prompt: `Você é um assistente virtual profissional e amigável.

Contexto: ${description}

Diretrizes:
- Seja sempre educado e profissional
- Responda de forma clara e objetiva
- Ajude os clientes da melhor forma possível
- Use emojis com moderação
- Se não souber algo, diga que vai verificar
- Sempre tente resolver o problema do cliente`,
        delay_seconds: 2,
        personality_summary: 'Assistente amigável e profissional',
        suggested_responses: [
          'Olá! Como posso ajudar você hoje?',
          'Obrigado pelo contato! Em que posso auxiliar?'
        ]
      };
    }

    // Ensure required fields
    config.instance_id = instanceId || null;
    config.trigger_keywords = config.keywords || [];
    config.response_content = null;
    
    console.log('Luna generated config:', config.name);

    return new Response(
      JSON.stringify({
        success: true,
        config,
        message: 'Chatbot configurado com sucesso pela Luna!'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in chatbot-luna-builder:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Internal error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
