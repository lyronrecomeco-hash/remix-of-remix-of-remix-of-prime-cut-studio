/**
 * ProspectAI Genesis - Sistema de Envio Automatizado Anti-Ban
 * 
 * Funcionalidades:
 * - Envio de propostas via WhatsApp
 * - Sistema anti-ban com delays adaptativos
 * - Warm-up de conta
 * - Limites diários/horários
 * - Simulação de digitação
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NATIVE_VPS_URL = "http://72.62.108.24:3000";
const NATIVE_VPS_TOKEN = "genesis-master-token-2024-secure";

interface SendRequest {
  action: 'send_single' | 'send_batch' | 'check_status' | 'send_test' | 'send_manual';
  prospect_id?: string;
  affiliate_id: string;
  batch_size?: number;
  // For test mode
  phone?: string;
  message?: string;
  // Skip restrictions for manual sends
  skip_restrictions?: boolean;
}

interface ProspectSettings {
  auto_send_enabled: boolean;
  genesis_instance_id: string | null;
  send_start_hour: number;
  send_end_hour: number;
  send_days: number[];
  daily_limit: number;
  messages_per_hour: number;
  min_delay_seconds: number;
  max_delay_seconds: number;
  warmup_enabled: boolean;
  warmup_day: number;
  warmup_increment_percent: number;
  message_template: string;
  include_proposal_link: boolean;
  include_analysis: boolean;
  total_sent_today: number;
}

// Verificar se está dentro do horário permitido
function isWithinAllowedHours(startHour: number, endHour: number): boolean {
  const now = new Date();
  // Brasília timezone
  const brasiliaOffset = -3;
  const utcHour = now.getUTCHours();
  const brasiliaHour = (utcHour + brasiliaOffset + 24) % 24;
  
  return brasiliaHour >= startHour && brasiliaHour < endHour;
}

// Verificar se é dia permitido
function isAllowedDay(allowedDays: number[]): boolean {
  const now = new Date();
  const brasiliaOffset = -3;
  const utcDay = now.getUTCDay();
  // Ajustar para Brasília
  const brasiliaDay = utcDay; // Simplificado, pode precisar ajuste para horários de virada
  
  return allowedDays.includes(brasiliaDay);
}

// Calcular limite efetivo com warm-up
function getEffectiveLimit(settings: ProspectSettings): number {
  if (!settings.warmup_enabled) {
    return settings.daily_limit;
  }
  
  // Warm-up progressivo: dia 1 = 20%, dia 2 = 40%, etc.
  const warmupMultiplier = Math.min(1, (settings.warmup_day * settings.warmup_increment_percent) / 100);
  return Math.ceil(settings.daily_limit * warmupMultiplier);
}

// Gerar delay aleatório entre min e max
function getRandomDelay(minSeconds: number, maxSeconds: number): number {
  return Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds) * 1000;
}

// Formatar mensagem com variáveis
function formatMessage(template: string, prospect: Record<string, unknown>, proposal: Record<string, unknown> | null): string {
  let message = template;
  
  // Substituir variáveis do prospect
  message = message.replace(/{company_name}/g, String(prospect.company_name || 'Empresa'));
  message = message.replace(/{company_city}/g, String(prospect.company_city || ''));
  message = message.replace(/{niche}/g, String(prospect.niche || ''));
  
  // Substituir variáveis da análise
  const analysisData = prospect.analysis_data as Record<string, unknown> || {};
  const missingFeatures = prospect.missing_features as string[] || [];
  const painPoints = prospect.pain_points as string[] || [];
  
  let analysisSummary = '';
  if (missingFeatures.length > 0) {
    const featureLabels: Record<string, string> = {
      'site_profissional': '❌ Site Profissional',
      'whatsapp_integrado': '❌ WhatsApp Integrado',
      'agendamento_online': '❌ Agendamento Online',
      'chatbot_automatico': '❌ Chatbot Automático',
      'pagamento_online': '❌ Pagamento Online',
    };
    analysisSummary = missingFeatures.map(f => featureLabels[f] || f).join('\n');
  }
  message = message.replace(/{analysis_summary}/g, analysisSummary);
  
  // Link da proposta (se existir)
  const proposalLink = `https://genesishub.cloud/proposta/${prospect.id}`;
  message = message.replace(/{proposal_link}/g, proposalLink);
  
  // Dados da proposta
  if (proposal) {
    message = message.replace(/{headline}/g, String(proposal.headline || ''));
    message = message.replace(/{beneficios}/g, Array.isArray(proposal.beneficios) ? proposal.beneficios.join('\n• ') : '');
    message = message.replace(/{oferta_especial}/g, String(proposal.oferta_especial || ''));
  }
  
  return message;
}

// Normalizar número de telefone
function normalizePhone(phone: string): string | null {
  if (!phone) return null;
  
  // Remover tudo que não é número
  let cleaned = phone.replace(/\D/g, '');
  
  // Se começar com 0, remover
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  
  // Se não começar com 55, adicionar
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  
  // Verificar tamanho válido (55 + DDD + número)
  if (cleaned.length < 12 || cleaned.length > 13) {
    return null;
  }
  
  return cleaned;
}

// Enviar mensagem via Evolution API
async function sendWhatsAppMessage(
  instanceName: string,
  backendUrl: string,
  backendToken: string,
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Primeiro, simular digitação
    const typingUrl = `${backendUrl}/message/sendPresence/${instanceName}`;
    await fetch(typingUrl, {
      method: 'POST',
      headers: {
        'apikey': backendToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: phone,
        presence: 'composing',
      }),
    });

    // Aguardar tempo de digitação (2-4 segundos)
    const typingTime = Math.floor(Math.random() * 2000) + 2000;
    await new Promise(resolve => setTimeout(resolve, typingTime));

    // Enviar mensagem
    const sendUrl = `${backendUrl}/message/sendText/${instanceName}`;
    const response = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'apikey': backendToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: phone,
        text: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ProspectSender] Erro ao enviar:', response.status, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    console.log('[ProspectSender] Mensagem enviada:', data);
    return { success: true };

  } catch (error) {
    console.error('[ProspectSender] Erro ao enviar mensagem:', error);
    return { success: false, error: String(error) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: SendRequest = await req.json();
    const { action, prospect_id, affiliate_id, batch_size = 5, phone, message, skip_restrictions } = body;

    console.log(`[ProspectSender] Action: ${action}, Affiliate: ${affiliate_id}, Skip: ${skip_restrictions}`);

    // Handle test mode - bypass all restrictions
    if (action === 'send_test') {
      if (!phone || !message) {
        return new Response(
          JSON.stringify({ success: false, error: 'Phone and message required for test' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get any available Genesis instance for testing
      const { data: instanceData } = await supabase
        .from('genesis_instances')
        .select('*')
        .eq('status', 'connected')
        .limit(1)
        .single();

      const backendUrl = instanceData?.backend_url || NATIVE_VPS_URL;
      const backendToken = instanceData?.backend_token || NATIVE_VPS_TOKEN;
      const instanceName = instanceData?.name || 'genesis-global';

      const normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid phone number' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await sendWhatsAppMessage(
        instanceName,
        backendUrl,
        backendToken,
        normalizedPhone,
        message
      );

      return new Response(
        JSON.stringify(result),
        { 
          status: result.success ? 200 : 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Buscar configurações do afiliado
    const { data: settingsData, error: settingsError } = await supabase
      .from('affiliate_prospect_settings')
      .select('*')
      .eq('affiliate_id', affiliate_id)
      .single();

    if (settingsError || !settingsData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configurações de envio não encontradas. Configure primeiro.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const settings = settingsData as ProspectSettings;
    const effectiveLimit = getEffectiveLimit(settings);

    // Only apply restrictions for batch/automated sends (not manual single sends)
    const isManualSend = action === 'send_single' || action === 'send_manual' || skip_restrictions;
    
    if (!isManualSend) {
      // Verificar se auto_send está habilitado
      if (!settings.auto_send_enabled) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Envio automático está desabilitado.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verificar horário permitido
      if (!isWithinAllowedHours(settings.send_start_hour, settings.send_end_hour)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Envio permitido apenas entre ${settings.send_start_hour}h e ${settings.send_end_hour}h.` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verificar dia permitido
      if (!isAllowedDay(settings.send_days)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Envio não permitido neste dia da semana.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verificar limite diário
      if (settings.total_sent_today >= effectiveLimit) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Limite diário atingido (${effectiveLimit}). Aguarde amanhã.` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Buscar instância Genesis
    if (!settings.genesis_instance_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhuma instância WhatsApp configurada.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: instanceData, error: instanceError } = await supabase
      .from('genesis_instances')
      .select('*')
      .eq('id', settings.genesis_instance_id)
      .single();

    if (instanceError || !instanceData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Instância WhatsApp não encontrada.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se instância está conectada
    if (instanceData.status !== 'connected') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Instância WhatsApp não está conectada.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const backendUrl = instanceData.backend_url || NATIVE_VPS_URL;
    const backendToken = instanceData.backend_token || NATIVE_VPS_TOKEN;

    // Processar envio
    if (action === 'send_single' && prospect_id) {
      // Envio único
      const { data: prospect, error: prospectError } = await supabase
        .from('affiliate_prospects')
        .select('*')
        .eq('id', prospect_id)
        .single();

      if (prospectError || !prospect) {
        return new Response(
          JSON.stringify({ success: false, error: 'Prospect não encontrado.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const phone = normalizePhone(prospect.company_phone);
      if (!phone) {
        return new Response(
          JSON.stringify({ success: false, error: 'Número de telefone inválido.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Formatar mensagem
      const proposal = prospect.generated_proposal as Record<string, unknown> | null;
      let message = settings.message_template;

      // Se tiver proposta e mensagem_whatsapp, usar ela
      if (proposal?.mensagem_whatsapp) {
        message = String(proposal.mensagem_whatsapp);
      } else {
        message = formatMessage(message, prospect, proposal);
      }

      // Enviar
      const sendResult = await sendWhatsAppMessage(
        instanceData.instance_name,
        backendUrl,
        backendToken,
        phone,
        message
      );

      if (sendResult.success) {
        // Atualizar prospect
        await supabase
          .from('affiliate_prospects')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            sent_via: 'whatsapp',
            message_sent: message,
          })
          .eq('id', prospect_id);

        // Registrar envio
        await supabase
          .from('affiliate_prospect_sends')
          .insert({
            prospect_id,
            affiliate_id,
            channel: 'whatsapp',
            message_content: message,
            proposal_snapshot: proposal,
            status: 'sent',
            sent_at: new Date().toISOString(),
          });

        // Atualizar contadores
        await supabase
          .from('affiliate_prospect_settings')
          .update({
            total_sent_today: settings.total_sent_today + 1,
            last_sent_at: new Date().toISOString(),
          })
          .eq('affiliate_id', affiliate_id);

        return new Response(
          JSON.stringify({ success: true, message: 'Proposta enviada com sucesso!' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Registrar falha
        await supabase
          .from('affiliate_prospect_sends')
          .insert({
            prospect_id,
            affiliate_id,
            channel: 'whatsapp',
            message_content: message,
            status: 'failed',
            error_message: sendResult.error,
          });

        await supabase
          .from('affiliate_prospects')
          .update({ status: 'failed' })
          .eq('id', prospect_id);

        return new Response(
          JSON.stringify({ success: false, error: sendResult.error }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

    } else if (action === 'send_batch') {
      // Envio em lote
      const remaining = effectiveLimit - settings.total_sent_today;
      const actualBatchSize = Math.min(batch_size, remaining);

      if (actualBatchSize <= 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Limite diário atingido.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Buscar prospects pendentes
      const { data: prospects, error: prospectsError } = await supabase
        .from('affiliate_prospects')
        .select('*')
        .eq('affiliate_id', affiliate_id)
        .in('status', ['proposal_ready', 'analyzed'])
        .not('company_phone', 'is', null)
        .order('analysis_score', { ascending: false })
        .limit(actualBatchSize);

      if (prospectsError || !prospects || prospects.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Nenhum prospect disponível para envio.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let sentCount = 0;
      let failedCount = 0;
      const results: Array<{ id: string; success: boolean; error?: string }> = [];

      for (const prospect of prospects) {
        const phone = normalizePhone(prospect.company_phone);
        if (!phone) {
          results.push({ id: prospect.id, success: false, error: 'Telefone inválido' });
          failedCount++;
          continue;
        }

        const proposal = prospect.generated_proposal as Record<string, unknown> | null;
        let message = settings.message_template;

        if (proposal?.mensagem_whatsapp) {
          message = String(proposal.mensagem_whatsapp);
        } else {
          message = formatMessage(message, prospect, proposal);
        }

        const sendResult = await sendWhatsAppMessage(
          instanceData.instance_name,
          backendUrl,
          backendToken,
          phone,
          message
        );

        if (sendResult.success) {
          await supabase
            .from('affiliate_prospects')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              sent_via: 'whatsapp',
              message_sent: message,
            })
            .eq('id', prospect.id);

          await supabase
            .from('affiliate_prospect_sends')
            .insert({
              prospect_id: prospect.id,
              affiliate_id,
              channel: 'whatsapp',
              message_content: message,
              proposal_snapshot: proposal,
              status: 'sent',
              sent_at: new Date().toISOString(),
            });

          results.push({ id: prospect.id, success: true });
          sentCount++;
        } else {
          await supabase
            .from('affiliate_prospect_sends')
            .insert({
              prospect_id: prospect.id,
              affiliate_id,
              channel: 'whatsapp',
              message_content: message,
              status: 'failed',
              error_message: sendResult.error,
            });

          results.push({ id: prospect.id, success: false, error: sendResult.error });
          failedCount++;
        }

        // Delay entre envios
        if (prospects.indexOf(prospect) < prospects.length - 1) {
          const delay = getRandomDelay(settings.min_delay_seconds, settings.max_delay_seconds);
          console.log(`[ProspectSender] Aguardando ${delay / 1000}s antes do próximo envio...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      // Atualizar contadores
      await supabase
        .from('affiliate_prospect_settings')
        .update({
          total_sent_today: settings.total_sent_today + sentCount,
          last_sent_at: new Date().toISOString(),
        })
        .eq('affiliate_id', affiliate_id);

      return new Response(
        JSON.stringify({
          success: true,
          sent: sentCount,
          failed: failedCount,
          results,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Ação não reconhecida.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ProspectSender] Erro:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
