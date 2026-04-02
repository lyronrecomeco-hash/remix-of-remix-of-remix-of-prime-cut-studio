import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Accept email/password from body or use defaults
    let body: any = {};
    try { body = await req.json(); } catch {}
    
    const email = body.email || 'santicanossa1@gmail.com';
    const password = body.password || 'Skatedosanti123';
    const name = body.name || 'Santiago';

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      // Update password
      await supabase.auth.admin.updateUserById(userId, { password });
    } else {
      // Create user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role: 'admin' }
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Ensure genesis_users record exists
    const { data: existingGenesis } = await supabase
      .from('genesis_users')
      .select('id')
      .eq('auth_user_id', userId)
      .maybeSingle();

    let genesisUserId: string;

    if (!existingGenesis) {
      const { data: newGenesis, error: genesisError } = await supabase
        .from('genesis_users')
        .insert({
          auth_user_id: userId,
          email,
          name,
          is_active: true,
        })
        .select('id')
        .single();
      if (genesisError) throw genesisError;
      genesisUserId = newGenesis.id;
    } else {
      genesisUserId = existingGenesis.id;
    }

    // Add admin role using genesis_users.id
    await supabase.from('genesis_user_roles').upsert({
      user_id: genesisUserId,
      role: 'super_admin',
    }, { onConflict: 'user_id' });

    // Add admin_users record
    await supabase.from('admin_users').upsert({
      user_id: userId,
      email,
      name,
      is_active: true,
    }, { onConflict: 'user_id' });

    return new Response(
      JSON.stringify({ success: true, userId, genesisUserId, message: 'Santiago admin created/updated' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
