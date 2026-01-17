import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuração fixa da instância do Petshop
const PETSHOP_INSTANCE = {
  backendUrl: 'http://72.62.108.24:3000',
  backendToken: 'genesis-master-token-2024-secure',
  instanceId: 'b2b6cf5a-2e15-4f79-94fb-396385077658'
};

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('55') && cleaned.length <= 11) {
    cleaned = '55' + cleaned;
  }
  return cleaned;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, message } = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone e message são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedPhone = normalizePhone(phone);
    console.log(`[PetshopWhatsApp] Enviando para: ${normalizedPhone}`);

    // Enviar mensagem via VPS
    const sendUrl = `${PETSHOP_INSTANCE.backendUrl}/api/instance/${PETSHOP_INSTANCE.instanceId}/send`;
    
    const sendResponse = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PETSHOP_INSTANCE.backendToken}`
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        message: message
      })
    });

    const sendResult = await sendResponse.json();
    console.log('[PetshopWhatsApp] Resultado:', sendResult);

    if (sendResponse.ok && (sendResult.success || sendResult.status === 'sent')) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Mensagem enviada com sucesso',
          messageId: sendResult.messageId || sendResult.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('[PetshopWhatsApp] Erro no envio:', sendResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: sendResult.error || 'Falha ao enviar mensagem'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    console.error('[PetshopWhatsApp] Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
