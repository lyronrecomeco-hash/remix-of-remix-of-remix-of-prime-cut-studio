import { FromScratchFormData, LANGUAGES, CURRENCIES, AI_TARGETS } from './types';
import { NicheContext } from './nicheContexts';
import { AppNicheContext, getAppNicheById } from './appNicheContexts';

// Adaptações culturais e linguísticas por idioma
const LANGUAGE_ADAPTATIONS: Record<string, {
  promptLanguage: string;
  nativeInstructions: string;
  persuasionStyle: string;
  culturalTone: string;
  siteLanguageLabel: string;
}> = {
  'pt-BR': {
    promptLanguage: 'Português Brasileiro',
    nativeInstructions: 'Escreva TODO o conteúdo do site em português brasileiro natural e comercial. Use linguagem próxima, amigável e persuasiva como um vendedor brasileiro experiente.',
    persuasionStyle: 'Foque em benefícios emocionais, use gatilhos de escassez e urgência com naturalidade, crie conexão pessoal com o visitante.',
    culturalTone: 'Brasileiro - Próximo, caloroso, usa "você", emoji com moderação, prova social forte',
    siteLanguageLabel: 'O site DEVE ser 100% em Português Brasileiro'
  },
  'pt-PT': {
    promptLanguage: 'Português de Portugal',
    nativeInstructions: 'Escreva TODO o conteúdo do site em português de Portugal. Use linguagem formal mas acessível, respeitosa e profissional.',
    persuasionStyle: 'Foque em qualidade, tradição e confiabilidade. Argumentação lógica com provas concretas.',
    culturalTone: 'Português Europeu - Formal, respeitoso, usa "você" ou "o senhor/a", profissional',
    siteLanguageLabel: 'O site DEVE ser 100% em Português de Portugal'
  },
  'en': {
    promptLanguage: 'English (US)',
    nativeInstructions: 'Write ALL website content in natural American English. Use professional, direct, and results-focused language like a native American sales expert.',
    persuasionStyle: 'Focus on ROI, time-saving, efficiency. Use data and statistics. Be direct and action-oriented.',
    culturalTone: 'American English - Direct, professional, value-driven, results-focused, confident',
    siteLanguageLabel: 'The website MUST be 100% in American English'
  },
  'en-GB': {
    promptLanguage: 'English (UK)',
    nativeInstructions: 'Write ALL website content in British English. Use polished, refined language with a professional yet approachable tone.',
    persuasionStyle: 'Focus on quality, reliability, and trust. Use understated confidence and social proof.',
    culturalTone: 'British English - Polished, refined, trustworthy, understated confidence',
    siteLanguageLabel: 'The website MUST be 100% in British English'
  },
  'es': {
    promptLanguage: 'Español (España)',
    nativeInstructions: 'Escribe TODO el contenido del sitio web en español de España nativo. Usa un lenguaje comercial profesional, cercano y persuasivo.',
    persuasionStyle: 'Enfócate en la confianza, calidad y relación personal. Usa testimonios y garantías.',
    culturalTone: 'Español Europeo - Profesional, cercano, usa "usted" o "tú" según contexto, confiable',
    siteLanguageLabel: 'El sitio web DEBE estar 100% en Español de España'
  },
  'es-MX': {
    promptLanguage: 'Español (México)',
    nativeInstructions: 'Escribe TODO el contenido del sitio web en español mexicano natural. Usa lenguaje amigable, cálido y comercial.',
    persuasionStyle: 'Enfócate en beneficios familiares, ahorro y valor. Conexión emocional fuerte.',
    culturalTone: 'Español Mexicano - Amigable, cálido, usa "usted" respetuoso, familiar',
    siteLanguageLabel: 'El sitio web DEBE estar 100% en Español de México'
  },
  'es-AR': {
    promptLanguage: 'Español (Argentina)',
    nativeInstructions: 'Escribí TODO el contenido del sitio web en español argentino nativo. Usá el voseo naturalmente y un tono cercano.',
    persuasionStyle: 'Enfocate en la calidad, la pasión y la conexión personal. Usá testimonios reales.',
    culturalTone: 'Español Argentino - Cercano, apasionado, usa "vos", directo pero cálido',
    siteLanguageLabel: 'El sitio web DEBE estar 100% en Español de Argentina'
  },
  'fr': {
    promptLanguage: 'Français',
    nativeInstructions: 'Rédigez TOUT le contenu du site en français natif. Utilisez un langage commercial élégant, professionnel et persuasif.',
    persuasionStyle: 'Mettez l\'accent sur l\'élégance, la qualité et l\'expertise. Argumentation logique et raffinée.',
    culturalTone: 'Français - Élégant, professionnel, vouvoiement, sophistiqué',
    siteLanguageLabel: 'Le site web DOIT être 100% en Français'
  },
  'de': {
    promptLanguage: 'Deutsch',
    nativeInstructions: 'Schreiben Sie ALLE Website-Inhalte in nativem Deutsch. Verwenden Sie professionelle, präzise und vertrauenswürdige Geschäftssprache.',
    persuasionStyle: 'Fokus auf Qualität, Zuverlässigkeit und technische Exzellenz. Faktenbasierte Argumentation.',
    culturalTone: 'Deutsch - Präzise, professionell, Sie-Form, qualitätsorientiert',
    siteLanguageLabel: 'Die Website MUSS 100% auf Deutsch sein'
  },
  'it': {
    promptLanguage: 'Italiano',
    nativeInstructions: 'Scrivi TUTTO il contenuto del sito in italiano nativo. Usa un linguaggio commerciale elegante, passionale e persuasivo.',
    persuasionStyle: 'Enfatizza qualità, tradizione, passione e artigianalità. Connessione emotiva forte.',
    culturalTone: 'Italiano - Elegante, appassionato, usa "Lei" formale, emotivo ma professionale',
    siteLanguageLabel: 'Il sito web DEVE essere 100% in Italiano'
  },
  'zh': {
    promptLanguage: '中文 (简体)',
    nativeInstructions: '用地道的简体中文撰写网站所有内容。使用专业、礼貌、有说服力的商业语言。',
    persuasionStyle: '强调信任、质量和长期关系。使用社会证明和权威背书。',
    culturalTone: '简体中文 - 专业、礼貌、注重关系、尊重传统',
    siteLanguageLabel: '网站必须100%使用简体中文'
  },
  'ja': {
    promptLanguage: '日本語',
    nativeInstructions: 'ウェブサイトのすべてのコンテンツをネイティブな日本語で書いてください。プロフェッショナルで礼儀正しく、説得力のあるビジネス言語を使用してください。',
    persuasionStyle: '品質、信頼性、おもてなしの精神を強調。控えめながら説得力のある表現。',
    culturalTone: '日本語 - 丁寧、プロフェッショナル、敬語使用、品質重視',
    siteLanguageLabel: 'ウェブサイトは100%日本語でなければなりません'
  },
  'ko': {
    promptLanguage: '한국어',
    nativeInstructions: '웹사이트의 모든 콘텐츠를 네이티브 한국어로 작성하세요. 전문적이고 정중하며 설득력 있는 비즈니스 언어를 사용하세요.',
    persuasionStyle: '품질, 신뢰, 혁신을 강조하세요. 사회적 증거와 전문성을 활용하세요.',
    culturalTone: '한국어 - 전문적, 정중한 존댓말 사용, 혁신적, 신뢰 중심',
    siteLanguageLabel: '웹사이트는 100% 한국어로 되어야 합니다'
  },
  'ar': {
    promptLanguage: 'العربية',
    nativeInstructions: 'اكتب جميع محتويات الموقع باللغة العربية الفصحى. استخدم لغة تجارية احترافية ومقنعة ومحترمة.',
    persuasionStyle: 'ركز على الثقة والجودة والعلاقات طويلة الأمد. استخدم الدليل الاجتماعي والضمانات.',
    culturalTone: 'العربية - محترم، رسمي، يركز على الثقة والجودة',
    siteLanguageLabel: 'يجب أن يكون الموقع 100% باللغة العربية'
  },
  'other': {
    promptLanguage: 'Idioma Personalizado',
    nativeInstructions: 'Escreva o conteúdo do site no idioma especificado pelo usuário. Use linguagem comercial profissional e persuasiva nativa daquele país.',
    persuasionStyle: 'Adapte o estilo de persuasão para a cultura local. Foque em benefícios e provas sociais.',
    culturalTone: 'Adapte o tom cultural para o país de destino',
    siteLanguageLabel: 'O site deve estar no idioma escolhido pelo usuário'
  }
};

export function generateAdvancedPrompt(
  formData: FromScratchFormData,
  niche: NicheContext | undefined
): string {
  const isApp = formData.projectType === 'app';
  const appNiche = isApp ? getAppNicheById(formData.nicheId) : null;
  
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
  
  // Obter adaptação cultural baseada no idioma
  const languageCode = formData.language || 'pt-BR';
  const adaptation = LANGUAGE_ADAPTATIONS[languageCode] || LANGUAGE_ADAPTATIONS['other'];
  
  const projectTypeLabel = isApp ? 'Aplicativo Web com Painel Administrativo' : 'Site Comercial / Landing Page';
  
  // Usar o contexto correto baseado no tipo de projeto
  const activeNiche = isApp ? appNiche : niche;
  const nicheName = activeNiche?.name || formData.customNiche || 'Negócio Personalizado';
  const nicheEmoji = (activeNiche as any)?.emoji || '';
  
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

  // Build the mega prompt with native language instructions
  const prompt = `# 🚀 PROJETO: ${formData.projectName.toUpperCase()}

---

## 🌍 INSTRUÇÕES CRÍTICAS DE IDIOMA E CULTURA

> ⚠️ **REGRA OBRIGATÓRIA - LEIA PRIMEIRO**

### Idioma do Site: ${adaptation.promptLanguage}
**${adaptation.siteLanguageLabel}**

### Instruções de Escrita Nativa:
${adaptation.nativeInstructions}

### Estilo de Persuasão:
${adaptation.persuasionStyle}

### Tom Cultural:
${adaptation.culturalTone}

### Regras de Copywriting Persuasivo:
1. **Headlines**: Crie títulos impactantes que capturam atenção imediata e prometem benefícios claros
2. **Subheadlines**: Expanda o benefício principal e gere curiosidade
3. **Body Copy**: Use linguagem emocional, conte histórias, mostre transformação
4. **CTAs**: Botões com verbos de ação específicos e urgência natural
5. **Provas Sociais**: Depoimentos, números, logos de clientes (placeholders realistas)
6. **Escassez/Urgência**: Use com naturalidade e autenticidade, sem parecer forçado
7. **Benefícios > Features**: Sempre traduza funcionalidades em benefícios para o usuário
8. **Objeções**: Antecipe e responda objeções comuns do público-alvo

### ❌ PROIBIDO:
- Tradução literal de textos genéricos
- Linguagem robótica ou de IA
- Frases clichês sem personalização
- Textos vagos sem benefícios concretos
- Lorem ipsum ou placeholders vazios (use textos reais persuasivos)

---

## 📋 BRIEFING EXECUTIVO

Este é um projeto de **\${projectTypeLabel}** para \${formData.companyName}, atuando no segmento de **\${nicheName}**\${formData.cityRegion ? \`, localizado em \${formData.cityRegion}\` : ''}. O objetivo é criar uma presença digital completa e profissional que \${isApp ? 'inclua funcionalidades de gestão e painel administrativo' : 'maximize conversões e gere leads qualificados'}.

---

## 🎯 CONTEXTO DO NEGÓCIO

| Campo | Valor |
|-------|-------|
| **Nome do Projeto** | \${formData.projectName} |
| **Empresa/Estabelecimento** | \${formData.companyName} |
| **Slogan** | \${formData.slogan || 'A definir'} |
| **Tipo de Projeto** | \${projectTypeLabel} |
| **Segmento/Nicho** | \${nicheName} \${nicheEmoji} |
| **Localização** | \${formData.cityRegion || 'A definir'} |
| **Público-Alvo** | \${formData.targetAudience || 'A definir'} |
| **Idioma do Site** | ${adaptation.promptLanguage} |
| **Moeda** | \${currency?.symbol || ''} \${currency?.name || formData.currency} |

---

## 💡 CONTEXTO ESPECÍFICO DO \${isApp ? 'SISTEMA' : 'NICHO'}

\${activeNiche?.contextPrompt || \`Este é um projeto personalizado que requer atenção especial às necessidades específicas do negócio. O design deve refletir a identidade da marca e os valores da empresa. Funcionalidades devem ser adaptadas ao modelo de negócio específico.\`}

\${isApp && appNiche ? \`
### Entidades de Dados Principais:
\${appNiche.databaseEntities?.map(e => \`- \${e}\`).join('\\n') || '- A definir'}

### Perfis de Usuário:
\${appNiche.userRoles?.map(r => \`- \${r}\`).join('\\n') || '- admin'}
\` : ''}

\${!isApp && niche ? \`
### Palavras-chave SEO Sugeridas:
\${niche.seoKeywords.map(kw => \`\\\`\${kw}\\\`\`).join(', ')}

### Seções Típicas do Segmento:
\${niche.commonSections.map(s => \`- \${s}\`).join('\\n')}
\` : ''}

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

${generateBackendRequirementsSection(niche, appNiche)}

---

## 📱 REQUISITOS TÉCNICOS

### Stack Recomendada:
${formData.codeStyle === 'traditional' ? `- **Backend**: PHP 8+ com MVC simples ou Laravel
- **Frontend**: HTML5 semântico + CSS3 moderno + JavaScript ES6+
- **Banco de Dados**: MySQL 8+ ou MariaDB
- **Styling**: CSS3 com variáveis customizadas (custom properties) + Flexbox/Grid
- **Animações**: CSS transitions/animations + ScrollReveal ou AOS.js
- **Formulários**: Validação PHP server-side + JavaScript client-side
- **Build**: Sem build tool - arquivos diretos (.php, .html, .css, .js)
${isApp ? `- **Auth**: Sessions PHP com bcrypt para senhas
- **ORM**: PDO prepared statements para segurança` : `- **SEO**: Meta tags nativas, sitemap.xml, robots.txt
- **Forms**: PHP mail() ou PHPMailer para envio de emails`}` : `- **Frontend**: React 18+ com TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Build**: Vite
${isApp ? `- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **State**: TanStack Query para cache e sincronização` : `- **Forms**: React Hook Form + Zod
- **SEO**: Meta tags dinâmicas, sitemap, robots.txt`}`}

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
${(() => {
  const devices = [];
  if (formData.responsiveMobile) devices.push('Mobile (< 640px)');
  if (formData.responsiveTablet) devices.push('Tablet (640px - 1024px)');
  if (formData.responsiveDesktop) devices.push('Desktop (1024px - 1440px)');
  if (formData.responsiveLargeScreen) devices.push('Large Screen (> 1440px)');
  return devices.length > 0 ? `
- **Dispositivos Suportados**: ${devices.join(', ')}
- **Mobile First**: ${formData.responsiveMobile ? 'Sim - Design primário para mobile' : 'Não - Desktop First'}
- **Breakpoints Personalizados**: 
${formData.responsiveMobile ? '  - Mobile: < 640px (layout single-column, touch-friendly)' : ''}
${formData.responsiveTablet ? '  - Tablet: 640px - 1024px (layout adaptado, suporte touch + mouse)' : ''}
${formData.responsiveDesktop ? '  - Desktop: 1024px - 1440px (layout full, hover states, sidebar)' : ''}
${formData.responsiveLargeScreen ? '  - Large Screen: > 1440px (max-width container, layout otimizado para monitores grandes)' : ''}
- **Touch Friendly**: ${formData.responsiveMobile || formData.responsiveTablet ? 'Áreas de toque mínimo de 44px' : 'N/A'}
- **Gestos**: ${formData.responsiveMobile ? 'Suporte a swipe onde aplicável' : 'N/A'}` : '- Responsividade padrão com breakpoints básicos';
})()}

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

${getAISpecificInstructions(formData.targetAI, formData.otherAI, isApp, formData.codeStyle)}

---

## 📝 NOTAS ADICIONAIS

- Priorizar experiência do usuário em todas as decisões
- Código limpo, legível e bem documentado
- Seguir convenções e padrões do ecossistema React
- Componentes devem ser reutilizáveis e testáveis
- Performance é prioridade desde o início
- Design responsivo não é opcional, é obrigatório
- **IMPORTANTE**: Todo texto do site deve ser escrito em ${adaptation.promptLanguage} com tom ${adaptation.culturalTone}
- Textos devem ser persuasivos, nativos e comerciais - NÃO USE tradução literal

---

## 📅 METADADOS

| Campo | Valor |
|-------|-------|
| **Gerado em** | ${timestamp} |
| **IA Destino** | ${targetAI?.name || formData.otherAI || 'Não especificada'} |
| **Tipo de Projeto** | ${projectTypeLabel} |
| **Nicho** | ${niche?.name || formData.customNiche || 'Personalizado'} |
| **Idioma Nativo** | ${adaptation.promptLanguage} |
| **Tom Cultural** | ${adaptation.culturalTone} |
| **Versão do Prompt** | 2.1 - Ultra-Completo + Idioma Nativo |

---

## 🎯 LEMBRETE FINAL PARA A IA

> **${adaptation.siteLanguageLabel}**
> 
> Todos os textos (headlines, CTAs, descrições, botões, menus, footer, etc.) devem ser escritos como se fossem criados por um copywriter nativo e experiente do país de destino. O objetivo é maximizar conversões com linguagem que ressoe naturalmente com o público local.

---

*Este prompt foi gerado pelo Sistema Genesis-IA e contém todas as especificações necessárias para criar um projeto profissional e completo. Execute cada seção cuidadosamente para garantir um resultado de alta qualidade.*
`;

  return prompt.trim();
}

function getAISpecificInstructions(targetAI: string, otherAI?: string, isApp?: boolean, codeStyle?: string): string {
  const isTraditional = codeStyle === 'traditional';
  
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
${isApp ? '- Ative Lovable Cloud para backend com Supabase integrado\n- Use Edge Functions para lógica de backend\n- Configure RLS para segurança dos dados' : ''}
> **Nota**: Lovable trabalha exclusivamente com código moderno (React + TypeScript).`,

    'cursor': `### Para Cursor:
${isTraditional ? `- Crie a estrutura de pastas: /public, /src, /includes, /assets
- Configure o servidor PHP local para desenvolvimento
- Use PDO para acesso seguro ao banco de dados MySQL
- Implemente MVC simplificado com controllers e views
- CSS3 com variáveis customizadas para o design system
- JavaScript ES6+ modular com import/export
- Validação dupla: client-side (JS) + server-side (PHP)
- .htaccess para URLs amigáveis e redirecionamentos` : `- Configure o projeto com Vite + React + TypeScript
- Instale Tailwind CSS e configure corretamente
- Adicione Shadcn/UI manualmente via CLI
- Use Framer Motion para animações
- Estruture o projeto seguindo convenções de pasta
- Configure ESLint e Prettier
- Crie .env para variáveis de ambiente`}
${isApp ? (isTraditional ? '- Configure MySQL com migrations manuais\n- Implemente autenticação com PHP sessions + bcrypt' : '- Configure Supabase client separadamente\n- Implemente autenticação com @supabase/auth-helpers-react\n- Crie migrations SQL para o schema') : ''}`,

    'antigravity': `### Para Google Antigravity:
- Antigravity é uma IDE agêntica - forneça instruções claras e de alto nível
- Deixe o agente autônomo planejar a arquitetura e executar
- Use Gemini 3 Pro integrado para máxima qualidade
${isTraditional ? `- Peça estrutura PHP 8+ com MVC e PDO
- Configure Apache/Nginx virtual host
- Implemente autoloader PSR-4
- CSS modular com metodologia BEM ou SMACSS
- JavaScript vanilla com modules e bundling mínimo
- MySQL com migrations versionadas` : `- Stack recomendada: React + TypeScript + Tailwind + Vite
- Aproveite a capacidade de teste autônomo do Antigravity
- Configure CI/CD diretamente na IDE
- Use o terminal integrado para dependências`}
- Antigravity valida e testa código automaticamente - confie no pipeline
${isApp ? (isTraditional ? '- Peça ao agente para criar o schema MySQL completo\n- Implemente CRUD com prepared statements' : '- Configure Supabase ou backend preferido\n- Peça ao agente para implementar auth + CRUD completo') : ''}`,

    'windsurf': `### Para Windsurf:
${isTraditional ? `- Estruture com PHP 8+ e padrão MVC
- Use PDO para queries seguras
- CSS3 moderno com Grid e Flexbox
- JavaScript modular com ES6+
- Configure .env para credenciais` : `- Configure o projeto com Vite + React + TypeScript
- Instale Tailwind e Shadcn/UI
- Use os flows de IA para refatoração
- Aproveite o Cascade para edições multi-arquivo`}
${isApp ? (isTraditional ? '- Implemente autenticação PHP com sessions\n- MySQL com índices otimizados' : '- Configure Supabase para backend\n- Implemente auth e RLS') : ''}`,

    'trae': `### Para Trae (ByteDance):
- Trae possui agentes autônomos avançados - use instruções de alto nível
- Aproveite o Builder Mode para geração completa do projeto
${isTraditional ? `- Peça estrutura PHP 8+ profissional com:
  - Autoloading PSR-4
  - Router simples para URLs limpas
  - PDO wrapper para banco de dados
  - Template engine básica (ou PHP puro com includes)
  - CSS3 com variáveis customizadas
  - JavaScript ES6+ modular
  - Validação server-side rigorosa` : `- Stack: React + TypeScript + Tailwind CSS + Vite
- Use Shadcn/UI para componentes prontos
- Framer Motion para animações
- Configure ESLint + Prettier`}
- Trae suporta contexto de projeto completo - envie todo o briefing
${isApp ? (isTraditional ? '- MySQL com PDO prepared statements\n- Sessions PHP seguras com CSRF tokens\n- CRUD completo com soft-delete' : '- Supabase para auth + database\n- TanStack Query para state management\n- RLS policies para segurança') : ''}`,

    'replit': `### Para Replit:
${isTraditional ? `- Use o template PHP do Replit
- Configure MySQL via banco integrado ou externo
- Estrutura MVC com arquivos PHP diretos
- CSS3 + JavaScript ES6 sem build tools
- Deploy automático do Replit` : `- Use o template React do Replit
- Configure Tailwind CSS no projeto
- Instale dependências via shell
- Deploy automático integrado`}
${isApp ? '- Configure banco de dados via painel\n- Implemente auth com o stack escolhido' : ''}`,

    'v0': `### Para v0 (Vercel):
- O v0 gera componentes React + Tailwind
- Foque na UI visual, pois v0 é especializado nisso
- Use os componentes gerados como base
- Componentes saem prontos para Next.js
- Adapte para Vite se necessário
> **Nota**: v0 trabalha exclusivamente com código moderno (React + Tailwind).
${isApp ? '- Integre com Vercel Postgres ou Supabase após geração\n- Configure API routes separadamente' : ''}`,

    'bolt': `### Para Bolt.new:
${isTraditional ? `- Bolt suporta projetos PHP/HTML/JS
- Configure a estrutura de pastas manualmente
- Use o terminal para instalar dependências PHP
- CSS3 + JS vanilla ou jQuery` : `- Bolt suporta full-stack com React + Node
- Configure o projeto inicial com as dependências
- Utilize o terminal integrado para instalar pacotes`}
${isApp ? (isTraditional ? '- Configure MySQL via variáveis de ambiente\n- Implemente auth com PHP sessions' : '- Use o backend integrado para APIs\n- Configure banco de dados via painel\n- Implemente autenticação com JWT') : ''}`,

    'chatgpt': `### Para ChatGPT:
- Peça a criação de cada arquivo individualmente
- Comece pela estrutura de pastas e configuração
${isTraditional ? `- Solicite arquivos PHP, HTML, CSS e JS separadamente
- Peça o schema MySQL primeiro
- Depois avance para controllers e views` : `- Depois avance para componentes e páginas
- Solicite explicações quando necessário`}
${isApp ? (isTraditional ? '- Solicite schema MySQL primeiro\n- Depois os controllers PHP\n- Por último as views e JS' : '- Solicite schema do banco de dados primeiro\n- Depois as APIs e autenticação\n- Por último o frontend integrado') : ''}`,

    'claude': `### Para Claude:
- Claude é excelente em gerar código limpo e bem estruturado
${isTraditional ? `- Peça a arquitetura PHP completa de uma vez
- Claude gera PHP robusto com tratamento de erros
- Solicite SQL completo com índices e foreign keys` : `- Peça componentes React bem tipados
- Claude gera TypeScript rigoroso`}
${isApp ? '- Solicite o schema e auth primeiro\n- Depois implemente por módulos' : ''}`,

    'google-studio': `### Para Google AI Studio (Gemini):
- Gemini é bom em gerar código estruturado
- Aproveite o contexto longo para projetos grandes
${isTraditional ? `- Solicite a estrutura PHP completa
- Peça SQL com views e procedures se necessário` : `- Solicite componentes React + TypeScript
- Use exemplos de código quando possível`}
${isApp ? '- Solicite diagramas de arquitetura primeiro\n- Depois implemente por módulos\n- Revise segurança ao final' : ''}`,
  };

  return instructions[targetAI] || `### Para ${otherAI || 'Outra IA'}:
- Adapte as instruções conforme a capacidade da IA escolhida
${isTraditional ? `- Siga as melhores práticas de PHP 8+ e JavaScript ES6+
- Implemente gradualmente, começando pela estrutura base` : `- Siga as melhores práticas de React e TypeScript
- Implemente gradualmente, começando pela estrutura base`}
- Revise e teste cada componente antes de avançar
${isApp ? '- Configure backend conforme a plataforma suportar\n- Priorize segurança e performance' : ''}`;
}

// NOVA FUNÇÃO: Gerar seção de requisitos de backend funcional
function generateBackendRequirementsSection(
  niche: NicheContext | undefined, 
  appNiche?: AppNicheContext | null
): string {
  const requirements = appNiche?.backendRequirements || niche?.backendRequirements;
  
  if (!requirements || requirements.length === 0) {
    return '';
  }

  const isApp = !!appNiche;
  
  const reqsFormatted = requirements.map(req => `
### ${req.name}
**${req.description}**

${req.technicalSpec}
`).join('\n');

  return `
---

## 🔧 ESPECIFICAÇÕES FUNCIONAIS DE BACKEND

> ⚠️ **IMPORTANTE**: As funcionalidades abaixo NÃO são apenas visuais. 
> Devem ser implementadas com lógica funcional completa conforme especificado.

${reqsFormatted}

### Princípios Obrigatórios:

${isApp ? `
1. **Autenticação**: Implementar com Supabase Auth - login, registro, recuperação de senha
2. **Autorização**: RLS policies para cada tabela baseadas no user_id
3. **CRUD Completo**: Todas as entidades devem ter Create, Read, Update, Delete
4. **Validação**: Zod schemas para validar dados antes de salvar
5. **Loading States**: Skeleton loading enquanto busca dados
6. **Error Handling**: Try/catch com toast de erro amigável
7. **Otimistic Updates**: Atualizar UI antes de confirmar com backend
8. **Realtime**: Usar Supabase Realtime para dados que mudam frequentemente

### Estrutura de Tabelas Supabase:

\`\`\`sql
-- Sempre incluir estes campos base:
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
user_id UUID REFERENCES auth.users(id)
\`\`\`
` : `
1. **Estado Persistente**: Usar localStorage para carrinho/dados temporários
2. **Validação de Formulários**: React Hook Form + Zod em TODOS os formulários
3. **Feedback Visual**: Loading states, toasts de sucesso/erro, skeleton loading
4. **Mobile First**: Todas as interações devem funcionar perfeitamente em mobile
5. **WhatsApp Integration**: Mensagens formatadas com emojis e estrutura clara
6. **Error Handling**: Tratar erros graciosamente com mensagens amigáveis

### Padrão de Mensagem WhatsApp:

\`\`\`typescript
function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return \`https://wa.me/55\${cleanPhone}?text=\${encodedMessage}\`;
}
\`\`\`
`}

// Abrir em nova aba
function openWhatsApp(phone: string, message: string): void {
  const link = generateWhatsAppLink(phone, message);
  window.open(link, '_blank');
}
\`\`\`
`;
}
