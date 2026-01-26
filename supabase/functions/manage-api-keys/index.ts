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
    
    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify super_admin role
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: genesisUser } = await serviceClient
      .from('genesis_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (!genesisUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: roleData } = await serviceClient
      .from('genesis_user_roles')
      .select('role')
      .eq('user_id', genesisUser.id)
      .maybeSingle();

    if (roleData?.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Super admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { action, keyName, apiKey, keyId, isActive } = await req.json();

    switch (action) {
      case 'list': {
        const { data: keys, error } = await serviceClient
          .from('genesis_api_keys')
          .select('*')
          .eq('provider', 'serper')
          .order('priority', { ascending: true })
          .order('usage_count', { ascending: true });

        if (error) throw error;
        return new Response(JSON.stringify({ keys }), {
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

        // Create simple hash for storage (in production, use proper encryption)
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

        if (error) throw error;

        // Store actual key in vault/env (simplified - store in separate secure storage)
        // For now, we'll use the hash as identifier and store mapping

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

        if (error) throw error;

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

        if (error) throw error;

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
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
