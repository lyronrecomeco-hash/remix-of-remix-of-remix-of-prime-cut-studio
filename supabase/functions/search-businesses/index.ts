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

    // Query mais precisa para Google Maps/Places
    const searchQuery = `"${niche}" "${city}" "${state}" site:google.com/maps OR contato telefone endereço`;
    
    console.log('Query de busca:', searchQuery);

    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 30,
        lang: 'pt-BR',
        country: 'BR',
        scrapeOptions: {
          formats: ['markdown', 'html'],
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
  
  // Padrões para extrair telefones brasileiros
  const phonePatterns = [
    /(?:\+55\s?)?(?:\(?\d{2}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4}/g,
    /\(\d{2}\)\s*\d{4,5}[-.\s]?\d{4}/g,
    /\d{2}\s*\d{4,5}[-.\s]?\d{4}/g,
  ];
  
  // URLs a pular (agregadores, não estabelecimentos reais)
  const urlsToSkip = [
    'google.com/maps', 'facebook.com', 'instagram.com', 'twitter.com', 
    'linkedin.com', 'youtube.com', 'tripadvisor.com', 'yelp.com',
    'foursquare.com', 'wikipedia.org', 'gov.br', 'reclameaqui.com',
    'mercadolivre.com', 'olx.com', 'amazon.com', 'ifood.com',
    'guiamais.com', 'apontador.com', 'telelistas.net', 'encontraja.com.br',
    'hagah.com.br', 'cylex.com.br', 'listaonline.com.br', 'yelp.com.br',
    'yellowpages', 'paginas-amarelas', 'kekanto', '123i.uol'
  ];

  // Palavras que indicam que não é um estabelecimento
  const skipTitlePatterns = [
    /^(Menu|Mais|Ver|Google|Maps|Buscar|Filtros|Avaliações|Fotos|Horário)/i,
    /^(Como chegar|Rotas|Direções|Mapa)/i,
    /^(Top|Melhores|Lista|Ranking|Guia)/i,
    /\d+\s*(melhores|principais|top)/i,
  ];

  for (const item of data) {
    try {
      const url = item.url || '';
      const title = item.title || '';
      const markdown = item.markdown || '';
      const description = item.description || '';
      const html = item.html || '';
      
      // Pular sites agregadores
      if (urlsToSkip.some(skip => url.toLowerCase().includes(skip))) {
        continue;
      }
      
      // Extrair nome da empresa do título
      let name = title
        .split(' - ')[0]
        .split(' | ')[0]
        .split(' – ')[0]
        .split(' :: ')[0]
        .trim();
      
      // Limpar nome
      name = name
        .replace(/^(Site|Página|Website|Home|Início|Blog|Contato|Sobre|Quem Somos)\s*[-|:]/gi, '')
        .replace(/\s+(Oficial|Loja|Online|Store|BR|Brasil)$/gi, '')
        .replace(/^\s*[-–|]\s*/, '')
        .trim();
      
      // Validar nome
      if (!name || name.length < 3 || name.length > 80) continue;
      if (skipTitlePatterns.some(pattern => pattern.test(name))) continue;
      
      // Evitar duplicatas
      const normalizedName = name.toLowerCase().trim();
      if (seenNames.has(normalizedName)) continue;
      
      // Combinar todo o texto para análise
      const fullText = `${title} ${markdown} ${description} ${html}`;
      
      // Extrair telefone
      let phone: string | undefined;
      for (const pattern of phonePatterns) {
        const matches = fullText.match(pattern);
        if (matches && matches.length > 0) {
          // Pegar o primeiro telefone válido (com pelo menos 10 dígitos)
          for (const match of matches) {
            const digits = match.replace(/\D/g, '');
            if (digits.length >= 10 && digits.length <= 13) {
              phone = match.trim();
              break;
            }
          }
          if (phone) break;
        }
      }
      
      // Extrair endereço com padrões brasileiros
      let address = '';
      const addressPatterns = [
        /(?:Endereço|Localização|Local|Address)[:\s]*([^<\n]{10,100})/i,
        /((?:R\.|Rua|Av\.|Avenida|Pç\.|Praça|Al\.|Alameda|Trav\.|Travessa)\s+[^,<\n]+,?\s*(?:\d+)?[^<\n]{0,60})/i,
        /(\d{5}[-]?\d{3})/i, // CEP
      ];
      
      for (const pattern of addressPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          const extracted = (match[1] || match[0]).trim();
          if (extracted.length > 10 && extracted.length < 150) {
            address = extracted;
            break;
          }
        }
      }
      
      // Fallback para endereço genérico
      if (!address) {
        address = `${city}, ${state}`;
      }
      
      // Limpar endereço
      address = address
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 150);
      
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
      const ratingPatterns = [
        /(\d[.,]\d)\s*(?:estrelas?|stars?|⭐|\/5)/i,
        /nota[:\s]*(\d[.,]\d)/i,
        /avaliação[:\s]*(\d[.,]\d)/i,
      ];
      
      for (const pattern of ratingPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          const parsed = parseFloat(match[1].replace(',', '.'));
          if (parsed >= 1 && parsed <= 5) {
            rating = Math.round(parsed * 10) / 10;
            break;
          }
        }
      }
      
      // Extrair número de avaliações
      let reviews_count: number | undefined;
      const reviewsPatterns = [
        /(\d+)\s*(?:avaliações?|reviews?|opiniões?|comentários?)/i,
        /\((\d+)\)/,
      ];
      
      for (const pattern of reviewsPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          const count = parseInt(match[1]);
          if (count > 0 && count < 100000) {
            reviews_count = count;
            break;
          }
        }
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
      
      // Limitar a 15 resultados de qualidade
      if (results.length >= 15) break;
      
    } catch (e) {
      console.error('Erro ao processar item:', e);
      continue;
    }
  }
  
  // Ordenar por qualidade de dados (mais completos primeiro)
  results.sort((a, b) => {
    const scoreA = (a.phone ? 4 : 0) + (a.website ? 2 : 0) + (a.rating ? 1 : 0) + (a.reviews_count ? 1 : 0);
    const scoreB = (b.phone ? 4 : 0) + (b.website ? 2 : 0) + (b.rating ? 1 : 0) + (b.reviews_count ? 1 : 0);
    return scoreB - scoreA;
  });
  
  return results;
}
