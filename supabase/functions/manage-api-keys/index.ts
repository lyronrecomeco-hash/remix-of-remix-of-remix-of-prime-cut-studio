import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Get and validate auth header
    const authHeader = req.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Invalid or missing authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid auth header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract and validate token
    const token = authHeader.replace('Bearer ', '');
    
    // Use service role client to validate the JWT
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from token
    const { data: { user }, error: userError } = await serviceClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Token validation failed:', userError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token', details: userError?.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = user.id;
    console.log('Authenticated user:', userId);
    // Find genesis user
    const { data: genesisUser, error: genesisError } = await serviceClient
      .from('genesis_users')
      .select('id')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (genesisError) {
      console.error('Error finding genesis user:', genesisError.message);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!genesisUser) {
      console.error('Genesis user not found for auth user:', userId);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Genesis user found:', genesisUser.id);

    // Check role
    const { data: roleData, error: roleError } = await serviceClient
      .from('genesis_user_roles')
      .select('role')
      .eq('user_id', genesisUser.id)
      .maybeSingle();

    if (roleError) {
      console.error('Error checking role:', roleError.message);
      return new Response(JSON.stringify({ error: 'Error checking permissions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('User role:', roleData?.role);

    if (roleData?.role !== 'super_admin') {
      console.error('User is not super_admin');
      return new Response(JSON.stringify({ error: 'Super admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { action, keyName, apiKey, keyId, isActive } = body;
    console.log('Action:', action);

    switch (action) {
      case 'list': {
        const { data: keys, error } = await serviceClient
          .from('genesis_api_keys')
          .select('*')
          .eq('provider', 'serper')
          .order('priority', { ascending: true })
          .order('usage_count', { ascending: true });

        if (error) {
          console.error('Error listing keys:', error.message);
          throw error;
        }
        
        return new Response(JSON.stringify({ keys: keys || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'sync_usage': {
        // Buscar todas as chaves ativas 
        const { data: allKeys, error: fetchError } = await serviceClient
          .from('genesis_api_keys')
          .select('id, api_key_hash, key_name, usage_count')
          .eq('provider', 'serper')
          .eq('is_active', true);

        if (fetchError) {
          throw fetchError;
        }

        if (!allKeys || allKeys.length === 0) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Nenhuma chave ativa encontrada'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Helper para descriptografar (as chaves estão armazenadas como hash, usamos env como fallback)
        const envApiKey = Deno.env.get('SERPER_API_KEY');
        const PLAN_CREDITS = 2500; // Créditos por plano Serper
        const syncResults: any[] = [];
        let totalUsed = 0;
        let totalRemaining = 0;

        // Para cada chave, sincronizar o uso individualmente
        // Nota: Como armazenamos apenas o hash, usamos a env key para a primeira chave
        // Em produção, deveriamos armazenar as chaves de forma que possam ser descriptografadas
        for (let i = 0; i < allKeys.length; i++) {
          const key = allKeys[i];
          
          // Usar a env key apenas para a primeira chave (demo)
          // Em produção, cada chave teria sua própria API key armazenada de forma segura
          if (i === 0 && envApiKey) {
            try {
              const accountResponse = await fetch('https://google.serper.dev/account', {
                method: 'GET',
                headers: {
                  'X-API-KEY': envApiKey,
                },
              });

              if (accountResponse.ok) {
                const accountData = await accountResponse.json();
                const balanceRemaining = accountData.balance || 0;
                const estimatedUsage = Math.max(0, PLAN_CREDITS - balanceRemaining);

                // Atualizar APENAS esta chave específica
                await serviceClient
                  .from('genesis_api_keys')
                  .update({ 
                    usage_count: estimatedUsage,
                    last_used_at: new Date().toISOString()
                  })
                  .eq('id', key.id);

                totalUsed += estimatedUsage;
                totalRemaining += balanceRemaining;

                syncResults.push({
                  keyId: key.id,
                  keyName: key.key_name,
                  used: estimatedUsage,
                  remaining: balanceRemaining,
                  total: PLAN_CREDITS,
                  status: 'synced'
                });

                console.log(`✅ Key ${key.key_name}: ${estimatedUsage} used, ${balanceRemaining} remaining`);
              } else {
                console.error(`❌ Failed to sync key ${key.key_name}: ${accountResponse.status}`);
                syncResults.push({
                  keyId: key.id,
                  keyName: key.key_name,
                  status: 'error',
                  error: `API status: ${accountResponse.status}`
                });
              }
            } catch (apiError) {
              console.error(`❌ Error syncing key ${key.key_name}:`, apiError);
              syncResults.push({
                keyId: key.id,
                keyName: key.key_name,
                status: 'error',
                error: apiError instanceof Error ? apiError.message : 'Unknown error'
              });
            }
          } else {
            // Para chaves sem API key real armazenada, manter uso atual
            syncResults.push({
              keyId: key.id,
              keyName: key.key_name,
              used: key.usage_count || 0,
              status: 'unchanged',
              note: 'Chave sem acesso direto à API - uso baseado em logs locais'
            });
          }
        }

        return new Response(JSON.stringify({ 
          success: true, 
          account: {
            used: totalUsed,
            remaining: totalRemaining,
            total: PLAN_CREDITS * allKeys.length,
          },
          keys: syncResults,
          message: `${syncResults.filter(r => r.status === 'synced').length} chave(s) sincronizada(s)`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'add': {
        if (!keyName || !apiKey) {
          return new Response(JSON.stringify({ error: 'Key name and API key required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get next priority
        const { data: existingKeys } = await serviceClient
          .from('genesis_api_keys')
          .select('priority')
          .eq('provider', 'serper')
          .order('priority', { ascending: false })
          .limit(1);

        const nextPriority = existingKeys && existingKeys.length > 0 
          ? existingKeys[0].priority + 1 
          : 0;

        // Create hash for storage
        const encoder = new TextEncoder();
        const data = encoder.encode(apiKey);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const { error } = await serviceClient
          .from('genesis_api_keys')
          .insert({
            key_name: keyName,
            api_key_hash: hashHex,
            api_key_preview: apiKey.slice(-4),
            provider: 'serper',
            priority: nextPriority,
            is_active: true
          });

        if (error) {
          console.error('Error adding key:', error.message);
          throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'toggle': {
        if (!keyId) {
          return new Response(JSON.stringify({ error: 'Key ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { error } = await serviceClient
          .from('genesis_api_keys')
          .update({ is_active: isActive })
          .eq('id', keyId);

        if (error) {
          console.error('Error toggling key:', error.message);
          throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'delete': {
        if (!keyId) {
          return new Response(JSON.stringify({ error: 'Key ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { error } = await serviceClient
          .from('genesis_api_keys')
          .delete()
          .eq('id', keyId);

        if (error) {
          console.error('Error deleting key:', error.message);
          throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error: unknown) {
    console.error('Unhandled error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
