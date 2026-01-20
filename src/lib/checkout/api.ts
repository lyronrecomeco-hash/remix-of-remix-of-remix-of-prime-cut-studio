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
  PaymentEvent 
} from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Cria um novo pagamento
 */
export async function createPayment(
  request: CreatePaymentRequest
): Promise<CreatePaymentResponse> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/checkout-create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erro ao criar pagamento',
      };
    }

    return {
      success: true,
      paymentCode: data.paymentCode,
      pixBrCode: data.pixBrCode,
      pixQrCodeBase64: data.pixQrCodeBase64,
      abacatepayUrl: data.abacatepayUrl,
      expiresAt: data.expiresAt,
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
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/checkout-check-status?code=${encodeURIComponent(paymentCode)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      return {
        status: 'pending',
        error: data.error || 'Erro ao verificar status',
      };
    }

    return {
      status: data.status,
      paidAt: data.paidAt,
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
 * Busca dados de um pagamento pelo código
 */
export async function getPaymentByCode(
  paymentCode: string
): Promise<CheckoutPayment | null> {
  try {
    const { data, error } = await supabase
      .from('checkout_payments')
      .select('*')
      .eq('payment_code', paymentCode)
      .single();

    if (error || !data) {
      console.error('Erro ao buscar pagamento:', error);
      return null;
    }

    return {
      id: data.id,
      paymentCode: data.payment_code,
      customerId: data.customer_id,
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
      status: data.status as any,
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
    const response = await fetch(`${SUPABASE_URL}/functions/v1/checkout-regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentCode }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erro ao regenerar pagamento',
      };
    }

    return {
      success: true,
      paymentCode: data.paymentCode,
      pixBrCode: data.pixBrCode,
      pixQrCodeBase64: data.pixQrCodeBase64,
      expiresAt: data.expiresAt,
    };
  } catch (error) {
    console.error('Erro ao regenerar pagamento:', error);
    return {
      success: false,
      error: 'Erro de conexão. Tente novamente.',
    };
  }
}
