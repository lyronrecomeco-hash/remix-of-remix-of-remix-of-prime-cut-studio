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
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: 'Telefone e código são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone - remove country code if present, keep only 11 digits
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('55') && cleanPhone.length === 13) {
      cleanPhone = cleanPhone.slice(2);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get verification record - try both formats
    let { data: verification, error: fetchError } = await supabase
      .from('phone_verification_codes')
      .select('*')
      .eq('phone', cleanPhone)
      .eq('code', code)
      .is('verified_at', null)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !verification) {
      // Check if code exists but is expired or already used
      const { data: expiredCode } = await supabase
        .from('phone_verification_codes')
        .select('expires_at, verified_at, attempts')
        .eq('phone', cleanPhone)
        .eq('code', code)
        .single();

      if (expiredCode?.verified_at) {
        return new Response(
          JSON.stringify({ error: 'Código já utilizado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (expiredCode && new Date(expiredCode.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Código expirado. Solicite um novo.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update attempt count for the most recent code
      const { data: latestCode } = await supabase
        .from('phone_verification_codes')
        .select('id, attempts')
        .eq('phone', cleanPhone)
        .is('verified_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestCode) {
        const newAttempts = (latestCode.attempts || 0) + 1;
        
        await supabase
          .from('phone_verification_codes')
          .update({ attempts: newAttempts })
          .eq('id', latestCode.id);

        // Check if too many attempts
        if (newAttempts >= 5) {
          // Invalidate this code
          await supabase
            .from('phone_verification_codes')
            .update({ verified_at: new Date().toISOString() })
            .eq('id', latestCode.id);

          return new Response(
            JSON.stringify({ error: 'Muitas tentativas incorretas. Solicite um novo código.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ error: 'Código inválido. Verifique e tente novamente.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check max attempts
    if (verification.attempts >= 5) {
      return new Response(
        JSON.stringify({ error: 'Muitas tentativas. Solicite um novo código.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark as verified
    await supabase
      .from('phone_verification_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', verification.id);

    // Log success
    await supabase.from('system_logs').insert({
      log_type: 'phone_verification_success',
      source: 'verify-phone-code',
      message: `Telefone ${cleanPhone} verificado com sucesso`,
      severity: 'info',
      details: { phone: cleanPhone, email: verification.email }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Telefone verificado com sucesso!',
        data: {
          phone: verification.phone,
          email: verification.email,
          name: verification.name,
          passwordHash: verification.password_hash,
        }
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
