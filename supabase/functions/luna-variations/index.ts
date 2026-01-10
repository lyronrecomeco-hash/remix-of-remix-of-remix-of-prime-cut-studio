import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * LUNA VARIATIONS - Gera variações humanizadas de mensagens para evitar spam
 * Usa Lovable AI para criar variações naturais e anti-ban
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SIMILARITY_PROMPTS: Record<string, string> = {
  high: `Gere variações MUITO SIMILARES à mensagem original. Mantenha quase todas as palavras, apenas troque sinônimos pontuais e pequenas reformulações. A essência e estrutura devem ser quase idênticas.`,
  medium: `Gere variações MODERADAMENTE SIMILARES à mensagem original. Mantenha a mesma intenção e tom, mas reformule frases, troque palavras e mude a estrutura levemente. O significado deve ser o mesmo mas com palavras diferentes.`,
  low: `Gere variações CRIATIVAS da mensagem original. Mantenha apenas a essência/objetivo, mas seja criativo nas palavras, expressões e estrutura. Cada variação deve parecer escrita por uma pessoa diferente.`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, count = 5, similarity = 'medium' } = await req.json();

    if (!message || typeof message !== 'string' || !message.trim()) {
      return new Response(
        JSON.stringify({ error: 'Mensagem é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const similarityPrompt = SIMILARITY_PROMPTS[similarity] || SIMILARITY_PROMPTS.medium;
    const variationCount = Math.min(Math.max(Number(count), 1), 20);

    const systemPrompt = `Você é Luna, uma especialista em comunicação via WhatsApp para negócios brasileiros.

Sua tarefa é gerar ${variationCount} variações da mensagem do usuário que:
1. Pareçam escritas por humanos reais (não robôs)
2. Evitem padrões repetitivos que ativam anti-spam
3. Mantenham variáveis como {{nome}}, {{produto}}, {{valor}} intactas
4. Usem linguagem natural brasileira
5. Variem uso de emojis, pontuação e estrutura
6. Mantenham o tom profissional mas acolhedor

${similarityPrompt}

REGRAS CRÍTICAS:
- NÃO altere variáveis entre chaves duplas como {{nome}}
- Cada variação deve ser ÚNICA
- Use português brasileiro natural
- Varie o início das mensagens (não comece todas igual)
- Varie uso de emojis (algumas com mais, outras com menos)
- Retorne APENAS as variações, uma por linha, sem numeração`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Gere ${variationCount} variações desta mensagem:\n\n${message}` },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Aguarde um momento e tente novamente.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos à sua conta.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('[LunaVariations] AI error:', response.status, errorText);
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse variações do texto
    const variations = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 10) // Filtrar linhas muito curtas
      .map((line: string) => {
        // Remove numeração se existir (1., 2., etc)
        return line.replace(/^\d+[\.\)]\s*/, '').trim();
      })
      .filter((line: string) => line.length > 10) // Filtrar novamente após limpeza
      .slice(0, variationCount);

    console.log(`[LunaVariations] Generated ${variations.length} variations`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        variations,
        count: variations.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[LunaVariations] Error:', err);
    return new Response(
      JSON.stringify({ 
        error: err instanceof Error ? err.message : 'Erro ao gerar variações' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
