/**
 * CHECKOUT SYSTEM - Type Definitions
 * Sistema isolado de pagamento com AbacatePay
 */

export interface CheckoutCustomer {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  phoneCountryCode: string;
  cpf: string;
}

export interface CheckoutPayment {
  id: string;
  paymentCode: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  amountCents: number;
  currency: string;
  description?: string;
  abacatepayBillingId?: string;
  abacatepayUrl?: string;
  pixBrCode?: string;
  pixQrCodeBase64?: string;
  cardLastFour?: string;
  cardBrand?: string;
  installments?: number;
  paymentMethod: 'PIX' | 'CARD';
  status: PaymentStatus;
  expiresAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export type PaymentStatus = 'pending' | 'paid' | 'expired' | 'failed' | 'refunded' | 'cancelled';

export interface PaymentEvent {
  id: string;
  paymentId: string;
  eventType: string;
  eventData: Record<string, unknown>;
  source: 'system' | 'webhook' | 'polling' | 'manual';
  createdAt: string;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  cpf: string;
  phone: string;
  phoneCountryCode: string;
  email?: string;
  paymentMethod: 'PIX' | 'CARD';
  installments?: number;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardHolderName?: string;
}

export interface CreatePaymentRequest {
  customer: CheckoutCustomer;
  amountCents: number;
  description?: string;
  paymentMethod: 'PIX' | 'CARD';
  installments?: number;
  planId?: string;
  promoLinkId?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentResponse {
  success: boolean;
  paymentCode?: string;
  pixBrCode?: string;
  pixQrCodeBase64?: string;
  abacatepayUrl?: string;
  expiresAt?: string;
  error?: string;
}

export interface PaymentStatusResponse {
  status: PaymentStatus;
  paidAt?: string;
  error?: string;
}

// Country codes for phone input
export interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colômbia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽' },
  { code: 'UY', name: 'Uruguai', dialCode: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguai', dialCode: '+595', flag: '🇵🇾' },
  { code: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪' },
];
