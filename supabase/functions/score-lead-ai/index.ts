import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScoreLeadRequest {
  business: {
    name: string;
    address?: string;
    phone?: string;
    website?: string;
    rating?: number;
    reviewsCount?: number;
    niche?: string;
    city?: string;
    state?: string;
  };
  validation?: {
    emailValid?: boolean;
    phoneValid?: boolean;
    hasWhatsapp?: boolean;
  };
  websiteHealth?: {
    isAccessible?: boolean;
    healthScore?: number;
    hasSsl?: boolean;
    cmsDetected?: string;
    hasMetaPixel?: boolean;
    hasGoogleTag?: boolean;
  };
  adsAnalysis?: {
    hasMetaAds?: boolean;
    hasGoogleAds?: boolean;
    overallAdStatus?: string;
    investmentIndicator?: string;
  };
}

interface ScoreResult {
  opportunityScore: number;
  opportunityLevel: 'hot' | 'warm' | 'cool' | 'cold';
  digitalPresenceScore: number;
  digitalPresenceStatus: string;
  painPoints: string[];
  recommendedServices: string[];
  suggestedPitch: string;
  estimatedValueMin: number;
  estimatedValueMax: number;
  monthlyRecurrence: number;
  aiAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    urgencyLevel: 'high' | 'medium' | 'low';
  };
}

// Valores por nicho
const NICHE_VALUES: Record<string, { min: number; max: number; recurrence: number }> = {
  'barbearia': { min: 600, max: 1200, recurrence: 150 },
  'salao': { min: 800, max: 1500, recurrence: 200 },
  'clinica': { min: 1500, max: 3000, recurrence: 300 },
  'dentista': { min: 1800, max: 3500, recurrence: 350 },
  'restaurante': { min: 1000, max: 2000, recurrence: 250 },
  'pizzaria': { min: 800, max: 1500, recurrence: 180 },
  'academia': { min: 1200, max: 2200, recurrence: 250 },
  'petshop': { min: 700, max: 1400, recurrence: 180 },
  'imobiliaria': { min: 2000, max: 4000, recurrence: 400 },
  'advocacia': { min: 2500, max: 5000, recurrence: 500 },
  'contabilidade': { min: 1500, max: 3000, recurrence: 300 },
  'hotel': { min: 2500, max: 5000, recurrence: 500 },
  'pousada': { min: 1500, max: 2800, recurrence: 280 },
  'oficina': { min: 800, max: 1500, recurrence: 180 },
  'loja': { min: 1000, max: 2000, recurrence: 200 },
  'escola': { min: 2000, max: 3500, recurrence: 350 },
  'estetica': { min: 1000, max: 2000, recurrence: 220 },
  'consultorio': { min: 1500, max: 2800, recurrence: 280 },
  'default': { min: 600, max: 1200, recurrence: 150 },
};

function getNicheKey(niche: string): string {
  const normalized = niche.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const key of Object.keys(NICHE_VALUES)) {
    if (normalized.includes(key)) return key;
  }
  return 'default';
}

// Calcular score de presença digital
function calculateDigitalPresenceScore(
  hasWebsite: boolean,
  websiteHealth?: ScoreLeadRequest['websiteHealth'],
  adsAnalysis?: ScoreLeadRequest['adsAnalysis']
): number {
  let score = 0;
  
  // Website (0-40 pontos)
  if (hasWebsite) {
    score += 20;
    if (websiteHealth?.isAccessible) score += 10;
    if (websiteHealth?.hasSsl) score += 5;
    if (websiteHealth?.healthScore && websiteHealth.healthScore > 50) score += 5;
  }
  
  // Tracking/Analytics (0-30 pontos)
  if (websiteHealth?.hasMetaPixel) score += 15;
  if (websiteHealth?.hasGoogleTag) score += 15;
  
  // Anúncios ativos (0-30 pontos)
  if (adsAnalysis?.hasMetaAds || adsAnalysis?.hasGoogleAds) {
    score += 15;
    if (adsAnalysis?.overallAdStatus === 'active') score += 10;
    if (adsAnalysis?.investmentIndicator === 'recurring') score += 5;
  }
  
  return Math.min(100, score);
}

// Determinar status de presença digital
function getDigitalPresenceStatus(score: number): string {
  if (score >= 80) return 'Presença digital forte';
  if (score >= 60) return 'Presença digital moderada';
  if (score >= 40) return 'Presença digital básica';
  if (score >= 20) return 'Presença digital mínima';
  return 'Sem presença digital — Oportunidade máxima';
}

// Calcular score de oportunidade
function calculateOpportunityScore(
  data: ScoreLeadRequest,
  digitalPresenceScore: number
): number {
  let score = 50; // Base
  
  // Sem website = GRANDE oportunidade
  if (!data.business.website) {
    score += 30;
  } else {
    // Com website mas sem tracking = oportunidade de melhorar
    if (!data.websiteHealth?.hasMetaPixel && !data.websiteHealth?.hasGoogleTag) {
      score += 15;
    }
    // Website com problemas
    if (data.websiteHealth && !data.websiteHealth.isAccessible) {
      score += 20;
    }
    if (data.websiteHealth?.healthScore && data.websiteHealth.healthScore < 50) {
      score += 10;
    }
  }
  
  // Sem anúncios = oportunidade
  if (!data.adsAnalysis?.hasMetaAds && !data.adsAnalysis?.hasGoogleAds) {
    score += 10;
  }
  
  // Tem telefone = pode ser contatado
  if (data.business.phone) {
    score += 5;
  }
  
  // Tem WhatsApp = ainda melhor
  if (data.validation?.hasWhatsapp) {
    score += 5;
  }
  
  // Rating baixo = precisa de ajuda
  if (!data.business.rating || data.business.rating < 4) {
    score += 10;
  }
  
  // Poucas avaliações = negócio menor, mais receptivo
  if (!data.business.reviewsCount || data.business.reviewsCount < 30) {
    score += 5;
  }
  
  // Inverter: quanto MENOR a presença digital, MAIOR a oportunidade
  const presenceBonus = Math.max(0, 20 - (digitalPresenceScore * 0.2));
  score += presenceBonus;
  
  return Math.min(100, Math.max(0, score));
}

// Determinar nível de oportunidade
function getOpportunityLevel(score: number): 'hot' | 'warm' | 'cool' | 'cold' {
  if (score >= 80) return 'hot';
  if (score >= 60) return 'warm';
  if (score >= 40) return 'cool';
  return 'cold';
}

// Gerar pain points
function generatePainPoints(data: ScoreLeadRequest): string[] {
  const painPoints: string[] = [];
  
  if (!data.business.website) {
    painPoints.push('Invisível para clientes que buscam online');
    painPoints.push('Perde vendas para concorrentes com presença digital');
  } else {
    if (!data.websiteHealth?.isAccessible) {
      painPoints.push('Website fora do ar — clientes não conseguem acessar');
    }
    if (data.websiteHealth?.healthScore && data.websiteHealth.healthScore < 50) {
      painPoints.push('Website lento ou com problemas técnicos');
    }
    if (!data.websiteHealth?.hasSsl) {
      painPoints.push('Website sem segurança SSL — afasta clientes');
    }
  }
  
  if (!data.websiteHealth?.hasMetaPixel && !data.websiteHealth?.hasGoogleTag) {
    painPoints.push('Sem rastreamento — não sabe quem visita o site');
  }
  
  if (!data.adsAnalysis?.hasMetaAds && !data.adsAnalysis?.hasGoogleAds) {
    painPoints.push('Não investe em anúncios — depende só de indicação');
  }
  
  if (data.business.rating && data.business.rating < 4) {
    painPoints.push('Avaliações baixas afetam credibilidade');
  }
  
  if (!data.business.reviewsCount || data.business.reviewsCount < 20) {
    painPoints.push('Poucas avaliações — falta prova social');
  }
  
  painPoints.push('Atendimento manual consome tempo');
  
  return painPoints.slice(0, 5);
}

// Gerar serviços recomendados
function generateRecommendedServices(data: ScoreLeadRequest): string[] {
  const services: string[] = [];
  
  if (!data.business.website) {
    services.push('Website profissional responsivo');
    services.push('Google Meu Negócio otimizado');
  }
  
  if (!data.websiteHealth?.hasMetaPixel && !data.websiteHealth?.hasGoogleTag) {
    services.push('Configuração de Analytics e tracking');
  }
  
  if (!data.adsAnalysis?.hasMetaAds) {
    services.push('Campanhas no Facebook/Instagram');
  }
  
  if (!data.adsAnalysis?.hasGoogleAds) {
    services.push('Google Ads para captar clientes');
  }
  
  services.push('Chatbot WhatsApp para atendimento 24h');
  services.push('Sistema de agendamento online');
  services.push('Automação de marketing');
  
  return services.slice(0, 6);
}

// Gerar pitch sugerido
function generateSuggestedPitch(
  data: ScoreLeadRequest,
  opportunityLevel: string
): string {
  const { business } = data;
  const niche = business.niche || 'negócio';
  const city = business.city || '';
  
  if (!business.website) {
    return `Olá! Vi que ${business.name} ainda não tem presença online. Hoje, 70% dos clientes pesquisam no Google antes de ir a um ${niche}${city ? ` em ${city}` : ''}. Posso mostrar como colocar vocês no mapa digital e atrair mais clientes em 30 dias?`;
  }
  
  if (opportunityLevel === 'hot') {
    return `Olá! Analisei a presença digital de ${business.name} e identifiquei oportunidades importantes para aumentar o faturamento. Vocês ainda não usam anúncios online — isso significa que estão perdendo clientes para concorrentes. Posso mostrar como resolver isso rapidamente?`;
  }
  
  if (!data.adsAnalysis?.hasMetaAds && !data.adsAnalysis?.hasGoogleAds) {
    return `Olá! Notei que ${business.name} tem um site mas ainda não investe em tráfego pago. Seus concorrentes estão captando clientes todos os dias com anúncios. Posso mostrar uma estratégia para vocês também aparecerem?`;
  }
  
  return `Olá! Analisei a presença digital de ${business.name} e encontrei formas de otimizar e aumentar os resultados. Posso apresentar um diagnóstico gratuito?`;
}

// Gerar análise SWOT simplificada
function generateAIAnalysis(data: ScoreLeadRequest): ScoreResult['aiAnalysis'] {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  
  // Strengths
  if (data.business.rating && data.business.rating >= 4.5) {
    strengths.push('Excelente reputação no Google');
  }
  if (data.business.reviewsCount && data.business.reviewsCount > 100) {
    strengths.push('Forte prova social com muitas avaliações');
  }
  if (data.validation?.hasWhatsapp) {
    strengths.push('Acessível via WhatsApp');
  }
  if (data.websiteHealth?.isAccessible && data.websiteHealth?.healthScore && data.websiteHealth.healthScore > 70) {
    strengths.push('Website funcional e rápido');
  }
  
  // Weaknesses
  if (!data.business.website) {
    weaknesses.push('Sem presença online');
  }
  if (data.business.rating && data.business.rating < 4) {
    weaknesses.push('Reputação online abaixo da média');
  }
  if (data.websiteHealth && !data.websiteHealth.isAccessible) {
    weaknesses.push('Website inacessível ou com problemas');
  }
  if (!data.websiteHealth?.hasSsl) {
    weaknesses.push('Sem certificado de segurança SSL');
  }
  
  // Opportunities
  if (!data.adsAnalysis?.hasMetaAds) {
    opportunities.push('Potencial inexplorado em Meta Ads');
  }
  if (!data.adsAnalysis?.hasGoogleAds) {
    opportunities.push('Potencial inexplorado em Google Ads');
  }
  if (!data.websiteHealth?.hasMetaPixel) {
    opportunities.push('Oportunidade de remarketing com Meta Pixel');
  }
  opportunities.push('Automação de atendimento via chatbot');
  opportunities.push('Sistema de agendamento online');
  
  // Urgency
  let urgencyLevel: 'high' | 'medium' | 'low' = 'medium';
  if (!data.business.website || (!data.adsAnalysis?.hasMetaAds && !data.adsAnalysis?.hasGoogleAds)) {
    urgencyLevel = 'high';
  } else if (data.websiteHealth?.healthScore && data.websiteHealth.healthScore > 70) {
    urgencyLevel = 'low';
  }
  
  return {
    strengths: strengths.length > 0 ? strengths : ['Negócio estabelecido na região'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Presença digital pode melhorar'],
    opportunities,
    urgencyLevel,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ScoreLeadRequest = await req.json();

    if (!data.business?.name) {
      throw new Error('Nome do negócio é obrigatório');
    }

    const hasWebsite = !!data.business.website;
    
    // Calcular scores
    const digitalPresenceScore = calculateDigitalPresenceScore(
      hasWebsite,
      data.websiteHealth,
      data.adsAnalysis
    );
    
    const opportunityScore = calculateOpportunityScore(data, digitalPresenceScore);
    const opportunityLevel = getOpportunityLevel(opportunityScore);
    
    // Obter valores por nicho
    const nicheKey = getNicheKey(data.business.niche || 'default');
    const values = NICHE_VALUES[nicheKey] || NICHE_VALUES['default'];
    
    // Ajustar valores pelo score
    const multiplier = opportunityScore >= 80 ? 1.3 : opportunityScore >= 60 ? 1.1 : 1.0;
    
    const result: ScoreResult = {
      opportunityScore,
      opportunityLevel,
      digitalPresenceScore,
      digitalPresenceStatus: getDigitalPresenceStatus(digitalPresenceScore),
      painPoints: generatePainPoints(data),
      recommendedServices: generateRecommendedServices(data),
      suggestedPitch: generateSuggestedPitch(data, opportunityLevel),
      estimatedValueMin: Math.round(values.min * multiplier),
      estimatedValueMax: Math.round(values.max * multiplier),
      monthlyRecurrence: Math.round(values.recurrence * multiplier),
      aiAnalysis: generateAIAnalysis(data),
    };

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error scoring lead:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
