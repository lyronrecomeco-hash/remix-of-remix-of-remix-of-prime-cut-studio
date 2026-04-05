import type { Node, Edge } from '@xyflow/react';

export type EngineNodeType = 
  | 'prospect' | 'diagnosis' | 'pain' | 'opportunity' | 'strategy'
  | 'offer' | 'differentials' | 'objections' | 'approach'
  | 'scope' | 'structure' | 'integrations' | 'automation'
  | 'followup' | 'prompt' | 'deploy' | 'notes' | 'checklist'
  | 'whatsapp';

export type BlockCategory = 'context' | 'decision' | 'action' | 'control' | 'output';

export type BlockExecutionStatus = 'idle' | 'ready' | 'running' | 'success' | 'failed' | 'skipped';

// Block category mapping — defines the ROLE of each block in the workflow
export const BLOCK_CATEGORIES: Record<EngineNodeType, BlockCategory> = {
  // Context: feed data into the flow, auto-validated when filled
  prospect: 'context',
  diagnosis: 'context',
  pain: 'context',
  opportunity: 'context',
  // Decision: define the direction of the flow, auto-validated
  strategy: 'decision',
  offer: 'decision',
  differentials: 'decision',
  objections: 'decision',
  // Action: execute something real (send message, build, deploy)
  whatsapp: 'action',
  automation: 'action',
  deploy: 'action',
  approach: 'action',
  // Control: manage timing, follow-up, tasks
  followup: 'control',
  checklist: 'control',
  // Output: generate artifacts, specs, prompts
  prompt: 'output',
  scope: 'output',
  structure: 'output',
  integrations: 'output',
  notes: 'output',
};

export const CATEGORY_META: Record<BlockCategory, { label: string; color: string; description: string }> = {
  context:  { label: 'CONTEXTO', color: '#3b82f6', description: 'Alimenta o fluxo com dados' },
  decision: { label: 'DECISÃO',  color: '#f59e0b', description: 'Define o rumo do fluxo' },
  action:   { label: 'AÇÃO',     color: '#10b981', description: 'Executa algo real' },
  control:  { label: 'CONTROLE', color: '#a78bfa', description: 'Gerencia timing e estado' },
  output:   { label: 'SAÍDA',    color: '#06b6d4', description: 'Gera artefato ou resultado' },
};

// Edge semantic types
export type EdgeSemanticType = 'data_flow' | 'execution_flow' | 'success_path' | 'failure_path';

export const EDGE_STYLES: Record<EdgeSemanticType, { stroke: string; label: string; animated: boolean }> = {
  data_flow:      { stroke: 'rgba(255,255,255,0.12)', label: '', animated: false },
  execution_flow: { stroke: '#3b82f680', label: 'executa', animated: true },
  success_path:   { stroke: '#34d39960', label: 'sucesso', animated: true },
  failure_path:   { stroke: '#f8717160', label: 'falha', animated: false },
};

// Blocks that are "executable" (trigger real actions)
export const EXECUTABLE_BLOCKS: EngineNodeType[] = ['whatsapp', 'automation', 'deploy', 'approach'];

// Blocks that are "content" blocks (auto-success when filled)
export const CONTENT_BLOCKS: EngineNodeType[] = [
  'prospect', 'diagnosis', 'pain', 'opportunity', 'strategy',
  'offer', 'differentials', 'objections', 'scope',
  'structure', 'integrations', 'followup', 'prompt',
  'notes', 'checklist',
];

export interface EngineNodeData {
  label: string;
  content: string;
  description?: string;
  nodeType: EngineNodeType;
  icon?: string;
  color?: string;
  // Execution state
  executionStatus?: BlockExecutionStatus;
  executionError?: string;
  executionLogs?: string[];
  lastExecutedAt?: number;
  [key: string]: unknown;
}

export type EngineNode = Node<EngineNodeData>;
export type EngineEdge = Edge & { data?: { semanticType?: EdgeSemanticType } };

export interface EngineSession {
  id: string;
  affiliate_id: string;
  proposal_id: string;
  title: string;
  nodes: EngineNode[];
  edges: EngineEdge[];
  viewport: { x: number; y: number; zoom: number };
  status: string;
  prospect_context: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EngineOutput {
  id: string;
  session_id: string;
  output_type: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ProposalForEngine {
  id: string;
  company_name: string;
  company_email: string | null;
  company_phone: string | null;
  company_cnpj: string | null;
  contact_name: string | null;
  status: string;
  notes: string | null;
  questionnaire_answers: Record<string, unknown> | null;
  created_at: string;
}

export type FlowExecutionStatus = 'idle' | 'validating' | 'running' | 'paused' | 'completed' | 'failed';

export interface FlowValidationError {
  nodeId: string;
  nodeLabel: string;
  message: string;
  severity: 'error' | 'warning';
}

// Pre-flight summary shown before execution
export interface PreFlightSummary {
  contextBlocks: { count: number; filled: number };
  decisionBlocks: { count: number; filled: number };
  actionBlocks: { label: string; type: EngineNodeType; ready: boolean; detail: string }[];
  outputBlocks: { count: number };
  controlBlocks: { count: number };
  canExecute: boolean;
  blockers: string[];
}

// Organized by strategic conversion flow
export const NODE_CATALOG: { type: EngineNodeType; label: string; icon: string; color: string; description: string; category: string; blockCategory: BlockCategory }[] = [
  // Discovery
  { type: 'prospect', label: 'Prospect', icon: 'Building2', color: '#3b82f6', description: 'Dados do cliente', category: 'Descoberta', blockCategory: 'context' },
  { type: 'diagnosis', label: 'Diagnóstico', icon: 'Search', color: '#8b5cf6', description: 'Análise da situação atual', category: 'Descoberta', blockCategory: 'context' },
  { type: 'pain', label: 'Dor Principal', icon: 'AlertTriangle', color: '#ef4444', description: 'Principal problema identificado', category: 'Descoberta', blockCategory: 'context' },
  { type: 'opportunity', label: 'Oportunidade', icon: 'TrendingUp', color: '#06b6d4', description: 'Oportunidades mapeadas', category: 'Descoberta', blockCategory: 'context' },
  // Strategy
  { type: 'strategy', label: 'Estratégia', icon: 'Target', color: '#f59e0b', description: 'Plano estratégico de conversão', category: 'Estratégia', blockCategory: 'decision' },
  { type: 'offer', label: 'Oferta', icon: 'Zap', color: '#f59e0b', description: 'Proposta de valor', category: 'Estratégia', blockCategory: 'decision' },
  { type: 'differentials', label: 'Diferenciais', icon: 'Star', color: '#22d3ee', description: 'Vantagens competitivas', category: 'Estratégia', blockCategory: 'decision' },
  { type: 'objections', label: 'Objeções', icon: 'ShieldAlert', color: '#ef4444', description: 'Objeções previstas e respostas', category: 'Estratégia', blockCategory: 'decision' },
  { type: 'approach', label: 'Abordagem', icon: 'MessageSquare', color: '#22d3ee', description: 'Mensagem de primeiro contato', category: 'Estratégia', blockCategory: 'action' },
  // Technical
  { type: 'scope', label: 'Escopo', icon: 'Layers', color: '#10b981', description: 'Escopo técnico da solução', category: 'Técnico', blockCategory: 'output' },
  { type: 'structure', label: 'Estrutura Técnica', icon: 'Server', color: '#6366f1', description: 'Frontend, backend e banco', category: 'Técnico', blockCategory: 'output' },
  { type: 'integrations', label: 'Integrações', icon: 'Link', color: '#f97316', description: 'APIs e serviços externos', category: 'Técnico', blockCategory: 'output' },
  { type: 'automation', label: 'Automações', icon: 'Repeat', color: '#84cc16', description: 'Automações do sistema', category: 'Técnico', blockCategory: 'action' },
  // Execution
  { type: 'followup', label: 'Follow-up', icon: 'Clock', color: '#a78bfa', description: 'Plano de acompanhamento', category: 'Execução', blockCategory: 'control' },
  { type: 'whatsapp', label: 'WhatsApp', icon: 'MessageSquare', color: '#25d366', description: 'Envio real via WhatsApp', category: 'Execução', blockCategory: 'action' },
  { type: 'checklist', label: 'Checklist', icon: 'CheckSquare', color: '#22c55e', description: 'Lista de tarefas', category: 'Execução', blockCategory: 'control' },
  { type: 'deploy', label: 'Deploy', icon: 'Rocket', color: '#06b6d4', description: 'Disparar build/deploy', category: 'Execução', blockCategory: 'action' },
  { type: 'prompt', label: 'Prompt Final', icon: 'Terminal', color: '#7c3aed', description: 'Prompt gerado pela IA', category: 'Execução', blockCategory: 'output' },
  { type: 'notes', label: 'Notas', icon: 'StickyNote', color: '#fbbf24', description: 'Anotações livres', category: 'Execução', blockCategory: 'output' },
];
