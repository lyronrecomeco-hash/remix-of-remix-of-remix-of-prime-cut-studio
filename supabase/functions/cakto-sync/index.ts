import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * CAKTO SYNC - Sincroniza produtos e dados da Cakto
 * 
 * Actions:
 * - get_token: Obtém OAuth access_token usando client_id/client_secret
 * - sync_products: Sincroniza todos os produtos para genesis_cakto_products
 * - test_credentials: Valida credenciais obtendo token
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CAKTO_TOKEN_URL = 'https://api.cakto.com.br/public_api/token/';
const CAKTO_PRODUCTS_URL = 'https://api.cakto.com.br/public_api/products/';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Get OAuth2 access token from Cakto
async function getAccessToken(clientId: string, clientSecret: string): Promise<TokenResponse> {
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

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[CaktoSync] Token error:', response.status, errorText);
    throw new Error(`Falha na autenticação: ${response.status}`);
  }

  return await response.json();
}

// Fetch products from Cakto API
async function fetchProducts(accessToken: string, page = 1, limit = 100): Promise<{
  count: number;
  next: string | null;
  results: any[];
}> {
  const url = new URL(CAKTO_PRODUCTS_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[CaktoSync] Products error:', response.status, errorText);
    throw new Error(`Falha ao buscar produtos: ${response.status}`);
  }

  return await response.json();
}

// Decode credentials from base64
function decodeCredentials(encrypted: string): { client_id: string; client_secret: string } {
  try {
    const decoded = atob(encrypted);
    return JSON.parse(decoded);
  } catch {
    throw new Error('Credenciais inválidas');
  }
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
    const { action, integrationId, clientId, clientSecret } = body;

    console.log(`[CaktoSync] Action: ${action}, Integration: ${integrationId}`);

    switch (action) {
      case 'test_credentials': {
        // Test credentials by getting a token
        if (!clientId || !clientSecret) {
          return new Response(
            JSON.stringify({ success: false, error: 'client_id e client_secret são obrigatórios' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          const tokenData = await getAccessToken(clientId, clientSecret);
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Credenciais válidas!',
              expires_in: tokenData.expires_in,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: err instanceof Error ? err.message : 'Credenciais inválidas' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'sync_products': {
        if (!integrationId) {
          return new Response(
            JSON.stringify({ success: false, error: 'integrationId é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get integration with credentials
        const { data: integration, error: intError } = await supabase
          .from('genesis_instance_integrations')
          .select('*')
          .eq('id', integrationId)
          .eq('provider', 'cakto')
          .single();

        if (intError || !integration) {
          return new Response(
            JSON.stringify({ success: false, error: 'Integração não encontrada' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!integration.credentials_encrypted) {
          return new Response(
            JSON.stringify({ success: false, error: 'Credenciais não configuradas' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Decode credentials
        const creds = decodeCredentials(integration.credentials_encrypted);
        
        // Get access token
        console.log('[CaktoSync] Getting access token...');
        const tokenData = await getAccessToken(creds.client_id, creds.client_secret);
        console.log('[CaktoSync] Token obtained, expires in:', tokenData.expires_in);

        // Fetch all products with pagination
        let allProducts: any[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          console.log(`[CaktoSync] Fetching products page ${page}...`);
          const productsData = await fetchProducts(tokenData.access_token, page, 100);
          allProducts = allProducts.concat(productsData.results);
          hasMore = !!productsData.next;
          page++;
          
          // Safety limit
          if (page > 50) break;
        }

        console.log(`[CaktoSync] Total products fetched: ${allProducts.length}`);

        // Upsert products to database
        const instanceId = integration.instance_id;
        const now = new Date().toISOString();

        for (const product of allProducts) {
          await supabase
            .from('genesis_cakto_products')
            .upsert({
              instance_id: instanceId,
              integration_id: integrationId,
              external_id: product.id,
              name: product.name,
              description: product.description || null,
              price: product.price ? product.price * 100 : null, // Store in cents
              currency: 'BRL',
              status: product.status || 'active',
              image_url: product.image || null,
              metadata: {
                type: product.type,
                category: product.category,
                salesPage: product.salesPage,
                paymentMethods: product.paymentMethods,
                contentDeliveries: product.contentDeliveries,
              },
              synced_at: now,
            }, {
              onConflict: 'instance_id,external_id',
            });
        }

        // Update integration last_sync_at
        await supabase
          .from('genesis_instance_integrations')
          .update({ 
            last_sync_at: now,
            metadata: {
              ...((integration.metadata as object) || {}),
              last_products_sync: now,
              products_count: allProducts.length,
            }
          })
          .eq('id', integrationId);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `${allProducts.length} produtos sincronizados!`,
            count: allProducts.length,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_products': {
        // Get products from local database
        if (!integrationId) {
          return new Response(
            JSON.stringify({ success: false, error: 'integrationId é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { search, status, limit = 50 } = body;

        let query = supabase
          .from('genesis_cakto_products')
          .select('*')
          .eq('integration_id', integrationId)
          .order('name', { ascending: true })
          .limit(limit);

        if (search) {
          query = query.ilike('name', `%${search}%`);
        }

        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        const { data: products, error: prodError } = await query;

        if (prodError) throw prodError;

        return new Response(
          JSON.stringify({ 
            success: true, 
            products: products || [],
            count: products?.length || 0,
          }),
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
    console.error('[CaktoSync] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
