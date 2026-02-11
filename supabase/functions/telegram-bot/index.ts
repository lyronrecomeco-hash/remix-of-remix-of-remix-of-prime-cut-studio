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

interface AnalysisSection {
  title: string;
  icon: string;
  content: string;
}

interface AnalysisResult {
  summary: string;
  trend_score: number; // 0-100
  saturation: string;
  sections: AnalysisSection[];
}

interface UserState {
  step: string;
  pending_request?: string;
  parsed_task?: { tema: string; segmento: string; objetivo: string; tipo_insight: string };
  last_analysis?: AnalysisResult;
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

async function deleteMessage(token: string, chatId: number, messageId: number) {
  await fetch(`${TELEGRAM_API}${token}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
  }).catch(() => {});
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

// ─── SERPER: Real-time Google Search Intelligence ────────────────────
async function searchGoogle(query: string, type: "search" | "news" | "trends" = "search"): Promise<any[]> {
  const SERPER_KEY = Deno.env.get("SERPER_API_KEY");
  if (!SERPER_KEY) return [];

  try {
    const endpoint = type === "news"
      ? "https://google.serper.dev/news"
      : "https://google.serper.dev/search";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        q: query,
        gl: "br",
        hl: "pt-br",
        num: 10,
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();

    if (type === "news") return data.news || [];
    return data.organic || [];
  } catch (e) {
    console.error("Serper error:", e);
    return [];
  }
}

// ─── AI: Parse user request ──────────────────────────────────────────
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
            content: `Extraia da mensagem: tema, segmento, objetivo, tipo_insight. Responda APENAS em JSON válido com essas 4 chaves, sem markdown.`,
          },
          { role: "user", content: userMessage },
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!res.ok) throw new Error(`AI ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    return JSON.parse(content.replace(/```json\n?/g, "").replace(/```/g, "").trim());
  } catch (e) {
    console.error("Parse error:", e);
    return { tema: userMessage, segmento: "Geral", objetivo: "Análise exploratória", tipo_insight: "Oportunidades" };
  }
}

// ─── AI: Full Analysis with Real Data ────────────────────────────────
async function executeAnalysis(task: { tema: string; segmento: string; objetivo: string; tipo_insight: string }): Promise<AnalysisResult> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  // 1. Collect real data from Google
  const [searchResults, newsResults, trendResults] = await Promise.all([
    searchGoogle(`${task.tema} ${task.segmento} mercado tendências 2025`),
    searchGoogle(`${task.tema} ${task.segmento}`, "news"),
    searchGoogle(`${task.tema} ${task.segmento} crescimento oportunidade startup`),
  ]);

  // Build context from real data
  const searchContext = searchResults.slice(0, 5).map((r: any) =>
    `• ${r.title}: ${r.snippet || ""}`
  ).join("\n");

  const newsContext = newsResults.slice(0, 5).map((r: any) =>
    `• [${r.date || "Recente"}] ${r.title}: ${r.snippet || ""}`
  ).join("\n");

  const trendContext = trendResults.slice(0, 5).map((r: any) =>
    `• ${r.title}: ${r.snippet || ""}`
  ).join("\n");

  if (!LOVABLE_API_KEY) {
    return {
      summary: "Serviço indisponível",
      trend_score: 0,
      saturation: "N/A",
      sections: [{ title: "Erro", icon: "⚠️", content: "API indisponível." }],
    };
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
            content: `Você é um analista de inteligência de mercado de elite.
Analise os dados reais coletados do Google e gere insights acionáveis.

RESPONDA EXCLUSIVAMENTE em JSON válido com esta estrutura:
{
  "summary": "Resumo em 1-2 frases diretas do cenário",
  "trend_score": número de 0 a 100 (potencial de tendência),
  "saturation": "Baixo" | "Médio" | "Alto" | "Crítico",
  "sections": [
    {
      "title": "VISÃO GERAL",
      "icon": "🎯",
      "content": "Texto conciso, máximo 3-4 linhas. Dados objetivos."
    },
    {
      "title": "TENDÊNCIAS ATIVAS",
      "icon": "📈",
      "content": "3-5 bullet points com tendências reais detectadas. Use • para cada item."
    },
    {
      "title": "GAPS DE MERCADO",
      "icon": "🔍",
      "content": "3-5 bullet points com falhas/oportunidades detectadas. Use • para cada item."
    },
    {
      "title": "OPORTUNIDADES",
      "icon": "💡",
      "content": "3-5 ideias práticas e específicas. Use • para cada item."
    },
    {
      "title": "CONCORRÊNCIA",
      "icon": "⚔️",
      "content": "Players identificados e nível de competição. Conciso."
    },
    {
      "title": "AÇÃO RECOMENDADA",
      "icon": "🚀",
      "content": "1-2 frases com a direção estratégica principal."
    }
  ]
}

REGRAS:
- Conteúdo de cada seção: MÁXIMO 400 caracteres
- Seja específico: cite nomes de empresas, ferramentas, números quando possível
- Sem enrolação, sem introduções genéricas
- Baseie-se nos dados reais fornecidos abaixo
- Sem markdown, sem HTML, apenas texto puro no content`,
          },
          {
            role: "user",
            content: `SOLICITAÇÃO:
Tema: ${task.tema}
Segmento: ${task.segmento}
Objetivo: ${task.objetivo}

DADOS COLETADOS DO GOOGLE:

[RESULTADOS DE BUSCA]
${searchContext || "Nenhum resultado encontrado"}

[NOTÍCIAS RECENTES]
${newsContext || "Nenhuma notícia encontrada"}

[TENDÊNCIAS E OPORTUNIDADES]
${trendContext || "Nenhuma tendência encontrada"}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2500,
      }),
    });

    if (!res.ok) {
      const status = res.status;
      return {
        summary: status === 429 ? "Rate limit atingido" : status === 402 ? "Créditos esgotados" : "Erro no processamento",
        trend_score: 0,
        saturation: "N/A",
        sections: [{ title: "Erro", icon: "⚠️", content: `Código: ${status}. Tente novamente.` }],
      };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    const cleaned = content.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Analysis error:", e);
    return {
      summary: "Erro ao processar análise",
      trend_score: 0,
      saturation: "N/A",
      sections: [{ title: "Erro", icon: "⚠️", content: "Falha no processamento. Tente novamente." }],
    };
  }
}

// ─── Render: Compact Summary Card ────────────────────────────────────
function renderSummaryCard(analysis: AnalysisResult, task: { tema: string; segmento: string }): string {
  const bar = getTrendBar(analysis.trend_score);
  const satIcon = getSaturationIcon(analysis.saturation);

  return `<b>━━ RELATÓRIO ━━━━━━━━━━</b>

<b>📋 ${task.tema.toUpperCase()}</b>
<i>${task.segmento}</i>

${analysis.summary}

<b>Potencial:</b> ${bar} ${analysis.trend_score}/100
<b>Saturação:</b> ${satIcon} ${analysis.saturation}

<i>Use os botões abaixo para explorar cada seção:</i>`;
}

function getTrendBar(score: number): string {
  const filled = Math.round(score / 10);
  return "▓".repeat(filled) + "░".repeat(10 - filled);
}

function getSaturationIcon(level: string): string {
  switch (level.toLowerCase()) {
    case "baixo": return "🟢";
    case "médio": return "🟡";
    case "alto": return "🟠";
    case "crítico": return "🔴";
    default: return "⚪";
  }
}

// ─── Render: Section Buttons ─────────────────────────────────────────
function getSectionButtons(sections: AnalysisSection[]): any {
  const rows = sections.map((s, i) => [{
    text: `${s.icon} ${s.title}`,
    callback_data: `section_${i}`,
  }]);

  // Add action row
  rows.push([
    { text: "🔄 Nova Análise", callback_data: "new_analysis" },
    { text: "📄 Relatório Completo", callback_data: "full_report" },
  ]);

  return { inline_keyboard: rows };
}

// ─── Render: Section Detail ──────────────────────────────────────────
function renderSection(section: AnalysisSection): string {
  return `<b>${section.icon} ${section.title}</b>\n\n${section.content}`;
}

// ─── Render: Full Report ─────────────────────────────────────────────
function renderFullReport(analysis: AnalysisResult, task: { tema: string }): string {
  const bar = getTrendBar(analysis.trend_score);
  let report = `<b>━━━━━━━━━━━━━━━━━━━</b>\n<b>RELATÓRIO COMPLETO</b>\n<b>━━━━━━━━━━━━━━━━━━━</b>\n\n`;
  report += `<b>📋 ${task.tema.toUpperCase()}</b>\n`;
  report += `Potencial: ${bar} ${analysis.trend_score}/100\n\n`;

  for (const s of analysis.sections) {
    report += `<b>${s.icon} ${s.title}</b>\n${s.content}\n\n`;
  }

  report += `<b>━━━━━━━━━━━━━━━━━━━</b>`;
  return report;
}

// ══════════════════════════════════════════════════════════════════════
// ─── MAIN SERVER ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!BOT_TOKEN) return new Response("Bot token missing", { status: 500 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const update: TelegramUpdate = await req.json();
    console.log("Update:", JSON.stringify(update).substring(0, 300));

    // ═══ CALLBACK QUERIES ════════════════════════════════════════════
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const userId = cb.from.id;
      const action = cb.data;

      await answerCallback(BOT_TOKEN, cb.id);
      const state = await getUserState(supabase, userId);

      // ── Section buttons ──
      if (action.startsWith("section_") && state.last_analysis) {
        const idx = parseInt(action.split("_")[1]);
        const section = state.last_analysis.sections[idx];
        if (section) {
          await sendMessage(BOT_TOKEN, chatId, renderSection(section), {
            inline_keyboard: [[
              { text: "◀️ Voltar", callback_data: "back_to_summary" },
              { text: "📄 Completo", callback_data: "full_report" },
            ]],
          });
        }
        return new Response("OK");
      }

      // ── Back to summary ──
      if (action === "back_to_summary" && state.last_analysis && state.parsed_task) {
        await sendMessage(
          BOT_TOKEN, chatId,
          renderSummaryCard(state.last_analysis, state.parsed_task),
          getSectionButtons(state.last_analysis.sections),
        );
        return new Response("OK");
      }

      // ── Full report ──
      if (action === "full_report" && state.last_analysis && state.parsed_task) {
        const report = renderFullReport(state.last_analysis, state.parsed_task);
        if (report.length > 4000) {
          const mid = report.lastIndexOf("\n", 4000);
          await sendMessage(BOT_TOKEN, chatId, report.substring(0, mid > 0 ? mid : 4000));
          await sendMessage(BOT_TOKEN, chatId, report.substring(mid > 0 ? mid : 4000));
        } else {
          await sendMessage(BOT_TOKEN, chatId, report);
        }
        await sendMessage(BOT_TOKEN, chatId, "Descreva a próxima análise quando desejar.", {
          inline_keyboard: [[{ text: "🔄 Nova Análise", callback_data: "new_analysis" }]],
        });
        return new Response("OK");
      }

      // ── New analysis ──
      if (action === "new_analysis") {
        await setUserState(supabase, userId, { step: "awaiting_request" });
        await sendMessage(BOT_TOKEN, chatId, "Descreva qual análise deseja executar.");
        return new Response("OK");
      }

      // ── Confirm analysis ──
      if (action === "confirm_analysis") {
        if (!state.parsed_task) {
          await sendMessage(BOT_TOKEN, chatId, "⚠️ Nenhuma solicitação pendente.");
          await setUserState(supabase, userId, { step: "awaiting_request" });
          return new Response("OK");
        }

        await setUserState(supabase, userId, { ...state, step: "processing" });
        await logInteraction(supabase, userId, "confirm", JSON.stringify(state.parsed_task));

        // Progress messages
        const statusMsg = await sendMessage(BOT_TOKEN, chatId, "⏳ Coletando dados do Google...");
        const statusData = await statusMsg.json().catch(() => null);
        const statusMsgId = statusData?.result?.message_id;

        const stages = [
          "📡 Analisando tendências de mercado...",
          "🔍 Cruzando dados de concorrência...",
          "📊 Gerando insights estratégicos...",
        ];

        for (const stage of stages) {
          await new Promise(r => setTimeout(r, 1500));
          if (statusMsgId) await editMessage(BOT_TOKEN, chatId, statusMsgId, stage);
        }

        // Execute real analysis with Google data
        const analysis = await executeAnalysis(state.parsed_task);

        // Delete progress message
        if (statusMsgId) await deleteMessage(BOT_TOKEN, chatId, statusMsgId);

        // Save analysis in state for button navigation
        await setUserState(supabase, userId, {
          step: "viewing_results",
          parsed_task: state.parsed_task,
          last_analysis: analysis,
        });

        // Send compact summary card with section buttons
        await sendMessage(
          BOT_TOKEN, chatId,
          renderSummaryCard(analysis, state.parsed_task),
          getSectionButtons(analysis.sections),
        );

        return new Response("OK");
      }

      // ── Cancel analysis ──
      if (action === "cancel_analysis") {
        await setUserState(supabase, userId, { step: "awaiting_request" });
        await sendMessage(BOT_TOKEN, chatId, "Cancelado. Descreva uma nova análise quando desejar.");
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

    await ensureUser(supabase, msg.from);

    // ── /start ──
    if (text === "/start") {
      await setUserState(supabase, userId, { step: "awaiting_request" });
      await logInteraction(supabase, userId, "/start", "init");
      await sendMessage(BOT_TOKEN, chatId, `Olá, ${firstName}!\n\nDescreva qual análise você deseja executar.`);
      return new Response("OK");
    }

    const state = await getUserState(supabase, userId);

    // Auto-start if idle
    if (state.step === "idle") {
      await setUserState(supabase, userId, { step: "awaiting_request" });
    }

    // Block if processing
    if (state.step === "processing") {
      await sendMessage(BOT_TOKEN, chatId, "⏳ Análise em andamento. Aguarde.");
      return new Response("OK");
    }

    // Parse request
    await logInteraction(supabase, userId, "request", text);
    const parsed = await parseRequest(text);

    await setUserState(supabase, userId, {
      step: "awaiting_confirmation",
      pending_request: text,
      parsed_task: parsed,
    });

    // Compact confirmation
    const confirmText = `<b>📋 Análise identificada</b>

<b>Tema:</b> ${parsed.tema}
<b>Segmento:</b> ${parsed.segmento}
<b>Objetivo:</b> ${parsed.objetivo}

<b>Será executado:</b>
• Coleta Google em tempo real
• Análise de tendências
• Mapeamento de concorrência
• Identificação de oportunidades

Confirma?`;

    await sendMessage(BOT_TOKEN, chatId, confirmText, {
      inline_keyboard: [[
        { text: "✅ CONFIRMAR", callback_data: "confirm_analysis" },
        { text: "❌ CANCELAR", callback_data: "cancel_analysis" },
      ]],
    });

    return new Response("OK");
  } catch (error) {
    console.error("Bot error:", error);
    return new Response("Error", { status: 500 });
  }
});
