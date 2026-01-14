import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  city: string;
  state: string;
  niche: string;
  maxResults?: number; // limite desejado no retorno (opcional)
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
    const body: SearchRequest & { max_results?: number } = await req.json();
    const { city, state, niche } = body;
    const requestedMaxResults = Number(body.maxResults ?? body.max_results);

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

    // A API pode não respeitar "num" alto. Então fazemos paginação progressiva
    // e paramos quando não vierem novos resultados.
    const PER_PAGE = 20;
    const HARD_CAP = 500;
    const DEFAULT_MAX_RESULTS = 200;

    const maxResults = Number.isFinite(requestedMaxResults)
      ? Math.min(HARD_CAP, Math.max(20, requestedMaxResults))
      : DEFAULT_MAX_RESULTS;

    const maxPages = Math.ceil(maxResults / PER_PAGE);

    const allPlaces: any[] = [];
    const rawSeen = new Set<string>();
    let consecutiveNoNew = 0;

    for (let page = 1; page <= maxPages; page++) {
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
          num: PER_PAGE,
          page,
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
      const places = searchData.places || [];
      console.log(`Resultados Serper (page ${page}): ${places.length}`);

      if (places.length === 0) break;

      let addedOnPage = 0;
      for (const place of places) {
        const placeId = place.placeId || place.cid || '';
        const name = place.title || place.name || '';
        const address = place.address || '';
        const key = `${placeId}::${name}::${address}`.toLowerCase();

        if (!name || name.length < 3) continue;
        if (rawSeen.has(key)) continue;

        rawSeen.add(key);
        allPlaces.push(place);
        addedOnPage++;

        if (allPlaces.length >= maxResults) break;
      }

      if (allPlaces.length >= maxResults) break;

      if (addedOnPage === 0) {
        consecutiveNoNew++;
        if (consecutiveNoNew >= 2) break;
      } else {
        consecutiveNoNew = 0;
      }
    }

    // Deduplicar e processar
    const seen = new Set<string>();
    const results: BusinessResult[] = allPlaces
      .map((place: any) => {
        const placeId = place.placeId || place.cid || '';
        const name = place.title || place.name || '';
        const address = place.address || `${city}, ${state}`;
        const key = `${placeId}::${name}::${address}`.toLowerCase();

        if (!name || name.length < 3) return null;
        if (seen.has(key)) return null;
        seen.add(key);

        return {
          name,
          address,
          phone: extractPhone(place.phoneNumber || place.phone || ''),
          website: extractDomain(place.website || ''),
          rating: place.rating ? parseFloat(place.rating) : undefined,
          reviews_count: place.reviewsCount || place.reviews || undefined,
          category: place.category || niche,
          place_id: placeId || undefined,
        } as BusinessResult;
      })
      .filter((r: BusinessResult | null): r is BusinessResult => !!r);

    console.log(`Resultados processados (dedup): ${results.length}`);

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
