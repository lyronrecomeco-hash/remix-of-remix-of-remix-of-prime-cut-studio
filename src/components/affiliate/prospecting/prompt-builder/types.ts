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
  defaultPages: string[];
  suggestedFeatures: string[];
  suggestedColors: {
    primary: string;
    secondary: string;
  };
}

export interface PromptBuilderState {
  appName: string;
  targetAudience: string;
  mainTask: string;
  mainBenefit: string;
  dailyUsers: string;
  pages: string[];
  additionalFeatures: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  typography: string;
  language: string;
  platform: string;
  suggestedFeatures: string[];
  selectedSuggestedFeatures: string[];
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
  { id: 'roboto', name: 'Roboto', category: 'Sans-serif', preview: 'Aa Bb Cc 123' },
  { id: 'poppins', name: 'Poppins', category: 'Sans-serif', preview: 'Aa Bb Cc 123' },
  { id: 'lato', name: 'Lato', category: 'Sans-serif', preview: 'Aa Bb Cc 123' },
  { id: 'montserrat', name: 'Montserrat', category: 'Sans-serif', preview: 'Aa Bb Cc 123' },
  { id: 'inter', name: 'Inter', category: 'Sans-serif', preview: 'Aa Bb Cc 123' },
  { id: 'opensans', name: 'Open Sans', category: 'Sans-serif', preview: 'Aa Bb Cc 123' },
  { id: 'playfair', name: 'Playfair Display', category: 'Serif', preview: 'Aa Bb Cc 123' },
  { id: 'merriweather', name: 'Merriweather', category: 'Serif', preview: 'Aa Bb Cc 123' },
  { id: 'spacegrotesk', name: 'Space Grotesk', category: 'Display', preview: 'Aa Bb Cc 123' },
  { id: 'dmans', name: 'DM Sans', category: 'Sans-serif', preview: 'Aa Bb Cc 123' },
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
