export interface SprintMissionStep {
  id: string;
  question: string;
  helperText?: string;
  type: 'text' | 'textarea' | 'select' | 'chips' | 'number';
  placeholder?: string;
  options?: string[];
  icon?: string;
  required?: boolean;
}

export interface SprintMissionFormData {
  goal_title: string;
  goal_value: string;
  goal_deadline: string;
  current_situation: string;
  main_obstacle: string;
  available_resources: string;
  daily_hours: string;
  priority_focus: string;
}

export interface SprintAction {
  id: string;
  title: string;
  description: string;
  type: 'prospecting' | 'follow-up' | 'proposal' | 'negotiation' | 'closing' | 'analysis';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  status: 'pending' | 'in_progress' | 'completed';
  linkedResource?: string;
}

export interface GeneratedSprint {
  mission_name: string;
  goal_summary: string;
  daily_target: string;
  total_days: number;
  actions: SprintAction[];
  motivation_message: string;
  success_metrics: string[];
}

export const SPRINT_STEPS: SprintMissionStep[] = [
  {
    id: 'goal_title',
    question: 'Qual sua meta principal?',
    helperText: 'Seja específico. Ex: "Fechar 5 contratos" ou "Faturar R$ 10.000"',
    type: 'text',
    placeholder: 'Digite sua meta de forma clara...',
    icon: 'target',
    required: true
  },
  {
    id: 'goal_value',
    question: 'Qual o valor financeiro dessa meta?',
    helperText: 'Quanto você pretende faturar ou economizar?',
    type: 'text',
    placeholder: 'Ex: R$ 15.000',
    icon: 'dollar-sign',
    required: true
  },
  {
    id: 'goal_deadline',
    question: 'Em quanto tempo quer alcançar?',
    helperText: 'Prazos realistas geram resultados reais',
    type: 'chips',
    options: ['7 dias', '15 dias', '30 dias', '60 dias', '90 dias'],
    icon: 'calendar',
    required: true
  },
  {
    id: 'current_situation',
    question: 'Qual sua situação atual?',
    helperText: 'Quanto você já faturou este mês? Quantos clientes tem?',
    type: 'textarea',
    placeholder: 'Descreva brevemente seu cenário atual...',
    icon: 'chart-bar',
    required: true
  },
  {
    id: 'main_obstacle',
    question: 'Qual o maior obstáculo para atingir essa meta?',
    helperText: 'Identificar bloqueios é o primeiro passo para superá-los',
    type: 'chips',
    options: [
      'Falta de leads qualificados',
      'Dificuldade em fechar vendas',
      'Propostas não são aceitas',
      'Tempo insuficiente',
      'Não sei prospectar',
      'Cliente some após contato'
    ],
    icon: 'alert-triangle',
    required: true
  },
  {
    id: 'available_resources',
    question: 'Quais recursos você tem disponíveis?',
    helperText: 'Selecione tudo que você pode usar agora',
    type: 'chips',
    options: [
      'WhatsApp conectado',
      'Lista de contatos',
      'Propostas prontas',
      'Portfólio de cases',
      'Time de apoio',
      'Investimento em ads'
    ],
    icon: 'briefcase',
    required: false
  },
  {
    id: 'daily_hours',
    question: 'Quantas horas por dia você pode dedicar?',
    helperText: 'Seja honesto - consistência vence intensidade',
    type: 'chips',
    options: ['1-2 horas', '2-4 horas', '4-6 horas', '6+ horas', 'Tempo integral'],
    icon: 'clock',
    required: true
  },
  {
    id: 'priority_focus',
    question: 'Qual deve ser o foco principal?',
    helperText: 'A IA vai priorizar ações nessa área',
    type: 'chips',
    options: [
      'Prospecção massiva',
      'Qualificação de leads',
      'Envio de propostas',
      'Follow-up agressivo',
      'Fechamento direto',
      'Reativação de contatos'
    ],
    icon: 'zap',
    required: true
  }
];

export const ACTION_ICONS: Record<SprintAction['type'], string> = {
  prospecting: 'search',
  'follow-up': 'message-circle',
  proposal: 'file-text',
  negotiation: 'handshake',
  closing: 'check-circle',
  analysis: 'bar-chart'
};
