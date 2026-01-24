export interface ProposalWizardStep {
  id: string;
  question: string;
  placeholder: string;
  helperText?: string;
  type: 'text' | 'select' | 'textarea' | 'chips';
  options?: string[];
  required?: boolean;
  icon?: string;
}

export interface ProposalFormData {
  company_name: string;
  company_niche: string;
  main_problem: string;
  decision_maker: string;
  competitors: string;
  failed_attempts: string;
  dream_result: string;
  contact_phone: string;
  // AI-generated questions
  ai_questions?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface GeneratedProposal {
  mensagem_prospecao: string;
  variantes?: string[];
}

// Perguntas estratégicas avançadas para gerar proposta de alta conversão
export const WIZARD_STEPS: ProposalWizardStep[] = [
  {
    id: 'company_name',
    question: 'Qual o nome da empresa que você vai prospectar?',
    placeholder: 'Ex: Barbearia Style, Clínica Dra. Ana...',
    helperText: 'Nome completo como o cliente conhece',
    type: 'text',
    required: true,
    icon: 'building'
  },
  {
    id: 'company_niche',
    question: 'Qual o segmento/nicho desse negócio?',
    placeholder: 'Selecione ou digite',
    type: 'chips',
    options: [
      'Barbearia',
      'Salão de Beleza',
      'Clínica Estética',
      'Clínica Médica',
      'Clínica Odontológica',
      'Restaurante',
      'Pizzaria/Lanchonete',
      'Academia',
      'Pet Shop',
      'Advocacia',
      'Contabilidade',
      'Imobiliária',
      'Loja de Roupas',
      'E-commerce',
      'Oficina Mecânica',
      'Escola/Curso'
    ],
    required: true,
    icon: 'briefcase'
  },
  {
    id: 'main_problem',
    question: 'Qual a DOR mais visível desse negócio hoje?',
    placeholder: 'Ex: Não aparecem no Google, cliente reclama de demora no WhatsApp, agenda bagunçada...',
    helperText: 'O que você percebeu que está travando o crescimento deles?',
    type: 'textarea',
    required: true,
    icon: 'alert-triangle'
  },
  {
    id: 'decision_maker',
    question: 'Quem é o decisor? Qual o cargo/função?',
    placeholder: 'Ex: Dono, Gerente, Sócio, Recepcionista...',
    helperText: 'Saber quem decide acelera o fechamento',
    type: 'text',
    icon: 'user-check'
  },
  {
    id: 'competitors',
    question: 'Os concorrentes diretos usam tecnologia/automação?',
    placeholder: 'Selecione',
    type: 'select',
    options: [
      'Sim, estão na frente tecnologicamente',
      'Mais ou menos, alguns usam',
      'Não, todos ainda são tradicionais',
      'Não sei informar'
    ],
    helperText: 'Isso ajuda a criar urgência na proposta',
    icon: 'users'
  },
  {
    id: 'failed_attempts',
    question: 'Esse cliente já tentou algo parecido antes?',
    placeholder: 'Selecione',
    type: 'select',
    options: [
      'Sim, contratou agência e não deu certo',
      'Sim, tentou fazer sozinho',
      'Não, é a primeira vez buscando isso',
      'Não sei'
    ],
    helperText: 'Entender frustrações anteriores personaliza a abordagem',
    icon: 'history'
  },
  {
    id: 'dream_result',
    question: 'Qual o RESULTADO DOS SONHOS desse cliente?',
    placeholder: 'Ex: Agenda sempre cheia, não precisar responder WhatsApp manualmente, aparecer em primeiro no Google...',
    helperText: 'O que faria ele falar "valeu cada centavo"?',
    type: 'textarea',
    required: true,
    icon: 'star'
  },
  {
    id: 'contact_phone',
    question: 'WhatsApp do cliente (para envio direto)',
    placeholder: '(11) 99999-9999',
    helperText: 'Opcional - para enviar a proposta na hora',
    type: 'text',
    icon: 'phone'
  }
];
