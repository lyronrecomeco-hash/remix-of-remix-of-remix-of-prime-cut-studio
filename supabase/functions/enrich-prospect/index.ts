import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tabela de valores estimados por nicho
const NICHE_VALUES: Record<string, { min: number; max: number; recurrence: number }> = {
  'barbearia': { min: 600, max: 900, recurrence: 120 },
  'salao': { min: 700, max: 1100, recurrence: 150 },
  'clinica': { min: 1200, max: 2000, recurrence: 200 },
  'clinica estetica': { min: 1500, max: 2800, recurrence: 280 },
  'estetica': { min: 1200, max: 2200, recurrence: 250 },
  'psicologia': { min: 1500, max: 2800, recurrence: 300 },
  'psicologo': { min: 1500, max: 2800, recurrence: 300 },
  'nutricionista': { min: 1200, max: 2200, recurrence: 250 },
  'fisioterapia': { min: 1200, max: 2200, recurrence: 250 },
  'pilates': { min: 1000, max: 1800, recurrence: 200 },
  'medicina': { min: 2000, max: 4000, recurrence: 400 },
  'veterinaria': { min: 1000, max: 1800, recurrence: 200 },
  'dentista': { min: 1500, max: 2500, recurrence: 250 },
  'odontologia': { min: 1500, max: 2500, recurrence: 250 },
  'farmacia': { min: 800, max: 1400, recurrence: 160 },
  'otica': { min: 800, max: 1400, recurrence: 160 },
  'restaurante': { min: 800, max: 1400, recurrence: 180 },
  'pizzaria': { min: 700, max: 1200, recurrence: 150 },
  'hamburgueria': { min: 700, max: 1200, recurrence: 150 },
  'cafeteria': { min: 600, max: 1000, recurrence: 130 },
  'padaria': { min: 600, max: 1000, recurrence: 130 },
  'sorveteria': { min: 500, max: 900, recurrence: 120 },
  'acai': { min: 500, max: 900, recurrence: 120 },
  'bar': { min: 700, max: 1200, recurrence: 150 },
  'academia': { min: 900, max: 1500, recurrence: 180 },
  'crossfit': { min: 1000, max: 1800, recurrence: 200 },
  'personal trainer': { min: 800, max: 1400, recurrence: 170 },
  'petshop': { min: 600, max: 1000, recurrence: 130 },
  'imobiliaria': { min: 1500, max: 3000, recurrence: 300 },
  'corretor': { min: 1200, max: 2500, recurrence: 280 },
  'advocacia': { min: 1800, max: 3500, recurrence: 350 },
  'advogado': { min: 1800, max: 3500, recurrence: 350 },
  'contabilidade': { min: 1200, max: 2200, recurrence: 220 },
  'contador': { min: 1200, max: 2200, recurrence: 220 },
  'hotel': { min: 2000, max: 4000, recurrence: 400 },
  'pousada': { min: 1200, max: 2000, recurrence: 200 },
  'oficina': { min: 700, max: 1100, recurrence: 140 },
  'mecanica': { min: 700, max: 1100, recurrence: 140 },
  'loja': { min: 800, max: 1300, recurrence: 160 },
  'boutique': { min: 800, max: 1400, recurrence: 170 },
  'escola': { min: 1500, max: 2500, recurrence: 280 },
  'curso': { min: 1200, max: 2000, recurrence: 220 },
  'autoescola': { min: 800, max: 1400, recurrence: 160 },
  'construtora': { min: 2000, max: 4000, recurrence: 400 },
  'arquitetura': { min: 1500, max: 3000, recurrence: 300 },
  'engenharia': { min: 1500, max: 3000, recurrence: 300 },
  'lavanderia': { min: 600, max: 1000, recurrence: 130 },
  'grafica': { min: 800, max: 1400, recurrence: 160 },
  'fotografo': { min: 800, max: 1500, recurrence: 170 },
  'marketing': { min: 1500, max: 3000, recurrence: 300 },
  'agencia': { min: 1500, max: 3000, recurrence: 300 },
  'coworking': { min: 1000, max: 1800, recurrence: 200 },
  'consultorio': { min: 1200, max: 2200, recurrence: 250 },
  'spa': { min: 1500, max: 2800, recurrence: 280 },
  'massagem': { min: 800, max: 1500, recurrence: 170 },
  'tatuagem': { min: 800, max: 1400, recurrence: 160 },
  'joalheria': { min: 1000, max: 2000, recurrence: 220 },
  'floricultura': { min: 600, max: 1100, recurrence: 140 },
  'papelaria': { min: 500, max: 900, recurrence: 120 },
  'supermercado': { min: 1000, max: 2000, recurrence: 200 },
  'mercado': { min: 800, max: 1500, recurrence: 170 },
  'posto': { min: 1000, max: 2000, recurrence: 200 },
  'funilaria': { min: 800, max: 1400, recurrence: 160 },
  'eletricista': { min: 600, max: 1100, recurrence: 140 },
  'encanador': { min: 600, max: 1100, recurrence: 140 },
  'default': { min: 500, max: 800, recurrence: 100 },
};

interface EnrichRequest {
  business: {
    name: string;
    address?: string;
    phone?: string;
    website?: string;
    rating?: number;
    reviews_count?: number;
    niche?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  affiliateName?: string;
}

interface EnrichedResult {
  opportunityScore: number;
  opportunityLevel: 'basic' | 'intermediate' | 'advanced';
  estimatedValueMin: number;
  estimatedValueMax: number;
  monthlyRecurrence: number;
  hasWebsite: boolean;
  hasWhatsapp: boolean;
  hasOnlineScheduling: boolean;
  hasChatbot: boolean;
  digitalPresenceStatus: string;
  serviceTags: string[];
  aiDescription: string;
  painPoints: string[];
  missingFeatures: string[];
}

function getNicheKey(niche: string): string {
  const normalized = niche.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  for (const key of Object.keys(NICHE_VALUES)) {
    if (normalized.includes(key)) return key;
  }
  
  return 'default';
}

function calculateOpportunityScore(business: EnrichRequest['business']): number {
  let score = 50; // Base score
  
  // Sem website = MUITO mais oportunidade
  if (!business.website) {
    score += 40;
  } else {
    score -= 10;
  }
  
  // Tem telefone = pode ser contatado
  if (business.phone) {
    score += 5;
  }
  
  // Rating baixo ou sem rating = precisa de ajuda
  if (!business.rating || business.rating < 4) {
    score += 10;
  } else if (business.rating >= 4.5) {
    score -= 5;
  }
  
  // Poucas avaliações = negócio pequeno, mais receptivo
  if (!business.reviews_count || business.reviews_count < 50) {
    score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

function getOpportunityLevel(score: number): 'basic' | 'intermediate' | 'advanced' {
  if (score >= 80) return 'advanced';
  if (score >= 60) return 'intermediate';
  return 'basic';
}

function getDigitalPresenceStatus(business: EnrichRequest['business']): string {
  if (!business.website && !business.phone) {
    return 'Invisível digitalmente — oportunidade máxima';
  }
  if (!business.website) {
    return 'Sem presença digital — oportunidade máxima';
  }
  if (business.rating && business.rating < 4) {
    return 'Presença fraca — precisa de melhorias';
  }
  return 'Presença básica — pode melhorar';
}

function getServiceTags(niche: string, hasWebsite: boolean): string[] {
  const tags: string[] = [];
  const nicheKey = getNicheKey(niche);
  
  // Tags baseadas no nicho
  const nicheTags: Record<string, string[]> = {
    'barbearia': ['agendamento', 'cardápio de serviços', 'fidelidade'],
    'salao': ['agendamento', 'catálogo', 'promoções'],
    'clinica': ['agendamento médico', 'teleconsulta', 'prontuário'],
    'clinica estetica': ['agendamento', 'catálogo procedimentos', 'antes/depois'],
    'estetica': ['agendamento', 'pacotes', 'fidelidade'],
    'psicologia': ['agendamento online', 'teleconsulta', 'área do paciente'],
    'psicologo': ['agendamento online', 'teleconsulta', 'área do paciente'],
    'nutricionista': ['agendamento', 'plano alimentar', 'teleconsulta'],
    'fisioterapia': ['agendamento', 'prontuário', 'evolução paciente'],
    'pilates': ['agendamento aulas', 'check-in', 'planos'],
    'veterinaria': ['agendamento', 'prontuário pet', 'lembretes vacina'],
    'dentista': ['agendamento', 'lembretes', 'orçamentos'],
    'odontologia': ['agendamento', 'lembretes', 'orçamentos'],
    'farmacia': ['catálogo', 'delivery', 'receitas'],
    'restaurante': ['cardápio digital', 'delivery', 'reservas'],
    'pizzaria': ['cardápio digital', 'pedidos online', 'delivery'],
    'hamburgueria': ['cardápio digital', 'pedidos online', 'delivery'],
    'cafeteria': ['cardápio digital', 'pedidos', 'fidelidade'],
    'padaria': ['cardápio', 'encomendas', 'delivery'],
    'bar': ['cardápio digital', 'reservas', 'eventos'],
    'academia': ['check-in digital', 'treinos', 'agendamento'],
    'crossfit': ['agendamento aulas', 'WOD', 'check-in'],
    'personal trainer': ['agendamento', 'treinos online', 'evolução'],
    'petshop': ['agendamento banho/tosa', 'loja online', 'delivery'],
    'imobiliaria': ['catálogo imóveis', 'tour virtual', 'CRM'],
    'corretor': ['catálogo imóveis', 'agendamento visitas', 'CRM'],
    'advocacia': ['agendamento', 'área do cliente', 'documentos'],
    'contabilidade': ['portal cliente', 'documentos', 'chat'],
    'hotel': ['reservas online', 'check-in digital', 'serviços'],
    'pousada': ['reservas', 'galeria', 'pacotes'],
    'oficina': ['agendamento', 'orçamentos', 'status serviço'],
    'mecanica': ['agendamento', 'orçamentos', 'status serviço'],
    'loja': ['e-commerce', 'catálogo', 'WhatsApp vendas'],
    'boutique': ['e-commerce', 'catálogo', 'WhatsApp vendas'],
    'escola': ['matrículas', 'portal aluno', 'pagamentos'],
    'curso': ['matrículas', 'portal aluno', 'certificados'],
    'construtora': ['portfólio', 'orçamentos', 'acompanhamento obra'],
    'arquitetura': ['portfólio', 'agendamento', 'projetos'],
    'spa': ['agendamento', 'pacotes', 'catálogo tratamentos'],
    'fotografo': ['portfólio', 'agendamento sessões', 'galeria cliente'],
    'marketing': ['portfólio', 'relatórios', 'área do cliente'],
    'agencia': ['portfólio', 'briefing online', 'área do cliente'],
    'consultorio': ['agendamento', 'prontuário', 'teleconsulta'],
    'default': ['site profissional', 'WhatsApp Business', 'automação'],
  };
  
  tags.push(...(nicheTags[nicheKey] || nicheTags['default']));
  
  if (!hasWebsite) {
    tags.unshift('site profissional');
  }
  
  return [...new Set(tags)].slice(0, 5);
}

function getPainPoints(business: EnrichRequest['business']): string[] {
  const painPoints: string[] = [];
  
  if (!business.website) {
    painPoints.push('Perde clientes por não ser encontrado no Google');
    painPoints.push('Não consegue mostrar seus serviços online');
  }
  
  if (business.rating && business.rating < 4) {
    painPoints.push('Reputação online precisa de gestão');
  }
  
  if (!business.reviews_count || business.reviews_count < 20) {
    painPoints.push('Poucas avaliações online');
  }
  
  painPoints.push('Atendimento manual desperdiça tempo');
  painPoints.push('Agenda desorganizada causa perda de clientes');
  
  return painPoints.slice(0, 4);
}

function getMissingFeatures(business: EnrichRequest['business']): string[] {
  const features: string[] = [];
  
  if (!business.website) {
    features.push('Website profissional');
    features.push('Presença no Google');
  }
  
  features.push('Agendamento online 24h');
  features.push('Atendimento automatizado WhatsApp');
  features.push('Sistema de fidelidade');
  features.push('Lembretes automáticos');
  
  return features.slice(0, 5);
}

function generateAIDescription(business: EnrichRequest['business'], level: string): string {
  const nicheKey = getNicheKey(business.niche || 'default');
  const cityInfo = business.city ? ` em ${business.city}` : '';
  
  const descriptions: Record<string, Record<string, string>> = {
    'advanced': {
      'barbearia': `Barbearia${cityInfo} sem presença digital — perfeita para sistema completo de agendamento e fidelização.`,
      'salao': `Salão de beleza${cityInfo} precisa urgente de catálogo digital e agendamento online.`,
      'restaurante': `Restaurante${cityInfo} sem cardápio digital — oportunidade para delivery e pedidos online.`,
      'clinica': `Clínica${cityInfo} necessita de sistema de agendamento e prontuário eletrônico.`,
      'default': `Negócio${cityInfo} sem presença digital — oportunidade máxima para transformação completa.`,
    },
    'intermediate': {
      'barbearia': `Barbearia${cityInfo} com presença básica — precisa de automação e fidelidade.`,
      'salao': `Salão${cityInfo} pode melhorar com agendamento e promoções automáticas.`,
      'restaurante': `Restaurante${cityInfo} precisa otimizar atendimento e delivery.`,
      'clinica': `Clínica${cityInfo} pode automatizar agendamentos e lembretes.`,
      'default': `Negócio${cityInfo} com oportunidade de melhorar presença digital.`,
    },
    'basic': {
      'default': `Negócio${cityInfo} já tem presença online — pode otimizar processos.`,
    },
  };
  
  const levelDescriptions = descriptions[level] || descriptions['basic'];
  return levelDescriptions[nicheKey] || levelDescriptions['default'];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business, affiliateName }: EnrichRequest = await req.json();

    if (!business || !business.name) {
      throw new Error('Business data is required');
    }

    // Calcular score e nível
    const opportunityScore = calculateOpportunityScore(business);
    const opportunityLevel = getOpportunityLevel(opportunityScore);
    
    // Obter valores estimados
    const nicheKey = getNicheKey(business.niche || 'default');
    const values = NICHE_VALUES[nicheKey] || NICHE_VALUES['default'];
    
    // Ajustar valores baseado no score
    const multiplier = opportunityScore >= 80 ? 1.2 : opportunityScore >= 60 ? 1.0 : 0.8;
    
    const hasWebsite = !!business.website;
    
    const enrichedResult: EnrichedResult = {
      opportunityScore,
      opportunityLevel,
      estimatedValueMin: Math.round(values.min * multiplier),
      estimatedValueMax: Math.round(values.max * multiplier),
      monthlyRecurrence: Math.round(values.recurrence * multiplier),
      hasWebsite,
      hasWhatsapp: false, // Seria necessário verificar o site
      hasOnlineScheduling: false,
      hasChatbot: false,
      digitalPresenceStatus: getDigitalPresenceStatus(business),
      serviceTags: getServiceTags(business.niche || 'default', hasWebsite),
      aiDescription: generateAIDescription(business, opportunityLevel),
      painPoints: getPainPoints(business),
      missingFeatures: getMissingFeatures(business),
    };

    return new Response(
      JSON.stringify({ success: true, data: enrichedResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error enriching prospect:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
