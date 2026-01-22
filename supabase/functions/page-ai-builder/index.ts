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

    const systemPrompt = `Você é um expert em React, Tailwind CSS, Framer Motion e Lucide Icons.
Sua tarefa é gerar código TSX de alta qualidade para páginas web modernas e profissionais.

## REGRAS OBRIGATÓRIAS

1. **Formato de Saída**: Retorne APENAS código TSX válido, sem explicações, comentários externos ou markdown.

2. **Estrutura do Componente**:
   - Exporte um componente default chamado "Page"
   - Use apenas: React, Tailwind CSS, Framer Motion, Lucide Icons
   - Não use hooks complexos (apenas useState se necessário)
   - Não use chamadas de API ou dados externos

3. **Imports Permitidos**:
   \`\`\`tsx
   import { motion } from 'framer-motion';
   import { IconName } from 'lucide-react';
   \`\`\`

4. **Padrões de Design**:
   - ${styleGuides[style]}
   - Responsivo (mobile-first com sm:, md:, lg:)
   - Acessibilidade (alt em imagens, labels em forms)
   - Hierarquia visual clara

5. **Animações com Framer Motion**:
   - Use motion.div para containers animados
   - initial, animate, transition para entrada
   - whileHover, whileTap para interações
   - staggerChildren para listas

6. **Tailwind CSS**:
   - Use classes utilitárias modernas
   - Gradientes: bg-gradient-to-r from-X to-Y
   - Sombras: shadow-xl, shadow-2xl
   - Blur: backdrop-blur-md
   - Grid/Flex para layout

7. **Seções Comuns**:
   - Hero: título impactante, subtítulo, CTA
   - Features: grid de cards com ícones
   - Testimonials: citações com avatars
   - CTA: chamada final para ação
   - Footer: links e copyright

8. **Ícones Lucide Comuns**:
   Sparkles, Rocket, Star, Heart, Check, ArrowRight, Play, Shield, Zap, Crown, Trophy, Target, Users, Globe, Mail, Phone, MapPin, Calendar, Clock, ChevronRight

## EXEMPLO DE SAÍDA

\`\`\`tsx
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Star } from 'lucide-react';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero */}
      <section className="relative px-4 py-20 md:py-32 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Novo</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Título Principal
          </h1>
          <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
            Descrição convincente do produto ou serviço.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg"
          >
            Começar Agora
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
\`\`\`

Agora, gere uma página completa e profissional baseada no prompt do usuário.`;

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
