/**
 * CHECKOUT SYSTEM - API Functions
 * Integração com edge functions do checkout
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentStatusResponse,
  CheckoutPayment,
  PaymentEvent,
} from './types';

function getInvokeErrorMessage(err: unknown): string {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;

  const maybeObj = err as { message?: string; context?: { status?: number; statusText?: string } };
  if (maybeObj?.message) return maybeObj.message;

  const status = maybeObj?.context?.status;
  const statusText = maybeObj?.context?.statusText;
  if (status) return `Erro ${status}${statusText ? `: ${statusText}` : ''}`;

  return 'Erro inesperado';
}

/**
 * Cria um novo pagamento
 */
export async function createPayment(
  request: CreatePaymentRequest
): Promise<CreatePaymentResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('checkout-create-payment', {
      body: {
        customer: request.customer,
        amountCents: request.amountCents,
        description: request.description,
        paymentMethod: request.paymentMethod,
        installments: request.installments,
        planId: request.planId,
        promoLinkId: request.promoLinkId,
        source: request.source,
        metadata: request.metadata,
      },
    });

    if (error) {
      return {
        success: false,
        error: getInvokeErrorMessage(error),
      };
    }

    return {
      success: true,
      paymentCode: data?.paymentCode,
      pixBrCode: data?.pixBrCode,
      pixQrCodeBase64: data?.pixQrCodeBase64,
      abacatepayUrl: data?.abacatepayUrl,
      expiresAt: data?.expiresAt,
    };
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return {
      success: false,
      error: 'Erro de conexão. Tente novamente.',
    };
  }
}

/**
 * Verifica o status de um pagamento
 */
export async function checkPaymentStatus(
  paymentCode: string
): Promise<PaymentStatusResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('checkout-check-status', {
      body: { code: paymentCode },
    });

    if (error) {
      return {
        status: 'pending',
        error: getInvokeErrorMessage(error),
      };
    }

    return {
      status: data?.status,
      paidAt: data?.paidAt,
    };
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return {
      status: 'pending',
      error: 'Erro de conexão',
    };
  }
}

/**
 * Busca dados de um pagamento pelo código (com dados do cliente)
 */
export async function getPaymentByCode(
  paymentCode: string
): Promise<CheckoutPayment | null> {
  try {
    const { data, error } = await supabase
      .from('checkout_payments')
      .select(`
        *,
        checkout_customers (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('payment_code', paymentCode)
      .single();

    if (error || !data) {
      console.error('Erro ao buscar pagamento:', error);
      return null;
    }

    // Check if payment is expired locally (frontend safety check)
    let status = data.status;
    if (status === 'pending' && data.expires_at) {
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        status = 'expired';
      }
    }

    // Build customer data from related table
    const customer = data.checkout_customers as { 
      first_name: string; 
      last_name: string; 
      email?: string;
      phone?: string;
    } | null;
    const customerName = customer 
      ? `${customer.first_name} ${customer.last_name}`.trim()
      : undefined;
    const customerEmail = customer?.email;
    const customerPhone = customer?.phone;

    return {
      id: data.id,
      paymentCode: data.payment_code,
      customerId: data.customer_id,
      customerName,
      customerEmail,
      customerPhone,
      amountCents: data.amount_cents,
      currency: data.currency,
      description: data.description,
      abacatepayBillingId: data.abacatepay_billing_id,
      abacatepayUrl: data.abacatepay_url,
      pixBrCode: data.pix_br_code,
      pixQrCodeBase64: data.pix_qr_code_base64,
      cardLastFour: data.card_last_four,
      cardBrand: data.card_brand,
      installments: data.installments,
      paymentMethod: data.payment_method as 'PIX' | 'CARD',
      status: status as any,
      expiresAt: data.expires_at,
      paidAt: data.paid_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      metadata: data.metadata as Record<string, unknown>,
    };
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    return null;
  }
}

/**
 * Busca eventos de um pagamento
 */
export async function getPaymentEvents(
  paymentId: string
): Promise<PaymentEvent[]> {
  try {
    const { data, error } = await supabase
      .from('checkout_payment_events')
      .select('*')
      .eq('payment_id', paymentId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Erro ao buscar eventos:', error);
      return [];
    }

    return data.map((event) => ({
      id: event.id,
      paymentId: event.payment_id,
      eventType: event.event_type,
      eventData: event.event_data as Record<string, unknown>,
      source: event.source as any,
      createdAt: event.created_at,
    }));
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return [];
  }
}

/**
 * Gerar novo pagamento para um código expirado
 */
export async function regeneratePayment(
  paymentCode: string
): Promise<CreatePaymentResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('checkout-regenerate', {
      body: { paymentCode },
    });

    if (error) {
      return {
        success: false,
        error: getInvokeErrorMessage(error),
      };
    }

    return {
      success: true,
      paymentCode: data?.paymentCode,
      pixBrCode: data?.pixBrCode,
      pixQrCodeBase64: data?.pixQrCodeBase64,
      expiresAt: data?.expiresAt,
    };
  } catch (error) {
    console.error('Erro ao regenerar pagamento:', error);
    return {
      success: false,
      error: 'Erro de conexão. Tente novamente.',
    };
  }
}
