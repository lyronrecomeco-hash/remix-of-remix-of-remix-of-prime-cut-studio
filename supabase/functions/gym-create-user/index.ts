import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateGymUserRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: 'aluno' | 'instrutor' | 'admin';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get calling user's auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create client with user's token to verify they're an admin
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user: callingUser }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !callingUser) {
      throw new Error("Unauthorized");
    }

    // Check if calling user is a gym admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('gym_user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .single();

    if (roleError || !roleData || roleData.role !== 'admin') {
      throw new Error("Apenas administradores podem criar usuários");
    }

    const { email, password, full_name, phone, role }: CreateGymUserRequest = await req.json();

    if (!email || !password || !full_name || !role) {
      throw new Error("Campos obrigatórios: email, password, full_name, role");
    }

    // Create auth user
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { full_name, phone }
    });

    if (createError) {
      throw new Error(createError.message);
    }

    const newUserId = authData.user.id;

    // Create gym profile
    const { error: profileError } = await supabaseAdmin
      .from('gym_profiles')
      .insert({
        user_id: newUserId,
        full_name,
        email,
        phone: phone || null
      });

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw new Error("Erro ao criar perfil: " + profileError.message);
    }

    // Create user role
    const { error: roleInsertError } = await supabaseAdmin
      .from('gym_user_roles')
      .insert({
        user_id: newUserId,
        role
      });

    if (roleInsertError) {
      // Rollback
      await supabaseAdmin.from('gym_profiles').delete().eq('user_id', newUserId);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw new Error("Erro ao criar role: " + roleInsertError.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUserId,
        message: "Usuário criado com sucesso" 
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
