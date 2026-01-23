// Types for the From Scratch Wizard

export type ProjectType = 'app' | 'site';

export type TargetAI = 'lovable' | 'cursor' | 'v0' | 'bolt' | 'chatgpt' | 'google-studio' | 'other';

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
  isMobileFirst: boolean;
  hasAccessibility: boolean;
  
  // Step 10: Target AI
  targetAI: TargetAI;
  otherAI?: string;
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
];

export const CURRENCIES = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export const TIMEZONES = [
  { code: 'America/Sao_Paulo', name: 'Brasília (GMT-3)' },
  { code: 'America/New_York', name: 'New York (GMT-5)' },
  { code: 'America/Los_Angeles', name: 'Los Angeles (GMT-8)' },
  { code: 'Europe/London', name: 'London (GMT+0)' },
  { code: 'Europe/Paris', name: 'Paris (GMT+1)' },
  { code: 'Asia/Tokyo', name: 'Tokyo (GMT+9)' },
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

export const COMMON_FEATURES = [
  'Botão WhatsApp flutuante',
  'Formulário de contato',
  'Mapa de localização',
  'Galeria de fotos',
  'Depoimentos de clientes',
  'FAQ / Perguntas frequentes',
  'Newsletter',
  'Chat online',
  'Área de login',
  'Carrinho de compras',
  'Sistema de busca',
  'Filtros avançados',
  'Avaliações e reviews',
  'Compartilhamento social',
  'Modo escuro/claro',
  'Multi-idioma',
];

export const INTEGRATIONS = [
  { id: 'whatsapp', name: 'WhatsApp Business', icon: '💬' },
  { id: 'google-maps', name: 'Google Maps', icon: '🗺️' },
  { id: 'google-analytics', name: 'Google Analytics', icon: '📊' },
  { id: 'facebook-pixel', name: 'Facebook Pixel', icon: '📱' },
  { id: 'stripe', name: 'Stripe Pagamentos', icon: '💳' },
  { id: 'mercadopago', name: 'Mercado Pago', icon: '💰' },
  { id: 'instagram', name: 'Instagram Feed', icon: '📸' },
  { id: 'youtube', name: 'YouTube Embed', icon: '▶️' },
  { id: 'calendly', name: 'Calendly Agendamento', icon: '📅' },
  { id: 'mailchimp', name: 'Mailchimp Newsletter', icon: '📧' },
  { id: 'hotjar', name: 'Hotjar Heatmaps', icon: '🔥' },
  { id: 'recaptcha', name: 'reCAPTCHA', icon: '🔒' },
];

export const AI_TARGETS = [
  { id: 'lovable' as TargetAI, name: 'Lovable', description: 'IA para criar apps React completos', icon: '💜' },
  { id: 'cursor' as TargetAI, name: 'Cursor', description: 'IDE com IA integrada', icon: '🖥️' },
  { id: 'v0' as TargetAI, name: 'v0 (Vercel)', description: 'Gerador de UI da Vercel', icon: '▲' },
  { id: 'bolt' as TargetAI, name: 'Bolt.new', description: 'Ambiente IA full-stack', icon: '⚡' },
  { id: 'chatgpt' as TargetAI, name: 'ChatGPT', description: 'OpenAI GPT-4', icon: '🤖' },
  { id: 'google-studio' as TargetAI, name: 'Google AI Studio', description: 'Gemini da Google', icon: '🔷' },
  { id: 'other' as TargetAI, name: 'Outra IA', description: 'Especificar manualmente', icon: '✨' },
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
  isMobileFirst: true,
  hasAccessibility: true,
  targetAI: 'lovable',
};
