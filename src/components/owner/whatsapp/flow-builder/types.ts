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
  | 'enqueue_flow_step'
  // Generic Automation Engine Nodes (Channel-Agnostic)
  | 'http_request_advanced'
  | 'webhook_trigger'
  | 'cron_trigger'
  | 'set_variable'
  | 'if_expression'
  | 'loop_for_each'
  | 'switch_case'
  | 'subflow_call'
  | 'event_emitter'
  | 'data_transform'
  // Infrastructure & Security Nodes
  | 'proxy_assign'
  | 'proxy_rotate'
  | 'worker_assign'
  | 'worker_release'
  | 'dispatch_execution'
  | 'identity_rotate'
  | 'execution_quota_guard'
  | 'infra_rate_limit'
  | 'if_infra_health'
  | 'secure_context_guard'
  // AI Native Nodes (plug-and-play)
  | 'ai_prompt_execute'
  | 'ai_chat_context'
  | 'ai_decision'
  | 'ai_embedding';

// Flow Lifecycle Status
export type FlowLifecycleStatus = 'draft' | 'validated' | 'active' | 'paused' | 'error';

// Global Flow Configuration
export interface FlowGlobalConfig {
  timeout_seconds: number;
  default_retries: number;
  max_concurrency: number;
  error_mode: 'pause' | 'skip' | 'abort';
  persist_context: boolean;
  distributed_execution: boolean;
  ai_config: {
    provider: 'lovable' | 'openai' | 'custom';
    fallback_provider: string | null;
    max_tokens: number;
    temperature: number;
  };
}

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
  category: 'triggers' | 'conditions' | 'actions' | 'flow' | 'advanced' | 'nativos' | 'stability' | 'automation' | 'infrastructure' | 'security' | 'ai';
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
  stability: { label: 'Estabilidade', color: '#f97316' }, // Orange for stability
  automation: { label: 'Automação', color: '#8b5cf6' }, // Purple for generic automation
  infrastructure: { label: 'Infraestrutura', color: '#06b6d4' }, // Cyan for infrastructure
  security: { label: 'Segurança', color: '#dc2626' }, // Red for security
  ai: { label: 'Inteligência Artificial', color: '#eab308' } // Yellow/Gold for AI
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
  // Generic Automation Engine nodes (Purple gradient)
  http_request_advanced: '#7c3aed',
  webhook_trigger: '#8b5cf6',
  cron_trigger: '#a78bfa',
  set_variable: '#c4b5fd',
  if_expression: '#ddd6fe',
  loop_for_each: '#6d28d9',
  switch_case: '#5b21b6',
  subflow_call: '#4c1d95',
  event_emitter: '#9333ea',
  data_transform: '#a855f7',
  // Infrastructure nodes (Cyan gradient)
  proxy_assign: '#06b6d4',
  proxy_rotate: '#0891b2',
  worker_assign: '#0e7490',
  worker_release: '#155e75',
  dispatch_execution: '#164e63',
  identity_rotate: '#22d3ee',
  // Security nodes (Red gradient)
  execution_quota_guard: '#dc2626',
  infra_rate_limit: '#b91c1c',
  if_infra_health: '#991b1b',
  secure_context_guard: '#7f1d1d',
  // AI Native nodes (Yellow/Gold gradient)
  ai_prompt_execute: '#eab308',
  ai_chat_context: '#ca8a04',
  ai_decision: '#a16207',
  ai_embedding: '#854d0e',
};

// Connection validation rules
export const CONNECTION_RULES = {
  // Nodes that can only have one outgoing connection
  singleOutput: ['trigger', 'message', 'button', 'list', 'ai', 'webhook', 'delay', 'variable', 'integration', 'http_request', 'webhook_in', 'ecommerce', 'crm_sheets', 'wa_start', 'wa_send_text', 'wa_send_buttons', 'wa_send_list', 'wa_wait_response', 'wa_receive', 'queue_message', 'session_guard', 'retry_policy', 'smart_delay', 'rate_limit', 'enqueue_flow_step', 'http_request_advanced', 'webhook_trigger', 'cron_trigger', 'set_variable', 'subflow_call', 'event_emitter', 'data_transform', 'proxy_assign', 'proxy_rotate', 'worker_assign', 'worker_release', 'dispatch_execution', 'identity_rotate', 'execution_quota_guard', 'infra_rate_limit', 'secure_context_guard', 'ai_prompt_execute', 'ai_chat_context', 'ai_embedding'],
  // Nodes that can have multiple outgoing connections (yes/no)
  conditionalOutput: ['condition', 'split', 'if_instance_state', 'timeout_handler', 'if_expression', 'switch_case', 'if_infra_health', 'ai_decision'],
  // Nodes that cannot have outgoing connections
  noOutput: ['end'],
  // Nodes that can be connected from any node
  universalInput: ['message', 'button', 'list', 'ai', 'webhook', 'delay', 'condition', 'split', 'variable', 'integration', 'end', 'goto', 'note', 'http_request', 'ecommerce', 'crm_sheets', 'wa_send_text', 'wa_send_buttons', 'wa_send_list', 'wa_wait_response', 'wa_receive', 'queue_message', 'session_guard', 'timeout_handler', 'if_instance_state', 'retry_policy', 'smart_delay', 'rate_limit', 'enqueue_flow_step', 'http_request_advanced', 'webhook_trigger', 'cron_trigger', 'set_variable', 'if_expression', 'loop_for_each', 'switch_case', 'subflow_call', 'event_emitter', 'data_transform', 'proxy_assign', 'proxy_rotate', 'worker_assign', 'worker_release', 'dispatch_execution', 'identity_rotate', 'execution_quota_guard', 'infra_rate_limit', 'if_infra_health', 'secure_context_guard', 'ai_prompt_execute', 'ai_chat_context', 'ai_decision', 'ai_embedding'],
};

// Generic Automation Engine Templates (Channel-Agnostic)
export const AUTOMATION_TEMPLATES: NodeTemplate[] = [
  {
    type: 'http_request_advanced',
    label: 'HTTP Request',
    icon: 'Globe',
    description: 'Requisição HTTP avançada com autenticação e retries',
    category: 'automation',
    defaultConfig: { 
      method: 'GET', 
      url: '', 
      headers: {}, 
      query_params: {},
      body: '',
      timeout_seconds: 30,
      retries: 3,
      auth_type: 'none',
      save_response_to: 'response'
    }
  },
  {
    type: 'webhook_trigger',
    label: 'Webhook Trigger',
    icon: 'Webhook',
    description: 'Gatilho por chamada HTTP externa',
    category: 'automation',
    defaultConfig: { 
      method: 'POST',
      path: '',
      secret: '',
      validate_payload: true,
      schema: {},
      custom_response: { status: 200, body: { success: true } }
    }
  },
  {
    type: 'cron_trigger',
    label: 'Agendamento Cron',
    icon: 'Calendar',
    description: 'Execução agendada com expressão cron',
    category: 'automation',
    defaultConfig: { 
      cron_expression: '0 9 * * *',
      timezone: 'America/Sao_Paulo',
      active_window: { start: '08:00', end: '18:00' },
      on_fail: 'retry'
    }
  },
  {
    type: 'set_variable',
    label: 'Definir Variável',
    icon: 'Tag',
    description: 'Define ou atualiza variável no contexto',
    category: 'automation',
    defaultConfig: { 
      name: '',
      value: '',
      scope: 'flow',
      type: 'string'
    }
  },
  {
    type: 'if_expression',
    label: 'Condição Avançada',
    icon: 'GitBranch',
    description: 'Condição com expressões lógicas complexas',
    category: 'automation',
    defaultConfig: { 
      conditions: [],
      logic: 'and',
      fallback: 'no'
    }
  },
  {
    type: 'loop_for_each',
    label: 'Loop For Each',
    icon: 'Repeat',
    description: 'Itera sobre um array de itens',
    category: 'automation',
    defaultConfig: { 
      array_source: '',
      item_variable: 'item',
      index_variable: 'index',
      limit: 100,
      delay_between: 0,
      on_error: 'continue'
    }
  },
  {
    type: 'switch_case',
    label: 'Switch/Case',
    icon: 'GitMerge',
    description: 'Roteamento múltiplo baseado em valor',
    category: 'automation',
    defaultConfig: { 
      expression: '',
      cases: [],
      default_case: 'end'
    }
  },
  {
    type: 'subflow_call',
    label: 'Chamar Subfluxo',
    icon: 'ExternalLink',
    description: 'Executa outro fluxo como subrotina',
    category: 'automation',
    defaultConfig: { 
      flow_id: '',
      parameters: {},
      wait_for_completion: true,
      timeout_seconds: 60,
      return_variable: 'subflow_result'
    }
  },
  {
    type: 'event_emitter',
    label: 'Emitir Evento',
    icon: 'Radio',
    description: 'Emite evento interno para outros fluxos',
    category: 'automation',
    defaultConfig: { 
      event_name: '',
      payload: {},
      scope: 'project'
    }
  },
  {
    type: 'data_transform',
    label: 'Transformar Dados',
    icon: 'Workflow',
    description: 'Operações de transformação de dados',
    category: 'automation',
    defaultConfig: { 
      operation: 'map',
      source: '',
      expression: '',
      output_variable: 'transformed'
    }
  }
];

// Infrastructure Templates
export const INFRASTRUCTURE_TEMPLATES: NodeTemplate[] = [
  {
    type: 'proxy_assign',
    label: 'Atribuir Proxy',
    icon: 'Globe',
    description: 'Associa proxy à execução atual',
    category: 'infrastructure',
    defaultConfig: { 
      proxy_pool: 'default',
      type: 'datacenter',
      sticky: true,
      ttl_seconds: 3600,
      fallback_behavior: 'direct'
    }
  },
  {
    type: 'proxy_rotate',
    label: 'Rotacionar Proxy',
    icon: 'RefreshCw',
    description: 'Rotação controlada de proxy',
    category: 'infrastructure',
    defaultConfig: { 
      rotate_on: 'error',
      min_interval_seconds: 60,
      reason: 'error',
      on_fail: 'continue'
    }
  },
  {
    type: 'worker_assign',
    label: 'Atribuir Worker',
    icon: 'Server',
    description: 'Seleciona VPS/worker para execução',
    category: 'infrastructure',
    defaultConfig: { 
      region: 'auto',
      max_capacity: 100,
      sticky: true,
      fallback: 'any'
    }
  },
  {
    type: 'worker_release',
    label: 'Liberar Worker',
    icon: 'LogOut',
    description: 'Libera recursos após execução',
    category: 'infrastructure',
    defaultConfig: { 
      release_on_complete: true,
      release_on_error: true,
      retention_timeout: 60
    }
  },
  {
    type: 'dispatch_execution',
    label: 'Disparo Controlado',
    icon: 'Play',
    description: 'Disparo controlado de execuções',
    category: 'infrastructure',
    defaultConfig: { 
      quantity: 1,
      spacing_seconds: 1,
      max_parallel: 10,
      time_window: { start: '00:00', end: '23:59' }
    }
  },
  {
    type: 'identity_rotate',
    label: 'Rotacionar Identidade',
    icon: 'UserCog',
    description: 'Rotação de identidade operacional',
    category: 'infrastructure',
    defaultConfig: { 
      rotate_proxy: false,
      rotate_worker: false,
      rotate_instance: false,
      trigger_condition: 'manual'
    }
  }
];

// Security Templates
export const SECURITY_TEMPLATES: NodeTemplate[] = [
  {
    type: 'execution_quota_guard',
    label: 'Limite de Execução',
    icon: 'ShieldAlert',
    description: 'Protege contra abuso por fluxo/tenant',
    category: 'security',
    defaultConfig: { 
      max_concurrent: 10,
      max_per_hour: 1000,
      max_per_day: 10000,
      on_violation: 'pause'
    }
  },
  {
    type: 'infra_rate_limit',
    label: 'Limite de Infraestrutura',
    icon: 'Gauge',
    description: 'Limite de consumo de recursos',
    category: 'security',
    defaultConfig: { 
      cpu_limit_percent: 80,
      memory_limit_mb: 512,
      throughput_mbps: 10,
      cooldown_minutes: 5
    }
  },
  {
    type: 'if_infra_health',
    label: 'Condição de Saúde',
    icon: 'HeartPulse',
    description: 'Decisão baseada em saúde da infra',
    category: 'security',
    defaultConfig: { 
      check_proxy_health: true,
      check_worker_load: true,
      check_latency: true,
      latency_threshold_ms: 500,
      fallback: 'pause'
    }
  },
  {
    type: 'secure_context_guard',
    label: 'Contexto Seguro',
    icon: 'Lock',
    description: 'Proteção do contexto de execução',
    category: 'security',
    defaultConfig: { 
      isolate_execution: true,
      prevent_variable_leak: true,
      auto_reset_on_error: true,
      allowed_variables: []
    }
  }
];

// AI Native Templates (Plug-and-Play)
export const AI_TEMPLATES: NodeTemplate[] = [
  {
    type: 'ai_prompt_execute',
    label: 'Executar Prompt IA',
    icon: 'Brain',
    description: 'Executa prompt em modelo configurável (Lovable AI / OpenAI)',
    category: 'ai',
    defaultConfig: {
      prompt: '',
      system_prompt: 'Você é um assistente útil.',
      model: 'google/gemini-2.5-flash',
      max_tokens: 1024,
      temperature: 0.7,
      save_response_to: 'ai_response',
      use_context: true,
      fallback_response: 'Desculpe, não consegui processar sua solicitação.'
    }
  },
  {
    type: 'ai_chat_context',
    label: 'Contexto de Chat IA',
    icon: 'MessageSquare',
    description: 'Mantém contexto conversacional persistente',
    category: 'ai',
    defaultConfig: {
      context_scope: 'execution',
      max_history: 10,
      context_key: 'chat_history',
      include_system: true,
      auto_summarize: false,
      summarize_after: 20
    }
  },
  {
    type: 'ai_decision',
    label: 'Decisão IA',
    icon: 'GitBranch',
    description: 'Retorna decisão estruturada baseada em prompt',
    category: 'ai',
    defaultConfig: {
      decision_prompt: 'Analise a mensagem e decida a melhor ação.',
      options: [
        { value: 'option_a', description: 'Primeira opção' },
        { value: 'option_b', description: 'Segunda opção' }
      ],
      default_option: 'option_a',
      confidence_threshold: 0.7,
      save_decision_to: 'ai_decision',
      save_reasoning_to: 'ai_reasoning'
    }
  },
  {
    type: 'ai_embedding',
    label: 'Embedding IA',
    icon: 'Zap',
    description: 'Gera embeddings para busca semântica',
    category: 'ai',
    defaultConfig: {
      text_source: '{{message}}',
      model: 'text-embedding-ada-002',
      save_embedding_to: 'embedding',
      search_collection: '',
      top_k: 5,
      similarity_threshold: 0.8
    }
  }
];

// Get all templates including native, stability, automation, infrastructure, security, and AI
export const getAllTemplates = () => [...NATIVE_WA_TEMPLATES, ...NODE_TEMPLATES, ...STABILITY_TEMPLATES, ...AUTOMATION_TEMPLATES, ...INFRASTRUCTURE_TEMPLATES, ...SECURITY_TEMPLATES, ...AI_TEMPLATES];
