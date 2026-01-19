import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendContractRequest {
  phone: string;
  contractorName: string;
  contractNumber: string;
  signatureUrl: string;
  serviceName: string;
  totalValue: number;
}

const normalizePhone = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  if (!cleaned.startsWith("55") && (cleaned.length === 10 || cleaned.length === 11)) {
    cleaned = "55" + cleaned;
  }
  return cleaned;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, contractorName, contractNumber, signatureUrl, serviceName, totalValue }: SendContractRequest = await req.json();

    if (!phone || !contractNumber || !signatureUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Dados obrigatórios não fornecidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Buscar instância do lyronrp@gmail.com
    const { data: genesisUser } = await supabaseAdmin
      .from("genesis_users")
      .select("id")
      .eq("email", "lyronrp@gmail.com")
      .maybeSingle();

    if (!genesisUser?.id) {
      console.error("Genesis user not found: lyronrp@gmail.com");
      return new Response(
        JSON.stringify({ success: false, error: 'Instância de envio não configurada' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: instance } = await supabaseAdmin
      .from("genesis_instances")
      .select("id, name, backend_url, backend_token")
      .eq("user_id", genesisUser.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!instance?.id) {
      console.error("No instance found for genesis user");
      return new Response(
        JSON.stringify({ success: false, error: 'Nenhuma instância WhatsApp encontrada' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar config global
    const { data: globalConfig } = await supabaseAdmin
      .from("whatsapp_backend_config")
      .select("backend_url, master_token")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const backendUrl = String(globalConfig?.backend_url || instance.backend_url || "").trim().replace(/\/+$/, "");
    const backendToken = String(globalConfig?.master_token || instance.backend_token || "").trim();

    if (!backendUrl || !backendToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Backend WhatsApp não configurado' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    // Mensagem profissional
    const message = `📋 *CONTRATO DE PRESTAÇÃO DE SERVIÇOS*

Olá *${contractorName}*! 👋

Um novo contrato foi gerado para você através do *Genesis Hub*.

📌 *Detalhes do Contrato:*
• Número: *${contractNumber}*
• Serviço: *${serviceName}*
• Valor: *${formatCurrency(totalValue)}*

✍️ *Assinar Digitalmente:*
${signatureUrl}

Para assinar o contrato de forma segura e legalmente válida, basta clicar no link acima.

A assinatura eletrônica possui validade jurídica conforme a Medida Provisória 2.200-2/2001.

Em caso de dúvidas, entre em contato conosco.

_Enviado automaticamente por Genesis Hub_`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${backendToken}`,
      "apikey": backendToken,
    };

    const payload = {
      to: normalizedPhone,
      phone: normalizedPhone,
      number: normalizedPhone,
      message,
      text: message,
    };

    // Tentar enviar
    const sendPath = `/api/instance/${encodeURIComponent(String(instance.id))}/send`;
    const targetUrl = `${backendUrl}${sendPath}`;

    console.log(`Sending contract WhatsApp to ${normalizedPhone} via ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log(`Response status: ${response.status}, body: ${responseText}`);

    let parsed: any = {};
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = { raw: responseText };
    }

    if (response.ok || parsed.success || parsed.sent || parsed.status === 'sent') {
      return new Response(
        JSON.stringify({ success: true, message: 'Contrato enviado com sucesso via WhatsApp' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Tentar endpoint alternativo
    const altPath = `/api/instance/${encodeURIComponent(String(instance.id))}/sendText`;
    const altUrl = `${backendUrl}${altPath}`;
    
    console.log(`Retrying with alternative endpoint: ${altUrl}`);
    
    const altResponse = await fetch(altUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const altText = await altResponse.text();
    console.log(`Alt response: ${altResponse.status}, body: ${altText}`);

    let altParsed: any = {};
    try {
      altParsed = JSON.parse(altText);
    } catch {
      altParsed = { raw: altText };
    }

    if (altResponse.ok || altParsed.success || altParsed.sent) {
      return new Response(
        JSON.stringify({ success: true, message: 'Contrato enviado com sucesso via WhatsApp' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Falha ao enviar mensagem', details: altParsed }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending contract WhatsApp:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao enviar contrato' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
