import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  city: string;
  state: string;
  niche: string;
  maxResults?: number;
}

interface BusinessResult {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews_count?: number;
  category?: string;
  place_id?: string;
  latitude?: number;
  longitude?: number;
}

interface ApiKeyResult {
  id: string;
  api_key: string;
}

// Função para obter chave API com rotação automática
async function getRotatingApiKey(supabase: any): Promise<ApiKeyResult | null> {
  // Buscar chave ativa com menor uso
  const { data: keys, error } = await supabase
    .from('genesis_api_keys')
    .select('id, api_key_hash')
    .eq('provider', 'serper')
    .eq('is_active', true)
    .order('usage_count', { ascending: true })
    .order('priority', { ascending: true })
    .limit(1);

  if (error || !keys || keys.length === 0) {
    console.log('No rotating keys found, falling back to env');
    return null;
  }

  // A chave real está armazenada em uma coluna separada (encrypted_key)
  // Por segurança, vamos verificar se existe uma secret vault
  const { data: vaultKey } = await supabase
    .from('genesis_api_keys')
    .select('id')
    .eq('id', keys[0].id)
    .single();

  if (vaultKey) {
    // Por ora, ainda usamos a env var como fallback
    // O sistema de rotação será baseado no incremento de uso
    return { id: keys[0].id, api_key: '' };
  }

  return null;
}

// Incrementar uso da chave
async function incrementKeyUsage(supabase: any, keyId: string): Promise<void> {
  const { error } = await supabase
    .from('genesis_api_keys')
    .update({ 
      usage_count: supabase.sql`usage_count + 1`,
      last_used_at: new Date().toISOString()
    })
    .eq('id', keyId);
  
  if (error) {
    console.error('Error incrementing key usage:', error.message);
  }
}

// Incrementar uso via RPC para evitar problemas com SQL template
async function incrementKeyUsageRaw(supabase: any, keyId: string): Promise<void> {
  // Primeiro buscar o valor atual
  const { data: currentKey } = await supabase
    .from('genesis_api_keys')
    .select('usage_count')
    .eq('id', keyId)
    .single();

  if (currentKey) {
    const { error } = await supabase
      .from('genesis_api_keys')
      .update({ 
        usage_count: (currentKey.usage_count || 0) + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', keyId);
    
    if (error) {
      console.error('Error incrementing key usage:', error.message);
    } else {
      console.log(`Key ${keyId} usage incremented to ${(currentKey.usage_count || 0) + 1}`);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: SearchRequest & { max_results?: number } = await req.json();
    const { city, state, niche } = body;
    const requestedMaxResults = Number(body.maxResults ?? body.max_results);

    if (!city || !state || !niche) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cidade, estado e nicho são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar chave com rotação ou fallback para env
    let apiKey = Deno.env.get('SERPER_API_KEY');
    let usedKeyId: string | null = null;

    // Tentar buscar chave do banco com menor uso
    const { data: rotatingKeys, error: keysError } = await supabase
      .from('genesis_api_keys')
      .select('id, usage_count')
      .eq('provider', 'serper')
      .eq('is_active', true)
      .order('usage_count', { ascending: true })
      .order('priority', { ascending: true })
      .limit(1);

    if (!keysError && rotatingKeys && rotatingKeys.length > 0) {
      usedKeyId = rotatingKeys[0].id;
      console.log(`Using rotating key: ${usedKeyId} (usage: ${rotatingKeys[0].usage_count})`);
    }

    if (!apiKey) {
      console.error('SERPER_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Serper.dev não configurado. Configure a API key.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Buscando via Serper: ${niche} em ${city}, ${state}`);

    const searchQuery = `${niche} em ${city} ${state}`;

    const PER_PAGE = 20;
    const HARD_CAP = 500;
    const DEFAULT_MAX_RESULTS = 200;

    const maxResults = Number.isFinite(requestedMaxResults)
      ? Math.min(HARD_CAP, Math.max(20, requestedMaxResults))
      : DEFAULT_MAX_RESULTS;

    const maxPages = Math.ceil(maxResults / PER_PAGE);

    const allPlaces: any[] = [];
    const rawSeen = new Set<string>();
    let consecutiveNoNew = 0;
    let totalApiCalls = 0;

    for (let page = 1; page <= maxPages; page++) {
      const searchResponse = await fetch('https://google.serper.dev/places', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: searchQuery,
          gl: 'br',
          hl: 'pt-br',
          num: PER_PAGE,
          page,
        }),
      });

      totalApiCalls++;

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Erro Serper:', searchResponse.status, errorText);
        return new Response(
          JSON.stringify({ success: false, error: `Erro na busca: ${searchResponse.status}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const searchData = await searchResponse.json();
      const places = searchData.places || [];
      console.log(`Resultados Serper (page ${page}): ${places.length}`);

      if (places.length === 0) break;

      let addedOnPage = 0;
      for (const place of places) {
        const placeId = place.placeId || place.cid || '';
        const name = place.title || place.name || '';
        const address = place.address || '';
        const key = `${placeId}::${name}::${address}`.toLowerCase();

        if (!name || name.length < 3) continue;
        if (rawSeen.has(key)) continue;

        rawSeen.add(key);
        allPlaces.push(place);
        addedOnPage++;

        if (allPlaces.length >= maxResults) break;
      }

      if (allPlaces.length >= maxResults) break;

      if (addedOnPage === 0) {
        consecutiveNoNew++;
        if (consecutiveNoNew >= 2) break;
      } else {
        consecutiveNoNew = 0;
      }
    }

    // Incrementar uso da chave (conta cada chamada de API)
    if (usedKeyId && totalApiCalls > 0) {
      const { data: currentKey } = await supabase
        .from('genesis_api_keys')
        .select('usage_count')
        .eq('id', usedKeyId)
        .single();

      if (currentKey) {
        await supabase
          .from('genesis_api_keys')
          .update({ 
            usage_count: (currentKey.usage_count || 0) + totalApiCalls,
            last_used_at: new Date().toISOString()
          })
          .eq('id', usedKeyId);
        
        console.log(`Key ${usedKeyId} usage incremented by ${totalApiCalls}`);
      }

      // Registrar no histórico de pesquisas
      const authHeader = req.headers.get('authorization');
      let searchUserId: string | null = null;
      let authUserId: string | null = null;
      let searchUserName = 'Sistema';
      let searchUserEmail = '';

      if (authHeader?.startsWith('Bearer ')) {
        try {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) {
            authUserId = user.id;
            // Buscar dados do genesis_user
            const { data: genesisUser } = await supabase
              .from('genesis_users')
              .select('id, name, email')
              .eq('auth_user_id', user.id)
              .maybeSingle();
            
            if (genesisUser) {
              searchUserId = genesisUser.id;
              searchUserName = genesisUser.name || 'Usuário';
              searchUserEmail = genesisUser.email || user.email || '';
            } else {
              searchUserName = user.email?.split('@')[0] || 'Usuário';
              searchUserEmail = user.email || '';
            }
            
            console.log(`👤 Usuário identificado: ${searchUserName} (auth: ${authUserId}, genesis: ${searchUserId})`);
          }
        } catch (e) {
          console.log('Could not get user info for history:', e);
        }
      }

      // Inserir registro de histórico
      const historyRecord = {
        user_id: searchUserId || usedKeyId || '00000000-0000-0000-0000-000000000000',
        auth_user_id: authUserId,
        user_name: searchUserName,
        user_email: searchUserEmail,
        search_type: 'prospecting',
        search_query: searchQuery,
        city: city,
        state: state,
        niche: niche,
        results_count: allPlaces.length,
        api_key_id: usedKeyId,
        credits_used: totalApiCalls
      };

      console.log('📝 Salvando histórico:', JSON.stringify(historyRecord));

      const { error: historyError } = await supabase
        .from('genesis_search_history')
        .insert(historyRecord);
      
      if (historyError) {
        console.error('❌ Erro ao salvar histórico:', historyError.message);
      } else {
        console.log(`✅ Histórico salvo: ${allPlaces.length} resultados para ${searchUserName}`);
      }
    }

    // Deduplicar e processar
    const seen = new Set<string>();
    const results: BusinessResult[] = allPlaces
      .map((place: any) => {
        const placeId = place.placeId || place.cid || '';
        const name = place.title || place.name || '';
        const address = place.address || `${city}, ${state}`;
        const key = `${placeId}::${name}::${address}`.toLowerCase();

        if (!name || name.length < 3) return null;
        if (seen.has(key)) return null;
        seen.add(key);

        return {
          name,
          address,
          phone: extractPhone(place.phoneNumber || place.phone || ''),
          website: extractDomain(place.website || ''),
          rating: place.rating ? parseFloat(place.rating) : undefined,
          reviews_count: place.reviewsCount || place.reviews || undefined,
          category: place.category || niche,
          place_id: placeId || undefined,
          latitude: place.latitude ?? place.gps_coordinates?.latitude ?? undefined,
          longitude: place.longitude ?? place.gps_coordinates?.longitude ?? undefined,
        } as BusinessResult;
      })
      .filter((r: BusinessResult | null): r is BusinessResult => !!r);

    console.log(`Resultados processados (dedup): ${results.length}`);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractPhone(phone: string): string | undefined {
  if (!phone) return undefined;
  
  const cleaned = phone.replace(/[^\d()+\s-]/g, '').trim();
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length >= 10 && digits.length <= 13) {
    return cleaned;
  }
  
  return undefined;
}

function extractDomain(url: string): string | undefined {
  if (!url) return undefined;
  
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}
