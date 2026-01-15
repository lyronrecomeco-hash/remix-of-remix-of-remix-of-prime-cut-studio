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

// Links por nicho
const NICHE_LINKS: Record<string, string> = {
  'barbearia': 'https://genesishub.cloud/barbearia',
  'academia': 'https://genesishub.cloud/academia',
  'salao': 'https://genesishub.cloud/salao',
  'clinica': 'https://genesishub.cloud/clinica',
  'dentista': 'https://genesishub.cloud/dentista',
  'restaurante': 'https://genesishub.cloud/restaurante',
  'petshop': 'https://genesishub.cloud/petshop',
  'default': 'https://genesishub.cloud/demo',
};

// Message templates per language/region - ADAPTADAS automaticamente COM variações anti-ban
const MESSAGE_TEMPLATES: Record<string, { base: string; variations: string[] }> = {
  'pt-BR': {
    base: `Olá, tudo bem?

Me chamo {NOME}.

Trabalho ajudando negócios locais a transformar visitas em contatos reais, com sites profissionais e automação de atendimento.

Hoje implementamos:

• Site profissional focado em conversão
• Agendamento online automático
• Integração direta com WhatsApp

Isso organiza o atendimento, evita perda de clientes e aumenta a taxa de conversão sem aumentar equipe.

Posso te mostrar como funciona na prática.
🔗 Link: {DEMO_LINK}`,
    variations: [
      `Oi, como vai?

Sou {NOME}, trabalho com soluções digitais para negócios locais.

Ajudo estabelecimentos a captar mais clientes através de:

• Sites otimizados para conversão
• Sistema de agendamento 24h
• Automação de WhatsApp

Tudo integrado para funcionar automaticamente enquanto você foca no seu negócio.

Veja na prática como funciona:
🔗 {DEMO_LINK}`,
      `Olá!

Aqui é {NOME}. Trabalho transformando a presença digital de negócios locais.

Nossas soluções incluem:

• Website profissional que converte
• Agendamento online integrado
• Atendimento automático no WhatsApp

Isso elimina perda de clientes e organiza seu atendimento.

Confira o sistema funcionando:
🔗 {DEMO_LINK}`,
      `Oi, tudo certo?

Me chamo {NOME} e ajudo empresas a ter presença digital profissional.

O que oferecemos:

• Site focado em trazer clientes
• Sistema de agendamento automático
• Integração com WhatsApp

Sem aumentar equipe, você atende mais e melhor.

Olha como funciona:
🔗 {DEMO_LINK}`,
      `E aí, beleza?

{NOME} aqui! Trabalho com automação comercial pra negócios locais.

Entrego:

• Site profissional moderno
• Agendamento online integrado
• WhatsApp automatizado

Sua empresa atendendo 24h sem você precisar estar lá.

Dá uma olhada:
🔗 {DEMO_LINK}`,
      `Bom dia!

Sou {NOME}, especialista em presença digital para negócios.

Meu trabalho é ajudar você a:

• Ter um site que realmente converte
• Automatizar seus agendamentos
• Integrar tudo ao WhatsApp

Menos trabalho manual, mais resultados.

Veja o demo:
🔗 {DEMO_LINK}`,
    ]
  },

  'pt-PT': {
    base: `Olá, tudo bem?

Chamo-me {NOME} e ajudo empresas como a sua a melhorar a presença online.

Desenvolvemos:
• Sites profissionais focados em conversão
• Sistema de agendamento automático  
• Automação de WhatsApp

Veja como funciona:
🔗 {DEMO_LINK}`,
    variations: [
      `Olá!

Sou {NOME}, trabalho com soluções digitais para negócios.

Oferecemos:
• Website profissional
• Agendamento online 24h
• Integração WhatsApp

Confira o sistema:
🔗 {DEMO_LINK}`,
    ]
  },

  'es': {
    base: `Hola, ¿cómo está?

Mi nombre es {NOME} y ayudo a negocios locales a mejorar su presencia online.

Ofrecemos:
• Sitios web profesionales enfocados en conversión
• Sistema de citas automático  
• Automatización de WhatsApp

Vea cómo funciona:
🔗 {DEMO_LINK}`,
    variations: [
      `¡Hola!

Soy {NOME}. Trabajo transformando la presencia digital de negocios.

Nuestras soluciones:
• Website profesional
• Agenda online automática
• WhatsApp integrado

Mira el demo:
🔗 {DEMO_LINK}`,
    ]
  },

  'es-MX': {
    base: `Hola, ¿cómo estás?

Soy {NOME} y ayudo a negocios como el tuyo a tener mejor presencia en línea.

Ofrecemos:
• Sitios web profesionales
• Sistema de citas automático  
• Automatización de WhatsApp

Mira cómo funciona:
🔗 {DEMO_LINK}`,
    variations: [
      `¡Qué onda!

{NOME} aquí. Trabajo con soluciones digitales para negocios locales.

Te ofrezco:
• Website profesional
• Agenda en línea 24/7
• WhatsApp automatizado

Checa el demo:
🔗 {DEMO_LINK}`,
    ]
  },

  'es-AR': {
    base: `Hola, ¿cómo andás?

Soy {NOME} y laburo ayudando negocios a mejorar su presencia online.

Ofrecemos:
• Sitios web profesionales
• Sistema de turnos automático  
• Automatización de WhatsApp

Mirá cómo funciona:
🔗 {DEMO_LINK}`,
    variations: [
      `¿Qué tal?

{NOME} acá. Me dedico a la presencia digital de negocios.

Ofrezco:
• Website profesional
• Turnos online 24h
• WhatsApp automatizado

Mirá el demo:
🔗 {DEMO_LINK}`,
    ]
  },

  'en': {
    base: `Hello!

My name is {NOME} and I help local businesses improve their online presence.

We offer:
• Professional websites focused on conversion
• Automatic scheduling system  
• WhatsApp automation

See how it works:
🔗 {DEMO_LINK}`,
    variations: [
      `Hi there!

I'm {NOME}, I work with digital solutions for local businesses.

Our services:
• Professional website
• 24/7 online booking
• WhatsApp integration

Check out the demo:
🔗 {DEMO_LINK}`,
    ]
  },

  'en-UK': {
    base: `Hello!

I'm {NOME} and I help businesses improve their online presence.

We offer:
• Professional websites
• Automatic booking system  
• WhatsApp automation

See how it works:
🔗 {DEMO_LINK}`,
    variations: [
      `Hi!

{NOME} here. I work with digital solutions for local businesses.

Our services include:
• Professional website
• Online booking 24/7
• WhatsApp integration

Have a look at the demo:
🔗 {DEMO_LINK}`,
    ]
  },

  'de': {
    base: `Guten Tag!

Mein Name ist {NOME}. Ich helfe Unternehmen, ihre Online-Präsenz zu verbessern.

Wir bieten:
• Professionelle Websites
• Automatisches Terminbuchungssystem  
• WhatsApp-Automatisierung

Sehen Sie, wie es funktioniert:
🔗 {DEMO_LINK}`,
    variations: [
      `Hallo!

Ich bin {NOME} und arbeite mit digitalen Lösungen für lokale Unternehmen.

Unsere Dienstleistungen:
• Professionelle Website
• Online-Terminbuchung 24/7
• WhatsApp-Integration

Schauen Sie sich die Demo an:
🔗 {DEMO_LINK}`,
    ]
  },

  'fr': {
    base: `Bonjour !

Je suis {NOME}. J'accompagne les entreprises pour améliorer leur présence en ligne.

Nous proposons :
• Sites web professionnels
• Système de prise de rendez-vous automatique  
• Automatisation WhatsApp

Découvrez comment ça fonctionne :
🔗 {DEMO_LINK}`,
    variations: [
      `Salut !

{NOME} ici. Je travaille avec des solutions digitales pour les entreprises locales.

Nos services :
• Site web professionnel
• Réservation en ligne 24h/24
• Intégration WhatsApp

Regardez la démo :
🔗 {DEMO_LINK}`,
    ]
  },

  'it': {
    base: `Buongiorno!

Mi chiamo {NOME} e aiuto le attività a migliorare la loro presenza online.

Offriamo:
• Siti web professionali
• Sistema di prenotazione automatico  
• Automazione WhatsApp

Guardi come funziona:
🔗 {DEMO_LINK}`,
    variations: [
      `Ciao!

Sono {NOME}, lavoro con soluzioni digitali per attività locali.

I nostri servizi:
• Sito web professionale
• Prenotazioni online 24/7
• Integrazione WhatsApp

Guarda la demo:
🔗 {DEMO_LINK}`,
    ]
  },

  'ja': {
    base: `こんにちは！

私は{NOME}と申します。地元企業のオンラインプレゼンス向上をお手伝いしています。

提供サービス：
• プロフェッショナルなウェブサイト
• 自動予約システム
• WhatsApp自動化

デモをご覧ください：
🔗 {DEMO_LINK}`,
    variations: [
      `こんにちは！

{NOME}です。地域ビジネス向けのデジタルソリューションを提供しています。

サービス内容：
• プロサイト制作
• 24時間オンライン予約
• WhatsApp連携

デモはこちら：
🔗 {DEMO_LINK}`,
    ]
  },
};

const DEFAULT_DEMO_LINK = 'https://genesishub.cloud/demo';

function getNicheLinkFromCategory(category: string): string {
  // Tenta encontrar o link do nicho baseado na categoria
  const categoryLower = category?.toLowerCase() || '';
  
  if (categoryLower.includes('barb') || categoryLower.includes('cabelo') || categoryLower.includes('hair')) {
    return NICHE_LINKS['barbearia'];
  }
  if (categoryLower.includes('acad') || categoryLower.includes('gym') || categoryLower.includes('fitness') || categoryLower.includes('crossfit')) {
    return NICHE_LINKS['academia'];
  }
  if (categoryLower.includes('salão') || categoryLower.includes('salon') || categoryLower.includes('beleza') || categoryLower.includes('beauty')) {
    return NICHE_LINKS['salao'];
  }
  if (categoryLower.includes('clínic') || categoryLower.includes('clinic') || categoryLower.includes('médic') || categoryLower.includes('medic')) {
    return NICHE_LINKS['clinica'];
  }
  if (categoryLower.includes('dent') || categoryLower.includes('odont')) {
    return NICHE_LINKS['dentista'];
  }
  if (categoryLower.includes('restaur') || categoryLower.includes('food') || categoryLower.includes('comida')) {
    return NICHE_LINKS['restaurante'];
  }
  if (categoryLower.includes('pet') || categoryLower.includes('vet') || categoryLower.includes('animal')) {
    return NICHE_LINKS['petshop'];
  }
  
  return NICHE_LINKS['default'];
}

function adaptMessage(templateConfig: { base: string; variations: string[] }, affiliateName: string, businessName: string, category?: string): string {
  // Escolhe aleatoriamente entre base e variações para evitar ban do WhatsApp
  const allTemplates = [templateConfig.base, ...templateConfig.variations];
  const randomTemplate = allTemplates[Math.floor(Math.random() * allTemplates.length)];
  
  // Pega o link apropriado para o nicho
  const demoLink = getNicheLinkFromCategory(category || '');
  
  return randomTemplate
    .replace(/{NOME}/g, affiliateName)
    .replace(/{EMPRESA}/g, businessName)
    .replace(/{DEMO_LINK}/g, demoLink);
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

        // ADAPT MESSAGE INSTANTLY (no AI call) - passa categoria para link correto
        const category = place.category || niche;
        const generatedMessage = adaptMessage(messageTemplate, consultantName, name, category);

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
