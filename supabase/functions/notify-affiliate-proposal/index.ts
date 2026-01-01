import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  proposalId: string;
  type: 'accepted' | 'commission_paid';
  proposalValue?: number;
  commissionAmount?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { proposalId, type, proposalValue, commissionAmount } = payload;

    if (!proposalId || !type) {
      throw new Error("proposalId e type são obrigatórios");
    }

    console.log(`[notify-affiliate-proposal] Processing ${type} notification for proposal ${proposalId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY não configurada - notificação não enviada");
      return new Response(
        JSON.stringify({ success: false, message: "RESEND_API_KEY não configurada" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar proposta com dados do afiliado
    const { data: proposal, error: proposalError } = await supabase
      .from("affiliate_proposals")
      .select(`
        *,
        affiliates:affiliate_id (name, email, whatsapp, available_balance)
      `)
      .eq("id", proposalId)
      .single();

    if (proposalError || !proposal) {
      console.error("Proposta não encontrada:", proposalError);
      throw new Error("Proposta não encontrada");
    }

    const affiliateEmail = proposal.affiliates?.email;
    const affiliateName = proposal.affiliates?.name || "Parceiro";

    if (!affiliateEmail) {
      console.warn("Email do afiliado não encontrado");
      return new Response(
        JSON.stringify({ success: false, message: "Email do afiliado não encontrado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    };

    let subject: string;
    let emailHtml: string;

    if (type === 'accepted') {
      subject = `🎉 Proposta Aceita - ${proposal.company_name}`;
      emailHtml = generateAcceptedEmailHtml({
        affiliateName,
        companyName: proposal.company_name,
        proposalValue: proposalValue || proposal.proposal_value || 0,
        commissionAmount: commissionAmount || proposal.commission_amount || 0,
        formatCurrency,
      });
    } else {
      subject = `💰 Comissão Disponível - ${proposal.company_name}`;
      emailHtml = generateCommissionPaidEmailHtml({
        affiliateName,
        companyName: proposal.company_name,
        commissionAmount: commissionAmount || proposal.commission_amount || 0,
        newBalance: proposal.affiliates?.available_balance || 0,
        formatCurrency,
      });
    }

    // Enviar email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Genesis <noreply@genesisbarber.com.br>",
        to: [affiliateEmail],
        subject,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("Resend error:", errorData);
      throw new Error("Falha ao enviar email de notificação");
    }

    console.log(`[notify-affiliate-proposal] Email sent successfully to ${affiliateEmail}`);

    // Log do envio
    await supabase.from("email_logs").insert({
      recipient_email: affiliateEmail,
      recipient_name: affiliateName,
      subject,
      template_type: type === 'accepted' ? "proposal_accepted" : "commission_paid",
      status: "sent",
      metadata: {
        proposal_id: proposalId,
        affiliate_id: proposal.affiliate_id,
        type,
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: "Notificação enviada com sucesso" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateAcceptedEmailHtml(params: {
  affiliateName: string;
  companyName: string;
  proposalValue: number;
  commissionAmount: number;
  formatCurrency: (value: number) => string;
}): string {
  const { affiliateName, companyName, proposalValue, commissionAmount, formatCurrency } = params;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposta Aceita!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 32px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Parabéns!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">Sua proposta foi aceita!</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #334155; line-height: 1.6;">
        Olá <strong>${affiliateName}</strong>,
      </p>
      <p style="font-size: 16px; color: #334155; line-height: 1.6;">
        Temos uma ótima notícia! A proposta que você enviou para <strong>${companyName}</strong> foi aceita!
      </p>

      <!-- Stats -->
      <div style="margin: 32px 0; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 24px;">
        <div style="display: flex; justify-content: space-around; text-align: center;">
          <div>
            <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Valor do Contrato</p>
            <p style="margin: 8px 0 0 0; color: #059669; font-size: 24px; font-weight: 700;">${formatCurrency(proposalValue)}</p>
          </div>
          <div style="border-left: 2px solid #86efac; padding-left: 24px;">
            <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Sua Comissão</p>
            <p style="margin: 8px 0 0 0; color: #059669; font-size: 24px; font-weight: 700;">${formatCurrency(commissionAmount)}</p>
          </div>
        </div>
      </div>

      <div style="background: #fefce8; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; color: #854d0e; font-size: 14px;">
          ⏳ <strong>Aguardando Liberação:</strong> Sua comissão será disponibilizada para saque assim que o pagamento do cliente for confirmado.
        </p>
      </div>

      <p style="font-size: 16px; color: #334155; line-height: 1.6;">
        Continue fazendo um excelente trabalho! Acesse seu painel para acompanhar todas as suas propostas e comissões.
      </p>

      <!-- CTA -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://parceiros.genesishub.cloud" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Acessar Meu Painel
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #1e293b; padding: 24px 32px; text-align: center;">
      <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px;">
        Equipe <strong style="color: #ffffff;">Genesis Hub</strong>
      </p>
      <p style="color: rgba(255,255,255,0.5); margin: 12px 0 0 0; font-size: 12px;">
        Portal de Parceiros
      </p>
    </div>
  </div>
</body>
</html>
`;
}

function generateCommissionPaidEmailHtml(params: {
  affiliateName: string;
  companyName: string;
  commissionAmount: number;
  newBalance: number;
  formatCurrency: (value: number) => string;
}): string {
  const { affiliateName, companyName, commissionAmount, newBalance, formatCurrency } = params;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comissão Liberada!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 32px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 16px;">💰</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Comissão Liberada!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">Seu saldo foi atualizado</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #334155; line-height: 1.6;">
        Olá <strong>${affiliateName}</strong>,
      </p>
      <p style="font-size: 16px; color: #334155; line-height: 1.6;">
        A comissão referente à proposta da <strong>${companyName}</strong> foi liberada e já está disponível para saque!
      </p>

      <!-- Stats -->
      <div style="margin: 32px 0; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 12px; padding: 24px;">
        <div style="display: flex; justify-content: space-around; text-align: center;">
          <div>
            <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Comissão Liberada</p>
            <p style="margin: 8px 0 0 0; color: #d97706; font-size: 24px; font-weight: 700;">${formatCurrency(commissionAmount)}</p>
          </div>
          <div style="border-left: 2px solid #fcd34d; padding-left: 24px;">
            <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Saldo Disponível</p>
            <p style="margin: 8px 0 0 0; color: #059669; font-size: 24px; font-weight: 700;">${formatCurrency(newBalance)}</p>
          </div>
        </div>
      </div>

      <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; color: #166534; font-size: 14px;">
          ✅ <strong>Pronto para Sacar:</strong> Acesse seu painel e solicite o saque via PIX a qualquer momento!
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://parceiros.genesishub.cloud" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Solicitar Saque
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #1e293b; padding: 24px 32px; text-align: center;">
      <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px;">
        Equipe <strong style="color: #ffffff;">Genesis Hub</strong>
      </p>
      <p style="color: rgba(255,255,255,0.5); margin: 12px 0 0 0; font-size: 12px;">
        Portal de Parceiros
      </p>
    </div>
  </div>
</body>
</html>
`;
}
