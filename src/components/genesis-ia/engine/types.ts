import type { Node, Edge } from '@xyflow/react';

export type EngineNodeType = 
  | 'prospect' | 'diagnosis' | 'pain' | 'opportunity' | 'strategy'
  | 'offer' | 'differentials' | 'objections' | 'approach'
  | 'scope' | 'structure' | 'integrations' | 'automation'
  | 'followup' | 'prompt' | 'deploy' | 'notes' | 'checklist';

export interface EngineNodeData {
  label: string;
  content: string;
  description?: string;
  nodeType: EngineNodeType;
  icon?: string;
  color?: string;
  [key: string]: unknown;
}

export type EngineNode = Node<EngineNodeData>;
export type EngineEdge = Edge;

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

// Organized by strategic conversion flow
export const NODE_CATALOG: { type: EngineNodeType; label: string; icon: string; color: string; description: string; category: string }[] = [
  // Discovery
  { type: 'prospect', label: 'Prospect', icon: 'Building2', color: '#3b82f6', description: 'Dados do cliente', category: 'Descoberta' },
  { type: 'diagnosis', label: 'Diagnóstico', icon: 'Search', color: '#8b5cf6', description: 'Análise da situação atual', category: 'Descoberta' },
  { type: 'pain', label: 'Dor Principal', icon: 'AlertTriangle', color: '#ef4444', description: 'Principal problema identificado', category: 'Descoberta' },
  { type: 'opportunity', label: 'Oportunidade', icon: 'TrendingUp', color: '#06b6d4', description: 'Oportunidades mapeadas', category: 'Descoberta' },
  // Strategy
  { type: 'strategy', label: 'Estratégia', icon: 'Target', color: '#f59e0b', description: 'Plano estratégico de conversão', category: 'Estratégia' },
  { type: 'offer', label: 'Oferta', icon: 'Zap', color: '#f59e0b', description: 'Proposta de valor', category: 'Estratégia' },
  { type: 'differentials', label: 'Diferenciais', icon: 'Star', color: '#22d3ee', description: 'Vantagens competitivas', category: 'Estratégia' },
  { type: 'objections', label: 'Objeções', icon: 'ShieldAlert', color: '#ef4444', description: 'Objeções previstas e respostas', category: 'Estratégia' },
  { type: 'approach', label: 'Abordagem', icon: 'MessageSquare', color: '#22d3ee', description: 'Estratégia de abordagem', category: 'Estratégia' },
  // Technical
  { type: 'scope', label: 'Escopo', icon: 'Layers', color: '#10b981', description: 'Escopo técnico da solução', category: 'Técnico' },
  { type: 'structure', label: 'Estrutura Técnica', icon: 'Server', color: '#6366f1', description: 'Frontend, backend e banco', category: 'Técnico' },
  { type: 'integrations', label: 'Integrações', icon: 'Link', color: '#f97316', description: 'APIs e serviços externos', category: 'Técnico' },
  { type: 'automation', label: 'Automações', icon: 'Repeat', color: '#84cc16', description: 'Automações do sistema', category: 'Técnico' },
  // Execution
  { type: 'followup', label: 'Follow-up', icon: 'Clock', color: '#a78bfa', description: 'Plano de acompanhamento', category: 'Execução' },
  { type: 'checklist', label: 'Checklist', icon: 'CheckSquare', color: '#22c55e', description: 'Lista de tarefas', category: 'Execução' },
  { type: 'deploy', label: 'Deploy', icon: 'Rocket', color: '#06b6d4', description: 'Estratégia de entrega', category: 'Execução' },
  { type: 'prompt', label: 'Prompt Final', icon: 'Terminal', color: '#7c3aed', description: 'Prompt gerado pela IA', category: 'Execução' },
  { type: 'notes', label: 'Notas', icon: 'StickyNote', color: '#fbbf24', description: 'Anotações livres', category: 'Execução' },
];
