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

    // Try to send code via configured verification sender (preferred)
    let sent = false;
    let sendErrorMessage: string | null = null;

    // 1) Load global config (if exists)
    let cfg: any = null;
    try {
      const { data: cfgRow, error: cfgErr } = await supabase
        .from("owner_settings")
        .select("setting_value")
        .eq("setting_key", "phone_verification_config")
        .maybeSingle();

      if (!cfgErr && cfgRow?.setting_value) {
        cfg = cfgRow.setting_value;
      }
    } catch (_) {
      // Ignore if table doesn't exist in this environment
    }

    const senderInstanceId = cfg?.instance_id as string | undefined;
    const senderBackendUrl = cfg?.backend_url as string | undefined;
    const senderBackendToken = cfg?.backend_token as string | undefined;

    // 2) If no global config, try to use the owner instance (legacy fallback)
    let fallbackSender: { instance_id: string; backend_url: string | null; backend_token: string | null } | null = null;
    if (!senderInstanceId || !senderBackendUrl) {
      const { data: genesisUser } = await supabase
        .from("genesis_users")
        .select("id")
        .eq("email", "lyronrp@gmail.com")
        .maybeSingle();

      if (genesisUser?.id) {
        const { data: instance } = await supabase
          .from("genesis_instances")
          .select("id, backend_url, backend_token")
          .eq("user_id", genesisUser.id)
          .eq("orchestrated_status", "connected")
          .maybeSingle();

        if (instance?.id) {
          fallbackSender = {
            instance_id: instance.id,
            backend_url: instance.backend_url ?? null,
            backend_token: instance.backend_token ?? null,
          };
        }
      }
    }

    const backendUrl = (senderBackendUrl || fallbackSender?.backend_url || "").replace(/\/$/, "");
    const backendToken = senderBackendToken || fallbackSender?.backend_token || "";
    const instanceId = senderInstanceId || fallbackSender?.instance_id || "";

    if (backendUrl && backendToken && instanceId) {
      // Uses the same internal endpoint as other features (send-text)
      const apiUrl = `${backendUrl}/${instanceId}/send-text`;

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${backendToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: cleanPhone,
            message,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          sendErrorMessage = `Falha ao enviar WhatsApp (${response.status}): ${errorText}`;
        } else {
          sent = true;
        }
      } catch (err) {
        sendErrorMessage = `Erro ao enviar WhatsApp: ${String(err)}`;
      }
    } else {
      sendErrorMessage = "Configuração de envio WhatsApp não encontrada";
    }

    // Log the verification attempt
    await supabase.from("system_logs").insert({
      log_type: "genesis_verification",
      source: "genesis-send-verification",
      message: sent
        ? `Código de verificação Genesis enviado para ${cleanPhone}`
        : `Código gerado mas NÃO enviado para ${cleanPhone}`,
      severity: sent ? "info" : "warn",
      details: {
        phone: cleanPhone,
        email,
        sent,
        error: sendErrorMessage,
      },
    });

    if (!sent) {
      return new Response(
        JSON.stringify({
          success: false,
          error: sendErrorMessage || "Não foi possível enviar o código no WhatsApp",
          phoneLastDigits: cleanPhone.slice(-4),
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
