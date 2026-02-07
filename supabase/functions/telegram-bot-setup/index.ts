import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!BOT_TOKEN) {
      return new Response(
        JSON.stringify({ error: "TELEGRAM_BOT_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "set";

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-bot`;

    if (action === "set") {
      // Register webhook
      const res = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ["message", "callback_query"],
            drop_pending_updates: true,
          }),
        },
      );

      const result = await res.json();
      console.log("Set webhook result:", result);

      return new Response(
        JSON.stringify({ success: result.ok, webhook_url: webhookUrl, result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "delete") {
      const res = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`,
        { method: "POST" },
      );
      const result = await res.json();

      return new Response(
        JSON.stringify({ success: result.ok, result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "info") {
      const res = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`,
      );
      const result = await res.json();

      // Also get bot info
      const botRes = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getMe`,
      );
      const botInfo = await botRes.json();

      return new Response(
        JSON.stringify({ webhook: result.result, bot: botInfo.result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: set, delete, info" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Setup error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
