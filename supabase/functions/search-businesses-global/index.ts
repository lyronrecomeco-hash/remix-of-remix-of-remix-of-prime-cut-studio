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

// Message templates per language/region - ADAPTADAS automaticamente
const MESSAGE_TEMPLATES: Record<string, string> = {
  'pt-BR': `Olá, tudo bem? 👋

Me chamo {NOME} e trabalho ajudando negócios como a *{EMPRESA}* a ter mais presença no Google e automatizar agendamentos.

Desenvolvemos:
✅ Sites profissionais
✅ Sistema de agendamento automático  
✅ Automação de WhatsApp

Posso te mostrar como funciona?`,

  'pt-PT': `Olá, tudo bem? 👋

O meu nome é {NOME} e trabalho a ajudar negócios como a *{EMPRESA}* a melhorar a sua presença online.

Desenvolvemos:
✅ Websites profissionais
✅ Sistema de agendamento automático  
✅ Automação de WhatsApp

Se fizer sentido, terei todo o gosto em explicar.`,

  'es': `Hola, ¿cómo está? 👋

Mi nombre es {NOME} y trabajo ayudando a negocios como *{EMPRESA}* a mejorar su presencia online.

Ofrecemos:
✅ Sitios web profesionales
✅ Sistema de citas automático  
✅ Automatización de WhatsApp

¿Puedo explicarle cómo funciona?`,

  'es-MX': `Hola, ¿cómo está? 👋

Mi nombre es {NOME} y trabajo ayudando a negocios como *{EMPRESA}* a mejorar su presencia en línea.

Ofrecemos:
✅ Sitios web profesionales
✅ Sistema de citas automático  
✅ Automatización de WhatsApp

¿Le gustaría saber más?`,

  'es-AR': `Hola, ¿cómo andás? 👋

Soy {NOME} y laburo ayudando a negocios como *{EMPRESA}* a mejorar su presencia online.

Ofrecemos:
✅ Sitios web profesionales
✅ Sistema de turnos automático  
✅ Automatización de WhatsApp

¿Te cuento cómo funciona?`,

  'en': `Hello! 👋

My name is {NOME} and I help businesses like *{EMPRESA}* improve their online presence.

We offer:
✅ Professional websites
✅ Automatic scheduling system  
✅ WhatsApp automation

Would you like to know more?`,

  'en-UK': `Hello! 👋

My name is {NOME} and I help businesses like *{EMPRESA}* improve their online presence.

We offer:
✅ Professional websites
✅ Automatic booking system  
✅ WhatsApp automation

I'd be pleased to explain if you're interested.`,

  'de': `Guten Tag! 👋

Mein Name ist {NOME} und ich helfe Unternehmen wie *{EMPRESA}*, ihre Online-Präsenz zu verbessern.

Wir bieten:
✅ Professionelle Websites
✅ Automatisches Terminbuchungssystem  
✅ WhatsApp-Automatisierung

Darf ich Ihnen mehr erzählen?`,

  'fr': `Bonjour ! 👋

Je me présente, {NOME}. J'accompagne des entreprises comme *{EMPRESA}* pour améliorer leur présence en ligne.

Nous proposons :
✅ Sites web professionnels
✅ Système de prise de rendez-vous automatique  
✅ Automatisation WhatsApp

Puis-je vous en dire plus ?`,

  'it': `Buongiorno! 👋

Mi chiamo {NOME} e aiuto attività come *{EMPRESA}* a migliorare la loro presenza online.

Offriamo:
✅ Siti web professionali
✅ Sistema di prenotazione automatico  
✅ Automazione WhatsApp

Posso spiegarLe come funziona?`,

  'ja': `こんにちは！👋

私の名前は{NOME}です。*{EMPRESA}*のような企業のオンラインプレゼンス向上をお手伝いしています。

提供サービス：
✅ プロフェッショナルなウェブサイト
✅ 自動予約システム
✅ WhatsApp自動化

詳しくご説明しましょうか？`,
};

function adaptMessage(template: string, affiliateName: string, businessName: string): string {
  return template
    .replace(/{NOME}/g, affiliateName)
    .replace(/{EMPRESA}/g, businessName);
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
