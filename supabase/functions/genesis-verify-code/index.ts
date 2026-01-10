import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ success: false, error: "Dados incompletos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, "");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get verification record
    const { data: verification, error: fetchError } = await supabase
      .from("genesis_verification_codes")
      .select("*")
      .eq("phone", cleanPhone)
      .single();

    if (fetchError || !verification) {
      return new Response(
        JSON.stringify({ success: false, error: "Código não encontrado. Solicite um novo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    if (new Date(verification.expires_at) < new Date()) {
      // Delete expired code
      await supabase
        .from("genesis_verification_codes")
        .delete()
        .eq("id", verification.id);

      return new Response(
        JSON.stringify({ success: false, error: "Código expirado. Solicite um novo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check attempts (max 5)
    if (verification.attempts >= 5) {
      // Delete after too many attempts
      await supabase
        .from("genesis_verification_codes")
        .delete()
        .eq("id", verification.id);

      return new Response(
        JSON.stringify({ success: false, error: "Muitas tentativas. Solicite um novo código." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment attempts
    await supabase
      .from("genesis_verification_codes")
      .update({ attempts: verification.attempts + 1 })
      .eq("id", verification.id);

    // Verify code
    if (verification.code !== code) {
      return new Response(
        JSON.stringify({ success: false, error: "Código incorreto" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Code is valid - mark as verified
    await supabase
      .from("genesis_verification_codes")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", verification.id);

    // Log success
    await supabase.from("system_logs").insert({
      log_type: "genesis_verification",
      source: "genesis-verify-code",
      message: `Código Genesis verificado com sucesso para ${cleanPhone}`,
      severity: "info",
      details: { phone: cleanPhone, email: verification.email },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Código verificado com sucesso!",
        data: {
          phone: verification.phone,
          email: verification.email,
          name: verification.name,
          passwordHash: verification.password_hash,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
