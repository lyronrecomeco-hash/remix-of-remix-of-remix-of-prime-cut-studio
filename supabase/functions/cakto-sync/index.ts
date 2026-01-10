import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * CAKTO SYNC - Sincroniza produtos, pedidos e dados da Cakto
 * OTIMIZADO para evitar timeout - processamento em lotes menores
 * 
 * Actions:
 * - get_token: Obtém OAuth access_token usando client_id/client_secret
 * - sync_products: Sincroniza todos os produtos para genesis_cakto_products
 * - sync_orders: Sincroniza histórico de pedidos para genesis_cakto_events
 * - test_credentials: Valida credenciais obtendo token
 * - get_products: Retorna produtos (apenas ativos por padrão)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CAKTO_TOKEN_URL = 'https://api.cakto.com.br/public_api/token/';
const CAKTO_PRODUCTS_URL = 'https://api.cakto.com.br/public_api/products/';
const CAKTO_ORDERS_URL = 'https://api.cakto.com.br/public_api/orders/';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Map Cakto order status to event types
function mapOrderStatusToEventType(status: string, paymentMethod?: string): string {
  const normalizedStatus = status?.toLowerCase()?.trim();
  
  switch (normalizedStatus) {
    case 'approved':
    case 'completed':
    case 'paid':
      return 'purchase_approved';
    case 'refused':
    case 'declined':
    case 'failed':
      return 'purchase_refused';
    case 'refunded':
      return 'purchase_refunded';
    case 'chargeback':
    case 'disputed':
      return 'purchase_chargeback';
    case 'pending':
    case 'waiting':
    case 'waiting_payment':
      if (paymentMethod?.toLowerCase()?.includes('pix')) {
        return 'pix_generated';
      }
      if (paymentMethod?.toLowerCase()?.includes('boleto')) {
        return 'boleto_generated';
      }
      return 'initiate_checkout';
    case 'expired':
      if (paymentMethod?.toLowerCase()?.includes('pix')) {
        return 'pix_expired';
      }
      if (paymentMethod?.toLowerCase()?.includes('boleto')) {
        return 'boleto_expired';
      }
      return 'checkout_abandonment';
    case 'abandoned':
    case 'cancelled':
      return 'checkout_abandonment';
    default:
      return 'initiate_checkout';
  }
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

// Normalize phone to E.164 format
function normalizePhone(phone: string | undefined | null): string | null {
  if (!phone) return null;
  
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = '55' + cleaned;
  }
  
  if (cleaned.length < 10) return null;
  
  return '+' + cleaned;
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

// Fetch orders from Cakto API with pagination
async function fetchOrders(accessToken: string, page = 1, limit = 100, startDate?: string): Promise<{
  count: number;
  next: string | null;
  results: any[];
}> {
  const url = new URL(CAKTO_ORDERS_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  
  if (startDate) {
    url.searchParams.set('created_at__gte', startDate);
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[CaktoSync] Orders error:', response.status, errorText);
    throw new Error(`Falha ao buscar pedidos: ${response.status}`);
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

// Process orders in batch (to avoid timeout)
async function processOrdersBatch(
  supabase: any, 
  orders: any[], 
  instanceId: string, 
  integrationId: string,
  now: string
): Promise<{ inserted: number; skipped: number; errors: number }> {
  let insertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // Prepare all events for batch upsert
  const eventsToUpsert: any[] = [];

  for (const order of orders) {
    try {
      const externalId = order.id || order.transaction_id || order.order_id;
      if (!externalId) {
        skippedCount++;
        continue;
      }

      const paymentMethod = order.payment_method || order.paymentMethod || '';
      const eventType = mapOrderStatusToEventType(order.status, paymentMethod);

      const customer = order.customer || order.buyer || {};
      const customerName = customer.name || customer.full_name || 
                          `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || null;
      const customerEmail = customer.email || null;
      const customerPhone = normalizePhone(
        customer.phone || customer.cellphone || customer.mobile || customer.whatsapp || null
      );

      const product = order.product || order.products?.[0] || {};
      const offer = order.offer || {};
      const orderValue = Number(order.total || order.amount || order.value || 0) || null;

      // Use the ACTUAL created_at from the order for precise timestamps
      const orderCreatedAt = order.created_at || order.date || order.createdAt;

      eventsToUpsert.push({
        instance_id: instanceId,
        integration_id: integrationId,
        event_type: eventType,
        external_id: String(externalId),
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        product_id: product.id || null,
        product_name: product.name || product.title || null,
        offer_id: offer.id || null,
        offer_name: offer.name || offer.title || null,
        order_value: orderValue,
        currency: order.currency || 'BRL',
        raw_payload: order,
        normalized_event: {
          provider: 'cakto',
          event: eventType,
          source: 'api_sync',
          synced_at: now,
        },
        processed: true,
        processed_at: now,
        created_at: orderCreatedAt ? new Date(orderCreatedAt).toISOString() : now,
      });

    } catch (err) {
      console.error('[CaktoSync] Order processing error:', err);
      errorCount++;
    }
  }

  // Batch upsert all events at once
  if (eventsToUpsert.length > 0) {
    const { error: upsertError, data } = await supabase
      .from('genesis_cakto_events')
      .upsert(eventsToUpsert, { 
        onConflict: 'instance_id,external_id,event_type',
        ignoreDuplicates: false 
      })
      .select('id');

    if (upsertError) {
      console.error('[CaktoSync] Batch upsert error:', upsertError);
      errorCount += eventsToUpsert.length;
    } else {
      insertedCount = data?.length || eventsToUpsert.length;
    }
  }

  return { inserted: insertedCount, skipped: skippedCount, errors: errorCount };
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
    const { action, integrationId, clientId, clientSecret, startDate, fullSync } = body;

    console.log(`[CaktoSync] Action: ${action}, Integration: ${integrationId}`);

    switch (action) {
      case 'test_credentials': {
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

      case 'sync_orders': {
        if (!integrationId) {
          return new Response(
            JSON.stringify({ success: false, error: 'integrationId é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

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

        const creds = decodeCredentials(integration.credentials_encrypted);
        console.log('[CaktoSync] Getting access token for orders sync...');
        const tokenData = await getAccessToken(creds.client_id, creds.client_secret);
        console.log('[CaktoSync] Token obtained, expires in:', tokenData.expires_in);

        const instanceId = integration.instance_id;
        const now = new Date().toISOString();

        // Determine start date for sync (default: last 7 days for faster sync)
        let syncStartDate = startDate;
        if (!syncStartDate && !fullSync) {
          const daysAgo = new Date();
          daysAgo.setDate(daysAgo.getDate() - 7);
          syncStartDate = daysAgo.toISOString().split('T')[0];
        }

        // Fetch orders with optimized pagination (smaller batches)
        let totalInserted = 0;
        let totalSkipped = 0;
        let totalErrors = 0;
        let page = 1;
        let hasMore = true;
        const batchSize = 50; // Smaller batches for faster processing
        const maxPages = fullSync ? 100 : 20; // Limit pages for non-full sync

        while (hasMore && page <= maxPages) {
          console.log(`[CaktoSync] Fetching orders page ${page}...`);
          
          try {
            const ordersData = await fetchOrders(tokenData.access_token, page, batchSize, syncStartDate);
            
            if (ordersData.results.length > 0) {
              // Process this batch immediately
              const batchResult = await processOrdersBatch(
                supabase, 
                ordersData.results, 
                instanceId, 
                integrationId, 
                now
              );
              
              totalInserted += batchResult.inserted;
              totalSkipped += batchResult.skipped;
              totalErrors += batchResult.errors;
            }
            
            hasMore = !!ordersData.next && ordersData.results.length === batchSize;
            page++;
            
          } catch (fetchErr) {
            console.error('[CaktoSync] Page fetch error:', fetchErr);
            break;
          }
        }

        // Update integration metadata
        await supabase
          .from('genesis_instance_integrations')
          .update({ 
            last_sync_at: now,
            metadata: {
              ...((integration.metadata as object) || {}),
              last_orders_sync: now,
              orders_synced: totalInserted,
              orders_skipped: totalSkipped,
              pages_processed: page - 1,
            }
          })
          .eq('id', integrationId);

        console.log(`[CaktoSync] Orders sync complete: ${totalInserted} inserted, ${totalSkipped} skipped, ${totalErrors} errors`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Sincronização concluída! ${totalInserted} pedidos processados.`,
            stats: {
              total: totalInserted + totalSkipped,
              inserted: totalInserted,
              skipped: totalSkipped,
              errors: totalErrors,
              pages: page - 1,
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync_products': {
        if (!integrationId) {
          return new Response(
            JSON.stringify({ success: false, error: 'integrationId é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

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

        const creds = decodeCredentials(integration.credentials_encrypted);
        console.log('[CaktoSync] Getting access token...');
        const tokenData = await getAccessToken(creds.client_id, creds.client_secret);

        let allProducts: any[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 20) {
          console.log(`[CaktoSync] Fetching products page ${page}...`);
          const productsData = await fetchProducts(tokenData.access_token, page, 100);
          allProducts = allProducts.concat(productsData.results);
          hasMore = !!productsData.next;
          page++;
        }

        console.log(`[CaktoSync] Total products fetched: ${allProducts.length}`);

        const instanceId = integration.instance_id;
        const now = new Date().toISOString();

        const productsToUpsert = allProducts.map(product => ({
          instance_id: instanceId,
          integration_id: integrationId,
          external_id: product.id,
          name: product.name || 'Produto sem nome',
          description: product.description || null,
          price: product.price || 0,
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
        }));

        const { error: upsertError } = await supabase
          .from('genesis_cakto_products')
          .upsert(productsToUpsert, {
            onConflict: 'instance_id,external_id',
          });

        if (upsertError) {
          console.error('[CaktoSync] Upsert error:', upsertError);
          throw upsertError;
        }

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
        if (!integrationId) {
          return new Response(
            JSON.stringify({ success: false, error: 'integrationId é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { search, status = 'active', limit = 50, includeAll } = body;

        let query = supabase
          .from('genesis_cakto_products')
          .select('*')
          .eq('integration_id', integrationId)
          .order('name', { ascending: true })
          .limit(limit);

        if (search) {
          query = query.ilike('name', `%${search}%`);
        }

        // Por padrão, apenas produtos ativos (status != 'deleted')
        if (!includeAll) {
          if (status === 'active') {
            query = query.neq('status', 'deleted');
          } else if (status !== 'all') {
            query = query.eq('status', status);
          }
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
