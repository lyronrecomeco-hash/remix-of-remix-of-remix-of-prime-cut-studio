import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    const { data: payment, error: paymentError } = await supabase
      .from('checkout_payments')
      .select('id, status, paid_at, expires_at, abacatepay_billing_id, asaas_payment_id, payment_method, gateway')
      .eq('payment_code', paymentCode)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payment.status === 'paid' || payment.status === 'expired') {
      console.log('Payment already finalized:', payment.status);
      return new Response(
        JSON.stringify({ status: payment.status, paidAt: payment.paid_at }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payment.expires_at && new Date(payment.expires_at) < new Date()) {
      console.log('Payment expired, updating status');
      await supabase.from('checkout_payments').update({ status: 'expired' }).eq('id', payment.id);
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

    // Check with appropriate gateway
    const gateway = payment.gateway || 'abacatepay';
    let isPaid = false;

    if (gateway === 'asaas' && payment.asaas_payment_id) {
      const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');
      const ASAAS_SANDBOX = Deno.env.get('ASAAS_SANDBOX') === 'true';
      
      if (ASAAS_API_KEY) {
        try {
          const baseUrl = ASAAS_SANDBOX 
            ? 'https://sandbox.asaas.com/api/v3' 
            : 'https://api.asaas.com/v3';

          console.log('[Asaas] Checking payment status:', payment.asaas_payment_id);
          
          const asaasResponse = await fetch(`${baseUrl}/payments/${payment.asaas_payment_id}`, {
            headers: {
              'access_token': ASAAS_API_KEY,
              'Content-Type': 'application/json',
            },
          });

          if (asaasResponse.ok) {
            const asaasData = await asaasResponse.json();
            console.log('[Asaas] Status response:', asaasData.status);

            // Asaas statuses: PENDING, RECEIVED, CONFIRMED, OVERDUE, REFUNDED, RECEIVED_IN_CASH, etc.
            isPaid = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(asaasData.status);
          }
        } catch (asaasError) {
          console.error('[Asaas] Error checking status:', asaasError);
        }
      }
    } else if (gateway === 'abacatepay' && payment.abacatepay_billing_id) {
      const ABACATEPAY_API_KEY = Deno.env.get('ABACATEPAY_API_KEY');
      
      if (ABACATEPAY_API_KEY) {
        try {
          console.log('[AbacatePay] Checking status:', payment.abacatepay_billing_id);
          
          let checkUrl = '';
          if (payment.payment_method === 'PIX') {
            checkUrl = `https://api.abacatepay.com/v1/pixQrCode/check?id=${payment.abacatepay_billing_id}`;
          } else {
            checkUrl = `https://api.abacatepay.com/v1/billing/list`;
          }
          
          const abacateResponse = await fetch(checkUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          if (abacateResponse.ok) {
            const abacateData = await abacateResponse.json();
            console.log('[AbacatePay] Status response:', abacateData);

            if (payment.payment_method === 'PIX') {
              isPaid = abacateData.data?.status === 'PAID' || abacateData.data?.status === 'COMPLETED';
            } else {
              const billings = abacateData.data || [];
              const matchingBilling = billings.find((b: any) => b.id === payment.abacatepay_billing_id);
              isPaid = matchingBilling?.status === 'PAID' || matchingBilling?.status === 'COMPLETED';
            }
          }
        } catch (abacateError) {
          console.error('[AbacatePay] Error checking status:', abacateError);
        }
      }
    }

    if (isPaid) {
      const paidAt = new Date().toISOString();
      
      await supabase
        .from('checkout_payments')
        .update({ status: 'paid', paid_at: paidAt })
        .eq('id', payment.id);

      await supabase.from('checkout_payment_events').insert({
        payment_id: payment.id,
        event_type: 'payment_confirmed',
        event_data: { source: 'polling', gateway },
        source: 'api',
      });

      console.log('Payment confirmed via polling');
      return new Response(
        JSON.stringify({ status: 'paid', paidAt }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ status: payment.status, paidAt: payment.paid_at }),
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
