import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadNotificationRequest {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  planType: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, whatsapp, planType }: LeadNotificationRequest = await req.json();

    console.log(`[Lead Notification] Processing lead: ${firstName} ${lastName}, plan: ${planType}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get email template
    const { data: emailTemplate } = await supabase
      .from("email_templates")
      .select("*")
      .eq("template_type", "lead_confirmation")
      .eq("is_active", true)
      .single();

    // Send confirmation email
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey && emailTemplate) {
      try {
        const resend = new Resend(resendApiKey);
        
        // Replace variables in template
        let htmlContent = emailTemplate.html_content
          .replace(/\{\{nome\}\}/g, firstName)
          .replace(/\{\{plano\}\}/g, planType === 'vitalicio' ? 'Vitalício' : 'Premium')
          .replace(/\{\{email\}\}/g, email);

        const subject = emailTemplate.subject
          .replace(/\{\{nome\}\}/g, firstName)
          .replace(/\{\{plano\}\}/g, planType === 'vitalicio' ? 'Vitalício' : 'Premium');

        await resend.emails.send({
          from: "Genesis Hub <noreply@genesishub.cloud>",
          to: [email],
          subject: subject,
          html: htmlContent,
        });

        console.log(`[Lead Notification] Email sent to ${email}`);

        // Log email
        await supabase.from("email_logs").insert({
          recipient_email: email,
          recipient_name: `${firstName} ${lastName}`,
          subject: subject,
          template_type: "lead_confirmation",
          status: "sent",
          metadata: { planType }
        });

      } catch (emailError) {
        console.error("[Lead Notification] Email error:", emailError);
      }
    }

    // Get WhatsApp template and config
    const { data: whatsappTemplate } = await supabase
      .from("whatsapp_templates")
      .select("*")
      .eq("template_type", "lead_welcome")
      .eq("is_active", true)
      .single();

    const { data: chatproConfig } = await supabase
      .from("chatpro_config")
      .select("*")
      .eq("is_enabled", true)
      .limit(1)
      .single();

    // Send WhatsApp if configured
    if (chatproConfig && whatsappTemplate) {
      try {
        const message = whatsappTemplate.message_template
          .replace(/\{\{nome\}\}/g, firstName)
          .replace(/\{\{plano\}\}/g, planType === 'vitalicio' ? 'Vitalício' : 'Premium');

        const formattedPhone = whatsapp.replace(/\D/g, '');
        const fullPhone = formattedPhone.startsWith('55') ? formattedPhone : `55${formattedPhone}`;

        const chatproUrl = `${chatproConfig.base_endpoint}/${chatproConfig.instance_id}/api/v1/send_message`;
        
        await fetch(chatproUrl, {
          method: 'POST',
          headers: {
            'Authorization': chatproConfig.api_token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            number: fullPhone,
            message: message
          })
        });

        console.log(`[Lead Notification] WhatsApp sent to ${fullPhone}`);

      } catch (whatsappError) {
        console.error("[Lead Notification] WhatsApp error:", whatsappError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notifications sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[Lead Notification] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
