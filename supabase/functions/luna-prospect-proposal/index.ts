import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProposalRequest {
  businessName: string;
  businessNiche: string;
  businessAddress?: string;
  businessPhone?: string;
  businessWebsite?: string;
  businessRating?: number;
  affiliateName: string;
  countryCode?: string;
}

// Cultural adaptation per country
const CULTURAL_PROMPTS: Record<string, string> = {
  BR: `Você é Luna, especialista em vendas consultivas para o mercado BRASILEIRO.
ESTILO: Brasileiro informal, amigável e direto.
- Use "você" e "tudo bem?"
- Emojis moderados (✅ 📱)
- Tom caloroso mas profissional
- Foque em resultados práticos`,

  PT: `Você é Luna, especialista em vendas consultivas para o mercado PORTUGUÊS.
ESTILO: Português europeu, formal mas simpático.
- Use "o senhor/a senhora" ou "você" conforme apropriado
- Expressões portuguesas: "ora bem", "muito obrigado/a"
- Menos emojis que no Brasil
- Tom mais formal e respeitoso
- Adapte termos: "telemóvel" (não celular), "sítio web" (não site), "agendamento" (não marcação)`,

  ES: `Eres Luna, especialista en ventas consultivas para el mercado ESPAÑOL.
ESTILO: Español de España, profesional y cercano.
- Usa "usted" o "tú" según el contexto
- Expresiones españolas naturales
- Tono profesional pero amable
- Adapta términos al español peninsular`,

  MX: `Eres Luna, especialista en ventas consultivas para el mercado MEXICANO.
ESTILO: Español mexicano, cordial y respetuoso.
- Usa "usted" inicialmente
- Expresiones mexicanas: "¿cómo está?", "con gusto"
- Tono muy cortés y profesional
- Evita ser demasiado directo`,

  AR: `Sos Luna, especialista en ventas consultivas para el mercado ARGENTINO.
ESTILO: Español rioplatense, cercano y directo.
- Usa "vos" y "che" de forma natural
- Expresiones argentinas: "dale", "bárbaro"
- Tono más informal y directo
- Confianza pero respeto`,

  CO: `Eres Luna, especialista en ventas consultivas para el mercado COLOMBIANO.
ESTILO: Español colombiano, amable y profesional.
- Usa "usted" que es más común en Colombia
- Expresiones colombianas: "con mucho gusto", "a la orden"
- Tono muy cordial y respetuoso
- Énfasis en el servicio`,

  CL: `Eres Luna, especialista en ventas consultivas para el mercado CHILENO.
ESTILO: Español chileno, profesional y cercano.
- Usa "tú" o "usted" según contexto
- Modismos chilenos moderados
- Tono directo pero amable`,

  PE: `Eres Luna, especialista en ventas consultivas para el mercado PERUANO.
ESTILO: Español peruano, formal y respetuoso.
- Usa "usted" que es más común
- Expresiones peruanas: "a sus órdenes"
- Tono muy cortés y profesional`,

  US: `You are Luna, a sales consultant for the US market.
STYLE: American English, professional and friendly.
- Casual but professional tone
- Direct and value-focused
- Emphasize ROI and efficiency
- Use "you" and active voice`,

  UK: `You are Luna, a sales consultant for the UK market.
STYLE: British English, polite and professional.
- More formal than US English
- Expressions: "I'd be pleased to", "at your convenience"
- Understated confidence
- Proper British spellings`,

  CA: `You are Luna, a sales consultant for the Canadian market.
STYLE: Canadian English, friendly and polite.
- Polite and inclusive
- Mix of UK/US expressions
- Emphasis on partnership`,

  AU: `You are Luna, a sales consultant for the Australian market.
STYLE: Australian English, relaxed and direct.
- Casual but professional
- Direct communication style
- Friendly and approachable`,

  DE: `Sie sind Luna, Verkaufsberaterin für den deutschen Markt.
STIL: Deutsch, professionell und präzise.
- Formelle Anrede mit "Sie"
- Direkt und sachlich
- Fokus auf Qualität und Effizienz
- Professionelle Ausdrucksweise`,

  FR: `Vous êtes Luna, consultante commerciale pour le marché français.
STYLE: Français, professionnel et courtois.
- Vouvoiement obligatoire
- Expressions: "Je me permets de", "À votre disposition"
- Ton élégant et professionnel
- Respect des conventions`,

  IT: `Sei Luna, consulente di vendita per il mercato italiano.
STILE: Italiano, professionale e cordiale.
- Dare del "Lei" inizialmente
- Espressioni italiane appropriate
- Tono professionale ma caloroso
- Attenzione alle relazioni`,

  JP: `あなたはLuna、日本市場向けの営業コンサルタントです。
スタイル: 日本語、丁寧でプロフェッショナル。
- 敬語を使用
- ビジネスマナーを重視
- 控えめで礼儀正しい表現
- 相手への配慮を忘れずに`,
};

// Message templates per language/region
const MESSAGE_TEMPLATES: Record<string, string> = {
  'pt-BR': `Olá, tudo bem?

Me chamo {NOME} e trabalho ajudando negócios locais a ter presença no Google e automatizar agendamentos e atendimentos.

Hoje desenvolvemos:

✅ Sites profissionais
✅ Sistema de agendamento automático  
✅ Automação de WhatsApp, reduzindo atendimento manual

Entrei em contato porque acredito que essas soluções podem otimizar o dia a dia da {EMPRESA} e aumentar a conversão de clientes.

Se fizer sentido, posso te explicar rapidamente como funciona.`,

  'pt-PT': `Olá, tudo bem?

O meu nome é {NOME} e trabalho a ajudar negócios locais a melhorar a sua presença online e a automatizar agendamentos e atendimento ao cliente.

Desenvolvemos:

✅ Websites profissionais
✅ Sistema de agendamento automático  
✅ Automação de WhatsApp

Entrei em contacto porque acredito que estas soluções podem otimizar o dia-a-dia da {EMPRESA} e aumentar a conversão de clientes.

Se fizer sentido, terei todo o gosto em explicar rapidamente como funciona.`,

  'es': `Hola, ¿cómo está?

Mi nombre es {NOMBRE} y trabajo ayudando a negocios locales a mejorar su presencia en Google y automatizar citas y atención al cliente.

Ofrecemos:

✅ Sitios web profesionales
✅ Sistema de citas automático  
✅ Automatización de WhatsApp

Me pongo en contacto porque creo que estas soluciones pueden optimizar el día a día de {EMPRESA} y aumentar la conversión de clientes.

Si le parece interesante, puedo explicarle rápidamente cómo funciona.`,

  'es-MX': `Hola, ¿cómo está?

Mi nombre es {NOMBRE} y trabajo ayudando a negocios locales a mejorar su presencia en línea y automatizar citas y atención al cliente.

Ofrecemos:

✅ Páginas web profesionales
✅ Sistema de citas automático  
✅ Automatización de WhatsApp

Me pongo en contacto porque creo que estas soluciones pueden optimizar el día a día de {EMPRESA} y aumentar la conversión de clientes.

Con mucho gusto puedo explicarle cómo funciona.`,

  'es-AR': `Hola, ¿cómo andás?

Soy {NOMBRE} y trabajo ayudando a negocios locales a mejorar su presencia online y automatizar turnos y atención al cliente.

Ofrecemos:

✅ Sitios web profesionales
✅ Sistema de turnos automático  
✅ Automatización de WhatsApp

Te escribo porque creo que estas soluciones pueden optimizar el día a día de {EMPRESA} y aumentar la conversión de clientes.

Si te interesa, te cuento rápidamente cómo funciona.`,

  'en': `Hello!

My name is {NAME} and I help local businesses improve their online presence and automate appointments and customer service.

We offer:

✅ Professional websites
✅ Automatic scheduling system  
✅ WhatsApp automation

I'm reaching out because I believe these solutions can optimize daily operations at {BUSINESS} and increase customer conversions.

If this sounds interesting, I'd be happy to quickly explain how it works.`,

  'de': `Guten Tag,

mein Name ist {NAME} und ich helfe lokalen Unternehmen, ihre Online-Präsenz zu verbessern und Terminbuchungen sowie Kundenservice zu automatisieren.

Wir bieten:

✅ Professionelle Websites
✅ Automatisches Terminbuchungssystem  
✅ WhatsApp-Automatisierung

Ich kontaktiere Sie, weil ich glaube, dass diese Lösungen den Alltag von {UNTERNEHMEN} optimieren und die Kundenkonversion steigern können.

Falls Sie Interesse haben, erkläre ich Ihnen gerne kurz, wie es funktioniert.`,

  'fr': `Bonjour,

Je me présente, {NOM}, et j'accompagne les entreprises locales pour améliorer leur présence en ligne et automatiser les rendez-vous et le service client.

Nous proposons:

✅ Sites web professionnels
✅ Système de prise de rendez-vous automatique  
✅ Automatisation WhatsApp

Je me permets de vous contacter car je pense que ces solutions peuvent optimiser le quotidien de {ENTREPRISE} et augmenter la conversion clients.

Si cela vous intéresse, je serais ravi de vous expliquer rapidement comment cela fonctionne.`,

  'it': `Buongiorno,

mi chiamo {NOME} e aiuto le attività locali a migliorare la loro presenza online e ad automatizzare appuntamenti e servizio clienti.

Offriamo:

✅ Siti web professionali
✅ Sistema di prenotazione automatico  
✅ Automazione WhatsApp

La contatto perché credo che queste soluzioni possano ottimizzare la quotidianità di {AZIENDA} e aumentare la conversione clienti.

Se Le interessa, sarò lieto di spiegarLe rapidamente come funziona.`,

  'ja': `こんにちは。

{名前}と申します。地元のビジネスのオンラインプレゼンス向上と、予約・顧客サービスの自動化をお手伝いしております。

ご提供サービス:

✅ プロフェッショナルなウェブサイト
✅ 自動予約システム  
✅ WhatsApp自動化

{企業名}様の日々の業務最適化と顧客獲得の向上に貢献できると考え、ご連絡いたしました。

ご興味がございましたら、詳細をご説明させていただきます。`,
};

function getLanguageFromCountry(countryCode: string): string {
  const languageMap: Record<string, string> = {
    BR: 'pt-BR',
    PT: 'pt-PT',
    ES: 'es',
    MX: 'es-MX',
    AR: 'es-AR',
    CO: 'es',
    CL: 'es',
    PE: 'es',
    US: 'en',
    UK: 'en',
    CA: 'en',
    AU: 'en',
    DE: 'de',
    FR: 'fr',
    IT: 'it',
    JP: 'ja',
  };
  return languageMap[countryCode] || 'en';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      businessName,
      businessNiche,
      businessAddress,
      businessPhone,
      businessWebsite,
      businessRating,
      affiliateName,
      countryCode = 'BR',
    }: ProposalRequest = await req.json();

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY não configurado');
    }

    // Get cultural context for the country
    const culturalContext = CULTURAL_PROMPTS[countryCode] || CULTURAL_PROMPTS['US'];
    const language = getLanguageFromCountry(countryCode);
    const baseTemplate = MESSAGE_TEMPLATES[language] || MESSAGE_TEMPLATES['en'];

    const systemPrompt = `${culturalContext}

TAREFA: Gerar uma mensagem de prospecção DIRETAMENTE, sem introduções.

IMPORTANTE - NÃO ESCREVA:
- "Olá! Aqui está uma proposta..."
- "Segue a mensagem..."
- Qualquer texto introdutório

MODELO BASE (adaptar culturalmente e para o nicho):
"""
${baseTemplate}
"""

REGRAS:
- Comece DIRETAMENTE com a saudação apropriada para o país
- Substitua os placeholders pelo nome do consultor e empresa
- Adapte expressões e tom para a cultura local
- Mantenha estrutura similar mas natural para o idioma
- Personalize para o nicho se relevante
- Use o idioma correto para o país`;

    const userPrompt = `Gere a mensagem de prospecção culturalmente adaptada:

NEGÓCIO: ${businessName}
NICHO: ${businessNiche}
CONSULTOR: ${affiliateName}
PAÍS: ${countryCode}

Responda APENAS com a mensagem pronta. Comece direto com a saudação.`;

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
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Entre em contato com o suporte.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`Erro na API de IA: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content?.trim() || '';

    return new Response(
      JSON.stringify({ success: true, message }),
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
