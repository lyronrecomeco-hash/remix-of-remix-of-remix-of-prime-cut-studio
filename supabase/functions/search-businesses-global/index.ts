import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  city: string;
  countryCode: string;
  niche: string;
  maxResults?: number;
  affiliateName?: string;
}

interface BusinessResult {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviews_count?: number;
  category?: string;
  place_id?: string;
  latitude?: number;
  longitude?: number;
  generatedMessage?: string;
}

// Country configuration for search
const COUNTRY_CONFIG: Record<string, { gl: string; hl: string; phonePrefix: string; lang: string }> = {
  BR: { gl: 'br', hl: 'pt-br', phonePrefix: '55', lang: 'pt-BR' },
  US: { gl: 'us', hl: 'en', phonePrefix: '1', lang: 'en' },
  PT: { gl: 'pt', hl: 'pt-pt', phonePrefix: '351', lang: 'pt-PT' },
  ES: { gl: 'es', hl: 'es', phonePrefix: '34', lang: 'es' },
  MX: { gl: 'mx', hl: 'es', phonePrefix: '52', lang: 'es-MX' },
  AR: { gl: 'ar', hl: 'es', phonePrefix: '54', lang: 'es-AR' },
  CO: { gl: 'co', hl: 'es', phonePrefix: '57', lang: 'es' },
  CL: { gl: 'cl', hl: 'es', phonePrefix: '56', lang: 'es' },
  PE: { gl: 'pe', hl: 'es', phonePrefix: '51', lang: 'es' },
  UK: { gl: 'uk', hl: 'en', phonePrefix: '44', lang: 'en-UK' },
  DE: { gl: 'de', hl: 'de', phonePrefix: '49', lang: 'de' },
  FR: { gl: 'fr', hl: 'fr', phonePrefix: '33', lang: 'fr' },
  IT: { gl: 'it', hl: 'it', phonePrefix: '39', lang: 'it' },
  CA: { gl: 'ca', hl: 'en', phonePrefix: '1', lang: 'en' },
  AU: { gl: 'au', hl: 'en', phonePrefix: '61', lang: 'en' },
  JP: { gl: 'jp', hl: 'ja', phonePrefix: '81', lang: 'ja' },
};

// Search query templates per language
const SEARCH_TEMPLATES: Record<string, string> = {
  'pt-br': '{niche} em {city}',
  'pt-pt': '{niche} em {city}',
  'es': '{niche} en {city}',
  'en': '{niche} in {city}',
  'de': '{niche} in {city}',
  'fr': '{niche} à {city}',
  'it': '{niche} a {city}',
  'ja': '{city} {niche}',
};

// Message templates per language/region - ADAPTADAS automaticamente COM variações anti-ban
const MESSAGE_TEMPLATES: Record<string, { base: string; variations: string[] }> = {
  'pt-BR': {
    base: `Olá, tudo bem?

Me chamo {NOME} e trabalho ajudando serviços de urgência a ter presença no Google e automatizar agendamentos.

Hoje desenvolvemos:

✅ Sites profissionais (fáceis de encontrar em emergências)
✅ Sistema de agendamento automático
✅ Automação de WhatsApp

Acredito que essas soluções podem otimizar a triagem e o atendimento da *{EMPRESA}*.

Dê uma olhadinha e veja o sistema automatizado que pode trabalhar pra você enquanto você trabalha.
🔗 Link: {DEMO_LINK}`,
    variations: [
      `Oi, como vai?

Sou {NOME} e ajudo empresas de serviços essenciais a melhorar sua visibilidade online e automatizar processos.

O que oferecemos:

✅ Websites otimizados para buscas
✅ Agendamento online 24h
✅ Atendimento automatizado no WhatsApp

Essas ferramentas podem ajudar muito a *{EMPRESA}*.

Confira como funciona na prática:
🔗 {DEMO_LINK}`,
      `Olá!

Meu nome é {NOME}. Trabalho com soluções digitais para negócios como a *{EMPRESA}*.

Nossas soluções incluem:

✅ Sites profissionais para maior visibilidade
✅ Sistema de agendamentos automático
✅ Automação no WhatsApp

Veja uma demonstração funcionando:
🔗 {DEMO_LINK}`,
      `Oi, tudo certo?

Aqui é {NOME}. Trabalho com automação para empresas que precisam de presença digital.

Posso te ajudar com:

✅ Site profissional
✅ Agendamento automático
✅ WhatsApp automatizado

Acho que pode fazer sentido pra *{EMPRESA}*.

Olha o demo aqui:
🔗 {DEMO_LINK}`,
    ]
  },

  'pt-PT': {
    base: `Olá, tudo bem?

Chamo-me {NOME} e ajudo empresas como a *{EMPRESA}* a melhorar a sua presença online.

Desenvolvemos:
✅ Websites profissionais
✅ Sistema de agendamento automático  
✅ Automação de WhatsApp

Veja como funciona:
🔗 {DEMO_LINK}`,
    variations: []
  },

  'es': {
    base: `Hola, ¿cómo está?

Mi nombre es {NOME} y ayudo a negocios como *{EMPRESA}* a mejorar su presencia online.

Ofrecemos:
✅ Sitios web profesionales
✅ Sistema de citas automático  
✅ Automatización de WhatsApp

Vea cómo funciona:
🔗 {DEMO_LINK}`,
    variations: []
  },

  'es-MX': {
    base: `Hola, ¿cómo está?

Soy {NOME} y ayudo a negocios como *{EMPRESA}* a tener mejor presencia en línea.

Ofrecemos:
✅ Sitios web profesionales
✅ Sistema de citas automático  
✅ Automatización de WhatsApp

Mira cómo funciona:
🔗 {DEMO_LINK}`,
    variations: []
  },

  'es-AR': {
    base: `Hola, ¿cómo andás?

Soy {NOME} y laburo ayudando a negocios como *{EMPRESA}* a mejorar su presencia online.

Ofrecemos:
✅ Sitios web profesionales
✅ Sistema de turnos automático  
✅ Automatización de WhatsApp

Mirá cómo funciona:
🔗 {DEMO_LINK}`,
    variations: []
  },

  'en': {
    base: `Hello!

My name is {NOME} and I help businesses like *{EMPRESA}* improve their online presence.

We offer:
✅ Professional websites
✅ Automatic scheduling system  
✅ WhatsApp automation

See how it works:
🔗 {DEMO_LINK}`,
    variations: []
  },

  'en-UK': {
    base: `Hello!

I'm {NOME} and I help businesses like *{EMPRESA}* improve their online presence.

We offer:
✅ Professional websites
✅ Automatic booking system  
✅ WhatsApp automation

See how it works:
🔗 {DEMO_LINK}`,
    variations: []
  },

  'de': {
    base: `Guten Tag!

Mein Name ist {NOME}. Ich helfe Unternehmen wie *{EMPRESA}*, ihre Online-Präsenz zu verbessern.

Wir bieten:
✅ Professionelle Websites
✅ Automatisches Terminbuchungssystem  
✅ WhatsApp-Automatisierung

Sehen Sie, wie es funktioniert:
🔗 {DEMO_LINK}`,
    variations: []
  },

  'fr': {
    base: `Bonjour !

Je suis {NOME}. J'accompagne des entreprises comme *{EMPRESA}* pour améliorer leur présence en ligne.

Nous proposons :
✅ Sites web professionnels
✅ Système de prise de rendez-vous automatique  
✅ Automatisation WhatsApp

Découvrez comment ça fonctionne :
🔗 {DEMO_LINK}`,
    variations: []
  },

  'it': {
    base: `Buongiorno!

Mi chiamo {NOME} e aiuto attività come *{EMPRESA}* a migliorare la loro presenza online.

Offriamo:
✅ Siti web professionali
✅ Sistema di prenotazione automatico  
✅ Automazione WhatsApp

Guardi come funziona:
🔗 {DEMO_LINK}`,
    variations: []
  },

  'ja': {
    base: `こんにちは！

私の名前は{NOME}です。*{EMPRESA}*のような企業のオンラインプレゼンス向上をお手伝いしています。

提供サービス：
✅ プロフェッショナルなウェブサイト
✅ 自動予約システム
✅ WhatsApp自動化

デモをご覧ください：
🔗 {DEMO_LINK}`,
    variations: []
  },
};

const DEMO_LINK = 'https://www.genesishub.cloud/demo/ogim2u';

function adaptMessage(templateConfig: { base: string; variations: string[] }, affiliateName: string, businessName: string): string {
  // Escolhe aleatoriamente entre base e variações para evitar ban do WhatsApp
  const allTemplates = [templateConfig.base, ...templateConfig.variations];
  const randomTemplate = allTemplates[Math.floor(Math.random() * allTemplates.length)];
  
  return randomTemplate
    .replace(/{NOME}/g, affiliateName)
    .replace(/{EMPRESA}/g, businessName)
    .replace(/{DEMO_LINK}/g, DEMO_LINK);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: SearchRequest = await req.json();
    const { city, countryCode, niche, maxResults: requestedMax, affiliateName } = body;

    if (!city || !countryCode || !niche) {
      return new Response(
        JSON.stringify({ success: false, error: 'City, country and niche are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('SERPER_API_KEY');
    if (!apiKey) {
      console.error('SERPER_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Search API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get country config, default to US
    const config = COUNTRY_CONFIG[countryCode] || COUNTRY_CONFIG['US'];
    
    // Build search query based on language
    const template = SEARCH_TEMPLATES[config.hl] || SEARCH_TEMPLATES['en'];
    const searchQuery = template
      .replace('{niche}', niche)
      .replace('{city}', city);

    console.log(`Global search: "${searchQuery}" in ${countryCode} (${config.gl}/${config.hl})`);

    // Get message template for this country
    const messageTemplate = MESSAGE_TEMPLATES[config.lang] || MESSAGE_TEMPLATES['en'];
    const consultantName = affiliateName || 'Consultor Genesis';

    // FAST SEARCH: limit to 30 results max for 5-second response
    const maxResults = Math.min(30, Math.max(10, requestedMax || 30));

    const searchResponse = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: searchQuery,
        gl: config.gl,
        hl: config.hl,
        num: maxResults,
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Serper error:', searchResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Search error: ${searchResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchData = await searchResponse.json();
    const places = searchData.places || [];
    console.log(`Found ${places.length} results`);

    // Deduplicate and process results WITH messages adapted
    const seen = new Set<string>();
    const results: BusinessResult[] = places
      .map((place: any) => {
        const placeId = place.placeId || place.cid || '';
        const name = place.title || place.name || '';
        const address = place.address || city;
        const key = `${placeId}::${name}::${address}`.toLowerCase();

        if (!name || name.length < 3) return null;
        if (seen.has(key)) return null;
        seen.add(key);

        // Extract email from various sources
        const email = extractEmail(place);

        // ADAPT MESSAGE INSTANTLY (no AI call)
        const generatedMessage = adaptMessage(messageTemplate, consultantName, name);

        return {
          name,
          address,
          phone: extractPhone(place.phoneNumber || place.phone || '', config.phonePrefix),
          email,
          website: extractDomain(place.website || ''),
          rating: place.rating ? parseFloat(place.rating) : undefined,
          reviews_count: place.reviewsCount || place.reviews || undefined,
          category: place.category || niche,
          place_id: placeId || undefined,
          latitude: place.latitude ?? place.gps_coordinates?.latitude ?? undefined,
          longitude: place.longitude ?? place.gps_coordinates?.longitude ?? undefined,
          generatedMessage,
        } as BusinessResult;
      })
      .filter((r: BusinessResult | null): r is BusinessResult => !!r);

    console.log(`Final results with messages: ${results.length}`);

    return new Response(
      JSON.stringify({ success: true, results, countryCode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractEmail(place: any): string | undefined {
  if (place.email) return place.email;
  
  const textToSearch = [
    place.description || '',
    place.additionalInfo || '',
    place.snippet || '',
  ].join(' ');
  
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = textToSearch.match(emailRegex);
  
  if (matches && matches.length > 0) {
    return matches[0].toLowerCase();
  }
  
  return undefined;
}

function extractPhone(phone: string, prefix: string): string | undefined {
  if (!phone) return undefined;
  
  const cleaned = phone.replace(/[^\d()+\s-]/g, '').trim();
  const digits = cleaned.replace(/\D/g, '');
  
  if (digits.length >= 8 && digits.length <= 15) {
    return cleaned;
  }
  
  return undefined;
}

function extractDomain(url: string): string | undefined {
  if (!url) return undefined;
  
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}
