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

    const systemPrompt = `Você é um desenvolvedor SENIOR EXPERT em React, Tailwind CSS, Framer Motion e Lucide Icons.
Sua missão é gerar código TSX EXTREMAMENTE COMPLETO, PROFISSIONAL e PRONTO PARA PRODUÇÃO.

## REGRAS CRÍTICAS

### 1. FORMATO DE SAÍDA
- Retorne APENAS o código TSX puro
- SEM markdown, SEM backticks, SEM explicações
- O código deve começar diretamente com "import"

### 2. ESTRUTURA OBRIGATÓRIA
\`\`\`
import { motion } from 'framer-motion';
import { Icon1, Icon2, ... } from 'lucide-react';

export default function Page() {
  // Arrays de dados para features, testimonials, pricing, etc.
  const features = [...];
  const testimonials = [...];
  const pricingPlans = [...];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      {/* TODAS as seções aqui */}
    </div>
  );
}
\`\`\`

### 3. IMPORTS PERMITIDOS
- import { motion } from 'framer-motion';
- import { NomeDoIcone } from 'lucide-react';
- import { useState, useEffect } from 'react'; (se necessário)

### 4. DESIGN - ESTILO ${style.toUpperCase()}
${styleGuides[style]}

### 5. SEÇÕES OBRIGATÓRIAS (TODAS DEVEM ESTAR PRESENTES E COMPLETAS)

1. **NAVIGATION** (fixo no topo):
   - Logo com gradiente
   - Links de navegação (4-5 itens)
   - Botão CTA primário
   - Menu mobile com useState

2. **HERO SECTION** (impactante e completo):
   - Badge animado no topo (ex: "🚀 Novidade: Feature X")
   - Título H1 GRANDE e impactante com gradiente (text-5xl md:text-7xl)
   - Subtítulo convincente (2-3 linhas)
   - Dois botões CTA (primário gradient + secundário outline)
   - Elemento visual decorativo (gradient blobs, grid pattern)
   - Estatísticas inline (3 números impressionantes)
   - Animações de entrada com motion.div

3. **LOGOS/TRUST BAR**:
   - "Empresas que confiam em nós"
   - Grid de 5-6 logos simulados com divs estilizados

4. **FEATURES/BENEFÍCIOS** (grid completo):
   - Título da seção com gradiente
   - Subtítulo explicativo
   - Grid 3x2 ou 4 colunas de cards
   - Cada card: ícone, título, descrição, hover effect
   - Use ícones variados: Shield, Zap, Target, Users, Globe, Lock

5. **COMO FUNCIONA** (steps ou timeline):
   - 3-4 passos numerados
   - Linha conectora visual
   - Ícones para cada passo
   - Animação stagger

6. **ESTATÍSTICAS/NÚMEROS**:
   - 4 números grandes impressionantes
   - Ex: "10K+ Clientes", "99.9% Uptime", "50M+ Transações"
   - Background diferenciado

7. **TESTIMONIALS/DEPOIMENTOS** (3 cards):
   - Foto simulada (div com gradiente circular)
   - Citação com aspas
   - Nome, cargo e empresa
   - Rating com estrelas

8. **PRICING/PLANOS** (3 planos):
   - Plano Básico, Pro (destacado), Enterprise
   - Preços em R$
   - Lista de features com Check icons
   - Badge "Mais Popular" no plano Pro
   - CTAs em cada card

9. **FAQ** (4-5 perguntas):
   - Accordion com useState para abrir/fechar
   - Ícone ChevronDown que rotaciona
   - Perguntas relevantes ao nicho

10. **CTA FINAL** (call-to-action):
    - Background gradient chamativo
    - Título persuasivo
    - Botão grande
    - Garantia ou benefício extra

11. **FOOTER** (completo):
    - Logo
    - 4 colunas de links (Produto, Empresa, Recursos, Legal)
    - Redes sociais com ícones
    - Copyright com ano atual
    - Badges de segurança

### 6. TAILWIND PATTERNS OBRIGATÓRIOS
- Container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Sections: py-20 sm:py-32
- Gradientes: bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600
- Cards: bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all
- Botões primários: bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-8 py-4 rounded-xl font-semibold
- Botões secundários: border border-white/20 hover:bg-white/10 px-8 py-4 rounded-xl
- Textos: text-white, text-white/80, text-white/60, text-white/40
- Responsivo SEMPRE: sm:, md:, lg:, xl:

### 7. ANIMAÇÕES FRAMER MOTION (USE EM TUDO)
- Hero: initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
- Cards: whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring" }}
- Stagger: transition={{ delay: index * 0.1 }}
- Botões: whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
- Seções: initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}

### 8. ÍCONES DISPONÍVEIS
Sparkles, Rocket, Star, Heart, Check, CheckCircle, ArrowRight, ArrowUpRight, Play, 
Shield, ShieldCheck, Zap, Crown, Trophy, Target, Users, Globe, Mail, Phone, MapPin, 
Calendar, Clock, ChevronRight, ChevronDown, ChevronUp, Menu, X, Instagram, Twitter, 
Facebook, Linkedin, Github, Youtube, CreditCard, Wallet, BarChart, TrendingUp, Award, 
Headphones, MessageCircle, Send, Code, Terminal, Laptop, Smartphone, Monitor, 
Cloud, Lock, Key, Eye, Settings, Bell, Search, Briefcase, GraduationCap, BookOpen,
Gift, BadgeCheck, Brain, Lightbulb, Megaphone, Database, Server, Bot, Activity,
PieChart, LineChart, DollarSign, Percent, Building, Home, Store, ShoppingCart

### 9. QUALIDADE DO CONTEÚDO
- TODOS os textos em português do Brasil
- Conteúdo 100% relevante para o nicho solicitado
- CTAs persuasivos e específicos
- Números e estatísticas realistas
- Nomes brasileiros nos depoimentos
- Empresas brasileiras fictícias mas críveis

### 10. CÓDIGO COMPLETO
- O componente deve ter NO MÍNIMO 300 linhas
- TODAS as seções devem estar implementadas
- Dados mockados em arrays (features, testimonials, pricing, faqs)
- Responsivo em TODAS as seções
- Animações em TODOS os elementos interativos

GERE AGORA UMA PÁGINA EXTRAORDINARIAMENTE COMPLETA E PROFISSIONAL!`;

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
