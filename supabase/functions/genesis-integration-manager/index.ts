import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * GENESIS INTEGRATION MANAGER
 * 
 * Handles:
 * - Test connections to e-commerce platforms
 * - Save/update integrations with encrypted credentials
 * - Register webhooks
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IntegrationRequest {
  action: 'test' | 'create' | 'update' | 'sync';
  provider: string;
  instanceId?: string;
  userId?: string;
  credentials?: Record<string, string>;
  storeUrl?: string;
  storeName?: string;
}

// Encrypt credentials (basic encoding - in production use proper encryption)
function encryptCredentials(credentials: Record<string, string>): string {
  return btoa(JSON.stringify(credentials));
}

// Test Shopify connection
async function testShopify(credentials: Record<string, string>): Promise<{ success: boolean; message?: string; error?: string }> {
  const { store_name, access_token } = credentials;
  
  if (!store_name || !access_token) {
    return { success: false, error: 'store_name e access_token são obrigatórios' };
  }

  // Normalize store URL
  const storeUrl = store_name.includes('.myshopify.com') 
    ? store_name 
    : `${store_name}.myshopify.com`;

  try {
    const response = await fetch(`https://${storeUrl}/admin/api/2024-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: `Conectado: ${data.shop?.name || storeUrl}` };
    } else {
      const error = await response.text();
      return { success: false, error: `Erro ${response.status}: ${error}` };
    }
  } catch (err) {
    return { success: false, error: `Erro de conexão: ${err}` };
  }
}

// Test WooCommerce connection
async function testWooCommerce(credentials: Record<string, string>): Promise<{ success: boolean; message?: string; error?: string }> {
  const { store_url, consumer_key, consumer_secret } = credentials;
  
  if (!store_url || !consumer_key || !consumer_secret) {
    return { success: false, error: 'store_url, consumer_key e consumer_secret são obrigatórios' };
  }

  const url = store_url.replace(/\/$/, '');
  
  try {
    const authString = btoa(`${consumer_key}:${consumer_secret}`);
    const response = await fetch(`${url}/wp-json/wc/v3/system_status`, {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: `Conectado: WooCommerce ${data.environment?.version || ''}` };
    } else {
      return { success: false, error: `Erro ${response.status}` };
    }
  } catch (err) {
    return { success: false, error: `Erro de conexão: ${err}` };
  }
}

// Test Nuvemshop connection
async function testNuvemshop(credentials: Record<string, string>): Promise<{ success: boolean; message?: string; error?: string }> {
  const { store_id, access_token } = credentials;
  
  if (!store_id || !access_token) {
    return { success: false, error: 'store_id e access_token são obrigatórios' };
  }

  try {
    const response = await fetch(`https://api.tiendanube.com/v1/${store_id}/store`, {
      headers: {
        'Authentication': `bearer ${access_token}`,
        'User-Agent': 'Genesis WhatsApp (contato@genesis.com.br)',
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: `Conectado: ${data.name?.pt || data.name?.es || 'Loja'}` };
    } else {
      return { success: false, error: `Erro ${response.status}` };
    }
  } catch (err) {
    return { success: false, error: `Erro de conexão: ${err}` };
  }
}

// Test Mercado Shops connection
async function testMercadoShops(credentials: Record<string, string>): Promise<{ success: boolean; message?: string; error?: string }> {
  const { access_token } = credentials;
  
  if (!access_token) {
    return { success: false, error: 'access_token é obrigatório' };
  }

  try {
    const response = await fetch('https://api.mercadolibre.com/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: `Conectado: ${data.nickname || data.id}` };
    } else {
      return { success: false, error: `Erro ${response.status}: Token inválido ou expirado` };
    }
  } catch (err) {
    return { success: false, error: `Erro de conexão: ${err}` };
  }
}

// Test RD Station connection
async function testRDStation(credentials: Record<string, string>): Promise<{ success: boolean; message?: string; error?: string }> {
  const { access_token } = credentials;
  
  if (!access_token) {
    return { success: false, error: 'access_token é obrigatório' };
  }

  try {
    const response = await fetch('https://api.rd.services/marketing/account_info', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: `Conectado: ${data.name || 'Conta RD Station'}` };
    } else {
      return { success: false, error: `Erro ${response.status}: Token inválido ou expirado` };
    }
  } catch (err) {
    return { success: false, error: `Erro de conexão: ${err}` };
  }
}

// Test connection based on provider
async function testConnection(provider: string, credentials: Record<string, string>) {
  switch (provider) {
    case 'shopify':
      return testShopify(credentials);
    case 'woocommerce':
      return testWooCommerce(credentials);
    case 'nuvemshop':
      return testNuvemshop(credentials);
    case 'mercadoshops':
      return testMercadoShops(credentials);
    case 'rdstation':
      return testRDStation(credentials);
    default:
      return { success: false, error: `Provider não suportado: ${provider}` };
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
    const body: IntegrationRequest = await req.json();
    const { action, provider, instanceId, userId, credentials, storeUrl, storeName } = body;

    console.log(`[Integration Manager] Action: ${action}, Provider: ${provider}`);

    switch (action) {
      case 'test': {
        if (!provider || !credentials) {
          return new Response(
            JSON.stringify({ success: false, error: 'provider e credentials são obrigatórios' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await testConnection(provider, credentials);
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create': {
        if (!provider || !instanceId || !userId || !credentials) {
          return new Response(
            JSON.stringify({ success: false, error: 'Dados incompletos' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Test connection first
        const testResult = await testConnection(provider, credentials);
        
        // Encrypt credentials
        const encryptedCreds = encryptCredentials(credentials);

        // Insert or update (upsert)
        const { data, error } = await supabase
          .from('genesis_instance_integrations')
          .upsert({
            instance_id: instanceId,
            user_id: userId,
            provider,
            status: testResult.success ? 'connected' : 'error',
            credentials_encrypted: encryptedCreds,
            store_url: storeUrl || credentials.store_url || null,
            store_name: storeName || credentials.store_name || null,
            error_message: testResult.success ? null : testResult.error,
            last_sync_at: testResult.success ? new Date().toISOString() : null,
          }, {
            onConflict: 'instance_id,provider',
          })
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            integration: data,
            testResult 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        if (!provider || !instanceId || !credentials) {
          return new Response(
            JSON.stringify({ success: false, error: 'Dados incompletos' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Test connection first
        const testResult = await testConnection(provider, credentials);
        
        // Encrypt credentials
        const encryptedCreds = encryptCredentials(credentials);

        // Update
        const { data, error } = await supabase
          .from('genesis_instance_integrations')
          .update({
            credentials_encrypted: encryptedCreds,
            status: testResult.success ? 'connected' : 'error',
            store_url: storeUrl || credentials.store_url || null,
            store_name: storeName || credentials.store_name || null,
            error_message: testResult.success ? null : testResult.error,
            last_sync_at: testResult.success ? new Date().toISOString() : null,
          })
          .eq('instance_id', instanceId)
          .eq('provider', provider)
          .select()
          .single();

        if (error) {
          console.error('Update error:', error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            integration: data,
            testResult 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Ação inválida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (err) {
    console.error('Integration manager error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
