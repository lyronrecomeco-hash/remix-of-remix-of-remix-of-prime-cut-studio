import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_API = "https://api.telegram.org/bot";

// ─── Types ───────────────────────────────────────────────────────────
interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string; last_name?: string; username?: string };
    chat: { id: number; type: string };
    text?: string;
  };
  callback_query?: {
    id: string;
    from: { id: number; first_name: string; last_name?: string; username?: string };
    message: { chat: { id: number }; message_id: number };
    data: string;
  };
}

interface UserState {
  step: string; // "idle" | "awaiting_request" | "awaiting_confirmation" | "processing"
  pending_request?: string;
  parsed_task?: {
    tema: string;
    segmento: string;
    objetivo: string;
    tipo_insight: string;
  };
}

// ─── Telegram Helpers ────────────────────────────────────────────────
async function sendMessage(token: string, chatId: number, text: string, replyMarkup?: any) {
  const body: any = { chat_id: chatId, text, parse_mode: "HTML" };
  if (replyMarkup) body.reply_markup = replyMarkup;
  const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error("sendMessage error:", await res.text());
  return res;
}

async function editMessage(token: string, chatId: number, messageId: number, text: string, replyMarkup?: any) {
  const body: any = { chat_id: chatId, message_id: messageId, text, parse_mode: "HTML" };
  if (replyMarkup) body.reply_markup = replyMarkup;
  await fetch(`${TELEGRAM_API}${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function answerCallback(token: string, callbackId: string, text?: string) {
  await fetch(`${TELEGRAM_API}${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackId, text }),
  });
}

// ─── DB State Management ─────────────────────────────────────────────
async function getUserState(supabase: any, telegramId: number): Promise<UserState> {
  const { data } = await supabase
    .from("telbot_users")
    .select("conversation_state")
    .eq("telegram_id", telegramId)
    .single();
  return data?.conversation_state || { step: "idle" };
}

async function setUserState(supabase: any, telegramId: number, state: UserState) {
  await supabase
    .from("telbot_users")
    .update({ conversation_state: state })
    .eq("telegram_id", telegramId);
}

async function ensureUser(supabase: any, from: { id: number; first_name: string; last_name?: string; username?: string }) {
  const { data } = await supabase
    .from("telbot_users")
    .select("id")
    .eq("telegram_id", from.id)
    .single();

  if (!data) {
    await supabase.from("telbot_users").insert({
      telegram_id: from.id,
      first_name: from.first_name,
      last_name: from.last_name || null,
      username: from.username || null,
      conversation_state: { step: "idle" },
    });
  }
}

// ─── AI: Parse user request into structured task ─────────────────────
async function parseRequest(userMessage: string): Promise<{ tema: string; segmento: string; objetivo: string; tipo_insight: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return { tema: userMessage, segmento: "Geral", objetivo: "Análise exploratória", tipo_insight: "Oportunidades" };
  }

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um parser de solicitações. Extraia da mensagem do usuário:
- tema: o assunto central
- segmento: setor ou nicho de mercado
- objetivo: o que o usuário quer descobrir
- tipo_insight: tipo de resultado esperado (oportunidades, análise competitiva, tendências, etc.)
Responda APENAS em JSON válido com essas 4 chaves, sem markdown.`,
          },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 300,
      }),
    });

    if (!res.ok) throw new Error(`AI status ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    const cleaned = content.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Parse error:", e);
    return { tema: userMessage, segmento: "Geral", objetivo: "Análise exploratória", tipo_insight: "Oportunidades" };
  }
}

// ─── AI: Execute full strategic analysis ─────────────────────────────
async function executeAnalysis(task: { tema: string; segmento: string; objetivo: string; tipo_insight: string }): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return "⚠️ Serviço de inteligência temporariamente indisponível.";

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é uma unidade de inteligência estratégica de mercado. 
Sua função é executar análises profundas e retornar insights acionáveis.

REGRAS ABSOLUTAS:
- Nunca invente dados. Baseie-se em conhecimento real de mercado, tendências verificáveis e padrões conhecidos.
- Seja específico. Cite exemplos reais de empresas, ferramentas, movimentos de mercado quando possível.
- Linguagem direta, sem rodeios, sem emojis excessivos.
- Formato OBRIGATÓRIO de resposta (use exatamente este formato HTML):

<b>━━━━━━━━━━━━━━━━━━━</b>
<b>ANÁLISE CONCLUÍDA</b>
<b>━━━━━━━━━━━━━━━━━━━</b>

<b>VISÃO GERAL</b>
[Resumo direto do cenário identificado em 2-3 parágrafos]

<b>MOVIMENTOS DE MERCADO</b>
[O que está crescendo ou mudando - 3 a 5 pontos concretos]

<b>PROBLEMAS NÃO RESOLVIDOS</b>
[Falhas atuais que representam oportunidade - 3 a 5 pontos]

<b>OPORTUNIDADES PRÁTICAS</b>
[Possibilidades reais de produto ou serviço - 3 a 5 pontos com detalhamento]

<b>NÍVEL DE SATURAÇÃO</b>
[Classificação objetiva: Baixo / Médio / Alto / Muito Alto, com justificativa]

<b>DIREÇÃO ESTRATÉGICA</b>
[Caminho recomendado com base nos dados - 2 a 3 parágrafos]

<b>━━━━━━━━━━━━━━━━━━━</b>`,
          },
          {
            role: "user",
            content: `Execute análise estratégica completa:

TEMA: ${task.tema}
SEGMENTO: ${task.segmento}  
OBJETIVO: ${task.objetivo}
TIPO DE INSIGHT: ${task.tipo_insight}

Analise com profundidade. Considere:
- Cenário atual do mercado brasileiro e global
- Players existentes e gaps de mercado
- Tendências emergentes
- Dores reais do público-alvo
- Modelos de negócio viáveis
- Barreiras de entrada e vantagens competitivas possíveis`,
          },
        ],
        temperature: 0.4,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return "⚠️ Sistema sobrecarregado. Tente novamente em alguns minutos.";
      if (res.status === 402) return "⚠️ Créditos de processamento esgotados.";
      throw new Error(`AI status ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "⚠️ Não foi possível gerar a análise.";
  } catch (e) {
    console.error("Analysis error:", e);
    return "⚠️ Erro no processamento. Tente novamente.";
  }
}

// ─── Log interaction ─────────────────────────────────────────────────
async function logInteraction(supabase: any, userId: number, command: string, message: string) {
  try {
    await supabase.from("telbot_logs").insert({
      log_type: "command",
      telegram_user_id: userId,
      command,
      message,
    });
  } catch (e) {
    console.error("Log error:", e);
  }
}

// ══════════════════════════════════════════════════════════════════════
// ─── MAIN SERVER ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN not configured");
    return new Response("Bot token missing", { status: 500 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const update: TelegramUpdate = await req.json();
    console.log("Update:", JSON.stringify(update).substring(0, 300));

    // ═══ CALLBACK QUERIES (Confirm / Cancel buttons) ═════════════════
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const userId = cb.from.id;
      const action = cb.data;

      await answerCallback(BOT_TOKEN, cb.id);

      if (action === "confirm_analysis") {
        const state = await getUserState(supabase, userId);
        if (!state.parsed_task) {
          await sendMessage(BOT_TOKEN, chatId, "⚠️ Nenhuma solicitação pendente. Envie uma nova.");
          await setUserState(supabase, userId, { step: "awaiting_request" });
          return new Response("OK");
        }

        // Update state to processing
        await setUserState(supabase, userId, { ...state, step: "processing" });
        await logInteraction(supabase, userId, "confirm_analysis", JSON.stringify(state.parsed_task));

        // Send progress messages
        const statusMsg = await sendMessage(BOT_TOKEN, chatId, "⏳ Executando coleta de dados...");
        const statusData = await statusMsg.json().catch(() => null);
        const statusMsgId = statusData?.result?.message_id;

        // Simulate real processing stages with actual delays
        const stages = [
          "📡 Analisando padrões de mercado...",
          "🔍 Estruturando oportunidades...",
          "📊 Finalizando relatório...",
        ];

        for (const stage of stages) {
          await new Promise(r => setTimeout(r, 2000));
          if (statusMsgId) {
            await editMessage(BOT_TOKEN, chatId, statusMsgId, stage);
          }
        }

        // Execute real AI analysis
        const result = await executeAnalysis(state.parsed_task);

        // Delete status message
        if (statusMsgId) {
          await fetch(`${TELEGRAM_API}${BOT_TOKEN}/deleteMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, message_id: statusMsgId }),
          }).catch(() => {});
        }

        // Send final report
        // Telegram has 4096 char limit, split if needed
        if (result.length > 4000) {
          const mid = result.lastIndexOf("\n", 4000);
          const part1 = result.substring(0, mid > 0 ? mid : 4000);
          const part2 = result.substring(mid > 0 ? mid : 4000);
          await sendMessage(BOT_TOKEN, chatId, part1);
          await sendMessage(BOT_TOKEN, chatId, part2);
        } else {
          await sendMessage(BOT_TOKEN, chatId, result);
        }

        // Reset state
        await setUserState(supabase, userId, { step: "awaiting_request" });

        // Follow-up
        await sendMessage(BOT_TOKEN, chatId, "Descreva a próxima análise quando desejar.");
        return new Response("OK");
      }

      if (action === "cancel_analysis") {
        await setUserState(supabase, userId, { step: "awaiting_request" });
        await logInteraction(supabase, userId, "cancel_analysis", "Cancelled");
        await sendMessage(BOT_TOKEN, chatId, "Solicitação cancelada.\n\nDescreva uma nova análise quando desejar.");
        return new Response("OK");
      }

      return new Response("OK");
    }

    // ═══ TEXT MESSAGES ════════════════════════════════════════════════
    if (!update.message?.text) return new Response("OK");

    const msg = update.message;
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text.trim();
    const firstName = msg.from.first_name || "Operador";

    // Ensure user exists in DB
    await ensureUser(supabase, msg.from);

    // ── /start ──────────────────────────────────────────────────────
    if (text === "/start") {
      await setUserState(supabase, userId, { step: "awaiting_request" });
      await logInteraction(supabase, userId, "/start", "Session started");
      await sendMessage(
        BOT_TOKEN,
        chatId,
        `Olá, ${firstName}!\n\nDescreva qual análise você deseja executar.`
      );
      return new Response("OK");
    }

    // ── Any other text: process as analysis request ─────────────────
    const state = await getUserState(supabase, userId);

    // If not started yet, auto-start
    if (state.step === "idle") {
      await setUserState(supabase, userId, { step: "awaiting_request" });
    }

    // If already processing, ignore
    if (state.step === "processing") {
      await sendMessage(BOT_TOKEN, chatId, "⏳ Análise em andamento. Aguarde a conclusão.");
      return new Response("OK");
    }

    // Parse and confirm
    await logInteraction(supabase, userId, "analysis_request", text);

    const parsed = await parseRequest(text);

    // Save state with pending task
    await setUserState(supabase, userId, {
      step: "awaiting_confirmation",
      pending_request: text,
      parsed_task: parsed,
    });

    // Send confirmation
    const confirmText = `Solicitação identificada.\n\nSerá realizada uma análise completa envolvendo:\n\n• Mapeamento de demanda\n• Identificação de dores de mercado\n• Avaliação de concorrência\n• Oportunidades estratégicas\n\n<b>Tema:</b> ${parsed.tema}\n<b>Segmento:</b> ${parsed.segmento}\n<b>Objetivo:</b> ${parsed.objetivo}\n\nConfirma a execução?`;

    await sendMessage(BOT_TOKEN, chatId, confirmText, {
      inline_keyboard: [
        [
          { text: "CONFIRMAR", callback_data: "confirm_analysis" },
          { text: "CANCELAR", callback_data: "cancel_analysis" },
        ],
      ],
    });

    return new Response("OK");
  } catch (error) {
    console.error("Bot error:", error);
    return new Response("Error", { status: 500 });
  }
});
