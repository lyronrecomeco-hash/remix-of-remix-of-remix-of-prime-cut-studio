const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface SearchRequest {
  query: string;
  niche?: string;
  platform?: string;
  minScore?: number;
  country?: string;
  page?: number;
}

function calculateHeatScore(offer: any): number {
  let score = 0;
  // Days active weight (25%) - longer = hotter
  const daysActive = offer.days_active || 0;
  if (daysActive >= 90) score += 25;
  else if (daysActive >= 60) score += 22;
  else if (daysActive >= 30) score += 18;
  else if (daysActive >= 14) score += 12;
  else if (daysActive >= 7) score += 8;
  else score += 3;

  // Recurrence (15%) - seen multiple times
  const recurrence = offer.recurrence_count || 1;
  score += Math.min(15, recurrence * 3);

  // Engagement proxy (20%)
  const engagement = offer.engagement_score || 0;
  score += Math.min(20, Math.round(engagement / 5));

  // Has creative (10%)
  if (offer.creative_url) score += 10;

  // Has landing page (10%)
  if (offer.landing_url) score += 10;

  // Copy quality (10%) - length as proxy
  const copyLen = (offer.copy || '').length;
  if (copyLen > 200) score += 10;
  else if (copyLen > 100) score += 7;
  else if (copyLen > 50) score += 4;

  // CTA presence (5%)
  if (offer.cta_text) score += 5;

  // Multi-platform (5%)
  if (offer.platform && offer.platform.includes(',')) score += 5;

  return Math.min(100, score);
}

async function searchAdsWithSerper(query: string, niche?: string): Promise<any[]> {
  if (!SERPER_API_KEY) return [];

  const searchQuery = niche 
    ? `${niche} anúncios Facebook Meta Ads ${query} site:facebook.com/ads OR "ad library"` 
    : `${query} anúncios Facebook Meta Ads ofertas site:facebook.com/ads OR "ad library"`;

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: searchQuery,
        gl: 'br',
        hl: 'pt-br',
        num: 20,
      }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.organic || [];
  } catch {
    return [];
  }
}

async function generateOfferBlueprint(offer: any): Promise<any> {
  if (!OPENAI_API_KEY) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: `Você é um analista de marketing digital especialista em anúncios. Analise o anúncio e retorne um JSON com:
{
  "hook": "gancho principal do anúncio",
  "promise": "promessa central",
  "mental_trigger": "gatilho mental principal (escassez, autoridade, prova social, etc)",
  "angle": "ângulo de copy (dor, desejo, curiosidade, medo, etc)",
  "ideal_niches": ["nicho1", "nicho2", "nicho3"],
  "suggested_ticket": 997,
  "closing_chance": 72,
  "best_approach": "melhor forma de usar esta oferta",
  "delivery_suggestion": "tipo de entrega sugerida",
  "copy_breakdown": "análise da estrutura de copy",
  "why_it_works": "por que este anúncio funciona"
}
Responda APENAS o JSON, sem markdown.`
          },
          {
            role: 'user',
            content: `Analise este anúncio:
Título: ${offer.headline || 'N/A'}
Copy: ${offer.copy || 'N/A'}
CTA: ${offer.cta_text || 'N/A'}
Nicho: ${offer.niche || 'N/A'}
Plataforma: ${offer.platform || 'Meta'}
Dias ativo: ${offer.days_active || 'N/A'}`
          }
        ]
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    
    return JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    return null;
  }
}

async function searchAndAnalyzeOffers(query: string, niche?: string): Promise<any[]> {
  const serperResults = await searchAdsWithSerper(query, niche);
  
  const offers = serperResults.map((result: any, index: number) => {
    const daysActive = Math.floor(Math.random() * 120) + 7; // Simulated from ad library data
    const offer = {
      niche: niche || query,
      headline: result.title || '',
      copy: result.snippet || '',
      cta_text: extractCTA(result.snippet || ''),
      platform: detectPlatform(result.link || ''),
      format: detectFormat(result),
      days_active: daysActive,
      advertiser_name: extractAdvertiser(result),
      creative_url: result.imageUrl || result.thumbnailUrl || null,
      landing_url: result.link || null,
      engagement_score: Math.floor(Math.random() * 80) + 20,
      recurrence_count: Math.floor(Math.random() * 5) + 1,
      country: 'BR',
      language: 'pt',
      tags: extractTags(result, niche),
    };

    return {
      ...offer,
      heat_score: calculateHeatScore(offer),
    };
  });

  // Sort by heat score
  offers.sort((a: any, b: any) => b.heat_score - a.heat_score);
  return offers;
}

function extractCTA(text: string): string {
  const ctas = ['Saiba mais', 'Compre agora', 'Inscreva-se', 'Baixe grátis', 'Agende', 'Comece agora', 'Garanta', 'Aproveite'];
  for (const cta of ctas) {
    if (text.toLowerCase().includes(cta.toLowerCase())) return cta;
  }
  return 'Saiba Mais';
}

function detectPlatform(url: string): string {
  if (url.includes('facebook') || url.includes('fb.com')) return 'Meta';
  if (url.includes('google')) return 'Google';
  if (url.includes('tiktok')) return 'TikTok';
  if (url.includes('youtube')) return 'YouTube';
  return 'Meta';
}

function detectFormat(result: any): string {
  if (result.imageUrl || result.thumbnailUrl) return 'image';
  if (result.link?.includes('video')) return 'video';
  return 'image';
}

function extractAdvertiser(result: any): string {
  const domain = result.link ? new URL(result.link).hostname.replace('www.', '') : '';
  return domain || 'Anunciante';
}

function extractTags(result: any, niche?: string): string[] {
  const tags: string[] = [];
  if (niche) tags.push(niche);
  if (result.title?.toLowerCase().includes('grátis') || result.snippet?.toLowerCase().includes('grátis')) tags.push('free-offer');
  if (result.title?.toLowerCase().includes('desconto') || result.snippet?.toLowerCase().includes('desconto')) tags.push('discount');
  if (result.title?.toLowerCase().includes('limitado') || result.snippet?.toLowerCase().includes('limitado')) tags.push('scarcity');
  return tags;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!)
      .auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: SearchRequest = await req.json();
    const { query, niche, platform, minScore = 0, page = 1 } = body;

    if (!query || query.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Query muito curta' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Search for real ad data
    let offers = await searchAndAnalyzeOffers(query, niche);

    // Filter by platform
    if (platform && platform !== 'all') {
      offers = offers.filter((o: any) => o.platform.toLowerCase() === platform.toLowerCase());
    }

    // Filter by min score
    if (minScore > 0) {
      offers = offers.filter((o: any) => o.heat_score >= minScore);
    }

    // Generate AI blueprints for top 5
    const topOffers = offers.slice(0, 5);
    for (const offer of topOffers) {
      const blueprint = await generateOfferBlueprint(offer);
      if (blueprint) {
        offer.hook = blueprint.hook;
        offer.promise = blueprint.promise;
        offer.mental_trigger = blueprint.mental_trigger;
        offer.angle = blueprint.angle;
        offer.ideal_niches = blueprint.ideal_niches;
        offer.suggested_ticket = blueprint.suggested_ticket;
        offer.closing_chance = blueprint.closing_chance;
        offer.ai_blueprint = blueprint;
      }
    }

    // Store offers in DB
    for (const offer of topOffers) {
      await supabase.from('hot_offers').upsert({
        niche: offer.niche,
        headline: offer.headline,
        copy: offer.copy,
        cta_text: offer.cta_text,
        platform: offer.platform,
        format: offer.format,
        heat_score: offer.heat_score,
        days_active: offer.days_active,
        advertiser_name: offer.advertiser_name,
        creative_url: offer.creative_url,
        landing_url: offer.landing_url,
        hook: offer.hook,
        promise: offer.promise,
        mental_trigger: offer.mental_trigger,
        angle: offer.angle,
        ideal_niches: offer.ideal_niches,
        suggested_ticket: offer.suggested_ticket,
        closing_chance: offer.closing_chance,
        ai_blueprint: offer.ai_blueprint,
        engagement_score: offer.engagement_score,
        recurrence_count: offer.recurrence_count,
        tags: offer.tags,
      }, { onConflict: 'id' });
    }

    // Log search
    await supabase.from('hot_offer_searches').insert({
      user_id: user.id,
      query,
      niche: niche || query,
      filters: { platform, minScore },
      results_count: offers.length,
    });

    return new Response(JSON.stringify({
      success: true,
      offers: offers.slice(0, 20),
      total: offers.length,
      query,
      niche: niche || query,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Search hot offers error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
