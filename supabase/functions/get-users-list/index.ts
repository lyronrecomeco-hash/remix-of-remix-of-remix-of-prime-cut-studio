import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const body = await req.json();
    const userIds: string[] = body.user_ids || [];

    if (!userIds.length) {
      return new Response(
        JSON.stringify({ users: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch users from auth.users via admin API
    const users: Array<{ id: string; email: string }> = [];

    for (const userId of userIds) {
      try {
        const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
        if (user && !error) {
          users.push({
            id: user.id,
            email: user.email || 'sem-email'
          });
        }
      } catch (e) {
        console.warn(`Could not fetch user ${userId}:`, e);
      }
    }

    return new Response(
      JSON.stringify({ users }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-users-list:', error);
    return new Response(
      JSON.stringify({ users: [], error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
