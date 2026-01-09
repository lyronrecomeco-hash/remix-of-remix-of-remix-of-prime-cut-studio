import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, email, name, passwordHash, action = 'register' } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Telefone é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limiting (max 3 codes per phone in 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('phone_verification_codes')
      .select('*', { count: 'exact', head: true })
      .eq('phone', formattedPhone)
      .gte('created_at', tenMinutesAgo);

    if (count && count >= 3) {
      return new Response(
        JSON.stringify({ error: 'Muitas tentativas. Aguarde alguns minutos.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store verification code
    const { error: insertError } = await supabase
      .from('phone_verification_codes')
      .insert({
        phone: formattedPhone,
        code,
        email,
        name,
        password_hash: passwordHash,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar código' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get WhatsApp instance for sending
    const { data: instance } = await supabase
      .from('genesis_instances')
      .select('id, instance_key, api_token')
      .eq('status', 'connected')
      .limit(1)
      .single();

    if (!instance) {
      // Fallback: return code for testing (in production, send via SMS gateway)
      console.log('No WhatsApp instance available, code:', code);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Código de verificação enviado!',
          // Remove in production - only for testing
          _testCode: Deno.env.get('ENVIRONMENT') === 'development' ? code : undefined
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send via WhatsApp
    const message = `🔐 *Código de Verificação*\n\nSeu código é: *${code}*\n\nVálido por 10 minutos.\n\n_Não compartilhe este código._`;

    try {
      const chatproUrl = `https://api.chatpro.com.br/${instance.instance_key}/api/v1/send_message`;
      const response = await fetch(chatproUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': instance.api_token || '',
        },
        body: JSON.stringify({
          number: formattedPhone,
          message,
        }),
      });

      if (!response.ok) {
        console.error('WhatsApp send failed:', await response.text());
      }
    } catch (sendError) {
      console.error('Error sending WhatsApp:', sendError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Código de verificação enviado para seu WhatsApp!',
        phoneLastDigits: formattedPhone.slice(-4),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
