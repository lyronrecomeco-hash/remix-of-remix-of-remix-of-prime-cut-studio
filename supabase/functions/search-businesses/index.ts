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
  opening_hours?: string;
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

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Buscando: ${niche} em ${city}, ${state}`);

    // Usar Firecrawl para buscar no Google Maps
    const searchQuery = `${niche} em ${city} ${state} Brasil`;
    const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;

    console.log('URL de busca:', googleMapsUrl);

    // Primeiro, usar o scrape para obter dados da página do Google Maps
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: googleMapsUrl,
        formats: ['markdown', 'html', 'links'],
        waitFor: 3000, // Esperar carregar resultados
        onlyMainContent: false,
      }),
    });

    const scrapeData = await scrapeResponse.json();
    
    if (!scrapeResponse.ok) {
      console.error('Erro no Firecrawl scrape:', scrapeData);
      
      // Fallback: usar search do Firecrawl
      console.log('Tentando busca alternativa via search...');
      
      const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `${niche} ${city} ${state} telefone endereço site`,
          limit: 15,
          lang: 'pt-BR',
          country: 'BR',
          scrapeOptions: {
            formats: ['markdown'],
          },
        }),
      });

      const searchData = await searchResponse.json();
      
      if (!searchResponse.ok) {
        console.error('Erro no Firecrawl search:', searchData);
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao buscar estabelecimentos' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Processar resultados da busca
      const results = parseSearchResults(searchData.data || [], city, state, niche);
      
      return new Response(
        JSON.stringify({ success: true, results, source: 'search' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Processar resultados do scrape do Google Maps
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
    const html = scrapeData.data?.html || scrapeData.html || '';
    
    console.log('Markdown length:', markdown.length);
    
    const results = parseGoogleMapsData(markdown, html, city, state, niche);
    
    console.log(`Encontrados ${results.length} resultados`);

    return new Response(
      JSON.stringify({ success: true, results, source: 'maps' }),
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

function parseGoogleMapsData(markdown: string, html: string, city: string, state: string, niche: string): BusinessResult[] {
  const results: BusinessResult[] = [];
  
  // Padrões para extrair informações do markdown/html do Google Maps
  const phonePattern = /\(?\d{2}\)?\s*\d{4,5}[-.\s]?\d{4}/g;
  const ratingPattern = /(\d[,.]?\d?)\s*(?:estrelas?|stars?|⭐)/gi;
  const websitePattern = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:\/[^\s)]*)?/g;
  
  // Dividir por blocos que parecem ser estabelecimentos
  const blocks = markdown.split(/\n(?=\#|\*\*|[\d]+\.)/);
  
  for (const block of blocks) {
    if (block.length < 20) continue;
    
    // Tentar extrair nome (geralmente em negrito ou título)
    const nameMatch = block.match(/\*\*([^*]+)\*\*/) || 
                      block.match(/^#+\s*(.+)$/m) ||
                      block.match(/^([A-ZÁÉÍÓÚÀÃÕÂÊÔÇ][^.\n]{5,50})/m);
    
    if (!nameMatch) continue;
    
    const name = nameMatch[1].trim();
    
    // Verificar se parece ser um estabelecimento relevante
    if (name.length < 3 || name.length > 100) continue;
    if (/^(Menu|Mais|Ver|Google|Maps|Buscar|Filtros)/i.test(name)) continue;
    
    // Extrair telefone
    const phones = block.match(phonePattern);
    const phone = phones ? phones[0] : undefined;
    
    // Extrair rating
    const ratingMatch = block.match(ratingPattern);
    let rating: number | undefined;
    if (ratingMatch) {
      const ratingStr = ratingMatch[0].replace(/[^\d,.]/, '').replace(',', '.');
      rating = parseFloat(ratingStr);
      if (isNaN(rating) || rating > 5) rating = undefined;
    }
    
    // Extrair website
    const websites = block.match(websitePattern);
    let website: string | undefined;
    if (websites) {
      website = websites.find(w => 
        !w.includes('google.com') && 
        !w.includes('maps.') &&
        !w.includes('facebook.com') &&
        w.length > 5
      );
    }
    
    // Extrair endereço (linhas com CEP ou padrões de endereço)
    const addressMatch = block.match(/(?:R\.|Rua|Av\.|Avenida|Pç\.|Praça|Al\.|Alameda)[^,\n]+[,][^,\n]+/i) ||
                         block.match(/[^,\n]+,\s*\d+[^,\n]*/);
    
    let address = addressMatch ? addressMatch[0].trim() : `${city}, ${state}`;
    if (address.length > 150) address = address.substring(0, 150);
    
    // Evitar duplicatas
    if (results.some(r => r.name.toLowerCase() === name.toLowerCase())) continue;
    
    results.push({
      name,
      address,
      phone,
      website,
      rating,
      category: niche,
    });
    
    // Limitar a 20 resultados
    if (results.length >= 20) break;
  }
  
  return results;
}

function parseSearchResults(data: any[], city: string, state: string, niche: string): BusinessResult[] {
  const results: BusinessResult[] = [];
  
  for (const item of data) {
    const markdown = item.markdown || '';
    const title = item.title || '';
    const url = item.url || '';
    
    // Extrair informações do título e conteúdo
    const phonePattern = /\(?\d{2}\)?\s*\d{4,5}[-.\s]?\d{4}/g;
    const phones = markdown.match(phonePattern);
    
    // Pular resultados genéricos
    if (/google|facebook|instagram|twitter|yelp|tripadvisor/i.test(url)) continue;
    
    const name = title.split(' - ')[0].split('|')[0].trim();
    if (name.length < 3 || name.length > 80) continue;
    
    // Extrair website do URL
    let website: string | undefined;
    try {
      const urlObj = new URL(url);
      if (!urlObj.hostname.includes('google') && !urlObj.hostname.includes('facebook')) {
        website = urlObj.hostname;
      }
    } catch {}
    
    // Extrair endereço do markdown
    const addressMatch = markdown.match(/(?:Endereço|Address|Localização)[:\s]*([^\n]+)/i) ||
                         markdown.match(/(?:R\.|Rua|Av\.|Avenida)[^,\n]+[,][^,\n]+/i);
    
    const address = addressMatch ? addressMatch[1]?.trim() || addressMatch[0].trim() : `${city}, ${state}`;
    
    results.push({
      name,
      address: address.substring(0, 150),
      phone: phones ? phones[0] : undefined,
      website,
      category: niche,
    });
    
    if (results.length >= 15) break;
  }
  
  return results;
}
