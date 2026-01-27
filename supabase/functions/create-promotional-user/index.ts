import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller has admin role or is genesis admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single();

    const { data: genesisUser } = await supabaseAdmin
      .from('genesis_users')
      .select('id, is_active')
      .eq('auth_user_id', caller.id)
      .single();

    const { data: genesisRole } = await supabaseAdmin
      .from('genesis_user_roles')
      .select('role')
      .eq('user_id', genesisUser?.id)
      .maybeSingle();

    const isAuthorized = roleData?.role === 'super_admin' || 
                         roleData?.role === 'admin' ||
                         genesisRole?.role === 'super_admin';

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin only' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { name, email, whatsapp, type, commissionRate } = await req.json();

    if (!name || !email || !whatsapp || !type) {
      return new Response(
        JSON.stringify({ error: 'Name, email, whatsapp and type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('promotional_users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Este email já está cadastrado como usuário promocional' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique referral code
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    // Generate random password
    const generatePassword = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const referralCode = generateCode();
    const password = generatePassword();
    const normalizedEmail = email.toLowerCase().trim();

    // Get default commission rate if not provided
    let finalCommissionRate = commissionRate;
    if (!finalCommissionRate) {
      const { data: settings } = await supabaseAdmin
        .from('promotional_settings')
        .select('default_commission_rate')
        .single();
      finalCommissionRate = settings?.default_commission_rate || 10;
    }

    // Create auth user
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: password,
      email_confirm: true,
      user_metadata: { 
        is_promotional: true,
        promotional_type: type,
        name: name
      }
    });

    if (createAuthError) {
      console.error('Auth creation error:', createAuthError);
      
      if (createAuthError.message.includes('already been registered')) {
        return new Response(
          JSON.stringify({ error: 'Este email já possui uma conta no sistema. Use outro email.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: createAuthError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Falha ao criar usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create genesis_users record for panel access
    const { data: genesisUserRecord, error: genesisUserError } = await supabaseAdmin
      .from('genesis_users')
      .insert({
        auth_user_id: authData.user.id,
        email: normalizedEmail,
        name: name,
        phone: whatsapp,
        is_active: true,
      })
      .select()
      .single();

    if (genesisUserError) {
      console.error('Genesis user creation error:', genesisUserError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar acesso ao painel' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create promotional_users record
    const { error: promotionalError } = await supabaseAdmin.from('promotional_users').insert({
      user_id: authData.user.id,
      name: name,
      email: normalizedEmail,
      whatsapp: whatsapp,
      type: type,
      referral_code: referralCode,
      commission_rate: finalCommissionRate,
      status: 'active',
      created_by: caller.id
    });

    if (promotionalError) {
      console.error('Promotional user creation error:', promotionalError);
      // Cleanup
      await supabaseAdmin.from('genesis_users').delete().eq('id', genesisUserRecord.id);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return new Response(
        JSON.stringify({ error: 'Erro ao criar registro promocional' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate welcome message
    const typeLabel = type === 'influencer' ? 'Influenciador' : 'Parceiro';
    const welcomeMessage = `🎉 *Bem-vindo(a) ao Genesis IA!*

Olá ${name}! 👋

Você foi cadastrado como *${typeLabel}* em nosso programa de parcerias.

📧 *Seu acesso:*
Email: ${normalizedEmail}
Senha: ${password}

🔗 *Link de acesso:*
https://genesishub.cloud/login

💰 *Sua comissão:* ${finalCommissionRate}% por indicação

📢 *Seu código de indicação:* ${referralCode}

Acesse o painel para acompanhar suas indicações e sacar seus ganhos!

Qualquer dúvida, estamos à disposição. 🚀`;

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          name,
          email: normalizedEmail,
          type,
          referral_code: referralCode,
          commission_rate: finalCommissionRate,
          password
        },
        welcomeMessage
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
