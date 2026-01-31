import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { email, password, full_name } = await req.json();

    if (!email || !password) {
      throw new Error("Email e senha são obrigatórios");
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log("User already exists, using existing ID:", userId);
    } else {
      // Create auth user
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name || 'Administrador' }
      });

      if (createError) {
        throw new Error(createError.message);
      }
      userId = authData.user.id;
      console.log("Created new user:", userId);
    }

    // Create gym profile if not exists
    const { error: profileError } = await supabaseAdmin
      .from('gym_profiles')
      .upsert({
        user_id: userId,
        full_name: full_name || 'Administrador',
        email
      }, { onConflict: 'user_id' });

    if (profileError) {
      console.error("Profile error:", profileError);
    }

    // Create admin role
    const { error: roleError } = await supabaseAdmin
      .from('gym_user_roles')
      .upsert({
        user_id: userId,
        role: 'admin'
      }, { onConflict: 'user_id' });

    if (roleError) {
      console.error("Role error:", roleError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: userId,
        message: "Admin criado/atualizado com sucesso" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
