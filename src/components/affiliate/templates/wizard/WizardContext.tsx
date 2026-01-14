import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Types
export interface WizardFormData {
  // Step 1 - Basic Info
  projectType: string;
  language: string;
  businessName: string;
  
  // Step 2 - Visual Style
  visualStyle: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Step 3 - Typography & Layout
  headingFont: string;
  bodyFont: string;
  layoutStyle: string;
  
  // Step 4 - Features
  features: string[];
  
  // Step 5 - Details
  targetAudience: string;
  businessDescription: string;
  inspirationUrls: string[];
  uniqueSellingPoints: string[];
}

export interface WizardStep {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface WizardContextType {
  // Current step
  currentStep: number;
  setCurrentStep: (step: number) => void;
  
  // Form data
  formData: WizardFormData;
  updateFormData: (data: Partial<WizardFormData>) => void;
  
  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  
  // Validation
  isStepValid: (step: number) => boolean;
  canProceed: boolean;
  
  // Steps info
  steps: WizardStep[];
  totalSteps: number;
  
  // Generated prompt
  generatedPrompt: string;
  generatePrompt: () => string;
  
  // Reset
  resetWizard: () => void;
}

const initialFormData: WizardFormData = {
  // Step 1
  projectType: '',
  language: 'pt-BR',
  businessName: '',
  
  // Step 2
  visualStyle: '',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  accentColor: '#f59e0b',
  
  // Step 3
  headingFont: '',
  bodyFont: '',
  layoutStyle: '',
  
  // Step 4
  features: [],
  
  // Step 5
  targetAudience: '',
  businessDescription: '',
  inspirationUrls: [],
  uniqueSellingPoints: [],
};

const stepsConfig: Omit<WizardStep, 'isCompleted' | 'isActive'>[] = [
  { id: 1, title: 'Básico', subtitle: 'Tipo e idioma', icon: 'Settings' },
  { id: 2, title: 'Visual', subtitle: 'Estilo e cores', icon: 'Palette' },
  { id: 3, title: 'Tipografia', subtitle: 'Fontes e layout', icon: 'Type' },
  { id: 4, title: 'Recursos', subtitle: 'Funcionalidades', icon: 'Puzzle' },
  { id: 5, title: 'Detalhes', subtitle: 'Público e descrição', icon: 'FileText' },
];

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};

interface WizardProviderProps {
  children: ReactNode;
}

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(initialFormData);

  const totalSteps = stepsConfig.length;

  const updateFormData = useCallback((data: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const isStepValid = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.projectType && formData.businessName.trim());
      case 2:
        return !!(formData.visualStyle && formData.primaryColor);
      case 3:
        return !!(formData.headingFont && formData.bodyFont && formData.layoutStyle);
      case 4:
        return formData.features.length >= 2;
      case 5:
        return !!(formData.targetAudience.trim() && formData.businessDescription.trim());
      default:
        return false;
    }
  }, [formData]);

  const canProceed = isStepValid(currentStep);

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
      // Allow going back freely, but forward only if previous steps are valid
      if (step < currentStep) {
        setCurrentStep(step);
      } else {
        // Check if all previous steps are valid
        let canGo = true;
        for (let i = 1; i < step; i++) {
          if (!isStepValid(i)) {
            canGo = false;
            break;
          }
        }
        if (canGo) {
          setCurrentStep(step);
        }
      }
    }
  }, [currentStep, totalSteps, isStepValid]);

  const steps: WizardStep[] = stepsConfig.map(step => ({
    ...step,
    isCompleted: step.id < currentStep || (step.id === currentStep && isStepValid(step.id)),
    isActive: step.id === currentStep,
  }));

  const generatePrompt = useCallback((): string => {
    const {
      projectType,
      language,
      businessName,
      visualStyle,
      primaryColor,
      secondaryColor,
      accentColor,
      headingFont,
      bodyFont,
      layoutStyle,
      features,
      targetAudience,
      businessDescription,
      inspirationUrls,
      uniqueSellingPoints,
    } = formData;

    const languageMap: Record<string, string> = {
      'pt-BR': 'Português Brasileiro',
      'en-US': 'Inglês Americano',
      'es-ES': 'Espanhol',
      'fr-FR': 'Francês',
      'de-DE': 'Alemão',
      'it-IT': 'Italiano',
    };

    const projectTypeMap: Record<string, string> = {
      'barbearia': 'Site para Barbearia',
      'restaurante': 'Site para Restaurante',
      'ecommerce': 'E-commerce / Loja Virtual',
      'portfolio': 'Portfólio Profissional',
      'servicos': 'Site de Serviços',
      'saude': 'Site de Saúde/Clínica',
      'educacao': 'Plataforma Educacional',
      'imobiliaria': 'Site Imobiliário',
    };

    const visualStyleMap: Record<string, string> = {
      'moderno': 'Moderno e Minimalista',
      'elegante': 'Elegante e Sofisticado',
      'vibrante': 'Vibrante e Colorido',
      'corporativo': 'Corporativo e Profissional',
      'criativo': 'Criativo e Artístico',
      'rustico': 'Rústico e Aconchegante',
    };

    const layoutStyleMap: Record<string, string> = {
      'single-page': 'Single Page (One Page)',
      'multi-section': 'Multi-seções com navegação',
      'card-based': 'Baseado em Cards',
      'magazine': 'Estilo Magazine/Editorial',
    };

    const prompt = `
# 🎯 BRIEFING DE PROJETO - ${businessName.toUpperCase()}

## 📋 INFORMAÇÕES BÁSICAS
- **Nome do Negócio:** ${businessName}
- **Tipo de Projeto:** ${projectTypeMap[projectType] || projectType}
- **Idioma Principal:** ${languageMap[language] || language}

## 🎨 IDENTIDADE VISUAL
- **Estilo Visual:** ${visualStyleMap[visualStyle] || visualStyle}
- **Paleta de Cores:**
  - Cor Primária: ${primaryColor}
  - Cor Secundária: ${secondaryColor}
  - Cor de Destaque: ${accentColor}

## ✍️ TIPOGRAFIA & LAYOUT
- **Fonte de Títulos:** ${headingFont}
- **Fonte de Texto:** ${bodyFont}
- **Estilo de Layout:** ${layoutStyleMap[layoutStyle] || layoutStyle}

## ⚡ FUNCIONALIDADES REQUERIDAS
${features.length > 0 ? features.map(f => `- ${f}`).join('\n') : '- Nenhuma funcionalidade selecionada'}

## 👥 PÚBLICO-ALVO
${targetAudience || 'Não especificado'}

## 📝 DESCRIÇÃO DO NEGÓCIO
${businessDescription || 'Não especificado'}

${uniqueSellingPoints.length > 0 ? `## 💎 DIFERENCIAIS COMPETITIVOS
${uniqueSellingPoints.map(usp => `- ${usp}`).join('\n')}` : ''}

${inspirationUrls.length > 0 ? `## 🔗 REFERÊNCIAS DE INSPIRAÇÃO
${inspirationUrls.map(url => `- ${url}`).join('\n')}` : ''}

---

## 🚀 INSTRUÇÕES PARA GERAÇÃO

Crie um site/landing page profissional seguindo TODAS as especificações acima.

### Requisitos Técnicos:
- Design responsivo (mobile-first)
- Código limpo e semântico (HTML5)
- Otimizado para SEO (meta tags, headings, alt texts)
- Performance otimizada (lazy loading, otimização de imagens)
- Acessibilidade (WCAG 2.1 AA)
- Animações suaves com Framer Motion

### Seções Obrigatórias:
1. **Hero Section** - Impactante com CTA principal
2. **Sobre/Quem Somos** - História e valores
3. **Serviços/Produtos** - Cards ou grid visual
4. **Depoimentos** - Social proof com avatares
5. **Galeria/Portfólio** - Showcase visual (se aplicável)
6. **Contato/CTA Final** - Formulário ou links diretos
7. **Footer** - Informações, links e redes sociais

### Stack Técnica:
- React 18+ com TypeScript
- Tailwind CSS para estilização
- Shadcn/UI para componentes base
- Framer Motion para animações
- Lucide React para ícones

### Boas Práticas:
- Componentes reutilizáveis e bem organizados
- Hooks customizados quando necessário
- Responsividade em todos os breakpoints
- Dark mode support (opcional)
- Loading states e error handling
`.trim();

    return prompt;
  }, [formData]);

  const generatedPrompt = generatePrompt();

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setFormData(initialFormData);
  }, []);

  const value: WizardContextType = {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    isStepValid,
    canProceed,
    steps,
    totalSteps,
    generatedPrompt,
    generatePrompt,
    resetWizard,
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
};
