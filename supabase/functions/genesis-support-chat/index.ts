import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
- **Mentorados Santiago**: Acesso trial de 3 dias, após expira automaticamente
- **Tipos de usuário**: Cliente (pagante), Influencer, Parceiro, Mentorado
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
8. **COMO FUNCIONA**: Quando perguntarem de forma geral "como funciona", descreva a Genesis Hub em alto nível em 2 a 4 linhas, sem listar o painel inteiro.
9. **FORMATAÇÃO IDEAL**: Prefira 1 frase curta de abertura + até 3 bullets curtos. Evite textos longos.
10. **MÓDULOS**: Só detalhe módulos específicos se o usuário pedir explicitamente.`;

// Detect if message needs WhatsApp support button
function needsWhatsAppButton(reply: string): boolean {
  return reply.includes('[WHATSAPP_SUPPORT]');
}

function cleanReply(reply: string): string {
  return reply.replace(/\[WHATSAPP_SUPPORT\]/g, '').trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ reply: 'Serviço temporariamente indisponível. Tente novamente em instantes.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}\n\n${SYSTEM_PROMPT_APPENDIX}` },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ reply: 'Muitas mensagens em pouco tempo. Aguarde alguns segundos e tente novamente.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ reply: 'Serviço temporariamente indisponível. Tente mais tarde.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ reply: 'Erro ao processar mensagem. Tente novamente.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
    
    const hasWhatsAppButton = needsWhatsAppButton(reply);
    reply = cleanReply(reply);

    return new Response(
      JSON.stringify({ reply, hasWhatsAppButton }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Support chat error:', error);
    return new Response(
      JSON.stringify({ reply: 'Erro interno. Tente novamente em instantes.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
