import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  city: string;
  state: string;
  niche: string;
}

interface BusinessResult {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews_count?: number;
  category?: string;
  place_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, state, niche }: SearchRequest = await req.json();

    if (!city || !state || !niche) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cidade, estado e nicho são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('SERPER_API_KEY');
    if (!apiKey) {
      console.error('SERPER_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Serper.dev não configurado. Configure a API key.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Buscando via Serper: ${niche} em ${city}, ${state}`);

    // Busca otimizada para Google Maps/Places via Serper
    const searchQuery = `${niche} em ${city} ${state}`;
    
    const searchResponse = await fetch('https://google.serper.dev/places', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: searchQuery,
        gl: 'br',
        hl: 'pt-br',
        num: 20,
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Erro Serper:', searchResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Erro na busca: ${searchResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchData = await searchResponse.json();
    console.log(`Resultados Serper: ${searchData.places?.length || 0}`);

    const places = searchData.places || [];
    
    // Processar resultados do Serper Places
    const results: BusinessResult[] = places.map((place: any) => ({
      name: place.title || place.name || '',
      address: place.address || `${city}, ${state}`,
      phone: extractPhone(place.phoneNumber || place.phone || ''),
      website: extractDomain(place.website || ''),
      rating: place.rating ? parseFloat(place.rating) : undefined,
      reviews_count: place.reviewsCount || place.reviews || undefined,
      category: place.category || niche,
      place_id: place.placeId || place.cid || undefined,
    })).filter((r: BusinessResult) => r.name && r.name.length >= 3);

    console.log(`Resultados processados: ${results.length}`);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractPhone(phone: string): string | undefined {
  if (!phone) return undefined;
  
  // Remove caracteres especiais mas mantém formato legível
  const cleaned = phone.replace(/[^\d()+\s-]/g, '').trim();
  
  // Verifica se tem pelo menos 10 dígitos
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length >= 10 && digits.length <= 13) {
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
