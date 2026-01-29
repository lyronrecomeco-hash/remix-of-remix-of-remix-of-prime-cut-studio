export interface ProposalWizardStep {
  id: string;
  question: string;
  placeholder: string;
  helperText?: string;
  type: 'text' | 'select' | 'textarea' | 'chips' | 'country';
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
  // País do cliente para adaptação de idioma
  client_country: string;
  // Estilo de copy
  copy_style?: 'balanced' | 'aggressive' | 'empathetic' | 'urgency';
  // AI-generated questions
  ai_questions?: Array<{
    question: string;
    answer: string;
  }>;
}

export const CLIENT_COUNTRIES = [
  { id: 'brazil', label: 'Brasil', flag: '🇧🇷', language: 'Português (Brasil)' },
  { id: 'usa', label: 'Estados Unidos', flag: '🇺🇸', language: 'English (US)' },
  { id: 'spain', label: 'Espanha', flag: '🇪🇸', language: 'Español' },
  { id: 'portugal', label: 'Portugal', flag: '🇵🇹', language: 'Português (Portugal)' },
  { id: 'mexico', label: 'México', flag: '🇲🇽', language: 'Español (México)' },
  { id: 'argentina', label: 'Argentina', flag: '🇦🇷', language: 'Español (Argentina)' },
  { id: 'france', label: 'França', flag: '🇫🇷', language: 'Français' },
  { id: 'germany', label: 'Alemanha', flag: '🇩🇪', language: 'Deutsch' },
  { id: 'italy', label: 'Itália', flag: '🇮🇹', language: 'Italiano' },
  { id: 'uk', label: 'Reino Unido', flag: '🇬🇧', language: 'English (UK)' },
  { id: 'other', label: 'Outro', flag: '🌍', language: 'Adaptar' },
] as const;

export const COPY_STYLES = [
  { id: 'balanced', label: 'Equilibrada', description: 'Profissional e cordial', emoji: '⚖️' },
  { id: 'aggressive', label: 'Agressiva', description: 'Direta e persuasiva', emoji: '🔥' },
  { id: 'empathetic', label: 'Empática', description: 'Toca na dor do cliente', emoji: '💬' },
  { id: 'urgency', label: 'Urgência', description: 'Cria senso de escassez', emoji: '⏰' },
] as const;

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
    id: 'client_country',
    question: 'Em qual país está o cliente?',
    placeholder: 'Selecione o país',
    helperText: 'A proposta será adaptada para o idioma e cultura comercial local',
    type: 'country',
    required: true,
    icon: 'globe'
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
