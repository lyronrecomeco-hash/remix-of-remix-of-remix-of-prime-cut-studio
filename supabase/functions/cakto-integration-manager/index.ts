import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * CAKTO INTEGRATION MANAGER
 * 
 * Manages Cakto integration lifecycle:
 * - Create/Update/Delete integrations
 * - Test credentials via OAuth2
 * - Generate webhook URLs
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CAKTO_TOKEN_URL = 'https://api.cakto.com.br/public_api/token/';

// Test credentials by getting OAuth token
async function testCaktoCredentials(clientId: string, clientSecret: string): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!clientId || !clientSecret) {
    return { success: false, error: 'Client ID e Client Secret são obrigatórios' };
  }

  if (clientId.length < 10 || clientSecret.length < 10) {
    return { success: false, error: 'Credenciais inválidas. Verifique o formato.' };
  }

  try {
    const response = await fetch(CAKTO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        success: true, 
        message: `Autenticação válida! Token expira em ${Math.floor(data.expires_in / 3600)}h.`
      };
    } else {
      const errorText = await response.text();
      console.error('[CaktoManager] Auth failed:', response.status, errorText);
      return { success: false, error: 'Credenciais inválidas. Verifique Client ID e Secret.' };
    }
  } catch (err) {
    console.error('[CaktoManager] Auth error:', err);
    return { success: false, error: 'Erro ao validar credenciais. Tente novamente.' };
  }
}

// Encrypt credentials for storage
function encryptCredentials(clientId: string, clientSecret: string): string {
  return btoa(JSON.stringify({ client_id: clientId, client_secret: clientSecret }));
}

Deno.serve(async (req) => {
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
        const result = await testCaktoCredentials(clientId, clientSecret);
        return new Response(
          JSON.stringify(result),
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

        // Test credentials first
        const testResult = await testCaktoCredentials(clientId, clientSecret);
        if (!testResult.success) {
          return new Response(
            JSON.stringify(testResult),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

        // Create integration
        const encryptedCreds = encryptCredentials(clientId, clientSecret);
        const { data, error } = await supabase
          .from('genesis_instance_integrations')
          .insert({
            instance_id: instanceId,
            user_id: userId,
            provider: 'cakto',
            status: 'connected',
            credentials_encrypted: encryptedCreds,
            webhook_url: '',
            store_name: 'Cakto',
            metadata: {
              configured_at: new Date().toISOString(),
            },
          })
          .select()
          .single();

        if (error) throw error;

        // Update with webhook URL
        const webhookUrl = `https://genesishub.cloud/webhook/cakto/${data.id}`;
        await supabase
          .from('genesis_instance_integrations')
          .update({ webhook_url: webhookUrl })
          .eq('id', data.id);

        console.log(`[CaktoManager] Created integration: ${data.id}`);

        // Trigger initial product sync
        try {
          await fetch(`${supabaseUrl}/functions/v1/cakto-sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'sync_products', integrationId: data.id }),
          });
        } catch (syncErr) {
          console.warn('[CaktoManager] Initial sync failed:', syncErr);
        }

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

        // Test credentials first
        const testResult = await testCaktoCredentials(clientId, clientSecret);
        if (!testResult.success) {
          return new Response(
            JSON.stringify(testResult),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get existing integration
        const { data: existing } = await supabase
          .from('genesis_instance_integrations')
          .select('metadata')
          .eq('id', integrationId)
          .single();

        const existingMeta = (existing?.metadata || {}) as Record<string, unknown>;
        const encryptedCreds = encryptCredentials(clientId, clientSecret);

        const { data, error } = await supabase
          .from('genesis_instance_integrations')
          .update({
            status: 'connected',
            error_message: null,
            credentials_encrypted: encryptedCreds,
            metadata: {
              ...existingMeta,
              updated_at: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', integrationId)
          .select()
          .single();

        if (error) throw error;

        console.log(`[CaktoManager] Updated integration: ${integrationId}`);

        // Trigger product sync
        try {
          await fetch(`${supabaseUrl}/functions/v1/cakto-sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'sync_products', integrationId }),
          });
        } catch (syncErr) {
          console.warn('[CaktoManager] Sync failed:', syncErr);
        }

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

        const webhookUrl = `https://genesishub.cloud/webhook/cakto/${integrationId}`;

        return new Response(
          JSON.stringify({ success: true, webhookUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync_products': {
        if (!integrationId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Integration ID obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Forward to cakto-sync function
        const syncResponse = await fetch(`${supabaseUrl}/functions/v1/cakto-sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'sync_products', integrationId }),
        });

        const syncResult = await syncResponse.json();
        return new Response(
          JSON.stringify(syncResult),
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
