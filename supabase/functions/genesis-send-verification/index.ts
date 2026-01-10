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
    const { phone, email, name, passwordHash } = await req.json();

    if (!phone || !email || !name) {
      return new Response(
        JSON.stringify({ success: false, error: "Dados incompletos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 12 || cleanPhone.length > 13) {
      return new Response(
        JSON.stringify({ success: false, error: "Número de telefone inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store verification code with expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    // Delete any existing codes for this phone
    await supabase
      .from("genesis_verification_codes")
      .delete()
      .eq("phone", cleanPhone);

    // Insert new code
    const { error: insertError } = await supabase
      .from("genesis_verification_codes")
      .insert({
        phone: cleanPhone,
        email,
        name,
        password_hash: passwordHash,
        code,
        expires_at: expiresAt,
        attempts: 0,
      });

    if (insertError) {
      console.error("Error inserting code:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao gerar código" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Genesis instance for lyronrp@gmail.com to send the message
    const { data: genesisUser } = await supabase
      .from("genesis_users")
      .select("id")
      .eq("email", "lyronrp@gmail.com")
      .single();

    if (!genesisUser) {
      console.error("Genesis user not found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Código gerado (envio manual necessário)",
          phoneLastDigits: cleanPhone.slice(-4),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get connected instance
    const { data: instance } = await supabase
      .from("genesis_instances")
      .select("instance_key, evolution_api_url, evolution_api_key")
      .eq("user_id", genesisUser.id)
      .eq("orchestrated_status", "connected")
      .single();

    if (!instance) {
      console.error("No connected instance found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Código gerado",
          phoneLastDigits: cleanPhone.slice(-4),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format message
    const message = `🔐 *Genesis Hub - Verificação*

Olá! Aqui está seu código para ativação do seu cadastro na Genesis:

*${code}*

⚠️ *Não compartilhe esse código com ninguém!*

Este código expira em 5 minutos.`;

    // Send via Evolution API
    const evolutionUrl = instance.evolution_api_url || "https://api.evolution-api.cloud";
    const evolutionKey = instance.evolution_api_key;
    const instanceKey = instance.instance_key;

    try {
      const response = await fetch(
        `${evolutionUrl}/message/sendText/${instanceKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": evolutionKey,
          },
          body: JSON.stringify({
            number: cleanPhone,
            text: message,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Evolution API error:", errorText);
      } else {
        console.log("Message sent successfully to", cleanPhone);
      }
    } catch (sendError) {
      console.error("Error sending message:", sendError);
    }

    // Log the verification attempt
    await supabase.from("system_logs").insert({
      log_type: "genesis_verification",
      source: "genesis-send-verification",
      message: `Código de verificação Genesis enviado para ${cleanPhone}`,
      severity: "info",
      details: { phone: cleanPhone, email },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Código de verificação enviado para seu WhatsApp!",
        phoneLastDigits: cleanPhone.slice(-4),
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
