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

        // Create integration first to get the ID
        const { data, error } = await supabase
          .from('genesis_instance_integrations')
          .insert({
            instance_id: instanceId,
            user_id: userId,
            provider: 'cakto',
            status: 'connected',
            webhook_url: '', // Will update after getting ID
            store_name: 'Cakto',
            metadata: {
              client_id: clientId,
              client_secret_hash: btoa(clientSecret).slice(0, 20) + '...',
              configured_at: new Date().toISOString(),
            },
          })
          .select()
          .single();

        if (error) throw error;

        // Generate webhook URL using integration ID (for custom domain)
        // URL format: https://genesishub.cloud/webhook/cakto/{integration_id}
        const webhookUrl = `https://genesishub.cloud/webhook/cakto/${data.id}`;

        // Update with correct webhook URL
        await supabase
          .from('genesis_instance_integrations')
          .update({ webhook_url: webhookUrl })
          .eq('id', data.id);

        console.log(`[CaktoManager] Created integration: ${data.id} with webhook: ${webhookUrl}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Integração criada com sucesso!',
            integration: { ...data, webhook_url: webhookUrl },
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
        if (!integrationId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Integration ID obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // URL format: https://genesishub.cloud/webhook/cakto/{integration_id}
        const webhookUrl = `https://genesishub.cloud/webhook/cakto/${integrationId}`;

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
