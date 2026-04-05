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
INSTAGRAM: ${qa.instagram || prospect_context.instagram || 'N/A'}
ENDEREÇO: ${qa.address || prospect_context.company_address || 'N/A'}
CIDADE: ${qa.city || prospect_context.company_city || 'N/A'}
ESTADO: ${qa.state || prospect_context.company_state || 'N/A'}
SERVIÇOS: ${qa.services || prospect_context.services || 'N/A'}
HORÁRIO: ${qa.opening_hours || prospect_context.opening_hours || 'N/A'}
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
      prompt: `Você é um arquiteto de software sênior e estrategista de produto digital de classe mundial. Gere um BUILD SPEC SUPREMO — o documento mais completo, profissional e encantador que uma IA de desenvolvimento já recebeu.

Este documento deve ser TÃO BOM que qualquer IA de desenvolvimento consiga construir o sistema inteiro sem uma única pergunta. Cada detalhe importa. Cada seção deve ter profundidade real, não superficial.

REGRAS DE QUALIDADE ABSOLUTA:
- Use dados REAIS do prospect nos exemplos, nomes de páginas, textos, branding
- NUNCA use placeholders genéricos como "Lorem ipsum" ou "[Nome da empresa]" — use o nome real
- Cada endpoint deve ter método, rota, payload completo e resposta de exemplo
- Cada tabela deve ter TODOS os campos com tipo, default e constraint
- Cada página deve ter layout descrito seção por seção
- O prompt deve ser executável, não um rascunho

---

# 🏗️ BUILD SPEC COMPLETO

## 1. IDENTIDADE E VISÃO DO PRODUTO
- Nome do projeto (sugerir um nome profissional se não tiver)
- Tagline de produto (uma frase que vende)
- Problema que resolve (em linguagem do cliente final)
- Público-alvo primário e secundário com perfil detalhado
- Proposta de valor única (o que diferencia de TUDO no mercado)
- Modelo de negócio e monetização
- Visão de 6 meses: como o produto deve crescer
- KPIs de sucesso: métricas que definem se o produto está funcionando

## 2. DESIGN SYSTEM & IDENTIDADE VISUAL
- Paleta de cores (5-7 cores em HSL): primary, secondary, accent, background, foreground, muted, destructive
- Tipografia: font-family para headings e body (sugerir Google Fonts específicas para o nicho)
- Estilo visual: minimalista, bold, editorial, orgânico — definir com convicção baseado no nicho
- Border radius padrão, shadows, spacing scale
- Componentes base: Button (3+ variants), Card, Badge, Avatar, Table, Modal
- Dark mode: sim/não, e se sim, tokens para ambos os modos
- Ícones: biblioteca recomendada (Lucide, Phosphor, etc.)
- Animações: transições de página, hover effects, loading animations (Framer Motion)
- Referências visuais: citar 2-3 sites reais do mesmo nicho como inspiração

## 3. FRONTEND — PÁGINAS E ROTAS COMPLETAS
Para CADA página, detalhar:
- **Rota**: /path exato
- **Título e meta description** (SEO)
- **Layout**: header, hero/main, sidebar se houver, footer
- **Seções**: descrever cada seção com conteúdo real (textos, CTAs, imagens sugeridas)
- **Estados**: loading, empty, error, success
- **Responsividade**: o que muda em mobile
- **Interações**: o que acontece ao clicar, hover, scroll

Incluir no mínimo:
- Landing page com hero, features, testimonials, pricing, CTA, footer
- Login/Cadastro (com validação e UX amigável)
- Dashboard principal com métricas reais
- Páginas de CRUD para cada entidade
- Página de perfil/configurações
- Painel admin (se aplicável)
- Páginas de erro (404, 500)

## 4. BACKEND — ARQUITETURA COMPLETA
- Framework: Supabase (Edge Functions + PostgreSQL + Auth + Storage + Realtime)
- Arquitetura de serviços (quais edge functions criar)
- Para CADA endpoint/function:
  \`\`\`
  [MÉTODO] /rota
  Auth: required | optional | public
  Payload: { campo: tipo, ... }
  Resposta 200: { campo: tipo, ... }
  Resposta 400/401/500: { error: "mensagem" }
  Validação: regras de cada campo
  Rate limit: X req/min
  \`\`\`
- Autenticação: email/senha + magic link + Google OAuth
- Autorização por roles: definir CADA role e suas permissões exatas
- Middlewares: auth verification, input validation (Zod), error handling, CORS, rate limiting
- File uploads: quais entidades aceitam upload, tamanho máximo, tipos permitidos
- Webhooks: quais receber, quais enviar, payload de cada um
- Workers: jobs assíncronos, processamento em background

## 5. BANCO DE DADOS — SCHEMA COMPLETO
Para CADA tabela:
\`\`\`sql
CREATE TABLE public.nome_tabela (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campo_1 TIPO NOT NULL DEFAULT valor,
  campo_2 TIPO,
  -- ... todos os campos
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.nome_tabela ENABLE ROW LEVEL SECURITY;
CREATE POLICY "descrição" ON public.nome_tabela FOR SELECT USING (condição);
-- ... todas as policies

-- Indexes
CREATE INDEX idx_nome ON public.nome_tabela(campo);

-- Triggers
CREATE TRIGGER update_nome_tabela_updated_at
  BEFORE UPDATE ON public.nome_tabela
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
\`\`\`
- Seeds de dados iniciais para cada tabela
- Relações (foreign keys) documentadas
- Diagrama de relacionamento em formato textual

## 6. INTEGRAÇÕES EXTERNAS
Para cada integração:
- Nome do serviço e finalidade
- Tipo de auth (API Key, OAuth, Webhook)
- Endpoints usados com payload e resposta
- Variáveis de ambiente necessárias
- Fallback se o serviço estiver fora do ar
- Incluir: WhatsApp (ChatPro), Email (Resend), Pagamentos (se aplicável), Analytics, Storage

## 7. AUTOMAÇÕES E FLUXOS
Para cada automação:
- **Gatilho**: o que dispara (evento, cron, webhook)
- **Condição**: verificações antes de executar
- **Ação**: o que acontece
- **Canal**: email, whatsapp, push, in-app
- **Delay**: imediato, 1h, 24h, 3 dias
- **Retry**: quantas tentativas, intervalo
- **Fallback**: o que fazer se falhar
- **Log**: o que registrar

Incluir: onboarding automático, follow-up, lembretes, notificações de status, emails transacionais

## 8. PAINEL ADMINISTRATIVO
- Dashboard com gráficos (Recharts): métricas do dia, semana, mês
- Tabelas com paginação, busca, filtros e ordenação
- CRUD completo de cada entidade com formulários validados
- Gestão de usuários: listar, editar roles, bloquear, excluir
- Logs de auditoria: quem fez o quê e quando
- Configurações do sistema: parâmetros editáveis
- Exportação de dados: CSV, PDF

## 9. UX PREMIUM
- Onboarding: wizard de primeiro uso, empty states educativos
- Feedback: toast notifications, modais de confirmação, skeleton loaders
- Micro-interações: hover effects, transitions suaves, progress indicators
- Acessibilidade: ARIA labels, keyboard navigation, contraste WCAG AA
- Performance percebida: optimistic updates, prefetch de dados
- Empty states com ilustração e CTA

## 10. SEGURANÇA E PERFORMANCE
- Input sanitization em TODOS os campos
- Rate limiting por IP e por usuário
- Proteção contra XSS, CSRF, SQL injection
- Validação server-side com Zod em cada endpoint
- Cache strategy: quais dados cachear, TTL de cada um
- Lazy loading de rotas e componentes pesados
- Image optimization: formatos, tamanhos, lazy loading
- Bundle analysis: manter abaixo de 200KB initial load

## 11. DEPLOY E INFRAESTRUTURA
- Ambiente: Supabase (managed) + Vercel/Lovable (frontend)
- Environment variables: lista COMPLETA com descrição de cada uma
- Domínio e DNS: configuração
- SSL: automático via provider
- CI/CD: testes antes de deploy, rollback strategy
- Monitoramento: health checks, alertas de erro
- Backup: frequência, retenção

## 12. ESTRUTURA DE PASTAS
\`\`\`
src/
├── components/
│   ├── ui/          # Design system base
│   ├── layout/      # Header, Footer, Sidebar
│   ├── features/    # Componentes por feature
│   └── shared/      # Componentes compartilhados
├── pages/           # Rotas/páginas
├── hooks/           # Custom hooks
├── lib/             # Utilitários e helpers
├── services/        # Lógica de API
├── types/           # TypeScript types
├── integrations/    # Configurações de serviços
└── assets/          # Imagens, fontes
\`\`\`
Listar CADA arquivo que deve ser criado com breve descrição.

## 13. CHECKLIST DE QUALIDADE
- [ ] Todas as páginas responsivas (mobile, tablet, desktop)
- [ ] Todos os formulários com validação visual
- [ ] Todos os endpoints com tratamento de erro
- [ ] RLS policies em todas as tabelas
- [ ] SEO completo (meta tags, sitemap, robots.txt)
- [ ] Performance: Lighthouse > 90
- [ ] Acessibilidade: WCAG AA
- [ ] Testes das funções críticas
- [ ] Documentação de API

O resultado DEVE ser um documento ENCANTADOR, COMPLETO e IMEDIATAMENTE EXECUTÁVEL. Uma IA de desenvolvimento deve conseguir construir o sistema INTEIRO seguindo apenas este documento, sem ambiguidade alguma.`,

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
