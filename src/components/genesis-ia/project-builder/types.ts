// Project Builder Types

export type TargetAI = 'lovable' | 'google-studio' | 'base64' | 'chatgpt' | 'other';

export type TemplateId = 
  | 'pizzaria' 
  | 'barbearia' 
  | 'petshop' 
  | 'academia' 
  | 'salao-beleza' 
  | 'restaurante' 
  | 'clinica' 
  | 'empresa-servicos' 
  | 'loja-local' 
  | 'escola';

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  icon: string;
  objectives: string[];
  suggestedPages: string[];
  specificFeatures: string[];
}

export interface ProjectFormData {
  // Step 1: Target AI
  targetAI: TargetAI;
  otherAI?: string;
  
  // Step 2: Identity
  projectName: string;
  companyName: string;
  cityRegion: string;
  targetAudience: string;
  language: string;
  
  // Step 3: Objectives (dynamic per template)
  selectedObjectives: string[];
  customObjective?: string;
  
  // Step 4: Site Structure
  selectedPages: string[];
  customPages: string[];
  
  // Step 5: Design
  primaryColor: string;
  secondaryColor: string;
  theme: 'light' | 'dark';
  typography: string;
  visualStyle: string;
  
  // Step 6: Specific Features
  selectedFeatures: string[];
  
  // Step 7: Quality Rules
  productionReady: boolean;
  seoOptimized: boolean;
  performanceOptimized: boolean;
  mobileFirst: boolean;
}

export interface ProjectBuilderContextType {
  // Template
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  
  // Form
  formData: ProjectFormData;
  updateFormData: <K extends keyof ProjectFormData>(
    key: K,
    value: ProjectFormData[K]
  ) => void;
  
  // Navigation
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  canProceed: boolean;
  
  // Prompt
  generatedPrompt: string;
  generatePrompt: () => string;
  
  // Reset
  resetBuilder: () => void;
}

export const TEMPLATES: Template[] = [
  {
    id: 'pizzaria',
    name: 'Pizzaria',
    description: 'Cardápio digital, pedidos e delivery',
    icon: '🍕',
    objectives: [
      'Receber pedidos via WhatsApp',
      'Mostrar cardápio digital',
      'Exibir localização',
      'Destacar promoções',
      'Aceitar reservas',
    ],
    suggestedPages: ['Home', 'Cardápio', 'Promoções', 'Localização', 'Contato'],
    specificFeatures: [
      'Cardápio interativo',
      'Botão WhatsApp flutuante',
      'Galeria de fotos',
      'Horário de funcionamento',
      'Mapa de localização',
    ],
  },
  {
    id: 'barbearia',
    name: 'Barbearia',
    description: 'Agendamento online e serviços',
    icon: '💈',
    objectives: [
      'Agendamento online',
      'Apresentar serviços e preços',
      'Mostrar profissionais',
      'Captar clientes locais',
      'Fidelizar clientes',
    ],
    suggestedPages: ['Home', 'Serviços', 'Profissionais', 'Agendamento', 'Galeria', 'Contato'],
    specificFeatures: [
      'Sistema de agendamento',
      'Perfil dos barbeiros',
      'Galeria de trabalhos',
      'Botão WhatsApp flutuante',
      'Reviews de clientes',
    ],
  },
  {
    id: 'petshop',
    name: 'Petshop',
    description: 'Serviços para pets e agendamento',
    icon: '🐶',
    objectives: [
      'Agendar banho e tosa',
      'Mostrar serviços disponíveis',
      'Vender produtos online',
      'Informar sobre veterinária',
      'Programa de fidelidade',
    ],
    suggestedPages: ['Home', 'Serviços', 'Produtos', 'Agendamento', 'Sobre', 'Contato'],
    specificFeatures: [
      'Agendamento de serviços',
      'Catálogo de produtos',
      'Galeria de pets atendidos',
      'Botão WhatsApp flutuante',
      'Dicas e cuidados',
    ],
  },
  {
    id: 'academia',
    name: 'Academia',
    description: 'Planos, treinos e matrículas',
    icon: '🏋️',
    objectives: [
      'Captar novos alunos',
      'Mostrar planos e preços',
      'Apresentar estrutura',
      'Informar horários',
      'Promover aulas especiais',
    ],
    suggestedPages: ['Home', 'Planos', 'Estrutura', 'Aulas', 'Horários', 'Contato'],
    specificFeatures: [
      'Tabela de planos',
      'Tour virtual da academia',
      'Calendário de aulas',
      'Botão WhatsApp flutuante',
      'Depoimentos de alunos',
    ],
  },
  {
    id: 'salao-beleza',
    name: 'Salão de Beleza',
    description: 'Agendamento e serviços de beleza',
    icon: '💇',
    objectives: [
      'Agendamento online',
      'Mostrar serviços e preços',
      'Apresentar profissionais',
      'Exibir trabalhos realizados',
      'Promover ofertas',
    ],
    suggestedPages: ['Home', 'Serviços', 'Profissionais', 'Portfolio', 'Agendamento', 'Contato'],
    specificFeatures: [
      'Sistema de agendamento',
      'Galeria de trabalhos',
      'Perfil das profissionais',
      'Botão WhatsApp flutuante',
      'Avaliações de clientes',
    ],
  },
  {
    id: 'restaurante',
    name: 'Restaurante',
    description: 'Cardápio, reservas e delivery',
    icon: '🍔',
    objectives: [
      'Mostrar cardápio completo',
      'Aceitar reservas',
      'Pedidos para delivery',
      'Apresentar o ambiente',
      'Promover eventos',
    ],
    suggestedPages: ['Home', 'Cardápio', 'Reservas', 'Galeria', 'Eventos', 'Contato'],
    specificFeatures: [
      'Cardápio digital',
      'Sistema de reservas',
      'Galeria do ambiente',
      'Botão WhatsApp flutuante',
      'Mapa de localização',
    ],
  },
  {
    id: 'clinica',
    name: 'Clínica / Saúde',
    description: 'Agendamento médico e serviços',
    icon: '🦷',
    objectives: [
      'Agendamento de consultas',
      'Apresentar especialidades',
      'Mostrar equipe médica',
      'Informar convênios',
      'Gerar confiança',
    ],
    suggestedPages: ['Home', 'Especialidades', 'Equipe', 'Convênios', 'Agendamento', 'Contato'],
    specificFeatures: [
      'Sistema de agendamento',
      'Perfil dos profissionais',
      'Lista de convênios',
      'Botão WhatsApp flutuante',
      'Depoimentos de pacientes',
    ],
  },
  {
    id: 'empresa-servicos',
    name: 'Empresa de Serviços',
    description: 'Portfólio e orçamentos',
    icon: '🏢',
    objectives: [
      'Apresentar serviços',
      'Gerar orçamentos',
      'Mostrar portfólio',
      'Captar leads',
      'Construir autoridade',
    ],
    suggestedPages: ['Home', 'Serviços', 'Portfólio', 'Sobre', 'Orçamento', 'Contato'],
    specificFeatures: [
      'Formulário de orçamento',
      'Galeria de projetos',
      'Depoimentos de clientes',
      'Botão WhatsApp flutuante',
      'Cases de sucesso',
    ],
  },
  {
    id: 'loja-local',
    name: 'Loja Local',
    description: 'Catálogo de produtos e vendas',
    icon: '🛒',
    objectives: [
      'Mostrar produtos',
      'Vender online',
      'Informar localização',
      'Promover ofertas',
      'Fidelizar clientes',
    ],
    suggestedPages: ['Home', 'Produtos', 'Ofertas', 'Sobre', 'Localização', 'Contato'],
    specificFeatures: [
      'Catálogo de produtos',
      'Carrinho de compras',
      'Sistema de ofertas',
      'Botão WhatsApp flutuante',
      'Newsletter',
    ],
  },
  {
    id: 'escola',
    name: 'Escola / Curso',
    description: 'Cursos, matrículas e informações',
    icon: '📚',
    objectives: [
      'Captar alunos',
      'Mostrar cursos',
      'Facilitar matrículas',
      'Informar metodologia',
      'Apresentar estrutura',
    ],
    suggestedPages: ['Home', 'Cursos', 'Metodologia', 'Estrutura', 'Matrícula', 'Contato'],
    specificFeatures: [
      'Lista de cursos',
      'Formulário de matrícula',
      'Tour virtual',
      'Botão WhatsApp flutuante',
      'Depoimentos de alunos',
    ],
  },
];

export const initialFormData: ProjectFormData = {
  targetAI: 'lovable',
  projectName: '',
  companyName: '',
  cityRegion: '',
  targetAudience: '',
  language: 'Português (Brasil)',
  selectedObjectives: [],
  selectedPages: [],
  customPages: [],
  primaryColor: '#10b981',
  secondaryColor: '#3b82f6',
  theme: 'dark',
  typography: 'Inter',
  visualStyle: 'Moderno e Clean',
  selectedFeatures: [],
  productionReady: true,
  seoOptimized: true,
  performanceOptimized: true,
  mobileFirst: true,
};
