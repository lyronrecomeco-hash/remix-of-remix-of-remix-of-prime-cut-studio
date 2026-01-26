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
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'Unauthorized - No auth header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create user client with the auth header
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError.message);
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token', details: userError.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!user) {
      console.error('No user found from token');
      return new Response(JSON.stringify({ error: 'Unauthorized - No user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Authenticated user:', user.id);

    // Use service role client for admin operations
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Find genesis user
    const { data: genesisUser, error: genesisError } = await serviceClient
      .from('genesis_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (genesisError) {
      console.error('Error finding genesis user:', genesisError.message);
      return new Response(JSON.stringify({ error: 'Database error', details: genesisError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!genesisUser) {
      console.error('Genesis user not found for auth user:', user.id);
      return new Response(JSON.stringify({ error: 'User not found in genesis_users' }), {
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
      console.error('User is not super_admin:', roleData?.role);
      return new Response(JSON.stringify({ error: 'Super admin access required', currentRole: roleData?.role }), {
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
