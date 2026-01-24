// Types for the App Builder Visual Wizard

export type AppType = 
  | 'saas' 
  | 'ecommerce' 
  | 'delivery' 
  | 'agendamento' 
  | 'crm' 
  | 'social' 
  | 'fitness' 
  | 'educacao';

export type TargetAI = 'lovable' | 'cursor' | 'v0' | 'bolt' | 'windsurf' | 'chatgpt' | 'claude' | 'google-studio' | 'other';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface AppScreen {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface AppFeature {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'auth' | 'data' | 'ui' | 'integration' | 'advanced';
}

export interface AppBuilderFormData {
  // Step 1: App Type
  appType: AppType;
  
  // Step 2: Identity
  appName: string;
  companyName: string;
  slogan: string;
  targetAudience: string;
  
  // Step 3: Colors & Theme
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  themeMode: ThemeMode;
  
  // Step 4: Screens
  selectedScreens: string[];
  customScreens: string[];
  
  // Step 5: Features
  selectedFeatures: string[];
  
  // Step 6: Tech Extras
  isPWA: boolean;
  hasOfflineMode: boolean;
  hasAnalytics: boolean;
  hasPushNotifications: boolean;
  isPerformanceOptimized: boolean;
  hasDarkMode: boolean;
  
  // Step 7: Target AI
  targetAI: TargetAI;
  otherAI?: string;
}

export const APP_TYPES: { id: AppType; name: string; icon: string; description: string; suggestedScreens: string[]; suggestedFeatures: string[] }[] = [
  {
    id: 'saas',
    name: 'SaaS / Dashboard',
    icon: '📊',
    description: 'Painel administrativo com métricas e gráficos',
    suggestedScreens: ['dashboard', 'analytics', 'settings', 'profile', 'users'],
    suggestedFeatures: ['auth', 'crud', 'charts', 'export', 'notifications']
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: '🛒',
    description: 'Loja online com carrinho e checkout',
    suggestedScreens: ['home', 'products', 'cart', 'checkout', 'orders', 'profile'],
    suggestedFeatures: ['auth', 'payments', 'cart', 'search', 'reviews', 'wishlist']
  },
  {
    id: 'delivery',
    name: 'App Delivery',
    icon: '🛵',
    description: 'Sistema de pedidos e entregas',
    suggestedScreens: ['home', 'menu', 'cart', 'tracking', 'orders', 'profile'],
    suggestedFeatures: ['auth', 'payments', 'geolocation', 'realtime', 'push']
  },
  {
    id: 'agendamento',
    name: 'Agendamento',
    icon: '📅',
    description: 'Sistema de reservas e calendário',
    suggestedScreens: ['home', 'calendar', 'booking', 'appointments', 'profile'],
    suggestedFeatures: ['auth', 'calendar', 'notifications', 'reminders', 'payments']
  },
  {
    id: 'crm',
    name: 'CRM / Gestão',
    icon: '👥',
    description: 'Gerenciamento de clientes e leads',
    suggestedScreens: ['dashboard', 'contacts', 'pipeline', 'tasks', 'reports'],
    suggestedFeatures: ['auth', 'crud', 'search', 'filters', 'export', 'charts']
  },
  {
    id: 'social',
    name: 'Rede Social',
    icon: '💬',
    description: 'App social com feed e mensagens',
    suggestedScreens: ['feed', 'profile', 'messages', 'notifications', 'search'],
    suggestedFeatures: ['auth', 'realtime', 'upload', 'likes', 'comments', 'follow']
  },
  {
    id: 'fitness',
    name: 'Fitness / Saúde',
    icon: '💪',
    description: 'Treinos, progresso e rotinas',
    suggestedScreens: ['home', 'workouts', 'progress', 'timer', 'profile'],
    suggestedFeatures: ['auth', 'tracking', 'charts', 'reminders', 'gamification']
  },
  {
    id: 'educacao',
    name: 'Educação / Cursos',
    icon: '📚',
    description: 'Plataforma de aprendizado',
    suggestedScreens: ['home', 'courses', 'lessons', 'progress', 'certificates'],
    suggestedFeatures: ['auth', 'video', 'progress', 'quiz', 'certificates']
  }
];

export const APP_SCREENS: AppScreen[] = [
  { id: 'login', name: 'Login / Cadastro', icon: '🔐', description: 'Autenticação de usuários' },
  { id: 'home', name: 'Home / Início', icon: '🏠', description: 'Tela inicial do app' },
  { id: 'dashboard', name: 'Dashboard', icon: '📊', description: 'Painel com métricas' },
  { id: 'feed', name: 'Feed / Timeline', icon: '📰', description: 'Lista de posts/conteúdo' },
  { id: 'profile', name: 'Perfil', icon: '👤', description: 'Dados do usuário' },
  { id: 'settings', name: 'Configurações', icon: '⚙️', description: 'Preferências do app' },
  { id: 'products', name: 'Produtos / Lista', icon: '📦', description: 'Catálogo de itens' },
  { id: 'cart', name: 'Carrinho', icon: '🛒', description: 'Itens selecionados' },
  { id: 'checkout', name: 'Checkout', icon: '💳', description: 'Finalização de compra' },
  { id: 'orders', name: 'Pedidos', icon: '📋', description: 'Histórico de pedidos' },
  { id: 'calendar', name: 'Calendário', icon: '📅', description: 'Agenda e eventos' },
  { id: 'messages', name: 'Mensagens', icon: '💬', description: 'Chat e conversas' },
  { id: 'notifications', name: 'Notificações', icon: '🔔', description: 'Alertas e avisos' },
  { id: 'search', name: 'Busca', icon: '🔍', description: 'Pesquisa avançada' },
  { id: 'analytics', name: 'Relatórios', icon: '📈', description: 'Gráficos e análises' },
  { id: 'users', name: 'Usuários', icon: '👥', description: 'Gerenciar usuários' },
  { id: 'tracking', name: 'Rastreamento', icon: '📍', description: 'Localização em tempo real' },
  { id: 'menu', name: 'Cardápio / Menu', icon: '🍔', description: 'Lista de produtos/serviços' },
];

export const APP_FEATURES: AppFeature[] = [
  // Auth
  { id: 'auth', name: 'Login/Cadastro', icon: '🔐', description: 'Sistema de autenticação', category: 'auth' },
  { id: 'oauth', name: 'Login Social', icon: '🌐', description: 'Google, Apple, Facebook', category: 'auth' },
  { id: 'roles', name: 'Níveis de Acesso', icon: '👑', description: 'Admin, user, moderator', category: 'auth' },
  
  // Data
  { id: 'crud', name: 'CRUD Completo', icon: '📝', description: 'Criar, ler, atualizar, deletar', category: 'data' },
  { id: 'search', name: 'Busca Avançada', icon: '🔍', description: 'Filtros e pesquisa', category: 'data' },
  { id: 'realtime', name: 'Tempo Real', icon: '⚡', description: 'Atualizações instantâneas', category: 'data' },
  { id: 'export', name: 'Exportação', icon: '📤', description: 'Excel, PDF, CSV', category: 'data' },
  
  // UI
  { id: 'charts', name: 'Gráficos', icon: '📊', description: 'Visualização de dados', category: 'ui' },
  { id: 'upload', name: 'Upload de Arquivos', icon: '📁', description: 'Imagens e documentos', category: 'ui' },
  { id: 'darkmode', name: 'Modo Escuro', icon: '🌙', description: 'Tema dark/light', category: 'ui' },
  
  // Integration
  { id: 'payments', name: 'Pagamentos', icon: '💳', description: 'Stripe, PIX, boleto', category: 'integration' },
  { id: 'push', name: 'Push Notifications', icon: '🔔', description: 'Notificações mobile', category: 'integration' },
  { id: 'email', name: 'Envio de Email', icon: '📧', description: 'Transacionais e marketing', category: 'integration' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', description: 'Integração com WhatsApp', category: 'integration' },
  
  // Advanced
  { id: 'geolocation', name: 'Geolocalização', icon: '📍', description: 'Mapas e localização', category: 'advanced' },
  { id: 'ai', name: 'Inteligência Artificial', icon: '🤖', description: 'Chatbot, recomendações', category: 'advanced' },
  { id: 'analytics', name: 'Analytics', icon: '📈', description: 'Métricas de uso', category: 'advanced' },
];

export const COLOR_PRESETS = [
  { name: 'Azul Tech', primary: '#3b82f6', secondary: '#60a5fa', accent: '#0ea5e9' },
  { name: 'Verde Sucesso', primary: '#22c55e', secondary: '#4ade80', accent: '#10b981' },
  { name: 'Roxo Premium', primary: '#8b5cf6', secondary: '#a78bfa', accent: '#7c3aed' },
  { name: 'Rosa Moderno', primary: '#ec4899', secondary: '#f472b6', accent: '#db2777' },
  { name: 'Laranja Energia', primary: '#f97316', secondary: '#fb923c', accent: '#ea580c' },
  { name: 'Ciano Fresh', primary: '#06b6d4', secondary: '#22d3ee', accent: '#0891b2' },
  { name: 'Vermelho Bold', primary: '#ef4444', secondary: '#f87171', accent: '#dc2626' },
  { name: 'Dourado Luxo', primary: '#f59e0b', secondary: '#fbbf24', accent: '#d97706' },
  { name: 'Indigo Elegante', primary: '#6366f1', secondary: '#818cf8', accent: '#4f46e5' },
  { name: 'Esmeralda', primary: '#10b981', secondary: '#34d399', accent: '#059669' },
];

export const AI_TARGETS: { id: TargetAI; name: string; description: string; icon: string }[] = [
  { id: 'lovable', name: 'Lovable', description: 'Deploy automático + Supabase integrado', icon: '💜' },
  { id: 'cursor', name: 'Cursor', description: 'IDE com IA para desenvolvedores', icon: '⚡' },
  { id: 'v0', name: 'v0 (Vercel)', description: 'Gerador de UI da Vercel', icon: '▲' },
  { id: 'bolt', name: 'Bolt.new', description: 'Ambiente full-stack instantâneo', icon: '⚡' },
  { id: 'windsurf', name: 'Windsurf', description: 'IDE IA da Codeium', icon: '🏄' },
  { id: 'chatgpt', name: 'ChatGPT', description: 'OpenAI GPT-4', icon: '🤖' },
  { id: 'claude', name: 'Claude', description: 'Anthropic Claude', icon: '🧠' },
  { id: 'google-studio', name: 'Google AI Studio', description: 'Gemini da Google', icon: '🔷' },
  { id: 'other', name: 'Outra IA', description: 'Especificar manualmente', icon: '✨' },
];

export const initialAppBuilderFormData: AppBuilderFormData = {
  appType: 'saas',
  appName: '',
  companyName: '',
  slogan: '',
  targetAudience: '',
  primaryColor: '#3b82f6',
  secondaryColor: '#60a5fa',
  accentColor: '#0ea5e9',
  themeMode: 'dark',
  selectedScreens: ['login', 'home', 'dashboard', 'profile', 'settings'],
  customScreens: [],
  selectedFeatures: ['auth', 'crud', 'search'],
  isPWA: true,
  hasOfflineMode: false,
  hasAnalytics: true,
  hasPushNotifications: false,
  isPerformanceOptimized: true,
  hasDarkMode: true,
  targetAI: 'lovable',
};
