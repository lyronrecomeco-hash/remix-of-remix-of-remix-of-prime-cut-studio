import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * CAKTO INTEGRATION MANAGER
 * 
 * Manages Cakto integration lifecycle:
 * - Create/Update/Delete integrations
 * - Test credentials
 * - Generate webhook URLs
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { action, instanceId, userId, clientId, clientSecret, integrationId } = body;

    console.log(`[CaktoManager] Action: ${action}, Instance: ${instanceId}`);

    switch (action) {
      case 'test': {
        // Test Cakto API credentials
        if (!clientId || !clientSecret) {
          return new Response(
            JSON.stringify({ success: false, error: 'Client ID e Client Secret são obrigatórios' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // For now, validate credentials format (actual API test would require Cakto endpoint)
        // Cakto credentials are typically UUIDs or alphanumeric strings
        const isValidFormat = clientId.length >= 10 && clientSecret.length >= 10;
        
        if (!isValidFormat) {
          return new Response(
            JSON.stringify({ success: false, error: 'Credenciais inválidas. Verifique o formato.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // TODO: When Cakto provides a test endpoint, implement actual validation
        // For now, accept valid-looking credentials
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Credenciais válidas! Configure o webhook na Cakto.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create': {
        if (!instanceId || !userId || !clientId || !clientSecret) {
          return new Response(
            JSON.stringify({ success: false, error: 'Dados incompletos' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if integration already exists
        const { data: existing } = await supabase
          .from('genesis_instance_integrations')
          .select('id')
          .eq('instance_id', instanceId)
          .eq('provider', 'cakto')
          .maybeSingle();

        if (existing) {
          return new Response(
            JSON.stringify({ success: false, error: 'Integração Cakto já existe. Use atualizar.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate webhook URL
        const webhookUrl = `${supabaseUrl}/functions/v1/cakto-webhook/${instanceId}`;

        // Create integration
        const { data, error } = await supabase
          .from('genesis_instance_integrations')
          .insert({
            instance_id: instanceId,
            user_id: userId,
            provider: 'cakto',
            status: 'connected',
            webhook_url: webhookUrl,
            store_name: 'Cakto',
            metadata: {
              client_id: clientId,
              // Store encrypted secret in production
              client_secret_hash: btoa(clientSecret).slice(0, 20) + '...',
              configured_at: new Date().toISOString(),
            },
          })
          .select()
          .single();

        if (error) throw error;

        console.log(`[CaktoManager] Created integration: ${data.id}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Integração criada com sucesso!',
            integration: data,
            webhookUrl,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        if (!integrationId || !clientId || !clientSecret) {
          return new Response(
            JSON.stringify({ success: false, error: 'Dados incompletos' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('genesis_instance_integrations')
          .update({
            status: 'connected',
            error_message: null,
            metadata: {
              client_id: clientId,
              client_secret_hash: btoa(clientSecret).slice(0, 20) + '...',
              updated_at: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', integrationId)
          .select()
          .single();

        if (error) throw error;

        console.log(`[CaktoManager] Updated integration: ${integrationId}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Integração atualizada!',
            integration: data,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        if (!integrationId) {
          return new Response(
            JSON.stringify({ success: false, error: 'ID da integração obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('genesis_instance_integrations')
          .delete()
          .eq('id', integrationId);

        if (error) throw error;

        console.log(`[CaktoManager] Deleted integration: ${integrationId}`);

        return new Response(
          JSON.stringify({ success: true, message: 'Integração removida!' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_webhook_url': {
        if (!instanceId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Instance ID obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const webhookUrl = `${supabaseUrl}/functions/v1/cakto-webhook/${instanceId}`;

        return new Response(
          JSON.stringify({ success: true, webhookUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Ação desconhecida: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[CaktoManager] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
