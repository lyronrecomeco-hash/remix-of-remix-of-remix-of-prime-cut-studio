import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple encryption for API keys (XOR with a secret key)
function encryptApiKey(apiKey: string, userId: string): string {
  const secret = `${userId}-genesis-gateway-2024`;
  let result = '';
  for (let i = 0; i < apiKey.length; i++) {
    result += String.fromCharCode(apiKey.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
  }
  return btoa(result);
}

function decryptApiKey(encrypted: string, userId: string): string {
  const secret = `${userId}-genesis-gateway-2024`;
  const decoded = atob(encrypted);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin (lyronrp@gmail.com)
    if (user.email !== 'lyronrp@gmail.com') {
      return new Response(
        JSON.stringify({ error: 'Acesso negado' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { gateway, apiKey, sandboxMode } = body;

    if (!gateway || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Gateway e API Key são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['abacatepay', 'asaas'].includes(gateway)) {
      return new Response(
        JSON.stringify({ error: 'Gateway inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Saving ${gateway} API key for user:`, user.id);

    // Test the API key first
    let isValid = false;

    if (gateway === 'asaas') {
      const baseUrl = sandboxMode 
        ? 'https://api-sandbox.asaas.com/v3' 
        : 'https://api.asaas.com/v3';

      try {
        const testResponse = await fetch(`${baseUrl}/customers?limit=1`, {
          headers: {
            'access_token': apiKey,
            'Content-Type': 'application/json',
          },
        });

        isValid = testResponse.ok;
        if (!isValid) {
          const errorData = await testResponse.json();
          console.log('Asaas API test failed:', errorData);
        }
      } catch (e) {
        console.error('Asaas API test error:', e);
      }
    } else if (gateway === 'abacatepay') {
      try {
        const testResponse = await fetch('https://api.abacatepay.com/v1/billing/list', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        isValid = testResponse.ok;
        if (!isValid) {
          const errorData = await testResponse.json();
          console.log('AbacatePay API test failed:', errorData);
        }
      } catch (e) {
        console.error('AbacatePay API test error:', e);
      }
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'API Key inválida ou não autorizada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`${gateway} API key validated successfully`);

    // Encrypt the API key for storage
    const encryptedKey = encryptApiKey(apiKey, user.id);

    // Upsert the gateway config with encrypted API key
    const { error: upsertError } = await supabase
      .from('checkout_gateway_config')
      .upsert({
        user_id: user.id,
        gateway,
        api_key_configured: true,
        sandbox_mode: sandboxMode ?? false,
        asaas_access_token_hash: encryptedKey, // Store encrypted key here
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,gateway',
      });

    if (upsertError) {
      console.error('Error upserting config:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar configuração' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`${gateway} configuration saved successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Configuração salva com sucesso!',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
