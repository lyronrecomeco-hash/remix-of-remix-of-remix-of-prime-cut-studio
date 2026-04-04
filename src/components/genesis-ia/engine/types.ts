import type { Node, Edge } from '@xyflow/react';

export type EngineNodeType = 
  | 'prospect' | 'diagnosis' | 'opportunity' | 'offer'
  | 'scope' | 'frontend' | 'backend' | 'database'
  | 'integrations' | 'objections' | 'approach' | 'followup'
  | 'automation' | 'deploy' | 'notes' | 'checklist' | 'prompt';

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

export const NODE_CATALOG: { type: EngineNodeType; label: string; icon: string; color: string; description: string }[] = [
  { type: 'prospect', label: 'Prospect', icon: 'Building2', color: '#3b82f6', description: 'Dados do cliente/prospect' },
  { type: 'diagnosis', label: 'Diagnóstico', icon: 'Search', color: '#8b5cf6', description: 'Análise de dores e problemas' },
  { type: 'opportunity', label: 'Oportunidade', icon: 'TrendingUp', color: '#06b6d4', description: 'Oportunidades identificadas' },
  { type: 'offer', label: 'Oferta', icon: 'Zap', color: '#f59e0b', description: 'Proposta de valor e oferta' },
  { type: 'scope', label: 'Escopo', icon: 'Layers', color: '#10b981', description: 'Escopo técnico da solução' },
  { type: 'frontend', label: 'Frontend', icon: 'Monitor', color: '#6366f1', description: 'Estrutura do frontend' },
  { type: 'backend', label: 'Backend', icon: 'Server', color: '#ec4899', description: 'Estrutura do backend' },
  { type: 'database', label: 'Banco de Dados', icon: 'Database', color: '#14b8a6', description: 'Modelagem de dados' },
  { type: 'integrations', label: 'Integrações', icon: 'Link', color: '#f97316', description: 'APIs e integrações externas' },
  { type: 'objections', label: 'Objeções', icon: 'ShieldAlert', color: '#ef4444', description: 'Objeções previstas e respostas' },
  { type: 'approach', label: 'Abordagem', icon: 'MessageSquare', color: '#22d3ee', description: 'Estratégia de abordagem comercial' },
  { type: 'followup', label: 'Follow-up', icon: 'Clock', color: '#a78bfa', description: 'Plano de follow-up' },
  { type: 'automation', label: 'Automações', icon: 'Repeat', color: '#84cc16', description: 'Automações do sistema' },
  { type: 'deploy', label: 'Deploy', icon: 'Rocket', color: '#06b6d4', description: 'Estratégia de deploy' },
  { type: 'notes', label: 'Notas', icon: 'StickyNote', color: '#fbbf24', description: 'Anotações livres' },
  { type: 'checklist', label: 'Checklist', icon: 'CheckSquare', color: '#22c55e', description: 'Lista de verificação' },
  { type: 'prompt', label: 'Prompt Final', icon: 'Terminal', color: '#7c3aed', description: 'Prompt gerado pela IA' },
];
