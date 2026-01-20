import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const paymentCode = url.searchParams.get('code');

    if (!paymentCode) {
      return new Response(
        JSON.stringify({ error: 'Payment code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking status for payment:', paymentCode);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get payment from database
    const { data: payment, error: paymentError } = await supabase
      .from('checkout_payments')
      .select('id, status, paid_at, expires_at, abacatepay_billing_id')
      .eq('payment_code', paymentCode)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If already paid or expired, return current status
    if (payment.status === 'paid' || payment.status === 'expired') {
      console.log('Payment already finalized:', payment.status);
      return new Response(
        JSON.stringify({ 
          status: payment.status, 
          paidAt: payment.paid_at 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    if (payment.expires_at && new Date(payment.expires_at) < new Date()) {
      console.log('Payment expired, updating status');
      await supabase
        .from('checkout_payments')
        .update({ status: 'expired' })
        .eq('id', payment.id);

      await supabase.from('checkout_payment_events').insert({
        payment_id: payment.id,
        event_type: 'payment_expired',
        source: 'system',
      });

      return new Response(
        JSON.stringify({ status: 'expired' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check with AbacatePay API
    const ABACATEPAY_API_KEY = Deno.env.get('ABACATEPAY_API_KEY');
    if (ABACATEPAY_API_KEY && payment.abacatepay_billing_id) {
      try {
        console.log('Checking AbacatePay status for billing:', payment.abacatepay_billing_id);
        
        const abacateResponse = await fetch(
          `https://api.abacatepay.com/v1/billing/${payment.abacatepay_billing_id}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (abacateResponse.ok) {
          const abacateData = await abacateResponse.json();
          console.log('AbacatePay status response:', abacateData);

          // Check if paid
          if (abacateData.data?.status === 'PAID' || abacateData.data?.status === 'COMPLETED') {
            const paidAt = new Date().toISOString();
            
            await supabase
              .from('checkout_payments')
              .update({ 
                status: 'paid', 
                paid_at: paidAt 
              })
              .eq('id', payment.id);

            await supabase.from('checkout_payment_events').insert({
              payment_id: payment.id,
              event_type: 'payment_confirmed',
              event_data: { source: 'polling', abacateStatus: abacateData.data?.status },
              source: 'api',
            });

            console.log('Payment confirmed via polling');
            return new Response(
              JSON.stringify({ status: 'paid', paidAt }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (abacateError) {
        console.error('Error checking AbacatePay:', abacateError);
        // Continue with current status if API check fails
      }
    }

    // Return current status
    return new Response(
      JSON.stringify({ 
        status: payment.status,
        paidAt: payment.paid_at
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
