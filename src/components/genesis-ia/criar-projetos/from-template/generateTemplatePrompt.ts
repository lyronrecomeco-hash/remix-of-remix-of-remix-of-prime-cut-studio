import { TemplateModel } from './templateModels';
import { TemplateFormData } from './TemplateQuickForm';

export function generateTemplatePrompt(template: TemplateModel, form: TemplateFormData): string {
  const isApp = template.category === 'app';
  const projectType = isApp ? 'aplicação web completa (SPA)' : 'site profissional e moderno';

  const languageInstructions = getLanguageInstructions(form.language);

  const aiName = (form as any).targetAI || 'lovable';
  const AI_PLATFORMS: Record<string, string> = {
    lovable: 'Lovable (React + Vite + Tailwind + Shadcn/UI)',
    cursor: 'Cursor IDE (React + Vite + Tailwind)',
    v0: 'v0 by Vercel (Next.js + Shadcn/UI)',
    bolt: 'Bolt.new (Full-stack IA Environment)',
    windsurf: 'Windsurf IDE (Codeium AI)',
  };
  const platformLabel = AI_PLATFORMS[aiName] || AI_PLATFORMS.lovable;

  return `# 🚀 PROJETO COMPLETO: ${form.businessName.toUpperCase()} — ${template.name.toUpperCase()}
# 📋 Plataforma de destino: **${platformLabel}**

---

## 1. CONTEXTO DO PROJETO

Você é um desenvolvedor sênior full-stack especializado em criar ${projectType}s de alta qualidade. Crie um projeto **100% completo, funcional e pronto para produção** para **"${form.businessName}"**, no segmento de **${template.name}**.

${form.cityState ? `📍 **Localização**: ${form.cityState}` : ''}
${form.slogan ? `💬 **Slogan**: "${form.slogan}"` : ''}

**IMPORTANTE**: Este projeto deve parecer feito por uma agência profissional. Sem atalhos, sem placeholders genéricos, sem "Lorem Ipsum". Use textos realistas e profissionais no idioma selecionado.

---

## 2. IDENTIDADE VISUAL COMPLETA

### 🎨 Paleta de Cores
- **Cor Primária**: ${form.primaryColor}
- **Cor Secundária**: ${form.secondaryColor}
- **Tema Base**: Dark mode como padrão, com toggle para light mode
- **Variações**: Gerar tons claros e escuros automaticamente a partir das cores primária/secundária
- **Contraste**: Garantir WCAG AA em todas as combinações de texto/fundo
- **Gradientes**: Usar gradientes sutis baseados nas cores primárias para CTAs e headers

### ✏️ Tipografia
- **Família Principal**: ${form.typography}
- **Hierarquia completa**:
  - H1: 2.5rem (40px), bold, tracking tight
  - H2: 2rem (32px), semibold
  - H3: 1.5rem (24px), semibold
  - H4: 1.25rem (20px), medium
  - Body: 1rem (16px), regular, line-height 1.7
  - Small: 0.875rem (14px), regular
  - Caption: 0.75rem (12px), medium
- **Importar a fonte**: Via Google Fonts com font-display: swap

### 🎯 Design System
- **Bordas**: border-radius 8px para cards, 12px para modais, 9999px para pills
- **Sombras**: 3 níveis (sm, md, lg) usando HSL com opacidade
- **Espaçamentos**: Sistema de 4px/8px (p-1, p-2, p-4, p-6, p-8)
- **Animações**: Framer Motion para transições de página (200-300ms), hover states suaves
- **Glassmorphism**: Usar backdrop-blur e transparências para cards sobre backgrounds
- **Ícones**: Lucide React exclusivamente, tamanhos consistentes (w-4 h-4 para inline, w-5 h-5 para botões, w-6 h-6 para features)

---

## 3. ESTRUTURA DE PÁGINAS E NAVEGAÇÃO

### Páginas obrigatórias:
${template.suggestedPages.map((p, i) => `${i + 1}. **${p}** — implementação completa com todos os estados`).join('\n')}

### Sistema de Navegação
- **Header**: Sticky com blur de fundo, logo à esquerda, menu centralizado, CTA à direita
- **Menu Mobile**: Hamburger com overlay animado (slide da direita), links com ícones
- **Active State**: Indicador visual no item de menu atual (underline animada ou cor)
- **Scroll**: scroll-behavior smooth, scroll-spy para highlights de seção
- **Footer**: Completo com 3-4 colunas (Sobre, Links, Contato, Redes Sociais)
- **Breadcrumbs**: Em páginas internas quando aplicável
- **Back to Top**: Botão flutuante que aparece após scroll

---

## 4. OBJETIVOS DE NEGÓCIO

O projeto deve atender a estes objetivos estratégicos:
${template.objectives.map(o => `- ✅ ${o}`).join('\n')}

---

## 5. FUNCIONALIDADES — IMPLEMENTAÇÃO DETALHADA

Cada funcionalidade deve ser **100% funcional** com todos os estados:

${template.suggestedFeatures.map((f, i) => `### 5.${i + 1}. ${f}
- **Estados**: loading (skeleton), empty (ilustração + mensagem), error (retry button), success
- **Responsividade**: Adaptar layout para mobile, tablet e desktop
- **Acessibilidade**: aria-labels, keyboard navigation, focus indicators
- **Validação**: Formulários com React Hook Form + Zod, mensagens de erro inline
- **Feedback**: Toast notifications para ações, confirmação para ações destrutivas
- **Performance**: Lazy loading quando abaixo do fold`).join('\n\n')}

---

## 6. STACK TÉCNICA OBRIGATÓRIA

### Frontend (Lovable)
- **React 18** com TypeScript strict mode
- **Vite 5** como bundler
- **Tailwind CSS v3** para toda estilização (sem CSS modules, sem styled-components)
- **Shadcn/UI** como base de componentes (Button, Card, Dialog, Input, Select, Toast, etc.)
- **Framer Motion** para todas as animações e transições
- **Lucide React** para iconografia
- **React Hook Form + Zod** para formulários e validação
- **React Router DOM** para navegação entre páginas
- **Recharts** para gráficos quando necessário
- **date-fns** para formatação de datas

${isApp ? `### Backend (Supabase — via Lovable Cloud)
- **Autenticação**: Supabase Auth com email/senha
- **Database**: PostgreSQL com tabelas normalizadas e RLS policies
- **Edge Functions**: Para lógica server-side e integrações
- **Storage**: Para uploads de arquivos/imagens
- **Realtime**: Para funcionalidades em tempo real quando aplicável

### Tabelas Sugeridas
- users/profiles (dados do usuário)
- Tabelas específicas do nicho baseadas nas funcionalidades
- Logs/analytics para acompanhamento
` : ''}

### Padrões de Código
- Componentes **pequenos, focados e reutilizáveis** (máx 150 linhas)
- Custom hooks para lógica compartilhada
- TypeScript estrito — **zero \`any\`**
- Organização por feature: \`/components/[feature]/\`
- Separação clara: \`components/ hooks/ utils/ types/ lib/\`
- Naming: PascalCase para componentes, camelCase para funções, UPPER_CASE para constantes

---

## 7. RESPONSIVIDADE COMPLETA

### Breakpoints
| Dispositivo | Range | Abordagem |
|------------|-------|-----------|
| Mobile | 320px — 480px | Layout vertical, touch-first |
| Tablet | 481px — 768px | Grid 2 colunas, menus adaptados |
| Desktop | 769px — 1024px | Layout completo, 3+ colunas |
| Large | 1025px+ | Max-width container, espaçamento generoso |

### Regras Obrigatórias
- **Mobile-first** approach em todo CSS
- Touch targets mínimo **44x44px** em mobile
- Nenhum scroll horizontal acidental
- Imagens responsivas com aspect-ratio
- Tipografia fluida com clamp() quando necessário
- Menu hamburger no mobile com overlay suave

---

## 8. SEO & PERFORMANCE

### SEO Técnico
- **Meta tags**: title (<60 chars), description (<160 chars), og:image, og:title, og:description
- **HTML Semântico**: header, main, nav, section, article, aside, footer
- **Heading hierarchy**: Único H1 por página, H2-H6 sequenciais
- **Alt text**: Em 100% das imagens
- **JSON-LD**: Schema.org para LocalBusiness ou tipo apropriado
- **Canonical**: Tags em todas as páginas

### Performance
- **Lazy loading**: Todas as imagens abaixo do fold
- **Code splitting**: React.lazy + Suspense por rota
- **Font loading**: font-display: swap
- **Bundle**: Tree shaking automático do Vite
- **Target**: Lighthouse > 90 em Performance, Accessibility, Best Practices, SEO

---

${languageInstructions}

---

${form.additionalDescription ? `## 9. REQUISITOS ADICIONAIS DO CLIENTE

${form.additionalDescription}

---

## 10. CHECKLIST DE QUALIDADE` : '## 9. CHECKLIST DE QUALIDADE'}

Antes de finalizar, verificar TODOS os itens:

- [ ] Todas as páginas implementadas e navegáveis
- [ ] 100% responsivo (testar em 320px, 768px, 1024px, 1440px)
- [ ] Formulários com validação visual e mensagens de erro claras
- [ ] CTA principal funcionando (WhatsApp, agendamento, etc.)
- [ ] SEO básico implementado (meta tags, schema, alt texts)
- [ ] Zero erros no console do browser
- [ ] Animações suaves e não intrusivas (sem janks)
- [ ] Loading states em todas as ações assíncronas
- [ ] Empty states informativos com call-to-action
- [ ] Acessibilidade (keyboard nav, aria-labels, contraste)
- [ ] TypeScript sem erros de tipo
- [ ] Dark/Light mode funcionando
- [ ] Textos realistas no idioma selecionado (não Lorem Ipsum)
- [ ] Imagens com lazy loading e alt text

---

## INSTRUÇÃO FINAL

Gere o projeto **COMPLETO** seguindo **TODAS** as especificações acima. Comece pela estrutura base (layout, design system, navegação) e implemente cada funcionalidade incrementalmente. 

**Prioridades**:
1. Design System e Layout base
2. Navegação e rotas
3. Páginas principais com conteúdo realista
4. Formulários e interações
5. SEO e otimizações
6. Polish final (animações, micro-interações)

O resultado deve parecer um **produto profissional** pronto para um cliente real. Use placeholders de alta qualidade para imagens (Unsplash URLs quando possível).`.trim();
}

function getLanguageInstructions(language: string): string {
  const map: Record<string, string> = {
    'Portugues (Brasil)': `## IDIOMA E LOCALIZAÇÃO
- Todo o conteúdo do site em **Português Brasileiro**
- Tom: profissional mas acessível, levemente informal
- CTAs persuasivos: "Faça seu pedido", "Agende agora", "Fale conosco"
- Formatação BR: datas (dd/mm/aaaa), moeda (R$), telefone (+55 XX XXXXX-XXXX)
- Botão WhatsApp flutuante com número formatado`,

    'Portugues (Portugal)': `## IDIOMA E LOCALIZAÇÃO
- Todo o conteúdo em **Português de Portugal**
- Tom: formal e profissional
- Formatação portuguesa: datas (dd/mm/aaaa), moeda (€)`,

    'English (US)': `## LANGUAGE & LOCALIZATION
- All content in **American English**
- Tone: professional, confident, results-oriented
- US formatting: dates (mm/dd/yyyy), currency ($), phone format`,

    'Espanol': `## IDIOMA Y LOCALIZACIÓN
- Todo el contenido en **Español**
- Tono: profesional, cercano y persuasivo
- Formato: fechas (dd/mm/aaaa), moneda según país`,

    'Francais': `## LANGUE ET LOCALISATION
- Tout le contenu en **Français**
- Ton: professionnel et élégant
- Format français: dates (jj/mm/aaaa), devise (€)`,

    'Italiano': `## LINGUA E LOCALIZZAZIONE
- Tutto il contenuto in **Italiano**
- Tono: professionale ed elegante
- Formato italiano: date (gg/mm/aaaa), valuta (€)`,

    'Deutsch': `## SPRACHE UND LOKALISIERUNG
- Alle Inhalte auf **Deutsch**
- Ton: professionell und vertrauenswürdig
- Deutsches Format: Datum (TT.MM.JJJJ), Währung (€)`,
  };

  return map[language] || map['Portugues (Brasil)'];
}
