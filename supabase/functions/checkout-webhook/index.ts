import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret, asaas-access-token, x-cakto-signature',
};

// Plan mapping configuration
const PLAN_CONFIG: Record<number, { plan: string; plan_name: string; max_instances: number; max_flows: number }> = {
  1: { plan: 'starter', plan_name: 'Plano Mensal', max_instances: 3, max_flows: 10 },
  3: { plan: 'professional', plan_name: 'Plano Trimestral', max_instances: 5, max_flows: 25 },
  12: { plan: 'enterprise', plan_name: 'Plano Anual', max_instances: 10, max_flows: 50 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get webhook secrets from headers and query
    const webhookSecret = req.headers.get('x-webhook-secret');
    const asaasToken = req.headers.get('asaas-access-token');
    const url = new URL(req.url);
    const querySecret = url.searchParams.get('secret');
    const receivedSecret = webhookSecret || querySecret;
    
    // Get webhook config from database
    const { data: webhookConfig } = await supabase
      .from('checkout_webhook_config')
      .select('webhook_secret, is_active')
      .eq('is_active', true)
      .single();

    // Get gateway config for webhook token validation
    const { data: gatewayConfig } = await supabase
      .from('checkout_gateway_config')
      .select('webhook_secret, gateway')
      .eq('is_active', true)
      .single();

    const validAbacateSecret = webhookConfig?.webhook_secret || Deno.env.get('ABACATEPAY_WEBHOOK_SECRET');
    const validAsaasToken = gatewayConfig?.webhook_secret || Deno.env.get('ASAAS_WEBHOOK_TOKEN');

    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Detect webhook source and extract payment info
    let gateway: 'abacatepay' | 'asaas' | 'misticpay' | 'cakto' = 'abacatepay';
    let paymentId: string | null = null;
    let eventType: string = '';
    let newStatus: string = 'pending';

    // Check if this is a Cakto webhook - support both English and Portuguese event names
    const caktoEventMap: Record<string, string> = {
      // Portuguese (as sent by Cakto API)
      'pix_gerado': 'pix_generated',
      'compra_aprovada': 'purchase_approved',
      'compra_recusada': 'purchase_refused',
      'compra_reembolsada': 'purchase_refunded',
      'compra_chargeback': 'purchase_chargeback',
      'checkout_iniciado': 'initiate_checkout',
      'carrinho_abandonado': 'checkout_abandonment',
      'pix_expirado': 'pix_expired',
      'boleto_gerado': 'boleto_generated',
      'boleto_expirado': 'boleto_expired',
      'assinatura_ativa': 'subscription_active',
      'assinatura_cancelada': 'subscription_cancelled',
      'assinatura_atrasada': 'subscription_overdue',
      'waiting_payment': 'pix_generated',
      // English
      'initiate_checkout': 'initiate_checkout',
      'pix_generated': 'pix_generated',
      'pix_expired': 'pix_expired',
      'purchase_approved': 'purchase_approved',
      'purchase_refused': 'purchase_refused',
      'purchase_refunded': 'purchase_refunded',
      'purchase_chargeback': 'purchase_chargeback',
      'checkout_abandonment': 'checkout_abandonment',
      'boleto_generated': 'boleto_generated',
      'boleto_expired': 'boleto_expired',
      'subscription_active': 'subscription_active',
      'subscription_cancelled': 'subscription_cancelled',
      'subscription_overdue': 'subscription_overdue',
    };
    const rawCaktoEvent = body.event || body.type || body.event_type;
    // Also detect Cakto by presence of data.offer or data.product or data.subscription
    const hasCaktoStructure = body.data?.offer || body.data?.product || body.data?.subscription || body.data?.pix;
    const normalizedCaktoEvent = rawCaktoEvent ? caktoEventMap[rawCaktoEvent] : null;
    
    if (normalizedCaktoEvent || (hasCaktoStructure && rawCaktoEvent)) {
      const possibleCaktoEvent = normalizedCaktoEvent || rawCaktoEvent;
      gateway = 'cakto';
      
      const caktoOrder = body.order || body.data || body;
      paymentId = body.id || body.transaction_id || body.order_id || body.checkout_id 
        || caktoOrder.id || caktoOrder.transaction_id || null;

      console.log(`[Cakto Webhook] Event: ${possibleCaktoEvent}, PaymentId: ${paymentId}`);

      // Extract customer & product data from Cakto payload
      const caktoCustomer = body.customer || caktoOrder.customer || {};
      const caktoProduct = body.product || caktoOrder.product || {};
      const caktoOffer = body.offer || caktoOrder.offer || {};
      const orderValue = body.value || body.amount || caktoOrder.value || caktoOrder.amount || null;

      // ========= LOG TO genesis_cakto_events =========
      try {
        // Find instance_id linked to this user/integration
        let caktoInstanceId: string | null = null;
        
        // Try finding by customer email in genesis_users -> genesis_instances
        const customerEmail = (caktoCustomer.email || body.email || '').toLowerCase();
        if (customerEmail) {
          const { data: gUser } = await supabase
            .from('genesis_users')
            .select('id')
            .eq('email', customerEmail)
            .maybeSingle();
          
          if (gUser) {
            const { data: gInstance } = await supabase
              .from('genesis_instances')
              .select('id')
              .eq('user_id', gUser.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            if (gInstance) caktoInstanceId = gInstance.id;
          }
        }

        // If no instance found, try getting any active instance
        if (!caktoInstanceId) {
          const { data: anyInstance } = await supabase
            .from('genesis_instances')
            .select('id')
            .eq('status', 'connected')
            .limit(1)
            .maybeSingle();
          if (anyInstance) caktoInstanceId = anyInstance.id;
        }

        if (caktoInstanceId) {
          const eventInsert = {
            instance_id: caktoInstanceId,
            event_type: possibleCaktoEvent,
            external_id: paymentId || crypto.randomUUID(),
            customer_name: caktoCustomer.name || `${caktoCustomer.first_name || ''} ${caktoCustomer.last_name || ''}`.trim() || null,
            customer_email: customerEmail || null,
            customer_phone: caktoCustomer.phone || caktoCustomer.cellphone || null,
            product_id: caktoProduct.id || caktoProduct.external_id || null,
            product_name: caktoProduct.name || caktoProduct.title || null,
            offer_id: caktoOffer.id || caktoOffer.external_id || null,
            offer_name: caktoOffer.name || caktoOffer.title || null,
            order_value: orderValue ? Number(orderValue) / 100 : null,
            currency: body.currency || caktoOrder.currency || 'BRL',
            raw_payload: body,
            processed: false,
          };

          await supabase.from('genesis_cakto_events').insert(eventInsert);
          console.log(`[Cakto Events] Logged event: ${possibleCaktoEvent} for instance ${caktoInstanceId}`);

          // ========= UPDATE genesis_cakto_analytics =========
          const today = new Date().toISOString().split('T')[0];
          const analyticsField: Record<string, string> = {
            initiate_checkout: 'checkouts_started',
            purchase_approved: 'purchases_approved',
            purchase_refused: 'purchases_refused',
            purchase_refunded: 'purchases_refunded',
            purchase_chargeback: 'purchases_chargeback',
            checkout_abandonment: 'cart_abandonments',
            pix_generated: 'pix_generated',
            pix_expired: 'pix_expired',
          };

          const fieldToUpdate = analyticsField[possibleCaktoEvent];
          if (fieldToUpdate) {
            // Upsert analytics row for today
            const { data: existingAnalytics } = await supabase
              .from('genesis_cakto_analytics')
              .select('id, ' + fieldToUpdate + ', total_revenue')
              .eq('instance_id', caktoInstanceId)
              .eq('date', today)
              .maybeSingle();

            if (existingAnalytics) {
              const updateObj: Record<string, unknown> = {
                [fieldToUpdate]: (existingAnalytics[fieldToUpdate as keyof typeof existingAnalytics] as number || 0) + 1,
                updated_at: new Date().toISOString(),
              };
              if (possibleCaktoEvent === 'purchase_approved' && orderValue) {
                updateObj.total_revenue = (Number(existingAnalytics.total_revenue) || 0) + Number(orderValue) / 100;
              }
              await supabase
                .from('genesis_cakto_analytics')
                .update(updateObj)
                .eq('id', existingAnalytics.id);
            } else {
              const insertObj: Record<string, unknown> = {
                instance_id: caktoInstanceId,
                integration_id: caktoInstanceId,
                date: today,
                [fieldToUpdate]: 1,
              };
              if (possibleCaktoEvent === 'purchase_approved' && orderValue) {
                insertObj.total_revenue = Number(orderValue) / 100;
              }
              await supabase.from('genesis_cakto_analytics').insert(insertObj);
            }
            console.log(`[Cakto Analytics] Updated ${fieldToUpdate} for ${today}`);
          }
        }
      } catch (caktoLogError) {
        console.error('[Cakto Events] Error logging event:', caktoLogError);
        // Don't fail the webhook
      }

      // Map to payment status
      switch (possibleCaktoEvent) {
        case 'pix_generated':
        case 'boleto_generated':
        case 'initiate_checkout':
          eventType = possibleCaktoEvent;
          newStatus = 'pending';
          break;
        case 'purchase_approved':
          newStatus = 'paid';
          eventType = 'payment_confirmed';
          break;
        case 'purchase_refused':
          newStatus = 'failed';
          eventType = 'payment_failed';
          break;
        case 'purchase_refunded':
          newStatus = 'refunded';
          eventType = 'payment_refunded';
          break;
        case 'purchase_chargeback':
          newStatus = 'refunded';
          eventType = 'payment_chargeback';
          break;
        case 'pix_expired':
        case 'boleto_expired':
          newStatus = 'expired';
          eventType = 'payment_expired';
          break;
        case 'checkout_abandonment':
          eventType = 'checkout_abandonment';
          newStatus = 'pending';
          break;
        default:
          eventType = possibleCaktoEvent;
      }
    }
    // Check if this is a MisticPay webhook (has transactionId, transactionType, and transactionMethod)
    else if (body.transactionId && body.transactionType && body.transactionMethod === 'PIX') {
      gateway = 'misticpay';
      paymentId = String(body.transactionId);
      const misticStatus = body.status;

      console.log('[MisticPay Webhook] Status:', misticStatus, 'TransactionId:', paymentId);

      switch (misticStatus) {
        case 'COMPLETO':
          newStatus = 'paid';
          eventType = 'payment_confirmed';
          break;
        case 'FALHA':
          newStatus = 'failed';
          eventType = 'payment_failed';
          break;
        case 'PENDENTE':
        default:
          eventType = 'payment_pending';
      }
    }
    // Check if this is an Asaas webhook (has event and payment object)
    else if (body.event && body.payment) {
      gateway = 'asaas';
      paymentId = body.payment.id;
      const asaasEvent = body.event;

      // Validate Asaas token if configured
      if (validAsaasToken && asaasToken && asaasToken !== validAsaasToken) {
        console.error('Invalid Asaas webhook token');
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[Asaas Webhook] Event:', asaasEvent, 'Payment:', paymentId);

      switch (asaasEvent) {
        case 'PAYMENT_RECEIVED':
        case 'PAYMENT_CONFIRMED':
          newStatus = 'paid';
          eventType = 'payment_confirmed';
          break;
        case 'PAYMENT_OVERDUE':
          newStatus = 'expired';
          eventType = 'payment_expired';
          break;
        case 'PAYMENT_DELETED':
        case 'PAYMENT_REFUNDED':
          newStatus = 'refunded';
          eventType = 'payment_refunded';
          break;
        case 'PAYMENT_ANTICIPATED':
        case 'PAYMENT_CREATED':
        case 'PAYMENT_UPDATED':
          eventType = asaasEvent.toLowerCase();
          break;
        default:
          console.log('Unhandled Asaas event:', asaasEvent);
          eventType = asaasEvent.toLowerCase();
      }
    } else {
      // AbacatePay webhook format
      const { event, data } = body;
      gateway = 'abacatepay';
      paymentId = data?.id || data?.billingId;

      // Validate AbacatePay secret if configured
      if (validAbacateSecret && receivedSecret !== validAbacateSecret) {
        console.error('Invalid AbacatePay webhook secret');
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!event || !data) {
        console.log('Invalid webhook payload');
        return new Response(
          JSON.stringify({ error: 'Invalid payload' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[AbacatePay Webhook] Event:', event, 'BillingId:', paymentId);

      switch (event) {
        case 'billing.paid':
        case 'payment.confirmed':
        case 'BILLING_PAID':
          newStatus = 'paid';
          eventType = 'payment_confirmed';
          break;
        case 'billing.expired':
        case 'payment.expired':
        case 'BILLING_EXPIRED':
          newStatus = 'expired';
          eventType = 'payment_expired';
          break;
        case 'billing.failed':
        case 'payment.failed':
        case 'BILLING_FAILED':
          newStatus = 'failed';
          eventType = 'payment_failed';
          break;
        case 'billing.refunded':
        case 'payment.refunded':
        case 'BILLING_REFUNDED':
          newStatus = 'refunded';
          eventType = 'payment_refunded';
          break;
        default:
          console.log('Unhandled event type:', event);
          eventType = event;
      }
    }

    if (!paymentId) {
      console.log('No payment ID in webhook');
      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find payment by gateway-specific ID
    let payment;
    if (gateway === 'cakto') {
      // For Cakto, try to find by cakto_order_id first, then by payment_code
      const { data, error } = await supabase
        .from('checkout_payments')
        .select('id, status, payment_code, plan_id, customer_id, promo_link_id, amount_cents')
        .or(`cakto_order_id.eq.${paymentId},payment_code.ilike.%${paymentId}%`)
        .maybeSingle();
      payment = data;
      if (error) console.log('Cakto payment lookup error:', error);
      
      // If not found by order_id, try extracting customer email and finding by that
      if (!payment && body.customer?.email) {
        const customerEmail = (body.customer?.email || '').toLowerCase();
        console.log('[Cakto Webhook] Payment not found by ID, trying by customer email:', customerEmail);
        
        const { data: customerData } = await supabase
          .from('checkout_customers')
          .select('id')
          .eq('email', customerEmail)
          .maybeSingle();
        
        if (customerData) {
          const { data: paymentByCustomer } = await supabase
            .from('checkout_payments')
            .select('id, status, payment_code, plan_id, customer_id, promo_link_id, amount_cents')
            .eq('customer_id', customerData.id)
            .eq('gateway', 'cakto')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          payment = paymentByCustomer;
        }
      }
    } else if (gateway === 'misticpay') {
      const { data, error } = await supabase
        .from('checkout_payments')
        .select('id, status, payment_code, plan_id, customer_id, promo_link_id, amount_cents')
        .or(`misticpay_transaction_id.eq.${paymentId},payment_code.ilike.%${paymentId}%`)
        .single();
      payment = data;
      if (error) console.log('Payment lookup error:', error);
    } else if (gateway === 'asaas') {
      const { data, error } = await supabase
        .from('checkout_payments')
        .select('id, status, payment_code, plan_id, customer_id, promo_link_id, amount_cents')
        .eq('asaas_payment_id', paymentId)
        .single();
      payment = data;
      if (error) console.log('Payment lookup error:', error);
    } else {
      const { data, error } = await supabase
        .from('checkout_payments')
        .select('id, status, payment_code, plan_id, customer_id, promo_link_id, amount_cents')
        .eq('abacatepay_billing_id', paymentId)
        .single();
      payment = data;
      if (error) console.log('Payment lookup error:', error);
    }

    if (!payment) {
      console.log('Payment not found for:', paymentId);
      return new Response(
        JSON.stringify({ received: true, message: 'Payment not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found payment:', payment.payment_code, 'Current status:', payment.status, 'New status:', newStatus);

    // Update payment status if changed
    const wasAlreadyPaid = payment.status === 'paid';
    if (newStatus !== 'pending' && newStatus !== payment.status) {
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }

      await supabase
        .from('checkout_payments')
        .update(updateData)
        .eq('id', payment.id);

      console.log('Updated payment status to:', newStatus);
    }

    // ============= ACTIVATE SUBSCRIPTION WHEN PAYMENT IS CONFIRMED =============
    if (newStatus === 'paid' && !wasAlreadyPaid) {
      console.log('[Subscription Activation] Starting activation flow...');
      
      try {
        // 1. Get customer info
        const { data: customer } = await supabase
          .from('checkout_customers')
          .select('email, first_name, last_name, phone')
          .eq('id', payment.customer_id)
          .single();

        if (!customer?.email) {
          console.error('[Subscription Activation] Customer not found or no email');
        } else {
          console.log('[Subscription Activation] Customer:', customer.email);

          // 2. Get plan info - try multiple sources
          let durationMonths = 1; // Default to monthly
          let planConfig = PLAN_CONFIG[1];

          if (payment.plan_id) {
            const { data: plan } = await supabase
              .from('checkout_plans')
              .select('duration_months, name')
              .eq('id', payment.plan_id)
              .single();

            if (plan?.duration_months) {
              durationMonths = plan.duration_months;
              planConfig = PLAN_CONFIG[durationMonths] || PLAN_CONFIG[1];
              console.log('[Subscription Activation] Plan from plan_id:', plan.name, 'Duration:', durationMonths, 'months');
            }
          } else {
            // Try to infer plan from payment amount
            console.log('[Subscription Activation] No plan_id, attempting to infer from amount:', payment.amount_cents);
            
            const { data: matchingPlan } = await supabase
              .from('checkout_plans')
              .select('id, name, duration_months')
              .or(`price_cents.eq.${payment.amount_cents},promo_price_cents.eq.${payment.amount_cents}`)
              .eq('is_active', true)
              .limit(1)
              .maybeSingle();
            
            if (matchingPlan?.duration_months) {
              durationMonths = matchingPlan.duration_months;
              planConfig = PLAN_CONFIG[durationMonths] || PLAN_CONFIG[1];
              console.log('[Subscription Activation] Plan inferred from amount:', matchingPlan.name, 'Duration:', durationMonths, 'months');
              
              // Update payment with plan_id for consistency
              await supabase
                .from('checkout_payments')
                .update({ plan_id: matchingPlan.id })
                .eq('id', payment.id);
            } else {
              console.log('[Subscription Activation] Could not infer plan, defaulting to monthly');
            }
          }

          // 3. Find or create genesis_user by email
          let genesisUser: { id: string; auth_user_id: string | null } | null = null;
          
          const { data: existingGenesisUser } = await supabase
            .from('genesis_users')
            .select('id, auth_user_id')
            .eq('email', customer.email.toLowerCase())
            .maybeSingle();

          if (existingGenesisUser) {
            genesisUser = existingGenesisUser;
            console.log('[Subscription Activation] Found genesis_user:', genesisUser.id);
          } else {
            // Auto-create auth user + genesis_user when payment confirmed
            console.log('[Subscription Activation] Creating user for:', customer.email);
            
            // Create auth user with temporary password (user will set real password on /cakto-return)
            const tempPassword = crypto.randomUUID().substring(0, 16) + 'A1!';
            const displayName = `${customer.first_name} ${customer.last_name}`.trim() || customer.email.split('@')[0];
            
            const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
              email: customer.email.toLowerCase(),
              password: tempPassword,
              email_confirm: true,
              user_metadata: {
                name: displayName,
                phone: customer.phone || null,
                source: 'cakto_webhook',
                needs_password_reset: true,
              },
            });

            if (authError || !newAuthUser.user) {
              console.error('[Subscription Activation] Error creating auth user:', authError);
            } else {
              // Create genesis_user
              const { data: newGenesisUser, error: guError } = await supabase
                .from('genesis_users')
                .insert({
                  auth_user_id: newAuthUser.user.id,
                  name: displayName,
                  email: customer.email.toLowerCase(),
                  phone: customer.phone || null,
                  is_active: true,
                })
                .select('id, auth_user_id')
                .single();
              
              if (guError) {
                console.error('[Subscription Activation] Error creating genesis_user:', guError);
              } else {
                genesisUser = newGenesisUser;
                console.log('[Subscription Activation] Created auth + genesis user:', genesisUser.id);
              }
            }
          }

          if (!genesisUser) {
            console.log('[Subscription Activation] Could not find or create user, skipping');
          } else {

            // 4. Calculate expiration date
            const now = new Date();
            const expiresAt = new Date(now);
            expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

            // 5. Upsert subscription
            const { data: existingSub } = await supabase
              .from('genesis_subscriptions')
              .select('id, expires_at')
              .eq('user_id', genesisUser.id)
              .single();

            const subscriptionData = {
              user_id: genesisUser.id,
              plan: planConfig.plan,
              plan_name: planConfig.plan_name,
              status: 'active',
              max_instances: planConfig.max_instances,
              max_flows: planConfig.max_flows,
              started_at: now.toISOString(),
              expires_at: expiresAt.toISOString(),
              updated_at: now.toISOString(),
            };

            if (existingSub) {
              // If subscription exists and hasn't expired, extend from current expiration
              if (existingSub.expires_at && new Date(existingSub.expires_at) > now) {
                const currentExpiry = new Date(existingSub.expires_at);
                currentExpiry.setMonth(currentExpiry.getMonth() + durationMonths);
                subscriptionData.expires_at = currentExpiry.toISOString();
                console.log('[Subscription Activation] Extending existing subscription to:', subscriptionData.expires_at);
              }

              await supabase
                .from('genesis_subscriptions')
                .update(subscriptionData)
                .eq('id', existingSub.id);

              console.log('[Subscription Activation] Updated subscription:', existingSub.id);
            } else {
              const { data: newSub, error: subError } = await supabase
                .from('genesis_subscriptions')
                .insert(subscriptionData)
                .select('id')
                .single();

              if (subError) {
                console.error('[Subscription Activation] Error creating subscription:', subError);
              } else {
                console.log('[Subscription Activation] Created subscription:', newSub?.id);
              }
            }

            // 6. Add bonus credits for new purchase
            const { data: existingCredits } = await supabase
              .from('genesis_credits')
              .select('id, available_credits, total_purchased')
              .eq('user_id', genesisUser.id)
              .single();

            const bonusCredits = durationMonths >= 12 ? 500 : durationMonths >= 3 ? 400 : 300;

            if (existingCredits) {
              await supabase
                .from('genesis_credits')
                .update({
                  available_credits: (existingCredits.available_credits || 0) + bonusCredits,
                  total_purchased: (existingCredits.total_purchased || 0) + bonusCredits,
                  last_purchase_at: now.toISOString(),
                  updated_at: now.toISOString(),
                })
                .eq('id', existingCredits.id);
              console.log('[Subscription Activation] Added', bonusCredits, 'bonus credits');
            } else {
              await supabase.from('genesis_credits').insert({
                user_id: genesisUser.id,
                available_credits: bonusCredits,
                used_credits: 0,
                total_purchased: bonusCredits,
                last_purchase_at: now.toISOString(),
              });
              console.log('[Subscription Activation] Created credits with', bonusCredits, 'initial credits');
            }

            // 7. Log activation event
            await supabase.from('checkout_payment_events').insert({
              payment_id: payment.id,
              event_type: 'subscription_activated',
              event_data: {
                user_id: genesisUser.id,
                plan: planConfig.plan,
                plan_name: planConfig.plan_name,
                duration_months: durationMonths,
                expires_at: subscriptionData.expires_at,
                bonus_credits: bonusCredits,
              },
              source: 'webhook',
            });

            console.log('[Subscription Activation] ✅ Complete!');
          }
          
          // ============= REGISTER PROMO REFERRAL =============
          if (payment.promo_link_id) {
            console.log('[Promo Referral] Registering referral for promo_link_id:', payment.promo_link_id);
            
            try {
              // Get plan info for referral
              let planType = 'monthly';
              let planValue = payment.amount_cents / 100;
              
              if (payment.plan_id) {
                const { data: planData } = await supabase
                  .from('checkout_plans')
                  .select('name, duration_months')
                  .eq('id', payment.plan_id)
                  .single();
                
                if (planData) {
                  planType = planData.duration_months === 12 ? 'yearly' : 
                             planData.duration_months === 3 ? 'quarterly' : 'monthly';
                }
              }
              
              // Check if referral already exists
              const { data: existingReferral } = await supabase
                .from('promo_referrals')
                .select('id')
                .eq('promo_link_id', payment.promo_link_id)
                .eq('referred_email', customer.email.toLowerCase())
                .maybeSingle();
              
              if (!existingReferral) {
                // Create new referral
                await supabase.from('promo_referrals').insert({
                  promo_link_id: payment.promo_link_id,
                  referred_email: customer.email.toLowerCase(),
                  referred_name: `${customer.first_name} ${customer.last_name}`.trim(),
                  plan_type: planType,
                  plan_value: planValue,
                  payment_id: payment.id,
                  status: 'active',
                });
                
                console.log('[Promo Referral] ✅ Referral registered successfully');
              } else {
                // Update existing referral with payment
                await supabase
                  .from('promo_referrals')
                  .update({
                    payment_id: payment.id,
                    plan_value: planValue,
                    status: 'active',
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', existingReferral.id);
                
                console.log('[Promo Referral] ✅ Referral updated with payment');
              }
            } catch (referralError) {
              console.error('[Promo Referral] Error:', referralError);
              // Don't fail the webhook
            }
          }
        }
      } catch (activationError) {
        console.error('[Subscription Activation] Error:', activationError);
        // Don't fail the webhook, just log the error
      }
    }

    // Log webhook event
    await supabase.from('checkout_payment_events').insert({
      payment_id: payment.id,
      event_type: eventType,
      event_data: body,
      source: 'webhook',
    });

    // Update webhook config last received
    if (webhookConfig) {
      await supabase
        .from('checkout_webhook_config')
        .update({ last_received_at: new Date().toISOString() })
        .eq('webhook_secret', webhookConfig.webhook_secret);
    }

    console.log('Webhook processed successfully');

    return new Response(
      JSON.stringify({ received: true, status: newStatus }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
