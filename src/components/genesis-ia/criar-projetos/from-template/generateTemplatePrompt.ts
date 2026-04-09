import { TemplateModel } from './templateModels';
import { TemplateFormData } from './TemplateQuickForm';

export function generateTemplatePrompt(template: TemplateModel, form: TemplateFormData): string {
  const isApp = template.category === 'app';
  const projectType = isApp ? 'aplicação web completa (SPA)' : 'site profissional e moderno';
  const isTraditional = form.codeStyle === 'traditional';

  const languageInstructions = getLanguageInstructions(form.language);

  const aiName = (form as any).targetAI || 'lovable';
  const AI_PLATFORMS: Record<string, string> = {
    lovable: 'Lovable (React + Vite + Tailwind + Shadcn/UI)',
    cursor: 'Cursor IDE',
    antigravity: 'Google Antigravity (Gemini 3 Pro)',
    windsurf: 'Windsurf IDE (Codeium AI)',
    trae: 'Trae IDE (ByteDance)',
    v0: 'v0 by Vercel (Next.js + Shadcn/UI)',
    bolt: 'Bolt.new (Full-stack IA)',
    replit: 'Replit (IDE + Deploy)',
    chatgpt: 'ChatGPT (OpenAI)',
    claude: 'Claude (Anthropic)',
    'google-studio': 'Google AI Studio (Gemini)',
  };
  const platformLabel = AI_PLATFORMS[aiName] || AI_PLATFORMS.lovable;

  const stackSection = isTraditional
    ? `### Stack Técnica (Tradicional)
- **Backend**: PHP 8+ com estrutura MVC
- **Frontend**: HTML5 semântico + CSS3 moderno + JavaScript ES6+
- **Banco de Dados**: MySQL 8+ com PDO prepared statements
- **Styling**: CSS3 com custom properties, Flexbox/Grid
- **Animações**: CSS transitions + ScrollReveal/AOS.js
- **Formulários**: Validação client + server-side
- **Organização**: /includes, /assets/css, /assets/js, /config
- **Segurança**: Sanitização de inputs, CSRF tokens, XSS prevention`
    : `### Stack Técnica (Moderna)
- **React 18** com TypeScript strict mode
- **Vite 5** como bundler
- **Tailwind CSS v3** para estilização
- **Shadcn/UI** como base de componentes
- **Framer Motion** para animações
- **Lucide React** para iconografia
- **React Hook Form + Zod** para formulários
- **React Router DOM** para navegação`;

  const aiInstructions = getAIInstructions(aiName, isTraditional, isApp);

  return `# 🚀 PROJETO COMPLETO: ${form.businessName.toUpperCase()} — ${template.name.toUpperCase()}
# 📋 Plataforma: **${platformLabel}**
# 🔧 Estilo de código: **${isTraditional ? 'Tradicional (PHP/HTML/CSS/JS)' : 'Moderno (React/TypeScript/Tailwind)'}**

---

## 1. CONTEXTO DO PROJETO

Você é um desenvolvedor sênior full-stack especializado em criar ${projectType}s de alta qualidade. Crie um projeto **100% completo, funcional e pronto para produção** para **"${form.businessName}"**, no segmento de **${template.name}**.

${form.cityState ? `📍 **Localização**: ${form.cityState}` : ''}
${form.slogan ? `💬 **Slogan**: "${form.slogan}"` : ''}
${form.targetAudience ? `👥 **Público-Alvo**: ${form.targetAudience}` : ''}

**IMPORTANTE**: Este projeto deve parecer feito por uma agência profissional. Sem atalhos, sem placeholders genéricos, sem "Lorem Ipsum". Use textos realistas e profissionais no idioma selecionado.

---

## 2. IDENTIDADE VISUAL COMPLETA

### 🎨 Paleta de Cores
- **Cor Primária**: ${form.primaryColor}
- **Cor Secundária**: ${form.secondaryColor}
- **Tema Base**: Dark mode como padrão, com toggle para light mode
- **Gradientes**: Usar gradientes sutis baseados nas cores primárias

### ✏️ Tipografia
- **Família Principal**: ${form.typography}
- **Hierarquia**: H1 (40px bold) > H2 (32px semibold) > H3 (24px) > Body (16px) > Small (14px)
- **Import**: Via Google Fonts com font-display: swap

### 🎯 Design System
- **Bordas**: 8px cards, 12px modais, 9999px pills
- **Ícones**: ${isTraditional ? 'Font Awesome ou Lucide CDN' : 'Lucide React'}
- **Glassmorphism**: backdrop-blur e transparências para cards sobre backgrounds

---

## 3. ESTRUTURA DE PÁGINAS

${template.suggestedPages.map((p, i) => `${i + 1}. **${p}** — implementação completa`).join('\n')}

### Navegação
- Header sticky com blur de fundo, logo + menu + CTA
- Menu mobile hamburger com overlay animado
- Footer completo com 3-4 colunas
- Scroll suave + botão back-to-top

---

## 4. OBJETIVOS DE NEGÓCIO

${template.objectives.map(o => `- ✅ ${o}`).join('\n')}

---

## 5. FUNCIONALIDADES

${template.suggestedFeatures.map((f, i) => `### 5.${i + 1}. ${f}
- **Estados**: loading, empty, error, success
- **Responsividade**: mobile, tablet, desktop
- **Validação**: Formulários com mensagens de erro inline`).join('\n\n')}

---

## 6. STACK TÉCNICA

${stackSection}

${isApp ? `### Backend
${isTraditional ? `- PHP 8+ com PDO e sessions
- MySQL com migrations manuais
- Autenticação com bcrypt + sessions` : `- Supabase (Auth, Database, Storage, Edge Functions)
- TanStack Query para cache
- RLS policies para segurança`}` : ''}

---

## 7. RESPONSIVIDADE

| Dispositivo | Range | Abordagem |
|------------|-------|-----------|
| Mobile | 320-480px | Layout vertical, touch-first |
| Tablet | 481-768px | Grid 2 colunas |
| Desktop | 769-1024px | Layout completo |
| Large | 1025px+ | Max-width container |

---

## 8. SEO & PERFORMANCE

- Meta tags: title, description, og:image
- HTML Semântico, único H1
- JSON-LD para LocalBusiness
- Lazy loading em imagens
- Lighthouse > 90

---

${languageInstructions}

---

${form.additionalDescription ? `## 10. REQUISITOS ADICIONAIS

${form.additionalDescription}

---` : ''}

## 🤖 INSTRUÇÕES PARA ${platformLabel.toUpperCase()}

${aiInstructions}

---

## CHECKLIST FINAL

- [ ] Todas as páginas navegáveis
- [ ] 100% responsivo
- [ ] Formulários validados
- [ ] CTAs funcionando
- [ ] SEO implementado
- [ ] Zero erros no console
- [ ] Textos no idioma selecionado
- [ ] Imagens com lazy loading e alt text

---

*Prompt gerado pelo Genesis-IA. Execute cada seção para resultado profissional.*`.trim();
}

function getAIInstructions(aiName: string, isTraditional: boolean, isApp: boolean): string {
  const instructions: Record<string, string> = {
    'lovable': `- Stack padrão: React + TypeScript + Vite + Tailwind + Shadcn/UI
- Use Framer Motion para animações
- Organize em src/components/ e src/pages/
> Nota: Lovable trabalha exclusivamente com código moderno.`,

    'cursor': isTraditional
      ? `- Crie estrutura PHP MVC: /public, /src, /includes, /assets
- PDO para acesso ao banco MySQL
- CSS3 com variáveis + JS ES6+ modular
- .htaccess para URLs amigáveis`
      : `- Configure Vite + React + TypeScript + Tailwind
- Instale Shadcn/UI via CLI
- Configure ESLint e Prettier`,

    'antigravity': `- IDE agêntica - forneça instruções de alto nível
- Gemini 3 Pro integrado para máxima qualidade
${isTraditional ? '- Peça estrutura PHP 8+ com MVC e PDO\n- CSS modular com BEM/SMACSS' : '- React + TypeScript + Tailwind + Vite'}
- Antigravity valida e testa automaticamente`,

    'windsurf': isTraditional
      ? `- PHP 8+ com MVC, PDO para queries
- CSS3 moderno com Grid e Flexbox
- JavaScript modular ES6+`
      : `- Vite + React + TypeScript + Tailwind
- Use Cascade para edições multi-arquivo`,

    'trae': `- Agentes autônomos - use instruções de alto nível
- Builder Mode para geração completa
${isTraditional ? '- PHP 8+ com autoloading PSR-4, PDO wrapper, template engine' : '- React + TypeScript + Tailwind + Shadcn/UI'}
- Envie todo o briefing como contexto`,

    'v0': `- v0 gera componentes React + Tailwind
- Foque na UI visual
- Componentes prontos para Next.js
> Nota: v0 trabalha exclusivamente com código moderno.`,

    'bolt': isTraditional
      ? `- Estruture com PHP/HTML/JS
- Configure pastas manualmente
- CSS3 + JS vanilla`
      : `- Full-stack React + Node
- Terminal integrado para pacotes`,

    'replit': isTraditional
      ? `- Template PHP do Replit
- MySQL via banco integrado
- Deploy automático`
      : `- Template React do Replit
- Configure Tailwind
- Deploy automático integrado`,

    'chatgpt': `- Peça cada arquivo individualmente
${isTraditional ? '- Solicite PHP, HTML, CSS e JS separados\n- Schema MySQL primeiro' : '- Comece por configuração, depois componentes'}`,

    'claude': `- Claude gera código limpo e bem estruturado
${isTraditional ? '- Peça arquitetura PHP completa\n- SQL com índices e foreign keys' : '- Componentes React bem tipados'}`,

    'google-studio': `- Contexto longo para projetos grandes
${isTraditional ? '- Estrutura PHP completa\n- SQL com views/procedures' : '- Componentes React + TypeScript'}`,
  };

  return instructions[aiName] || `- Adapte as instruções para a IA escolhida
${isTraditional ? '- Siga melhores práticas PHP 8+ e JS ES6+' : '- Siga melhores práticas React e TypeScript'}`;
}

function getLanguageInstructions(language: string): string {
  const map: Record<string, string> = {
    'Portugues (Brasil)': `## IDIOMA E LOCALIZAÇÃO
- Todo o conteúdo em **Português Brasileiro**
- Tom: profissional mas acessível
- Formatação BR: datas (dd/mm/aaaa), moeda (R$), tel (+55)
- WhatsApp flutuante`,

    'Portugues (Portugal)': `## IDIOMA E LOCALIZAÇÃO
- Todo o conteúdo em **Português de Portugal**
- Tom: formal e profissional
- Formatação portuguesa: datas (dd/mm/aaaa), moeda (€)`,

    'English (US)': `## LANGUAGE & LOCALIZATION
- All content in **American English**
- Tone: professional, confident
- US formatting: dates (mm/dd/yyyy), currency ($)`,

    'Espanol': `## IDIOMA Y LOCALIZACIÓN
- Todo el contenido en **Español**
- Tono: profesional, cercano
- Formato: fechas (dd/mm/aaaa)`,

    'Francais': `## LANGUE ET LOCALISATION
- Tout le contenu en **Français**
- Ton: professionnel et élégant
- Format: dates (jj/mm/aaaa), devise (€)`,

    'Italiano': `## LINGUA E LOCALIZZAZIONE
- Tutto il contenuto in **Italiano**
- Tono: professionale ed elegante
- Formato: date (gg/mm/aaaa), valuta (€)`,

    'Deutsch': `## SPRACHE UND LOKALISIERUNG
- Alle Inhalte auf **Deutsch**
- Ton: professionell
- Format: Datum (TT.MM.JJJJ), Währung (€)`,
  };

  return map[language] || map['Portugues (Brasil)'];
}
