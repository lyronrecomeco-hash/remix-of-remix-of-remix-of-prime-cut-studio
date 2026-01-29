import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Padrões para detectar tecnologias
const TECHNOLOGY_PATTERNS = {
  'WordPress': [/wp-content/i, /wp-includes/i, /wordpress/i],
  'Wix': [/wix\.com/i, /wixstatic\.com/i, /_wix_/i],
  'Shopify': [/shopify\.com/i, /myshopify\.com/i, /cdn\.shopify/i],
  'Squarespace': [/squarespace\.com/i, /sqsp\.net/i],
  'Webflow': [/webflow\.com/i, /\.webflow\.io/i],
  'React': [/react/i, /__REACT/i, /reactroot/i],
  'Vue': [/vue\.js/i, /__vue__/i, /vue-router/i],
  'Angular': [/angular/i, /ng-version/i],
  'Next.js': [/next\.js/i, /_next/i, /nextjs/i],
  'Bootstrap': [/bootstrap/i],
  'Tailwind': [/tailwind/i],
  'jQuery': [/jquery/i],
  'Google Analytics': [/google-analytics\.com/i, /googletagmanager\.com/i, /gtag/i],
  'Facebook Pixel': [/connect\.facebook\.net/i, /fbq\(/i, /fbevents\.js/i],
  'Google Tag Manager': [/googletagmanager\.com\/gtm\.js/i],
  'Hotjar': [/hotjar\.com/i],
  'Clarity': [/clarity\.ms/i],
};

// Padrões para detectar CMS
const CMS_PATTERNS: Record<string, RegExp[]> = {
  'wordpress': [/wp-content/i, /wp-includes/i, /wordpress/i, /\/wp-json\//i],
  'wix': [/wix\.com/i, /wixstatic\.com/i],
  'shopify': [/shopify/i, /myshopify\.com/i],
  'squarespace': [/squarespace/i],
  'webflow': [/webflow/i],
  'drupal': [/drupal/i],
  'joomla': [/joomla/i],
  'magento': [/magento/i, /mage\/cookies/i],
  'woocommerce': [/woocommerce/i, /wc-/i],
  'prestashop': [/prestashop/i],
  'weebly': [/weebly/i],
  'godaddy': [/godaddy/i, /secureserver\.net/i],
  'hostinger': [/hostinger/i],
};

interface HealthCheckRequest {
  url: string;
}

interface HealthCheckResult {
  url: string;
  domain: string;
  httpStatus: number | null;
  isAccessible: boolean;
  responseTimeMs: number;
  hasSsl: boolean;
  sslValid: boolean;
  sslExpiresAt: string | null;
  technologies: string[];
  cmsDetected: string | null;
  hasMetaPixel: boolean;
  hasGoogleTag: boolean;
  hasGoogleAnalytics: boolean;
  pageTitle: string | null;
  metaDescription: string | null;
  healthScore: number;
  healthStatus: 'healthy' | 'issues' | 'critical' | 'offline';
}

// Extrair domínio de URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

// Normalizar URL
function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

// Fazer request e medir tempo
async function fetchWithTiming(url: string): Promise<{
  response: Response | null;
  responseTime: number;
  error: string | null;
}> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });
    
    clearTimeout(timeoutId);
    
    return {
      response,
      responseTime: Date.now() - startTime,
      error: null,
    };
  } catch (error) {
    return {
      response: null,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Detectar tecnologias no HTML
function detectTechnologies(html: string): string[] {
  const detected: string[] = [];
  
  for (const [tech, patterns] of Object.entries(TECHNOLOGY_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(html))) {
      detected.push(tech);
    }
  }
  
  return detected;
}

// Detectar CMS
function detectCMS(html: string): string | null {
  for (const [cms, patterns] of Object.entries(CMS_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(html))) {
      return cms;
    }
  }
  return null;
}

// Extrair título da página
function extractPageTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

// Extrair meta description
function extractMetaDescription(html: string): string | null {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (match) return match[1].trim();
  
  const match2 = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  return match2 ? match2[1].trim() : null;
}

// Verificar Meta Pixel
function hasMetaPixel(html: string): boolean {
  return /connect\.facebook\.net/i.test(html) || 
         /fbq\s*\(/i.test(html) || 
         /fbevents\.js/i.test(html) ||
         /facebook.*pixel/i.test(html);
}

// Verificar Google Tag
function hasGoogleTag(html: string): boolean {
  return /googletagmanager\.com\/gtm\.js/i.test(html) ||
         /gtag\s*\(/i.test(html) ||
         /google_tag/i.test(html);
}

// Verificar Google Analytics
function hasGoogleAnalytics(html: string): boolean {
  return /google-analytics\.com/i.test(html) ||
         /analytics\.js/i.test(html) ||
         /gtag.*config.*UA-/i.test(html) ||
         /gtag.*config.*G-/i.test(html) ||
         /_ga\s*=/i.test(html);
}

// Calcular score de saúde
function calculateHealthScore(result: Partial<HealthCheckResult>): number {
  let score = 0;
  
  // Site acessível (+30)
  if (result.isAccessible) score += 30;
  
  // SSL válido (+20)
  if (result.hasSsl && result.sslValid) score += 20;
  else if (result.hasSsl) score += 10;
  
  // Tempo de resposta bom (+20)
  if (result.responseTimeMs) {
    if (result.responseTimeMs < 1000) score += 20;
    else if (result.responseTimeMs < 2000) score += 15;
    else if (result.responseTimeMs < 3000) score += 10;
    else if (result.responseTimeMs < 5000) score += 5;
  }
  
  // Tem título (+5)
  if (result.pageTitle) score += 5;
  
  // Tem descrição (+5)
  if (result.metaDescription) score += 5;
  
  // Tem analytics/tracking (+10)
  if (result.hasGoogleAnalytics || result.hasGoogleTag) score += 10;
  
  // Tem CMS moderno (+10)
  if (result.cmsDetected && ['wordpress', 'shopify', 'webflow', 'wix'].includes(result.cmsDetected)) {
    score += 10;
  }
  
  return Math.min(100, score);
}

// Determinar status de saúde
function getHealthStatus(score: number, isAccessible: boolean): 'healthy' | 'issues' | 'critical' | 'offline' {
  if (!isAccessible) return 'offline';
  if (score >= 70) return 'healthy';
  if (score >= 40) return 'issues';
  return 'critical';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url }: HealthCheckRequest = await req.json();

    if (!url) {
      throw new Error('URL é obrigatória');
    }

    const normalizedUrl = normalizeUrl(url);
    const domain = extractDomain(url);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar cache (1 hora)
    const { data: cached } = await supabase
      .from('website_health_checks')
      .select('*')
      .eq('domain', domain)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cached) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            url: cached.url,
            domain: cached.domain,
            httpStatus: cached.http_status,
            isAccessible: cached.is_accessible,
            responseTimeMs: cached.response_time_ms,
            hasSsl: cached.has_ssl,
            sslValid: cached.ssl_valid,
            sslExpiresAt: cached.ssl_expires_at,
            technologies: cached.technologies,
            cmsDetected: cached.cms_detected,
            hasMetaPixel: cached.has_meta_pixel,
            hasGoogleTag: cached.has_google_tag,
            hasGoogleAnalytics: cached.has_google_analytics,
            pageTitle: cached.page_title,
            metaDescription: cached.meta_description,
            healthScore: cached.health_score,
            healthStatus: cached.health_status,
          },
          cached: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fazer health check
    const { response, responseTime, error } = await fetchWithTiming(normalizedUrl);

    const result: HealthCheckResult = {
      url: normalizedUrl,
      domain,
      httpStatus: response?.status || null,
      isAccessible: response?.ok || false,
      responseTimeMs: responseTime,
      hasSsl: normalizedUrl.startsWith('https://'),
      sslValid: normalizedUrl.startsWith('https://') && (response?.ok || false),
      sslExpiresAt: null, // Não conseguimos verificar sem certificado
      technologies: [],
      cmsDetected: null,
      hasMetaPixel: false,
      hasGoogleTag: false,
      hasGoogleAnalytics: false,
      pageTitle: null,
      metaDescription: null,
      healthScore: 0,
      healthStatus: 'offline',
    };

    // Analisar conteúdo HTML
    if (response?.ok) {
      try {
        const html = await response.text();
        
        result.technologies = detectTechnologies(html);
        result.cmsDetected = detectCMS(html);
        result.hasMetaPixel = hasMetaPixel(html);
        result.hasGoogleTag = hasGoogleTag(html);
        result.hasGoogleAnalytics = hasGoogleAnalytics(html);
        result.pageTitle = extractPageTitle(html);
        result.metaDescription = extractMetaDescription(html);
      } catch {
        console.log('Erro ao analisar HTML');
      }
    }

    // Calcular score e status
    result.healthScore = calculateHealthScore(result);
    result.healthStatus = getHealthStatus(result.healthScore, result.isAccessible);

    // Salvar no cache (1 hora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await supabase.from('website_health_checks').upsert({
      url: result.url,
      domain: result.domain,
      http_status: result.httpStatus,
      is_accessible: result.isAccessible,
      response_time_ms: result.responseTimeMs,
      has_ssl: result.hasSsl,
      ssl_valid: result.sslValid,
      ssl_expires_at: result.sslExpiresAt,
      technologies: result.technologies,
      cms_detected: result.cmsDetected,
      has_meta_pixel: result.hasMetaPixel,
      has_google_tag: result.hasGoogleTag,
      has_google_analytics: result.hasGoogleAnalytics,
      page_title: result.pageTitle,
      meta_description: result.metaDescription,
      health_score: result.healthScore,
      health_status: result.healthStatus,
      checked_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    }, {
      onConflict: 'domain',
    });

    return new Response(
      JSON.stringify({ success: true, data: result, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking website health:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
