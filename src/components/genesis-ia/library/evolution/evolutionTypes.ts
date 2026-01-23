import { 
  Plus, 
  Bug, 
  Palette, 
  Settings2, 
  Link2, 
  Wrench, 
  Cpu, 
  Bot, 
  RefreshCw, 
  Image, 
  Smartphone, 
  Zap,
  LucideIcon
} from 'lucide-react';

export interface EvolutionField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface EvolutionType {
  id: string;
  title: string;
  icon: LucideIcon;
  category: 'development' | 'design' | 'technical' | 'integration' | 'finalization' | 'optimization';
  categoryLabel: string;
  description: string;
  fields: EvolutionField[];
}

export const EVOLUTION_CATEGORIES = {
  development: { label: 'Desenvolvimento', color: 'from-blue-500 to-cyan-500' },
  design: { label: 'Design', color: 'from-pink-500 to-rose-500' },
  technical: { label: 'Técnico', color: 'from-orange-500 to-amber-500' },
  integration: { label: 'Integrações', color: 'from-purple-500 to-violet-500' },
  finalization: { label: 'Finalização', color: 'from-green-500 to-emerald-500' },
  optimization: { label: 'Otimização', color: 'from-yellow-500 to-lime-500' },
};

export const EVOLUTION_TYPES: EvolutionType[] = [
  {
    id: 'add-function',
    title: 'Adicionar Função',
    icon: Plus,
    category: 'development',
    categoryLabel: 'Desenvolvimento',
    description: 'Adicione uma nova funcionalidade ao projeto',
    fields: [
      {
        id: 'function_description',
        label: 'O que a nova função deve fazer?',
        type: 'textarea',
        placeholder: 'Ex: Um botão que abre um modal de contato com formulário...',
        required: true,
      },
      {
        id: 'target_page',
        label: 'Em qual página/seção?',
        type: 'text',
        placeholder: 'Ex: Página inicial, seção Hero',
      },
      {
        id: 'expected_behavior',
        label: 'Comportamento esperado',
        type: 'textarea',
        placeholder: 'Descreva o fluxo completo da funcionalidade...',
      },
    ],
  },
  {
    id: 'fix-bug',
    title: 'Corrigir Bug',
    icon: Bug,
    category: 'development',
    categoryLabel: 'Desenvolvimento',
    description: 'Corrija um problema ou comportamento inesperado',
    fields: [
      {
        id: 'bug_description',
        label: 'Descreva o bug',
        type: 'textarea',
        placeholder: 'O que está acontecendo de errado?',
        required: true,
      },
      {
        id: 'bug_page',
        label: 'Em qual página ocorre?',
        type: 'text',
        placeholder: 'Ex: Página de checkout',
      },
      {
        id: 'expected_vs_actual',
        label: 'Comportamento esperado vs atual',
        type: 'textarea',
        placeholder: 'Esperado: X | Atual: Y',
      },
      {
        id: 'steps_to_reproduce',
        label: 'Passos para reproduzir',
        type: 'textarea',
        placeholder: '1. Clique em X\n2. Aguarde Y\n3. O erro aparece',
      },
    ],
  },
  {
    id: 'visual-ui',
    title: 'Mudança Visual/UI',
    icon: Palette,
    category: 'design',
    categoryLabel: 'Design',
    description: 'Altere cores, fontes, layouts ou estilos',
    fields: [
      {
        id: 'target_element',
        label: 'Qual elemento alterar?',
        type: 'text',
        placeholder: 'Ex: Botão principal, Header, Cards de serviço',
        required: true,
      },
      {
        id: 'change_description',
        label: 'Qual mudança deseja?',
        type: 'textarea',
        placeholder: 'Ex: Mudar a cor do botão de azul para verde, arredondar bordas...',
        required: true,
      },
      {
        id: 'visual_reference',
        label: 'Referência visual (URL ou descrição)',
        type: 'text',
        placeholder: 'Ex: https://dribbble.com/... ou "estilo minimalista"',
      },
    ],
  },
  {
    id: 'technical-adjustments',
    title: 'Ajustes Técnicos',
    icon: Settings2,
    category: 'technical',
    categoryLabel: 'Técnico',
    description: 'Configurações, performance ou código',
    fields: [
      {
        id: 'adjustment_type',
        label: 'Tipo de ajuste',
        type: 'select',
        options: [
          { value: 'performance', label: 'Performance' },
          { value: 'config', label: 'Configuração' },
          { value: 'security', label: 'Segurança' },
          { value: 'seo', label: 'SEO' },
          { value: 'accessibility', label: 'Acessibilidade' },
          { value: 'other', label: 'Outro' },
        ],
        required: true,
      },
      {
        id: 'adjustment_description',
        label: 'Descreva o ajuste necessário',
        type: 'textarea',
        placeholder: 'Ex: Melhorar tempo de carregamento das imagens...',
        required: true,
      },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrações',
    icon: Link2,
    category: 'integration',
    categoryLabel: 'Integrações',
    description: 'Conecte APIs e serviços externos',
    fields: [
      {
        id: 'integration_type',
        label: 'Tipo de integração',
        type: 'select',
        options: [
          { value: 'whatsapp', label: 'WhatsApp' },
          { value: 'email', label: 'E-mail/SMTP' },
          { value: 'analytics', label: 'Google Analytics' },
          { value: 'facebook', label: 'Facebook Pixel' },
          { value: 'payment', label: 'Gateway de Pagamento' },
          { value: 'crm', label: 'CRM' },
          { value: 'other', label: 'Outra' },
        ],
        required: true,
      },
      {
        id: 'integration_purpose',
        label: 'Finalidade da integração',
        type: 'textarea',
        placeholder: 'Ex: Enviar leads para o WhatsApp automaticamente...',
        required: true,
      },
    ],
  },
  {
    id: 'integrate-tool',
    title: 'Integrar Ferramenta',
    icon: Wrench,
    category: 'integration',
    categoryLabel: 'Integrações',
    description: 'Conecte uma ferramenta externa específica',
    fields: [
      {
        id: 'tool',
        label: 'Qual ferramenta integrar?',
        type: 'select',
        options: [
          { value: 'stripe', label: 'Stripe (Pagamentos)' },
          { value: 'google-maps', label: 'Google Maps' },
          { value: 'openai', label: 'OpenAI / ChatGPT' },
          { value: 'whatsapp-api', label: 'WhatsApp Business API' },
          { value: 'google-analytics', label: 'Google Analytics' },
          { value: 'mailchimp', label: 'Mailchimp' },
          { value: 'hotjar', label: 'Hotjar' },
          { value: 'other', label: 'Outra...' },
        ],
        required: true,
      },
      {
        id: 'tool_function',
        label: 'Qual será a função dela?',
        type: 'textarea',
        placeholder: 'Ex: Processar pagamento de assinatura mensal',
        required: true,
      },
      {
        id: 'api_key',
        label: 'Chave de API / Credenciais (opcional)',
        type: 'text',
        placeholder: 'sk_live_...',
      },
      {
        id: 'api_url',
        label: 'URL da API (opcional)',
        type: 'text',
        placeholder: 'https://api.example.com',
      },
    ],
  },
  {
    id: 'adjust-function',
    title: 'Ajustar Função',
    icon: Cpu,
    category: 'development',
    categoryLabel: 'Desenvolvimento',
    description: 'Modifique uma funcionalidade existente',
    fields: [
      {
        id: 'existing_function',
        label: 'Qual função ajustar?',
        type: 'text',
        placeholder: 'Ex: Formulário de contato, Carrinho de compras',
        required: true,
      },
      {
        id: 'current_behavior',
        label: 'Comportamento atual',
        type: 'textarea',
        placeholder: 'Descreva como a função opera hoje...',
      },
      {
        id: 'desired_behavior',
        label: 'Comportamento desejado',
        type: 'textarea',
        placeholder: 'Descreva como deveria operar...',
        required: true,
      },
    ],
  },
  {
    id: 'improve-ai',
    title: 'Melhorar IA/Lógica',
    icon: Bot,
    category: 'technical',
    categoryLabel: 'Técnico',
    description: 'Aprimore lógicas de IA ou automação',
    fields: [
      {
        id: 'ai_component',
        label: 'Qual componente de IA?',
        type: 'text',
        placeholder: 'Ex: Chatbot, Recomendações, Análise de dados',
        required: true,
      },
      {
        id: 'improvement_goal',
        label: 'Objetivo da melhoria',
        type: 'textarea',
        placeholder: 'Ex: Tornar respostas mais precisas, adicionar contexto...',
        required: true,
      },
      {
        id: 'training_data',
        label: 'Dados de treinamento/exemplos',
        type: 'textarea',
        placeholder: 'Forneça exemplos de perguntas e respostas ideais...',
      },
    ],
  },
  {
    id: 'refactor-code',
    title: 'Refatorar Código',
    icon: RefreshCw,
    category: 'technical',
    categoryLabel: 'Técnico',
    description: 'Organize e melhore a estrutura do código',
    fields: [
      {
        id: 'refactor_area',
        label: 'Área para refatorar',
        type: 'select',
        options: [
          { value: 'components', label: 'Componentes' },
          { value: 'styles', label: 'Estilos/CSS' },
          { value: 'state', label: 'Gerenciamento de Estado' },
          { value: 'api', label: 'Chamadas de API' },
          { value: 'general', label: 'Código Geral' },
        ],
        required: true,
      },
      {
        id: 'refactor_reason',
        label: 'Motivo da refatoração',
        type: 'textarea',
        placeholder: 'Ex: Código duplicado, performance, manutenibilidade...',
      },
      {
        id: 'specific_files',
        label: 'Arquivos específicos (opcional)',
        type: 'text',
        placeholder: 'Ex: src/components/Header.tsx',
      },
    ],
  },
  {
    id: 'add-image',
    title: 'Adicionar Imagem',
    icon: Image,
    category: 'design',
    categoryLabel: 'Design',
    description: 'Insira ou substitua imagens no projeto',
    fields: [
      {
        id: 'image_location',
        label: 'Onde adicionar a imagem?',
        type: 'text',
        placeholder: 'Ex: Banner principal, Galeria de produtos',
        required: true,
      },
      {
        id: 'image_type',
        label: 'Tipo de imagem',
        type: 'select',
        options: [
          { value: 'hero', label: 'Hero/Banner' },
          { value: 'product', label: 'Produto' },
          { value: 'background', label: 'Background' },
          { value: 'icon', label: 'Ícone' },
          { value: 'logo', label: 'Logo' },
          { value: 'gallery', label: 'Galeria' },
          { value: 'other', label: 'Outro' },
        ],
        required: true,
      },
      {
        id: 'image_description',
        label: 'Descrição da imagem desejada',
        type: 'textarea',
        placeholder: 'Descreva a imagem ou forneça URL...',
      },
    ],
  },
  {
    id: 'make-pwa',
    title: 'Tornar App Baixável (PWA)',
    icon: Smartphone,
    category: 'finalization',
    categoryLabel: 'Finalização',
    description: 'Configure o projeto como Progressive Web App',
    fields: [
      {
        id: 'app_name',
        label: 'Nome do App',
        type: 'text',
        placeholder: 'Ex: Minha Barbearia',
        required: true,
      },
      {
        id: 'app_short_name',
        label: 'Nome curto (ícone)',
        type: 'text',
        placeholder: 'Ex: Barbearia',
        required: true,
      },
      {
        id: 'theme_color',
        label: 'Cor tema principal',
        type: 'text',
        placeholder: 'Ex: #3B82F6 ou azul',
      },
      {
        id: 'orientation',
        label: 'Orientação',
        type: 'select',
        options: [
          { value: 'portrait', label: 'Retrato (Vertical)' },
          { value: 'landscape', label: 'Paisagem (Horizontal)' },
          { value: 'any', label: 'Qualquer' },
        ],
      },
      {
        id: 'offline_support',
        label: 'Suporte offline?',
        type: 'checkbox',
      },
    ],
  },
  {
    id: 'optimization',
    title: 'Otimização',
    icon: Zap,
    category: 'optimization',
    categoryLabel: 'Otimização',
    description: 'Melhore performance, SEO ou acessibilidade',
    fields: [
      {
        id: 'optimization_area',
        label: 'Área de otimização',
        type: 'select',
        options: [
          { value: 'performance', label: 'Performance/Velocidade' },
          { value: 'seo', label: 'SEO' },
          { value: 'accessibility', label: 'Acessibilidade' },
          { value: 'mobile', label: 'Mobile/Responsividade' },
          { value: 'images', label: 'Otimização de Imagens' },
          { value: 'bundle', label: 'Tamanho do Bundle' },
        ],
        required: true,
      },
      {
        id: 'current_metrics',
        label: 'Métricas atuais (opcional)',
        type: 'textarea',
        placeholder: 'Ex: Lighthouse Score: 65, LCP: 4.2s...',
      },
      {
        id: 'target_metrics',
        label: 'Métricas alvo',
        type: 'textarea',
        placeholder: 'Ex: Score > 90, LCP < 2.5s...',
      },
    ],
  },
];

export const PLATFORM_OPTIONS = [
  { value: 'lovable', label: 'Lovable', icon: '💜', color: 'from-purple-500 to-pink-500' },
  { value: 'google-studio', label: 'Google AI Studio', icon: '🧠', color: 'from-blue-500 to-cyan-500' },
  { value: 'cursor', label: 'Cursor', icon: '⚡', color: 'from-amber-500 to-orange-500' },
  { value: 'v0', label: 'v0.dev', icon: '▲', color: 'from-gray-700 to-gray-900' },
  { value: 'bolt', label: 'Bolt.new', icon: '⚡', color: 'from-yellow-400 to-orange-500' },
  { value: 'other', label: 'Outro', icon: '🔧', color: 'from-gray-500 to-gray-700' },
];
