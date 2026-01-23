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

    const body = await req.json();
    const { email, code, password } = body;

    // Get client IP for logging
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';

    console.log('[checkout-activate-user] Request:', { 
      email: email?.substring(0, 3) + '***', 
      code: code?.substring(0, 4) + '***', 
      passwordLength: password?.length,
      clientIP: clientIP.substring(0, 8) + '***'
    });

    // Validate input - sanitize email
    if (!email || !code || !password) {
      console.log('[checkout-activate-user] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Email, código e senha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize and validate email
    const sanitizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Senha deve ter no mínimo 6 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (password.length > 128) {
      return new Response(
        JSON.stringify({ error: 'Senha muito longa (máximo 128 caracteres)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for common weak passwords
    const weakPasswords = ['123456', 'password', 'senha123', 'qwerty', 'abc123', '111111', '000000'];
    if (weakPasswords.includes(password.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: 'Senha muito comum. Escolha uma senha mais segura.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize code
    const sanitizedCode = code.trim().replace(/[^a-zA-Z0-9-_]/g, '');

    // 1. Verify payment exists and is paid
    const { data: payment, error: paymentError } = await supabase
      .from('checkout_payments')
      .select(`
        id, status, payment_code, plan_id, amount_cents,
        checkout_customers(id, email, first_name, last_name, phone)
      `)
      .eq('payment_code', sanitizedCode)
      .single();

    if (paymentError || !payment) {
      console.log('[checkout-activate-user] Payment not found:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Pagamento não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payment.status !== 'paid') {
      console.log('[checkout-activate-user] Payment not paid:', payment.status);
      return new Response(
        JSON.stringify({ error: 'Pagamento ainda não foi confirmado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verify email matches
    const customer = payment.checkout_customers as any;
    if (!customer || customer.email?.toLowerCase() !== sanitizedEmail) {
      console.log('[checkout-activate-user] Email mismatch');
      // Log security event (fire and forget)
      try {
        await supabase.from('audit_logs').insert({
          action: 'activation_email_mismatch',
          entity_type: 'checkout_payment',
          entity_id: payment.id,
          details: { 
            attempted_email: sanitizedEmail.substring(0, 3) + '***',
            ip: clientIP
          }
        });
      } catch (logError) {
        console.warn('[checkout-activate-user] Failed to log audit event:', logError);
      }
      
      return new Response(
        JSON.stringify({ error: 'Email não corresponde ao pagamento' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[checkout-activate-user] Payment verified for customer:', customer.first_name);

    // 3. Check if user already exists in Auth
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    let authUserId: string;

    if (existingUser) {
      console.log('[checkout-activate-user] User already exists, updating password');
      authUserId = existingUser.id;

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(authUserId, {
        password: password,
        user_metadata: { 
          needs_password: false,
          password_set_at: new Date().toISOString()
        }
      });

      if (updateError) {
        console.error('[checkout-activate-user] Error updating password:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar senha' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('[checkout-activate-user] Creating new auth user');

      // Create new user with password
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: `${customer.first_name} ${customer.last_name}`.trim(),
          phone: customer.phone,
          needs_password: false,
          password_set_at: new Date().toISOString()
        }
      });

      if (createError || !newUser.user) {
        console.error('[checkout-activate-user] Error creating user:', createError);
        return new Response(
          JSON.stringify({ error: 'Erro ao criar usuário' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      authUserId = newUser.user.id;
    }

    // 4. Get plan info
    let planName = 'basic';
    let durationMonths = 1;
    let maxInstances = 1;
    let maxFlows = 5;

    if (payment.plan_id) {
      const { data: plan } = await supabase
        .from('checkout_plans')
        .select('name, duration_months, features')
        .eq('id', payment.plan_id)
        .single();

      if (plan) {
        planName = plan.name || 'basic';
        durationMonths = plan.duration_months || 1;
        const features = plan.features as any;
        maxInstances = features?.max_instances || 1;
        maxFlows = features?.max_flows || 5;
      }
    }

    console.log('[checkout-activate-user] Plan:', { planName, durationMonths, maxInstances, maxFlows });

    // 5. Create/update genesis_users
    const { data: existingGenesisUser } = await supabase
      .from('genesis_users')
      .select('id')
      .eq('user_id', authUserId)
      .single();

    if (!existingGenesisUser) {
      const { error: genesisUserError } = await supabase
        .from('genesis_users')
        .insert({
          user_id: authUserId,
          name: `${customer.first_name} ${customer.last_name}`.trim(),
          email: email,
          whatsapp: customer.phone,
          status: 'active',
          is_first_login: true
        });

      if (genesisUserError) {
        console.error('[checkout-activate-user] Error creating genesis_user:', genesisUserError);
      }
    } else {
      // Update to mark as active
      await supabase
        .from('genesis_users')
        .update({ status: 'active', is_first_login: true })
        .eq('user_id', authUserId);
    }

    // 6. Create/update genesis_user_roles
    const { data: existingRole } = await supabase
      .from('genesis_user_roles')
      .select('id')
      .eq('user_id', authUserId)
      .single();

    if (!existingRole) {
      await supabase.from('genesis_user_roles').insert({
        user_id: authUserId,
        role: 'user',
        is_active: true
      });
    }

    // 7. Create/update genesis_subscriptions
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

    const { data: existingSub } = await supabase
      .from('genesis_subscriptions')
      .select('id')
      .eq('user_id', authUserId)
      .single();

    if (existingSub) {
      await supabase
        .from('genesis_subscriptions')
        .update({
          plan: planName,
          status: 'active',
          max_instances: maxInstances,
          max_flows: maxFlows,
          expires_at: expiresAt.toISOString()
        })
        .eq('id', existingSub.id);
    } else {
      await supabase.from('genesis_subscriptions').insert({
        user_id: authUserId,
        plan: planName,
        status: 'active',
        max_instances: maxInstances,
        max_flows: maxFlows,
        expires_at: expiresAt.toISOString()
      });
    }

    // 8. Add welcome credits
    const { data: existingCredits } = await supabase
      .from('genesis_credits')
      .select('id, available_credits')
      .eq('user_id', authUserId)
      .single();

    const bonusCredits = 300;

    if (existingCredits) {
      await supabase
        .from('genesis_credits')
        .update({
          available_credits: existingCredits.available_credits + bonusCredits
        })
        .eq('id', existingCredits.id);
    } else {
      await supabase.from('genesis_credits').insert({
        user_id: authUserId,
        available_credits: bonusCredits,
        total_credits: bonusCredits
      });
    }

    // 9. Log the activation event
    await supabase.from('checkout_payment_events').insert({
      payment_id: payment.id,
      event_type: 'account_activated',
      event_data: {
        user_id: authUserId,
        email: email,
        plan: planName,
        credits_added: bonusCredits
      },
      source: 'system'
    });

    console.log('[checkout-activate-user] Account activated successfully for:', authUserId);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Conta criada com sucesso',
        userId: authUserId,
        plan: planName,
        credits: bonusCredits
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[checkout-activate-user] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
