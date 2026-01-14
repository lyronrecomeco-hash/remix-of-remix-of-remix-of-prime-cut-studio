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
}

// Country configuration for search
const COUNTRY_CONFIG: Record<string, { gl: string; hl: string; phonePrefix: string }> = {
  BR: { gl: 'br', hl: 'pt-br', phonePrefix: '55' },
  US: { gl: 'us', hl: 'en', phonePrefix: '1' },
  PT: { gl: 'pt', hl: 'pt-pt', phonePrefix: '351' },
  ES: { gl: 'es', hl: 'es', phonePrefix: '34' },
  MX: { gl: 'mx', hl: 'es', phonePrefix: '52' },
  AR: { gl: 'ar', hl: 'es', phonePrefix: '54' },
  CO: { gl: 'co', hl: 'es', phonePrefix: '57' },
  CL: { gl: 'cl', hl: 'es', phonePrefix: '56' },
  PE: { gl: 'pe', hl: 'es', phonePrefix: '51' },
  UK: { gl: 'uk', hl: 'en', phonePrefix: '44' },
  DE: { gl: 'de', hl: 'de', phonePrefix: '49' },
  FR: { gl: 'fr', hl: 'fr', phonePrefix: '33' },
  IT: { gl: 'it', hl: 'it', phonePrefix: '39' },
  CA: { gl: 'ca', hl: 'en', phonePrefix: '1' },
  AU: { gl: 'au', hl: 'en', phonePrefix: '61' },
  JP: { gl: 'jp', hl: 'ja', phonePrefix: '81' },
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

    // Pagination settings
    const PER_PAGE = 20;
    const HARD_CAP = 500;
    const DEFAULT_MAX = 200;
    const maxResults = Math.min(HARD_CAP, Math.max(20, requestedMax || DEFAULT_MAX));
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
          gl: config.gl,
          hl: config.hl,
          num: PER_PAGE,
          page,
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
      console.log(`Page ${page}: ${places.length} results`);

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

    // Deduplicate and process results
    const seen = new Set<string>();
    const results: BusinessResult[] = allPlaces
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
        } as BusinessResult;
      })
      .filter((r: BusinessResult | null): r is BusinessResult => !!r);

    console.log(`Final results: ${results.length}`);

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
  // Try to extract email from various possible fields
  if (place.email) return place.email;
  
  // Sometimes email is in the description or additional info
  const textToSearch = [
    place.description || '',
    place.additionalInfo || '',
    place.snippet || '',
  ].join(' ');
  
  // Email regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = textToSearch.match(emailRegex);
  
  if (matches && matches.length > 0) {
    return matches[0].toLowerCase();
  }
  
  // If we have a website, try to construct a common email pattern
  if (place.website) {
    try {
      const urlObj = new URL(place.website.startsWith('http') ? place.website : `https://${place.website}`);
      const domain = urlObj.hostname.replace(/^www\./, '');
      // Return a placeholder indicating we can derive email from domain
      // In production, this could be verified with an email verification API
      return undefined; // Don't fabricate emails
    } catch {
      // Ignore URL parsing errors
    }
  }
  
  return undefined;
}

function extractPhone(phone: string, prefix: string): string | undefined {
  if (!phone) return undefined;
  
  const cleaned = phone.replace(/[^\d()+\s-]/g, '').trim();
  const digits = cleaned.replace(/\D/g, '');
  
  // Accept phone numbers with 8-15 digits
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
