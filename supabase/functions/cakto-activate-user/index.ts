import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function calculateAccessExpiration(baseDate: Date, durationMonths: number): Date {
  const days = durationMonths >= 12 ? 365 : Math.max(durationMonths, 1) * 30;
  return new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, password, name, phone, planId, userType } = await req.json();

    console.log('[cakto-activate] Request:', { email: email?.substring(0, 3) + '***', planId, userType });

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
    
    // Check if this is a "mentorado" trial
    const isMentorado = userType === 'mentorado';
    
    if (isMentorado) {
      // Mentorados Santiago get 3-day trial
      durationMonths = 0; // Will use days instead
      planName = 'Mentorado Santiago (Trial)';
      planSlug = 'starter';
      maxInstances = 3;
      maxFlows = 10;
    } else if (planId) {
      const { data: plan } = await supabase
        .from('checkout_plans')
        .select('name, display_name, duration_months, features')
        .eq('id', planId)
        .single();

      if (plan) {
        durationMonths = plan.duration_months || 1;
        planName = plan.display_name || plan.name || planName;
        
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

    let genesisUserId: string;

    if (!existingGenesisUser) {
      const { data: newGenesisUser, error: insertError } = await supabase
        .from('genesis_users')
        .insert({
          auth_user_id: authUserId,
          name: displayName,
          email: sanitizedEmail,
          phone: phone || null,
          is_active: true,
        })
        .select('id')
        .single();

      if (insertError || !newGenesisUser) {
        console.error('[cakto-activate] Error creating genesis_user:', insertError);
        return new Response(
          JSON.stringify({ error: 'Erro ao criar perfil' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      genesisUserId = newGenesisUser.id;
    } else {
      await supabase
        .from('genesis_users')
        .update({ is_active: true, name: displayName })
        .eq('auth_user_id', authUserId);
      genesisUserId = existingGenesisUser.id;
    }

    console.log('[cakto-activate] Genesis user ID:', genesisUserId);

    // 4. Upsert genesis_subscriptions using genesis_users.id
    let expiresAt: Date;
    if (isMentorado) {
      // 2-day trial
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 2);
    } else {
      expiresAt = calculateAccessExpiration(new Date(), durationMonths);
    }

    const subscriptionData = {
      plan: planSlug as any,
      plan_name: planName,
      status: isMentorado ? 'trial' : 'active',
      max_instances: maxInstances,
      max_flows: maxFlows,
      user_type: isMentorado ? 'mentorado' : (userType || 'client'),
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: existingSub } = await supabase
      .from('genesis_subscriptions')
      .select('id, expires_at')
      .eq('user_id', genesisUserId)
      .maybeSingle();

    if (existingSub) {
      let newExpiresAt = expiresAt;
        if (!isMentorado && existingSub.expires_at && new Date(existingSub.expires_at) > new Date()) {
          const curr = new Date(existingSub.expires_at);
          newExpiresAt = calculateAccessExpiration(curr, durationMonths);
      }

      await supabase
        .from('genesis_subscriptions')
        .update({ ...subscriptionData, expires_at: newExpiresAt.toISOString() })
        .eq('id', existingSub.id);
    } else {
      await supabase.from('genesis_subscriptions').insert({
        user_id: genesisUserId,
        ...subscriptionData,
      });
    }

    console.log('[cakto-activate] Success:', { authUserId, genesisUserId, planSlug, isMentorado });

    return new Response(
      JSON.stringify({
        success: true,
        userId: authUserId,
        genesisUserId,
        plan: planName,
        isTrial: isMentorado,
        trialDays: isMentorado ? 3 : undefined,
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
