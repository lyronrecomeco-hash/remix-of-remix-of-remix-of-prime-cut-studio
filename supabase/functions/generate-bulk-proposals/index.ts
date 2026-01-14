import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BusinessData {
  name: string;
  niche: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
}

interface BulkProposalRequest {
  businesses: BusinessData[];
  affiliateName: string;
  countryCode: string;
}

// Cultural adaptation per country
const CULTURAL_PROMPTS: Record<string, string> = {
  BR: `Estilo brasileiro: informal, amigável e direto. Use "você" e "tudo bem?". Emojis moderados. Tom caloroso mas profissional.`,
  PT: `Estilo português: formal mas simpático. Expressões: "ora bem", "muito obrigado/a". Use "telemóvel" (não celular), "sítio web" (não site).`,
  ES: `Estilo español: profesional y cercano. Usa "usted" o "tú" según el contexto. Expresiones españolas naturales.`,
  MX: `Estilo mexicano: cordial y respetuoso. Usa "usted" inicialmente. Expresiones: "¿cómo está?", "con gusto".`,
  AR: `Estilo argentino: cercano y directo. Usa "vos" y "che" de forma natural. Expresiones: "dale", "bárbaro".`,
  CO: `Estilo colombiano: amable y profesional. Usa "usted". Expresiones: "con mucho gusto", "a la orden".`,
  CL: `Estilo chileno: profesional y cercano. Usa "tú" o "usted" según contexto.`,
  PE: `Estilo peruano: formal y respetuoso. Usa "usted". Expresiones: "a sus órdenes".`,
  US: `American style: casual but professional. Direct and value-focused. Use "you" and active voice.`,
  UK: `British style: polite and professional. Expressions: "I'd be pleased to", "at your convenience".`,
  CA: `Canadian style: friendly and polite. Mix of UK/US expressions.`,
  AU: `Australian style: relaxed and direct. Casual but professional.`,
  DE: `Deutscher Stil: professionell und präzise. Formelle Anrede mit "Sie". Direkt und sachlich.`,
  FR: `Style français: professionnel et courtois. Vouvoiement obligatoire. Expressions: "Je me permets de".`,
  IT: `Stile italiano: professionale e cordiale. Dare del "Lei" inizialmente. Tono caloroso.`,
  JP: `日本語スタイル: 丁寧でプロフェッショナル。敬語を使用。ビジネスマナーを重視。`,
};

// Message templates per language/region
const MESSAGE_TEMPLATES: Record<string, string> = {
  'pt-BR': `Olá, tudo bem?

Me chamo {NOME} e trabalho ajudando negócios locais a ter presença no Google e automatizar agendamentos.

Hoje desenvolvemos:
✅ Sites profissionais
✅ Sistema de agendamento automático  
✅ Automação de WhatsApp

Acredito que essas soluções podem otimizar o dia a dia da {EMPRESA} e aumentar suas vendas.

Posso te explicar como funciona?`,

  'pt-PT': `Olá, tudo bem?

O meu nome é {NOME} e trabalho a ajudar negócios locais a melhorar a sua presença online.

Desenvolvemos:
✅ Websites profissionais
✅ Sistema de agendamento automático  
✅ Automação de WhatsApp

Se fizer sentido, terei todo o gosto em explicar como funciona.`,

  'es': `Hola, ¿cómo está?

Mi nombre es {NOMBRE} y trabajo ayudando a negocios locales a mejorar su presencia online.

Ofrecemos:
✅ Sitios web profesionales
✅ Sistema de citas automático  
✅ Automatización de WhatsApp

Si le parece interesante, puedo explicarle cómo funciona.`,

  'en': `Hello!

My name is {NAME} and I help local businesses improve their online presence.

We offer:
✅ Professional websites
✅ Automatic scheduling system  
✅ WhatsApp automation

If this sounds interesting, I'd be happy to explain how it works.`,

  'de': `Guten Tag,

mein Name ist {NAME} und ich helfe lokalen Unternehmen, ihre Online-Präsenz zu verbessern.

Wir bieten:
✅ Professionelle Websites
✅ Automatisches Terminbuchungssystem  
✅ WhatsApp-Automatisierung

Falls Sie Interesse haben, erkläre ich Ihnen gerne, wie es funktioniert.`,

  'fr': `Bonjour,

Je me présente, {NOM}, et j'accompagne les entreprises locales pour améliorer leur présence en ligne.

Nous proposons:
✅ Sites web professionnels
✅ Système de prise de rendez-vous automatique  
✅ Automatisation WhatsApp

Si cela vous intéresse, je serais ravi de vous expliquer comment cela fonctionne.`,

  'it': `Buongiorno,

mi chiamo {NOME} e aiuto le attività locali a migliorare la loro presenza online.

Offriamo:
✅ Siti web professionali
✅ Sistema di prenotazione automatico  
✅ Automazione WhatsApp

Se Le interessa, sarò lieto di spiegarLe come funziona.`,
};

function getLanguageFromCountry(countryCode: string): string {
  const languageMap: Record<string, string> = {
    BR: 'pt-BR', PT: 'pt-PT', ES: 'es', MX: 'es', AR: 'es',
    CO: 'es', CL: 'es', PE: 'es', US: 'en', UK: 'en',
    CA: 'en', AU: 'en', DE: 'de', FR: 'fr', IT: 'it', JP: 'ja',
  };
  return languageMap[countryCode] || 'en';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businesses, affiliateName, countryCode }: BulkProposalRequest = await req.json();

    if (!businesses || businesses.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No businesses provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY não configurado');
    }

    const culturalContext = CULTURAL_PROMPTS[countryCode] || CULTURAL_PROMPTS['US'];
    const language = getLanguageFromCountry(countryCode);
    const baseTemplate = MESSAGE_TEMPLATES[language] || MESSAGE_TEMPLATES['en'];

    // Process in batches of 10 for efficiency
    const BATCH_SIZE = 10;
    const results: { name: string; message: string }[] = [];
    
    for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
      const batch = businesses.slice(i, i + BATCH_SIZE);
      
      // Create a single prompt for the batch
      const businessList = batch.map((b, idx) => 
        `${idx + 1}. ${b.name} (${b.niche})`
      ).join('\n');

      const systemPrompt = `Você é Luna, especialista em vendas consultivas.
${culturalContext}

TAREFA: Gerar mensagens de prospecção personalizadas para cada empresa listada.

MODELO BASE (adaptar para cada empresa):
"""
${baseTemplate}
"""

REGRAS:
- Gere UMA mensagem para cada empresa
- Adapte o tom cultural para o país ${countryCode}
- Personalize cada mensagem mencionando o nome da empresa e nicho
- Use o idioma correto: ${language}
- Nome do consultor: ${affiliateName}

FORMATO DE RESPOSTA (JSON):
[
  { "name": "Nome Empresa 1", "message": "Mensagem 1..." },
  { "name": "Nome Empresa 2", "message": "Mensagem 2..." }
]`;

      const userPrompt = `Gere mensagens personalizadas para estas empresas:
${businessList}

Responda APENAS com o JSON. Sem texto adicional.`;

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
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited - use fallback templates
          console.log('Rate limited, using fallback templates');
          for (const business of batch) {
            results.push({
              name: business.name,
              message: generateFallbackMessage(business, affiliateName, countryCode, baseTemplate),
            });
          }
          continue;
        }
        if (response.status === 402) {
          // No credits - use fallback templates
          console.log('No credits, using fallback templates');
          for (const business of batch) {
            results.push({
              name: business.name,
              message: generateFallbackMessage(business, affiliateName, countryCode, baseTemplate),
            });
          }
          continue;
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '';
      
      try {
        // Extract JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          results.push(...parsed);
        } else {
          // Fallback to template if parsing fails
          for (const business of batch) {
            results.push({
              name: business.name,
              message: generateFallbackMessage(business, affiliateName, countryCode, baseTemplate),
            });
          }
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        for (const business of batch) {
          results.push({
            name: business.name,
            message: generateFallbackMessage(business, affiliateName, countryCode, baseTemplate),
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, messages: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao gerar propostas' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateFallbackMessage(
  business: BusinessData, 
  affiliateName: string, 
  countryCode: string,
  template: string
): string {
  const nameField = countryCode === 'FR' ? '{NOM}' : 
                    countryCode.startsWith('es') || ['ES', 'MX', 'AR', 'CO', 'CL', 'PE'].includes(countryCode) ? '{NOMBRE}' :
                    countryCode === 'DE' || countryCode === 'IT' ? '{NAME}' : '{NOME}';
  
  const companyField = countryCode === 'FR' ? '{ENTREPRISE}' :
                       countryCode === 'DE' ? '{UNTERNEHMEN}' :
                       countryCode === 'IT' ? '{AZIENDA}' :
                       ['US', 'UK', 'CA', 'AU'].includes(countryCode) ? '{BUSINESS}' : '{EMPRESA}';

  return template
    .replace(nameField, affiliateName)
    .replace('{NAME}', affiliateName)
    .replace('{NOME}', affiliateName)
    .replace('{NOM}', affiliateName)
    .replace('{NOMBRE}', affiliateName)
    .replace(companyField, business.name)
    .replace('{EMPRESA}', business.name)
    .replace('{BUSINESS}', business.name)
    .replace('{ENTREPRISE}', business.name)
    .replace('{UNTERNEHMEN}', business.name)
    .replace('{AZIENDA}', business.name);
}
