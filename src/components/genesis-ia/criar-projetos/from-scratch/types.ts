// Types for the From Scratch Wizard

export type ProjectType = 'app' | 'site';

export type TargetAI = 'lovable' | 'cursor' | 'v0' | 'bolt' | 'chatgpt' | 'google-studio' | 'windsurf' | 'claude' | 'antigravity' | 'trae' | 'replit' | 'other';

export type CodeStyle = 'modern' | 'traditional';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface FromScratchFormData {
  // Step 1: Project Type
  projectType: ProjectType;
  
  // Step 2: Niche
  nicheId: string;
  customNiche?: string;
  
  // Step 3: Identity
  projectName: string;
  companyName: string;
  slogan: string;
  cityRegion: string;
  targetAudience: string;
  
  // Step 4: Language & Region
  language: string;
  customLanguage?: string;
  currency: string;
  timezone: string;
  
  // Step 5: Objectives
  selectedObjectives: string[];
  customObjectives: string[];
  
  // Step 6: Structure
  selectedPages: string[];
  customPages: string[];
  
  // Step 7: Visual
  primaryColor: string;
  secondaryColor: string;
  themeMode: ThemeMode;
  typography: string;
  visualStyle: string;
  
  // Step 8: Features
  selectedFeatures: string[];
  integrations: string[];
  
  // Step 9: Extras
  isPWA: boolean;
  hasAdvancedSEO: boolean;
  hasAnalytics: boolean;
  isPerformanceOptimized: boolean;
  hasAccessibility: boolean;
  // Step 9.5: Responsiveness
  responsiveMobile: boolean;
  responsiveTablet: boolean;
  responsiveDesktop: boolean;
  responsiveLargeScreen: boolean;
  
  // Step 10: Target AI
  targetAI: TargetAI;
  otherAI?: string;
  codeStyle: CodeStyle;
}

export const LANGUAGES = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-UK', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'other', name: 'Outro', flag: '🌍' },
];

export const CURRENCIES = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

export const TIMEZONES = [
  { code: 'America/Sao_Paulo', name: 'Brasília (GMT-3)' },
  { code: 'America/New_York', name: 'New York (GMT-5)' },
  { code: 'America/Los_Angeles', name: 'Los Angeles (GMT-8)' },
  { code: 'Europe/London', name: 'London (GMT+0)' },
  { code: 'Europe/Paris', name: 'Paris (GMT+1)' },
  { code: 'Asia/Tokyo', name: 'Tokyo (GMT+9)' },
  { code: 'Asia/Shanghai', name: 'Shanghai (GMT+8)' },
  { code: 'Australia/Sydney', name: 'Sydney (GMT+11)' },
];

export const TYPOGRAPHY_OPTIONS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Lato',
  'Playfair Display',
  'Raleway',
  'Source Sans Pro',
  'Nunito',
  'Work Sans',
  'DM Sans',
  'Space Grotesk',
  'Outfit',
  'Sora',
];

export const VISUAL_STYLES = [
  'Moderno e Clean',
  'Minimalista',
  'Elegante e Sofisticado',
  'Ousado e Vibrante',
  'Retrô / Vintage',
  'Futurista / Tech',
  'Orgânico / Natural',
  'Corporativo Profissional',
  'Divertido e Colorido',
  'Dark Mode Premium',
  'Glassmorphism',
  'Neobrutalism',
];

// Features CORE - sem duplicatas com integrações
export const COMMON_FEATURES = [
  'Formulário de contato inteligente',
  'Galeria de fotos/imagens',
  'Depoimentos de clientes',
  'FAQ / Perguntas frequentes',
  'Sistema de busca',
  'Filtros avançados',
  'Avaliações e reviews',
  'Compartilhamento social',
  'Modo escuro/claro',
  'Multi-idioma',
  'Notificações push',
  'Cookies consent',
];

// Integrações EXTERNAS - serviços de terceiros
export const INTEGRATIONS = [
  { id: 'whatsapp', name: 'WhatsApp Business', icon: '💬', description: 'Botão flutuante + mensagens automáticas' },
  { id: 'google-maps', name: 'Google Maps', icon: '🗺️', description: 'Mapa interativo de localização' },
  { id: 'google-analytics', name: 'Google Analytics', icon: '📊', description: 'Tracking de visitas e conversões' },
  { id: 'facebook-pixel', name: 'Facebook Pixel', icon: '📱', description: 'Remarketing e conversões' },
  { id: 'stripe', name: 'Stripe', icon: '💳', description: 'Pagamentos internacionais' },
  { id: 'mercadopago', name: 'Mercado Pago', icon: '💰', description: 'PIX, boleto e cartão' },
  { id: 'instagram', name: 'Instagram Feed', icon: '📸', description: 'Feed integrado ao site' },
  { id: 'youtube', name: 'YouTube Embed', icon: '▶️', description: 'Vídeos incorporados' },
  { id: 'calendly', name: 'Calendly', icon: '📅', description: 'Agendamento automático' },
  { id: 'mailchimp', name: 'Mailchimp', icon: '📧', description: 'Email marketing e newsletter' },
  { id: 'hotjar', name: 'Hotjar', icon: '🔥', description: 'Heatmaps e gravação de sessões' },
  { id: 'recaptcha', name: 'reCAPTCHA', icon: '🔒', description: 'Proteção contra bots' },
  { id: 'tawk', name: 'Tawk.to Chat', icon: '💭', description: 'Chat ao vivo gratuito' },
  { id: 'crisp', name: 'Crisp Chat', icon: '💬', description: 'Chat moderno com chatbot' },
];

// AI Targets with real icons/logos represented
export const AI_TARGETS: { id: TargetAI; name: string; description: string; icon: string; logoUrl?: string; category?: 'ide' | 'builder' | 'chat' }[] = [
  { 
    id: 'lovable', 
    name: 'Lovable', 
    description: 'IA para criar apps React completos com deploy automático', 
    icon: '💜',
    category: 'builder',
  },
  { 
    id: 'cursor', 
    name: 'Cursor', 
    description: 'IDE com IA integrada para desenvolvedores', 
    icon: '⚡',
    category: 'ide',
  },
  { 
    id: 'antigravity', 
    name: 'Antigravity', 
    description: 'IDE agêntica do Google com Gemini 3 Pro', 
    icon: '🚀',
    category: 'ide',
  },
  { 
    id: 'windsurf', 
    name: 'Windsurf', 
    description: 'IDE IA da Codeium para desenvolvimento ágil', 
    icon: '🏄',
    category: 'ide',
  },
  { 
    id: 'trae', 
    name: 'Trae', 
    description: 'IDE IA da ByteDance com agentes autônomos', 
    icon: '🔮',
    category: 'ide',
  },
  { 
    id: 'v0', 
    name: 'v0 (Vercel)', 
    description: 'Gerador de UI da Vercel com shadcn/ui', 
    icon: '▲',
    category: 'builder',
  },
  { 
    id: 'bolt', 
    name: 'Bolt.new', 
    description: 'Ambiente IA full-stack com preview instantâneo', 
    icon: '⚡',
    category: 'builder',
  },
  { 
    id: 'replit', 
    name: 'Replit', 
    description: 'IDE online com deploy integrado e IA', 
    icon: '🔁',
    category: 'builder',
  },
  { 
    id: 'chatgpt', 
    name: 'ChatGPT', 
    description: 'OpenAI GPT para geração de código', 
    icon: '🤖',
    category: 'chat',
  },
  { 
    id: 'claude', 
    name: 'Claude', 
    description: 'Anthropic Claude para código limpo e seguro', 
    icon: '🧠',
    category: 'chat',
  },
  { 
    id: 'google-studio', 
    name: 'Google AI Studio', 
    description: 'Gemini da Google para projetos avançados', 
    icon: '🔷',
    category: 'chat',
  },
  { 
    id: 'other', 
    name: 'Outra IA', 
    description: 'Especificar manualmente', 
    icon: '✨',
  },
];

export const COLOR_PRESETS = [
  { name: 'Azul Profissional', primary: '#2563eb', secondary: '#3b82f6' },
  { name: 'Verde Natureza', primary: '#16a34a', secondary: '#22c55e' },
  { name: 'Roxo Criativo', primary: '#7c3aed', secondary: '#8b5cf6' },
  { name: 'Vermelho Energia', primary: '#dc2626', secondary: '#ef4444' },
  { name: 'Laranja Vibrante', primary: '#ea580c', secondary: '#f97316' },
  { name: 'Rosa Moderno', primary: '#db2777', secondary: '#ec4899' },
  { name: 'Ciano Tech', primary: '#0891b2', secondary: '#06b6d4' },
  { name: 'Dourado Premium', primary: '#d97706', secondary: '#f59e0b' },
  { name: 'Preto Elegante', primary: '#1c1917', secondary: '#404040' },
  { name: 'Esmeralda', primary: '#059669', secondary: '#10b981' },
];

export const initialFromScratchFormData: FromScratchFormData = {
  projectType: 'site',
  nicheId: '',
  projectName: '',
  companyName: '',
  slogan: '',
  cityRegion: '',
  targetAudience: '',
  language: 'pt-BR',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  selectedObjectives: [],
  customObjectives: [],
  selectedPages: [],
  customPages: [],
  primaryColor: '#2563eb',
  secondaryColor: '#3b82f6',
  themeMode: 'dark',
  typography: 'Inter',
  visualStyle: 'Moderno e Clean',
  selectedFeatures: [],
  integrations: [],
  isPWA: false,
  hasAdvancedSEO: true,
  hasAnalytics: true,
  isPerformanceOptimized: true,
  hasAccessibility: true,
  responsiveMobile: true,
  responsiveTablet: true,
  responsiveDesktop: true,
  responsiveLargeScreen: false,
  targetAI: 'lovable',
  codeStyle: 'modern',
};
