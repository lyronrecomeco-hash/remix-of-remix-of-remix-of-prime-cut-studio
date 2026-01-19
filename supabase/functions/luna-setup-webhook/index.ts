import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================================
// LUNA WEBHOOK SETUP
// Configura automaticamente o webhook para a Luna no Evolution API
// =====================================================

const ADMIN_EMAIL = "lyronrp@gmail.com";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[Luna Setup] Starting webhook configuration...');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar configuração do backend
    const { data: globalConfig } = await supabase
      .from('whatsapp_backend_config')
      .select('backend_url, master_token')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Buscar verificação config como fallback
    const { data: verificationConfig } = await supabase
      .from('verification_config')
      .select('config_value')
      .eq('config_type', 'phone_verification')
      .maybeSingle();

    const configValue = verificationConfig?.config_value as any;
    
    const backendUrl = globalConfig?.backend_url || configValue?.backend_url || 'http://72.62.108.24:3000';
    const backendToken = globalConfig?.master_token || configValue?.backend_token || 'genesis-master-token-2024-secure';
    const instanceId = configValue?.instance_id || '05d8dc41-85f6-4fbb-bb12-7d82534e10cf';

    console.log('[Luna Setup] Config found:', { backendUrl, instanceId: instanceId?.substring(0, 8) + '...' });

    const cleanBackendUrl = String(backendUrl).replace(/\/$/, '');
    const lunaWebhookUrl = `${supabaseUrl}/functions/v1/luna-whatsapp-assistant`;

    // Webhook configuration para Evolution API
    const webhookConfig = {
      enabled: true,
      url: lunaWebhookUrl,
      webhookByEvents: true,
      webhookBase64: false,
      events: [
        'messages.upsert',
        'messages.update',
        'connection.update',
        'groups.upsert'
      ]
    };

    console.log('[Luna Setup] Webhook URL:', lunaWebhookUrl);
    console.log('[Luna Setup] Configuring webhook for instance:', instanceId);

    // Tentar configurar webhook em diferentes endpoints Evolution API
    const endpoints = [
      // Evolution API v2
      `/webhook/set/${instanceId}`,
      `/instance/setWebhook/${instanceId}`,
      // Evolution API v1
      `/instance/${instanceId}/webhook`,
      `/webhook/${instanceId}`,
    ];

    let webhookConfigured = false;
    let lastError = '';

    for (const endpoint of endpoints) {
      try {
        console.log(`[Luna Setup] Trying endpoint: ${endpoint}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(`${cleanBackendUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': backendToken,
            'Authorization': `Bearer ${backendToken}`,
          },
          body: JSON.stringify(webhookConfig),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseText = await response.text();
        console.log(`[Luna Setup] Response from ${endpoint}: ${response.status} - ${responseText.substring(0, 200)}`);

        if (response.ok || response.status === 201) {
          webhookConfigured = true;
          console.log('[Luna Setup] ✅ Webhook configured successfully!');
          break;
        }

        if (response.status !== 404) {
          lastError = `${response.status}: ${responseText.substring(0, 200)}`;
        }
      } catch (e: any) {
        console.warn(`[Luna Setup] Endpoint ${endpoint} failed:`, e.message);
        lastError = e.message;
        continue;
      }
    }

    // Também tentar configurar via PUT
    if (!webhookConfigured) {
      for (const endpoint of endpoints) {
        try {
          console.log(`[Luna Setup] Trying PUT on: ${endpoint}`);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          const response = await fetch(`${cleanBackendUrl}${endpoint}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'apikey': backendToken,
              'Authorization': `Bearer ${backendToken}`,
            },
            body: JSON.stringify(webhookConfig),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            webhookConfigured = true;
            console.log('[Luna Setup] ✅ Webhook configured via PUT!');
            break;
          }
        } catch (e: any) {
          continue;
        }
      }
    }

    // Salvar configuração da Luna no banco
    await supabase.from('owner_settings').upsert({
      setting_key: 'luna_webhook_config',
      setting_value: {
        webhook_url: lunaWebhookUrl,
        instance_id: instanceId,
        backend_url: backendUrl,
        configured_at: new Date().toISOString(),
        status: webhookConfigured ? 'active' : 'pending_manual',
      },
      description: 'Configuração do webhook da Luna para WhatsApp'
    }, { onConflict: 'setting_key' });

    // Log do evento
    await supabase.from('genesis_event_logs').insert({
      instance_id: instanceId,
      event_type: 'luna_webhook_setup',
      severity: webhookConfigured ? 'info' : 'warning',
      message: webhookConfigured 
        ? '✅ Webhook da Luna configurado automaticamente'
        : '⚠️ Webhook da Luna precisa de configuração manual',
      details: {
        webhook_url: lunaWebhookUrl,
        backend_url: backendUrl,
        status: webhookConfigured ? 'configured' : 'manual_required',
        error: lastError || null
      }
    });

    // Se não conseguiu automaticamente, dar instruções
    if (!webhookConfigured) {
      return new Response(
        JSON.stringify({
          success: false,
          status: 'manual_required',
          message: 'Configuração automática não disponível. Configure manualmente.',
          instructions: {
            step1: 'Acesse o painel do Evolution API',
            step2: `Configure o webhook para: ${lunaWebhookUrl}`,
            step3: 'Habilite os eventos: messages.upsert, messages.update',
            webhook_url: lunaWebhookUrl,
            instance_id: instanceId,
          },
          error: lastError
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: 'configured',
        message: '✅ Webhook da Luna configurado com sucesso!',
        webhook_url: lunaWebhookUrl,
        instance_id: instanceId,
        events: webhookConfig.events
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Luna Setup] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
