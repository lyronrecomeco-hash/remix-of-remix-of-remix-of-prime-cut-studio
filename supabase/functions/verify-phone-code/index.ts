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

    // Format phone number
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get verification record
    const { data: verification, error: fetchError } = await supabase
      .from('phone_verification_codes')
      .select('*')
      .eq('phone', formattedPhone)
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
        .select('expires_at, verified_at')
        .eq('phone', formattedPhone)
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
          JSON.stringify({ error: 'Código expirado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update attempt count
      await supabase
        .from('phone_verification_codes')
        .update({ attempts: verification?.attempts ? verification.attempts + 1 : 1 })
        .eq('phone', formattedPhone)
        .is('verified_at', null);

      return new Response(
        JSON.stringify({ error: 'Código inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check max attempts
    if (verification.attempts >= verification.max_attempts) {
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
