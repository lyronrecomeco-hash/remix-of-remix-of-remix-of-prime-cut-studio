import { EVOLUTION_TYPES, EvolutionType } from '@/components/genesis-ia/library/evolution/evolutionTypes';

export interface ProjectContext {
  name: string;
  templateName: string;
  templateSlug: string;
  platform: string;
  customSlug?: string;
  updatedAt: string;
}

export interface EvolutionAnswers {
  [key: string]: string | boolean | string[];
}

export function generateEvolutionPrompt(
  project: ProjectContext,
  evolutionType: EvolutionType,
  answers: EvolutionAnswers
): string {
  const timestamp = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Format answers into readable sections
  const formattedAnswers = evolutionType.fields
    .map((field) => {
      const value = answers[field.id];
      if (!value || (typeof value === 'string' && value.trim() === '')) return null;

      let displayValue = '';
      if (typeof value === 'boolean') {
        displayValue = value ? 'Sim' : 'Não';
      } else if (Array.isArray(value)) {
        displayValue = value.join(', ');
      } else if (field.type === 'select' && field.options) {
        const option = field.options.find((o) => o.value === value);
        displayValue = option?.label || value;
      } else {
        displayValue = String(value);
      }

      return `### ${field.label}\n${displayValue}`;
    })
    .filter(Boolean)
    .join('\n\n');

  // Get type-specific instructions
  const typeInstructions = getTypeSpecificInstructions(evolutionType.id, answers);

  // Build the prompt
  const prompt = `# 🔄 EVOLUÇÃO DE PROJETO: ${project.name}

## 📋 CONTEXTO DO PROJETO
Este é um projeto existente que precisa ser evoluído.

| Campo | Valor |
|-------|-------|
| **Nome do Projeto** | ${project.name} |
| **Template Base** | ${project.templateName} |
| **Plataforma** | ${project.platform} |
| **Última Atualização** | ${project.updatedAt} |
| **URL/Slug** | ${project.customSlug || 'N/A'} |

---

## 🎯 TIPO DE EVOLUÇÃO
**${evolutionType.title}** (${evolutionType.categoryLabel})

> ${evolutionType.description}

---

## 📝 ESPECIFICAÇÕES DA EVOLUÇÃO

${formattedAnswers}

---

## 🛠️ INSTRUÇÕES DE IMPLEMENTAÇÃO

${typeInstructions}

---

## ✅ CHECKLIST DE QUALIDADE

- [ ] Manter compatibilidade com código existente
- [ ] Seguir padrões e convenções do projeto
- [ ] Testar funcionalidade após implementação
- [ ] Documentar alterações significativas
- [ ] Verificar responsividade (mobile/desktop)
- [ ] Garantir acessibilidade básica

---

## 📅 METADATA
- **Gerado em:** ${timestamp}
- **Tipo:** ${evolutionType.id}
- **Categoria:** ${evolutionType.category}
`;

  return prompt;
}

function getTypeSpecificInstructions(
  typeId: string,
  answers: EvolutionAnswers
): string {
  const instructions: Record<string, string> = {
    'add-function': `
1. **Analise o contexto** - Entenda onde a função será implementada
2. **Crie componentes isolados** - Mantenha a modularidade do código
3. **Implemente a lógica** - Siga as especificações fornecidas
4. **Adicione feedback visual** - Loading states, mensagens de sucesso/erro
5. **Teste o fluxo completo** - Verifique todos os cenários
`,
    'fix-bug': `
1. **Reproduza o bug** - Siga os passos descritos
2. **Identifique a causa raiz** - Analise logs e comportamento
3. **Implemente a correção** - Resolva sem quebrar outras funcionalidades
4. **Adicione testes** - Previna regressões futuras
5. **Documente a solução** - Explique o que foi corrigido
`,
    'visual-ui': `
1. **Identifique o elemento** - Localize no código
2. **Faça as alterações visuais** - CSS/Tailwind conforme especificado
3. **Verifique consistência** - Mantenha o design system
4. **Teste responsividade** - Mobile, tablet e desktop
5. **Valide contraste e legibilidade** - Acessibilidade
`,
    'technical-adjustments': `
1. **Avalie o impacto** - Analise dependências e efeitos colaterais
2. **Implemente incrementalmente** - Mudanças pequenas e testáveis
3. **Meça antes e depois** - Métricas de performance se aplicável
4. **Documente configurações** - Especialmente variáveis de ambiente
5. **Teste em produção-like** - Ambiente similar ao real
`,
    integrations: `
1. **Configure credenciais** - Variáveis de ambiente para API keys
2. **Implemente wrapper/service** - Abstração para a integração
3. **Adicione tratamento de erros** - Fallbacks e retries
4. **Teste com dados reais** - Sandbox/test mode se disponível
5. **Documente endpoints** - URLs e payloads esperados
`,
    'integrate-tool': `
1. **Verifique documentação oficial** - API docs da ferramenta
2. **Configure autenticação** - API keys, OAuth, etc.
3. **Implemente integração** - SDK ou chamadas HTTP diretas
4. **Adicione logs** - Para debug e monitoramento
5. **Teste fluxo end-to-end** - Simule uso real
`,
    'adjust-function': `
1. **Entenda o comportamento atual** - Código e fluxo existente
2. **Planeje a mudança** - Minimize impacto em outras áreas
3. **Implemente modificações** - Seguindo as especificações
4. **Mantenha retrocompatibilidade** - Se possível
5. **Atualize documentação** - Reflita as mudanças
`,
    'improve-ai': `
1. **Analise o prompt atual** - System prompt e context
2. **Otimize instruções** - Clareza e especificidade
3. **Adicione exemplos** - Few-shot learning se aplicável
4. **Teste variações** - Diferentes inputs
5. **Meça qualidade** - Compare resultados antes/depois
`,
    'refactor-code': `
1. **Garanta testes** - Antes de refatorar
2. **Refatore incrementalmente** - Commits pequenos
3. **Mantenha funcionalidade** - Sem mudanças de comportamento
4. **Melhore legibilidade** - Nomes, estrutura, comentários
5. **Verifique performance** - Não introduza regressões
`,
    'add-image': `
1. **Otimize a imagem** - Compressão e formato adequado
2. **Use lazy loading** - Para imagens fora da viewport
3. **Adicione alt text** - Acessibilidade e SEO
4. **Configure srcset** - Responsividade de imagens
5. **Teste carregamento** - Performance e fallbacks
`,
    'make-pwa': `
1. **Configure manifest.json** - Nome, ícones, cores
2. **Implemente Service Worker** - Cache e offline
3. **Adicione meta tags** - PWA headers no HTML
4. **Teste instalação** - Chrome, Safari, mobile
5. **Configure workbox** - Estratégias de cache
`,
    optimization: `
1. **Meça estado atual** - Lighthouse, WebPageTest
2. **Identifique gargalos** - Maior impacto primeiro
3. **Implemente otimizações** - Uma por vez
4. **Valide melhorias** - Compare métricas
5. **Documente resultados** - Antes/depois
`,
  };

  return (
    instructions[typeId] ||
    `
1. Analise o contexto e requisitos
2. Planeje a implementação
3. Execute as mudanças necessárias
4. Teste o resultado
5. Documente as alterações
`
  );
}

export function formatPromptForCopy(prompt: string): string {
  return prompt.trim();
}
