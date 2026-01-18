import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { 
  ProjectBuilderContextType, 
  ProjectFormData, 
  Template, 
  initialFormData,
  TargetAI 
} from './types';

const ProjectBuilderContext = createContext<ProjectBuilderContextType | null>(null);

export const useProjectBuilder = () => {
  const context = useContext(ProjectBuilderContext);
  if (!context) {
    throw new Error('useProjectBuilder must be used within ProjectBuilderProvider');
  }
  return context;
};

interface ProjectBuilderProviderProps {
  children: React.ReactNode;
  onComplete?: (prompt: string) => void;
}

export const ProjectBuilderProvider: React.FC<ProjectBuilderProviderProps> = ({
  children,
  onComplete,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  
  const totalSteps = 7;

  const updateFormData = useCallback(<K extends keyof ProjectFormData>(
    key: K,
    value: ProjectFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return formData.targetAI !== 'other' || (formData.otherAI?.trim() || '').length > 0;
      case 2:
        return (
          formData.projectName.trim().length > 0 &&
          formData.companyName.trim().length > 0
        );
      case 3:
        return formData.selectedObjectives.length > 0;
      case 4:
        return formData.selectedPages.length > 0;
      case 5:
        return formData.primaryColor.length > 0;
      case 6:
        return formData.selectedFeatures.length > 0;
      case 7:
        return true;
      default:
        return false;
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

  const resetBuilder = useCallback(() => {
    setSelectedTemplate(null);
    setFormData(initialFormData);
    setCurrentStep(1);
  }, []);

  const getAIName = (ai: TargetAI): string => {
    const names: Record<TargetAI, string> = {
      'lovable': 'Lovable',
      'google-studio': 'Google Studio IA',
      'base64': 'Base64',
      'chatgpt': 'ChatGPT',
      'other': formData.otherAI || 'IA',
    };
    return names[ai];
  };

  const generatePrompt = useCallback((): string => {
    if (!selectedTemplate) return '';

    const aiName = getAIName(formData.targetAI);
    const allPages = [...formData.selectedPages, ...formData.customPages].join(', ');
    
    const prompt = `
# 🎯 PROJETO: ${formData.projectName.toUpperCase()}

## CONTEXTO GERAL
Você é um desenvolvedor sênior full-stack especializado em criar aplicações web modernas e profissionais. Sua tarefa é gerar um projeto completo, funcional e pronto para produção.

---

## 📋 BRIEFING DO PROJETO

### Informações Básicas
- **Nome do Projeto:** ${formData.projectName}
- **Nome da Empresa:** ${formData.companyName}
- **Nicho/Segmento:** ${selectedTemplate.name}
- **Cidade/Região:** ${formData.cityRegion || 'Não especificada'}
- **Público-Alvo:** ${formData.targetAudience || 'Geral'}
- **Idioma Principal:** ${formData.language}

### IA de Destino
Este prompt foi otimizado para: **${aiName}**

---

## 🎯 OBJETIVOS DO PROJETO

O site/aplicação deve atingir os seguintes objetivos:
${formData.selectedObjectives.map(obj => `- ${obj}`).join('\n')}
${formData.customObjective ? `- ${formData.customObjective}` : ''}

---

## 📄 ESTRUTURA DE PÁGINAS

O projeto deve conter as seguintes páginas/seções:
${allPages}

### Requisitos de Navegação:
- Menu principal fixo/sticky no topo
- Navegação suave entre seções (scroll smooth)
- Menu responsivo (hamburger em mobile)
- Breadcrumbs quando aplicável
- Footer com links importantes

---

## 🎨 DESIGN SYSTEM

### Paleta de Cores
- **Cor Primária:** ${formData.primaryColor}
- **Cor Secundária:** ${formData.secondaryColor}
- **Tema Base:** ${formData.theme === 'dark' ? 'Escuro (Dark Mode)' : 'Claro (Light Mode)'}

### Tipografia
- **Família Principal:** ${formData.typography}
- **Hierarquia:** Títulos bem definidos (H1-H6)
- **Legibilidade:** Contraste adequado e tamanhos acessíveis

### Estilo Visual
- **Abordagem:** ${formData.visualStyle}
- Espaçamentos consistentes
- Bordas arredondadas modernas
- Sombras sutis para profundidade
- Animações suaves e não intrusivas
- Micro-interações nos elementos clicáveis

---

## ⚡ FUNCIONALIDADES OBRIGATÓRIAS

${formData.selectedFeatures.map(feat => `### ${feat}
- Implementação completa e funcional
- Design consistente com o resto do site
- Responsivo em todos os dispositivos`).join('\n\n')}

---

## 📱 RESPONSIVIDADE

### Breakpoints Obrigatórios:
- Mobile: 320px - 480px
- Tablet: 481px - 768px  
- Desktop: 769px - 1024px
- Large Desktop: 1025px+

### Regras:
- ${formData.mobileFirst ? 'Mobile-first approach' : 'Desktop-first approach'}
- Touch-friendly em dispositivos móveis
- Imagens otimizadas por viewport
- Navegação adaptativa

---

## 🔧 REQUISITOS TÉCNICOS

### Stack Recomendada:
- **Frontend:** React + TypeScript + Vite
- **Estilização:** Tailwind CSS
- **UI Components:** Shadcn/UI
- **Animações:** Framer Motion
- **Ícones:** Lucide React
- **Formulários:** React Hook Form + Zod

### Qualidade de Código:
${formData.productionReady ? '✅ Código pronto para produção' : '⚠️ Código para prototipagem'}
${formData.seoOptimized ? '✅ SEO otimizado (meta tags, schema, sitemap)' : '⚠️ SEO básico'}
${formData.performanceOptimized ? '✅ Performance otimizada (lazy loading, code splitting)' : '⚠️ Performance padrão'}
${formData.mobileFirst ? '✅ Mobile-first design' : '⚠️ Desktop-first design'}

### Boas Práticas:
- Código limpo e bem comentado
- Componentes reutilizáveis
- Tipagem TypeScript estrita
- Acessibilidade (WCAG 2.1)
- Semantic HTML

---

## 🚀 INSTRUÇÕES DE IMPLEMENTAÇÃO

1. **Estrutura de Pastas:**
   - Organize componentes por feature/página
   - Separe hooks, utils e types
   - Crie pasta de assets para imagens

2. **Componentes:**
   - Crie componentes pequenos e focados
   - Use composition pattern
   - Implemente loading states
   - Adicione error boundaries

3. **Estilização:**
   - Use classes do Tailwind
   - Crie variantes com CVA
   - Mantenha consistência visual
   - Implemente dark/light mode se aplicável

4. **Performance:**
   - Lazy load de imagens
   - Code splitting por rota
   - Minimize re-renders
   - Otimize bundle size

---

## ✅ CHECKLIST FINAL

Antes de considerar o projeto completo, verifique:

- [ ] Todas as páginas implementadas e funcionais
- [ ] Design responsivo em todos os dispositivos
- [ ] Formulários com validação
- [ ] Botão WhatsApp/CTA funcionando
- [ ] SEO básico implementado
- [ ] Performance adequada (Lighthouse > 90)
- [ ] Sem erros no console
- [ ] Navegação suave e intuitiva
- [ ] Acessibilidade básica
- [ ] Código limpo e organizado

---

## 💡 OBSERVAÇÕES ADICIONAIS

- Priorize UX sobre features complexas
- Use placeholders realistas para textos/imagens
- Implemente feedback visual em ações do usuário
- Teste em múltiplos navegadores
- Documente componentes complexos

---

**Gere o projeto completo seguindo todas as especificações acima. Comece pela estrutura base e avance implementando cada funcionalidade de forma incremental.**
`.trim();

    return prompt;
  }, [selectedTemplate, formData]);

  const generatedPrompt = useMemo(() => {
    if (currentStep === totalSteps) {
      return generatePrompt();
    }
    return '';
  }, [currentStep, totalSteps, generatePrompt]);

  const value: ProjectBuilderContextType = {
    selectedTemplate,
    setSelectedTemplate,
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
    resetBuilder,
  };

  return (
    <ProjectBuilderContext.Provider value={value}>
      {children}
    </ProjectBuilderContext.Provider>
  );
};
