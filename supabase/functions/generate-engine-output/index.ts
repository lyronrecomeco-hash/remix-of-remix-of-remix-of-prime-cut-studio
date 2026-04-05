import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { nodes, edges, prospect_context, output_type, user_instruction } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const nodesSummary = (nodes || []).map((n: any) => {
      const type = n.data?.nodeType || n.type || 'unknown';
      const label = n.data?.label || n.type;
      const content = n.data?.content || n.data?.description || '';
      return `[${type.toUpperCase()} - ${label}]:\n${content || '(vazio)'}`;
    }).join("\n\n");

    const edgesSummary = (edges || []).map((e: any) => `${e.source} → ${e.target}`).join(", ");

    const qa = prospect_context?.questionnaire_answers || {};
    const prospectInfo = prospect_context ? `
EMPRESA: ${prospect_context.company_name || 'N/A'}
NICHO: ${prospect_context.niche || qa.niche || 'N/A'}
CONTATO: ${prospect_context.contact_name || 'N/A'}
TELEFONE: ${prospect_context.company_phone || 'N/A'}
EMAIL: ${prospect_context.company_email || 'N/A'}
CNPJ: ${prospect_context.company_cnpj || 'N/A'}
WEBSITE: ${qa.website || prospect_context.company_website || 'N/A'}
INSTAGRAM: ${qa.instagram || 'N/A'}
ENDEREÇO: ${qa.address || 'N/A'}
SERVIÇOS: ${qa.services || 'N/A'}
OBJETIVO: ${qa.objective || 'N/A'}
RESPOSTAS: ${JSON.stringify(qa)}
NOTAS: ${prospect_context.notes || 'N/A'}
` : 'Sem contexto de prospect';

    // ─── BUILD STRUCTURE ───
    if (output_type === 'build_structure') {
      const structurePrompt = `Você é o Genesis Engine, um motor de conversão e planejamento estratégico. Analise o prospect e gere uma estrutura de blocos para o canvas.

CONTEXTO DO PROSPECT:
${prospectInfo}

BLOCOS JÁ EXISTENTES NO CANVAS:
${nodesSummary || 'Apenas o bloco Prospect inicial'}

CONEXÕES EXISTENTES:
${edgesSummary || 'Nenhuma'}

${user_instruction ? `INSTRUÇÃO DO USUÁRIO: ${user_instruction}` : ''}

TIPOS DE BLOCOS DISPONÍVEIS (use EXATAMENTE estes types):
- diagnosis: Diagnóstico da situação atual
- pain: Dor principal do cliente
- opportunity: Oportunidade identificada
- strategy: Estratégia de conversão
- offer: Oferta/proposta de valor
- differentials: Diferenciais competitivos
- objections: Objeções e respostas
- approach: Estratégia de abordagem
- scope: Escopo técnico
- structure: Estrutura técnica (frontend/backend/DB)
- integrations: Integrações e APIs
- automation: Automações
- followup: Follow-up comercial
- checklist: Checklist de implementação
- deploy: Estratégia de entrega
- prompt: Prompt final consolidado
- notes: Notas gerais

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`, sem texto antes ou depois) com esta estrutura:
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "diagnosis",
      "label": "Nome do bloco",
      "content": "Conteúdo detalhado, útil e específico para este prospect. Preencha com análise real baseada nos dados disponíveis.",
      "position": { "x": 400, "y": 100 }
    }
  ],
  "edges": [
    { "source": "prospect-1", "target": "unique-id" }
  ]
}

REGRAS OBRIGATÓRIAS:
1. Crie entre 6 e 10 blocos baseados no contexto REAL do prospect
2. NÃO crie blocos que já existem no canvas
3. Preencha CADA bloco com conteúdo relevante e específico (mínimo 3 linhas por bloco)
4. Posicione em grid organizado: coluna 1 (x=400), coluna 2 (x=700), coluna 3 (x=1000), linhas com y espaçados de ~180px começando em y=80
5. Conecte ao prospect-1 e entre si em ordem lógica de fluxo
6. Siga esta ordem: diagnóstico → dor → oportunidade → estratégia → oferta → escopo → estrutura → deploy
7. O conteúdo deve ser ACIONÁVEL e não genérico. Use dados reais do prospect
8. Para cada bloco, preencha campos estruturados separados por linhas. Ex para "automation": "Tipo: WhatsApp automático\\nGatilho: Novo agendamento\\nAção: Enviar confirmação\\nCanal: WhatsApp\\nDelay: Imediato"`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: structurePrompt }],
          stream: true,
        }),
      });

      if (!response.ok) {
        const t = await response.text();
        console.error("AI gateway error:", response.status, t);
        return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
          status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // ─── ENRICH CONTEXT ───
    if (output_type === 'enrich_context') {
      const enrichPrompt = `Você é um analista de negócios digital especialista. Analise o prospect abaixo e enriqueça o contexto com insights estratégicos.

DADOS DO PROSPECT:
${prospectInfo}

BLOCOS DO CANVAS:
${nodesSummary || 'Nenhum'}

${user_instruction ? `INSTRUÇÃO: ${user_instruction}` : ''}

Gere uma análise completa em formato estruturado:

## PERFIL DO NEGÓCIO
- Tipo de negócio e posicionamento
- Público-alvo provável
- Modelo de receita
- Maturidade digital estimada (1-10)

## PRESENÇA DIGITAL
- Análise do website (se informado)
- Análise de redes sociais (se informado)
- Pontos fortes da presença atual
- Lacunas críticas

## OPORTUNIDADES COMERCIAIS
- Serviços mais indicados para vender
- Ticket estimado (mínimo e máximo)
- Recorrência possível
- Urgência percebida

## DORES PROVÁVEIS
- Top 5 dores mais prováveis baseadas no nicho
- Impacto de cada dor no faturamento
- Argumento comercial para cada dor

## CONCORRÊNCIA E DIFERENCIAÇÃO
- Como negócios similares se posicionam
- Oportunidades de diferenciação
- Benchmarks do nicho

## BRANDING SUGERIDO
- Paleta de cores recomendada (hex codes)
- Estilo visual sugerido
- Tom de comunicação
- Referências de design

Seja específico e use dados do prospect. Nada genérico.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: enrichPrompt }],
          stream: true,
        }),
      });

      if (!response.ok) {
        const t = await response.text();
        console.error("AI gateway error:", response.status, t);
        return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
          status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // ─── TEXT-BASED OUTPUTS ───
    const outputInstructions: Record<string, string> = {
      prompt: `Gere um BUILD SPEC COMPLETO e ULTRA DETALHADO — um prompt profissional pronto para criar a solução inteira com IA de desenvolvimento.

O prompt DEVE cobrir TODAS as seções abaixo com profundidade máxima:

## 1. VISÃO GERAL DO PROJETO
- Nome do projeto, objetivo principal, público-alvo, proposta de valor
- Problema que resolve, modelo de negócio

## 2. FRONTEND
- Framework: React 18 + Vite + TypeScript + Tailwind CSS
- Todas as páginas e rotas (com descrição de cada tela)
- Componentes reutilizáveis, design system, paleta de cores, tipografia
- Responsividade mobile-first, animações com Framer Motion
- SEO: meta tags, Open Graph, sitemap, robots.txt
- PWA se aplicável

## 3. BACKEND COMPLETO
- Arquitetura de serviços e controllers
- APIs RESTful: TODOS os endpoints (método, rota, payload, resposta)
- Autenticação (email/senha, Google, magic link) com JWT
- Autorização: roles (admin, user, moderator), permissões por recurso
- Middlewares: auth, rate limiting, logging, error handling, CORS
- Validações com Zod em todas as entradas
- Workers e jobs assíncronos (quando aplicável)
- Webhooks (receber e enviar)
- Upload de arquivos e storage

## 4. BANCO DE DADOS DETALHADO
- TODAS as tabelas com campos, tipos, defaults, constraints
- Relações entre tabelas (foreign keys, indexes)
- RLS policies para cada tabela (quem pode ler, criar, editar, deletar)
- Triggers e functions (updated_at, contadores, validações)
- Seeds de dados iniciais
- Migrations em ordem

## 5. INTEGRAÇÕES
- Lista de APIs externas com endpoint, autenticação, payload
- Webhooks de entrada e saída
- Serviços de email (Resend/SendGrid), SMS, WhatsApp
- Payment gateways se aplicável
- Analytics e tracking

## 6. AUTOMAÇÕES
- Todos os fluxos automáticos: gatilho → condição → ação
- Notificações (email, push, in-app)
- Cron jobs e agendamentos
- Retry strategies e fallbacks
- Follow-up automático

## 7. PAINEL ADMINISTRATIVO
- Dashboard com métricas e gráficos
- CRUD completo de todas as entidades
- Gestão de usuários e permissões
- Logs e auditoria
- Configurações do sistema
- Exportação de dados

## 8. UX E EXPERIÊNCIA
- Fluxos do usuário (onboarding, main flow, edge cases)
- Feedback visual (loading, success, error states)
- Empty states, skeleton loaders
- Acessibilidade (ARIA, keyboard nav, contraste)
- Internacionalização (se aplicável)

## 9. PERFORMANCE E SEGURANÇA
- Cache strategy (browser, CDN, server)
- Lazy loading e code splitting
- Rate limiting por endpoint
- Proteção contra XSS, CSRF, SQL injection
- Sanitização de inputs
- Backup strategy
- Monitoramento e alertas

## 10. DEPLOY E INFRAESTRUTURA
- Ambientes: dev, staging, production
- Environment variables necessárias
- CI/CD pipeline sugerido
- Domínio e DNS
- SSL/TLS
- Rollback strategy
- Scripts de setup e terminal

## 11. TESTES
- Testes unitários para funções críticas
- Testes de integração para APIs
- Testes E2E para fluxos principais
- Cobertura mínima recomendada

## 12. ESTRUTURA DE PASTAS
- Árvore completa de diretórios e arquivos
- Convenções de nomenclatura
- Organização de features/modules

O resultado deve ser um documento COMPLETO e PRONTO PARA USO que uma IA de desenvolvimento possa seguir para construir o sistema inteiro sem ambiguidade.`,

      scope: `Gere um ESCOPO TÉCNICO COMPLETO e DETALHADO incluindo:
- Módulos do sistema com descrição detalhada
- Funcionalidades por módulo com critérios de aceite
- Tecnologias recomendadas com justificativa
- Estimativa de complexidade por módulo (horas)
- Prioridades (P0 = crítico, P1 = importante, P2 = desejável)
- Dependências entre módulos
- O que ENTRA no escopo (com detalhe)
- O que NÃO ENTRA no escopo
- Entregáveis finais
- Premissas e restrições
- Cronograma sugerido por fase`,

      blueprint: `Gere um BLUEPRINT TÉCNICO COMPLETO incluindo:
- Arquitetura geral (diagrama textual com ASCII)
- Stack de frontend com justificativa
- Stack de backend com justificativa
- Modelo de dados completo (tabelas, campos, relações, indexes)
- APIs e endpoints (método, rota, payload, resposta, auth)
- Sistema de autenticação e autorização (roles, permissions)
- Integrações externas com detalhes de implementação
- Estratégia de deploy (ambientes, CI/CD, rollback)
- Estratégia de monitoramento (logs, metrics, alertas)
- Plano de escalabilidade`,

      strategy: `Gere a MELHOR ESTRATÉGIA COMERCIAL para fechar este cliente:
- Diagnóstico comercial do cenário
- Proposta de valor clara e diferenciada
- Argumentos principais (mínimo 5)
- Objeções prováveis e contra-argumentos
- Diferenciação competitiva
- Modelo de precificação sugerido (setup + recorrência)
- Sequência de abordagem (passo a passo com timing)
- Gatilhos mentais aplicáveis
- Follow-up strategy com templates
- Métricas de sucesso do projeto para o cliente
- ROI estimado para o cliente`,

      checklist: `Gere um CHECKLIST DE IMPLEMENTAÇÃO completo organizado por fases:

## FASE 1 - SETUP (Semana 1)
- [ ] itens de configuração, ambiente, repositório, CI/CD

## FASE 2 - CORE (Semanas 2-3)
- [ ] banco de dados, auth, APIs principais

## FASE 3 - FEATURES (Semanas 3-4)
- [ ] funcionalidades do produto, integrações

## FASE 4 - ADMIN (Semana 5)
- [ ] painel admin, dashboard, gestão

## FASE 5 - POLISH (Semana 5-6)
- [ ] testes, performance, UX, acessibilidade

## FASE 6 - DEPLOY (Semana 6)
- [ ] deploy, DNS, SSL, monitoramento, backup

Cada item deve ser específico, acionável e ter critério claro de conclusão.`,

      executive: `Gere um RESUMO EXECUTIVO profissional para apresentar ao cliente:
- Contexto e diagnóstico (situação atual do negócio)
- Solução proposta (visão geral clara)
- Benefícios e impacto esperado (com números quando possível)
- Diferenciais da solução
- Cronograma resumido
- Investimento e retorno esperado
- Próximos passos
Formate para ser apresentável diretamente ao decisor. Tom profissional e confiante.`,

      analyze: `Analise TODOS os blocos do canvas, o contexto do prospect e as conexões.

Retorne:
1. DIAGNÓSTICO GERAL - estado atual do canvas e completude
2. GAPS IDENTIFICADOS - blocos e informações que faltam
3. OPORTUNIDADES - o que pode ser explorado comercialmente
4. RISCOS - pontos de atenção no projeto
5. SUGESTÕES DE MELHORIA - ações específicas para cada bloco existente
6. QUALIDADE DO CONTEÚDO - avalie se os blocos têm conteúdo suficiente
7. PRÓXIMOS PASSOS RECOMENDADOS - em ordem de prioridade
8. SCORE DE COMPLETUDE - de 0 a 100% com justificativa`,

      objections: `Analise o contexto e gere um FLUXO COMPLETO DE OBJEÇÕES:

Para cada objeção:
### OBJEÇÃO: [título]
- **Probabilidade**: Alta/Média/Baixa
- **Momento**: Quando surge no processo
- **Argumento do cliente**: O que ele diz
- **Resposta recomendada**: Como responder (com script)
- **Evidência de suporte**: Dados ou casos de sucesso
- **Contra-argumento final**: Fechamento assertivo

Liste pelo menos 8 objeções ordenadas por probabilidade.`,

      deploy_plan: `Gere um PLANO DE ENTREGA completo:

## TIMELINE
- Marcos principais com datas relativas (Semana 1, 2, etc.)

## FASES
Para cada fase:
- Objetivo claro
- Entregáveis específicos
- Critérios de aceite
- Dependências
- Riscos e mitigações

## AMBIENTE
- Staging: configuração, URL, acesso
- Produção: configuração, URL, DNS
- CI/CD: pipeline, testes automáticos

## PÓS-ENTREGA
- Monitoramento: ferramentas, alertas
- Suporte: SLA, canais, escalação
- Iterações planejadas: próximas melhorias
- Documentação: o que entregar ao cliente`,
    };

    const systemPrompt = `Você é o Genesis Engine, um motor de conversão e planejamento estratégico de alta performance.

Você analisa contextos comerciais, dados de prospects e estratégias visuais para gerar saídas altamente precisas, detalhadas e acionáveis.

CONTEXTO DO PROSPECT:
${prospectInfo}

BLOCOS DO CANVAS:
${nodesSummary || 'Nenhum bloco adicionado'}

CONEXÕES:
${edgesSummary || 'Nenhuma conexão'}

${user_instruction ? `INSTRUÇÃO ADICIONAL DO USUÁRIO: ${user_instruction}` : ''}

REGRAS:
- Responda SEMPRE em português brasileiro
- Seja EXTREMAMENTE detalhado, técnico e profissional
- Use dados REAIS do prospect (não genéricos)
- Formate com markdown (headers, listas, negrito, código)
- Cada seção deve ter conteúdo substancial
- O resultado deve ser PRONTO PARA USO, não um rascunho`;

    const userMessage = outputInstructions[output_type] || outputInstructions.prompt;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Engine error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
