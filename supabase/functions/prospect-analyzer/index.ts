/**
 * ProspectAI Genesis - Analisador Inteligente de Prospects
 * 
 * Funcionalidades:
 * - Análise de sites para identificar oportunidades
 * - Identificação de features faltantes (WhatsApp, agendamento, site)
 * - Geração de propostas altamente conversíveis
 * - Score de potencial de conversão
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  prospect_id: string;
  company_name: string;
  company_website?: string;
  company_phone?: string;
  niche?: string;
  company_city?: string;
  action: 'analyze' | 'generate_proposal' | 'analyze_and_propose';
}

interface SiteAnalysis {
  hasWebsite: boolean;
  hasWhatsAppButton: boolean;
  hasOnlineScheduling: boolean;
  hasChatbot: boolean;
  hasOnlinePayment: boolean;
  hasSocialMedia: boolean;
  hasSSL: boolean;
  isMobileResponsive: boolean;
  loadTime: string;
  seoScore: number;
  missingFeatures: string[];
  painPoints: string[];
  opportunities: string[];
}

// Função para extrair conteúdo de um site
async function fetchSiteContent(url: string): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    // Normalizar URL
    let normalizedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = `https://${url}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GenesisBot/1.0; +https://genesishub.cloud)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const html = await response.text();
    
    // Extrair texto relevante do HTML
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 15000); // Limitar tamanho

    return { success: true, content: html.slice(0, 30000), };
  } catch (error) {
    console.error('Erro ao buscar site:', error);
    return { success: false, error: String(error) };
  }
}

// Análise básica do HTML para detectar features
function analyzeHtmlFeatures(html: string): Partial<SiteAnalysis> {
  const lowerHtml = html.toLowerCase();
  
  return {
    hasWhatsAppButton: lowerHtml.includes('whatsapp') || lowerHtml.includes('wa.me') || lowerHtml.includes('api.whatsapp'),
    hasOnlineScheduling: lowerHtml.includes('agend') || lowerHtml.includes('schedul') || lowerHtml.includes('booking') || lowerHtml.includes('calendly'),
    hasChatbot: lowerHtml.includes('chatbot') || lowerHtml.includes('chat-widget') || lowerHtml.includes('tidio') || lowerHtml.includes('intercom') || lowerHtml.includes('zendesk'),
    hasOnlinePayment: lowerHtml.includes('pagamento') || lowerHtml.includes('payment') || lowerHtml.includes('stripe') || lowerHtml.includes('paypal') || lowerHtml.includes('mercadopago'),
    hasSocialMedia: lowerHtml.includes('instagram') || lowerHtml.includes('facebook') || lowerHtml.includes('linkedin'),
    hasSSL: true, // Assumimos HTTPS se conseguiu buscar
    isMobileResponsive: lowerHtml.includes('viewport') || lowerHtml.includes('responsive') || lowerHtml.includes('mobile'),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const body: AnalysisRequest = await req.json();
    const { prospect_id, company_name, company_website, company_phone, niche, company_city, action } = body;

    console.log(`[ProspectAnalyzer] Action: ${action}, Company: ${company_name}`);

    // Atualizar status para analyzing
    if (prospect_id) {
      await supabase
        .from('affiliate_prospects')
        .update({ status: 'analyzing' })
        .eq('id', prospect_id);
    }

    let siteAnalysis: Partial<SiteAnalysis> = {
      hasWebsite: false,
      hasWhatsAppButton: false,
      hasOnlineScheduling: false,
      hasChatbot: false,
      hasOnlinePayment: false,
      hasSocialMedia: false,
      missingFeatures: [],
      painPoints: [],
      opportunities: [],
    };

    let siteContent = '';

    // Se tiver website, analisar
    if (company_website) {
      siteAnalysis.hasWebsite = true;
      const fetchResult = await fetchSiteContent(company_website);
      
      if (fetchResult.success && fetchResult.content) {
        siteContent = fetchResult.content;
        const htmlFeatures = analyzeHtmlFeatures(fetchResult.content);
        siteAnalysis = { ...siteAnalysis, ...htmlFeatures };
      }
    }

    // Identificar features faltantes
    const missingFeatures: string[] = [];
    const painPoints: string[] = [];
    const opportunities: string[] = [];

    if (!siteAnalysis.hasWebsite) {
      missingFeatures.push('site_profissional');
      painPoints.push('Empresa sem presença digital profissional');
      opportunities.push('Criar site moderno que gera leads 24/7');
    }

    if (!siteAnalysis.hasWhatsAppButton) {
      missingFeatures.push('whatsapp_integrado');
      painPoints.push('Clientes não conseguem contato rápido');
      opportunities.push('Botão WhatsApp aumenta conversões em até 40%');
    }

    if (!siteAnalysis.hasOnlineScheduling) {
      missingFeatures.push('agendamento_online');
      painPoints.push('Perde clientes por falta de agendamento automático');
      opportunities.push('Sistema de agendamento 24h reduz no-shows em 50%');
    }

    if (!siteAnalysis.hasChatbot) {
      missingFeatures.push('chatbot_automatico');
      painPoints.push('Atendimento limitado ao horário comercial');
      opportunities.push('Chatbot responde 24/7 e qualifica leads automaticamente');
    }

    if (!siteAnalysis.hasOnlinePayment) {
      missingFeatures.push('pagamento_online');
      painPoints.push('Perde vendas por não aceitar pagamento online');
      opportunities.push('Pagamento online aumenta ticket médio em 25%');
    }

    siteAnalysis.missingFeatures = missingFeatures;
    siteAnalysis.painPoints = painPoints;
    siteAnalysis.opportunities = opportunities;

    // Calcular score de potencial (mais features faltantes = maior potencial)
    const analysisScore = Math.min(100, missingFeatures.length * 20 + 20);

    // Se a ação inclui geração de proposta, usar Luna AI
    let generatedProposal = null;

    if ((action === 'generate_proposal' || action === 'analyze_and_propose') && lovableApiKey) {
      console.log('[ProspectAnalyzer] Gerando proposta com Luna AI...');

      const systemPrompt = `Você é Luna, a IA especialista em vendas da Genesis Hub. Sua missão é criar propostas comerciais ALTAMENTE CONVERSÍVEIS para empresas que precisam de soluções digitais.

CONTEXTO DA GENESIS:
- Genesis é uma plataforma completa de automação: WhatsApp, agendamentos, chatbots, CRM, sites
- Planos a partir de R$ 97/mês (Starter) até R$ 497/mês (Enterprise)
- Foco em resultados mensuráveis e ROI claro

REGRAS PARA PROPOSTA IRRESISTÍVEL:
1. ABRA COM IMPACTO: Mostre que você entendeu a dor específica do negócio
2. USE NÚMEROS: Estatísticas reais de conversão e economia
3. CRIE URGÊNCIA: Mencione concorrentes que já usam automação
4. PERSONALIZE: Use o nome da empresa e nicho específico
5. OFEREÇA VALOR PRIMEIRO: Análise gratuita, período de teste
6. CTA CLARO: Próximo passo óbvio e fácil

ESTRUTURA DA PROPOSTA (JSON):
{
  "headline": "Frase de impacto personalizada",
  "problema_identificado": "Descrição empática da dor principal",
  "solucao_proposta": "Como a Genesis resolve isso",
  "beneficios": ["Benefício 1 com número", "Benefício 2 com número", "Benefício 3 com número"],
  "casos_de_sucesso": "Exemplo relevante do nicho",
  "oferta_especial": "Desconto ou bônus por tempo limitado",
  "investimento": "Valor mensal sugerido",
  "proximo_passo": "CTA claro",
  "mensagem_whatsapp": "Mensagem pronta para enviar (máx 500 chars, com emojis)",
  "assunto_email": "Assunto de email que gera abertura"
}`;

      const userPrompt = `Crie uma proposta comercial irresistível para:

EMPRESA: ${company_name}
NICHO: ${niche || 'Não especificado'}
CIDADE: ${company_city || 'Não especificada'}
WEBSITE: ${company_website || 'Não possui'}
TELEFONE: ${company_phone || 'Não informado'}

ANÁLISE DO SITE:
- Tem website: ${siteAnalysis.hasWebsite ? 'Sim' : 'Não'}
- Tem WhatsApp integrado: ${siteAnalysis.hasWhatsAppButton ? 'Sim' : 'Não'}
- Tem agendamento online: ${siteAnalysis.hasOnlineScheduling ? 'Sim' : 'Não'}
- Tem chatbot: ${siteAnalysis.hasChatbot ? 'Sim' : 'Não'}
- Tem pagamento online: ${siteAnalysis.hasOnlinePayment ? 'Sim' : 'Não'}

FEATURES FALTANTES: ${missingFeatures.join(', ') || 'Nenhuma identificada'}
DORES IDENTIFICADAS: ${painPoints.join('; ') || 'Nenhuma identificada'}
OPORTUNIDADES: ${opportunities.join('; ') || 'Nenhuma identificada'}

SCORE DE POTENCIAL: ${analysisScore}/100

Gere a proposta no formato JSON especificado. Seja EXTREMAMENTE persuasivo e personalizado para este negócio específico.`;

      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.8,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          
          // Extrair JSON da resposta
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              generatedProposal = JSON.parse(jsonMatch[0]);
              console.log('[ProspectAnalyzer] Proposta gerada com sucesso!');
            } catch (e) {
              console.error('[ProspectAnalyzer] Erro ao parsear JSON da proposta:', e);
              generatedProposal = { raw_content: content };
            }
          } else {
            generatedProposal = { raw_content: content };
          }
        } else {
          const errorText = await aiResponse.text();
          console.error('[ProspectAnalyzer] Erro na API de IA:', aiResponse.status, errorText);
        }
      } catch (aiError) {
        console.error('[ProspectAnalyzer] Erro ao chamar IA:', aiError);
      }
    }

    // Atualizar prospect no banco
    if (prospect_id) {
      const updateData: Record<string, unknown> = {
        analysis_data: siteAnalysis,
        analysis_score: analysisScore,
        missing_features: missingFeatures,
        pain_points: painPoints,
        status: generatedProposal ? 'proposal_ready' : 'analyzed',
      };

      if (generatedProposal) {
        updateData.generated_proposal = generatedProposal;
        updateData.proposal_generated_at = new Date().toISOString();
      }

      await supabase
        .from('affiliate_prospects')
        .update(updateData)
        .eq('id', prospect_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: siteAnalysis,
        score: analysisScore,
        missing_features: missingFeatures,
        pain_points: painPoints,
        opportunities,
        proposal: generatedProposal,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ProspectAnalyzer] Erro:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
