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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    // Try OpenAI first, fallback to Lovable AI Gateway
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    let apiUrl: string;
    let apiKey: string;
    let model: string;
    
    if (OPENAI_API_KEY) {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      apiKey = OPENAI_API_KEY;
      model = 'gpt-4o';
    } else if (LOVABLE_API_KEY) {
      apiUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';
      apiKey = LOVABLE_API_KEY;
      model = 'google/gemini-2.5-flash';
    } else {
      return new Response(JSON.stringify({ error: 'Nenhuma API key configurada (OpenAI ou Lovable AI)' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Using AI provider: ${OPENAI_API_KEY ? 'OpenAI (gpt-4o)' : 'Lovable AI Gateway'}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        ...(OPENAI_API_KEY ? { max_tokens: 16000 } : {}),
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições atingido. Tente novamente em instantes.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const t = await response.text();
      console.error('AI API error:', response.status, t);
      return new Response(JSON.stringify({ error: `Erro na API de IA (${response.status})` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (e) {
    console.error('site-builder error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Erro desconhecido' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
