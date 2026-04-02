import { TemplateModel } from './templateModels';
import { TemplateFormData } from './TemplateQuickForm';

export function generateTemplatePrompt(template: TemplateModel, form: TemplateFormData): string {
  const isApp = template.category === 'app';
  const projectType = isApp ? 'aplicação web (SPA)' : 'site profissional';

  const languageInstructions = getLanguageInstructions(form.language);

  return `# PROJETO: ${form.businessName.toUpperCase()} — ${template.name.toUpperCase()}

## CONTEXTO
Você é um desenvolvedor sênior full-stack. Crie um ${projectType} completo, funcional e pronto para produção para "${form.businessName}", no segmento de ${template.name}.
${form.cityState ? `Localização: ${form.cityState}.` : ''}
${form.slogan ? `Slogan: "${form.slogan}"` : ''}

---

## IDENTIDADE VISUAL

### Paleta de Cores
- Cor Primária: ${form.primaryColor}
- Cor Secundária: ${form.secondaryColor}
- Tema Base: Dark mode como padrão, com opção de light mode
- Garantir contraste adequado WCAG AA em todas as combinações

### Tipografia
- Família Principal: ${form.typography}
- Hierarquia: H1 a H6 bem definidos, com pesos distintos
- Body: 16px base, line-height 1.6

### Estilo Visual
- Moderno, limpo e profissional
- Bordas arredondadas (border-radius: 8-16px)
- Sombras sutis para profundidade
- Espaçamentos consistentes usando sistema de 4px/8px
- Micro-animações suaves (hover, focus, transitions 200-300ms)
- Sem exageros visuais, sem neon, sem gradientes chamativos

---

## ESTRUTURA DE PÁGINAS

Implementar as seguintes páginas/seções:
${template.suggestedPages.map(p => `- ${p}`).join('\n')}

### Navegação
- Header fixo/sticky com logo + menu
- Menu responsivo (hamburger no mobile com overlay suave)
- Active state visual no item de menu atual
- Scroll suave entre seções (scroll-behavior: smooth)
- Footer completo com links, redes sociais e informações de contato

---

## OBJETIVOS DO PROJETO

O projeto deve atender fielmente a estes objetivos:
${template.objectives.map(o => `- ${o}`).join('\n')}

---

## FUNCIONALIDADES OBRIGATÓRIAS

Cada funcionalidade deve ser implementada de forma completa e funcional:

${template.suggestedFeatures.map(f => `### ${f}
- Implementação completa com estados de loading, error e empty
- Design responsivo e consistente com o design system
- Acessibilidade (aria-labels, keyboard navigation)
- Feedback visual em todas as interações`).join('\n\n')}

---

## STACK TÉCNICA

### Frontend
- React 18 + TypeScript (strict mode)
- Vite 5 como bundler
- Tailwind CSS v3 para estilização
- Shadcn/UI como base de componentes
- Framer Motion para animações
- Lucide React para ícones
- React Hook Form + Zod para formulários
- React Router DOM para rotas

### Padrões de Código
- Componentes pequenos, focados e reutilizáveis
- Custom hooks para lógica compartilhada
- Tipagem TypeScript estrita (sem \`any\`)
- Organização por feature (pasta por funcionalidade)
- Separação clara: components/ hooks/ utils/ types/
- Código limpo, bem formatado e comentado onde necessário

${isApp ? `### Backend (se aplicável)
- Supabase como BaaS
- Autenticação com Supabase Auth
- Database PostgreSQL com RLS policies
- Edge Functions para lógica server-side
- Storage para uploads de arquivos
` : ''}
---

## RESPONSIVIDADE

### Breakpoints
- Mobile: 320px — 480px
- Tablet: 481px — 768px
- Desktop: 769px — 1024px
- Large: 1025px+

### Regras
- Mobile-first approach obrigatório
- Touch targets mínimo 44x44px em mobile
- Imagens otimizadas por viewport (srcset quando possível)
- Nenhum scroll horizontal acidental
- Teste visual em todas as dimensões

---

## SEO & PERFORMANCE

### SEO
- Meta tags completas (title, description, og:image, og:title)
- Semantic HTML5 (header, main, nav, section, article, footer)
- Heading hierarchy correto (único H1 por página)
- Alt text em todas as imagens
- Schema.org JSON-LD para o tipo de negócio
- Sitemap e robots.txt

### Performance
- Lazy loading em imagens abaixo do fold
- Code splitting por rota (React.lazy + Suspense)
- Otimização de bundle (tree shaking)
- Fontes com font-display: swap
- Target: Lighthouse > 90 em todas as métricas

---

## QUALIDADE

### Checklist obrigatório antes de entregar:
- [ ] Todas as páginas implementadas e navegáveis
- [ ] 100% responsivo (mobile, tablet, desktop)
- [ ] Formulários com validação visual e mensagens de erro
- [ ] Botão WhatsApp/CTA principal funcionando
- [ ] SEO básico implementado
- [ ] Zero erros no console do browser
- [ ] Animações suaves e não intrusivas
- [ ] Loading states em todas as ações assíncronas
- [ ] Empty states informativos
- [ ] Acessibilidade básica (keyboard nav, aria-labels)
- [ ] Código TypeScript sem erros de tipo

---

${languageInstructions}

${form.additionalDescription ? `## REQUISITOS ADICIONAIS DO CLIENTE

${form.additionalDescription}

---` : ''}

## INSTRUÇÃO FINAL

Gere o projeto completo seguindo TODAS as especificações acima. Comece pela estrutura base (layout, navegação, design system) e implemente cada funcionalidade de forma incremental. Priorize UX sobre complexidade técnica. Use placeholders realistas para textos e imagens. O resultado deve parecer um produto profissional pronto para um cliente real.`.trim();
}

function getLanguageInstructions(language: string): string {
  const map: Record<string, string> = {
    'Português (Brasil)': `## IDIOMA E LOCALIZAÇÃO
- Todo o conteúdo do site em Português Brasileiro
- Tom: profissional mas acessível, levemente informal
- CTAs persuasivos e diretos (ex: "Faça seu pedido", "Agende agora")
- Formatação brasileira: datas (dd/mm/aaaa), moeda (R$), telefone (+55)`,

    'Português (Portugal)': `## IDIOMA E LOCALIZAÇÃO
- Todo o conteúdo em Português de Portugal
- Tom: formal e profissional
- Formatação portuguesa: datas (dd/mm/aaaa), moeda (€)`,

    'English (US)': `## LANGUAGE & LOCALIZATION
- All content in American English
- Tone: professional, confident, results-oriented
- US formatting: dates (mm/dd/yyyy), currency ($), phone format`,

    'Español': `## IDIOMA Y LOCALIZACIÓN
- Todo el contenido en Español
- Tono: profesional, cercano y persuasivo
- Formato: fechas (dd/mm/aaaa), moneda según país`,

    'Français': `## LANGUE ET LOCALISATION
- Tout le contenu en Français
- Ton: professionnel et élégant
- Format français: dates (jj/mm/aaaa), devise (€)`,

    'Italiano': `## LINGUA E LOCALIZZAZIONE
- Tutto il contenuto in Italiano
- Tono: professionale ed elegante
- Formato italiano: date (gg/mm/aaaa), valuta (€)`,

    'Deutsch': `## SPRACHE UND LOKALISIERUNG
- Alle Inhalte auf Deutsch
- Ton: professionell und vertrauenswürdig
- Deutsches Format: Datum (TT.MM.JJJJ), Währung (€)`,
  };

  return map[language] || map['Português (Brasil)'];
}
