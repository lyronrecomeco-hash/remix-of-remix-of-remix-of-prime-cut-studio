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

    const systemPrompt = `Você é Luna, uma IA especialista em vendas consultivas para a Genesis Hub.
Sua tarefa é GERAR A MENSAGEM DE PROSPECÇÃO diretamente no idioma e estilo cultural especificado.

IMPORTANTE - ADAPTAÇÃO CULTURAL E LINGUÍSTICA:
- IDIOMA OBRIGATÓRIO: ${adaptation.language}
- SAUDAÇÃO INICIAL: ${adaptation.greeting}
- TOM: ${adaptation.tone}
- NOTAS CULTURAIS: ${adaptation.culturalNotes}
- FECHAMENTO: ${adaptation.closingStyle}

IMPORTANTE - NÃO ESCREVA:
- "Olá! Aqui está uma proposta..."
- "Segue a mensagem..."
- "Aqui está a proposta estruturada..."
- Qualquer texto introdutório antes da mensagem
- NÃO traduza literalmente - escreva como um vendedor NATIVO daquele país escreveria

ESCREVA DIRETAMENTE a mensagem que será enviada ao cliente, NO IDIOMA E ESTILO DO PAÍS.

ESTRUTURA DA MENSAGEM (adaptar para o idioma e cultura):
1. Saudação nativa apropriada
2. Apresentação breve do consultor
3. O que a Genesis Hub oferece (sites, agendamento automático, automação WhatsApp)
4. Por que entrando em contato com ESTA empresa
5. Fechamento com call-to-action culturalmente apropriado

REGRAS CRÍTICAS:
- COMECE com a saudação nativa do país (${adaptation.greeting})
- Substitua {NOME_CONSULTOR} pelo nome do consultor
- Substitua {NOME_EMPRESA} pelo nome da empresa
- NÃO faça tradução literal - escreva naturalmente como um vendedor nativo
- Mantenha tom profissional mas culturalmente adequado
- A mensagem deve parecer escrita por um HUMANO NATIVO do país, não por IA`;

    const userPrompt = `Gere a mensagem de prospecção no idioma ${adaptation.language}:

EMPRESA: ${companyName}
NICHO: ${companyNiche}
CONSULTOR: ${affiliateName}
PAÍS DO CLIENTE: ${country}
IDIOMA: ${adaptation.language}

${mainProblem ? `PROBLEMA IDENTIFICADO: ${mainProblem}` : ''}
${dreamResult ? `RESULTADO DESEJADO: ${dreamResult}` : ''}

Responda APENAS com a mensagem pronta no idioma ${adaptation.language}. Comece direto com "${adaptation.greeting}".`;

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
