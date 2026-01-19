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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[Luna Setup] Starting webhook configuration...');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar instância conectada
    const { data: connectedInstance } = await supabase
      .from('genesis_instances')
      .select('id, name, backend_url, backend_token')
      .eq('status', 'connected')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!connectedInstance) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nenhuma instância conectada encontrada' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const instanceId = connectedInstance.id;
    const instanceName = connectedInstance.name || 'Genesis';
    const backendUrl = connectedInstance.backend_url || 'http://72.62.108.24:3000';
    const backendToken = connectedInstance.backend_token || 'genesis-master-token-2024-secure';

    console.log('[Luna Setup] Connected instance:', { instanceId, instanceName, backendUrl });

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

    // Tentar configurar webhook em TODOS os endpoints possíveis da Evolution API
    const endpoints = [
      // Evolution API v2 - com nome da instância
      `/webhook/set/${instanceName}`,
      `/instance/setWebhook/${instanceName}`,
      `/webhook/${instanceName}/set`,
      // Evolution API v2 - com ID
      `/webhook/set/${instanceId}`,
      `/instance/setWebhook/${instanceId}`,
      // Evolution API v1
      `/instance/${instanceName}/webhook`,
      `/instance/${instanceId}/webhook`,
      `/webhook/${instanceId}`,
      `/webhook/${instanceName}`,
      // Outros formatos
      `/${instanceName}/webhook/set`,
      `/${instanceId}/webhook/set`,
    ];

    let webhookConfigured = false;
    let lastError = '';
    let successEndpoint = '';

    // Tentar POST primeiro
    for (const endpoint of endpoints) {
      try {
        console.log(`[Luna Setup] POST ${endpoint}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

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
        console.log(`[Luna Setup] Response: ${response.status}`);

        if (response.ok || response.status === 201) {
          webhookConfigured = true;
          successEndpoint = endpoint;
          console.log('[Luna Setup] ✅ Webhook configured!');
          break;
        }

        if (response.status !== 404 && response.status !== 405) {
          lastError = `${response.status}: ${responseText.substring(0, 100)}`;
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.warn(`[Luna Setup] ${endpoint} failed:`, e.message);
        }
        continue;
      }
    }

    // Se POST não funcionou, tentar PUT
    if (!webhookConfigured) {
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

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
            successEndpoint = endpoint;
            break;
          }
        } catch {
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
        instance_name: instanceName,
        backend_url: backendUrl,
        configured_at: new Date().toISOString(),
        success_endpoint: successEndpoint || null,
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
        : '⚠️ Configuração manual necessária - servidor Evolution pode estar offline',
      details: {
        webhook_url: lunaWebhookUrl,
        backend_url: backendUrl,
        instance_name: instanceName,
        success_endpoint: successEndpoint || null,
        status: webhookConfigured ? 'configured' : 'manual_required',
        error: lastError || null
      }
    });

    // Resposta
    if (webhookConfigured) {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'configured',
          message: '✅ Webhook da Luna configurado com sucesso!',
          webhook_url: lunaWebhookUrl,
          instance_id: instanceId,
          instance_name: instanceName,
          endpoint_used: successEndpoint,
          events: webhookConfig.events
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        status: 'manual_required',
        message: 'Servidor Evolution não respondeu. Configure manualmente:',
        instructions: {
          step1: `Acesse: ${backendUrl}`,
          step2: `Instância: ${instanceName}`,
          step3: `Configure webhook URL: ${lunaWebhookUrl}`,
          step4: 'Eventos: messages.upsert, messages.update, groups.upsert',
        },
        webhook_url: lunaWebhookUrl,
        instance_id: instanceId,
        instance_name: instanceName,
        error: lastError || 'Servidor não respondeu'
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
