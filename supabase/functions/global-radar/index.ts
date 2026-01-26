import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Regiões de busca com cidades alvo
const SEARCH_REGIONS: Record<string, { cities: string[]; countryCode: string; lang: string }> = {
  'USA': {
    cities: ['New York', 'Los Angeles', 'Miami', 'Houston', 'Chicago', 'Phoenix', 'San Diego', 'Dallas', 'Austin', 'Denver'],
    countryCode: 'US',
    lang: 'en',
  },
  'Europe': {
    cities: ['London', 'Paris', 'Madrid', 'Berlin', 'Rome', 'Amsterdam', 'Barcelona', 'Munich', 'Milan', 'Vienna'],
    countryCode: 'UK',
    lang: 'en',
  },
  'Brazil': {
    cities: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Salvador', 'Fortaleza', 'Brasília', 'Recife', 'Manaus'],
    countryCode: 'BR',
    lang: 'pt-BR',
  },
  'Latin America': {
    cities: ['Buenos Aires', 'Santiago', 'Lima', 'Bogotá', 'Mexico City', 'Montevideo', 'Quito', 'Caracas', 'Medellín', 'Guadalajara'],
    countryCode: 'MX',
    lang: 'es',
  },
  'Portugal': {
    cities: ['Lisboa', 'Porto', 'Braga', 'Coimbra', 'Faro', 'Funchal', 'Aveiro', 'Setúbal', 'Leiria', 'Évora'],
    countryCode: 'PT',
    lang: 'pt-PT',
  },
};

// Nichos para busca
const SEARCH_NICHES: Record<string, Record<string, string>> = {
  'en': {
    'barbershop': 'barbershop near me',
    'salon': 'hair salon local',
    'mechanic': 'auto mechanic shop',
    'plumber': 'plumber services',
    'bakery': 'local bakery',
    'tailor': 'tailor alterations',
    'florist': 'flower shop',
    'cleaning': 'cleaning services',
  },
  'pt-BR': {
    'barbearia': 'barbearia perto de mim',
    'salao': 'salão de beleza bairro',
    'mecanica': 'oficina mecânica',
    'pizzaria': 'pizzaria delivery',
    'padaria': 'padaria perto',
    'lanchonete': 'lanchonete',
    'petshop': 'pet shop banho tosa',
    'manicure': 'manicure pedicure',
    'costureira': 'costureira consertos',
    'borracharia': 'borracharia',
  },
  'pt-PT': {
    'barbearia': 'barbearia perto',
    'cabeleireiro': 'cabeleireiro local',
    'mecanico': 'oficina automóvel',
    'padaria': 'padaria pastelaria',
    'florista': 'florista',
    'limpezas': 'empresa limpezas',
  },
  'es': {
    'barberia': 'barbería cerca',
    'peluqueria': 'peluquería barrio',
    'taller': 'taller mecánico',
    'panaderia': 'panadería local',
    'floristeria': 'floristería',
    'plomero': 'plomero servicios',
    'lavanderia': 'lavandería',
  },
};

// Valores estimados por nicho
const NICHE_VALUES: Record<string, { min: number; max: number; recurrence: number }> = {
  'barbershop': { min: 600, max: 900, recurrence: 120 },
  'barbearia': { min: 600, max: 900, recurrence: 120 },
  'barberia': { min: 600, max: 900, recurrence: 120 },
  'salon': { min: 700, max: 1100, recurrence: 150 },
  'salao': { min: 700, max: 1100, recurrence: 150 },
  'cabeleireiro': { min: 700, max: 1100, recurrence: 150 },
  'peluqueria': { min: 700, max: 1100, recurrence: 150 },
  'mechanic': { min: 800, max: 1300, recurrence: 160 },
  'mecanica': { min: 800, max: 1300, recurrence: 160 },
  'mecanico': { min: 800, max: 1300, recurrence: 160 },
  'taller': { min: 800, max: 1300, recurrence: 160 },
  'pizzaria': { min: 600, max: 1000, recurrence: 140 },
  'padaria': { min: 500, max: 900, recurrence: 120 },
  'panaderia': { min: 500, max: 900, recurrence: 120 },
  'bakery': { min: 500, max: 900, recurrence: 120 },
  'lanchonete': { min: 500, max: 800, recurrence: 110 },
  'petshop': { min: 600, max: 1000, recurrence: 130 },
  'manicure': { min: 400, max: 700, recurrence: 90 },
  'costureira': { min: 400, max: 700, recurrence: 90 },
  'tailor': { min: 400, max: 700, recurrence: 90 },
  'florist': { min: 500, max: 800, recurrence: 100 },
  'florista': { min: 500, max: 800, recurrence: 100 },
  'floristeria': { min: 500, max: 800, recurrence: 100 },
  'cleaning': { min: 600, max: 1000, recurrence: 140 },
  'limpezas': { min: 600, max: 1000, recurrence: 140 },
  'plumber': { min: 700, max: 1200, recurrence: 150 },
  'plomero': { min: 700, max: 1200, recurrence: 150 },
  'borracharia': { min: 500, max: 800, recurrence: 100 },
  'lavanderia': { min: 500, max: 900, recurrence: 110 },
  'default': { min: 500, max: 800, recurrence: 100 },
};

interface RadarRequest {
  affiliateId: string;
  region?: string;
  niche?: string;
  maxResults?: number;
}

function calculateOpportunityScore(business: any): number {
  let score = 60;
  
  if (!business.website) score += 30;
  else score -= 5;
  
  if (business.phone) score += 5;
  
  if (!business.rating || business.rating < 3) score += 10;
  else if (business.rating < 4) score += 5;
  else if (business.rating >= 4.5) score -= 5;
  
  if (!business.reviews_count || business.reviews_count < 20) score += 10;
  else if (business.reviews_count < 50) score += 5;
  
  return Math.min(100, Math.max(0, score));
}

function getOpportunityLevel(score: number): string {
  if (score >= 80) return 'advanced';
  if (score >= 60) return 'intermediate';
  return 'basic';
}

function getDigitalPresenceStatus(business: any): string {
  if (!business.website && !business.phone) {
    return 'Invisível digitalmente — oportunidade máxima';
  }
  if (!business.website) {
    return 'Sem presença digital — oportunidade máxima';
  }
  return 'Presença básica — pode melhorar';
}

function getServiceTags(niche: string): string[] {
  const tagMap: Record<string, string[]> = {
    'barbershop': ['scheduling', 'loyalty', 'online payments'],
    'barbearia': ['agendamento', 'fidelidade', 'pagamentos'],
    'salon': ['booking', 'catalog', 'promotions'],
    'salao': ['agendamento', 'catálogo', 'promoções'],
    'restaurant': ['digital menu', 'delivery', 'reservations'],
    'restaurante': ['cardápio digital', 'delivery', 'reservas'],
    'clinic': ['appointments', 'telemedicine', 'records'],
    'clinica': ['agendamento', 'teleconsulta', 'prontuário'],
    'default': ['website', 'automation', 'WhatsApp'],
  };
  
  return tagMap[niche] || tagMap['default'];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const serperApiKey = Deno.env.get('SERPER_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { affiliateId, region, niche, maxResults = 10 }: RadarRequest = await req.json();

    if (!affiliateId) {
      throw new Error('affiliateId is required');
    }

    if (!serperApiKey) {
      throw new Error('SERPER_API_KEY not configured');
    }

    // Buscar chave com menor uso para rotação
    let usedKeyId: string | null = null;
    const { data: rotatingKeys, error: keysError } = await supabase
      .from('genesis_api_keys')
      .select('id, usage_count')
      .eq('provider', 'serper')
      .eq('is_active', true)
      .order('usage_count', { ascending: true })
      .order('priority', { ascending: true })
      .limit(1);

    if (!keysError && rotatingKeys && rotatingKeys.length > 0) {
      usedKeyId = rotatingKeys[0].id;
      console.log(`Using rotating key: ${usedKeyId} (usage: ${rotatingKeys[0].usage_count})`);
    }

    // Selecionar região aleatória se não especificada
    const regions = Object.keys(SEARCH_REGIONS);
    const selectedRegion = region || regions[Math.floor(Math.random() * regions.length)];
    const regionConfig = SEARCH_REGIONS[selectedRegion];
    
    if (!regionConfig) {
      throw new Error(`Invalid region: ${selectedRegion}`);
    }

    // Selecionar cidade aleatória
    const city = regionConfig.cities[Math.floor(Math.random() * regionConfig.cities.length)];
    
    // Selecionar nicho aleatório se não especificado
    const niches = Object.keys(SEARCH_NICHES[regionConfig.lang] || SEARCH_NICHES['en']);
    const selectedNiche = niche || niches[Math.floor(Math.random() * niches.length)];
    const searchNiche = (SEARCH_NICHES[regionConfig.lang] || SEARCH_NICHES['en'])[selectedNiche] || selectedNiche;
    
    console.log(`Scanning: ${searchNiche} in ${city}, ${selectedRegion}`);

    // Buscar empresas via Serper
    const searchQuery = `${searchNiche} in ${city}`;
    
    const searchResponse = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: searchQuery,
        gl: regionConfig.countryCode.toLowerCase(),
        hl: regionConfig.lang.split('-')[0],
        num: Math.min(maxResults, 20),
      }),
    });

    // Incrementar uso da chave após chamada à API
    if (usedKeyId) {
      const { data: currentKey } = await supabase
        .from('genesis_api_keys')
        .select('usage_count')
        .eq('id', usedKeyId)
        .single();

      if (currentKey) {
        await supabase
          .from('genesis_api_keys')
          .update({ 
            usage_count: (currentKey.usage_count || 0) + 1,
            last_used_at: new Date().toISOString()
          })
          .eq('id', usedKeyId);
        
        console.log(`Key ${usedKeyId} usage incremented to ${(currentKey.usage_count || 0) + 1}`);
      }
    }

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Serper API error:', errorText);
      throw new Error('Search API error');
    }

    const searchData = await searchResponse.json();
    console.log('Serper response sample:', JSON.stringify(searchData).substring(0, 500));
    const places = searchData.places || [];

    // Buscar dados do usuário para o histórico
    const { data: userData } = await supabase
      .from('genesis_users')
      .select('id, name, email')
      .eq('id', affiliateId)
      .single();

    // Registrar no histórico de pesquisas
    await supabase
      .from('genesis_search_history')
      .insert({
        user_id: affiliateId,
        user_name: userData?.name || 'Unknown',
        user_email: userData?.email || '',
        search_type: 'radar',
        search_query: searchQuery,
        city: city,
        region: selectedRegion,
        niche: selectedNiche,
        results_count: places.length,
        api_key_id: usedKeyId,
        credits_used: 1
      });

    if (places.length === 0) {
      return new Response(
        JSON.stringify({ success: true, opportunities: [], message: 'No businesses found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filtrar e enriquecer resultados
    const opportunities = [];
    const debugInfo = [];
    
    for (const place of places) {
      // Pular se já existe
      const { data: existing } = await supabase
        .from('global_radar_opportunities')
        .select('id')
        .eq('affiliate_id', affiliateId)
        .eq('company_name', place.title || place.name)
        .single();
      
      if (existing) {
        debugInfo.push({ name: place.title || place.name, status: 'already_exists' });
        continue;
      }

      const hasWebsite = !!place.website;
      const score = calculateOpportunityScore({
        website: place.website,
        phone: place.phone,
        rating: place.rating,
        reviews_count: place.reviewsCount,
      });
      
      console.log(`Business: ${place.title || place.name} | Website: ${hasWebsite} | Rating: ${place.rating} | Reviews: ${place.reviewsCount} | Score: ${score}`);

      // Aceitar todos os negócios com score mínimo de 50
      if (score < 50) {
        debugInfo.push({ name: place.title || place.name, score, status: 'low_score' });
        continue;
      }

      const level = getOpportunityLevel(score);
      const values = NICHE_VALUES[selectedNiche] || NICHE_VALUES['default'];
      const multiplier = score >= 80 ? 1.2 : 1.0;

      const opportunity = {
        affiliate_id: affiliateId,
        company_name: place.title || place.name,
        company_phone: place.phone || null,
        company_website: place.website || null,
        company_address: place.address || null,
        company_city: city,
        company_country: selectedRegion,
        niche: selectedNiche,
        opportunity_score: score,
        opportunity_level: level,
        estimated_value_min: Math.round(values.min * multiplier),
        estimated_value_max: Math.round(values.max * multiplier),
        monthly_recurrence: Math.round(values.recurrence * multiplier),
        has_website: hasWebsite,
        has_whatsapp: false,
        has_online_scheduling: false,
        has_chatbot: false,
        digital_presence_status: getDigitalPresenceStatus({ website: place.website, phone: place.phone }),
        service_tags: getServiceTags(selectedNiche),
        ai_description: `${selectedNiche} em ${city} ${!hasWebsite ? 'sem presença digital — oportunidade máxima' : 'com potencial de melhoria'}`,
        pain_points: !hasWebsite 
          ? ['Perde clientes por não ser encontrado online', 'Sem agendamento automatizado', 'Atendimento manual']
          : ['Pode otimizar presença digital', 'Automação de atendimento'],
        missing_features: !hasWebsite
          ? ['Site profissional', 'Agendamento online', 'WhatsApp automatizado']
          : ['Otimização SEO', 'Automação avançada'],
        source: 'radar',
        search_region: selectedRegion,
        status: 'new',
        is_read: false,
      };

      // Inserir no banco
      const { data: insertedData, error: insertError } = await supabase
        .from('global_radar_opportunities')
        .insert(opportunity)
        .select()
        .single();

      if (insertError) {
        console.error(`Insert error for ${opportunity.company_name}:`, insertError.message);
      } else {
        console.log(`Inserted: ${opportunity.company_name} with score ${score}`);
        opportunities.push(opportunity);
      }
    }

    console.log(`Found ${opportunities.length} new opportunities`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        opportunities,
        scanned: {
          region: selectedRegion,
          city,
          niche: selectedNiche,
          total: places.length,
          qualified: opportunities.length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Global Radar error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
