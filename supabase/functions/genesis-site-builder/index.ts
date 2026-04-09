import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é o **Genesis Site Builder**, um gerador de projetos web full-stack premium.

## FORMATO DE SAÍDA

Gere múltiplos arquivos usando delimitadores:

===FILE:caminho/do/arquivo===
conteúdo aqui

### REGRAS:
1. O PRIMEIRO arquivo DEVE ser ===FILE:preview.html=== — HTML completo standalone com Tailwind CDN para preview visual
2. Depois gere TODOS os arquivos PHP, CSS, JS e config do projeto real
3. Cada arquivo separado por ===FILE:path===
4. Gere conteúdo REAL, nunca placeholder

## STACK

- Frontend: HTML5 + CSS3 (arquivo separado) + JavaScript vanilla
- Backend: PHP 8+ com estrutura MVC
- Estilo: CSS próprio (Tailwind APENAS no preview.html)

## ESTRUTURA MÍNIMA OBRIGATÓRIA

===FILE:preview.html===
(HTML completo com Tailwind CDN, Google Fonts, mínimo 8 seções, imagens Unsplash, menu mobile, scroll suave, animações)

===FILE:index.php===
===FILE:assets/css/style.css===
===FILE:assets/css/responsive.css===
===FILE:assets/js/main.js===
===FILE:config/app.php===
===FILE:includes/header.php===
===FILE:includes/footer.php===
===FILE:includes/navbar.php===
===FILE:includes/head.php===
===FILE:includes/scripts.php===

Adicione conforme contexto:
- sobre.php, servicos.php, contato.php, portfolio.php, agendamento.php
- controllers/, models/, helpers/, admin/
- database/schema.sql, .htaccess

## PREVIEW.HTML — QUALIDADE EXTREMA

OBRIGATÓRIO no preview.html:
- <!DOCTYPE html> completo até </html>
- <script src="https://cdn.tailwindcss.com"></script>
- Google Fonts: <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
- Mínimo 8 seções: hero, stats, serviços/features, sobre, galeria/portfolio, depoimentos, CTA, footer
- Imagens do Unsplash com URLs reais (https://images.unsplash.com/photo-XXXXX?w=800)
- Menu mobile hamburger funcional com JS
- Smooth scroll para âncoras
- Intersection Observer para animações de entrada
- Hover effects em cards e botões
- Responsivo (sm, md, lg, xl)
- Paleta coerente e premium
- Tipografia com hierarquia forte
- CTA persuasivos e específicos para o nicho
- TODOS os textos em Português do Brasil
- Dados realistas brasileiros (nomes, endereços, telefones)
- NUNCA lorem ipsum

## PHP — QUALIDADE PROFISSIONAL

- PHP 8+ com tipos
- Includes para reuso
- Config centralizada
- Sanitização de inputs
- Prepared statements para SQL
- Código comentado
- Padrão:
\`\`\`php
<?php require_once 'config/app.php'; ?>
<?php require_once 'includes/head.php'; ?>
<?php require_once 'includes/navbar.php'; ?>
<!-- conteúdo -->
<?php require_once 'includes/footer.php'; ?>
<?php require_once 'includes/scripts.php'; ?>
\`\`\`

## CSS (style.css)
- CSS custom properties para cores
- Reset/normalize
- Componentes: .btn, .card, .section
- Transições suaves
- Organizado por seções

## JS (main.js)
- IIFE ou módulos
- Smooth scroll, menu toggle, form validation
- Intersection Observer
- DOM manipulation limpa

## ANTI-PATTERNS
- NUNCA gerar arquivo vazio
- NUNCA misturar PHP com HTML sem includes
- NUNCA estilos inline (exceto preview.html)
- NUNCA lorem ipsum
- NUNCA código genérico sem personalização
- NUNCA estrutura desorganizada`;

// Provider configurations with fallback chain
const PROVIDERS = [
  {
    name: 'OpenAI',
    envKey: 'OPENAI_API_KEY',
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    extraBody: { max_tokens: 16000 },
  },
  {
    name: 'Lovable AI Gateway',
    envKey: 'LOVABLE_API_KEY',
    url: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    model: 'google/gemini-2.5-flash',
    extraBody: {},
  },
];

async function tryProvider(provider: { name: string; url: string; model: string; extraBody: Record<string, unknown> }, apiKey: string, messages: unknown[], retries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[${provider.name}] Attempt ${attempt}/${retries}`);

      const response = await fetch(provider.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages as any[],
          ],
          stream: true,
          ...provider.extraBody,
        }),
      });

      if (response.ok) {
        console.log(`[${provider.name}] Success on attempt ${attempt}`);
        return response;
      }

      const status = response.status;
      console.error(`[${provider.name}] Error ${status} on attempt ${attempt}`);

      // Don't retry on 402 (credits) - it won't help
      if (status === 402) {
        throw new Error(`CREDITS_EXHAUSTED`);
      }

      // Retry on 429 (rate limit) and 5xx with exponential backoff
      if ((status === 429 || status >= 500) && attempt < retries) {
        const delay = Math.min(2000 * Math.pow(2, attempt - 1), 15000);
        console.log(`[${provider.name}] Waiting ${delay}ms before retry...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      throw new Error(`API_ERROR_${status}`);
    } catch (e) {
      if (e instanceof Error && (e.message.startsWith('CREDITS') || e.message.startsWith('API_ERROR'))) {
        throw e;
      }
      if (attempt === retries) throw e;
      const delay = 2000 * attempt;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('MAX_RETRIES_EXCEEDED');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    // Try each provider in order with retries
    let lastError = '';
    for (const providerConfig of PROVIDERS) {
      const apiKey = Deno.env.get(providerConfig.envKey);
      if (!apiKey) continue;

      try {
        console.log(`Using AI provider: ${providerConfig.name} (${providerConfig.model})`);
        const response = await tryProvider(providerConfig, apiKey, messages);
        
        return new Response(response.body, {
          headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
        });
      } catch (e) {
        lastError = e instanceof Error ? e.message : 'Unknown error';
        console.error(`[${providerConfig.name}] Failed: ${lastError}`);
        
        // If credits exhausted, try next provider
        if (lastError === 'CREDITS_EXHAUSTED') continue;
        // If all retries failed, try next provider
        continue;
      }
    }

    // All providers failed
    const errorMessage = lastError === 'CREDITS_EXHAUSTED'
      ? 'Créditos insuficientes. Tente novamente mais tarde.'
      : 'Todos os provedores de IA estão temporariamente indisponíveis. Tente novamente em instantes.';

    const errorStatus = lastError === 'CREDITS_EXHAUSTED' ? 402 : 503;
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: errorStatus,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('site-builder error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Erro desconhecido' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
