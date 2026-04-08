import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é a **Genesis IA**, assistente de suporte inteligente da plataforma **Genesis Hub**.

## Sobre a Plataforma

A Genesis Hub é uma plataforma SaaS completa para **consultores digitais** que transforma a forma como encontram clientes, criam projetos e fecham negócios. Suas principais funcionalidades:

### Módulos Principais
1. **Scanner IA (Encontrar Cliente)** — Busca empresas/estabelecimentos sem presença digital em qualquer cidade do mundo. Permite filtrar por país, estado, cidade, nicho, estrelas e presença de website. Ao encontrar um lead, você pode "Aceitar Projeto" para salvar na sua pipeline.
2. **Radar Global** — Varredura automática por cidades e nichos configuráveis, encontrando oportunidades continuamente com intervalo otimizado. Inclui filtros avançados (tamanho de cidade, países, nichos) e painel de logs em tempo real.
3. **Biblioteca / Escolher Modelo** — Catálogo com 40+ nichos (Pizzaria, Barbearia, Clínica, Advocacia, etc.) com mockups realistas. O usuário configura identidade visual (cores, tipografia, idioma) e gera um prompt profissional estruturado para criar o projeto na Lovable ou outra plataforma de IA.
4. **Criar do Zero** — Wizard passo a passo para criar projetos personalizados com prompt inteligente gerado por IA.
5. **Propostas Personalizadas** — Geração de textos persuasivos com IA para enviar ao cliente, com base no nicho, dados da empresa e estilo de copy selecionado.
6. **Propostas Aceitas** — Pipeline de leads aceitos do Scanner e Radar, com status e acompanhamento.
7. **Contratos** — Sistema de gestão de contratos com clientes.
8. **Financeiro** — Dashboard financeiro com métricas, receitas e acompanhamento.
9. **Academia Genesis** — Treinamentos sobre técnicas de vendas, objeções e estratégias digitais.
10. **Genesis WhatsApp** — Automação de WhatsApp com chatbots inteligentes (Luna IA).
11. **Genesis Instâncias** — Gerenciamento de instâncias de WhatsApp conectadas.
12. **Central de Ajuda** — Tutoriais completos de cada módulo com passo a passo.

### Detalhes Técnicos para Suporte
- **Planos**: Mensal, Trimestral, Anual — cada um com período de acesso definido
- **Tipos de usuário**: Cliente (pagante), Influencer, Parceiro
- **Pagamento**: Via checkout com Pix ou cartão de crédito
- **Limite de busca**: Até 20 empresas por pesquisa no Scanner IA
- **Prompt gerado**: Inclui identidade visual completa, stack técnica, SEO, responsividade e checklist de qualidade

## Regras de Comportamento

1. **ESCOPO**: Responda APENAS sobre a plataforma Genesis Hub e suas funcionalidades. Se perguntarem algo fora do escopo, diga educadamente: "Posso ajudar apenas com dúvidas sobre a Genesis Hub! 😊"
2. **SAUDAÇÃO**: Na primeira mensagem, cumprimente o usuário de forma calorosa. Se já mandou dúvida junto, cumprimente E responda.
3. **FORMATO**: Use markdown para formatar suas respostas — negrito, listas, emojis quando apropriado. Seja claro e organizado.
4. **TOM**: Profissional mas amigável, em português brasileiro. Respostas curtas, objetivas e elegantes.
5. **PRECISÃO**: Não invente funcionalidades. Se não souber algo específico, oriente a explorar a Central de Ajuda.
6. **SUPORTE HUMANO**: Quando o usuário pedir suporte humano, atendimento, falar com alguém, ou usar palavras como "suporte", "atendente", "humano", "falar com alguém" — responda amigavelmente que pode ajudar com a maioria das dúvidas, mas se quiser atendimento especializado, posso abrir atendimento com a equipe diretamente neste chat. SEMPRE inclua a flag [WHATSAPP_SUPPORT] no final da mensagem quando detectar essa intenção.
7. **ERROS**: Se o usuário reportar um erro/bug, peça detalhes (qual tela, o que fez, mensagem de erro) e oriente a atualizar a página. Se persistir, ofereça atendimento humano diretamente no chat.`;

const SYSTEM_PROMPT_APPENDIX = `
8. **COMO FUNCIONA**: Quando perguntarem de forma geral "como funciona", descreva a Genesis Hub em alto nível em 2 a 3 linhas, sem listar o painel inteiro. Ex: "A Genesis Hub ajuda consultores digitais a encontrar clientes sem presença digital, criar projetos profissionais com IA e fechar negócios."
9. **FORMATAÇÃO IDEAL**: Prefira 1 frase curta de abertura + até 3 bullets curtos. Evite textos longos. Máximo 5 linhas por resposta.
10. **MÓDULOS**: Só detalhe módulos específicos se o usuário pedir explicitamente.
11. **PLANOS**: Quando perguntarem sobre planos, mencione apenas: Mensal, Trimestral e Anual. NÃO mencione "mentoria", "mentorado", "Santiago" ou qualquer programa externo. Planos são acessíveis via checkout na plataforma.
12. **VELOCIDADE**: Seja direto e objetivo. Nada de introduções longas. Vá direto ao ponto.`;

// Detect if message needs WhatsApp support button
function needsWhatsAppButton(reply: string): boolean {
  return reply.includes('[WHATSAPP_SUPPORT]');
}

function cleanReply(reply: string): string {
  return reply.replace(/\[WHATSAPP_SUPPORT\]/g, '').trim();
}

// ─── Local fallback intent engine ───
function buildLocalFallback(messages: Array<{ role: string; content: string }>): { reply: string; hasWhatsAppButton: boolean } {
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content?.toLowerCase().trim() || "";

  if (isGreeting(lastUserMsg)) {
    return {
      reply: "Olá! 👋 Sou a **Genesis IA**, assistente de suporte da plataforma.\n\nComo posso te ajudar hoje? Pode perguntar sobre qualquer módulo, funcionalidade ou dúvida técnica! 😊",
      hasWhatsAppButton: false,
    };
  }

  if (isHumanSupportIntent(lastUserMsg)) {
    return {
      reply: "Entendi! Posso resolver a maioria das dúvidas aqui mesmo, mas se preferir atendimento especializado, posso abrir um chamado com a equipe diretamente neste chat. 😊",
      hasWhatsAppButton: true,
    };
  }

  if (isPlanQuestion(lastUserMsg)) {
    return {
      reply: "A Genesis Hub oferece **3 planos**:\n\n- **Mensal** — acesso completo por 30 dias\n- **Trimestral** — melhor custo-benefício\n- **Anual** — maior economia\n\nTodos incluem acesso a todos os módulos. O pagamento é feito via checkout com **Pix ou cartão de crédito**. 💳",
      hasWhatsAppButton: false,
    };
  }

  if (isScannerQuestion(lastUserMsg)) {
    return {
      reply: "O **Scanner IA** busca empresas sem presença digital em qualquer cidade do mundo! 🌍\n\n- Filtre por país, estado, cidade, nicho e estrelas\n- Até **20 resultados** por pesquisa\n- Clique em **\"Aceitar Projeto\"** para salvar na sua pipeline\n\nÉ o jeito mais rápido de encontrar clientes potenciais!",
      hasWhatsAppButton: false,
    };
  }

  if (isRadarQuestion(lastUserMsg)) {
    return {
      reply: "O **Radar Global** faz varreduras automáticas por cidades e nichos que você configurar! 📡\n\n- Funciona continuamente em segundo plano\n- Filtros avançados por tamanho de cidade, países e nichos\n- Painel de logs em tempo real\n\nAssim você encontra oportunidades sem ficar buscando manualmente.",
      hasWhatsAppButton: false,
    };
  }

  if (isTemplateQuestion(lastUserMsg)) {
    return {
      reply: "Na **Biblioteca de Modelos** você encontra **40+ nichos** prontos! 🎨\n\n- Pizzaria, Barbearia, Clínica, Advocacia e muito mais\n- Configure cores, tipografia e idioma\n- Gere um **prompt profissional** para criar o projeto na Lovable ou outra plataforma de IA",
      hasWhatsAppButton: false,
    };
  }

  if (isWhatsAppQuestion(lastUserMsg)) {
    return {
      reply: "O **Genesis WhatsApp** permite criar automações inteligentes com a **Luna IA**! 💬\n\n- Chatbots personalizados por nicho\n- Gerencie instâncias conectadas\n- Automação de atendimento e follow-up\n\nConfigure tudo pelo painel de **Instâncias** no menu lateral.",
      hasWhatsAppButton: false,
    };
  }

  if (isProposalQuestion(lastUserMsg)) {
    return {
      reply: "O módulo de **Propostas** gera textos persuasivos com IA! ✍️\n\n- Baseados no nicho e dados da empresa\n- Vários estilos de copy disponíveis\n- Acompanhe propostas aceitas na pipeline\n\nDepois de aceita, você gerencia tudo pelo módulo de **Contratos**.",
      hasWhatsAppButton: false,
    };
  }

  if (isHowItWorksQuestion(lastUserMsg)) {
    return {
      reply: "A **Genesis Hub** ajuda consultores digitais a encontrar clientes sem presença digital, criar projetos profissionais com IA e fechar negócios — tudo em uma única plataforma! 🚀\n\nExplore o menu lateral para acessar cada módulo.",
      hasWhatsAppButton: false,
    };
  }

  if (isErrorReport(lastUserMsg)) {
    return {
      reply: "Sinto muito pelo inconveniente! 😕 Para ajudar melhor:\n\n- **Qual tela** você estava usando?\n- **O que fez** antes do erro?\n- Apareceu alguma **mensagem de erro**?\n\nEnquanto isso, tente **atualizar a página** (F5). Se persistir, posso abrir atendimento com a equipe!",
      hasWhatsAppButton: false,
    };
  }

  // Generic helpful response
  return {
    reply: "Posso te ajudar com qualquer dúvida sobre a Genesis Hub! 😊\n\nAlguns temas populares:\n- **Scanner IA** — encontrar clientes\n- **Radar Global** — busca automática\n- **Modelos** — criar projetos por nicho\n- **WhatsApp** — automação com Luna IA\n- **Planos** — valores e funcionalidades\n\nSobre o que quer saber mais?",
    hasWhatsAppButton: false,
  };
}

function isGreeting(msg: string) {
  return /^(oi|olá|ola|hey|eai|opa|bom dia|boa tarde|boa noite|hello|hi)\b/.test(msg);
}

function isHumanSupportIntent(msg: string) {
  return /\b(suporte|atendente|humano|falar com|atendimento|pessoa|agente)\b/.test(msg);
}

function isPlanQuestion(msg: string) {
  return /\b(plano|planos|preço|preco|valor|assinatura|pagar|pagamento|mensal|trimestral|anual)\b/.test(msg);
}

function isScannerQuestion(msg: string) {
  return /\b(scanner|encontrar cliente|buscar empresa|busca de cliente|encontrar lead)\b/.test(msg);
}

function isRadarQuestion(msg: string) {
  return /\b(radar|varredura|busca automática|busca automatica)\b/.test(msg);
}

function isTemplateQuestion(msg: string) {
  return /\b(modelo|template|biblioteca|nicho|mockup|prompt)\b/.test(msg);
}

function isWhatsAppQuestion(msg: string) {
  return /\b(whatsapp|luna|chatbot|instância|instancia|automação whats|automacao whats)\b/.test(msg);
}

function isProposalQuestion(msg: string) {
  return /\b(proposta|propostas|contrato|contratos|copy|texto persuasivo)\b/.test(msg);
}

function isHowItWorksQuestion(msg: string) {
  return /\b(como funciona|o que é|o que e|pra que serve|para que serve|sobre a plataforma)\b/.test(msg);
}

function isErrorReport(msg: string) {
  return /\b(erro|bug|travou|não funciona|nao funciona|quebrou|problema|falha|não carrega|nao carrega)\b/.test(msg);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.warn("[genesis-support-chat] No LOVABLE_API_KEY, using local fallback");
      const fallback = buildLocalFallback(messages || []);
      return new Response(
        JSON.stringify(fallback),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}\n\n${SYSTEM_PROMPT_APPENDIX}` },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[genesis-support-chat] AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ reply: "Muitas mensagens em pouco tempo. Aguarde alguns segundos e tente novamente." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // For any other error (402, 500, etc.), use local fallback instead of showing error
      console.warn("[genesis-support-chat] Falling back to local engine for status", response.status);
      const fallback = buildLocalFallback(messages || []);
      return new Response(
        JSON.stringify(fallback),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content || "";

    // If AI returned empty, use local fallback
    if (!reply.trim()) {
      console.warn("[genesis-support-chat] Empty AI response, using local fallback");
      const fallback = buildLocalFallback(messages || []);
      return new Response(
        JSON.stringify(fallback),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const hasWhatsAppButton = needsWhatsAppButton(reply);
    reply = cleanReply(reply);

    return new Response(
      JSON.stringify({ reply, hasWhatsAppButton }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[genesis-support-chat] Unexpected error:", error);

    // Even on unexpected errors, try local fallback
    try {
      const fallback = buildLocalFallback([]);
      return new Response(
        JSON.stringify(fallback),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch {
      // absolute last resort
    }

    return new Response(
      JSON.stringify({ reply: "Olá! Estou aqui para ajudar com a Genesis Hub. Como posso te ajudar? 😊" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
