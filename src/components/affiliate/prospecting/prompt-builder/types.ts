export interface NicheTemplate {
  id: string;
  name: string;
  niche: string;
  icon: string;
  description: string;
  defaultAppName: string;
  targetAudience: string;
  mainTask: string;
  mainBenefit: string;
  dailyUsers: string;
  businessModel: string;
  mainProblem: string;
  expectedOutcome: string;
  defaultPages: string[];
  suggestedFeatures: string[];
  coreFeatures: string[];
  integrations: string[];
  userFlows: string[];
  suggestedColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  designStyle: string;
  iconStyle: string;
}

export interface PromptBuilderState {
  appName: string;
  targetAudience: string;
  mainTask: string;
  mainBenefit: string;
  dailyUsers: string;
  businessModel: string;
  mainProblem: string;
  expectedOutcome: string;
  pages: string[];
  additionalFeatures: string;
  coreFeatures: string[];
  integrations: string[];
  userFlows: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: string;
  designStyle: string;
  iconStyle: string;
  language: string;
  platform: string;
  suggestedFeatures: string[];
  selectedSuggestedFeatures: string[];
  authType: string;
  paymentMethods: string[];
  notificationChannels: string[];
  mobileFirst: boolean;
  pwaSupport: boolean;
  darkMode: boolean;
}

export interface AIPlatform {
  id: string;
  name: string;
  logo?: string;
  description: string;
  promptStyle: 'detailed' | 'conversational' | 'structured' | 'minimal';
  supportsMultipage: boolean;
  maxPromptLength?: number;
}

export const AI_PLATFORMS: AIPlatform[] = [
  {
    id: 'lovable',
    name: 'Lovable',
    description: 'IA moderna para apps React completos',
    promptStyle: 'detailed',
    supportsMultipage: true,
  },
  {
    id: 'bolt',
    name: 'Bolt.new',
    description: 'Deploy instantâneo de apps full-stack',
    promptStyle: 'conversational',
    supportsMultipage: true,
  },
  {
    id: 'v0',
    name: 'v0 by Vercel',
    description: 'Componentes React com shadcn/ui',
    promptStyle: 'structured',
    supportsMultipage: true,
  },
  {
    id: 'cursor',
    name: 'Cursor AI',
    description: 'IDE com IA integrada',
    promptStyle: 'detailed',
    supportsMultipage: true,
  },
  {
    id: 'replit',
    name: 'Replit Agent',
    description: 'Ambiente de desenvolvimento com IA',
    promptStyle: 'conversational',
    supportsMultipage: true,
  },
  {
    id: 'webflow',
    name: 'Webflow AI',
    description: 'Sites profissionais sem código',
    promptStyle: 'minimal',
    supportsMultipage: true,
  },
  {
    id: 'framer',
    name: 'Framer AI',
    description: 'Sites interativos e animados',
    promptStyle: 'conversational',
    supportsMultipage: true,
  },
  {
    id: 'durable',
    name: 'Durable',
    description: 'Sites de negócios em segundos',
    promptStyle: 'minimal',
    supportsMultipage: false,
  },
  {
    id: 'wix',
    name: 'Wix ADI',
    description: 'Sites automáticos personalizados',
    promptStyle: 'minimal',
    supportsMultipage: true,
  },
  {
    id: 'hostinger',
    name: 'Hostinger AI',
    description: 'Sites otimizados para SEO',
    promptStyle: 'structured',
    supportsMultipage: true,
  },
  {
    id: 'mobirise',
    name: 'Mobirise AI',
    description: 'Sites mobile-first',
    promptStyle: 'minimal',
    supportsMultipage: true,
  },
  {
    id: 'gamma',
    name: 'Gamma',
    description: 'Apresentações e docs interativos',
    promptStyle: 'conversational',
    supportsMultipage: false,
  },
];

export const TYPOGRAPHY_OPTIONS = [
  { id: 'inter', name: 'Inter', category: 'Sans-serif', description: 'Moderna, legível, perfeita para interfaces' },
  { id: 'poppins', name: 'Poppins', category: 'Sans-serif', description: 'Geométrica, amigável, versátil' },
  { id: 'roboto', name: 'Roboto', category: 'Sans-serif', description: 'Clássica Google, neutra, profissional' },
  { id: 'montserrat', name: 'Montserrat', category: 'Sans-serif', description: 'Elegante, títulos impactantes' },
  { id: 'lato', name: 'Lato', category: 'Sans-serif', description: 'Equilibrada, séria mas acolhedora' },
  { id: 'opensans', name: 'Open Sans', category: 'Sans-serif', description: 'Neutra, excelente legibilidade' },
  { id: 'playfair', name: 'Playfair Display', category: 'Serif', description: 'Sofisticada, luxo e tradição' },
  { id: 'merriweather', name: 'Merriweather', category: 'Serif', description: 'Legível em telas, editorial' },
  { id: 'spacegrotesk', name: 'Space Grotesk', category: 'Display', description: 'Tech, futurista, diferenciada' },
  { id: 'dmans', name: 'DM Sans', category: 'Sans-serif', description: 'Clean, compacta, moderna' },
  { id: 'nunito', name: 'Nunito', category: 'Sans-serif', description: 'Arredondada, amigável, suave' },
  { id: 'sourcesans', name: 'Source Sans Pro', category: 'Sans-serif', description: 'Adobe, séria, corporativa' },
];

export const LANGUAGE_OPTIONS = [
  { id: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { id: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { id: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { id: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { id: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { id: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
  { id: 'other', name: 'Outro', flag: '🌍' },
];

export const AUTH_TYPES = [
  { id: 'email', name: 'Email + Senha', description: 'Cadastro tradicional com confirmação' },
  { id: 'magic-link', name: 'Magic Link', description: 'Login sem senha via email' },
  { id: 'phone', name: 'Telefone + SMS', description: 'Verificação por código SMS' },
  { id: 'social', name: 'Redes Sociais', description: 'Google, Facebook, Apple' },
  { id: 'whatsapp', name: 'WhatsApp OTP', description: 'Código via WhatsApp' },
];

export const PAYMENT_METHODS = [
  { id: 'pix', name: 'PIX', description: 'Pagamento instantâneo brasileiro' },
  { id: 'credit-card', name: 'Cartão de Crédito', description: 'Visa, Mastercard, Elo' },
  { id: 'debit-card', name: 'Cartão de Débito', description: 'Pagamento à vista' },
  { id: 'boleto', name: 'Boleto Bancário', description: 'Pagamento em até 3 dias' },
  { id: 'wallet', name: 'Carteira Digital', description: 'Saldo pré-pago no app' },
];

export const NOTIFICATION_CHANNELS = [
  { id: 'whatsapp', name: 'WhatsApp', description: 'Mensagens e lembretes' },
  { id: 'email', name: 'Email', description: 'Confirmações e newsletters' },
  { id: 'push', name: 'Push Notification', description: 'Alertas no dispositivo' },
  { id: 'sms', name: 'SMS', description: 'Mensagens de texto' },
];

export const DESIGN_STYLES = [
  { id: 'minimal', name: 'Minimalista', description: 'Clean, espaço, foco no conteúdo' },
  { id: 'modern', name: 'Moderno', description: 'Tendências atuais, gradientes sutis' },
  { id: 'glassmorphism', name: 'Glassmorphism', description: 'Vidro fosco, transparências' },
  { id: 'neumorphism', name: 'Neumorphism', description: 'Sombras suaves, relevo sutil' },
  { id: 'brutalist', name: 'Brutalista', description: 'Ousado, cores fortes, impactante' },
  { id: 'corporate', name: 'Corporativo', description: 'Profissional, sério, confiável' },
];

export const ICON_STYLES = [
  { id: 'lucide', name: 'Lucide', description: 'Linhas finas, moderno, consistente' },
  { id: 'phosphor', name: 'Phosphor', description: 'Flexível, múltiplos pesos' },
  { id: 'heroicons', name: 'Heroicons', description: 'Tailwind oficial, clean' },
  { id: 'feather', name: 'Feather', description: 'Leve, simples, elegante' },
  { id: 'tabler', name: 'Tabler', description: 'Grande variedade, stroke consistente' },
];
