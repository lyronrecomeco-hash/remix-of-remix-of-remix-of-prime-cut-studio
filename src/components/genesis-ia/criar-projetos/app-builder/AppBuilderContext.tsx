import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { 
  AppBuilderFormData, 
  initialAppBuilderFormData, 
  APP_TYPES,
  APP_SCREENS,
  APP_FEATURES,
  TargetAI 
} from './types';

interface AppBuilderContextType {
  formData: AppBuilderFormData;
  updateFormData: <K extends keyof AppBuilderFormData>(key: K, value: AppBuilderFormData[K]) => void;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  canProceed: boolean;
  generatedPrompt: string;
  generatePrompt: () => string;
  resetWizard: () => void;
  getCurrentAppType: () => typeof APP_TYPES[0] | undefined;
}

const AppBuilderContext = createContext<AppBuilderContextType | null>(null);

export function useAppBuilder() {
  const context = useContext(AppBuilderContext);
  if (!context) {
    throw new Error('useAppBuilder must be used within AppBuilderProvider');
  }
  return context;
}

interface AppBuilderProviderProps {
  children: React.ReactNode;
}

export function AppBuilderProvider({ children }: AppBuilderProviderProps) {
  const [formData, setFormData] = useState<AppBuilderFormData>(initialAppBuilderFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  const updateFormData = useCallback(<K extends keyof AppBuilderFormData>(
    key: K, 
    value: AppBuilderFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const getCurrentAppType = useCallback(() => {
    return APP_TYPES.find(t => t.id === formData.appType);
  }, [formData.appType]);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1: return !!formData.appType;
      case 2: return formData.appName.trim().length >= 2;
      case 3: return !!formData.primaryColor;
      case 4: return formData.selectedScreens.length >= 2;
      case 5: return formData.selectedFeatures.length >= 1;
      case 6: return true;
      case 7: return !!formData.targetAI && (formData.targetAI !== 'other' || !!formData.otherAI?.trim());
      case 8: return true;
      default: return false;
    }
  }, [currentStep, formData]);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps && canProceed) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, canProceed]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const resetWizard = useCallback(() => {
    setFormData(initialAppBuilderFormData);
    setCurrentStep(1);
  }, []);

  const getAIName = (ai: TargetAI): string => {
    const names: Record<TargetAI, string> = {
      'lovable': 'Lovable',
      'cursor': 'Cursor',
      'v0': 'v0 (Vercel)',
      'bolt': 'Bolt.new',
      'windsurf': 'Windsurf',
      'chatgpt': 'ChatGPT',
      'claude': 'Claude',
      'google-studio': 'Google AI Studio',
      'other': formData.otherAI || 'IA Personalizada'
    };
    return names[ai];
  };

  const generatePrompt = useCallback((): string => {
    const appType = getCurrentAppType();
    const selectedScreenNames = formData.selectedScreens
      .map(id => APP_SCREENS.find(s => s.id === id)?.name)
      .filter(Boolean);
    const selectedFeatureNames = formData.selectedFeatures
      .map(id => APP_FEATURES.find(f => f.id === id)?.name)
      .filter(Boolean);

    const techExtras: string[] = [];
    if (formData.isPWA) techExtras.push('Progressive Web App (PWA)');
    if (formData.hasOfflineMode) techExtras.push('Modo Offline');
    if (formData.hasAnalytics) techExtras.push('Analytics integrado');
    if (formData.hasPushNotifications) techExtras.push('Push Notifications');
    if (formData.isPerformanceOptimized) techExtras.push('Otimização de Performance');
    if (formData.hasDarkMode) techExtras.push('Suporte a Dark Mode');

    const isLovable = formData.targetAI === 'lovable';

    let prompt = `# 📱 ${formData.appName || 'Meu App'}

## Visão Geral
Crie um **aplicativo web moderno** do tipo **${appType?.name || formData.appType}** para ${formData.targetAudience || 'usuários em geral'}.

${formData.companyName ? `**Empresa:** ${formData.companyName}` : ''}
${formData.slogan ? `**Slogan:** "${formData.slogan}"` : ''}

---

## 🎨 Design System

### Cores
- **Cor Primária:** ${formData.primaryColor}
- **Cor Secundária:** ${formData.secondaryColor}
- **Cor de Destaque:** ${formData.accentColor}
- **Tema:** ${formData.themeMode === 'dark' ? 'Dark Mode' : formData.themeMode === 'light' ? 'Light Mode' : 'Auto (seguir sistema)'}

### Diretrizes Visuais
- Design moderno e minimalista
- Componentes com bordas arredondadas (radius: 12px para cards, 8px para botões)
- Sombras suaves para elevação
- Micro-animações em interações (hover, click, transições)
- Tipografia: Inter ou SF Pro (system fonts)
- Espaçamento consistente (múltiplos de 4px)

---

## 📱 Telas do Aplicativo

${selectedScreenNames.map((screen, i) => `${i + 1}. **${screen}**`).join('\n')}
${formData.customScreens.length > 0 ? `\n### Telas Personalizadas:\n${formData.customScreens.map(s => `- ${s}`).join('\n')}` : ''}

### Navegação
- Bottom Navigation com 4-5 itens principais
- Header fixo com título e ações contextuais
- Transições suaves entre telas (slide, fade)

---

## ⚡ Funcionalidades

${selectedFeatureNames.map((feature, i) => `${i + 1}. **${feature}**`).join('\n')}

---

## 🔧 Requisitos Técnicos

### Stack
${isLovable ? `- **Frontend:** React 18 + TypeScript + Vite
- **Estilização:** Tailwind CSS + shadcn/ui
- **Animações:** Framer Motion
- **Backend:** Supabase (Cloud integrado)
- **Autenticação:** Supabase Auth
- **Banco de Dados:** PostgreSQL (Supabase)
- **Deploy:** Lovable Cloud (automático)` : `- **Frontend:** React 18 + TypeScript
- **Estilização:** Tailwind CSS + shadcn/ui
- **Animações:** Framer Motion
- **Backend:** Supabase ou similar
- **Banco de Dados:** PostgreSQL`}

### Extras Técnicos
${techExtras.map(t => `- ${t}`).join('\n')}

---

## 🗃️ Estrutura de Dados (Supabase)

\`\`\`sql
-- Tabela de perfis de usuário
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuários podem ver próprio perfil" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
\`\`\`

${formData.selectedFeatures.includes('roles') ? `
### Controle de Acesso (Roles)
\`\`\`sql
CREATE TYPE app_role AS ENUM ('admin', 'user', 'moderator');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
\`\`\`
` : ''}

---

## 📋 Regras de Qualidade

1. ✅ **Código limpo e tipado** - TypeScript strict, sem any
2. ✅ **Componentes reutilizáveis** - Design system consistente
3. ✅ **Mobile-first** - 100% responsivo
4. ✅ **Performance** - Lazy loading, code splitting
5. ✅ **Acessibilidade** - ARIA labels, contraste adequado
6. ✅ **SEO otimizado** - Meta tags, Open Graph
7. ✅ **Segurança** - RLS em todas as tabelas, validação de inputs

---

## 🚀 Pronto para ${getAIName(formData.targetAI)}

Este prompt está otimizado para gerar um aplicativo completo e funcional.
${isLovable ? 'Com Lovable, você terá deploy automático e backend integrado!' : ''}
`;

    return prompt;
  }, [formData, getCurrentAppType]);

  const generatedPrompt = useMemo(() => {
    if (currentStep === 8) {
      return generatePrompt();
    }
    return '';
  }, [currentStep, generatePrompt]);

  const value: AppBuilderContextType = {
    formData,
    updateFormData,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    canProceed,
    generatedPrompt,
    generatePrompt,
    resetWizard,
    getCurrentAppType
  };

  return (
    <AppBuilderContext.Provider value={value}>
      {children}
    </AppBuilderContext.Provider>
  );
}
