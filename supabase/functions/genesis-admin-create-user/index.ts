import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, name, phone, company_name, is_active, user_type } = await req.json();

    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: 'Email, senha e nome são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Create user with admin API (does NOT sign in the current session)
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Falha ao criar usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create genesis_users record
    const { error: genesisError } = await adminClient.from('genesis_users').insert({
      auth_user_id: authData.user.id,
      email,
      name,
      phone: phone || null,
      company_name: company_name || null,
      is_active: is_active !== false,
    });

    if (genesisError) {
      console.error('Genesis user error:', genesisError);
      return new Response(
        JSON.stringify({ error: genesisError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create subscription if not client
    if (user_type && user_type !== 'client') {
      const { data: newGenesisUser } = await adminClient
        .from('genesis_users')
        .select('id')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (newGenesisUser) {
        const isMentorado = user_type === 'mentorado';
        const expiresAt = isMentorado
          ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

        await adminClient.from('genesis_subscriptions').insert([{
          user_id: newGenesisUser.id,
          plan: 'starter',
          plan_name: isMentorado ? 'Mentorado Santiago (Trial)' : 
            user_type === 'influencer' ? 'Influencer' : 'Parceiro',
          status: isMentorado ? 'trial' : 'active',
          user_type: user_type,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        }]);
      }
    }

    return new Response(
      JSON.stringify({ success: true, userId: authData.user.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
