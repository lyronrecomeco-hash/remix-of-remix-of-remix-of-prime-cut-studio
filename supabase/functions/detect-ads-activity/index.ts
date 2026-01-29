import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DetectAdsRequest {
  businessName: string;
  website?: string;
  domain?: string;
}

interface AdsAnalysisResult {
  businessName: string;
  businessDomain: string | null;
  // Meta Ads
  hasMetaAds: boolean;
  metaAdsCount: number;
  metaAdsStatus: 'active' | 'paused_recently' | 'inactive' | 'unknown';
  metaAdsDetails: any[];
  metaPixelDetected: boolean;
  // Google Ads
  hasGoogleAds: boolean;
  googleAdsCount: number;
  googleAdsStatus: 'active' | 'paused_recently' | 'inactive' | 'unknown';
  googleAdsDetails: any[];
  googleTagDetected: boolean;
  // Consolidado
  adPlatforms: string[];
  overallAdStatus: 'active' | 'paused_recently' | 'inactive' | 'unknown';
  campaignTypes: string[];
  investmentIndicator: 'recurring' | 'sporadic' | 'none' | 'unknown';
  estimatedMonthlySpend: 'low' | 'medium' | 'high' | 'unknown';
  lastAdDetectedAt: string | null;
}

// Extrair domínio de URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

// Buscar na Meta Ad Library (simulado - API real requer token)
async function searchMetaAdLibrary(businessName: string, domain?: string): Promise<{
  hasAds: boolean;
  adsCount: number;
  status: 'active' | 'paused_recently' | 'inactive' | 'unknown';
  details: any[];
}> {
  try {
    // A Meta Ad Library API pública permite buscar anúncios
    // Endpoint: https://www.facebook.com/ads/library/api/
    // Por limitações, vamos usar uma abordagem heurística
    
    // Tentar buscar página do Facebook da empresa
    const searchQuery = encodeURIComponent(businessName);
    
    // Como não temos acesso direto à API, vamos inferir baseado em indicadores
    // Em produção, você integraria com a Meta Marketing API
    
    return {
      hasAds: false,
      adsCount: 0,
      status: 'unknown',
      details: [],
    };
  } catch (error) {
    console.error('Error searching Meta Ad Library:', error);
    return {
      hasAds: false,
      adsCount: 0,
      status: 'unknown',
      details: [],
    };
  }
}

// Detectar pixels e tags no website
async function detectTrackingPixels(website: string): Promise<{
  hasMetaPixel: boolean;
  hasGoogleTag: boolean;
  hasGoogleAds: boolean;
  technologies: string[];
}> {
  try {
    const url = website.startsWith('http') ? website : `https://${website}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    
    // Detectar Meta Pixel
    const hasMetaPixel = /connect\.facebook\.net/i.test(html) ||
                         /fbq\s*\(/i.test(html) ||
                         /facebook.*pixel/i.test(html) ||
                         /meta.*pixel/i.test(html) ||
                         /fbevents\.js/i.test(html);
    
    // Detectar Google Tag Manager
    const hasGoogleTag = /googletagmanager\.com\/gtm\.js/i.test(html) ||
                         /gtm\.start/i.test(html) ||
                         /GTM-[A-Z0-9]+/i.test(html);
    
    // Detectar Google Ads específico
    const hasGoogleAds = /googleads\.g\.doubleclick\.net/i.test(html) ||
                         /google_conversion/i.test(html) ||
                         /AW-[0-9]+/i.test(html) ||
                         /google_tag.*conversion/i.test(html) ||
                         /adservices\.google\.com/i.test(html);
    
    // Tecnologias de remarketing
    const technologies: string[] = [];
    
    if (hasMetaPixel) technologies.push('Meta Pixel');
    if (hasGoogleTag) technologies.push('Google Tag Manager');
    if (hasGoogleAds) technologies.push('Google Ads Tag');
    if (/hotjar\.com/i.test(html)) technologies.push('Hotjar');
    if (/clarity\.ms/i.test(html)) technologies.push('Microsoft Clarity');
    if (/linkedin\.com.*insight/i.test(html)) technologies.push('LinkedIn Insight');
    if (/tiktok\.com.*pixel/i.test(html)) technologies.push('TikTok Pixel');
    if (/pinterest\.com.*tag/i.test(html)) technologies.push('Pinterest Tag');
    
    return {
      hasMetaPixel,
      hasGoogleTag,
      hasGoogleAds,
      technologies,
    };
  } catch (error) {
    console.error('Error detecting tracking pixels:', error);
    return {
      hasMetaPixel: false,
      hasGoogleTag: false,
      hasGoogleAds: false,
      technologies: [],
    };
  }
}

// Inferir tipos de campanha baseado em indicadores
function inferCampaignTypes(hasMetaPixel: boolean, hasGoogleAds: boolean, technologies: string[]): string[] {
  const types: string[] = [];
  
  if (hasMetaPixel) {
    types.push('remarketing');
    types.push('traffic');
  }
  
  if (hasGoogleAds) {
    types.push('search');
    types.push('conversion');
  }
  
  if (technologies.includes('TikTok Pixel')) {
    types.push('awareness');
  }
  
  if (technologies.includes('LinkedIn Insight')) {
    types.push('leads');
  }
  
  return [...new Set(types)];
}

// Estimar nível de investimento
function estimateInvestment(
  hasMetaPixel: boolean,
  hasGoogleAds: boolean,
  technologiesCount: number
): 'low' | 'medium' | 'high' | 'unknown' {
  if (!hasMetaPixel && !hasGoogleAds) {
    return technologiesCount > 0 ? 'low' : 'unknown';
  }
  
  if (hasMetaPixel && hasGoogleAds && technologiesCount >= 3) {
    return 'high';
  }
  
  if (hasMetaPixel || hasGoogleAds) {
    return 'medium';
  }
  
  return 'low';
}

// Determinar indicador de recorrência
function determineRecurrence(
  hasMetaPixel: boolean,
  hasGoogleAds: boolean,
  technologiesCount: number
): 'recurring' | 'sporadic' | 'none' | 'unknown' {
  if (!hasMetaPixel && !hasGoogleAds && technologiesCount === 0) {
    return 'none';
  }
  
  if ((hasMetaPixel && hasGoogleAds) || technologiesCount >= 3) {
    return 'recurring';
  }
  
  if (hasMetaPixel || hasGoogleAds) {
    return 'sporadic';
  }
  
  return 'unknown';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, website, domain: inputDomain }: DetectAdsRequest = await req.json();

    if (!businessName) {
      throw new Error('Nome do negócio é obrigatório');
    }

    const domain = inputDomain || (website ? extractDomain(website) : null);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar cache (24 horas)
    if (domain) {
      const { data: cached } = await supabase
        .from('lead_ads_analysis')
        .select('*')
        .eq('business_domain', domain)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cached) {
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              businessName: cached.business_name,
              businessDomain: cached.business_domain,
              hasMetaAds: cached.has_meta_ads,
              metaAdsCount: cached.meta_ads_count,
              metaAdsStatus: cached.meta_ads_status,
              metaAdsDetails: cached.meta_ads_details,
              metaPixelDetected: cached.meta_pixel_detected,
              hasGoogleAds: cached.has_google_ads,
              googleAdsCount: cached.google_ads_count,
              googleAdsStatus: cached.google_ads_status,
              googleAdsDetails: cached.google_ads_details,
              googleTagDetected: cached.google_tag_detected,
              adPlatforms: cached.ad_platforms,
              overallAdStatus: cached.overall_ad_status,
              campaignTypes: cached.campaign_types,
              investmentIndicator: cached.investment_indicator,
              estimatedMonthlySpend: cached.estimated_monthly_spend,
              lastAdDetectedAt: cached.last_ad_detected_at,
            },
            cached: true,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Buscar na Meta Ad Library
    const metaResults = await searchMetaAdLibrary(businessName, domain || undefined);

    // Detectar pixels no website
    let pixelResults = {
      hasMetaPixel: false,
      hasGoogleTag: false,
      hasGoogleAds: false,
      technologies: [] as string[],
    };

    if (website || domain) {
      pixelResults = await detectTrackingPixels(website || `https://${domain}`);
    }

    // Consolidar resultados
    const adPlatforms: string[] = [];
    if (metaResults.hasAds || pixelResults.hasMetaPixel) adPlatforms.push('meta');
    if (pixelResults.hasGoogleAds || pixelResults.hasGoogleTag) adPlatforms.push('google');

    // Determinar status geral
    let overallStatus: 'active' | 'paused_recently' | 'inactive' | 'unknown' = 'unknown';
    if (pixelResults.hasMetaPixel || pixelResults.hasGoogleAds) {
      overallStatus = 'active';
    } else if (pixelResults.hasGoogleTag) {
      overallStatus = 'paused_recently';
    } else if (adPlatforms.length === 0) {
      overallStatus = 'inactive';
    }

    const campaignTypes = inferCampaignTypes(
      pixelResults.hasMetaPixel,
      pixelResults.hasGoogleAds,
      pixelResults.technologies
    );

    const investmentIndicator = determineRecurrence(
      pixelResults.hasMetaPixel,
      pixelResults.hasGoogleAds,
      pixelResults.technologies.length
    );

    const estimatedSpend = estimateInvestment(
      pixelResults.hasMetaPixel,
      pixelResults.hasGoogleAds,
      pixelResults.technologies.length
    );

    const result: AdsAnalysisResult = {
      businessName,
      businessDomain: domain,
      hasMetaAds: metaResults.hasAds || pixelResults.hasMetaPixel,
      metaAdsCount: metaResults.adsCount,
      metaAdsStatus: pixelResults.hasMetaPixel ? 'active' : metaResults.status,
      metaAdsDetails: metaResults.details,
      metaPixelDetected: pixelResults.hasMetaPixel,
      hasGoogleAds: pixelResults.hasGoogleAds,
      googleAdsCount: 0,
      googleAdsStatus: pixelResults.hasGoogleAds ? 'active' : (pixelResults.hasGoogleTag ? 'paused_recently' : 'unknown'),
      googleAdsDetails: [],
      googleTagDetected: pixelResults.hasGoogleTag,
      adPlatforms,
      overallAdStatus: overallStatus,
      campaignTypes,
      investmentIndicator,
      estimatedMonthlySpend: estimatedSpend,
      lastAdDetectedAt: (pixelResults.hasMetaPixel || pixelResults.hasGoogleAds) ? new Date().toISOString() : null,
    };

    // Salvar no cache (24 horas)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    if (domain) {
      await supabase.from('lead_ads_analysis').upsert({
        business_name: result.businessName,
        business_domain: result.businessDomain,
        has_meta_ads: result.hasMetaAds,
        meta_ads_count: result.metaAdsCount,
        meta_ads_status: result.metaAdsStatus,
        meta_ads_details: result.metaAdsDetails,
        meta_pixel_detected: result.metaPixelDetected,
        has_google_ads: result.hasGoogleAds,
        google_ads_count: result.googleAdsCount,
        google_ads_status: result.googleAdsStatus,
        google_ads_details: result.googleAdsDetails,
        google_tag_detected: result.googleTagDetected,
        ad_platforms: result.adPlatforms,
        overall_ad_status: result.overallAdStatus,
        campaign_types: result.campaignTypes,
        investment_indicator: result.investmentIndicator,
        estimated_monthly_spend: result.estimatedMonthlySpend,
        last_ad_detected_at: result.lastAdDetectedAt,
        analyzed_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'business_domain',
        ignoreDuplicates: false,
      });
    }

    return new Response(
      JSON.stringify({ success: true, data: result, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error detecting ads activity:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
