import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RefundRequest {
  paymentCode: string;
}

// Helper to decrypt API key
function decryptApiKey(encrypted: string, userId: string): string {
  const secret = `${userId}-genesis-gateway-2024`;
  const decoded = atob(encrypted);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
  }
  return result;
}

// ============= ASAAS REFUND =============
async function refundAsaas(
  asaasPaymentId: string,
  apiKey: string,
  sandboxMode: boolean
): Promise<{ success: boolean; error?: string }> {
  const baseUrl = sandboxMode 
    ? 'https://api-sandbox.asaas.com/v3' 
    : 'https://api.asaas.com/v3';

  console.log(`[Asaas] Refunding payment ${asaasPaymentId}...`);

  const response = await fetch(`${baseUrl}/payments/${asaasPaymentId}/refund`, {
    method: 'POST',
    headers: {
      'access_token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();
  console.log('[Asaas] Refund response:', JSON.stringify(data));

  if (!response.ok) {
    return { 
      success: false, 
      error: data.errors?.[0]?.description || 'Erro ao estornar no Asaas' 
    };
  }

  return { success: true };
}

// ============= MISTICPAY REFUND (via Withdraw) =============
async function refundMisticPay(
  amountCents: number,
  customerCpf: string,
  clientId: string,
  clientSecret: string
): Promise<{ success: boolean; error?: string }> {
  console.log('[MisticPay] Processing refund via withdraw...');

  // MisticPay doesn't have a refund endpoint
  // We use withdraw to send money back to customer's PIX key (CPF)
  const amountReais = amountCents / 100;

  // First check balance
  const balanceResponse = await fetch('https://api.misticpay.com/api/users/balance', {
    method: 'GET',
    headers: {
      'ci': clientId,
      'cs': clientSecret,
    },
  });

  const balanceData = await balanceResponse.json();
  console.log('[MisticPay] Balance response:', JSON.stringify(balanceData));

  if (!balanceResponse.ok) {
    return { 
      success: false, 
      error: 'Erro ao verificar saldo MisticPay' 
    };
  }

  const availableBalance = balanceData.data?.balance || 0;
  if (availableBalance < amountReais) {
    return { 
      success: false, 
      error: `Saldo insuficiente na MisticPay. Disponível: R$ ${availableBalance.toFixed(2)}` 
    };
  }

  // Process withdraw to customer's CPF as PIX key
  // Clean CPF to only digits for PIX key
  const cleanCpf = customerCpf.replace(/\D/g, '');
  
  const withdrawResponse = await fetch('https://api.misticpay.com/api/transactions/withdraw', {
    method: 'POST',
    headers: {
      'ci': clientId,
      'cs': clientSecret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountReais,
      pixKey: cleanCpf,
      pixKeyType: 'cpf',
      description: 'Reembolso de pagamento',
    }),
  });

  const withdrawData = await withdrawResponse.json();
  console.log('[MisticPay] Withdraw response:', JSON.stringify(withdrawData));

  if (!withdrawResponse.ok) {
    return { 
      success: false, 
      error: withdrawData.message || withdrawData.error || 'Erro ao processar reembolso MisticPay' 
    };
  }

  return { success: true };
}

// ============= ABACATEPAY REFUND =============
async function refundAbacatePay(
  billingId: string,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  console.log(`[AbacatePay] Refunding billing ${billingId}...`);

  // Note: AbacatePay refund endpoint may vary - check their documentation
  const response = await fetch(`https://api.abacatepay.com/v1/billing/${billingId}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();
  console.log('[AbacatePay] Refund response:', JSON.stringify(data));

  if (!response.ok) {
    // If endpoint doesn't exist, try alternative approach
    if (response.status === 404) {
      return { 
        success: false, 
        error: 'AbacatePay não suporta reembolso via API. Realize o estorno manualmente no painel.' 
      };
    }
    return { 
      success: false, 
      error: data.error || 'Erro ao estornar no AbacatePay' 
    };
  }

  return { success: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { paymentCode }: RefundRequest = await req.json();
    
    if (!paymentCode) {
      return new Response(
        JSON.stringify({ error: 'paymentCode é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Refund] Processing refund for payment: ${paymentCode}`);

    // 1. Fetch payment with customer data
    const { data: payment, error: paymentError } = await supabase
      .from('checkout_payments')
      .select(`
        *,
        checkout_customers (
          cpf,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('payment_code', paymentCode)
      .single();

    if (paymentError || !payment) {
      console.error('[Refund] Payment not found:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Pagamento não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Validate status
    if (payment.status !== 'paid') {
      return new Response(
        JSON.stringify({ error: `Apenas pagamentos confirmados podem ser reembolsados. Status atual: ${payment.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const gateway = payment.gateway || 'abacatepay';
    console.log(`[Refund] Gateway: ${gateway} | Amount: ${payment.amount_cents} | Method: ${payment.payment_method}`);

    // 3. Get gateway config
    const { data: gatewayConfig, error: configError } = await supabase
      .from('checkout_gateway_config')
      .select('*')
      .eq('gateway', gateway)
      .eq('api_key_configured', true)
      .single();

    if (configError || !gatewayConfig) {
      // Try fallback to env variables
      const envApiKey = gateway === 'asaas' 
        ? Deno.env.get('ASAAS_API_KEY')
        : Deno.env.get('ABACATEPAY_API_KEY');
      
      if (!envApiKey && gateway !== 'misticpay') {
        console.error('[Refund] No gateway config found');
        return new Response(
          JSON.stringify({ error: `Configuração do gateway ${gateway} não encontrada` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4. Process refund based on gateway
    let refundResult: { success: boolean; error?: string };

    if (gateway === 'asaas') {
      if (!payment.asaas_payment_id) {
        return new Response(
          JSON.stringify({ error: 'ID do pagamento Asaas não encontrado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let apiKey: string;
      let sandboxMode = false;

      if (gatewayConfig?.asaas_access_token_hash) {
        apiKey = decryptApiKey(gatewayConfig.asaas_access_token_hash, gatewayConfig.user_id);
        sandboxMode = gatewayConfig.sandbox_mode || false;
      } else {
        apiKey = Deno.env.get('ASAAS_API_KEY')!;
        sandboxMode = Deno.env.get('ASAAS_SANDBOX') === 'true';
      }

      refundResult = await refundAsaas(payment.asaas_payment_id, apiKey, sandboxMode);

    } else if (gateway === 'misticpay') {
      if (!payment.misticpay_transaction_id) {
        return new Response(
          JSON.stringify({ error: 'ID da transação MisticPay não encontrado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!gatewayConfig?.misticpay_client_id_hash || !gatewayConfig?.misticpay_client_secret_hash) {
        return new Response(
          JSON.stringify({ error: 'Credenciais MisticPay não configuradas' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const clientId = decryptApiKey(gatewayConfig.misticpay_client_id_hash, gatewayConfig.user_id);
      const clientSecret = decryptApiKey(gatewayConfig.misticpay_client_secret_hash, gatewayConfig.user_id);
      const customerCpf = payment.checkout_customers?.cpf || '';

      if (!customerCpf) {
        return new Response(
          JSON.stringify({ error: 'CPF do cliente não encontrado para reembolso' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      refundResult = await refundMisticPay(payment.amount_cents, customerCpf, clientId, clientSecret);

    } else if (gateway === 'abacatepay') {
      if (!payment.abacatepay_billing_id) {
        return new Response(
          JSON.stringify({ error: 'ID da cobrança AbacatePay não encontrado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const apiKey = Deno.env.get('ABACATEPAY_API_KEY');
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'API Key do AbacatePay não configurada' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      refundResult = await refundAbacatePay(payment.abacatepay_billing_id, apiKey);

    } else {
      return new Response(
        JSON.stringify({ error: `Gateway desconhecido: ${gateway}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Handle refund result
    if (!refundResult.success) {
      console.error('[Refund] Failed:', refundResult.error);
      return new Response(
        JSON.stringify({ error: refundResult.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Update payment status to refunded
    const { error: updateError } = await supabase
      .from('checkout_payments')
      .update({ 
        status: 'refunded',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('[Refund] Error updating status:', updateError);
      // Still return success since refund was processed
    }

    // 7. Block user subscription if they have one
    const customerEmail = payment.checkout_customers?.email;
    if (customerEmail) {
      console.log(`[Refund] Looking for genesis_user with email: ${customerEmail}`);
      
      const { data: genesisUser } = await supabase
        .from('genesis_users')
        .select('id, auth_user_id')
        .eq('email', customerEmail.toLowerCase())
        .maybeSingle();

      if (genesisUser) {
        console.log(`[Refund] Found genesis_user: ${genesisUser.id}. Blocking subscription...`);
        
        // Block the subscription
        const { error: subError } = await supabase
          .from('genesis_subscriptions')
          .update({
            status: 'blocked',
            plan: 'free',
            plan_name: 'Conta Bloqueada - Reembolso',
            max_instances: 0,
            max_flows: 0,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', genesisUser.id);

        if (subError) {
          console.error('[Refund] Error blocking subscription:', subError);
        } else {
          console.log('[Refund] ✅ Subscription blocked successfully');
        }

        // Update genesis_user status
        await supabase
          .from('genesis_users')
          .update({ status: 'blocked' })
          .eq('id', genesisUser.id);
      }
    }

    // 8. Log refund event
    await supabase
      .from('checkout_payment_events')
      .insert({
        payment_id: payment.id,
        event_type: 'REFUND_PROCESSED',
        event_data: {
          gateway,
          amount_cents: payment.amount_cents,
          refunded_at: new Date().toISOString(),
          user_blocked: !!customerEmail,
        },
        source: 'manual',
      });

    console.log(`[Refund] Successfully refunded payment ${paymentCode}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Reembolso processado com sucesso',
        paymentCode,
        gateway,
        amountCents: payment.amount_cents,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Refund] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno ao processar reembolso';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
