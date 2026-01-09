import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * GENESIS CAMPAIGN WORKER - Enterprise Mass Sending
 * 
 * Features:
 * - Anti-ban with intelligent delays
 * - Luna AI message variations
 * - Batch processing with pauses
 * - Send window enforcement
 * - Deduplication
 * - Real-time progress tracking
 * - Native VPS fallback
 */

// NATIVE VPS CONFIGURATION - Fallback always works
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

// Random delay with jitter
function getRandomDelay(min: number, max: number): number {
  const base = Math.floor(Math.random() * (max - min + 1) + min) * 1000;
  const jitter = Math.floor(Math.random() * 2000);
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
    
    console.log(`[Campaign Worker] Action: ${action}, Campaign ID: ${campaign_id}`);

    // Validate campaign_id
    if (!campaign_id || typeof campaign_id !== 'string') {
      console.error('Invalid campaign_id:', campaign_id);
      return new Response(
        JSON.stringify({ success: false, error: 'campaign_id inválido ou ausente' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(campaign_id)) {
      console.error('Invalid UUID format:', campaign_id);
      return new Response(
        JSON.stringify({ success: false, error: 'Formato de campaign_id inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('genesis_campaigns')
      .select(`
        *,
        instance:genesis_instances(id, name, backend_url, backend_token, orchestrated_status)
      `)
      .eq('id', campaign_id)
      .single();

    if (campaignError) {
      console.error('Campaign query error:', campaignError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: campaignError.code === 'PGRST116' 
            ? 'Campanha não encontrada' 
            : `Erro ao buscar campanha: ${campaignError.message}`,
          details: campaignError
        }),
        { status: campaignError.code === 'PGRST116' ? 404 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!campaign) {
      console.error('Campaign not found for ID:', campaign_id);
      return new Response(
        JSON.stringify({ success: false, error: 'Campanha não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Campaign Worker] Found campaign: ${campaign.name}, status: ${campaign.status}`);

    // Handle different actions
    switch (action) {
      case 'start':
        return await handleStart(supabase, campaign);
      case 'pause':
        return await handlePause(supabase, campaign);
      case 'resume':
        return await handleStart(supabase, campaign);
      case 'cancel':
        return await handleCancel(supabase, campaign);
      case 'process_batch':
        return await processBatch(supabase, campaign, batch_size);
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

// Start or resume campaign
async function handleStart(supabase: SupabaseClient, campaign: Record<string, unknown>) {
  const instance = campaign.instance as Record<string, unknown>;
  const campaignId = campaign.id as string;
  
  // Validate instance is connected
  if (instance?.orchestrated_status !== 'connected') {
    await logEvent(supabase, campaignId, null, 'start_failed', 'error', 
      'Instância não está conectada', { status: instance?.orchestrated_status });
    return new Response(
      JSON.stringify({ success: false, error: 'Instância WhatsApp não está conectada' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check send window
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

  // Update campaign status
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
    'Campanha iniciada', { total_contacts: campaign.total_contacts });

  // Process first batch immediately
  const result = await processBatch(supabase, campaign, (campaign.batch_size as number) || 10);
  return result;
}

// Pause campaign
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

// Cancel campaign
async function handleCancel(supabase: SupabaseClient, campaign: Record<string, unknown>) {
  const campaignId = campaign.id as string;
  
  await supabase
    .from('genesis_campaigns')
    .update({ 
      status: 'cancelled',
      completed_at: new Date().toISOString(),
    } as never)
    .eq('id', campaignId);

  // Reset pending contacts to skipped
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

// Process a batch of contacts
async function processBatch(
  supabase: SupabaseClient, 
  campaign: Record<string, unknown>,
  batchSize: number
) {
  const instance = campaign.instance as Record<string, unknown>;
  const campaignId = campaign.id as string;
  
  // Re-check status
  const { data: currentCampaign } = await supabase
    .from('genesis_campaigns')
    .select('status')
    .eq('id', campaignId)
    .single();

  if ((currentCampaign as Record<string, unknown>)?.status !== 'running') {
    return new Response(
      JSON.stringify({ success: false, message: 'Campanha não está em execução' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check send window again
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

  // Get pending contacts
  const { data: contacts, error: contactsError } = await supabase
    .from('genesis_campaign_contacts')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('status', 'pending')
    .is('locked_at', null)
    .limit(batchSize);

  const contactsList = (contacts || []) as Array<Record<string, unknown>>;

  if (contactsError || contactsList.length === 0) {
    // Check if campaign is complete
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

  // Get Luna variations if enabled
  let variations: string[] = [];
  if (campaign.luna_enabled && Array.isArray(campaign.luna_generated_variations)) {
    variations = campaign.luna_generated_variations as string[];
  }

  // Build Backend API URL with native fallback - ALWAYS works
  const { data: globalConfig } = await supabase
    .from('whatsapp_backend_config')
    .select('backend_url, master_token')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Priority: Global Config > Instance Config > Native VPS (always works)
  const backendUrl = (globalConfig?.backend_url || instance?.backend_url || NATIVE_VPS_URL) as string;
  const backendToken = (globalConfig?.master_token || instance?.backend_token || NATIVE_VPS_TOKEN) as string;
  const instanceId = instance?.id as string;

  const configSource = globalConfig?.backend_url 
    ? 'global' 
    : instance?.backend_url 
      ? 'instance' 
      : 'native';

  console.log(`[Campaign Worker] Backend config source: ${configSource}, URL: ${backendUrl.slice(0, 30)}...`);

  // Process each contact
  let sentCount = (campaign.sent_count as number) || 0;
  let failedCount = (campaign.failed_count as number) || 0;
  let blockedCount = (campaign.blocked_count as number) || 0;
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 5;

  for (let i = 0; i < contactsList.length; i++) {
    const contact = contactsList[i];
    const contactId = contact.id as string;
    const contactPhone = contact.contact_phone as string;
    const contactName = contact.contact_name as string;
    
    // Check for too many consecutive errors
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

    try {
      // Mark as sending
      await supabase
        .from('genesis_campaign_contacts')
        .update({ status: 'sending', last_attempt_at: new Date().toISOString() } as never)
        .eq('id', contactId);

      // Get message (use variation if available)
      let message = campaign.message_template as string;
      let variationIndex = 0;
      
      if (variations.length > 0) {
        variationIndex = i % variations.length;
        message = variations[variationIndex];
      }

      // Replace variables
      message = message
        .replace(/\{\{nome\}\}/gi, contactName || '')
        .replace(/\{\{telefone\}\}/gi, contactPhone || '')
        .trim();

      // Format phone
      let phone = contactPhone.replace(/\D/g, '');
      if (!phone.startsWith('55') && phone.length <= 11) {
        phone = '55' + phone;
      }

      // Send via Backend
      const sendUrl = `${backendUrl.replace(/\/$/, '')}/api/instance/${instanceId}/send`;
      
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
          `Mensagem enviada para ${phone}`, { variation_index: variationIndex });

      } else {
        consecutiveErrors++;
        
        // Check if blocked
        const isBlocked = result.error?.toLowerCase().includes('block') || 
                         result.error?.toLowerCase().includes('banned');
        
        if (isBlocked) {
          blockedCount++;
          await supabase
            .from('genesis_campaign_contacts')
            .update({ 
              status: 'blocked',
              error_message: result.error,
              locked_at: null,
            } as never)
            .eq('id', contactId);
        } else {
          failedCount++;
          
          // Increment attempt count
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
        }

        await logEvent(supabase, campaignId, contactId, 'send_failed', 'warning',
          `Falha ao enviar para ${phone}: ${result.error}`);
      }

      // Update campaign stats
      await supabase
        .from('genesis_campaigns')
        .update({ sent_count: sentCount, failed_count: failedCount, blocked_count: blockedCount } as never)
        .eq('id', campaignId);

      // Apply delay between messages (not after last)
      if (i < contactsList.length - 1) {
        const delay = getRandomDelay(
          (campaign.delay_min_seconds as number) || 10,
          (campaign.delay_max_seconds as number) || 30
        );
        console.log(`Waiting ${delay / 1000}s before next message`);
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

  // Check if should pause after batch
  const pauseAfterBatch = (campaign.pause_after_batch as number) || 100;
  if (sentCount > 0 && sentCount % pauseAfterBatch === 0) {
    const pauseDuration = ((campaign.pause_duration_seconds as number) || 300) * 1000;
    await logEvent(supabase, campaignId, null, 'batch_pause', 'info',
      `Pausa de ${pauseDuration / 1000}s após ${pauseAfterBatch} mensagens`);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      processed: contactsList.length,
      sent: sentCount,
      failed: failedCount,
      blocked: blockedCount,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
