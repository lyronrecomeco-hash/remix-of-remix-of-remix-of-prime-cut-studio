/**
 * CAKTO INTEGRATION - ENTERPRISE TYPES
 * Tipos e constantes para integração Cakto
 * 
 * Eventos disponíveis da Cakto:
 * - initiate_checkout: Checkout iniciado
 * - pix_generated: PIX gerado (aguardando pagamento)
 * - pix_expired: PIX expirado (não pago no prazo)
 * - purchase_approved: Compra aprovada
 * - purchase_refused: Compra recusada (cartão)
 * - purchase_refunded: Reembolso
 * - purchase_chargeback: Chargeback
 * - checkout_abandonment: Carrinho abandonado
 */

// Tipos de eventos suportados pela Cakto
export type CaktoEventType = 
  | 'initiate_checkout'
  | 'pix_generated'
  | 'pix_expired'
  | 'purchase_approved'
  | 'purchase_refused'
  | 'purchase_refunded'
  | 'purchase_chargeback'
  | 'checkout_abandonment'
  | 'boleto_generated'
  | 'boleto_expired';

// Labels para cada tipo de evento
export const CAKTO_EVENT_LABELS: Record<CaktoEventType, string> = {
  initiate_checkout: 'Checkout Iniciado',
  pix_generated: 'PIX Gerado',
  pix_expired: 'PIX Expirado',
  purchase_approved: 'Compra Aprovada',
  purchase_refused: 'Compra Recusada',
  purchase_refunded: 'Reembolso',
  purchase_chargeback: 'Chargeback',
  checkout_abandonment: 'Carrinho Abandonado',
  boleto_generated: 'Boleto Gerado',
  boleto_expired: 'Boleto Expirado',
};

// Ícones/cores para cada tipo de evento
export const CAKTO_EVENT_COLORS: Record<CaktoEventType, { bg: string; text: string; border: string }> = {
  initiate_checkout: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  pix_generated: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' },
  pix_expired: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' },
  purchase_approved: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20' },
  purchase_refused: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' },
  purchase_refunded: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20' },
  purchase_chargeback: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/20' },
  checkout_abandonment: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/20' },
  boleto_generated: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-500/20' },
  boleto_expired: { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500/20' },
};

// Interface para evento Cakto
export interface CaktoEvent {
  id: string;
  instance_id: string;
  integration_id: string | null;
  event_type: CaktoEventType;
  external_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  product_id: string | null;
  product_name: string | null;
  offer_id: string | null;
  offer_name: string | null;
  order_value: number | null;
  currency: string;
  raw_payload: Record<string, unknown>;
  normalized_event: Record<string, unknown> | null;
  processed: boolean;
  processed_at: string | null;
  campaign_triggered_id: string | null;
  error_message: string | null;
  created_at: string;
  // Campos adicionais para verificação de PIX
  pix_paid?: boolean;
  has_subsequent_approval?: boolean;
}

// Interface para regra de evento
export interface CaktoEventRule {
  id: string;
  instance_id: string;
  integration_id: string;
  event_type: CaktoEventType;
  campaign_id: string | null;
  is_active: boolean;
  delay_seconds: number;
  delay_max_seconds: number;
  anti_ban_enabled: boolean;
  cooldown_minutes: number;
  max_per_hour: number;
  created_at: string;
  updated_at: string;
}

// Interface para analytics
export interface CaktoAnalytics {
  id: string;
  instance_id: string;
  integration_id: string;
  date: string;
  checkouts_started: number;
  pix_generated: number;
  pix_expired: number;
  purchases_approved: number;
  purchases_refused: number;
  purchases_refunded: number;
  purchases_chargeback: number;
  cart_abandonments: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

// Interface para produto Cakto
export interface CaktoProduct {
  id: string;
  instance_id: string;
  integration_id: string;
  external_id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  status: string | null;
  image_url: string | null;
  metadata: Record<string, unknown>;
  synced_at: string;
  created_at: string;
}

// Interface para oferta Cakto
export interface CaktoOffer {
  id: string;
  instance_id: string;
  integration_id: string;
  external_id: string;
  product_external_id: string | null;
  name: string;
  price: number | null;
  original_price: number | null;
  currency: string;
  status: string | null;
  checkout_url: string | null;
  metadata: Record<string, unknown>;
  synced_at: string;
  created_at: string;
}

// Período para analytics
export type AnalyticsPeriod = 'today' | '7d' | '30d' | 'custom';

// Interface para filtros de analytics
export interface AnalyticsFilters {
  period: AnalyticsPeriod;
  startDate?: Date;
  endDate?: Date;
}

// Interface para PIX não pago (com verificação)
export interface UnpaidPixEvent extends CaktoEvent {
  pix_generated_at: string;
  time_since_generation: string;
  whatsapp_link: string | null;
}
