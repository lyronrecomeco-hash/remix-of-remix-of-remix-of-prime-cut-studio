import { 
  PromptBuilderState, 
  NicheTemplate, 
  AI_PLATFORMS, 
  LANGUAGE_OPTIONS,
  AUTH_TYPES,
  PAYMENT_METHODS,
  NOTIFICATION_CHANNELS,
  DESIGN_STYLES,
  ICON_STYLES
} from './types';

export const generateMasterPrompt = (state: PromptBuilderState, template: NicheTemplate): string => {
  const platform = AI_PLATFORMS.find(p => p.id === state.platform);
  const language = LANGUAGE_OPTIONS.find(l => l.id === state.language);
  const languageName = language?.name || 'Português (Brasil)';
  const authType = AUTH_TYPES.find(a => a.id === state.authType);
  const designStyle = DESIGN_STYLES.find(d => d.id === state.designStyle);
  const iconStyle = ICON_STYLES.find(i => i.id === state.iconStyle);
  const timestamp = new Date().toISOString();

  const sections: string[] = [];

  // ============================================
  // HEADER
  // ============================================
  sections.push(`# 🚀 Nylus 1.0 IA Master de Prompts`);
  sections.push(`## Prompt Completo para Desenvolvimento de Aplicação`);
  sections.push('');
  sections.push(`> **IA de Destino:** ${platform?.name || state.platform}`);
  sections.push(`> **Gerado em:** ${new Date().toLocaleString('pt-BR')}`);
  sections.push(`> **Nicho:** ${template.niche}`);
  sections.push('');
  sections.push('---');
  sections.push('');

  // ============================================
  // SECTION 1: CONTEXTO E VISÃO GERAL
  // ============================================
  sections.push(`## 1. 📋 Contexto e Visão Geral`);
  sections.push('');
  sections.push(`**Nome do Projeto:** ${state.appName}`);
  sections.push('');
  sections.push(`**Descrição Completa:**`);
  sections.push(`Crie o frontend e backend completo para o aplicativo "${state.appName}". Este é um sistema completo para o nicho de ${template.niche}.`);
  sections.push('');
  sections.push(`**Tarefa Principal:**`);
  sections.push(`${state.mainTask}`);
  sections.push('');
  sections.push(`**Problema que Resolve:**`);
  sections.push(`${state.mainProblem}`);
  sections.push('');
  sections.push(`**Benefício Principal:**`);
  sections.push(`${state.mainBenefit}`);
  sections.push('');
  sections.push(`**Resultado Esperado do Dashboard:**`);
  sections.push(`${state.expectedOutcome}`);
  sections.push('');

  // ============================================
  // SECTION 2: PÚBLICO-ALVO E PERSONAS
  // ============================================
  sections.push(`## 2. 👥 Público-Alvo e Personas`);
  sections.push('');
  sections.push(`**Para quem é:**`);
  sections.push(`${state.targetAudience}`);
  sections.push('');
  sections.push(`**Usuários Diários:**`);
  sections.push(`${state.dailyUsers}`);
  sections.push('');
  sections.push(`**Modelo de Negócio:**`);
  sections.push(`${state.businessModel}`);
  sections.push('');

  // ============================================
  // SECTION 3: ESTRUTURA DE PÁGINAS
  // ============================================
  sections.push(`## 3. 📱 Estrutura de Páginas e Navegação`);
  sections.push('');
  sections.push(`O aplicativo deve conter as seguintes páginas com navegação fluida:`);
  sections.push('');
  state.pages.forEach((page, index) => {
    sections.push(`${index + 1}. **${page}**`);
  });
  sections.push('');

  // ============================================
  // SECTION 4: FUNCIONALIDADES CORE
  // ============================================
  sections.push(`## 4. ⚡ Funcionalidades Core do Sistema`);
  sections.push('');
  sections.push(`### 4.1 Funcionalidades Essenciais:`);
  state.coreFeatures.forEach((feature, index) => {
    sections.push(`${index + 1}. ${feature}`);
  });
  sections.push('');

  if (state.selectedSuggestedFeatures.length > 0) {
    sections.push(`### 4.2 Funcionalidades Complementares Selecionadas:`);
    state.selectedSuggestedFeatures.forEach((feature, index) => {
      sections.push(`${index + 1}. ${feature}`);
    });
    sections.push('');
  }

  if (state.additionalFeatures) {
    sections.push(`### 4.3 Recursos Adicionais Personalizados:`);
    sections.push(`${state.additionalFeatures}`);
    sections.push('');
  }

  // ============================================
  // SECTION 5: INTEGRAÇÕES
  // ============================================
  sections.push(`## 5. 🔌 Integrações e APIs`);
  sections.push('');
  state.integrations.forEach((integration, index) => {
    sections.push(`${index + 1}. ${integration}`);
  });
  sections.push('');

  // ============================================
  // SECTION 6: FLUXOS DE USUÁRIO
  // ============================================
  sections.push(`## 6. 🔄 Fluxos de Usuário (User Flows)`);
  sections.push('');
  sections.push(`Jornadas principais que o usuário realiza no aplicativo:`);
  sections.push('');
  state.userFlows.forEach((flow, index) => {
    sections.push(`**Fluxo ${index + 1}:**`);
    sections.push(`\`${flow}\``);
    sections.push('');
  });

  // ============================================
  // SECTION 7: IDENTIDADE VISUAL COMPLETA
  // ============================================
  sections.push(`## 7. 🎨 Identidade Visual Completa`);
  sections.push('');
  sections.push(`### 7.1 Paleta de Cores:`);
  sections.push(`| Função | Código | Uso |`);
  sections.push(`|--------|--------|-----|`);
  sections.push(`| **Primária** | \`${state.colors.primary}\` | CTAs, headers, ícones principais, estados ativos |`);
  sections.push(`| **Secundária** | \`${state.colors.secondary}\` | Cards de destaque, badges, gradientes |`);
  sections.push(`| **Destaque (Accent)** | \`${state.colors.accent}\` | Hover states, detalhes, highlights |`);
  sections.push(`| **Fundo** | \`${state.colors.background}\` | Background geral da aplicação |`);
  sections.push(`| **Texto** | \`${state.colors.text}\` | Textos, ícones, labels |`);
  sections.push('');

  sections.push(`### 7.2 Tipografia:`);
  sections.push(`- **Fonte Principal:** ${state.typography}`);
  sections.push(`- **Hierarquia:**`);
  sections.push(`  - Títulos (H1): bold, 28-32px`);
  sections.push(`  - Subtítulos (H2): semibold, 22-24px`);
  sections.push(`  - Seções (H3): semibold, 18-20px`);
  sections.push(`  - Corpo: regular, 14-16px`);
  sections.push(`  - Captions: regular, 12px`);
  sections.push(`- **Line-height:** 1.5 para corpo, 1.2 para títulos`);
  sections.push('');

  sections.push(`### 7.3 Design System:`);
  sections.push(`- **Estilo:** ${designStyle?.name || state.designStyle} - ${designStyle?.description || ''}`);
  sections.push(`- **Ícones:** ${iconStyle?.name || state.iconStyle} - ${iconStyle?.description || ''}`);
  sections.push(`- **Border-radius:** 16px para cards grandes, 12px para cards, 8px para botões, 6px para inputs`);
  sections.push(`- **Sombras:**`);
  sections.push(`  - Cards: \`0 4px 6px -1px rgba(0,0,0,0.1)\``);
  sections.push(`  - Modais: \`0 20px 25px -5px rgba(0,0,0,0.1)\``);
  sections.push(`  - Dropdowns: \`0 10px 15px -3px rgba(0,0,0,0.1)\``);
  sections.push(`- **Espaçamento:** Escala de 4px (4, 8, 12, 16, 24, 32, 48, 64, 96)`);
  sections.push(`- **Animações:**`);
  sections.push(`  - Transições: 200-300ms ease-out`);
  sections.push(`  - Hover: scale(1.02) + mudança de opacidade`);
  sections.push(`  - Loading: skeleton shimmer ou spinner`);
  sections.push('');

  // ============================================
  // SECTION 8: IDIOMA E LOCALIZAÇÃO
  // ============================================
  sections.push(`## 8. 🌍 Idioma e Localização`);
  sections.push('');
  sections.push(`- **Idioma Principal:** ${languageName}`);
  sections.push(`- Toda a interface, labels, placeholders, mensagens de erro e sucesso devem estar em ${languageName}`);
  if (state.language === 'pt-BR') {
    sections.push(`- **Formatos:**`);
    sections.push(`  - Data: dd/mm/aaaa`);
    sections.push(`  - Moeda: R$ X.XXX,XX`);
    sections.push(`  - Números: vírgula como decimal, ponto como milhar`);
    sections.push(`  - Telefone: (XX) XXXXX-XXXX`);
    sections.push(`  - CEP: XXXXX-XXX`);
  }
  sections.push('');

  // ============================================
  // SECTION 9: ARQUITETURA TÉCNICA
  // ============================================
  sections.push(`## 9. 🏗️ Arquitetura Técnica`);
  sections.push('');

  sections.push(`### 9.1 Frontend:`);
  sections.push(`- **Framework:** React 18+ com TypeScript (strict mode)`);
  sections.push(`- **Build Tool:** Vite`);
  sections.push(`- **Estilização:** Tailwind CSS com design tokens customizados`);
  sections.push(`- **Componentes:** shadcn/ui como base, customizados conforme identidade visual`);
  sections.push(`- **Estado Global:** React Query para server state, Context API para client state`);
  sections.push(`- **Roteamento:** React Router v6+ com lazy loading e code splitting`);
  sections.push(`- **Formulários:** React Hook Form + Zod para validação`);
  sections.push(`- **Animações:** Framer Motion para transições e micro-interações`);
  sections.push('');

  sections.push(`### 9.2 Backend:`);
  sections.push(`- **Database:** Supabase (PostgreSQL) com RLS para segurança row-level`);
  sections.push(`- **Autenticação:** ${authType?.name || state.authType} - ${authType?.description || ''}`);
  sections.push(`- **Storage:** Supabase Storage para uploads de arquivos e imagens`);
  sections.push(`- **Real-time:** Supabase Realtime para atualizações em tempo real`);
  sections.push(`- **Edge Functions:** Para lógica serverless, webhooks e integrações`);
  sections.push('');

  sections.push(`### 9.3 Métodos de Pagamento:`);
  const paymentNames = state.paymentMethods.map(id => PAYMENT_METHODS.find(p => p.id === id)?.name || id);
  paymentNames.forEach(name => {
    sections.push(`- ${name}`);
  });
  sections.push('');

  sections.push(`### 9.4 Canais de Notificação:`);
  const notificationNames = state.notificationChannels.map(id => NOTIFICATION_CHANNELS.find(n => n.id === id)?.name || id);
  notificationNames.forEach(name => {
    sections.push(`- ${name}`);
  });
  sections.push('');

  sections.push(`### 9.5 Configurações Adicionais:`);
  sections.push(`- **Mobile First:** ${state.mobileFirst ? '✅ Sim' : '❌ Não'}`);
  sections.push(`- **PWA Support:** ${state.pwaSupport ? '✅ Sim' : '❌ Não'}`);
  sections.push(`- **Dark Mode:** ${state.darkMode ? '✅ Sim' : '❌ Não'}`);
  sections.push('');

  // ============================================
  // SECTION 10: REQUISITOS DE UX/UI
  // ============================================
  sections.push(`## 10. 🎯 Requisitos de UX/UI`);
  sections.push('');
  sections.push(`### Estados Obrigatórios:`);
  sections.push(`- **Loading States:** Skeletons para listas e conteúdo, spinners para ações`);
  sections.push(`- **Empty States:** Ilustrações e CTAs claros quando não há dados`);
  sections.push(`- **Error States:** Toasts para feedback, mensagens claras e acionáveis`);
  sections.push(`- **Success States:** Animações de confirmação, feedback visual positivo`);
  sections.push('');
  sections.push(`### Responsividade:`);
  sections.push(`- ${state.mobileFirst ? 'Mobile-first: Design otimizado para mobile, adaptado para desktop' : 'Desktop-first: Design para desktop, adaptado para mobile'}`);
  sections.push(`- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)`);
  sections.push(`- Touch targets mínimo de 44px para elementos interativos`);
  sections.push('');
  sections.push(`### Acessibilidade:`);
  sections.push(`- WCAG 2.1 nível AA`);
  sections.push(`- Labels em todos os inputs`);
  sections.push(`- Contraste adequado (mínimo 4.5:1 para texto)`);
  sections.push(`- Navegação por teclado`);
  sections.push(`- Screen reader friendly`);
  sections.push('');
  sections.push(`### Performance:`);
  sections.push(`- Lazy loading de imagens e componentes`);
  sections.push(`- Code splitting por rotas`);
  sections.push(`- Bundle otimizado (< 200KB inicial)`);
  sections.push(`- Time to Interactive < 3 segundos`);
  sections.push('');

  // ============================================
  // SECTION 11: ESPECIFICAÇÕES DE TELAS
  // ============================================
  sections.push(`## 11. 📲 Especificações de Telas Principais`);
  sections.push('');
  
  state.pages.slice(0, 8).forEach((page, index) => {
    sections.push(`### 11.${index + 1} ${page}`);
    sections.push(`- Layout responsivo com grid adaptativo`);
    sections.push(`- Componentes interativos com feedback visual imediato`);
    sections.push(`- Integração com estado global quando necessário`);
    sections.push(`- Tratamento completo de loading, empty e error states`);
    sections.push(`- Animações de entrada e transição entre estados`);
    sections.push('');
  });

  // ============================================
  // SECTION 12: ORDEM DE IMPLEMENTAÇÃO
  // ============================================
  sections.push(`## 12. 📝 Ordem de Implementação Sugerida`);
  sections.push('');
  sections.push(`1. **Setup Inicial** - Configuração do projeto, tema e design tokens`);
  sections.push(`2. **Componentes Base** - Button, Input, Card, Badge, Modal, Toast`);
  sections.push(`3. **Layout Principal** - Header, Sidebar, Footer, Navegação`);
  sections.push(`4. **Autenticação** - Login, Cadastro, Recuperação de Senha`);
  sections.push(`5. **Dashboard** - Visão geral com métricas e atalhos`);
  sections.push(`6. **Funcionalidades Core** - As páginas principais do negócio`);
  sections.push(`7. **Funcionalidades Secundárias** - Configurações, Perfil, Relatórios`);
  sections.push(`8. **Integrações** - Pagamentos, Notificações, APIs externas`);
  sections.push(`9. **Polimento** - Animações, micro-interações, otimizações`);
  sections.push(`10. **Testes e Deploy** - Testes E2E, performance, deploy para produção`);
  sections.push('');

  // ============================================
  // SECTION 13: QUALIDADE DE CÓDIGO
  // ============================================
  sections.push(`## 13. 🧹 Qualidade de Código`);
  sections.push('');
  sections.push(`### Padrões:`);
  sections.push(`- **Componentização:** Componentes pequenos, focados e reutilizáveis`);
  sections.push(`- **TypeScript:** Tipagem estrita, interfaces bem definidas, evitar \`any\``);
  sections.push(`- **Naming:**`);
  sections.push(`  - camelCase para variáveis e funções`);
  sections.push(`  - PascalCase para componentes e types`);
  sections.push(`  - SCREAMING_SNAKE_CASE para constantes`);
  sections.push(`- **Comentários:** Documentar lógicas complexas e decisões não-óbvias`);
  sections.push('');
  sections.push(`### Organização de Pastas:`);
  sections.push(`\`\`\``);
  sections.push(`src/`);
  sections.push(`├── components/     # Componentes reutilizáveis`);
  sections.push(`│   ├── ui/         # Componentes base (shadcn)`);
  sections.push(`│   └── [feature]/  # Componentes específicos de feature`);
  sections.push(`├── pages/          # Páginas/Rotas da aplicação`);
  sections.push(`├── hooks/          # Custom hooks`);
  sections.push(`├── lib/            # Utilitários e helpers`);
  sections.push(`├── types/          # TypeScript interfaces e types`);
  sections.push(`├── integrations/   # Configurações de APIs externas`);
  sections.push(`└── assets/         # Imagens, ícones, fontes`);
  sections.push(`\`\`\``);
  sections.push('');

  // ============================================
  // SECTION 14: INSTRUÇÕES FINAIS
  // ============================================
  sections.push(`## 14. ✅ Instruções Finais`);
  sections.push('');
  sections.push(`> **IMPORTANTE:** Siga estas diretrizes à risca para garantir um resultado consistente e profissional.`);
  sections.push('');
  sections.push(`1. ✅ Implemente **TODAS** as páginas listadas com navegação funcional`);
  sections.push(`2. ✅ Use **EXATAMENTE** a paleta de cores especificada`);
  sections.push(`3. ✅ Mantenha **100% de consistência** visual em toda a aplicação`);
  sections.push(`4. ✅ Adicione **micro-interações** e feedback para cada ação do usuário`);
  sections.push(`5. ✅ Priorize a experiência **${state.mobileFirst ? 'mobile' : 'desktop'}** (touch targets mínimo 44px)`);
  sections.push(`6. ✅ Inclua **todos os estados**: loading, empty, error, success`);
  sections.push(`7. ✅ O código deve estar **pronto para produção**, não apenas protótipo`);
  sections.push(`8. ✅ Implemente **RLS (Row Level Security)** para todas as tabelas do Supabase`);
  sections.push(`9. ✅ Configure **autenticação completa** com ${authType?.name || state.authType}`);
  sections.push(`10. ✅ Otimize para **performance** e **SEO** desde o início`);
  sections.push('');

  // ============================================
  // FOOTER
  // ============================================
  sections.push('---');
  sections.push('');
  sections.push(`### 📊 Resumo do Projeto`);
  sections.push('');
  sections.push(`| Métrica | Valor |`);
  sections.push(`|---------|-------|`);
  sections.push(`| Total de Páginas | ${state.pages.length} |`);
  sections.push(`| Funcionalidades Core | ${state.coreFeatures.length} |`);
  sections.push(`| Funcionalidades Extras | ${state.selectedSuggestedFeatures.length} |`);
  sections.push(`| Integrações | ${state.integrations.length} |`);
  sections.push(`| Fluxos de Usuário | ${state.userFlows.length} |`);
  sections.push('');
  sections.push(`---`);
  sections.push(`*Prompt gerado por **Nylus 1.0 IA Master de Prompts***`);
  sections.push(`*Otimizado para: ${platform?.name || state.platform}*`);
  sections.push(`*Timestamp: ${timestamp}*`);

  return sections.join('\n');
};
