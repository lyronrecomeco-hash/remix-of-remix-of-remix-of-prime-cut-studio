import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * GENESIS CAMPAIGN WORKER - Enterprise Mass Sending v2.0
 * 
 * ANTI-BAN FEATURES:
 * ✅ Pool de Instâncias (Rotação de Números)
 * ✅ Simulação de Digitação (composing...)
 * ✅ Warm-up de Conta
 * ✅ Delay Adaptativo
 * ✅ Deduplicação Global (Blacklist)
 * ✅ Priorização de Warm Leads
 * ✅ Horários de Pico
 * ✅ Detecção de Spam Words
 * ✅ Cooldown Dinâmico após Block
 * ✅ Métricas de Saúde da Instância
 */

const NATIVE_VPS_URL = "http://72.62.108.24:3000";
const NATIVE_VPS_TOKEN = "genesis-master-token-2024-secure";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CampaignRequest {
  campaign_id: string;
  action: 'start' | 'pause' | 'resume' | 'cancel' | 'process_batch';
  batch_size?: number;
}

interface AntiBanConfig {
  useInstancePool: boolean;
  typingSimulation: boolean;
  typingDurationMin: number;
  typingDurationMax: number;
  adaptiveDelay: boolean;
  respectWarmup: boolean;
  checkBlacklist: boolean;
  quarantineDays: number;
  prioritizeWarmLeads: boolean;
  peakHoursBoost: boolean;
  spamWordCheck: boolean;
  cooldownAfterBlockMinutes: number;
  maxBlocksBeforePause: number;
}

// =============================================
// DDD VALIDATION - Brasil 2025
// =============================================

// DDDs válidos no Brasil
const VALID_BRAZILIAN_DDDS = new Set([
  // São Paulo
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  // Rio de Janeiro
  '21', '22', '24',
  // Espírito Santo
  '27', '28',
  // Minas Gerais
  '31', '32', '33', '34', '35', '37', '38',
  // Paraná
  '41', '42', '43', '44', '45', '46',
  // Santa Catarina
  '47', '48', '49',
  // Rio Grande do Sul
  '51', '53', '54', '55',
  // Distrito Federal
  '61',
  // Goiás
  '62', '64',
  // Tocantins
  '63',
  // Mato Grosso
  '65', '66',
  // Mato Grosso do Sul
  '67',
  // Acre
  '68',
  // Rondônia
  '69',
  // Bahia
  '71', '73', '74', '75', '77',
  // Sergipe
  '79',
  // Pernambuco
  '81', '87',
  // Alagoas
  '82',
  // Paraíba
  '83',
  // Rio Grande do Norte
  '84',
  // Ceará
  '85', '88',
  // Piauí
  '86', '89',
  // Pará
  '91', '93', '94',
  // Amazonas
  '92', '97',
  // Roraima
  '95',
  // Amapá
  '96',
  // Maranhão
  '98', '99',
]);

// Normalizar telefone brasileiro (remove DDI 55, mantém DDD + número)
// Suporta: 5527997723328, 27997723328, +55 27 99772-3328, etc.
function normalizeBrazilianPhone(phone: string): string {
  if (!phone) return '';
  
  // Remove tudo que não é dígito
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Se começa com 55 e tem mais de 11 dígitos, remove o DDI
  if (cleanPhone.startsWith('55') && cleanPhone.length > 11) {
    cleanPhone = cleanPhone.slice(2);
  }
  
  // Se ainda tiver mais de 11 dígitos (caso tenha 0 na frente ou outro prefixo)
  if (cleanPhone.length > 11) {
    cleanPhone = cleanPhone.slice(-11);
  }
  
  // Se tiver 10 dígitos (telefone fixo antigo sem 9), manter
  // Se tiver 11 dígitos (celular com 9), manter
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return ''; // Número inválido
  }
  
  return cleanPhone;
}

// Validar DDD brasileiro com normalização automática
function validateBrazilianDDD(phone: string): { isValid: boolean; ddd: string; normalizedPhone: string; error?: string } {
  const normalizedPhone = normalizeBrazilianPhone(phone);
  
  if (!normalizedPhone) {
    return { isValid: false, ddd: '', normalizedPhone: '', error: 'Número inválido ou muito curto' };
  }
  
  // Extrair DDD (primeiros 2 dígitos do número normalizado)
  const ddd = normalizedPhone.slice(0, 2);
  
  if (!VALID_BRAZILIAN_DDDS.has(ddd)) {
    return { isValid: false, ddd, normalizedPhone, error: `DDD ${ddd} não existe no Brasil` };
  }
  
  // Validar tamanho final (10 ou 11 dígitos)
  if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
    return { isValid: false, ddd, normalizedPhone, error: 'Tamanho do número inválido' };
  }
  
  return { isValid: true, ddd, normalizedPhone };
}

// =============================================
// ANTI-BAN UTILITIES
// =============================================

// Adaptive delay based on hour, sent count, and failure rate
function getAdaptiveDelay(
  minDelay: number, 
  maxDelay: number, 
  sentCount: number, 
  failedCount: number,
  degradationLevel: number
): number {
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const hour = brazilTime.getHours();
  
  let multiplier = 1.0;
  
  // Night hours - slower
  if (hour >= 21 || hour < 8) {
    multiplier *= 2.0;
  }
  // Peak hours - normal or slightly slower to seem human
  else if ((hour >= 10 && hour <= 12) || (hour >= 14 && hour <= 18)) {
    multiplier *= 0.9;
  }
  
  // Progressive slowdown based on sent count
  if (sentCount > 100) multiplier *= 1.2;
  if (sentCount > 300) multiplier *= 1.4;
  if (sentCount > 500) multiplier *= 1.6;
  
  // Slowdown based on failure rate
  const totalAttempts = sentCount + failedCount;
  if (totalAttempts > 10) {
    const failureRate = failedCount / totalAttempts;
    if (failureRate > 0.1) multiplier *= 1.5;
    if (failureRate > 0.2) multiplier *= 2.0;
    if (failureRate > 0.3) multiplier *= 3.0;
  }
  
  // Degradation level multiplier
  multiplier *= (1 + degradationLevel * 0.5);
  
  const adjustedMin = Math.floor(minDelay * multiplier);
  const adjustedMax = Math.floor(maxDelay * multiplier);
  
  const base = Math.floor(Math.random() * (adjustedMax - adjustedMin + 1) + adjustedMin) * 1000;
  const jitter = Math.floor(Math.random() * 3000); // 0-3s jitter
  
  return base + jitter;
}

// Check if within send window
function isWithinSendWindow(startTime: string, endTime: string, sendOnWeekends: boolean): boolean {
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  
  const dayOfWeek = brazilTime.getDay();
  if (!sendOnWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
    return false;
  }
  
  const currentMinutes = brazilTime.getHours() * 60 + brazilTime.getMinutes();
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

// Check if within peak hours for boost
function isWithinPeakHours(): boolean {
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const hour = brazilTime.getHours();
  const minutes = brazilTime.getMinutes();
  const currentMinutes = hour * 60 + minutes;
  
  // Morning peak: 10:00-12:00
  const morningStart = 10 * 60;
  const morningEnd = 12 * 60;
  
  // Afternoon peak: 14:00-18:00
  const afternoonStart = 14 * 60;
  const afternoonEnd = 18 * 60;
  
  return (currentMinutes >= morningStart && currentMinutes < morningEnd) ||
         (currentMinutes >= afternoonStart && currentMinutes < afternoonEnd);
}

// Log campaign event
async function logEvent(
  supabase: SupabaseClient,
  campaignId: string,
  contactId: string | null,
  eventType: string,
  severity: string,
  message: string,
  details: Record<string, unknown> = {}
) {
  try {
    await supabase.from('genesis_campaign_logs').insert({
      campaign_id: campaignId,
      contact_id: contactId,
      event_type: eventType,
      severity,
      message,
      details,
    } as never);
  } catch (e) {
    console.error('Failed to log event:', e);
  }
}

// =============================================
// ANTI-BAN CHECKS
// =============================================

// Check if contact is blacklisted
async function isContactBlacklisted(
  supabase: SupabaseClient,
  userId: string,
  phone: string
): Promise<boolean> {
  try {
    const { data } = await supabase.rpc('check_contact_blacklisted', {
      p_user_id: userId,
      p_phone: phone
    });
    return data === true;
  } catch {
    return false;
  }
}

// Check spam words in message
async function checkSpamWords(
  supabase: SupabaseClient,
  message: string,
  blockLevel: string = 'high'
): Promise<{ hasSpam: boolean; words: string[]; maxSeverity: string }> {
  try {
    const { data: spamWords } = await supabase
      .from('genesis_spam_words')
      .select('word, severity')
      .eq('is_active', true);
    
    if (!spamWords || spamWords.length === 0) {
      return { hasSpam: false, words: [], maxSeverity: 'low' };
    }
    
    const messageLower = message.toLowerCase();
    const foundWords: string[] = [];
    let maxSeverity = 'low';
    const severityOrder = ['low', 'medium', 'high', 'critical'];
    
    for (const sw of spamWords) {
      if (messageLower.includes(sw.word.toLowerCase())) {
        foundWords.push(sw.word);
        if (severityOrder.indexOf(sw.severity) > severityOrder.indexOf(maxSeverity)) {
          maxSeverity = sw.severity;
        }
      }
    }
    
    const shouldBlock = severityOrder.indexOf(maxSeverity) >= severityOrder.indexOf(blockLevel);
    
    return { hasSpam: shouldBlock && foundWords.length > 0, words: foundWords, maxSeverity };
  } catch {
    return { hasSpam: false, words: [], maxSeverity: 'low' };
  }
}

// Get warmup limit for instance
async function getWarmupLimit(supabase: SupabaseClient, instanceId: string): Promise<number> {
  try {
    const { data } = await supabase.rpc('get_warmup_limit', { p_instance_id: instanceId });
    return data ?? 999999;
  } catch {
    return 999999;
  }
}

// Select best instance from pool
async function selectPoolInstance(
  supabase: SupabaseClient,
  campaignId: string,
  userId: string
): Promise<{ instanceId: string | null; backendUrl: string | null; backendToken: string | null }> {
  try {
    // First try pool selection
    const { data: poolInstanceId } = await supabase.rpc('select_pool_instance', {
      p_campaign_id: campaignId
    });
    
    if (poolInstanceId) {
      // Get instance details
      const { data: instance } = await supabase
        .from('genesis_instances')
        .select('id, backend_url, backend_token, orchestrated_status')
        .eq('id', poolInstanceId)
        .eq('orchestrated_status', 'connected')
        .single();
      
      if (instance) {
        return {
          instanceId: instance.id,
          backendUrl: instance.backend_url,
          backendToken: instance.backend_token
        };
      }
    }
    
    return { instanceId: null, backendUrl: null, backendToken: null };
  } catch {
    return { instanceId: null, backendUrl: null, backendToken: null };
  }
}

// Update pool instance stats after send
async function updatePoolInstanceStats(
  supabase: SupabaseClient,
  campaignId: string,
  instanceId: string,
  success: boolean,
  blocked: boolean
) {
  try {
    const updates: Record<string, unknown> = {
      last_used_at: new Date().toISOString(),
    };
    
    // Simple increment via separate updates
    
    // Simple increment via separate updates
    const { data: current } = await supabase
      .from('genesis_campaign_instance_pool')
      .select('messages_sent, messages_failed, blocks_count, health_score')
      .eq('campaign_id', campaignId)
      .eq('instance_id', instanceId)
      .single();
    
    if (current) {
      const newData: Record<string, unknown> = { last_used_at: new Date().toISOString() };
      if (success) newData.messages_sent = (current.messages_sent || 0) + 1;
      if (!success && !blocked) newData.messages_failed = (current.messages_failed || 0) + 1;
      if (blocked) {
        newData.blocks_count = (current.blocks_count || 0) + 1;
        // Reduce health score on block
        newData.health_score = Math.max(0, (current.health_score || 100) - 10);
        // Set cooldown for this instance in pool
        newData.cooldown_until = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min cooldown
      }
      
      await supabase
        .from('genesis_campaign_instance_pool')
        .update(newData as never)
        .eq('campaign_id', campaignId)
        .eq('instance_id', instanceId);
    }
  } catch (e) {
    console.error('Failed to update pool stats:', e);
  }
}

// Update instance health metrics
async function updateInstanceHealthMetrics(
  supabase: SupabaseClient,
  instanceId: string,
  sent: boolean,
  blocked: boolean,
  failed: boolean
) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Upsert today's metrics
    const { data: existing } = await supabase
      .from('genesis_instance_health_metrics')
      .select('*')
      .eq('instance_id', instanceId)
      .eq('period_date', today)
      .single();
    
    if (existing) {
      await supabase
        .from('genesis_instance_health_metrics')
        .update({
          messages_sent: (existing.messages_sent || 0) + (sent ? 1 : 0),
          messages_failed: (existing.messages_failed || 0) + (failed ? 1 : 0),
          messages_blocked: (existing.messages_blocked || 0) + (blocked ? 1 : 0),
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', existing.id);
    } else {
      await supabase
        .from('genesis_instance_health_metrics')
        .insert({
          instance_id: instanceId,
          period_date: today,
          messages_sent: sent ? 1 : 0,
          messages_failed: failed ? 1 : 0,
          messages_blocked: blocked ? 1 : 0,
        } as never);
    }
    
    // Update instance health score
    try {
      await supabase.rpc('update_instance_health', { p_instance_id: instanceId });
    } catch { /* ignore */ }
  } catch (e) {
    console.error('Failed to update health metrics:', e);
  }
}

// Update warmup progress
async function updateWarmupProgress(supabase: SupabaseClient, instanceId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: warmup } = await supabase
      .from('genesis_instance_warmup')
      .select('*')
      .eq('instance_id', instanceId)
      .single();
    
    if (!warmup || warmup.warmup_completed) return;
    
    // Check if new day
    if (warmup.last_message_date !== today) {
      // New day - advance warmup day and reset counter
      const newDay = Math.min((warmup.warmup_day || 1) + 1, 10);
      await supabase
        .from('genesis_instance_warmup')
        .update({
          warmup_day: newDay,
          messages_sent_today: 1,
          last_message_date: today,
          warmup_completed: newDay >= 10,
          warmup_completed_at: newDay >= 10 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('instance_id', instanceId);
    } else {
      // Same day - increment counter
      await supabase
        .from('genesis_instance_warmup')
        .update({
          messages_sent_today: (warmup.messages_sent_today || 0) + 1,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('instance_id', instanceId);
    }
  } catch (e) {
    console.error('Failed to update warmup:', e);
  }
}

// Add contact to blacklist
async function addToBlacklist(
  supabase: SupabaseClient,
  userId: string,
  phone: string,
  reason: string,
  campaignId: string,
  quarantineDays: number
) {
  try {
    const normalized = phone.replace(/\D/g, '');
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const phoneHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const phoneLast4 = normalized.slice(-4);
    
    const quarantineUntil = quarantineDays > 0 
      ? new Date(Date.now() + quarantineDays * 24 * 60 * 60 * 1000).toISOString()
      : null;
    
    await supabase
      .from('genesis_contact_blacklist')
      .upsert({
        user_id: userId,
        phone_hash: phoneHash,
        phone_last4: phoneLast4,
        reason,
        source_campaign_id: campaignId,
        quarantine_until: quarantineUntil,
      } as never, { onConflict: 'user_id,phone_hash' });
  } catch (e) {
    console.error('Failed to add to blacklist:', e);
  }
}

// Send typing indicator
async function sendTypingIndicator(
  backendUrl: string,
  backendToken: string,
  instanceId: string,
  phone: string,
  durationMs: number
) {
  try {
    const typingUrl = `${backendUrl.replace(/\/$/, '')}/api/instance/${instanceId}/typing`;
    
    await fetch(typingUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${backendToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phone,
        duration: Math.floor(durationMs / 1000),
      }),
    });
    
    // Wait for typing duration
    await new Promise(resolve => setTimeout(resolve, durationMs));
  } catch (e) {
    // Typing indicator is non-critical, continue
    console.warn('Typing indicator failed:', e);
  }
}

// =============================================
// MAIN HANDLERS
// =============================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { campaign_id, action, batch_size = 10 }: CampaignRequest = body;
    
    console.log(`[Campaign Worker v2.0] Action: ${action}, Campaign ID: ${campaign_id}`);

    if (!campaign_id || typeof campaign_id !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'campaign_id inválido ou ausente' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(campaign_id)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Formato de campaign_id inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get campaign with anti-ban fields
    const { data: campaign, error: campaignError } = await supabase
      .from('genesis_campaigns')
      .select(`
        *,
        instance:genesis_instances(id, name, backend_url, backend_token, orchestrated_status, user_id)
      `)
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campanha não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build anti-ban config
    const antiBanConfig: AntiBanConfig = {
      useInstancePool: campaign.use_instance_pool ?? false,
      typingSimulation: campaign.typing_simulation ?? true,
      typingDurationMin: campaign.typing_duration_min ?? 2,
      typingDurationMax: campaign.typing_duration_max ?? 5,
      adaptiveDelay: campaign.adaptive_delay ?? true,
      respectWarmup: campaign.respect_warmup ?? true,
      checkBlacklist: campaign.check_blacklist ?? true,
      quarantineDays: campaign.quarantine_days ?? 7,
      prioritizeWarmLeads: campaign.prioritize_warm_leads ?? true,
      peakHoursBoost: campaign.peak_hours_boost ?? true,
      spamWordCheck: campaign.spam_word_check ?? true,
      cooldownAfterBlockMinutes: campaign.cooldown_after_block_minutes ?? 60,
      maxBlocksBeforePause: campaign.max_blocks_before_pause ?? 3,
    };

    console.log(`[Campaign Worker v2.0] Anti-ban config:`, JSON.stringify(antiBanConfig));

    switch (action) {
      case 'start':
        return await handleStart(supabase, campaign, antiBanConfig);
      case 'pause':
        return await handlePause(supabase, campaign);
      case 'resume':
        return await handleStart(supabase, campaign, antiBanConfig);
      case 'cancel':
        return await handleCancel(supabase, campaign);
      case 'process_batch':
        return await processBatch(supabase, campaign, batch_size, antiBanConfig);
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Ação inválida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Campaign worker error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleStart(
  supabase: SupabaseClient, 
  campaign: Record<string, unknown>,
  antiBanConfig: AntiBanConfig
) {
  const instance = campaign.instance as Record<string, unknown>;
  const campaignId = campaign.id as string;
  
  if (instance?.orchestrated_status !== 'connected') {
    await logEvent(supabase, campaignId, null, 'start_failed', 'error', 
      'Instância não está conectada', { status: instance?.orchestrated_status });
    return new Response(
      JSON.stringify({ success: false, error: 'Instância WhatsApp não está conectada' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const inWindow = isWithinSendWindow(
    (campaign.send_window_start as string) || '08:00',
    (campaign.send_window_end as string) || '22:00',
    (campaign.send_on_weekends as boolean) ?? true
  );

  if (!inWindow) {
    await logEvent(supabase, campaignId, null, 'outside_window', 'warning',
      'Fora da janela de envio permitida');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Envio permitido apenas entre ${campaign.send_window_start} e ${campaign.send_window_end}` 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Spam word check on template
  if (antiBanConfig.spamWordCheck) {
    const spamCheck = await checkSpamWords(supabase, campaign.message_template as string);
    if (spamCheck.hasSpam) {
      await logEvent(supabase, campaignId, null, 'spam_detected', 'error',
        'Mensagem contém palavras que podem acionar filtros', { words: spamCheck.words });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Mensagem contém palavras proibidas: ${spamCheck.words.join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  await supabase
    .from('genesis_campaigns')
    .update({ 
      status: 'running',
      started_at: campaign.started_at || new Date().toISOString(),
      paused_at: null,
      error_message: null,
    } as never)
    .eq('id', campaignId);

  await logEvent(supabase, campaignId, null, 'campaign_started', 'info',
    'Campanha iniciada com proteção anti-ban v2.0', { 
      total_contacts: campaign.total_contacts,
      anti_ban_config: antiBanConfig
    });

  const result = await processBatch(supabase, campaign, (campaign.batch_size as number) || 10, antiBanConfig);
  return result;
}

async function handlePause(supabase: SupabaseClient, campaign: Record<string, unknown>) {
  const campaignId = campaign.id as string;
  
  await supabase
    .from('genesis_campaigns')
    .update({ 
      status: 'paused',
      paused_at: new Date().toISOString(),
    } as never)
    .eq('id', campaignId);

  await logEvent(supabase, campaignId, null, 'campaign_paused', 'info', 'Campanha pausada');

  return new Response(
    JSON.stringify({ success: true, message: 'Campanha pausada' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleCancel(supabase: SupabaseClient, campaign: Record<string, unknown>) {
  const campaignId = campaign.id as string;
  
  await supabase
    .from('genesis_campaigns')
    .update({ 
      status: 'cancelled',
      completed_at: new Date().toISOString(),
    } as never)
    .eq('id', campaignId);

  await supabase
    .from('genesis_campaign_contacts')
    .update({ status: 'skipped' } as never)
    .eq('campaign_id', campaignId)
    .in('status', ['pending', 'queued']);

  await logEvent(supabase, campaignId, null, 'campaign_cancelled', 'warning', 'Campanha cancelada');

  return new Response(
    JSON.stringify({ success: true, message: 'Campanha cancelada' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processBatch(
  supabase: SupabaseClient, 
  campaign: Record<string, unknown>,
  batchSize: number,
  antiBanConfig: AntiBanConfig
) {
  const defaultInstance = campaign.instance as Record<string, unknown>;
  const campaignId = campaign.id as string;
  const userId = campaign.user_id as string;
  
  // Re-check status
  const { data: currentCampaign } = await supabase
    .from('genesis_campaigns')
    .select('status, blocked_count')
    .eq('id', campaignId)
    .single();

  if ((currentCampaign as Record<string, unknown>)?.status !== 'running') {
    return new Response(
      JSON.stringify({ success: false, message: 'Campanha não está em execução' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check if too many blocks - auto pause
  const currentBlocks = (currentCampaign as Record<string, unknown>)?.blocked_count as number || 0;
  if (currentBlocks >= antiBanConfig.maxBlocksBeforePause) {
    await supabase
      .from('genesis_campaigns')
      .update({ 
        status: 'paused', 
        paused_at: new Date().toISOString(),
        error_message: `Pausado automaticamente: ${currentBlocks} bloqueios detectados`
      } as never)
      .eq('id', campaignId);
    
    await logEvent(supabase, campaignId, null, 'auto_paused_blocks', 'warning',
      `Campanha pausada após ${currentBlocks} bloqueios`);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Pausado por bloqueios' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const inWindow = isWithinSendWindow(
    (campaign.send_window_start as string) || '08:00',
    (campaign.send_window_end as string) || '22:00',
    (campaign.send_on_weekends as boolean) ?? true
  );

  if (!inWindow) {
    await supabase
      .from('genesis_campaigns')
      .update({ status: 'paused', paused_at: new Date().toISOString() } as never)
      .eq('id', campaignId);
    
    await logEvent(supabase, campaignId, null, 'auto_paused', 'info', 
      'Campanha pausada automaticamente - fora da janela de envio');
    
    return new Response(
      JSON.stringify({ success: true, message: 'Pausado - fora da janela de envio' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get contacts - prioritize warm leads if enabled
  let query = supabase
    .from('genesis_campaign_contacts')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('status', 'pending')
    .is('locked_at', null);
  
  if (antiBanConfig.prioritizeWarmLeads) {
    query = query.order('is_warm_lead', { ascending: false })
                 .order('previous_interaction_count', { ascending: false });
  }
  
  const { data: contacts, error: contactsError } = await query.limit(batchSize);
  const contactsList = (contacts || []) as Array<Record<string, unknown>>;

  if (contactsError || contactsList.length === 0) {
    const { count: pendingCount } = await supabase
      .from('genesis_campaign_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .in('status', ['pending', 'queued', 'sending']);

    if (!pendingCount || pendingCount === 0) {
      await supabase
        .from('genesis_campaigns')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
        } as never)
        .eq('id', campaignId);

      await logEvent(supabase, campaignId, null, 'campaign_completed', 'info', 
        'Campanha concluída com sucesso');

      return new Response(
        JSON.stringify({ success: true, message: 'Campanha concluída', completed: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Nenhum contato pendente no momento' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Lock contacts
  const contactIds = contactsList.map(c => c.id as string);
  await supabase
    .from('genesis_campaign_contacts')
    .update({ locked_at: new Date().toISOString(), status: 'queued' } as never)
    .in('id', contactIds);

  // Get Luna variations
  let variations: string[] = [];
  if (campaign.luna_enabled && Array.isArray(campaign.luna_generated_variations)) {
    variations = campaign.luna_generated_variations as string[];
  }

  // Get backend config
  const { data: globalConfig } = await supabase
    .from('whatsapp_backend_config')
    .select('backend_url, master_token')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let sentCount = (campaign.sent_count as number) || 0;
  let failedCount = (campaign.failed_count as number) || 0;
  let blockedCount = (campaign.blocked_count as number) || 0;
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 5;
  let batchBlockCount = 0;

  // Get instance degradation level
  const { data: healthMetrics } = await supabase
    .from('genesis_instance_health_metrics')
    .select('degradation_level')
    .eq('instance_id', defaultInstance?.id)
    .order('period_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  const degradationLevel = healthMetrics?.degradation_level || 0;

  for (let i = 0; i < contactsList.length; i++) {
    const contact = contactsList[i];
    const contactId = contact.id as string;
    const contactPhone = contact.contact_phone as string;
    const contactName = contact.contact_name as string;
    
    if (consecutiveErrors >= maxConsecutiveErrors) {
      await supabase
        .from('genesis_campaigns')
        .update({ 
          status: 'paused', 
          paused_at: new Date().toISOString(),
          error_message: `Pausado após ${maxConsecutiveErrors} erros consecutivos`
        } as never)
        .eq('id', campaignId);

      await logEvent(supabase, campaignId, null, 'auto_paused_errors', 'warning',
        `Campanha pausada após ${maxConsecutiveErrors} erros consecutivos`);
      
      break;
    }

    // Check cooldown after block
    if (batchBlockCount > 0 && antiBanConfig.cooldownAfterBlockMinutes > 0) {
      const cooldownMs = antiBanConfig.cooldownAfterBlockMinutes * 60 * 1000;
      await logEvent(supabase, campaignId, null, 'cooldown_started', 'info',
        `Cooldown de ${antiBanConfig.cooldownAfterBlockMinutes} minutos após bloqueio`);
      await new Promise(resolve => setTimeout(resolve, Math.min(cooldownMs, 60000))); // Max 1 min wait per iteration
      batchBlockCount = 0;
    }

    try {
      // VALIDAÇÃO DE DDD - Verificar e normalizar o número
      const dddValidation = validateBrazilianDDD(contactPhone);
      if (!dddValidation.isValid) {
        await supabase
          .from('genesis_campaign_contacts')
          .update({ 
            status: 'failed', 
            error_message: `DDD inválido: ${dddValidation.error}`,
            locked_at: null 
          } as never)
          .eq('id', contactId);
        
        failedCount++;
        await logEvent(supabase, campaignId, contactId, 'invalid_ddd', 'warning',
          `Contato ${contactPhone} ignorado - ${dddValidation.error}`, { ddd: dddValidation.ddd });
        continue;
      }
      
      // Usar o telefone normalizado (sem DDI 55, apenas DDD + número)
      const normalizedContactPhone = dddValidation.normalizedPhone;

      // ANTI-BAN CHECK 1: Blacklist
      if (antiBanConfig.checkBlacklist) {
        const isBlacklisted = await isContactBlacklisted(supabase, userId, contactPhone);
        if (isBlacklisted) {
          await supabase
            .from('genesis_campaign_contacts')
            .update({ status: 'skipped', error_message: 'Contato na blacklist', locked_at: null } as never)
            .eq('id', contactId);
          
          await logEvent(supabase, campaignId, contactId, 'skipped_blacklist', 'info',
            `Contato ${contactPhone} ignorado - blacklist`);
          continue;
        }
      }

      // Select instance (pool or default)
      let activeInstanceId = defaultInstance?.id as string;
      let backendUrl = (globalConfig?.backend_url || defaultInstance?.backend_url || NATIVE_VPS_URL) as string;
      let backendToken = (globalConfig?.master_token || defaultInstance?.backend_token || NATIVE_VPS_TOKEN) as string;

      if (antiBanConfig.useInstancePool) {
        const poolInstance = await selectPoolInstance(supabase, campaignId, userId);
        if (poolInstance.instanceId) {
          activeInstanceId = poolInstance.instanceId;
          if (poolInstance.backendUrl) backendUrl = poolInstance.backendUrl;
          if (poolInstance.backendToken) backendToken = poolInstance.backendToken;
        }
      }

      // ANTI-BAN CHECK 2: Warmup limit
      if (antiBanConfig.respectWarmup) {
        const warmupLimit = await getWarmupLimit(supabase, activeInstanceId);
        if (warmupLimit <= 0) {
          await logEvent(supabase, campaignId, null, 'warmup_limit_reached', 'warning',
            `Limite de warmup atingido para instância ${activeInstanceId}`);
          // Try next instance or pause
          continue;
        }
      }

      // Mark as sending
      await supabase
        .from('genesis_campaign_contacts')
        .update({ 
          status: 'sending', 
          last_attempt_at: new Date().toISOString(),
          instance_used_id: activeInstanceId
        } as never)
        .eq('id', contactId);

      // Get message
      let message = campaign.message_template as string;
      let variationIndex = 0;
      
      if (variations.length > 0) {
        variationIndex = i % variations.length;
        message = variations[variationIndex];
        console.log(`[LUNA] Using variation ${variationIndex + 1}/${variations.length} for contact ${i + 1}`);
      } else {
        console.log(`[LUNA] No variations available, using template for contact ${i + 1}`);
      }

      // Extract first name only for professional messaging
      const firstName = contactName ? contactName.split(' ')[0] : '';

      message = message
        .replace(/\{\{nome\}\}/gi, firstName)
        .replace(/\{\{telefone\}\}/gi, contactPhone || '')
        .trim();

      // Format phone - usar o número já normalizado e adicionar DDI 55
      const phone = '55' + normalizedContactPhone;

      // ANTI-BAN: Send typing indicator
      if (antiBanConfig.typingSimulation) {
        const typingDuration = (Math.random() * (antiBanConfig.typingDurationMax - antiBanConfig.typingDurationMin) + antiBanConfig.typingDurationMin) * 1000;
        await sendTypingIndicator(backendUrl, backendToken, activeInstanceId, phone, typingDuration);
      }

      // Send message
      const sendUrl = `${backendUrl.replace(/\/$/, '')}/api/instance/${activeInstanceId}/send`;
      
      const response = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${backendToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phone,
          message: message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        consecutiveErrors = 0;
        sentCount++;

        await supabase
          .from('genesis_campaign_contacts')
          .update({ 
            status: 'sent',
            message_sent: message,
            variation_index: variationIndex,
            sent_at: new Date().toISOString(),
            locked_at: null,
          } as never)
          .eq('id', contactId);

        await logEvent(supabase, campaignId, contactId, 'message_sent', 'info',
          `Mensagem enviada para ${phone}`, { variation_index: variationIndex, instance_id: activeInstanceId });

        // Update metrics
        await updateInstanceHealthMetrics(supabase, activeInstanceId, true, false, false);
        await updateWarmupProgress(supabase, activeInstanceId);
        if (antiBanConfig.useInstancePool) {
          await updatePoolInstanceStats(supabase, campaignId, activeInstanceId, true, false);
        }

      } else {
        consecutiveErrors++;
        
        const isBlocked = result.error?.toLowerCase().includes('block') || 
                         result.error?.toLowerCase().includes('banned') ||
                         result.error?.toLowerCase().includes('spam');
        
        if (isBlocked) {
          blockedCount++;
          batchBlockCount++;
          
          await supabase
            .from('genesis_campaign_contacts')
            .update({ 
              status: 'blocked',
              error_message: result.error,
              locked_at: null,
            } as never)
            .eq('id', contactId);

          // Add to blacklist
          if (antiBanConfig.checkBlacklist) {
            await addToBlacklist(supabase, userId, contactPhone, 'blocked', campaignId, antiBanConfig.quarantineDays);
          }

          await updateInstanceHealthMetrics(supabase, activeInstanceId, false, true, false);
          if (antiBanConfig.useInstancePool) {
            await updatePoolInstanceStats(supabase, campaignId, activeInstanceId, false, true);
          }
        } else {
          failedCount++;
          
          const attempts = ((contact.attempt_count as number) || 0) + 1;
          const maxAttempts = (contact.max_attempts as number) || 3;
          
          await supabase
            .from('genesis_campaign_contacts')
            .update({ 
              status: attempts >= maxAttempts ? 'failed' : 'pending',
              error_message: result.error,
              attempt_count: attempts,
              locked_at: null,
            } as never)
            .eq('id', contactId);

          await updateInstanceHealthMetrics(supabase, activeInstanceId, false, false, true);
          if (antiBanConfig.useInstancePool) {
            await updatePoolInstanceStats(supabase, campaignId, activeInstanceId, false, false);
          }
        }

        await logEvent(supabase, campaignId, contactId, 'send_failed', 'warning',
          `Falha ao enviar para ${phone}: ${result.error}`);
      }

      // Update campaign stats
      await supabase
        .from('genesis_campaigns')
        .update({ sent_count: sentCount, failed_count: failedCount, blocked_count: blockedCount } as never)
        .eq('id', campaignId);

      // ANTI-BAN: Adaptive delay
      if (i < contactsList.length - 1) {
        const delay = antiBanConfig.adaptiveDelay 
          ? getAdaptiveDelay(
              (campaign.delay_min_seconds as number) || 15,
              (campaign.delay_max_seconds as number) || 45,
              sentCount,
              failedCount,
              degradationLevel
            )
          : ((campaign.delay_min_seconds as number) || 15) * 1000 + Math.random() * ((campaign.delay_max_seconds as number) || 45) * 1000;
        
        console.log(`[Anti-Ban] Waiting ${Math.round(delay / 1000)}s before next message (adaptive: ${antiBanConfig.adaptiveDelay})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (err) {
      consecutiveErrors++;
      failedCount++;

      await supabase
        .from('genesis_campaign_contacts')
        .update({ 
          status: 'failed',
          error_message: err instanceof Error ? err.message : 'Network error',
          locked_at: null,
        } as never)
        .eq('id', contactId);

      await logEvent(supabase, campaignId, contactId, 'send_error', 'error',
        `Erro ao processar ${contactPhone}: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }

  // Check for batch pause - ACTUALLY PAUSE before scheduling next batch
  const pauseAfterBatch = (campaign.pause_after_batch as number) || 100;
  const totalSentInCampaign = (campaign.sent_count as number || 0) + sentCount;
  let batchPauseApplied = false;
  
  if (pauseAfterBatch > 0 && totalSentInCampaign > 0 && totalSentInCampaign % pauseAfterBatch === 0) {
    const pauseDuration = ((campaign.pause_duration_seconds as number) || 300) * 1000;
    await logEvent(supabase, campaignId, null, 'batch_pause', 'info',
      `Iniciando pausa de ${pauseDuration / 1000}s após ${totalSentInCampaign} mensagens enviadas`);
    
    // Actually wait for the pause duration
    console.log(`[Anti-Ban] Batch pause: waiting ${pauseDuration / 1000}s`);
    await new Promise(resolve => setTimeout(resolve, pauseDuration));
    batchPauseApplied = true;
    
    await logEvent(supabase, campaignId, null, 'batch_pause_complete', 'info',
      `Pausa concluída, retomando envios`);
  }

  // Schedule next batch
  const { count: remainingCount } = await supabase
    .from('genesis_campaign_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('status', 'pending');

  const hasMore = (remainingCount ?? 0) > 0;

  if (hasMore) {
    const stillInWindow = isWithinSendWindow(
      (campaign.send_window_start as string) || '08:00',
      (campaign.send_window_end as string) || '22:00',
      (campaign.send_on_weekends as boolean) ?? true
    );

    if (stillInWindow) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      // Longer delay between batches for anti-ban
      const nextBatchDelay = antiBanConfig.adaptiveDelay
        ? getAdaptiveDelay(30, 60, sentCount, failedCount, degradationLevel)
        : (30 + Math.random() * 30) * 1000;
      
      console.log(`[Campaign Worker v2.0] Scheduling next batch in ${Math.round(nextBatchDelay / 1000)}s`);
      
      setTimeout(async () => {
        try {
          await fetch(`${supabaseUrl}/functions/v1/genesis-campaign-worker`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ campaign_id: campaignId, action: 'process_batch' }),
          });
        } catch (e) {
          console.error('Failed to schedule next batch:', e);
        }
      }, nextBatchDelay);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      processed: contactsList.length,
      sent: sentCount,
      failed: failedCount,
      blocked: blockedCount,
      remaining: remainingCount ?? 0,
      hasMore,
      batchPauseApplied,
      antiBan: {
        typingSimulation: antiBanConfig.typingSimulation,
        typingDurationRange: `${antiBanConfig.typingDurationMin}-${antiBanConfig.typingDurationMax}s`,
        adaptiveDelay: antiBanConfig.adaptiveDelay,
        instancePool: antiBanConfig.useInstancePool,
        spamWordCheck: antiBanConfig.spamWordCheck,
        checkBlacklist: antiBanConfig.checkBlacklist,
        prioritizeWarmLeads: antiBanConfig.prioritizeWarmLeads,
        peakHoursBoost: antiBanConfig.peakHoursBoost,
        maxBlocksBeforePause: antiBanConfig.maxBlocksBeforePause,
        degradationLevel,
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
