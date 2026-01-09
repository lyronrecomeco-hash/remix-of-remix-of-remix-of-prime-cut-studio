/**
 * GENESIS INTEGRATIONS - Enterprise Types
 * Sistema de integrações e orquestração de eventos
 */

// Providers suportados
export type IntegrationProvider = 'shopify' | 'woocommerce' | 'nuvemshop' | 'mercadoshops' | 'rdstation';

// Status de integração
export type IntegrationStatus = 'pending' | 'connected' | 'error' | 'disconnected';

// Tipos de eventos normalizados (padrão único interno)
export type NormalizedEventType = 
  // E-commerce events
  | 'order_created'
  | 'order_paid'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'order_refunded'
  | 'cart_abandoned'
  | 'checkout_started'
  // Customer events
  | 'customer_created'
  | 'customer_updated'
  // Product events
  | 'product_viewed'
  | 'product_stock_low'
  // CRM events
  | 'lead_created'
  | 'lead_converted'
  | 'opportunity_won'
  | 'opportunity_lost'
  // Custom
  | 'custom';

// Tipos de ações que podem ser executadas
export type ActionType = 
  | 'start_flow'
  | 'send_message'
  | 'trigger_campaign'
  | 'call_luna'
  | 'webhook_external';

// Evento normalizado pelo orquestrador
export interface NormalizedEvent {
  id: string;
  provider: IntegrationProvider;
  event: NormalizedEventType;
  instance_id: string;
  integration_id: string;
  external_id: string; // ID externo (order_id, customer_id, etc)
  customer: {
    phone?: string;
    name?: string;
    email?: string;
    external_id?: string;
  };
  order?: {
    id?: string;
    total?: number;
    currency?: string;
    status?: string;
    items?: Array<{
      name: string;
      quantity: number;
      price: number;
      sku?: string;
    }>;
  };
  metadata: Record<string, unknown>;
  received_at: string;
}

// Regra de automação (evento → ação)
export interface AutomationRule {
  id: string;
  instance_id: string;
  integration_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  // Trigger
  event_type: NormalizedEventType;
  // Filters (condições)
  filters: AutomationFilter[];
  // Action
  action_type: ActionType;
  action_config: {
    // Para send_message
    message_template?: string;
    // Para trigger_campaign
    campaign_id?: string;
    // Para start_flow
    flow_id?: string;
    // Para call_luna
    luna_prompt?: string;
    // Para webhook_external
    webhook_url?: string;
    webhook_headers?: Record<string, string>;
  };
  // Rate limiting
  cooldown_minutes: number;
  max_executions_per_hour: number;
  // Stats
  execution_count: number;
  last_executed_at?: string;
  created_at: string;
  updated_at: string;
}

// Filtros de automação
export interface AutomationFilter {
  field: string; // ex: 'order.total', 'customer.email', 'metadata.tag'
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | boolean | string[];
}

// Log de execução
export interface AutomationExecutionLog {
  id: string;
  rule_id: string;
  instance_id: string;
  event_id: string;
  event_data: NormalizedEvent;
  action_executed: ActionType;
  action_result: 'success' | 'failed' | 'filtered' | 'rate_limited' | 'simulated';
  error_message?: string;
  credits_consumed: number;
  duration_ms: number;
  created_at: string;
}

// Estado do Circuit Breaker
export interface CircuitBreakerState {
  integration_id: string;
  status: 'closed' | 'open' | 'half_open';
  failure_count: number;
  last_failure_at?: string;
  opens_at?: string;
  closes_at?: string;
}

// Dashboard de integração
export interface IntegrationStats {
  integration_id: string;
  provider: IntegrationProvider;
  period: 'today' | 'week' | 'month';
  events_received: number;
  actions_executed: number;
  campaigns_triggered: number;
  messages_sent: number;
  failures: number;
  credits_consumed: number;
  conversion_rate: number;
}

// Mapeamento de eventos por provider
export const PROVIDER_EVENT_MAPPING: Record<IntegrationProvider, Record<string, NormalizedEventType>> = {
  shopify: {
    'orders/create': 'order_created',
    'orders/paid': 'order_paid',
    'orders/fulfilled': 'order_shipped',
    'orders/cancelled': 'order_cancelled',
    'refunds/create': 'order_refunded',
    'customers/create': 'customer_created',
    'checkouts/create': 'checkout_started',
    'carts/update': 'cart_abandoned',
  },
  woocommerce: {
    'order.created': 'order_created',
    'order.completed': 'order_paid',
    'order.shipped': 'order_shipped',
    'order.cancelled': 'order_cancelled',
    'order.refunded': 'order_refunded',
    'customer.created': 'customer_created',
  },
  nuvemshop: {
    'order/created': 'order_created',
    'order/paid': 'order_paid',
    'order/shipped': 'order_shipped',
    'order/cancelled': 'order_cancelled',
    'customer/created': 'customer_created',
  },
  mercadoshops: {
    'orders': 'order_created',
    'payments': 'order_paid',
    'shipments': 'order_shipped',
  },
  rdstation: {
    'lead.created': 'lead_created',
    'lead.converted': 'lead_converted',
    'opportunity.won': 'opportunity_won',
    'opportunity.lost': 'opportunity_lost',
  },
};

// Labels de eventos para UI
export const EVENT_TYPE_LABELS: Record<NormalizedEventType, string> = {
  order_created: 'Pedido Criado',
  order_paid: 'Pedido Pago',
  order_shipped: 'Pedido Enviado',
  order_delivered: 'Pedido Entregue',
  order_cancelled: 'Pedido Cancelado',
  order_refunded: 'Pedido Reembolsado',
  cart_abandoned: 'Carrinho Abandonado',
  checkout_started: 'Checkout Iniciado',
  customer_created: 'Cliente Criado',
  customer_updated: 'Cliente Atualizado',
  product_viewed: 'Produto Visualizado',
  product_stock_low: 'Estoque Baixo',
  lead_created: 'Lead Criado',
  lead_converted: 'Lead Convertido',
  opportunity_won: 'Oportunidade Ganha',
  opportunity_lost: 'Oportunidade Perdida',
  custom: 'Evento Personalizado',
};

// Labels de ações para UI
export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  start_flow: 'Iniciar Flow',
  send_message: 'Enviar Mensagem',
  trigger_campaign: 'Acionar Campanha',
  call_luna: 'Chamar Luna AI',
  webhook_external: 'Webhook Externo',
};
