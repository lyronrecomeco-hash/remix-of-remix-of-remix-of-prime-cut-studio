import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeWhatsAppRequest {
  phone: string;
  name: string;
  email?: string;
}

serve(async (req) => {
  console.log("=== SEND WELCOME WHATSAPP STARTED ===");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { phone, name, email }: WelcomeWhatsAppRequest = await req.json();
    console.log("Sending welcome WhatsApp to:", phone, "Name:", name);

    if (!phone) {
      console.log("No phone provided, skipping WhatsApp");
      return new Response(
        JSON.stringify({ success: false, message: "No phone provided" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get ChatPro config
    const { data: chatproConfig, error: configError } = await supabaseAdmin
      .from("chatpro_config")
      .select("*")
      .single();

    if (configError || !chatproConfig) {
      console.log("ChatPro not configured:", configError?.message);
      return new Response(
        JSON.stringify({ success: false, message: "ChatPro not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!chatproConfig.is_enabled) {
      console.log("ChatPro is disabled");
      return new Response(
        JSON.stringify({ success: false, message: "ChatPro is disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get welcome template
    const { data: template, error: templateError } = await supabaseAdmin
      .from("whatsapp_templates")
      .select("*")
      .eq("template_type", "welcome")
      .eq("is_active", true)
      .single();

    if (templateError || !template) {
      console.log("Welcome template not found or inactive:", templateError?.message);
      return new Response(
        JSON.stringify({ success: false, message: "Welcome template not found or inactive" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Using template:", template.name);

    // Generate message with AI if enabled
    let messageText = template.message_template;

    if (template.use_ai && template.ai_prompt) {
      console.log("Generating message with AI...");
      try {
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        
        if (LOVABLE_API_KEY) {
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "system",
                  content: `Você é um copywriter especializado em mensagens de WhatsApp para barbearias. 
Crie mensagens curtas, calorosas e profissionais. 
Use emojis com moderação.
A mensagem deve parecer pessoal e não automatizada.
NÃO use markdown, apenas texto simples com emojis.
Use *texto* para negrito (formatação do WhatsApp).
Use _texto_ para itálico (formatação do WhatsApp).`,
                },
                {
                  role: "user",
                  content: `${template.ai_prompt}

Nome do cliente: ${name}

Crie uma mensagem personalizada de boas-vindas.`,
                },
              ],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const generatedMessage = aiData.choices?.[0]?.message?.content;
            if (generatedMessage) {
              messageText = generatedMessage;
              console.log("AI generated message successfully");
            }
          } else {
            console.log("AI generation failed, using template");
          }
        }
      } catch (aiError) {
        console.error("AI error:", aiError);
        // Continue with template message
      }
    }

    // Replace variables in message
    messageText = messageText
      .replace(/\{\{nome\}\}/g, name)
      .replace(/\{\{telefone\}\}/g, phone)
      .replace(/\{\{email\}\}/g, email || "");

    // Format phone number for ChatPro
    let formattedPhone = phone.replace(/\D/g, "");
    if (!formattedPhone.startsWith("55")) {
      formattedPhone = "55" + formattedPhone;
    }

    // Build ChatPro API URL
    let baseEndpoint = chatproConfig.base_endpoint || "https://v2.chatpro.com.br";
    if (baseEndpoint.endsWith("/")) {
      baseEndpoint = baseEndpoint.slice(0, -1);
    }
    if (!baseEndpoint.includes("/api/v1")) {
      baseEndpoint = `${baseEndpoint}/${chatproConfig.instance_id}/api/v1`;
    }

    const chatProUrl = `${baseEndpoint}/send_message`;
    console.log("ChatPro URL:", chatProUrl);

    // Prepare request body
    const requestBody: any = {
      number: formattedPhone,
      message: messageText,
    };

    // Add image if configured
    if (template.image_url) {
      requestBody.mediaUrl = template.image_url;
      requestBody.mediaType = "image";
    }

    // Add button if configured
    if (template.button_text && template.button_url) {
      requestBody.buttons = [
        {
          type: "url",
          text: template.button_text,
          url: template.button_url,
        },
      ];
    }

    console.log("Sending to ChatPro:", { number: formattedPhone, hasImage: !!template.image_url });

    // Send message via ChatPro
    const chatProResponse = await fetch(chatProUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: chatproConfig.api_token,
      },
      body: JSON.stringify(requestBody),
    });

    const chatProResult = await chatProResponse.text();
    console.log("ChatPro response:", chatProResponse.status, chatProResult);

    if (!chatProResponse.ok) {
      console.error("ChatPro error:", chatProResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "ChatPro error",
          details: chatProResult 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Welcome WhatsApp sent successfully!");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Welcome WhatsApp sent successfully",
        phone: formattedPhone 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    console.error("Error sending welcome WhatsApp:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
