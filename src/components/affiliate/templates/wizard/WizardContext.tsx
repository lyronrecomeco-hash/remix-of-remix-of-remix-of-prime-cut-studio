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

    const prompt = `
# 🎯 BRIEFING DE PROJETO - ${businessName.toUpperCase()}

## 📋 INFORMAÇÕES BÁSICAS
- **Nome do Negócio:** ${businessName}
- **Tipo de Projeto:** ${projectType}
- **Idioma Principal:** ${languageMap[language] || language}

## 🎨 IDENTIDADE VISUAL
- **Estilo Visual:** ${visualStyle}
- **Cor Primária:** ${primaryColor}
- **Cor Secundária:** ${secondaryColor}
- **Cor de Destaque:** ${accentColor}

## ✍️ TIPOGRAFIA & LAYOUT
- **Fonte de Títulos:** ${headingFont}
- **Fonte de Texto:** ${bodyFont}
- **Estilo de Layout:** ${layoutStyle}

## ⚡ FUNCIONALIDADES REQUERIDAS
${features.map(f => `- ${f}`).join('\n')}

## 👥 PÚBLICO-ALVO
${targetAudience}

## 📝 DESCRIÇÃO DO NEGÓCIO
${businessDescription}

${uniqueSellingPoints.length > 0 ? `## 💎 DIFERENCIAIS
${uniqueSellingPoints.map(usp => `- ${usp}`).join('\n')}` : ''}

${inspirationUrls.length > 0 ? `## 🔗 REFERÊNCIAS DE INSPIRAÇÃO
${inspirationUrls.map(url => `- ${url}`).join('\n')}` : ''}

---

## 🚀 INSTRUÇÕES PARA GERAÇÃO

Crie um site/landing page profissional seguindo TODAS as especificações acima.

**Requisitos Técnicos:**
- Design responsivo (mobile-first)
- Código limpo e semântico
- Otimizado para SEO
- Performance otimizada
- Acessibilidade (WCAG 2.1)

**Seções Obrigatórias:**
1. Hero Section impactante
2. Sobre/Quem Somos
3. Serviços/Produtos
4. Depoimentos/Social Proof
5. CTA (Call-to-Action) claro
6. Footer com informações de contato

**Estilo de Código:**
- React + TypeScript
- Tailwind CSS
- Componentes reutilizáveis
- Framer Motion para animações
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
