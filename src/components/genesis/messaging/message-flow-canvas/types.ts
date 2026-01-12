// Message Flow Canvas - Enterprise Types
// Sistema de mensagens avançadas para automação

export type MessageNodeType = 
  | 'poll'
  | 'button-message'
  | 'list-message'
  | 'audio-ptt'
  | 'advanced-text'
  | 'expected-reaction'
  | 'presence'
  | 'smart-delay'
  | 'condition';

export interface MessageNode {
  id: string;
  type: MessageNodeType;
  position: { x: number; y: number };
  data: MessageNodeData;
  selected?: boolean;
}

export interface MessageNodeData {
  label: string;
  config: Record<string, any>;
  isConfigured: boolean;
}

export interface MessageEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  animated?: boolean;
}

export interface MessageFlow {
  id: string;
  name: string;
  description?: string;
  nodes: MessageNode[];
  edges: MessageEdge[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  stats: MessageFlowStats;
  userId?: string;
}

export interface MessageFlowStats {
  totalExecutions: number;
  successRate: number;
  avgResponseTime: number;
  lastExecuted?: string;
}

// Audio Library Types
export interface AudioItem {
  id: string;
  name: string;
  description?: string;
  audioUrl: string;
  audioBlob?: Blob;
  duration: number;
  createdAt: string;
  tags: string[];
  usageCount: number;
  waveform?: number[];
}

// Poll Template Types
export interface PollTemplate {
  id: string;
  name: string;
  question: string;
  options: string[];
  allowMultiple: boolean;
  createdAt: string;
  usageCount: number;
  responseRate?: number;
}

// Reaction Config Types
export interface ReactionConfig {
  id: string;
  name: string;
  expectedEmojis: string[];
  triggerAction: 'continue' | 'branch' | 'end';
  timeout: number;
  createdAt: string;
}

// Template Types
export interface MessageTemplate {
  id: string;
  name: string;
  type: 'text' | 'buttons' | 'list';
  content: string;
  buttons?: { id: string; text: string; action?: string }[];
  listSections?: { title: string; rows: { id: string; title: string; description?: string }[] }[];
  variables: string[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  version: number;
}

// Analytics Types
export interface MessageFlowAnalytics {
  flowId: string;
  period: 'day' | 'week' | 'month';
  metrics: {
    totalMessages: number;
    deliveryRate: number;
    responseRate: number;
    pollResponseRate: number;
    reactionRate: number;
    avgResponseTime: number;
    conversionRate: number;
  };
  timeline: {
    date: string;
    messages: number;
    responses: number;
  }[];
}

// Error Log Types
export interface FlowErrorLog {
  id: string;
  flowId: string;
  nodeId: string;
  nodeType: MessageNodeType;
  errorType: 'validation' | 'execution' | 'timeout' | 'api' | 'unknown';
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  resolved: boolean;
}

// Canvas State
export interface CanvasState {
  zoom: number;
  pan: { x: number; y: number };
  selectedNodes: string[];
  isConnecting: boolean;
  connectingFrom?: string;
}

// Node Category
export interface NodeCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  nodes: {
    type: MessageNodeType;
    label: string;
    description: string;
    icon: string;
  }[];
}

export const NODE_CATEGORIES: NodeCategory[] = [
  {
    id: 'content',
    label: 'Conteúdo',
    icon: 'MessageSquare',
    color: 'bg-blue-500',
    nodes: [
      { type: 'advanced-text', label: 'Texto Avançado', description: 'Mensagem com variáveis e formatação', icon: 'Type' },
      { type: 'button-message', label: 'Botões', description: 'Mensagem com botões interativos', icon: 'LayoutGrid' },
      { type: 'list-message', label: 'Lista', description: 'Mensagem com lista de opções', icon: 'List' },
      { type: 'audio-ptt', label: 'Áudio PTT', description: 'Áudio da biblioteca', icon: 'Mic' },
    ]
  },
  {
    id: 'interactive',
    label: 'Interativo',
    icon: 'MousePointerClick',
    color: 'bg-purple-500',
    nodes: [
      { type: 'poll', label: 'Enquete', description: 'Captura votos e respostas', icon: 'BarChart2' },
      { type: 'expected-reaction', label: 'Reação Esperada', description: 'Aguarda reação específica', icon: 'Heart' },
    ]
  },
  {
    id: 'flow-control',
    label: 'Controle',
    icon: 'GitBranch',
    color: 'bg-amber-500',
    nodes: [
      { type: 'presence', label: 'Presença', description: 'Simula digitando/gravando', icon: 'Radio' },
      { type: 'smart-delay', label: 'Delay Inteligente', description: 'Pausa com variação anti-ban', icon: 'Clock' },
      { type: 'condition', label: 'Condição', description: 'Branch por resposta/reação', icon: 'GitBranch' },
    ]
  }
];
