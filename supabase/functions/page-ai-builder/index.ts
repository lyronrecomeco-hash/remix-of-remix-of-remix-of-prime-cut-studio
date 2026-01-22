import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BuilderRequest {
  prompt: string;
  style?: 'modern' | 'minimal' | 'bold' | 'elegant';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const { prompt, style = 'modern' } = await req.json() as BuilderRequest;

    if (!prompt || prompt.trim().length < 10) {
      return new Response(
        JSON.stringify({ success: false, error: 'Prompt muito curto. Descreva melhor sua página.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const styleGuides: Record<string, string> = {
      modern: 'Design moderno com gradientes vibrantes, sombras suaves, bordas arredondadas (rounded-2xl), e animações sutis. Use cores como purple, blue, cyan.',
      minimal: 'Design minimalista com muito espaço em branco, tipografia limpa, cores neutras (gray, slate), poucos elementos decorativos.',
      bold: 'Design ousado com cores fortes e contrastantes, tipografia grande e impactante, elementos geométricos, gradientes intensos.',
      elegant: 'Design elegante com paleta sofisticada (gold, emerald, navy), tipografia serif para títulos, elementos refinados e luxuosos.',
    };

    const systemPrompt = `Você é um desenvolvedor senior expert em React, Tailwind CSS, Framer Motion e Lucide Icons.
Sua missão é gerar código TSX COMPLETO, PROFISSIONAL e PRONTO PARA PRODUÇÃO.

## REGRAS CRÍTICAS - SIGA EXATAMENTE

### 1. FORMATO DE SAÍDA
- Retorne APENAS o código TSX puro
- SEM markdown, SEM backticks, SEM explicações
- O código deve começar diretamente com "import"

### 2. ESTRUTURA OBRIGATÓRIA DO COMPONENTE
\`\`\`
import { motion } from 'framer-motion';
import { Icon1, Icon2 } from 'lucide-react';

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Conteúdo */}
    </div>
  );
}
\`\`\`

### 3. IMPORTS PERMITIDOS (APENAS ESTES)
- import { motion } from 'framer-motion';
- import { NomeDoIcone } from 'lucide-react';
- import { useState } from 'react'; (se necessário)

### 4. DESIGN - ESTILO ${style.toUpperCase()}
${styleGuides[style]}

### 5. SEÇÕES OBRIGATÓRIAS PARA LANDING PAGE
1. **Header/Nav**: Logo + links de navegação + CTA
2. **Hero Section**: 
   - Badge/tag de destaque
   - Título H1 impactante (max 8 palavras)
   - Subtítulo convincente (1-2 linhas)
   - Botões CTA primário e secundário
   - Imagem/ilustração decorativa (use divs com gradientes)
3. **Features/Benefícios**: Grid 3-4 cards com ícones
4. **Como Funciona**: Steps numerados ou timeline
5. **Prova Social**: Depoimentos ou logos de clientes
6. **Pricing/Planos**: Se aplicável ao nicho
7. **CTA Final**: Chamada de ação antes do footer
8. **Footer**: Links, redes sociais, copyright

### 6. TAILWIND CSS PATTERNS
- Container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Sections: py-16 sm:py-24
- Gradientes: bg-gradient-to-br from-X via-Y to-Z
- Cards: bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl
- Buttons: px-6 py-3 rounded-xl font-semibold
- Responsivo: sm:, md:, lg: breakpoints

### 7. ANIMAÇÕES FRAMER MOTION
- Entrada suave: initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
- Hover em cards: whileHover={{ y: -5, scale: 1.02 }}
- Hover em buttons: whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
- Stagger: transition={{ delay: index * 0.1 }}

### 8. ÍCONES LUCIDE DISPONÍVEIS
Sparkles, Rocket, Star, Heart, Check, CheckCircle, ArrowRight, ArrowUpRight, Play, 
Shield, ShieldCheck, Zap, Crown, Trophy, Target, Users, Globe, Mail, Phone, MapPin, 
Calendar, Clock, ChevronRight, ChevronDown, Menu, X, Instagram, Twitter, Facebook, 
Linkedin, Github, Youtube, CreditCard, Wallet, BarChart, TrendingUp, Award, 
Headphones, MessageCircle, Send, Image, Camera, Video, Music, Mic, Code, Terminal,
Laptop, Smartphone, Monitor, Wifi, Cloud, Lock, Key, Eye, Settings, Bell, Search

### 9. PALETA DE CORES BASE
- Backgrounds: slate-950, slate-900, gray-950
- Primárias: purple-500/600, blue-500/600, cyan-500
- Acentos: pink-500, emerald-500, amber-500
- Texto: white, white/90, white/60, white/40

### 10. QUALIDADE DO CONTEÚDO
- Textos em português do Brasil
- Conteúdo relevante para o nicho
- CTAs persuasivos e diretos
- Benefícios focados no cliente
- Números e estatísticas quando apropriado

## EXEMPLO DE ESTRUTURA MÍNIMA

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Check, Star, Users, Shield, Zap, ChevronRight, Mail, Phone, MapPin, Instagram, Linkedin, Twitter } from 'lucide-react';

export default function Page() {
  const features = [
    { icon: Shield, title: "Feature 1", description: "Descrição" },
    { icon: Zap, title: "Feature 2", description: "Descrição" },
    { icon: Users, title: "Feature 3", description: "Descrição" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        {/* ... */}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto text-center">
          {/* Badge, H1, subtitle, CTAs */}
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="p-6 bg-white/5 rounded-2xl border border-white/10">
                {/* Card content */}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* More sections... */}

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        {/* ... */}
      </footer>
    </div>
  );
}

AGORA GERE UMA PÁGINA COMPLETA E PROFISSIONAL!`;

    const userPrompt = `Crie uma página web completa para: "${prompt}"

Inclua:
- Hero section impactante
- Seção de features/benefícios com ícones
- Seção de prova social ou depoimentos (se aplicável)
- Call-to-action final
- Footer simples

Estilo: ${style}
Idioma do conteúdo: Português do Brasil`;

    console.log('Generating page for prompt:', prompt);

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
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Limite de requisições excedido. Aguarde um momento.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Créditos insuficientes. Entre em contato com o suporte.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    let generatedCode = data.choices?.[0]?.message?.content || '';

    // Clean up the response - remove markdown code blocks if present
    generatedCode = generatedCode
      .replace(/^```tsx?\n?/gm, '')
      .replace(/^```\n?/gm, '')
      .replace(/```$/gm, '')
      .trim();

    // Validate that it looks like valid TSX
    if (!generatedCode.includes('export default') && !generatedCode.includes('function Page')) {
      console.error('Invalid generated code:', generatedCode.substring(0, 500));
      return new Response(
        JSON.stringify({ success: false, error: 'Código gerado inválido. Tente novamente com um prompt diferente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully generated page code, length:', generatedCode.length);

    return new Response(
      JSON.stringify({ success: true, code: generatedCode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in page-ai-builder:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao gerar página' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
