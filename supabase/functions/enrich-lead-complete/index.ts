import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnrichLeadRequest {
  business: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    rating?: number;
    reviewsCount?: number;
    niche?: string;
    city?: string;
    state?: string;
    country?: string;
    placeId?: string;
  };
  affiliateId?: string;
  source?: 'radar' | 'encontrar_cliente' | 'manual';
}

interface EnrichmentResult {
  id?: string;
  business: EnrichLeadRequest['business'];
  validation: {
    email?: any;
    phone?: any;
  };
  websiteHealth?: any;
  adsAnalysis?: any;
  scoring: any;
  enrichedAt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business, affiliateId, source = 'manual' }: EnrichLeadRequest = await req.json();

    if (!business?.name) {
      throw new Error('Nome do negócio é obrigatório');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[enrich-lead-complete] Iniciando enriquecimento para: ${business.name}`);

    // Preparar resultado
    const result: EnrichmentResult = {
      business,
      validation: {},
      enrichedAt: new Date().toISOString(),
      scoring: null,
    };

    // Executar validações em paralelo
    const promises: Promise<any>[] = [];

    // 1. Validar contatos
    if (business.email || business.phone) {
      promises.push(
        supabase.functions.invoke('validate-contact', {
          body: {
            email: business.email,
            phone: business.phone,
            countryCode: business.country === 'Brasil' ? 'BR' : 'BR',
          },
        }).then(res => {
          console.log('[enrich-lead-complete] Validação de contato concluída');
          if (res.data?.success) {
            result.validation = res.data.data;
          }
          return res;
        }).catch(err => {
          console.error('[enrich-lead-complete] Erro na validação:', err);
          return null;
        })
      );
    }

    // 2. Verificar website
    if (business.website) {
      promises.push(
        supabase.functions.invoke('check-website-health', {
          body: { url: business.website },
        }).then(res => {
          console.log('[enrich-lead-complete] Health check do website concluído');
          if (res.data?.success) {
            result.websiteHealth = res.data.data;
          }
          return res;
        }).catch(err => {
          console.error('[enrich-lead-complete] Erro no health check:', err);
          return null;
        })
      );
    }

    // 3. Detectar anúncios
    promises.push(
      supabase.functions.invoke('detect-ads-activity', {
        body: {
          businessName: business.name,
          website: business.website,
        },
      }).then(res => {
        console.log('[enrich-lead-complete] Análise de anúncios concluída');
        if (res.data?.success) {
          result.adsAnalysis = res.data.data;
        }
        return res;
      }).catch(err => {
        console.error('[enrich-lead-complete] Erro na análise de anúncios:', err);
        return null;
      })
    );

    // Aguardar todas as verificações
    await Promise.allSettled(promises);

    // 4. Calcular score com IA
    const scoreResponse = await supabase.functions.invoke('score-lead-ai', {
      body: {
        business: {
          name: business.name,
          address: business.address,
          phone: business.phone,
          website: business.website,
          rating: business.rating,
          reviewsCount: business.reviewsCount,
          niche: business.niche,
          city: business.city,
          state: business.state,
        },
        validation: {
          emailValid: result.validation?.email?.isValid,
          phoneValid: result.validation?.phone?.isValid,
          hasWhatsapp: result.validation?.phone?.hasWhatsapp,
        },
        websiteHealth: result.websiteHealth ? {
          isAccessible: result.websiteHealth.isAccessible,
          healthScore: result.websiteHealth.healthScore,
          hasSsl: result.websiteHealth.hasSsl,
          cmsDetected: result.websiteHealth.cmsDetected,
          hasMetaPixel: result.websiteHealth.hasMetaPixel,
          hasGoogleTag: result.websiteHealth.hasGoogleTag,
        } : undefined,
        adsAnalysis: result.adsAnalysis ? {
          hasMetaAds: result.adsAnalysis.hasMetaAds,
          hasGoogleAds: result.adsAnalysis.hasGoogleAds,
          overallAdStatus: result.adsAnalysis.overallAdStatus,
          investmentIndicator: result.adsAnalysis.investmentIndicator,
        } : undefined,
      },
    });

    if (scoreResponse.data?.success) {
      result.scoring = scoreResponse.data.data;
      console.log('[enrich-lead-complete] Scoring calculado:', result.scoring.opportunityScore);
    }

    // 5. Salvar lead enriquecido no banco
    const enrichedLeadData = {
      affiliate_id: affiliateId || null,
      source,
      external_id: business.placeId || null,
      business_name: business.name,
      business_address: business.address,
      business_city: business.city,
      business_state: business.state,
      business_country: business.country,
      business_phone: business.phone,
      business_email: business.email,
      business_website: business.website,
      business_niche: business.niche,
      google_rating: business.rating,
      google_reviews_count: business.reviewsCount,
      email_is_valid: result.validation?.email?.isValid || null,
      phone_is_valid: result.validation?.phone?.isValid || null,
      phone_has_whatsapp: result.validation?.phone?.hasWhatsapp || null,
      website_is_healthy: result.websiteHealth?.isAccessible || null,
      has_active_ads: result.adsAnalysis?.hasMetaAds || result.adsAnalysis?.hasGoogleAds || null,
      opportunity_score: result.scoring?.opportunityScore || null,
      opportunity_level: result.scoring?.opportunityLevel || null,
      ai_analysis: result.scoring?.aiAnalysis || {},
      pain_points: result.scoring?.painPoints || [],
      recommended_services: result.scoring?.recommendedServices || [],
      suggested_pitch: result.scoring?.suggestedPitch || null,
      digital_presence_score: result.scoring?.digitalPresenceScore || null,
      digital_presence_status: result.scoring?.digitalPresenceStatus || null,
      estimated_value_min: result.scoring?.estimatedValueMin || null,
      estimated_value_max: result.scoring?.estimatedValueMax || null,
      monthly_recurrence: result.scoring?.monthlyRecurrence || null,
      enriched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
    };

    // Verificar se já existe lead com esse external_id
    let savedLead = null;
    if (business.placeId) {
      const { data: existingLead } = await supabase
        .from('enriched_leads')
        .select('id')
        .eq('external_id', business.placeId)
        .single();

      if (existingLead) {
        const { data: updated } = await supabase
          .from('enriched_leads')
          .update(enrichedLeadData)
          .eq('id', existingLead.id)
          .select()
          .single();
        savedLead = updated;
      }
    }

    if (!savedLead) {
      const { data: inserted } = await supabase
        .from('enriched_leads')
        .insert(enrichedLeadData)
        .select()
        .single();
      savedLead = inserted;
    }

    result.id = savedLead?.id;

    console.log(`[enrich-lead-complete] Enriquecimento completo para: ${business.name}`);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error enriching lead:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
