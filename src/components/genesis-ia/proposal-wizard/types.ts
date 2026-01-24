export interface ProposalWizardStep {
  id: string;
  question: string;
  placeholder: string;
  helperText?: string;
  type: 'text' | 'select' | 'textarea';
  options?: string[];
  required?: boolean;
}

export interface ProposalFormData {
  company_name: string;
  niche: string;
  main_problem: string;
  target_audience: string;
  current_solution: string;
  budget_range: string;
  urgency: string;
  contact_phone: string;
}

export interface GeneratedProposal {
  headline: string;
  problema_identificado: string;
  solucao_proposta: string;
  beneficios: string[];
  oferta_especial: string;
  investimento: string;
  mensagem_whatsapp: string;
}

export const WIZARD_STEPS: ProposalWizardStep[] = [
  {
    id: 'company_name',
    question: 'Qual o nome da empresa?',
    placeholder: 'Ex: Pizzaria do João',
    helperText: 'Nome que aparecerá na proposta',
    type: 'text',
    required: true
  },
  {
    id: 'niche',
    question: 'Qual o nicho/segmento do negócio?',
    placeholder: 'Selecione o nicho',
    type: 'select',
    options: [
      'Restaurante/Pizzaria',
      'Salão de Beleza',
      'Clínica Médica/Odontológica',
      'Academia/Fitness',
      'Pet Shop',
      'Loja de Roupas',
      'Advocacia',
      'Imobiliária',
      'Oficina Mecânica',
      'Educação/Cursos',
      'E-commerce',
      'Outro'
    ],
    required: true
  },
  {
    id: 'main_problem',
    question: 'Qual a maior dor do cliente hoje?',
    placeholder: 'Ex: Perdem clientes por não ter presença online...',
    helperText: 'Seja específico - isso personaliza a proposta',
    type: 'textarea',
    required: true
  },
  {
    id: 'target_audience',
    question: 'Quem é o público-alvo dele?',
    placeholder: 'Ex: Mulheres 25-45 anos, classe B...',
    helperText: 'Quanto mais detalhes, melhor a proposta',
    type: 'text'
  },
  {
    id: 'current_solution',
    question: 'Como ele resolve isso hoje?',
    placeholder: 'Ex: Só Instagram, site antigo, boca a boca...',
    helperText: 'Entender o cenário atual ajuda a propor melhorias',
    type: 'text'
  },
  {
    id: 'budget_range',
    question: 'Qual a faixa de investimento esperada?',
    placeholder: 'Selecione a faixa',
    type: 'select',
    options: [
      'Até R$ 500/mês',
      'R$ 500 - R$ 1.000/mês',
      'R$ 1.000 - R$ 2.000/mês',
      'R$ 2.000 - R$ 5.000/mês',
      'Acima de R$ 5.000/mês',
      'Não definido'
    ]
  },
  {
    id: 'urgency',
    question: 'Qual a urgência do cliente?',
    placeholder: 'Selecione',
    type: 'select',
    options: [
      'Quer resolver agora',
      'Próximas semanas',
      'Próximo mês',
      'Apenas pesquisando'
    ]
  },
  {
    id: 'contact_phone',
    question: 'WhatsApp do cliente (opcional)',
    placeholder: '(11) 99999-9999',
    helperText: 'Para enviar a proposta diretamente',
    type: 'text'
  }
];
