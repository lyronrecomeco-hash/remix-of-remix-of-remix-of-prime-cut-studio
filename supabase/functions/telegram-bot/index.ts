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
  trend_score: number;
  saturation: string;
  sections: AnalysisSection[];
}

interface UserState {
  step: string;
  mode?: "analysis" | "agent";
  pending_request?: string;
  parsed_task?: { tema: string; segmento: string; objetivo: string; tipo_insight: string };
  last_analysis?: AnalysisResult;
  last_bot_msgs?: number[]; // track bot messages for cleanup
  conversation_history?: { role: string; content: string }[];
}

// ─── Telegram Helpers ────────────────────────────────────────────────
async function sendMsg(token: string, chatId: number, text: string, replyMarkup?: any): Promise<number | null> {
  const body: any = { chat_id: chatId, text, parse_mode: "HTML" };
  if (replyMarkup) body.reply_markup = replyMarkup;
  try {
    const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) { console.error("sendMsg error:", await res.text()); return null; }
    const data = await res.json();
    return data?.result?.message_id || null;
  } catch (e) { console.error("sendMsg exception:", e); return null; }
}

async function editMsg(token: string, chatId: number, messageId: number, text: string, replyMarkup?: any) {
  const body: any = { chat_id: chatId, message_id: messageId, text, parse_mode: "HTML" };
  if (replyMarkup) body.reply_markup = replyMarkup;
  await fetch(`${TELEGRAM_API}${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

async function deleteMsg(token: string, chatId: number, messageId: number) {
  await fetch(`${TELEGRAM_API}${token}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
  }).catch(() => {});
}

async function answerCb(token: string, callbackId: string, text?: string) {
  await fetch(`${TELEGRAM_API}${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackId, text }),
  }).catch(() => {});
}

// Clean old bot messages
async function cleanChat(token: string, chatId: number, msgIds: number[]) {
  await Promise.all(msgIds.map(id => deleteMsg(token, chatId, id)));
}

// Send + track message ID
async function sendTracked(token: string, chatId: number, text: string, state: UserState, replyMarkup?: any): Promise<number | null> {
  const msgId = await sendMsg(token, chatId, text, replyMarkup);
  if (msgId) {
    if (!state.last_bot_msgs) state.last_bot_msgs = [];
    state.last_bot_msgs.push(msgId);
  }
  return msgId;
}

// ─── DB State ────────────────────────────────────────────────────────
async function getState(supabase: any, tgId: number): Promise<UserState> {
  const { data } = await supabase.from("telbot_users").select("conversation_state").eq("telegram_id", tgId).single();
  return data?.conversation_state || { step: "idle" };
}

async function setState(supabase: any, tgId: number, state: UserState) {
  await supabase.from("telbot_users").update({ conversation_state: state }).eq("telegram_id", tgId);
}

async function ensureUser(supabase: any, from: { id: number; first_name: string; last_name?: string; username?: string }) {
  const { data } = await supabase.from("telbot_users").select("id").eq("telegram_id", from.id).single();
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

async function logIt(supabase: any, userId: number, cmd: string, msg: string) {
  try { await supabase.from("telbot_logs").insert({ log_type: "command", telegram_user_id: userId, command: cmd, message: msg }); } catch {}
}

// ─── SERPER: Google Search ───────────────────────────────────────────
async function searchGoogle(query: string, type: "search" | "news" = "search", num = 10): Promise<any[]> {
  const KEY = Deno.env.get("SERPER_API_KEY");
  if (!KEY) return [];
  try {
    const endpoint = type === "news" ? "https://google.serper.dev/news" : "https://google.serper.dev/search";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "X-API-KEY": KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, gl: "br", hl: "pt-br", num }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return type === "news" ? (data.news || []) : (data.organic || []);
  } catch { return []; }
}

// ─── AI Call ─────────────────────────────────────────────────────────
async function callAI(systemPrompt: string, userPrompt: string, maxTokens = 2500, temp = 0.3): Promise<string> {
  const KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!KEY) return "";
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      temperature: temp,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ─── AI with conversation history ───────────────────────────────────
async function callAIChat(systemPrompt: string, history: { role: string; content: string }[], maxTokens = 2000): Promise<string> {
  const KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!KEY) return "⚠️ Serviço indisponível.";
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...history.slice(-20)],
        temperature: 0.5,
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) {
      if (res.status === 429) return "⚠️ Limite de requisições atingido. Aguarde alguns segundos.";
      if (res.status === 402) return "⚠️ Créditos esgotados.";
      return "⚠️ Erro no processamento.";
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Sem resposta.";
  } catch { return "⚠️ Erro de conexão."; }
}

// ─── Parse Request ───────────────────────────────────────────────────
async function parseRequest(text: string) {
  try {
    const content = await callAI(
      `Extraia da mensagem: tema, segmento, objetivo, tipo_insight. Responda APENAS JSON puro com essas 4 chaves.`,
      text, 200, 0.1,
    );
    return JSON.parse(content.replace(/```json\n?/g, "").replace(/```/g, "").trim());
  } catch {
    return { tema: text, segmento: "Geral", objetivo: "Análise exploratória", tipo_insight: "Oportunidades" };
  }
}

// ─── Execute Analysis ────────────────────────────────────────────────
async function executeAnalysis(task: { tema: string; segmento: string; objetivo: string }): Promise<AnalysisResult> {
  const [search, news, trends] = await Promise.all([
    searchGoogle(`${task.tema} ${task.segmento} mercado tendências 2025 Brasil`),
    searchGoogle(`${task.tema} ${task.segmento}`, "news"),
    searchGoogle(`${task.tema} SaaS startup oportunidade crescimento Brasil 2025`),
  ]);

  const fmt = (arr: any[], n = 5) => arr.slice(0, n).map((r: any) => `• ${r.title}: ${r.snippet || ""}`).join("\n") || "N/A";

  try {
    const content = await callAI(
      `Você é o analista de inteligência de mercado mais preciso do mundo. Responda APENAS JSON válido.

ESTRUTURA OBRIGATÓRIA:
{
  "summary": "1-2 frases impactantes",
  "trend_score": 0-100,
  "saturation": "Baixo|Médio|Alto|Crítico",
  "sections": [
    {"title":"VISÃO GERAL","icon":"🎯","content":"..."},
    {"title":"TOP SaaS PROCURADOS","icon":"🔥","content":"Lista dos SaaS mais procurados no segmento. Ex: Agendamento barbearia, CRM imobiliário, etc. Com dados reais."},
    {"title":"DEMANDA EMPRESAS","icon":"🏢","content":"O que as empresas mais buscam/precisam. Soluções específicas com exemplos reais."},
    {"title":"GAPS DE MERCADO","icon":"🔍","content":"Falhas e oportunidades não atendidas."},
    {"title":"CONCORRÊNCIA","icon":"⚔️","content":"Players e nível de competição."},
    {"title":"AÇÃO RECOMENDADA","icon":"🚀","content":"Direção estratégica em 2 frases."}
  ]
}

REGRAS: Máximo 350 chars por seção. Seja ESPECÍFICO: cite nomes, números, ferramentas reais. Zero enrolação.`,
      `TEMA: ${task.tema}\nSEGMENTO: ${task.segmento}\nOBJETIVO: ${task.objetivo}\n\n[GOOGLE]\n${fmt(search)}\n\n[NEWS]\n${fmt(news)}\n\n[TRENDS]\n${fmt(trends)}`,
      2500, 0.2,
    );

    return JSON.parse(content.replace(/```json\n?/g, "").replace(/```/g, "").trim());
  } catch (e) {
    console.error("Analysis error:", e);
    return { summary: "Erro", trend_score: 0, saturation: "N/A", sections: [{ title: "Erro", icon: "⚠️", content: "Falha. Tente novamente." }] };
  }
}

// ─── Deep Analysis (post-result) ─────────────────────────────────────
async function deepAnalysis(type: string, task: { tema: string; segmento: string }, analysis: AnalysisResult): Promise<string> {
  const context = analysis.sections.map(s => `${s.title}: ${s.content}`).join("\n");
  const prompts: Record<string, string> = {
    critica: `Faça uma ANÁLISE CRÍTICA brutal e honesta sobre "${task.tema}" no segmento "${task.segmento}". Aponte riscos, falhas, problemas potenciais. Sem filtro, pura verdade. Baseie-se nos dados: ${context}`,
    padroes: `Identifique PADRÕES ocultos e conexões não óbvias sobre "${task.tema}" em "${task.segmento}". Correlações, ciclos, comportamentos recorrentes. Dados: ${context}`,
    factual: `Apresente APENAS FATOS verificáveis e dados concretos sobre "${task.tema}" em "${task.segmento}". Números, estatísticas, fontes. Zero opinião. Dados: ${context}`,
    aprofundar: `Faça uma análise PROFUNDA e detalhada sobre "${task.tema}" em "${task.segmento}". Explore cada aspecto com máxima profundidade. Dados: ${context}`,
  };

  try {
    const content = await callAI(
      `Você é um analista hacker de elite. Respostas diretas, máximo 500 chars. Use bullets (•). Sem enrolação.`,
      prompts[type] || prompts.aprofundar,
      1500, 0.3,
    );
    return content;
  } catch { return "⚠️ Erro ao processar."; }
}

// ─── Render Helpers ──────────────────────────────────────────────────
function trendBar(score: number): string {
  const f = Math.round(score / 10);
  return "▓".repeat(f) + "░".repeat(10 - f);
}

function satIcon(level: string): string {
  const m: Record<string, string> = { baixo: "🟢", "médio": "🟡", alto: "🟠", "crítico": "🔴" };
  return m[level.toLowerCase()] || "⚪";
}

function summaryCard(a: AnalysisResult, task: { tema: string; segmento: string }): string {
  return `<b>━━ RELATÓRIO ━━━━━━━━━━━</b>

<b>📋 ${task.tema.toUpperCase()}</b>
<i>${task.segmento}</i>

${a.summary}

<b>Potencial:</b> ${trendBar(a.trend_score)} ${a.trend_score}/100
<b>Saturação:</b> ${satIcon(a.saturation)} ${a.saturation}

<i>👇 Explore as seções:</i>`;
}

function sectionButtons(sections: AnalysisSection[]): any {
  const rows = sections.map((s, i) => [{ text: `${s.icon} ${s.title}`, callback_data: `sec_${i}` }]);
  rows.push([
    { text: "🔄 Nova Análise", callback_data: "new_analysis" },
    { text: "📄 Completo", callback_data: "full_report" },
  ]);
  return { inline_keyboard: rows };
}

function postAnalysisButtons(): any {
  return {
    inline_keyboard: [
      [
        { text: "🔬 Análise Crítica", callback_data: "deep_critica" },
        { text: "🧩 Padrões", callback_data: "deep_padroes" },
      ],
      [
        { text: "📊 Factual", callback_data: "deep_factual" },
        { text: "🔎 Aprofundar", callback_data: "deep_aprofundar" },
      ],
      [
        { text: "🤖 Modo Agente", callback_data: "enter_agent" },
        { text: "🔄 Nova Análise", callback_data: "new_analysis" },
      ],
    ],
  };
}

function mainMenuButtons(): any {
  return {
    inline_keyboard: [
      [
        { text: "📊 Análise de Mercado", callback_data: "mode_analysis" },
        { text: "🤖 Modo Agente", callback_data: "enter_agent" },
      ],
    ],
  };
}

const AGENT_SYSTEM = `Você é o GENESIS — um agente de inteligência artificial de ponta, operando como analista hacker de elite.

REGRAS ABSOLUTAS:
1. Responda QUALQUER pergunta com precisão máxima
2. Use dados reais quando disponíveis. Quando não tiver certeza, diga explicitamente
3. Seja DIRETO: respostas curtas, densas, sem enrolação
4. Formate com bullets (•) para listas
5. Para análises técnicas, use dados concretos e específicos
6. Pode discutir qualquer tema: mercado, tecnologia, estratégia, código, segurança, business, etc
7. Máximo 600 caracteres por resposta, a menos que o usuário peça mais detalhes
8. Use emojis estrategicamente para organizar
9. Se o usuário pedir busca em tempo real, indique com [BUSCA NECESSÁRIA]
10. Nunca invente dados — se não sabe, diga "Não tenho dados precisos sobre isso"

PERSONALIDADE: Preciso, técnico, sem filtro, eficiente. Como um analista de inteligência militar.`;

// ══════════════════════════════════════════════════════════════════════
// ─── MAIN SERVER ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!BOT_TOKEN) return new Response("Missing token", { status: 500 });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    const update: TelegramUpdate = await req.json();
    console.log("Update:", JSON.stringify(update).substring(0, 300));

    // ═══ CALLBACK QUERIES ════════════════════════════════════════════
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const userId = cb.from.id;
      const action = cb.data;
      const cbMsgId = cb.message.message_id;

      await answerCb(BOT_TOKEN, cb.id);
      const state = await getState(supabase, userId);

      // ── Delete previous message on any button click for clean chat ──
      await deleteMsg(BOT_TOKEN, chatId, cbMsgId);

      // ── Section view ──
      if (action.startsWith("sec_") && state.last_analysis) {
        const idx = parseInt(action.split("_")[1]);
        const sec = state.last_analysis.sections[idx];
        if (sec) {
          const msgId = await sendMsg(BOT_TOKEN, chatId, `<b>${sec.icon} ${sec.title}</b>\n\n${sec.content}`, {
            inline_keyboard: [
              [{ text: "◀️ Voltar", callback_data: "back_summary" }, { text: "📄 Completo", callback_data: "full_report" }],
              [{ text: "🔬 Crítica", callback_data: "deep_critica" }, { text: "🧩 Padrões", callback_data: "deep_padroes" }],
            ],
          });
          state.last_bot_msgs = msgId ? [msgId] : [];
          await setState(supabase, userId, state);
        }
        return new Response("OK");
      }

      // ── Back to summary ──
      if (action === "back_summary" && state.last_analysis && state.parsed_task) {
        const msgId = await sendMsg(BOT_TOKEN, chatId, summaryCard(state.last_analysis, state.parsed_task), sectionButtons(state.last_analysis.sections));
        state.last_bot_msgs = msgId ? [msgId] : [];
        await setState(supabase, userId, state);
        return new Response("OK");
      }

      // ── Full report ──
      if (action === "full_report" && state.last_analysis && state.parsed_task) {
        let report = `<b>━━ RELATÓRIO COMPLETO ━━</b>\n<b>📋 ${state.parsed_task.tema.toUpperCase()}</b>\n${trendBar(state.last_analysis.trend_score)} ${state.last_analysis.trend_score}/100\n\n`;
        for (const s of state.last_analysis.sections) {
          report += `<b>${s.icon} ${s.title}</b>\n${s.content}\n\n`;
        }
        const msgId = await sendMsg(BOT_TOKEN, chatId, report.substring(0, 4000), postAnalysisButtons());
        state.last_bot_msgs = msgId ? [msgId] : [];
        await setState(supabase, userId, state);
        return new Response("OK");
      }

      // ── Deep analysis types ──
      if (action.startsWith("deep_") && state.last_analysis && state.parsed_task) {
        const type = action.replace("deep_", "");
        const loadId = await sendMsg(BOT_TOKEN, chatId, "⏳ Processando análise avançada...");
        const result = await deepAnalysis(type, state.parsed_task, state.last_analysis);
        if (loadId) await deleteMsg(BOT_TOKEN, chatId, loadId);

        const typeNames: Record<string, string> = { critica: "🔬 ANÁLISE CRÍTICA", padroes: "🧩 PADRÕES OCULTOS", factual: "📊 DADOS FACTUAIS", aprofundar: "🔎 ANÁLISE PROFUNDA" };
        const msgId = await sendMsg(BOT_TOKEN, chatId, `<b>${typeNames[type] || "ANÁLISE"}</b>\n\n${result}`, {
          inline_keyboard: [
            [{ text: "◀️ Voltar", callback_data: "back_summary" }, { text: "🤖 Agente", callback_data: "enter_agent" }],
            [{ text: "🔄 Nova Análise", callback_data: "new_analysis" }],
          ],
        });
        state.last_bot_msgs = msgId ? [msgId] : [];
        await setState(supabase, userId, state);
        return new Response("OK");
      }

      // ── Enter agent mode ──
      if (action === "enter_agent") {
        const history: { role: string; content: string }[] = [];
        if (state.last_analysis && state.parsed_task) {
          history.push({ role: "assistant", content: `Contexto da última análise: ${state.parsed_task.tema} - ${state.last_analysis.summary}` });
        }
        const newState: UserState = { step: "agent", mode: "agent", conversation_history: history, last_analysis: state.last_analysis, parsed_task: state.parsed_task };
        await setState(supabase, userId, newState);
        const msgId = await sendMsg(BOT_TOKEN, chatId, `<b>🤖 MODO AGENTE ATIVADO</b>

Pergunte qualquer coisa. Sem limites, sem filtros.

Posso: análise de mercado, tecnologia, estratégia, código, segurança, dados, business, tendências — tudo.

<i>Digite /menu para voltar ao menu principal
Digite /buscar [termo] para busca em tempo real</i>`, {
          inline_keyboard: [[{ text: "◀️ Voltar ao Menu", callback_data: "main_menu" }]],
        });
        newState.last_bot_msgs = msgId ? [msgId] : [];
        await setState(supabase, userId, newState);
        return new Response("OK");
      }

      // ── Mode selection ──
      if (action === "mode_analysis") {
        await setState(supabase, userId, { step: "awaiting_request", mode: "analysis", last_bot_msgs: [] });
        await sendMsg(BOT_TOKEN, chatId, "📊 Descreva a análise que deseja executar.\n\n<i>Ex: \"mercado de agendamentos para barbearias\", \"SaaS para pet shops\", \"CRM para imobiliárias\"</i>");
        return new Response("OK");
      }

      // ── Main menu ──
      if (action === "main_menu") {
        await setState(supabase, userId, { step: "idle", last_bot_msgs: [] });
        await sendMsg(BOT_TOKEN, chatId, "<b>⚡ GENESIS — Agente de Inteligência</b>\n\nEscolha o modo:", mainMenuButtons());
        return new Response("OK");
      }

      // ── New analysis ──
      if (action === "new_analysis") {
        await setState(supabase, userId, { step: "awaiting_request", mode: "analysis", last_bot_msgs: [] });
        await sendMsg(BOT_TOKEN, chatId, "Descreva a análise desejada.");
        return new Response("OK");
      }

      // ── Confirm analysis ──
      if (action === "confirm_analysis") {
        if (!state.parsed_task) {
          await sendMsg(BOT_TOKEN, chatId, "⚠️ Nenhuma solicitação pendente.");
          await setState(supabase, userId, { step: "awaiting_request" });
          return new Response("OK");
        }

        await setState(supabase, userId, { ...state, step: "processing" });
        await logIt(supabase, userId, "confirm", JSON.stringify(state.parsed_task));

        const statusId = await sendMsg(BOT_TOKEN, chatId, "⏳ Coletando dados do Google...");
        const stages = ["📡 Analisando tendências...", "🔍 Cruzando dados...", "📊 Gerando insights..."];
        for (const stage of stages) {
          await new Promise(r => setTimeout(r, 1200));
          if (statusId) await editMsg(BOT_TOKEN, chatId, statusId, stage);
        }

        const analysis = await executeAnalysis(state.parsed_task);
        if (statusId) await deleteMsg(BOT_TOKEN, chatId, statusId);

        const newState: UserState = { step: "viewing_results", mode: "analysis", parsed_task: state.parsed_task, last_analysis: analysis };
        const msgId = await sendMsg(BOT_TOKEN, chatId, summaryCard(analysis, state.parsed_task), sectionButtons(analysis.sections));
        newState.last_bot_msgs = msgId ? [msgId] : [];
        await setState(supabase, userId, newState);
        return new Response("OK");
      }

      // ── Cancel ──
      if (action === "cancel_analysis") {
        await setState(supabase, userId, { step: "idle", last_bot_msgs: [] });
        await sendMsg(BOT_TOKEN, chatId, "Cancelado.", mainMenuButtons());
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
      await setState(supabase, userId, { step: "idle", last_bot_msgs: [] });
      await logIt(supabase, userId, "/start", "init");
      await sendMsg(BOT_TOKEN, chatId, `<b>⚡ GENESIS — Agente de Inteligência</b>

Olá, <b>${firstName}</b>!

Sou um agente de inteligência avançado com acesso a dados do Google em tempo real.

Escolha o modo:`, mainMenuButtons());
      return new Response("OK");
    }

    // ── /menu ──
    if (text === "/menu") {
      await setState(supabase, userId, { step: "idle", last_bot_msgs: [] });
      await sendMsg(BOT_TOKEN, chatId, "<b>⚡ GENESIS</b>\n\nEscolha:", mainMenuButtons());
      return new Response("OK");
    }

    const state = await getState(supabase, userId);

    // ══ AGENT MODE ══════════════════════════════════════════════════
    if (state.mode === "agent" && state.step === "agent") {
      await logIt(supabase, userId, "agent", text);

      // Handle /buscar command for real-time search in agent mode
      if (text.startsWith("/buscar ")) {
        const query = text.replace("/buscar ", "").trim();
        const loadId = await sendMsg(BOT_TOKEN, chatId, `🔍 Buscando: <i>${query}</i>...`);

        const [results, news] = await Promise.all([
          searchGoogle(query),
          searchGoogle(query, "news", 5),
        ]);

        let response = `<b>🔍 BUSCA: ${query}</b>\n\n`;

        if (results.length > 0) {
          response += `<b>📋 Resultados:</b>\n`;
          results.slice(0, 5).forEach((r: any) => {
            response += `• <b>${r.title}</b>\n  ${r.snippet || ""}\n\n`;
          });
        }

        if (news.length > 0) {
          response += `<b>📰 Notícias:</b>\n`;
          news.slice(0, 3).forEach((r: any) => {
            response += `• ${r.title} <i>(${r.date || "Recente"})</i>\n`;
          });
        }

        if (loadId) await deleteMsg(BOT_TOKEN, chatId, loadId);

        // Add to conversation history
        const history = state.conversation_history || [];
        history.push({ role: "user", content: `[BUSCA] ${query}` });
        history.push({ role: "assistant", content: response.replace(/<[^>]+>/g, "") });

        state.conversation_history = history;
        const msgId = await sendMsg(BOT_TOKEN, chatId, response.substring(0, 4000), {
          inline_keyboard: [
            [{ text: "🔬 Analisar isso", callback_data: "deep_aprofundar" }],
            [{ text: "◀️ Menu", callback_data: "main_menu" }],
          ],
        });
        state.last_bot_msgs = msgId ? [msgId] : [];
        await setState(supabase, userId, state);
        return new Response("OK");
      }

      // Regular agent conversation
      const history = state.conversation_history || [];
      history.push({ role: "user", content: text });

      // Check if user wants real-time data
      let searchContext = "";
      const needsSearch = text.match(/\b(buscar|pesquisar|dados atuais|tempo real|google|mercado|tendência|preço|cotação|notícias)\b/i);
      if (needsSearch) {
        const results = await searchGoogle(text, "search", 5);
        if (results.length > 0) {
          searchContext = `\n\n[DADOS GOOGLE EM TEMPO REAL]\n${results.map((r: any) => `• ${r.title}: ${r.snippet}`).join("\n")}`;
        }
      }

      const fullHistory = [...history];
      if (searchContext) {
        fullHistory[fullHistory.length - 1] = { role: "user", content: text + searchContext };
      }

      const reply = await callAIChat(AGENT_SYSTEM, fullHistory);
      history.push({ role: "assistant", content: reply });

      state.conversation_history = history.slice(-30); // keep last 30 msgs
      const msgId = await sendMsg(BOT_TOKEN, chatId, reply.substring(0, 4000), {
        inline_keyboard: [[{ text: "◀️ Menu", callback_data: "main_menu" }]],
      });
      state.last_bot_msgs = msgId ? [msgId] : [];
      await setState(supabase, userId, state);
      return new Response("OK");
    }

    // ══ ANALYSIS MODE ═══════════════════════════════════════════════
    // Auto-start if idle
    if (state.step === "idle") {
      await setState(supabase, userId, { step: "awaiting_request" });
      // Fall through to handle the text as a request
    }

    if (state.step === "processing") {
      await sendMsg(BOT_TOKEN, chatId, "⏳ Análise em andamento. Aguarde.");
      return new Response("OK");
    }

    // Parse and confirm
    await logIt(supabase, userId, "request", text);
    const parsed = await parseRequest(text);

    await setState(supabase, userId, {
      step: "awaiting_confirmation",
      mode: "analysis",
      pending_request: text,
      parsed_task: parsed,
      last_bot_msgs: [],
    });

    await sendMsg(BOT_TOKEN, chatId, `<b>📋 Análise identificada</b>

<b>Tema:</b> ${parsed.tema}
<b>Segmento:</b> ${parsed.segmento}
<b>Objetivo:</b> ${parsed.objetivo}

<b>Será executado:</b>
• Coleta Google em tempo real
• Análise de tendências + SaaS mais procurados
• Mapeamento de concorrência
• Identificação de gaps e oportunidades

Confirma?`, {
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
