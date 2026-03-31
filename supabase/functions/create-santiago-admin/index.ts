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

    const email = 'santiagoadmin@gmail.com';
    const password = 'Santiago@2026';

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
        user_metadata: { name: 'Santiago Admin', role: 'admin' }
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Add admin role
    await supabase.from('admin_users').upsert({
      user_id: userId,
      email,
      name: 'Santiago Admin',
      is_active: true,
    }, { onConflict: 'user_id' });

    // Create genesis user
    await supabase.from('genesis_users').upsert({
      auth_user_id: userId,
      email,
      name: 'Santiago Admin',
      role: 'admin',
      is_active: true,
    }, { onConflict: 'auth_user_id' });

    // Store restricted menu config (no API token access)
    await supabase.from('admin_settings').upsert({
      setting_type: 'santiago_admin_restrictions',
      user_id: userId,
      settings: {
        restricted_menus: ['api_token'],
        is_restricted_admin: true,
      }
    }, { onConflict: 'setting_type,user_id' });

    return new Response(
      JSON.stringify({ success: true, userId, message: 'Santiago admin created/updated' }),
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
