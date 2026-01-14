import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Get affiliate's user_id
    const { data: affiliate, error: affError } = await supabase
      .from('affiliates')
      .select('user_id')
      .eq('id', affiliateId)
      .single();

    if (affError || !affiliate?.user_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Afiliado não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get affiliate's prospect settings for genesis_instance_id
    const { data: settings } = await supabase
      .from('affiliate_prospect_settings')
      .select('genesis_instance_id')
      .eq('affiliate_id', affiliateId)
      .single();

    let instanceId = settings?.genesis_instance_id;

    // If no instance in settings, get first connected instance for this user
    if (!instanceId) {
      const { data: instances } = await supabase
        .from('genesis_instances')
        .select('id')
        .eq('user_id', affiliate.user_id)
        .eq('status', 'connected')
        .limit(1);

      if (instances && instances.length > 0) {
        instanceId = instances[0].id;
      }
    }

    if (!instanceId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhuma instância Genesis conectada. Configure em Prospecção > Configurações.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get instance details
    const { data: instance, error: instError } = await supabase
      .from('genesis_instances')
      .select('id, name, backend_url, backend_token, status')
      .eq('id', instanceId)
      .single();

    if (instError || !instance) {
      return new Response(
        JSON.stringify({ success: false, error: 'Instância Genesis não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (instance.status !== 'connected') {
      return new Response(
        JSON.stringify({ success: false, error: 'Instância Genesis não está conectada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Format for WhatsApp
    const jid = `${normalizedPhone}@s.whatsapp.net`;

    console.log(`Sending to ${jid} via instance ${instance.name}`);

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

    // Log the message
    await supabase.from('whatsapp_message_logs').insert({
      instance_id: instanceId,
      contact_phone: normalizedPhone,
      message_type: 'text',
      direction: 'outbound',
      content: message,
      status: 'sent',
      metadata: { source: 'prospecting', affiliateId },
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
