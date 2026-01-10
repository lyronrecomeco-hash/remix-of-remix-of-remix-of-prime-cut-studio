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

    // Format phone number - normalize to 11 digits (DDD + number)
    let cleanPhone = phone.replace(/\D/g, '');
    
    // If starts with 55 (country code), remove it for storage but keep for sending
    if (cleanPhone.startsWith('55') && cleanPhone.length === 13) {
      cleanPhone = cleanPhone.slice(2);
    }
    
    if (cleanPhone.length !== 11) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp deve ter 11 dígitos (DDD + número)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format for sending (with country code)
    const formattedPhone = `55${cleanPhone}`;

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
      .eq('phone', cleanPhone)
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
        phone: cleanPhone,
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

    // Get verification config from database
    const { data: verifyConfig } = await supabase
      .from('verification_config')
      .select('*')
      .eq('config_type', 'phone_verification')
      .eq('is_enabled', true)
      .single();

    if (!verifyConfig) {
      console.log('Phone verification not configured, code saved:', code);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Código gerado (WhatsApp não configurado)',
          code_saved: true,
          _testCode: Deno.env.get('ENVIRONMENT') === 'development' ? code : undefined
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = verifyConfig.config_value as {
      send_via: string;
      instance_id: string;
      backend_url: string;
      backend_token: string;
      message_template?: string;
    };

    // Build message from template
    let message = config.message_template || 
      '🔐 *Código de Verificação*\n\nOlá {{name}}! 👋\n\nSeu código é: *{{code}}*\n\n⏱️ Válido por 10 minutos.\n🔒 Não compartilhe este código.';
    
    message = message
      .replace(/\{\{name\}\}/g, name?.split(' ')[0] || 'Usuário')
      .replace(/\{\{code\}\}/g, code);

    console.log('Sending verification to:', formattedPhone);
    console.log('Using backend:', config.backend_url);
    console.log('Instance ID:', config.instance_id);

    // Send via Evolution API
    try {
      const evolutionUrl = `${config.backend_url.replace(/\/$/, '')}/message/sendText/${config.instance_id}`;
      
      console.log('Evolution API URL:', evolutionUrl);
      
      const response = await fetch(evolutionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.backend_token,
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: message,
        }),
      });

      const responseText = await response.text();
      console.log('Evolution response status:', response.status);
      console.log('Evolution response:', responseText);

      if (!response.ok) {
        // Try to parse error
        let errorMessage = 'Falha ao enviar código no WhatsApp';
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Keep default message
        }

        // Log error
        await supabase.from('system_logs').insert({
          log_type: 'phone_verification_error',
          source: 'send-phone-verification',
          message: 'Erro ao enviar código de verificação via Evolution API',
          severity: 'error',
          details: { 
            phone: cleanPhone, 
            status: response.status,
            response: responseText.substring(0, 500)
          }
        });

        // Still return success since code is saved
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Código gerado. Verifique se o número está correto.',
            warning: errorMessage,
            phoneLastDigits: cleanPhone.slice(-4),
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log success
      await supabase.from('system_logs').insert({
        log_type: 'phone_verification',
        source: 'send-phone-verification',
        message: `Código de verificação enviado para ${cleanPhone}`,
        severity: 'info',
        details: { phone: cleanPhone, email }
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Código de verificação enviado para seu WhatsApp!',
          phoneLastDigits: cleanPhone.slice(-4),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (sendError: any) {
      console.error('Error sending via Evolution API:', sendError);
      
      // Log error
      await supabase.from('system_logs').insert({
        log_type: 'phone_verification_error',
        source: 'send-phone-verification',
        message: 'Erro de conexão com Evolution API',
        severity: 'error',
        details: { error: sendError.message, phone: cleanPhone }
      });

      // Return success anyway since code is saved
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Código gerado. WhatsApp temporariamente indisponível.',
          code_saved: true,
          phoneLastDigits: cleanPhone.slice(-4),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
