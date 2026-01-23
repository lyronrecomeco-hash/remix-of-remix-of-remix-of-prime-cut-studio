import { FromScratchFormData, LANGUAGES, CURRENCIES, AI_TARGETS } from './types';
import { NicheContext } from './nicheContexts';

export function generateAdvancedPrompt(
  formData: FromScratchFormData,
  niche: NicheContext | undefined
): string {
  const timestamp = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const language = LANGUAGES.find(l => l.code === formData.language);
  const currency = CURRENCIES.find(c => c.code === formData.currency);
  const targetAI = AI_TARGETS.find(ai => ai.id === formData.targetAI);
  
  const isApp = formData.projectType === 'app';
  const projectTypeLabel = isApp ? 'Aplicativo Web com Painel Administrativo' : 'Site Comercial / Landing Page';
  
  const allObjectives = [...formData.selectedObjectives, ...formData.customObjectives];
  const allPages = [...formData.selectedPages, ...formData.customPages];
  const allFeatures = [...formData.selectedFeatures];

  // Generate sections with page descriptions
  const pagesSection = allPages.map((page, index) => {
    const pageDescriptions: Record<string, string> = {
      'Home': 'Página inicial com hero impactante, principais CTAs e visão geral do negócio',
      'Sobre': 'História da empresa, missão, visão, valores e diferenciais competitivos',
      'Serviços': 'Lista completa de serviços oferecidos com descrições detalhadas e preços',
      'Produtos': 'Catálogo de produtos com fotos, descrições, preços e opções de compra',
      'Portfolio': 'Galeria de trabalhos realizados, cases de sucesso com resultados',
      'Contato': 'Formulário de contato, mapa de localização, telefone, email e redes sociais',
      'Cardápio': 'Menu digital com categorias, fotos dos pratos, preços e descrições',
      'Agendamento': 'Sistema de agendamento online com calendário e escolha de profissional',
      'Equipe': 'Perfil dos profissionais com foto, formação, especialidades e experiência',
      'Galeria': 'Galeria de fotos do ambiente, trabalhos ou produtos em alta qualidade',
      'Depoimentos': 'Avaliações e testemunhos de clientes satisfeitos',
      'Planos': 'Tabela comparativa de planos e preços com benefícios de cada opção',
      'Blog': 'Área de conteúdo com artigos, dicas e notícias do segmento',
      'FAQ': 'Perguntas frequentes com respostas detalhadas em formato accordion',
      'Promoções': 'Ofertas especiais, descontos e promoções vigentes com destaque',
      'Localização': 'Mapa interativo, endereço completo, horário de funcionamento',
    };
    
    const description = pageDescriptions[page] || `Página personalizada: ${page}`;
    return `${index + 1}. **${page}**: ${description}`;
  }).join('\n');

  // Generate features with descriptions
  const featuresSection = allFeatures.map(feature => {
    const featureDescriptions: Record<string, string> = {
      'Botão WhatsApp flutuante': 'Botão fixo no canto inferior direito que abre conversa direta no WhatsApp com mensagem pré-definida',
      'Formulário de contato': 'Formulário com campos de nome, email, telefone e mensagem, com validação e feedback de envio',
      'Mapa de localização': 'Integração com Google Maps mostrando localização exata do estabelecimento',
      'Galeria de fotos': 'Grid de imagens com lightbox para visualização ampliada e navegação',
      'Depoimentos de clientes': 'Carrossel ou grid com avaliações, fotos dos clientes e estrelas de rating',
      'FAQ / Perguntas frequentes': 'Accordions expansíveis com as dúvidas mais comuns e respostas detalhadas',
      'Newsletter': 'Campo de captura de email para newsletter com integração de email marketing',
      'Chat online': 'Widget de chat em tempo real para atendimento ao cliente',
      'Sistema de busca': 'Campo de busca com sugestões e filtros de resultados',
      'Avaliações e reviews': 'Sistema de estrelas e comentários para produtos/serviços',
    };
    
    return `- **${feature}**: ${featureDescriptions[feature] || 'Implementar conforme melhores práticas'}`;
  }).join('\n');

  // Generate integrations section
  const integrationsSection = formData.integrations.length > 0 
    ? formData.integrations.map(int => `- ${int}`).join('\n')
    : '- Nenhuma integração específica selecionada';

  // Build the mega prompt
  const prompt = `# 🚀 PROJETO: ${formData.projectName.toUpperCase()}

## 📋 BRIEFING EXECUTIVO

Este é um projeto de **${projectTypeLabel}** para ${formData.companyName}, atuando no segmento de **${niche?.name || formData.customNiche || 'Negócio Personalizado'}**${formData.cityRegion ? `, localizado em ${formData.cityRegion}` : ''}. O objetivo é criar uma presença digital completa e profissional que ${isApp ? 'inclua funcionalidades de gestão e painel administrativo' : 'maximize conversões e gere leads qualificados'}.

---

## 🎯 CONTEXTO DO NEGÓCIO

| Campo | Valor |
|-------|-------|
| **Nome do Projeto** | ${formData.projectName} |
| **Empresa/Estabelecimento** | ${formData.companyName} |
| **Slogan** | ${formData.slogan || 'A definir'} |
| **Tipo de Projeto** | ${projectTypeLabel} |
| **Segmento/Nicho** | ${niche?.name || formData.customNiche || 'Personalizado'} ${niche?.emoji || ''} |
| **Localização** | ${formData.cityRegion || 'A definir'} |
| **Público-Alvo** | ${formData.targetAudience || 'A definir'} |
| **Idioma Principal** | ${language?.flag || ''} ${language?.name || formData.language} |
| **Moeda** | ${currency?.symbol || ''} ${currency?.name || formData.currency} |

---

## 💡 CONTEXTO ESPECÍFICO DO NICHO

${niche?.contextPrompt || `Este é um projeto personalizado que requer atenção especial às necessidades específicas do negócio. O design deve refletir a identidade da marca e os valores da empresa. Funcionalidades devem ser adaptadas ao modelo de negócio específico.`}

${niche ? `
### Palavras-chave SEO Sugeridas:
${niche.seoKeywords.map(kw => `\`${kw}\``).join(', ')}

### Seções Típicas do Segmento:
${niche.commonSections.map(s => `- ${s}`).join('\n')}
` : ''}

---

## 🎯 OBJETIVOS PRINCIPAIS DO PROJETO

${allObjectives.length > 0 ? allObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n') : '- Objetivos a serem definidos'}

### Métricas de Sucesso:
- Taxa de conversão de visitantes em leads/clientes
- Tempo médio de permanência no site
- Taxa de rejeição abaixo de 40%
- Carregamento inicial em menos de 3 segundos
- Score de SEO acima de 90 no Lighthouse

---

## 📄 ESTRUTURA DO PROJETO

### Páginas/Seções a Implementar:

${pagesSection || 'Estrutura a ser definida'}

### Hierarquia de Navegação:
- Menu principal no header com as principais páginas
- Footer com links secundários, redes sociais e informações de contato
- Breadcrumbs em páginas internas para navegação
- Menu mobile responsivo (hamburger menu)

---

## 🎨 DESIGN SYSTEM COMPLETO

### Paleta de Cores

| Tipo | Cor | Uso |
|------|-----|-----|
| **Primária** | \`${formData.primaryColor}\` | Botões principais, CTAs, links, elementos de destaque |
| **Secundária** | \`${formData.secondaryColor}\` | Acentos, hovers, elementos secundários |
| **Background** | ${formData.themeMode === 'dark' ? '`#0a0a0a` - `#1a1a1a`' : '`#ffffff` - `#f8fafc`'} | Fundo principal e secundário |
| **Texto** | ${formData.themeMode === 'dark' ? '`#ffffff` / `#a1a1aa`' : '`#1c1917` / `#71717a`'} | Texto principal e secundário |
| **Bordas** | ${formData.themeMode === 'dark' ? '`rgba(255,255,255,0.1)`' : '`rgba(0,0,0,0.1)`'} | Linhas e separadores |

### Tipografia

- **Família Principal**: ${formData.typography}
- **Hierarquia**:
  - H1: 48-64px, bold (títulos de página)
  - H2: 32-40px, semibold (seções)
  - H3: 24-28px, semibold (subseções)
  - Body: 16-18px, regular (texto corrido)
  - Small: 14px (labels, captions)
  - Micro: 12px (badges, tags)

### Estilo Visual

- **Estilo**: ${formData.visualStyle}
- **Tema**: ${formData.themeMode === 'dark' ? 'Modo Escuro (Dark Mode)' : formData.themeMode === 'light' ? 'Modo Claro (Light Mode)' : 'Automático (segue preferência do sistema)'}
- **Bordas**: Arredondadas (8-16px de radius)
- **Sombras**: Sutis, com elevação progressiva
- **Espaçamento**: Sistema de 4px (4, 8, 12, 16, 24, 32, 48, 64)

### Componentes Visuais

- **Botões**: Primário (cor primária, texto contrastante), Secundário (outline), Ghost (transparente)
- **Cards**: Background sutil, borda fina, hover com elevação
- **Inputs**: Bordas arredondadas, focus visível, estados de erro/sucesso
- **Badges**: Pequenos, cores semânticas (sucesso, alerta, erro, info)
- **Modais**: Overlay escuro, centralizado, animação de entrada

### Micro-interações e Animações

- Hover em botões: escala 1.02, transição 200ms
- Hover em cards: elevação sutil, borda mais visível
- Scroll reveal: fade-in + translate-y de 20px
- Loading states: shimmer effect ou skeleton
- Transições de página: fade suave de 300ms
- Tooltips: delay de 200ms, animação fade

---

## ⚡ FUNCIONALIDADES E FEATURES

### Features Principais:

${featuresSection || '- Features a serem definidas'}

### Integrações:

${integrationsSection}

${isApp ? `
### Funcionalidades de Aplicativo:

#### Sistema de Autenticação:
- Login com email/senha
- Cadastro de novos usuários
- Recuperação de senha por email
- Sessões persistentes com tokens seguros
- Logout em todos os dispositivos

#### Painel Administrativo:
- Dashboard com métricas e gráficos
- CRUD completo das entidades principais
- Gestão de usuários e permissões
- Configurações do sistema
- Relatórios exportáveis (PDF/Excel)
- Logs de atividade

#### Banco de Dados:
- Estrutura relacional bem definida
- Índices para performance
- Backup automático
- Row Level Security (RLS)
- Triggers para auditoria

` : `
### Funcionalidades de Site Comercial:

#### Otimização para Conversão:
- CTAs claros e visíveis acima da dobra
- Formulários curtos e objetivos
- Provas sociais próximas aos CTAs
- Urgência/escassez quando aplicável
- Exit intent popup (opcional)

#### Lead Capture:
- Formulário de contato otimizado
- Integração WhatsApp direto
- Newsletter com incentivo
- Chat online se disponível

`}

---

## 📱 REQUISITOS TÉCNICOS

### Stack Recomendada:
- **Frontend**: React 18+ com TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Build**: Vite
${isApp ? `- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **State**: TanStack Query para cache e sincronização` : `- **Forms**: React Hook Form + Zod
- **SEO**: Meta tags dinâmicas, sitemap, robots.txt`}

### Performance:
${formData.isPerformanceOptimized ? `- **Lazy Loading**: Imagens e componentes carregados sob demanda
- **Code Splitting**: Chunks separados por rota
- **Compressão**: Gzip/Brotli para assets
- **Cache**: Headers apropriados para assets estáticos
- **CDN**: Servir assets de CDN
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1` : '- Performance padrão'}

### SEO:
${formData.hasAdvancedSEO ? `- **Meta Tags**: Title, description, og:image, twitter:card
- **Structured Data**: JSON-LD para o tipo de negócio
- **Sitemap**: XML atualizado automaticamente
- **Robots.txt**: Configurado corretamente
- **Canonical URLs**: Evitar conteúdo duplicado
- **Alt Text**: Em todas as imagens
- **Headings**: Hierarquia H1-H6 correta
- **URLs**: Amigáveis e descritivas` : '- SEO básico com meta tags essenciais'}

### Responsividade:
${formData.isMobileFirst ? `- **Mobile First**: Design primário para mobile, depois desktop
- **Breakpoints**: 
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
  - Wide: > 1440px
- **Touch Friendly**: Áreas de toque mínimo de 44px
- **Gestos**: Suporte a swipe onde aplicável` : '- Responsivo padrão para principais dispositivos'}

### Acessibilidade:
${formData.hasAccessibility ? `- **WCAG 2.1 AA**: Conformidade com diretrizes
- **Contraste**: Mínimo de 4.5:1 para texto
- **Focus Visible**: Estados de foco claros
- **Screen Readers**: Labels e ARIA apropriados
- **Keyboard Navigation**: Navegação completa por teclado
- **Alt Text**: Descrições em todas as imagens
- **Skip Links**: Pular para conteúdo principal` : '- Acessibilidade básica'}

${formData.isPWA ? `
### Progressive Web App (PWA):
- **Manifest.json**: Nome, ícones, cores, orientação
- **Service Worker**: Cache offline e atualizações
- **Installable**: Prompt de instalação na home screen
- **Offline**: Página offline amigável
- **Push Notifications**: Se aplicável ao negócio
` : ''}

${formData.hasAnalytics ? `
### Analytics e Tracking:
- **Google Analytics 4**: Configurado com eventos personalizados
- **Eventos de Conversão**: Formulários, cliques em CTA, WhatsApp
- **Funil de Navegação**: Acompanhar jornada do usuário
- **Heatmaps**: Integração com Hotjar/Clarity (opcional)
` : ''}

---

## 🏆 CHECKLIST DE QUALIDADE

### Código:
- [ ] TypeScript strict mode
- [ ] ESLint + Prettier configurados
- [ ] Componentes pequenos e reutilizáveis
- [ ] Custom hooks para lógica compartilhada
- [ ] Tratamento de erros em todas as operações
- [ ] Loading states em todas as operações assíncronas
- [ ] Testes unitários para funções críticas

### UX/UI:
- [ ] Feedback visual para todas as ações
- [ ] Estados de loading, erro e vazio
- [ ] Mensagens de erro amigáveis
- [ ] Confirmação para ações destrutivas
- [ ] Transições suaves entre estados
- [ ] Skeleton loading para conteúdo

### Performance:
- [ ] Lighthouse score > 90 em todas as categorias
- [ ] Imagens otimizadas (WebP, lazy loading)
- [ ] Fonts com display: swap
- [ ] Critical CSS inline
- [ ] Bundle size otimizado

### SEO:
- [ ] Meta tags em todas as páginas
- [ ] Sitemap.xml atualizado
- [ ] Robots.txt configurado
- [ ] Structured data implementado
- [ ] URLs amigáveis
- [ ] Heading hierarchy correta

### Segurança:
- [ ] HTTPS em todas as páginas
- [ ] Sanitização de inputs
- [ ] Proteção XSS
- [ ] Validação server-side
- [ ] Rate limiting em formulários
${isApp ? '- [ ] RLS policies no banco de dados\n- [ ] Auth tokens seguros\n- [ ] Secrets em variáveis de ambiente' : ''}

---

## 💡 INSTRUÇÕES ESPECÍFICAS PARA ${targetAI?.name?.toUpperCase() || 'A IA'}

${getAISpecificInstructions(formData.targetAI, formData.otherAI, isApp)}

---

## 📝 NOTAS ADICIONAIS

- Priorizar experiência do usuário em todas as decisões
- Código limpo, legível e bem documentado
- Seguir convenções e padrões do ecossistema React
- Componentes devem ser reutilizáveis e testáveis
- Performance é prioridade desde o início
- Design responsivo não é opcional, é obrigatório

---

## 📅 METADADOS

| Campo | Valor |
|-------|-------|
| **Gerado em** | ${timestamp} |
| **IA Destino** | ${targetAI?.name || formData.otherAI || 'Não especificada'} |
| **Tipo de Projeto** | ${projectTypeLabel} |
| **Nicho** | ${niche?.name || formData.customNiche || 'Personalizado'} |
| **Versão do Prompt** | 2.0 - Ultra-Completo |

---

*Este prompt foi gerado pelo Sistema Genesis-IA e contém todas as especificações necessárias para criar um projeto profissional e completo. Execute cada seção cuidadosamente para garantir um resultado de alta qualidade.*
`;

  return prompt.trim();
}

function getAISpecificInstructions(targetAI: string, otherAI?: string, isApp?: boolean): string {
  const instructions: Record<string, string> = {
    'lovable': `### Para Lovable (lovable.dev):
- Utilize a stack padrão do Lovable: React + TypeScript + Vite + Tailwind + Shadcn/UI
- Aproveite os componentes pré-instalados do Shadcn/UI
- Use Framer Motion para animações (já disponível)
- Para backend, utilize Supabase através do Cloud integrado
- Importe ícones do Lucide React
- Organize componentes em src/components/
- Use src/pages/ para páginas de rotas
- Hooks customizados em src/hooks/
- Utilitários em src/lib/
- Não precisa configurar build, Vite já está configurado
- Use as variáveis CSS do design system em index.css
${isApp ? '- Ative Lovable Cloud para backend com Supabase integrado\n- Use Edge Functions para lógica de backend\n- Configure RLS para segurança dos dados' : ''}`,

    'cursor': `### Para Cursor:
- Configure o projeto com Vite + React + TypeScript
- Instale Tailwind CSS e configure corretamente
- Adicione Shadcn/UI manualmente via CLI
- Use Framer Motion para animações
- Estruture o projeto seguindo convenções de pasta
- Configure ESLint e Prettier
- Crie .env para variáveis de ambiente
${isApp ? '- Configure Supabase client separadamente\n- Implemente autenticação com @supabase/auth-helpers-react\n- Crie migrations SQL para o schema' : ''}`,

    'v0': `### Para v0 (Vercel):
- O v0 gera componentes React + Tailwind
- Foque na UI visual, pois v0 é especializado nisso
- Use os componentes gerados como base
- Pode ser necessário ajustar para integrar com backend
- Componentes saem prontos para Next.js
- Adapte para Vite se necessário
${isApp ? '- Integre com Vercel Postgres ou Supabase após geração\n- Configure API routes separadamente' : ''}`,

    'bolt': `### Para Bolt.new:
- Bolt suporta full-stack com React + Node
- Configure o projeto inicial com as dependências
- Utilize o terminal integrado para instalar pacotes
- Backend pode ser feito com Express ou similar
- Configure variáveis de ambiente no painel
${isApp ? '- Use o backend integrado para APIs\n- Configure banco de dados via painel\n- Implemente autenticação com JWT' : ''}`,

    'chatgpt': `### Para ChatGPT:
- Peça a criação de cada arquivo individualmente
- Comece pela estrutura de pastas e configuração
- Depois avance para componentes e páginas
- Solicite explicações quando necessário
- Peça revisões e melhorias incrementais
- Use Code Interpreter para gerar arquivos se disponível
${isApp ? '- Solicite schema do banco de dados primeiro\n- Depois as APIs e autenticação\n- Por último o frontend integrado' : ''}`,

    'google-studio': `### Para Google AI Studio (Gemini):
- Similar ao ChatGPT, peça arquivos um por um
- Gemini é bom em gerar código estruturado
- Aproveite o contexto longo para projetos grandes
- Peça explicações técnicas quando útil
- Use exemplos de código quando possível
${isApp ? '- Solicite diagramas de arquitetura primeiro\n- Depois implemente por módulos\n- Revise segurança ao final' : ''}`,
  };

  return instructions[targetAI] || `### Para ${otherAI || 'Outra IA'}:
- Adapte as instruções conforme a capacidade da IA escolhida
- Siga as melhores práticas de React e TypeScript
- Implemente gradualmente, começando pela estrutura base
- Revise e teste cada componente antes de avançar
- Solicite melhorias e otimizações quando necessário
${isApp ? '- Configure backend conforme a plataforma suportar\n- Priorize segurança e performance' : ''}`;
}
