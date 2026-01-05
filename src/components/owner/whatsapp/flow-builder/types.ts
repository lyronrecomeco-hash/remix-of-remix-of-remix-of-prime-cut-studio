// =====================================================
// FLOW BUILDER - TYPES
// =====================================================

export type NodeType = 
  | 'trigger' 
  | 'condition' 
  | 'action' 
  | 'delay' 
  | 'split' 
  | 'message' 
  | 'button'
  | 'list'
  | 'webhook'
  | 'ai'
  | 'end'
  | 'goto'
  | 'variable'
  | 'integration'
  | 'note'
  | 'http_request'
  | 'webhook_in'
  | 'ecommerce'
  | 'crm_sheets'
  // Native WhatsApp Components
  | 'wa_start'
  | 'wa_send_text'
  | 'wa_send_buttons'
  | 'wa_send_list'
  | 'wa_wait_response'
  | 'wa_receive'
  // Stability & Resilience Nodes
  | 'queue_message'
  | 'session_guard'
  | 'timeout_handler'
  | 'if_instance_state'
  | 'retry_policy'
  | 'smart_delay'
  | 'rate_limit'
  | 'enqueue_flow_step';

export interface FlowNodeData {
  label: string;
  type: NodeType;
  config: Record<string, any>;
  description?: string;
  icon?: string;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  condition?: Record<string, any>;
  animated?: boolean;
  style?: Record<string, any>;
}

export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface CanvasPosition {
  x: number;
  y: number;
  zoom: number;
}

export interface AutomationRule {
  id: string;
  project_id: string | null;
  instance_id: string; // Required - cada fluxo pertence a uma instância
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: Record<string, any>;
  conditions: any[];
  actions: any[];
  priority: number;
  is_active: boolean;
  execution_count: number;
  last_executed_at: string | null;
  flow_data: FlowData;
  flow_version: number;
  canvas_position: CanvasPosition;
  created_at: string;
  updated_at: string;
}

// Node Templates para o sidebar
export interface NodeTemplate {
  type: NodeType;
  label: string;
  icon: string;
  description: string;
  category: 'triggers' | 'conditions' | 'actions' | 'flow' | 'advanced' | 'nativos' | 'stability';
  defaultConfig: Record<string, any>;
  requiresInstance?: boolean; // If true, requires connected WhatsApp instance
}

export const NODE_TEMPLATES: NodeTemplate[] = [
  // Triggers
  {
    type: 'trigger',
    label: 'Mensagem Recebida',
    icon: 'MessageSquare',
    description: 'Inicia quando uma mensagem é recebida',
    category: 'triggers',
    defaultConfig: { keywords: [], matchType: 'contains' }
  },
  {
    type: 'trigger',
    label: 'Primeiro Contato',
    icon: 'UserPlus',
    description: 'Inicia no primeiro contato do cliente',
    category: 'triggers',
    defaultConfig: { triggerType: 'first_contact' }
  },
  {
    type: 'trigger',
    label: 'Botão Clicado',
    icon: 'MousePointer',
    description: 'Inicia quando um botão é clicado',
    category: 'triggers',
    defaultConfig: { buttonId: '' }
  },
  {
    type: 'trigger',
    label: 'Webhook Recebido',
    icon: 'Webhook',
    description: 'Inicia por chamada externa',
    category: 'triggers',
    defaultConfig: { webhookId: '' }
  },
  // Conditions
  {
    type: 'condition',
    label: 'Condição',
    icon: 'GitBranch',
    description: 'Divide o fluxo baseado em uma condição',
    category: 'conditions',
    defaultConfig: { field: '', operator: 'equals', value: '' }
  },
  {
    type: 'split',
    label: 'Split A/B',
    icon: 'Shuffle',
    description: 'Divide o tráfego em porcentagens',
    category: 'conditions',
    defaultConfig: { percentageA: 50 }
  },
  {
    type: 'condition',
    label: 'Horário Comercial',
    icon: 'Clock',
    description: 'Verifica se está no horário',
    category: 'conditions',
    defaultConfig: { checkType: 'business_hours' }
  },
  // Actions
  {
    type: 'message',
    label: 'Enviar Mensagem',
    icon: 'Send',
    description: 'Envia uma mensagem de texto',
    category: 'actions',
    defaultConfig: { text: '', typing: true }
  },
  {
    type: 'button',
    label: 'Mensagem com Botões',
    icon: 'LayoutGrid',
    description: 'Envia mensagem com botões interativos',
    category: 'actions',
    defaultConfig: { text: '', buttons: [] }
  },
  {
    type: 'list',
    label: 'Menu de Lista',
    icon: 'List',
    description: 'Envia um menu de lista',
    category: 'actions',
    defaultConfig: { title: '', sections: [] }
  },
  {
    type: 'ai',
    label: 'Resposta IA',
    icon: 'Brain',
    description: 'Gera resposta com inteligência artificial',
    category: 'actions',
    defaultConfig: { prompt: '', model: 'gemini-2.5-flash', temperature: 0.7 }
  },
  {
    type: 'webhook',
    label: 'Chamar API',
    icon: 'Globe',
    description: 'Chama uma API externa',
    category: 'actions',
    defaultConfig: { url: '', method: 'POST', headers: {}, body: '' }
  },
  // Flow Control
  {
    type: 'delay',
    label: 'Aguardar',
    icon: 'Timer',
    description: 'Pausa o fluxo por um tempo',
    category: 'flow',
    defaultConfig: { seconds: 5, showTyping: true }
  },
  {
    type: 'goto',
    label: 'Ir Para',
    icon: 'CornerDownRight',
    description: 'Redireciona para outro nó',
    category: 'flow',
    defaultConfig: { targetNodeId: '' }
  },
  {
    type: 'end',
    label: 'Fim',
    icon: 'CircleStop',
    description: 'Finaliza o fluxo',
    category: 'flow',
    defaultConfig: { endType: 'complete' }
  },
  // Advanced
  {
    type: 'variable',
    label: 'Definir Variável',
    icon: 'Tag',
    description: 'Define uma variável no contexto',
    category: 'advanced',
    defaultConfig: { name: '', value: '', source: 'static' }
  },
  {
    type: 'integration',
    label: 'Integração',
    icon: 'Plug',
    description: 'Conecta com sistema externo',
    category: 'advanced',
    defaultConfig: { integrationType: '', config: {} }
  },
  {
    type: 'note',
    label: 'Nota',
    icon: 'StickyNote',
    description: 'Adiciona comentário visual',
    category: 'advanced',
    defaultConfig: { text: '', color: 'yellow' }
  },
  // External API / Integrations
  {
    type: 'http_request',
    label: 'HTTP Request',
    icon: 'Globe',
    description: 'Faz requisição HTTP (GET/POST/PUT/DELETE)',
    category: 'advanced',
    defaultConfig: { url: '', method: 'GET', headers: {}, body: '', saveResponseTo: '' }
  },
  {
    type: 'webhook_in',
    label: 'Webhook In',
    icon: 'Webhook',
    description: 'Recebe eventos de sistemas externos',
    category: 'triggers',
    defaultConfig: { webhookPath: '', secret: '', validatePayload: true }
  },
  {
    type: 'ecommerce',
    label: 'E-commerce',
    icon: 'ShoppingCart',
    description: 'Ações para Shopify, Woo, etc.',
    category: 'advanced',
    defaultConfig: { platform: 'shopify', action: 'get_order', orderId: '', productId: '' }
  },
  {
    type: 'crm_sheets',
    label: 'CRM / Planilhas',
    icon: 'Table',
    description: 'Cria/atualiza leads, salva em Sheets',
    category: 'advanced',
    defaultConfig: { target: 'crm', action: 'create_lead', fields: {} }
  }
];

// Stability & Resilience Templates
export const STABILITY_TEMPLATES: NodeTemplate[] = [
  {
    type: 'queue_message',
    label: 'Fila de Envio',
    icon: 'Send',
    description: 'Envia mensagem via fila com garantia de entrega',
    category: 'stability',
    defaultConfig: { 
      priority: 'normal', 
      retry_limit: 3, 
      retry_interval_seconds: 30,
      expiration_seconds: 3600,
      on_fail: 'end'
    },
    requiresInstance: true
  },
  {
    type: 'session_guard',
    label: 'Proteção de Sessão',
    icon: 'Shield',
    description: 'Limita mensagens para evitar spam e ban',
    category: 'stability',
    defaultConfig: { 
      max_messages_per_minute: 20, 
      burst_limit: 5, 
      cooldown_minutes: 2,
      on_violation: 'pause'
    },
    requiresInstance: true
  },
  {
    type: 'timeout_handler',
    label: 'Tratamento de Timeout',
    icon: 'Timer',
    description: 'Captura timeout e define ação de fallback',
    category: 'stability',
    defaultConfig: { 
      timeout_seconds: 30, 
      on_timeout: 'goto',
      fallback_message: ''
    }
  },
  {
    type: 'if_instance_state',
    label: 'Condição de Estado',
    icon: 'GitBranch',
    description: 'Verifica estado da instância WhatsApp',
    category: 'stability',
    defaultConfig: { 
      check_state: 'connected',
      fallback_state: 'disconnected'
    },
    requiresInstance: true
  },
  {
    type: 'retry_policy',
    label: 'Política de Retry',
    icon: 'RefreshCw',
    description: 'Define retentativas com backoff controlado',
    category: 'stability',
    defaultConfig: { 
      max_attempts: 3, 
      delay_seconds: 5,
      jitter_enabled: true,
      on_exhausted: 'end'
    }
  },
  {
    type: 'smart_delay',
    label: 'Pausa Inteligente',
    icon: 'Clock',
    description: 'Delay com aleatoriedade e contexto',
    category: 'stability',
    defaultConfig: { 
      min_seconds: 2, 
      max_seconds: 8,
      randomize: true,
      respect_business_hours: false
    }
  },
  {
    type: 'rate_limit',
    label: 'Limite de Taxa',
    icon: 'Gauge',
    description: 'Controla ritmo de execução do fluxo',
    category: 'stability',
    defaultConfig: { 
      messages_per_minute: 10, 
      burst_limit: 3,
      cooldown_minutes: 1,
      on_limit: 'pause'
    }
  },
  {
    type: 'enqueue_flow_step',
    label: 'Enfileirar Passo',
    icon: 'ListPlus',
    description: 'Executa próximo passo de forma assíncrona',
    category: 'stability',
    defaultConfig: { 
      queue_name: 'default', 
      priority: 'normal',
      delay_seconds: 0
    }
  }
];

// Native WhatsApp Templates (Genesis)
export const NATIVE_WA_TEMPLATES: NodeTemplate[] = [
  {
    type: 'wa_start',
    label: 'Início do Fluxo',
    icon: 'Smartphone',
    description: 'Ponto de partida quando uma mensagem é recebida no WhatsApp',
    category: 'nativos',
    defaultConfig: { triggerType: 'message_received' },
    requiresInstance: true
  },
  {
    type: 'wa_send_text',
    label: 'Enviar Texto',
    icon: 'MessageSquare',
    description: 'Envia uma mensagem de texto no WhatsApp',
    category: 'nativos',
    defaultConfig: { text: '', typing: true, typingDuration: 2 },
    requiresInstance: true
  },
  {
    type: 'wa_send_buttons',
    label: 'Enviar Botões',
    icon: 'LayoutGrid',
    description: 'Envia mensagem com botões de resposta rápida',
    category: 'nativos',
    defaultConfig: { text: '', buttons: [{ id: 'btn_1', text: 'Opção 1' }] },
    requiresInstance: true
  },
  {
    type: 'wa_send_list',
    label: 'Enviar Lista',
    icon: 'List',
    description: 'Envia um menu de lista interativa',
    category: 'nativos',
    defaultConfig: { title: '', buttonText: 'Ver opções', sections: [] },
    requiresInstance: true
  },
  {
    type: 'wa_wait_response',
    label: 'Aguardar Resposta',
    icon: 'Clock',
    description: 'Aguarda a resposta do cliente',
    category: 'nativos',
    defaultConfig: { timeout: 300, timeoutAction: 'end', saveResponseTo: 'last_response' },
    requiresInstance: true
  },
  {
    type: 'wa_receive',
    label: 'Receber Mensagem',
    icon: 'Inbox',
    description: 'Captura a mensagem recebida do cliente',
    category: 'nativos',
    defaultConfig: { saveAs: 'message', captureMedia: true },
    requiresInstance: true
  }
];

export const NODE_CATEGORIES = {
  nativos: { label: 'Nativos', color: '#25D366' }, // WhatsApp green
  triggers: { label: 'Gatilhos', color: '#22c55e' },
  conditions: { label: 'Condições', color: '#eab308' },
  actions: { label: 'Ações', color: '#3b82f6' },
  flow: { label: 'Controle', color: '#a855f7' },
  advanced: { label: 'Avançado', color: '#6366f1' },
  stability: { label: 'Estabilidade', color: '#f97316' } // Orange for stability
};

export const NODE_COLORS: Record<NodeType, string> = {
  trigger: '#22c55e',
  condition: '#eab308',
  action: '#3b82f6',
  delay: '#a855f7',
  split: '#f97316',
  message: '#06b6d4',
  button: '#ec4899',
  list: '#8b5cf6',
  webhook: '#64748b',
  ai: '#14b8a6',
  end: '#ef4444',
  goto: '#f59e0b',
  variable: '#10b981',
  integration: '#6366f1',
  note: '#fbbf24',
  http_request: '#0ea5e9',
  webhook_in: '#7c3aed',
  ecommerce: '#f43f5e',
  crm_sheets: '#059669',
  // Native WhatsApp nodes (Genesis green)
  wa_start: '#25D366',
  wa_send_text: '#25D366',
  wa_send_buttons: '#128C7E',
  wa_send_list: '#075E54',
  wa_wait_response: '#34B7F1',
  wa_receive: '#25D366',
  // Stability & Resilience nodes (Orange gradient)
  queue_message: '#f97316',
  session_guard: '#ea580c',
  timeout_handler: '#c2410c',
  if_instance_state: '#fb923c',
  retry_policy: '#fdba74',
  smart_delay: '#fed7aa',
  rate_limit: '#ffedd5',
  enqueue_flow_step: '#f59e0b',
};

// Connection validation rules
export const CONNECTION_RULES = {
  // Nodes that can only have one outgoing connection
  singleOutput: ['trigger', 'message', 'button', 'list', 'ai', 'webhook', 'delay', 'variable', 'integration', 'http_request', 'webhook_in', 'ecommerce', 'crm_sheets', 'wa_start', 'wa_send_text', 'wa_send_buttons', 'wa_send_list', 'wa_wait_response', 'wa_receive', 'queue_message', 'session_guard', 'retry_policy', 'smart_delay', 'rate_limit', 'enqueue_flow_step'],
  // Nodes that can have multiple outgoing connections (yes/no)
  conditionalOutput: ['condition', 'split', 'if_instance_state', 'timeout_handler'],
  // Nodes that cannot have outgoing connections
  noOutput: ['end'],
  // Nodes that can be connected from any node
  universalInput: ['message', 'button', 'list', 'ai', 'webhook', 'delay', 'condition', 'split', 'variable', 'integration', 'end', 'goto', 'note', 'http_request', 'ecommerce', 'crm_sheets', 'wa_send_text', 'wa_send_buttons', 'wa_send_list', 'wa_wait_response', 'wa_receive', 'queue_message', 'session_guard', 'timeout_handler', 'if_instance_state', 'retry_policy', 'smart_delay', 'rate_limit', 'enqueue_flow_step'],
};

// Get all templates including native and stability
export const getAllTemplates = () => [...NATIVE_WA_TEMPLATES, ...NODE_TEMPLATES, ...STABILITY_TEMPLATES];
