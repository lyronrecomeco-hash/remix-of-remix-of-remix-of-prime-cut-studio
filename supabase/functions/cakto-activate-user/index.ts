import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, password, name, phone, planId } = await req.json();

    console.log('[cakto-activate] Request:', { email: email?.substring(0, 3) + '***', planId });

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e senha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedEmail = email.toLowerCase().trim();
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Senha deve ter no mínimo 6 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Check if auth user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email?.toLowerCase() === sanitizedEmail
    );

    let authUserId: string;
    const displayName = name || sanitizedEmail.split('@')[0];

    if (existingUser) {
      authUserId = existingUser.id;
      console.log('[cakto-activate] User exists, updating password');

      const { error: updateError } = await supabase.auth.admin.updateUserById(authUserId, {
        password,
        email_confirm: true,
        user_metadata: {
          name: displayName,
          source: 'cakto',
          password_set_at: new Date().toISOString(),
        },
      });

      if (updateError) {
        console.error('[cakto-activate] Error updating user:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar conta' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('[cakto-activate] Creating new auth user');

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: sanitizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          name: displayName,
          phone: phone || null,
          source: 'cakto',
          password_set_at: new Date().toISOString(),
        },
      });

      if (createError || !newUser.user) {
        console.error('[cakto-activate] Error creating user:', createError);
        return new Response(
          JSON.stringify({ error: createError?.message || 'Erro ao criar usuário' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      authUserId = newUser.user.id;
    }

    // 2. Get plan config
    let durationMonths = 1;
    let planName = 'Plano Mensal';
    let maxInstances = 3;
    let maxFlows = 10;
    let planSlug = 'starter';

    if (planId) {
      const { data: plan } = await supabase
        .from('checkout_plans')
        .select('name, duration_months, features')
        .eq('id', planId)
        .single();

      if (plan) {
        durationMonths = plan.duration_months || 1;
        planName = plan.name || planName;
        
        if (durationMonths === 3) {
          planSlug = 'professional';
          maxInstances = 5;
          maxFlows = 25;
        } else if (durationMonths >= 12) {
          planSlug = 'enterprise';
          maxInstances = 10;
          maxFlows = 50;
        }
      }
    }

    // 3. Upsert genesis_users
    const { data: existingGenesisUser } = await supabase
      .from('genesis_users')
      .select('id')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (!existingGenesisUser) {
      await supabase.from('genesis_users').insert({
        auth_user_id: authUserId,
        name: displayName,
        email: sanitizedEmail,
        phone: phone || null,
        is_active: true,
      });
    } else {
      await supabase
        .from('genesis_users')
        .update({ is_active: true, name: displayName })
        .eq('auth_user_id', authUserId);
    }

    // 4. Upsert genesis_subscriptions
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

    const { data: existingSub } = await supabase
      .from('genesis_subscriptions')
      .select('id, expires_at')
      .eq('user_id', authUserId)
      .maybeSingle();

    if (existingSub) {
      let newExpiresAt = expiresAt;
      if (existingSub.expires_at && new Date(existingSub.expires_at) > new Date()) {
        const curr = new Date(existingSub.expires_at);
        curr.setMonth(curr.getMonth() + durationMonths);
        newExpiresAt = curr;
      }

      await supabase
        .from('genesis_subscriptions')
        .update({
          plan: planSlug,
          plan_name: planName,
          status: 'active',
          max_instances: maxInstances,
          max_flows: maxFlows,
          started_at: new Date().toISOString(),
          expires_at: newExpiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSub.id);
    } else {
      await supabase.from('genesis_subscriptions').insert({
        user_id: authUserId,
        plan: planSlug,
        plan_name: planName,
        status: 'active',
        max_instances: maxInstances,
        max_flows: maxFlows,
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });
    }

    console.log('[cakto-activate] Success:', { authUserId, planSlug, durationMonths });

    return new Response(
      JSON.stringify({
        success: true,
        userId: authUserId,
        plan: planName,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[cakto-activate] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
