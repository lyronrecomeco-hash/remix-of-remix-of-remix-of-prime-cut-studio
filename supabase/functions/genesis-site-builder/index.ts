import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é o **Genesis Site Builder**, um gerador de código front-end de altíssimo nível.

## Sua Função
Você recebe prompts descritivos de projetos web e gera código HTML + CSS (Tailwind) + JavaScript completo, funcional e responsivo.

## Regras de Geração

1. **FORMATO**: Retorne APENAS um bloco de código HTML completo, começando com <!DOCTYPE html> e terminando com </html>. Nada antes, nada depois. Sem markdown, sem explicações.
2. **STACK**: HTML5 + Tailwind CSS (via CDN) + JavaScript inline. Sempre inclua: <script src="https://cdn.tailwindcss.com"></script>
3. **DESIGN**: 
   - Sempre moderno, clean, profissional
   - Responsivo (mobile-first)
   - Cores harmoniosas com paleta coerente
   - Tipografia profissional
   - Espaçamentos generosos
   - Transições e hover effects suaves
4. **SEÇÕES OBRIGATÓRIAS** (adaptar ao nicho):
   - Header/Navbar com logo e menu
   - Hero section com CTA
   - Sobre/Serviços
   - Depoimentos/Social proof
   - Galeria ou features
   - CTA final
   - Footer completo com links e contato
5. **QUALIDADE**: 
   - Código limpo e organizado
   - Comentários HTML para cada seção
   - Alt text em imagens
   - Semântica HTML5 (header, main, section, footer, nav)
   - Use placeholder images de https://images.unsplash.com (imagens reais e relevantes ao nicho)
6. **INTERATIVIDADE**:
   - Menu mobile hamburger funcional
   - Smooth scroll para âncoras
   - Animações de entrada com Intersection Observer
   - Formulário de contato estilizado
7. **IDIOMA**: O conteúdo deve ser no idioma solicitado (padrão: Português BR)
8. **CUSTOMIZAÇÃO**: Se o prompt incluir cores, fontes, nome do negócio, serviços — use exatamente o que foi pedido.

## Exemplo de Estrutura Mínima
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nome do Site</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <!-- Conteúdo completo aqui -->
</body>
</html>`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, projectId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY não configurada' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições atingido. Tente novamente em instantes.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const t = await response.text();
      console.error('AI gateway error:', response.status, t);
      return new Response(JSON.stringify({ error: 'Erro no gateway de IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (e) {
    console.error('site-builder error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Erro desconhecido' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
