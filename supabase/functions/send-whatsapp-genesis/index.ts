import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// INSTÂNCIA GLOBAL NATIVA - usada para TODOS os afiliados
const GLOBAL_GENESIS_INSTANCE_ID = 'b2b6cf5a-2e15-4f79-94fb-396385077658';

interface SendRequest {
  affiliateId: string;
  phone: string;
  message: string;
  countryCode?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { affiliateId, phone, message, countryCode = 'BR' }: SendRequest = await req.json();

    if (!affiliateId || !phone || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Não precisamos mais do affiliate, vamos usar a instância global diretamente
    // Mantemos a validação do affiliateId apenas para logging

    // USAR INSTÂNCIA GLOBAL NATIVA
    // Não depende mais de affiliate_prospect_settings ou instâncias do usuário
    const instanceId = GLOBAL_GENESIS_INSTANCE_ID;
    
    console.log(`[send-whatsapp-genesis] Usando instância global: ${instanceId}`);

    // Get global instance details
    const { data: instance, error: instError } = await supabase
      .from('genesis_instances')
      .select('id, name, backend_url, backend_token, status')
      .eq('id', instanceId)
      .single();

    if (instError || !instance) {
      console.error('[send-whatsapp-genesis] Instância global não encontrada:', instError);
      return new Response(
        JSON.stringify({ success: false, error: 'Instância Genesis global não configurada no sistema' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (instance.status !== 'connected') {
      console.error('[send-whatsapp-genesis] Instância global desconectada');
      return new Response(
        JSON.stringify({ success: false, error: 'Instância Genesis global está desconectada. Contate o suporte.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number
    let normalizedPhone = phone.replace(/\D/g, '');
    
    // Add country code prefix if needed
    const countryPrefixes: Record<string, string> = {
      BR: '55', PT: '351', ES: '34', MX: '52', AR: '54', CO: '57',
      CL: '56', PE: '51', US: '1', UK: '44', DE: '49', FR: '33',
      IT: '39', CA: '1', AU: '61', JP: '81',
    };
    
    const prefix = countryPrefixes[countryCode] || '55';
    
    // For Brazil, handle special cases
    if (countryCode === 'BR') {
      if (normalizedPhone.length === 10 || normalizedPhone.length === 11) {
        normalizedPhone = prefix + normalizedPhone;
      }
    } else {
      // For other countries, add prefix if not present
      if (!normalizedPhone.startsWith(prefix)) {
        normalizedPhone = prefix + normalizedPhone;
      }
    }

    console.log(`[send-whatsapp-genesis] Enviando para ${normalizedPhone} via instância global ${instance.name}`);

    // Send via Genesis backend
    const sendUrl = `${instance.backend_url}/message/sendText/${instance.name}`;
    
    const sendResponse = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': instance.backend_token,
      },
      body: JSON.stringify({
        number: normalizedPhone,
        text: message,
        delay: 1500, // typing indicator delay
      }),
    });

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.error('Genesis send error:', sendResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Erro ao enviar: ${sendResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sendResult = await sendResponse.json();
    console.log('Send result:', sendResult);

    // Log the message (use affiliateId for tracking)
    await supabase.from('whatsapp_message_logs').insert({
      instance_id: instanceId,
      contact_phone: normalizedPhone,
      message_type: 'text',
      direction: 'outbound',
      content: message,
      status: 'sent',
      metadata: { source: 'demo_booking', affiliateId, global_instance: true },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem enviada com sucesso!',
        result: sendResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
