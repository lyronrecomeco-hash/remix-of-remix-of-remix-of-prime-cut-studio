import { PromptBuilderState, NicheTemplate, AI_PLATFORMS, LANGUAGE_OPTIONS } from './types';

export const generateMasterPrompt = (state: PromptBuilderState, template: NicheTemplate): string => {
  const platform = AI_PLATFORMS.find(p => p.id === state.platform);
  const language = LANGUAGE_OPTIONS.find(l => l.id === state.language);
  const languageName = language?.name || 'Português (Brasil)';
  const timestamp = new Date().toISOString();

  // Build the master prompt
  const sections: string[] = [];

  // Header
  sections.push(`## Nylus 1.0 IA Master de Prompts 🚀`);
  sections.push('');

  // Context Section
  sections.push(`**Contexto:**`);
  sections.push(`Crie o frontend completo para o aplicativo "${state.appName}". A tarefa principal do aplicativo é: ${state.mainTask}. Permitir que ${state.targetAudience.toLowerCase()} possam ${state.mainTask.toLowerCase()}, visualizando ${template.niche === 'Barbearia' ? 'horários disponíveis, profissionais e serviços' : 'todas as opções disponíveis'} com um clique. O sistema deve suportar pagamento online (cartão/Pix) como sinal para garantir a reserva, enviar lembretes automáticos via WhatsApp e permitir cancelamento/reagendamento seguindo as regras do negócio. O foco é na interatividade total e ponta a ponta, resolvendo o seguinte problema principal para ${state.targetAudience}: ${state.mainBenefit}. Permitir aos usuários (${state.dailyUsers}) uma experiência completa, reduzindo drasticamente o número de faltas (no-shows) e organizando múltiplos profissionais em um painel centralizado, fornecendo relatórios de faturamento, lembretes e pagamentos por sinal, e organizar serviços mais sofisticados. O cliente pode favoritar serviços e ver seu histórico.`);
  sections.push('');

  // Platform Optimization
  sections.push(`**IA de Destino:** Este prompt foi otimizado para a plataforma **${platform?.name || state.platform}**.`);
  sections.push('');

  // Section 1: Vision & Core Concept
  sections.push(`### 1. Visão Geral e Conceito Central:`);
  sections.push(`   *Nome do Projeto:* ${state.appName}`);
  sections.push(`   *Função Principal (A Grande Tarefa):* ${state.mainTask}. Permitir que ${state.dailyUsers} realizem todas as operações de forma fluida e intuitiva, com foco em UX e conversão.`);
  sections.push('');

  // Section 2: Target Audience
  sections.push(`### 2. Público-Alvo e Personas:`);
  sections.push(`   *Para quem é:* ${state.targetAudience}`);
  sections.push(`   *Usuários diários:* ${state.dailyUsers}`);
  sections.push(`   *Dor principal resolvida:* ${state.mainBenefit}`);
  sections.push('');

  // Section 3: Pages & Navigation
  sections.push(`### 3. Estrutura de Páginas e Navegação:`);
  sections.push(`   O aplicativo deve conter as seguintes páginas com navegação fluida:`);
  state.pages.forEach((page, index) => {
    sections.push(`   ${index + 1}. ${page}`);
  });
  sections.push('');

  // Section 4: Core Features
  sections.push(`### 4. Funcionalidades Core do Sistema:`);
  if (state.selectedSuggestedFeatures.length > 0) {
    state.selectedSuggestedFeatures.forEach((feature, index) => {
      sections.push(`   ${index + 1}. ${feature}`);
    });
  } else {
    sections.push(`   - Funcionalidades básicas do nicho ${template.niche}`);
  }
  if (state.additionalFeatures) {
    sections.push('');
    sections.push(`   *Recursos Adicionais Solicitados:*`);
    sections.push(`   ${state.additionalFeatures}`);
  }
  sections.push('');

  // Section 5: Visual Identity
  sections.push(`### 5. Identidade Visual Completa:`);
  sections.push('');
  sections.push(`   **5.1 Paleta de Cores:**`);
  sections.push(`   - Cor Primária: ${state.colors.primary} (usar em CTAs, headers, ícones principais, estados ativos)`);
  sections.push(`   - Cor Secundária: ${state.colors.secondary} (usar em cards de destaque, badges, gradientes)`);
  sections.push(`   - Cor de Fundo: ${state.colors.background} (background geral da aplicação)`);
  sections.push(`   - Cor do Texto: ${state.colors.text} (textos, ícones, labels)`);
  sections.push('');
  sections.push(`   **5.2 Tipografia:**`);
  sections.push(`   - Fonte Principal: ${state.typography}`);
  sections.push(`   - Hierarquia: Títulos (bold, 24-32px), Subtítulos (semibold, 18-20px), Corpo (regular, 14-16px), Captions (12px)`);
  sections.push(`   - Line-height otimizado para legibilidade (1.5 para corpo, 1.2 para títulos)`);
  sections.push('');
  sections.push(`   **5.3 Design System:**`);
  sections.push(`   - Border-radius: 12px para cards, 8px para botões, 6px para inputs`);
  sections.push(`   - Sombras: Usar shadow-sm para cards, shadow-md para modais, shadow-lg para dropdowns`);
  sections.push(`   - Espaçamento: Seguir escala de 4px (4, 8, 12, 16, 24, 32, 48, 64)`);
  sections.push(`   - Animações: Transições suaves de 200-300ms, ease-out para entradas, ease-in para saídas`);
  sections.push(`   - Hover states: Aumentar opacidade, leve scale (1.02), mudança de cor sutil`);
  sections.push(`   - Ícones: Lucide React ou similar, stroke-width 1.5-2, tamanhos consistentes`);
  sections.push('');

  // Section 6: Language
  sections.push(`### 6. Idioma e Localização:`);
  sections.push(`   - Idioma principal: ${languageName}`);
  sections.push(`   - Toda a interface, labels, placeholders, mensagens de erro e sucesso devem estar em ${languageName}`);
  sections.push(`   - Formatos de data, moeda e números seguindo o padrão ${state.language === 'pt-BR' ? 'brasileiro (dd/mm/aaaa, R$, vírgula decimal)' : 'do idioma selecionado'}`);
  sections.push('');

  // Section 7: Technical Architecture
  sections.push(`### 7. Arquitetura Técnica:`);
  sections.push('');
  sections.push(`   **7.1 Frontend:**`);
  sections.push(`   - Framework: React com TypeScript`);
  sections.push(`   - Estilização: Tailwind CSS com design tokens customizados`);
  sections.push(`   - Componentes: shadcn/ui como base, customizados conforme identidade visual`);
  sections.push(`   - Estado: React Query para server state, Zustand ou Context para client state`);
  sections.push(`   - Roteamento: React Router v6+ com lazy loading`);
  sections.push(`   - Formulários: React Hook Form + Zod para validação`);
  sections.push('');
  sections.push(`   **7.2 Backend (Recomendado):**`);
  sections.push(`   - Database: Supabase (PostgreSQL) com RLS para segurança`);
  sections.push(`   - Auth: Supabase Auth com magic link ou email/senha`);
  sections.push(`   - Storage: Supabase Storage para uploads`);
  sections.push(`   - Real-time: Supabase Realtime para atualizações live`);
  sections.push(`   - Edge Functions: Para lógica serverless e integrações`);
  sections.push('');
  sections.push(`   **7.3 Integrações Sugeridas:**`);
  sections.push(`   - Pagamentos: Stripe ou PagSeguro/Mercado Pago`);
  sections.push(`   - WhatsApp: API oficial ou Evolution API`);
  sections.push(`   - Email: Resend ou SendGrid`);
  sections.push(`   - Analytics: Mixpanel ou PostHog`);
  sections.push('');

  // Section 8: UX Requirements
  sections.push(`### 8. Requisitos de UX/UI:`);
  sections.push(`   - Mobile-first: Priorizar experiência mobile, depois adaptar para desktop`);
  sections.push(`   - Loading states: Skeletons para listas, spinners para ações`);
  sections.push(`   - Empty states: Ilustrações e CTAs claros quando não há dados`);
  sections.push(`   - Error handling: Toasts para feedback, mensagens claras e acionáveis`);
  sections.push(`   - Acessibilidade: WCAG 2.1 AA, labels em inputs, contraste adequado`);
  sections.push(`   - Performance: Lazy loading de imagens, code splitting, otimização de bundle`);
  sections.push('');

  // Section 9: Specific Screens
  sections.push(`### 9. Especificações de Telas Principais:`);
  sections.push('');
  
  // Generate screen specs based on pages
  state.pages.slice(0, 5).forEach((page, index) => {
    sections.push(`   **9.${index + 1} ${page}:**`);
    sections.push(`   - Layout responsivo com grid adaptativo`);
    sections.push(`   - Componentes interativos com feedback visual`);
    sections.push(`   - Integração com estado global quando necessário`);
    sections.push(`   - Tratamento de loading e error states`);
    sections.push('');
  });

  // Section 10: Implementation Order
  sections.push(`### 10. Ordem de Implementação Sugerida:`);
  sections.push(`   1. Setup inicial do projeto com configurações de tema`);
  sections.push(`   2. Componentes base do design system`);
  sections.push(`   3. Layout principal e navegação`);
  sections.push(`   4. Telas públicas (landing, login, cadastro)`);
  sections.push(`   5. Dashboard e área logada`);
  sections.push(`   6. Funcionalidades core do negócio`);
  sections.push(`   7. Integrações externas`);
  sections.push(`   8. Polimento de UX e testes`);
  sections.push('');

  // Section 11: Code Quality
  sections.push(`### 11. Qualidade de Código:`);
  sections.push(`   - Componentização: Componentes pequenos e reutilizáveis`);
  sections.push(`   - TypeScript: Tipagem estrita, interfaces bem definidas`);
  sections.push(`   - Naming: camelCase para variáveis, PascalCase para componentes`);
  sections.push(`   - Comentários: Documentar lógicas complexas`);
  sections.push(`   - Organização: Pastas por feature (components, hooks, utils, types)`);
  sections.push('');

  // Final Instructions
  sections.push(`### 12. Instruções Finais:`);
  sections.push(`   1. Implemente TODAS as páginas listadas com navegação funcional entre elas`);
  sections.push(`   2. Use EXATAMENTE a paleta de cores especificada`);
  sections.push(`   3. Mantenha consistência visual em 100% da aplicação`);
  sections.push(`   4. Adicione micro-interações e feedback para cada ação do usuário`);
  sections.push(`   5. Priorize a experiência mobile (touch targets mínimo 44px)`);
  sections.push(`   6. Inclua todos os estados: loading, empty, error, success`);
  sections.push(`   7. O código deve estar pronto para produção, não apenas protótipo`);
  sections.push('');

  // Footer
  sections.push(`---`);
  sections.push(`*Prompt gerado por Nylus 1.0 IA Master de Prompts*`);
  sections.push(`*Otimizado para: ${platform?.name || state.platform}*`);
  sections.push(`*Timestamp: ${timestamp}*`);

  return sections.join('\n');
};
