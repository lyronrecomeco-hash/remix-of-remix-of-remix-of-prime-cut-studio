import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Regiões de busca com cidades alvo organizadas por tamanho
const SEARCH_REGIONS: Record<string, { 
  cities: { name: string; size: 'large' | 'medium' | 'small' }[]; 
  countryCode: string; 
  lang: string 
}> = {
  'USA': {
    cities: [
      { name: 'New York', size: 'large' },
      { name: 'Los Angeles', size: 'large' },
      { name: 'Chicago', size: 'large' },
      { name: 'Houston', size: 'large' },
      { name: 'Miami', size: 'large' },
      { name: 'Phoenix', size: 'medium' },
      { name: 'San Diego', size: 'medium' },
      { name: 'Dallas', size: 'medium' },
      { name: 'Austin', size: 'medium' },
      { name: 'Denver', size: 'medium' },
      { name: 'Portland', size: 'small' },
      { name: 'Tampa', size: 'small' },
    ],
    countryCode: 'US',
    lang: 'en',
  },
  'Europe': {
    cities: [
      { name: 'London', size: 'large' },
      { name: 'Paris', size: 'large' },
      { name: 'Madrid', size: 'large' },
      { name: 'Berlin', size: 'large' },
      { name: 'Rome', size: 'large' },
      { name: 'Amsterdam', size: 'medium' },
      { name: 'Barcelona', size: 'medium' },
      { name: 'Munich', size: 'medium' },
      { name: 'Milan', size: 'medium' },
      { name: 'Vienna', size: 'medium' },
    ],
    countryCode: 'UK',
    lang: 'en',
  },
  'BR': {
    cities: [
      { name: 'São Paulo', size: 'large' },
      { name: 'Rio de Janeiro', size: 'large' },
      { name: 'Belo Horizonte', size: 'large' },
      { name: 'Brasília', size: 'large' },
      { name: 'Salvador', size: 'large' },
      { name: 'Curitiba', size: 'medium' },
      { name: 'Porto Alegre', size: 'medium' },
      { name: 'Fortaleza', size: 'medium' },
      { name: 'Recife', size: 'medium' },
      { name: 'Manaus', size: 'medium' },
      { name: 'Goiânia', size: 'medium' },
      { name: 'Campinas', size: 'small' },
      { name: 'Florianópolis', size: 'small' },
      { name: 'Vitória', size: 'small' },
      { name: 'Natal', size: 'small' },
    ],
    countryCode: 'BR',
    lang: 'pt-BR',
  },
  'MX': {
    cities: [
      { name: 'Mexico City', size: 'large' },
      { name: 'Guadalajara', size: 'large' },
      { name: 'Monterrey', size: 'large' },
      { name: 'Puebla', size: 'medium' },
      { name: 'Tijuana', size: 'medium' },
      { name: 'León', size: 'small' },
      { name: 'Cancún', size: 'small' },
    ],
    countryCode: 'MX',
    lang: 'es',
  },
  'AR': {
    cities: [
      { name: 'Buenos Aires', size: 'large' },
      { name: 'Córdoba', size: 'medium' },
      { name: 'Rosario', size: 'medium' },
      { name: 'Mendoza', size: 'small' },
    ],
    countryCode: 'AR',
    lang: 'es',
  },
  'CO': {
    cities: [
      { name: 'Bogotá', size: 'large' },
      { name: 'Medellín', size: 'large' },
      { name: 'Cali', size: 'medium' },
      { name: 'Barranquilla', size: 'medium' },
    ],
    countryCode: 'CO',
    lang: 'es',
  },
  'CL': {
    cities: [
      { name: 'Santiago', size: 'large' },
      { name: 'Valparaíso', size: 'medium' },
      { name: 'Concepción', size: 'small' },
    ],
    countryCode: 'CL',
    lang: 'es',
  },
  'PT': {
    cities: [
      { name: 'Lisboa', size: 'large' },
      { name: 'Porto', size: 'medium' },
      { name: 'Braga', size: 'small' },
      { name: 'Coimbra', size: 'small' },
      { name: 'Faro', size: 'small' },
    ],
    countryCode: 'PT',
    lang: 'pt-PT',
  },
  'ES': {
    cities: [
      { name: 'Madrid', size: 'large' },
      { name: 'Barcelona', size: 'large' },
      { name: 'Valencia', size: 'medium' },
      { name: 'Sevilla', size: 'medium' },
      { name: 'Bilbao', size: 'small' },
    ],
    countryCode: 'ES',
    lang: 'es',
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
    'clinic': 'medical clinic near me',
    'gym': 'fitness gym local',
    'restaurant': 'restaurant local',
    'petshop': 'pet shop grooming',
    'laundry': 'laundry dry cleaning',
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
    'clinica': 'clínica médica perto',
    'academia': 'academia musculação',
    'restaurante': 'restaurante local',
    'florista': 'floricultura flores',
    'lavanderia': 'lavanderia roupas',
  },
  'pt-PT': {
    'barbearia': 'barbearia perto',
    'cabeleireiro': 'cabeleireiro local',
    'mecanico': 'oficina automóvel',
    'padaria': 'padaria pastelaria',
    'florista': 'florista',
    'limpezas': 'empresa limpezas',
    'clinica': 'clínica médica',
    'ginasio': 'ginásio fitness',
  },
  'es': {
    'barberia': 'barbería cerca',
    'peluqueria': 'peluquería barrio',
    'taller': 'taller mecánico',
    'panaderia': 'panadería local',
    'floristeria': 'floristería',
    'plomero': 'plomero servicios',
    'lavanderia': 'lavandería',
    'clinica': 'clínica médica cerca',
    'gimnasio': 'gimnasio fitness',
    'restaurante': 'restaurante local',
    'veterinaria': 'veterinaria mascotas',
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
  countries?: string[];
  citySizes?: ('large' | 'medium' | 'small')[];
  niches?: string[];
  websiteFilter?: 'all' | 'no_website' | 'with_website';
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

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const serperApiKey = Deno.env.get('SERPER_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { affiliateId, region, niche, maxResults = 15, countries, citySizes, niches: nicheFilters, websiteFilter = 'all' }: RadarRequest = await req.json();

    if (!affiliateId) {
      throw new Error('affiliateId is required');
    }

    if (!serperApiKey) {
      throw new Error('SERPER_API_KEY not configured');
    }

    // Filter regions based on countries filter
    let availableRegions = Object.keys(SEARCH_REGIONS);
    if (countries && countries.length > 0) {
      availableRegions = availableRegions.filter(r => countries.includes(r));
      if (availableRegions.length === 0) {
        availableRegions = ['BR'];
      }
    }

    // Select random region from filtered list
    const selectedRegion = region || availableRegions[Math.floor(Math.random() * availableRegions.length)];
    const regionConfig = SEARCH_REGIONS[selectedRegion];
    
    if (!regionConfig) {
      throw new Error(`Invalid region: ${selectedRegion}`);
    }

    // Filter cities by size if specified
    let availableCities = regionConfig.cities;
    if (citySizes && citySizes.length > 0) {
      availableCities = regionConfig.cities.filter(c => citySizes.includes(c.size));
      if (availableCities.length === 0) {
        availableCities = regionConfig.cities;
      }
    }

    // Select random city from filtered list
    const selectedCity = availableCities[Math.floor(Math.random() * availableCities.length)];
    const city = selectedCity.name;
    
    // Select niche - use filter if provided
    const langNiches = SEARCH_NICHES[regionConfig.lang] || SEARCH_NICHES['en'];
    let availableNiches = Object.keys(langNiches);
    
    if (nicheFilters && nicheFilters.length > 0) {
      const matchedNiches = availableNiches.filter(n => nicheFilters.includes(n));
      if (matchedNiches.length > 0) {
        availableNiches = matchedNiches;
      }
    }
    
    const selectedNiche = niche || availableNiches[Math.floor(Math.random() * availableNiches.length)];
    const searchNiche = langNiches[selectedNiche] || selectedNiche;
    
    console.log(`🔍 [SCAN START] ${searchNiche} em ${city}, ${selectedRegion}`);

    // Search via Serper API
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

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Serper API error:', errorText);
      throw new Error('Search API error');
    }

    const searchData = await searchResponse.json();
    const places = searchData.places || [];

    console.log(`📍 [FOUND] ${places.length} negócios em ${city}`);

    if (places.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          opportunities: [], 
          message: 'No businesses found',
          scanInfo: { region: selectedRegion, city, niche: selectedNiche, total: 0, qualified: 0 },
          logs: [`🔍 Vasculhando ${city}...`, `⚠️ Nenhum negócio encontrado`]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing opportunities in BATCH for faster comparison
    const businessNames = places.map((p: any) => p.title || p.name);
    const { data: existingOpps } = await supabase
      .from('global_radar_opportunities')
      .select('company_name')
      .eq('affiliate_id', affiliateId)
      .in('company_name', businessNames);

    const existingNames = new Set((existingOpps || []).map(o => o.company_name));
    console.log(`📊 [CHECK] ${existingNames.size} já existentes de ${businessNames.length}`);

    // Process and filter opportunities
    const opportunitiesToInsert = [];
    const logs: string[] = [
      `🔍 Vasculhando ${city}, ${selectedRegion}...`,
      `🎯 Nicho: ${selectedNiche}`,
      `📍 ${places.length} negócios encontrados`,
    ];
    
    for (const place of places) {
      const companyName = place.title || place.name;
      
      // Skip if already exists
      if (existingNames.has(companyName)) {
        continue;
      }

      const hasWebsite = !!place.website;
      
      // Apply website filter
      if (websiteFilter === 'no_website' && hasWebsite) continue;
      if (websiteFilter === 'with_website' && !hasWebsite) continue;
      
      const score = calculateOpportunityScore({
        website: place.website,
        phone: place.phone,
        rating: place.rating,
        reviews_count: place.reviewsCount,
      });

      // Accept businesses with score >= 40
      if (score < 40) continue;

      const level = getOpportunityLevel(score);
      const values = NICHE_VALUES[selectedNiche] || NICHE_VALUES['default'];
      const multiplier = score >= 80 ? 1.2 : 1.0;

      opportunitiesToInsert.push({
        affiliate_id: affiliateId,
        company_name: companyName,
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
      });
    }

    // BATCH INSERT for speed
    let insertedCount = 0;
    if (opportunitiesToInsert.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('global_radar_opportunities')
        .insert(opportunitiesToInsert)
        .select();

      if (insertError) {
        console.error('Batch insert error:', insertError.message);
      } else {
        insertedCount = inserted?.length || 0;
        logs.push(`✅ ${insertedCount} oportunidades qualificadas`);
      }
    }

    // Log summary
    const noWebsiteCount = opportunitiesToInsert.filter(o => !o.has_website).length;
    if (noWebsiteCount > 0) {
      logs.push(`🔥 ${noWebsiteCount} sem site (alta conversão)`);
    }

    const elapsed = Date.now() - startTime;
    logs.push(`⚡ Concluído em ${elapsed}ms`);

    console.log(`✅ [DONE] ${insertedCount} inseridos em ${elapsed}ms`);

    // Save to search history (non-blocking)
    try {
      await supabase
        .from('genesis_search_history')
        .insert({
          user_id: affiliateId,
          user_name: 'Radar Global',
          user_email: '',
          search_type: 'radar',
          search_query: searchQuery,
          city: city,
          state: selectedRegion,
          niche: selectedNiche,
          results_count: insertedCount,
          credits_used: 1
        });
      console.log('📝 History saved');
    } catch (historyError) {
      console.error('History error:', historyError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        opportunities: opportunitiesToInsert,
        scanInfo: {
          region: selectedRegion,
          city,
          niche: selectedNiche,
          total: places.length,
          qualified: insertedCount,
          elapsed,
        },
        logs,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Global Radar error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        logs: [`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
