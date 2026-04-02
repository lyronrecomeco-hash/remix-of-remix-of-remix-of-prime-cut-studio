import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProposalRequest {
  answers: Record<string, string>;
  affiliateName: string;
  regenerate?: boolean;
  clientCountry?: string;
  countryLanguage?: string;
  copyStyle?: string;
}

// Country-specific language and cultural adaptation rules
const COUNTRY_ADAPTATIONS: Record<string, {
  language: string;
  greeting: string;
  tone: string;
  culturalNotes: string;
  closingStyle: string;
}> = {
  brazil: {
    language: 'Português Brasileiro',
    greeting: 'Olá, tudo bem?',
    tone: 'próximo, amigável e consultivo, como um vendedor brasileiro experiente',
    culturalNotes: 'Use linguagem informal mas profissional. Brasileiros valorizam conexão pessoal antes de negócios. Evite ser muito direto inicialmente.',
    closingStyle: 'Termine com uma pergunta aberta e amigável, tipo "Se fizer sentido, posso te explicar rapidinho como funciona?"'
  },
  usa: {
    language: 'English (American)',
    greeting: 'Hi there,',
    tone: 'professional, direct, results-focused. Americans appreciate efficiency and clear value propositions',
    culturalNotes: 'Get to the point quickly. Focus on ROI and measurable results. Use action-oriented language.',
    closingStyle: 'End with a clear call-to-action like "Would you be open to a quick 10-minute call this week?"'
  },
  spain: {
    language: 'Español de España',
    greeting: 'Hola, ¿qué tal?',
    tone: 'profesional pero cercano, respetuoso. Los españoles valoran la cortesía y el trato personal',
    culturalNotes: 'Usa usted o tú según el contexto. Sé cordial pero no excesivamente informal. Menciona beneficios concretos.',
    closingStyle: 'Termina con una propuesta abierta como "¿Te parece si hablamos brevemente esta semana?"'
  },
  portugal: {
    language: 'Português Europeu',
    greeting: 'Olá, como está?',
    tone: 'formal mas cordial, respeitoso. Os portugueses preferem comunicação mais formal que os brasileiros',
    culturalNotes: 'Use tratamento formal (você/o senhor). Seja educado e não excessivamente efusivo. Vá direto ao ponto mas com cortesia.',
    closingStyle: 'Termine com uma sugestão educada como "Caso tenha interesse, terei todo o gosto em explicar-lhe melhor."'
  },
  mexico: {
    language: 'Español Mexicano',
    greeting: '¡Hola! ¿Cómo está?',
    tone: 'cálido, respetuoso y profesional. Los mexicanos valoran mucho la cortesía y el respeto',
    culturalNotes: 'Usa usted en el primer contacto. Sé amable y no demasiado agresivo. Menciona cómo puedes ayudar.',
    closingStyle: 'Termina con algo como "¿Le gustaría que le platique más sobre cómo podemos ayudarle?"'
  },
  argentina: {
    language: 'Español Argentino',
    greeting: '¡Hola! ¿Cómo andás?',
    tone: 'cercano y directo pero profesional. Los argentinos aprecian la franqueza y el trato personal',
    culturalNotes: 'Usá el voseo (vos/andás). Sé directo pero cordial. Podés ser un poco más informal.',
    closingStyle: 'Terminá con algo como "¿Te copa que charlemos esta semana?"'
  },
  france: {
    language: 'Français',
    greeting: 'Bonjour,',
    tone: 'formel, poli et professionnel. Les Français apprécient la courtoisie et le professionnalisme',
    culturalNotes: 'Utilisez le vouvoiement. Soyez poli mais pas trop familier. Allez à l\'essentiel avec élégance.',
    closingStyle: 'Terminez par "Seriez-vous disponible pour un bref échange cette semaine ?"'
  },
  germany: {
    language: 'Deutsch',
    greeting: 'Guten Tag,',
    tone: 'professionell, direkt und sachlich. Deutsche schätzen Effizienz und klare Informationen',
    culturalNotes: 'Siezen Sie. Seien Sie präzise und vermeiden Sie Übertreibungen. Fakten vor Emotionen.',
    closingStyle: 'Enden Sie mit "Hätten Sie Zeit für ein kurzes Gespräch diese Woche?"'
  },
  italy: {
    language: 'Italiano',
    greeting: 'Buongiorno,',
    tone: 'professionale ma cordiale. Gli italiani apprezzano il calore umano anche negli affari',
    culturalNotes: 'Usa il Lei. Sii cortese e mostra interesse genuino. Gli italiani amano costruire relazioni.',
    closingStyle: 'Termina con "Le farebbe piacere se ne parlassimo brevemente questa settimana?"'
  },
  uk: {
    language: 'English (British)',
    greeting: 'Hello,',
    tone: 'polite, professional but warm. The British appreciate understatement and courtesy',
    culturalNotes: 'Be polite but not overly familiar. Use measured language. Avoid being too pushy.',
    closingStyle: 'End with "Would you be open to a brief chat at your convenience?"'
  },
  other: {
    language: 'English (International)',
    greeting: 'Hello,',
    tone: 'professional, clear and internationally accessible',
    culturalNotes: 'Use simple, clear language. Avoid idioms or cultural references. Be respectful and direct.',
    closingStyle: 'End with "Would you like to discuss this further?"'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, affiliateName, regenerate, clientCountry, countryLanguage }: ProposalRequest = await req.json();

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY não configurado');
    }

    // Extract base answers
    const companyName = answers.company_name || 'a empresa';
    const companyNiche = answers.company_niche || 'negócio local';
    const mainProblem = answers.main_problem || '';
    const decisionMaker = answers.decision_maker || '';
    const competitors = answers.competitors || '';
    const failedAttempts = answers.failed_attempts || '';
    const dreamResult = answers.dream_result || '';

    // Get country adaptation rules
    const country = clientCountry || 'brazil';
    const adaptation = COUNTRY_ADAPTATIONS[country] || COUNTRY_ADAPTATIONS.brazil;

    // Get additional AI answers
    const additionalAnswers = Object.entries(answers)
      .filter(([key]) => key.startsWith('ai_q_'))
      .map(([_, value]) => value)
      .join('\n');

    // Build demo link based on country language
    const getDemoLinkText = (country: string) => {
      const translations: Record<string, { prefix: string; linkText: string }> = {
        brazil: { prefix: 'Fiz um exemplo para você ver como demonstração:', linkText: 'Link' },
        usa: { prefix: 'I put together a quick demo for you to see:', linkText: 'Link' },
        uk: { prefix: 'I\'ve prepared a demo for you to have a look:', linkText: 'Link' },
        spain: { prefix: 'He preparado un ejemplo para que veas cómo funciona:', linkText: 'Enlace' },
        portugal: { prefix: 'Preparei um exemplo para ver como funciona:', linkText: 'Link' },
        mexico: { prefix: 'Le preparé un ejemplo para que vea cómo funciona:', linkText: 'Enlace' },
        argentina: { prefix: 'Te armé un ejemplo para que veas cómo funciona:', linkText: 'Link' },
        france: { prefix: 'J\'ai préparé un exemple pour vous montrer:', linkText: 'Lien' },
        germany: { prefix: 'Ich habe ein Beispiel für Sie vorbereitet:', linkText: 'Link' },
        italy: { prefix: 'Ho preparato un esempio per mostrarLe:', linkText: 'Link' },
        other: { prefix: 'I prepared a demo for you to see:', linkText: 'Link' },
      };
      return translations[country] || translations.brazil;
    };

    const demoLink = getDemoLinkText(country);

    const systemPrompt = `Você é Luna, uma IA especialista em vendas consultivas para a Genesis Hub.
Sua tarefa é GERAR UMA MENSAGEM DE PROSPECÇÃO CURTA E DIRETA que CONVERTE.

IMPORTANTE - ADAPTAÇÃO CULTURAL E LINGUÍSTICA:
- IDIOMA OBRIGATÓRIO: ${adaptation.language}
- SAUDAÇÃO INICIAL: ${adaptation.greeting}
- TOM: ${adaptation.tone}
- NOTAS CULTURAIS: ${adaptation.culturalNotes}
- FECHAMENTO: ${adaptation.closingStyle}

FORMATO DA MENSAGEM - MÁXIMO 4-5 PARÁGRAFOS CURTOS:
A mensagem deve ser como uma conversa rápida por WhatsApp. Modelo de referência:

"Se você tá perdendo cliente por falta de organização no agendamento (ou algo similar ao problema identificado)... me dá 3 minutinhos que vou te explicar como resolver isso HOJE, pra não perder mais nenhum de amanhã em diante."

ESTRUTURA OBRIGATÓRIA:
1. Abra com uma DOR REAL do cliente (baseada no PROBLEMA identificado) - 1 frase impactante
2. Diga que tem uma solução prática e rápida - 1-2 frases
3. Mostre o resultado que ele vai ter (baseado no RESULTADO DOS SONHOS) - 1 frase
4. Inclua o link de demonstração de forma natural: ${demoLink.prefix} ${demoLink.linkText}: [LINK_DEMO]
5. Feche pedindo apenas 3 minutos do tempo dele

REGRAS CRÍTICAS:
- MÁXIMO 500 caracteres no total
- NÃO escreva textos longos - seja DIRETO e CONVERSACIONAL
- USE o nome da empresa "${companyName}" naturalmente
- ASSINE como ${affiliateName}
- INCLUA o link de demonstração sempre
- A mensagem deve parecer uma conversa real, NÃO uma proposta formal
- Foque na DOR e na SOLUÇÃO, não em features
- NÃO use bullet points, listas ou formatação complexa
- Escreva como se fosse uma mensagem de WhatsApp convincente`;

    const userPrompt = `Gere a mensagem curta de prospecção no idioma ${adaptation.language}:

EMPRESA: ${companyName}
NICHO: ${companyNiche}
CONSULTOR: ${affiliateName}

${mainProblem ? `DOR PRINCIPAL: ${mainProblem}` : ''}
${dreamResult ? `RESULTADO DESEJADO: ${dreamResult}` : ''}
${decisionMaker ? `DECISOR: ${decisionMaker}` : ''}
${competitors ? `CONCORRÊNCIA USA TECH: ${competitors}` : ''}

LINK DE DEMONSTRAÇÃO:
${demoLink.prefix}
${demoLink.linkText}: [LINK_DEMO]

Responda APENAS com a mensagem pronta (máximo 500 caracteres). Seja direto, conversacional e focado na dor do cliente.`;

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
        temperature: regenerate ? 0.95 : 0.85,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const proposal = data.choices?.[0]?.message?.content?.trim() || '';

    return new Response(
      JSON.stringify({ success: true, proposal }),
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
