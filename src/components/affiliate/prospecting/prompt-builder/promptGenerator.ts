import { PromptBuilderState, NicheTemplate, AI_PLATFORMS, LANGUAGE_OPTIONS } from './types';

export const generateFinalPrompt = (state: PromptBuilderState, template: NicheTemplate): string => {
  const platform = AI_PLATFORMS.find(p => p.id === state.platform);
  const language = LANGUAGE_OPTIONS.find(l => l.id === state.language);
  
  // Base structure for all platforms
  const baseInfo = {
    appName: state.appName,
    niche: template.niche,
    targetAudience: state.targetAudience,
    mainTask: state.mainTask,
    mainBenefit: state.mainBenefit,
    dailyUsers: state.dailyUsers,
    pages: state.pages,
    features: state.selectedSuggestedFeatures,
    additionalFeatures: state.additionalFeatures,
    colors: state.colors,
    typography: state.typography,
    language: language?.name || state.language,
  };

  // Generate platform-specific prompt
  switch (platform?.promptStyle) {
    case 'detailed':
      return generateDetailedPrompt(baseInfo);
    case 'conversational':
      return generateConversationalPrompt(baseInfo);
    case 'structured':
      return generateStructuredPrompt(baseInfo);
    case 'minimal':
      return generateMinimalPrompt(baseInfo);
    default:
      return generateDetailedPrompt(baseInfo);
  }
};

interface BaseInfo {
  appName: string;
  niche: string;
  targetAudience: string;
  mainTask: string;
  mainBenefit: string;
  dailyUsers: string;
  pages: string[];
  features: string[];
  additionalFeatures: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  typography: string;
  language: string;
}

function generateDetailedPrompt(info: BaseInfo): string {
  return `# 🚀 Projeto: ${info.appName}

## 📋 Visão Geral
Crie um aplicativo/site moderno e profissional chamado "${info.appName}" para o nicho de ${info.niche}.

## 🎯 Objetivo Principal
${info.mainTask}

## 👥 Público-Alvo
**Para quem é:** ${info.targetAudience}
**Usuários diários:** ${info.dailyUsers}

## 💡 Proposta de Valor
${info.mainBenefit}

## 📱 Estrutura de Páginas e Menus
${info.pages.map((page, i) => `${i + 1}. ${page}`).join('\n')}

## ⚡ Funcionalidades Principais
${info.features.length > 0 ? info.features.map(f => `- ${f}`).join('\n') : '- Funcionalidades básicas do nicho'}

${info.additionalFeatures ? `## 🔧 Recursos Adicionais\n${info.additionalFeatures}` : ''}

## 🎨 Identidade Visual

### Paleta de Cores
- **Cor Primária:** ${info.colors.primary}
- **Cor Secundária:** ${info.colors.secondary}
- **Cor de Fundo:** ${info.colors.background}
- **Cor do Texto:** ${info.colors.text}

### Tipografia
- **Fonte Principal:** ${info.typography}
- Utilizar hierarquia clara com tamanhos variados para títulos, subtítulos e corpo de texto

### Estilo Visual
- Design moderno e limpo
- Bordas arredondadas (border-radius: 12px para cards, 8px para botões)
- Sombras sutis para profundidade
- Animações suaves de hover e transição
- Ícones consistentes (Lucide React ou similar)
- Espaçamento generoso para respiração visual

## 🌐 Idioma
Toda a interface deve estar em **${info.language}**

## 📐 Requisitos Técnicos
- Design responsivo (mobile-first)
- Interface acessível (WCAG 2.1)
- Performance otimizada
- Código limpo e organizado
- Componentes reutilizáveis

## 🏗️ Arquitetura Sugerida
- Separação clara entre componentes de UI e lógica
- Gerenciamento de estado eficiente
- Rotas bem organizadas
- Tratamento de erros e loading states

## 📝 Instruções Finais
1. Implemente todas as páginas listadas com navegação funcional
2. Use a paleta de cores exata especificada
3. Mantenha consistência visual em toda a aplicação
4. Adicione interatividade e feedback visual para ações do usuário
5. Priorize a experiência mobile
6. Inclua estados de loading e empty states apropriados

---
*Prompt gerado automaticamente pelo Genesis Prompt Builder*`;
}

function generateConversationalPrompt(info: BaseInfo): string {
  return `Olá! Preciso que você crie um app chamado "${info.appName}" para ${info.targetAudience}.

O objetivo principal é ${info.mainTask.toLowerCase()}, ajudando os usuários a ${info.mainBenefit.toLowerCase()}.

O app precisa ter as seguintes páginas:
${info.pages.map(p => `• ${p}`).join('\n')}

${info.features.length > 0 ? `
Funcionalidades importantes:
${info.features.map(f => `• ${f}`).join('\n')}
` : ''}

${info.additionalFeatures ? `Também quero: ${info.additionalFeatures}` : ''}

Para o visual, use estas cores:
• Primária: ${info.colors.primary}
• Secundária: ${info.colors.secondary}
• Fundo: ${info.colors.background}
• Texto: ${info.colors.text}

A fonte deve ser ${info.typography} e todo o conteúdo em ${info.language}.

Quero um design moderno, clean, com bordas arredondadas e animações suaves. Mobile-first e totalmente responsivo.

Pode começar pela estrutura principal e navegação?`;
}

function generateStructuredPrompt(info: BaseInfo): string {
  return `PROJETO: ${info.appName}
NICHO: ${info.niche}
IDIOMA: ${info.language}

---
PÚBLICO
target: ${info.targetAudience}
users: ${info.dailyUsers}

---
OBJETIVO
task: ${info.mainTask}
benefit: ${info.mainBenefit}

---
PÁGINAS
${info.pages.map((p, i) => `[${i + 1}] ${p}`).join('\n')}

---
FEATURES
${info.features.length > 0 ? info.features.map(f => `+ ${f}`).join('\n') : '+ Core features'}
${info.additionalFeatures ? `\nEXTRA: ${info.additionalFeatures}` : ''}

---
DESIGN
primary: ${info.colors.primary}
secondary: ${info.colors.secondary}
background: ${info.colors.background}
text: ${info.colors.text}
font: ${info.typography}

---
SPECS
- Responsive (mobile-first)
- Modern UI with rounded corners
- Smooth animations
- Consistent iconography
- Accessible (WCAG 2.1)

---
OUTPUT: Full functional app with all pages and navigation`;
}

function generateMinimalPrompt(info: BaseInfo): string {
  return `Criar site/app "${info.appName}" para ${info.niche}.

Páginas: ${info.pages.join(', ')}

Cores: ${info.colors.primary} (primária), ${info.colors.secondary} (secundária)
Fonte: ${info.typography}
Idioma: ${info.language}

${info.features.length > 0 ? `Funcionalidades: ${info.features.join(', ')}` : ''}
${info.additionalFeatures ? `Extra: ${info.additionalFeatures}` : ''}

Design moderno, responsivo, profissional.`;
}
