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
    const { gateway, apiKey, sandboxMode, clientId, clientSecret } = body;

    if (!gateway) {
      return new Response(
        JSON.stringify({ error: 'Gateway é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['abacatepay', 'asaas', 'misticpay'].includes(gateway)) {
      return new Response(
        JSON.stringify({ error: 'Gateway inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields based on gateway
    if (gateway === 'misticpay') {
      if (!clientId || !clientSecret) {
        return new Response(
          JSON.stringify({ error: 'Client ID e Client Secret são obrigatórios para MisticPay' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'API Key é obrigatória' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Saving ${gateway} credentials for user:`, user.id);

    // Test the API key/credentials first
    let isValid = false;

    if (gateway === 'misticpay') {
      try {
        // Test MisticPay credentials by checking balance
        const testResponse = await fetch('https://api.misticpay.com/api/users/balance', {
          headers: {
            'ci': clientId,
            'cs': clientSecret,
            'Content-Type': 'application/json',
          },
        });

        isValid = testResponse.ok;
        if (!isValid) {
          const errorData = await testResponse.json();
          console.log('MisticPay API test failed:', errorData);
        }
      } catch (e) {
        console.error('MisticPay API test error:', e);
      }
    } else if (gateway === 'asaas') {
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
        JSON.stringify({ error: 'Credenciais inválidas ou não autorizadas' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`${gateway} credentials validated successfully`);

    // Prepare upsert data based on gateway
    const upsertData: Record<string, unknown> = {
      user_id: user.id,
      gateway,
      api_key_configured: true,
      sandbox_mode: sandboxMode ?? false,
      updated_at: new Date().toISOString(),
    };

    if (gateway === 'misticpay') {
      upsertData.misticpay_client_id_hash = encryptApiKey(clientId, user.id);
      upsertData.misticpay_client_secret_hash = encryptApiKey(clientSecret, user.id);
      upsertData.asaas_access_token_hash = null;
    } else {
      upsertData.asaas_access_token_hash = encryptApiKey(apiKey, user.id);
      upsertData.misticpay_client_id_hash = null;
      upsertData.misticpay_client_secret_hash = null;
    }

    // Upsert the gateway config
    const { error: upsertError } = await supabase
      .from('checkout_gateway_config')
      .upsert(upsertData, {
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
