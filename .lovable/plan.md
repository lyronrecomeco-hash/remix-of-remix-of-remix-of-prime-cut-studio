
## Plano — Páginas Legais Genesis Hub

### Páginas a criar

| Rota | Arquivo | Conteúdo |
|------|---------|----------|
| `/termos-de-uso` | `src/pages/TermosDeUso.tsx` | Termos de Uso completos (LGPD + Marco Civil) |
| `/politica-de-privacidade` | `src/pages/PoliticaDePrivacidade.tsx` | Política de Privacidade (LGPD compliant) |
| `/politica-de-cookies` | `src/pages/PoliticaDeCookies.tsx` | Política de Cookies |

### Estrutura de cada página
- Header com navegação de volta (←) + logo Genesis
- Título H1 claro
- Seções organizadas com H2/H3
- Texto profissional em português, sem juridiquês excessivo
- Placeholders administrativos claros onde faltar dado da empresa (ex: `[NOME DA EMPRESA]`, `[CNPJ]`, `[ENDEREÇO]`)
- Data de última atualização
- Design system existente (bg-background, text-foreground, tokens do index.css)
- 100% responsivo

### Rodapé atualizado
- Manter: logo Genesis, ícone Instagram, links Recursos/Planos
- Adicionar seção "Legal": Termos de Uso · Privacidade · Cookies
- Copyright: `© Genesis Hub 2026. Todos os direitos reservados.`
- Mobile: links empilhados com boa legibilidade

### Responsividade
- Desktop: 3 colunas no footer, conteúdo legal max-w-3xl centralizado
- Tablet: 2 colunas, text wrap adequado
- Mobile: 1 coluna, links empilhados, tipografia confortável

### Boas práticas legais
- LGPD (Lei 13.709/2018): controlador, finalidade, base legal, direitos do titular, canal de contato
- Marco Civil da Internet (Lei 12.965/2014): responsabilidades, guarda de registros
- Cookies: categorias (necessários, analytics, marketing), gestão de preferências
- DPO/Encarregado: campo preparado para preenchimento futuro
- Contato de privacidade: WhatsApp 5527920005215

### Fix do Site Builder
- O erro 429 é rate limit temporário da OpenAI — não é bug de código. A function já está configurada corretamente.
