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
        JSON.stringify({ success: false, error: 'Firecrawl não configurado. Configure nas configurações.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Buscando: ${niche} em ${city}, ${state}`);

    // Usar Firecrawl Search para encontrar estabelecimentos
    const searchQuery = `${niche} ${city} ${state} telefone endereço`;
    
    console.log('Query de busca:', searchQuery);

    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 20,
        lang: 'pt-BR',
        country: 'BR',
        scrapeOptions: {
          formats: ['markdown'],
        },
      }),
    });

    const searchData = await searchResponse.json();
    
    console.log('Firecrawl response status:', searchResponse.status);

    if (!searchResponse.ok) {
      console.error('Erro no Firecrawl:', searchData);
      return new Response(
        JSON.stringify({ success: false, error: `Erro na busca: ${searchData.error || 'Falha na API'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawResults = searchData.data || [];
    console.log(`Resultados brutos: ${rawResults.length}`);

    // Processar e limpar resultados
    const results = processSearchResults(rawResults, city, state, niche);
    
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

function processSearchResults(data: any[], city: string, state: string, niche: string): BusinessResult[] {
  const results: BusinessResult[] = [];
  const seenNames = new Set<string>();
  
  // Padrões para extrair dados
  const phonePatterns = [
    /\(?\d{2}\)?\s*\d{4,5}[-.\s]?\d{4}/g,
    /\+55\s*\d{2}\s*\d{4,5}[-.\s]?\d{4}/g,
  ];
  
  const urlsToSkip = [
    'google.com', 'facebook.com', 'instagram.com', 'twitter.com', 
    'linkedin.com', 'youtube.com', 'tripadvisor.com', 'yelp.com',
    'foursquare.com', 'wikipedia.org', 'gov.br', 'reclameaqui.com',
    'mercadolivre.com', 'olx.com', 'amazon.com', 'ifood.com',
    'guiamais.com', 'apontador.com', 'telelistas.net', 'encontraja.com.br'
  ];

  for (const item of data) {
    try {
      const url = item.url || '';
      const title = item.title || '';
      const markdown = item.markdown || '';
      const description = item.description || '';
      
      // Pular sites não relevantes
      if (urlsToSkip.some(skip => url.toLowerCase().includes(skip))) {
        continue;
      }
      
      // Extrair nome da empresa do título
      let name = title
        .split(' - ')[0]
        .split(' | ')[0]
        .split(' – ')[0]
        .trim();
      
      // Limpar nome
      name = name
        .replace(/^(Site|Página|Website|Home|Início|Blog|Contato|Sobre|Quem Somos)\s*[-|:]/gi, '')
        .replace(/\s+(Oficial|Loja|Online|Store)$/gi, '')
        .trim();
      
      // Validar nome
      if (!name || name.length < 3 || name.length > 80) continue;
      if (/^(Menu|Mais|Ver|Google|Maps|Buscar|Filtros|Avaliações|Fotos|Horário)/i.test(name)) continue;
      
      // Evitar duplicatas
      const normalizedName = name.toLowerCase().trim();
      if (seenNames.has(normalizedName)) continue;
      
      // Extrair telefone
      let phone: string | undefined;
      const fullText = `${markdown} ${description}`;
      
      for (const pattern of phonePatterns) {
        const matches = fullText.match(pattern);
        if (matches && matches.length > 0) {
          phone = matches[0].trim();
          break;
        }
      }
      
      // Extrair endereço
      let address = '';
      const addressPatterns = [
        /(?:Endereço|Localização|Address|Local)[:\s]*([^\n]+)/i,
        /(?:R\.|Rua|Av\.|Avenida|Pç\.|Praça|Al\.|Alameda|Trav\.|Travessa)[^,\n]+[,][^,\n]+/i,
        /[A-Z][^,\n]+,\s*\d+[^,\n]*/,
      ];
      
      for (const pattern of addressPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          address = (match[1] || match[0]).trim();
          break;
        }
      }
      
      if (!address) {
        address = `${city}, ${state}`;
      }
      
      // Limpar endereço
      address = address.substring(0, 150).trim();
      
      // Extrair website
      let website: string | undefined;
      try {
        const urlObj = new URL(url);
        if (!urlsToSkip.some(skip => urlObj.hostname.includes(skip))) {
          website = urlObj.hostname.replace(/^www\./, '');
        }
      } catch {}
      
      // Extrair rating
      let rating: number | undefined;
      const ratingMatch = fullText.match(/(\d[.,]\d)\s*(?:estrelas?|stars?|⭐|\/5)/i);
      if (ratingMatch) {
        const parsed = parseFloat(ratingMatch[1].replace(',', '.'));
        if (parsed >= 1 && parsed <= 5) {
          rating = parsed;
        }
      }
      
      // Extrair número de avaliações
      let reviews_count: number | undefined;
      const reviewsMatch = fullText.match(/(\d+)\s*(?:avaliações?|reviews?|opiniões?)/i);
      if (reviewsMatch) {
        reviews_count = parseInt(reviewsMatch[1]);
      }
      
      seenNames.add(normalizedName);
      
      results.push({
        name,
        address,
        phone,
        website,
        rating,
        reviews_count,
        category: niche,
      });
      
      // Limitar resultados
      if (results.length >= 15) break;
      
    } catch (e) {
      console.error('Erro ao processar item:', e);
      continue;
    }
  }
  
  // Ordenar por ter mais informações
  results.sort((a, b) => {
    const scoreA = (a.phone ? 3 : 0) + (a.website ? 2 : 0) + (a.rating ? 1 : 0);
    const scoreB = (b.phone ? 3 : 0) + (b.website ? 2 : 0) + (b.rating ? 1 : 0);
    return scoreB - scoreA;
  });
  
  return results;
}
