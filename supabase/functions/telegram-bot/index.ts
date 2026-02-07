import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_API = "https://api.telegram.org/bot";

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: { id: number; type: string };
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: { id: number; first_name: string; last_name?: string; username?: string };
    message: { chat: { id: number }; message_id: number };
    data: string;
  };
}

// ─── Telegram helpers ────────────────────────────────────────────────
async function sendMessage(token: string, chatId: number, text: string, replyMarkup?: any) {
  const body: any = { chat_id: chatId, text, parse_mode: "HTML" };
  if (replyMarkup) body.reply_markup = replyMarkup;
  
  await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
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

async function editMessage(token: string, chatId: number, messageId: number, text: string, replyMarkup?: any) {
  const body: any = { chat_id: chatId, message_id: messageId, text, parse_mode: "HTML" };
  if (replyMarkup) body.reply_markup = replyMarkup;
  
  await fetch(`${TELEGRAM_API}${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── Main menu keyboard ─────────────────────────────────────────────
function mainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🔍 Consultar CPF", callback_data: "query_cpf" },
        { text: "🏢 Consultar CNPJ", callback_data: "query_cnpj" },
      ],
      [
        { text: "👤 Consultar Nome", callback_data: "query_nome" },
        { text: "📱 Consultar Telefone", callback_data: "query_telefone" },
      ],
      [
        { text: "🔗 Analisar Link", callback_data: "query_link" },
        { text: "💬 Analisar Mensagem", callback_data: "query_message" },
      ],
      [
        { text: "🔔 Monitoramento", callback_data: "monitoring" },
        { text: "📋 Meu Histórico", callback_data: "history" },
      ],
      [{ text: "ℹ️ Ajuda", callback_data: "help" }],
    ],
  };
}

// ─── AI Analysis ─────────────────────────────────────────────────────
async function analyzeWithAI(queryType: string, input: string): Promise<{
  riskLevel: string;
  fraudType: string;
  response: string;
}> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return {
      riskLevel: "indefinido",
      fraudType: "sem_analise",
      response: "⚠️ Sistema de IA temporariamente indisponível.",
    };
  }

  const prompts: Record<string, string> = {
    cpf: `Analise este CPF e avalie o risco de fraude: ${input}. Considere padrões comuns de golpes com CPF (clonagem, uso indevido em empréstimos, etc). Retorne: nível de risco (baixo/medio/alto/critico), tipo de golpe mais provável, e uma explicação simples e direta.`,
    cnpj: `Analise este CNPJ e avalie riscos: ${input}. Considere golpes com empresas fantasma, CNPJ fraudulento, etc. Retorne: nível de risco (baixo/medio/alto/critico), tipo de fraude provável, e explicação clara.`,
    nome: `Analise este nome para identificar possíveis riscos de fraude: ${input}. Busque padrões de golpistas conhecidos, perfis fake, etc. Retorne: nível de risco (baixo/medio/alto/critico), tipo de golpe, e explicação.`,
    telefone: `Analise este número de telefone para riscos de golpe: ${input}. Considere ligações fraudulentas, WhatsApp golpe, SMS phishing, etc. Retorne: nível de risco (baixo/medio/alto/critico), tipo de golpe, e explicação.`,
    link: `Analise este link/URL e avalie se é suspeito ou malicioso: ${input}. Verifique padrões de phishing, domínios falsos, etc. Retorne: nível de risco (baixo/medio/alto/critico), tipo de ameaça, e explicação.`,
    message: `Analise esta mensagem e avalie se parece ser um golpe: "${input}". Verifique padrões de engenharia social, promessas falsas, urgência artificial, etc. Retorne: nível de risco (baixo/medio/alto/critico), tipo de golpe identificado, e explicação.`,
  };

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em segurança digital e prevenção de fraudes no Brasil. 
Sempre responda em português brasileiro.
Formato da resposta:
🚦 NÍVEL DE RISCO: [BAIXO/MÉDIO/ALTO/CRÍTICO]
🎯 TIPO: [tipo do golpe]
📝 ANÁLISE: [explicação clara e direta, máximo 3 parágrafos]
💡 DICAS: [2-3 dicas de proteção]`,
          },
          { role: "user", content: prompts[queryType] || prompts.message },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      console.error("AI error:", res.status, await res.text());
      return {
        riskLevel: "indefinido",
        fraudType: "erro_analise",
        response: "⚠️ Erro ao processar análise de IA. Tente novamente em instantes.",
      };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "Análise indisponível.";

    // Extract risk level from response
    let riskLevel = "indefinido";
    if (content.includes("CRÍTICO")) riskLevel = "critico";
    else if (content.includes("ALTO")) riskLevel = "alto";
    else if (content.includes("MÉDIO")) riskLevel = "medio";
    else if (content.includes("BAIXO")) riskLevel = "baixo";

    // Extract fraud type
    let fraudType = "nao_identificado";
    const tipoMatch = content.match(/TIPO:\s*(.+?)(?:\n|$)/);
    if (tipoMatch) fraudType = tipoMatch[1].trim();

    return { riskLevel, fraudType, response: content };
  } catch (e) {
    console.error("AI analysis error:", e);
    return {
      riskLevel: "indefinido",
      fraudType: "erro",
      response: "⚠️ Erro interno na análise. Tente novamente.",
    };
  }
}

// ─── User state for multi-step flows ─────────────────────────────────
const userStates = new Map<number, { action: string; step: string }>();

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
    console.log("Telegram update received:", JSON.stringify(update).substring(0, 200));

    // ─── Handle callback queries (button clicks) ────────────────────
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const userId = cb.from.id;
      const data = cb.data;

      await answerCallback(BOT_TOKEN, cb.id);

      // Log
      await supabase.from("telbot_logs").insert({
        log_type: "command",
        telegram_user_id: userId,
        command: data,
        message: `Callback: ${data}`,
      });

      if (data.startsWith("query_")) {
        const queryType = data.replace("query_", "");
        const labels: Record<string, string> = {
          cpf: "CPF",
          cnpj: "CNPJ",
          nome: "Nome",
          telefone: "Telefone",
          link: "link/URL",
          message: "mensagem suspeita",
        };

        userStates.set(userId, { action: `query_${queryType}`, step: "waiting_input" });

        await editMessage(
          BOT_TOKEN,
          chatId,
          cb.message.message_id,
          `🔍 <b>Consulta de ${labels[queryType] || queryType}</b>\n\nEnvie o ${labels[queryType] || "dado"} que deseja consultar:`,
        );
        return new Response("OK");
      }

      if (data === "monitoring") {
        await editMessage(
          BOT_TOKEN,
          chatId,
          cb.message.message_id,
          "🔔 <b>Monitoramento</b>\n\nEscolha uma opção:",
          {
            inline_keyboard: [
              [
                { text: "➕ Cadastrar CPF", callback_data: "mon_add_cpf" },
                { text: "➕ Cadastrar CNPJ", callback_data: "mon_add_cnpj" },
              ],
              [
                { text: "➕ Cadastrar Nome", callback_data: "mon_add_nome" },
                { text: "📋 Meus Monitoramentos", callback_data: "mon_list" },
              ],
              [{ text: "◀️ Voltar", callback_data: "main_menu" }],
            ],
          },
        );
        return new Response("OK");
      }

      if (data.startsWith("mon_add_")) {
        const monType = data.replace("mon_add_", "");
        userStates.set(userId, { action: `monitor_${monType}`, step: "waiting_input" });
        await editMessage(
          BOT_TOKEN,
          chatId,
          cb.message.message_id,
          `🔔 <b>Cadastrar Monitoramento de ${monType.toUpperCase()}</b>\n\nEnvie o ${monType.toUpperCase()} que deseja monitorar:`,
        );
        return new Response("OK");
      }

      if (data === "mon_list") {
        const { data: monitors } = await supabase
          .from("telbot_monitoring")
          .select("*")
          .eq("telegram_user_id", userId)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(10);

        let text = "📋 <b>Seus Monitoramentos Ativos</b>\n\n";
        if (!monitors || monitors.length === 0) {
          text += "Nenhum monitoramento ativo.\nUse o menu para cadastrar um.";
        } else {
          monitors.forEach((m: any, i: number) => {
            text += `${i + 1}. <b>${m.monitor_type.toUpperCase()}</b>: ${m.monitor_value}\n   ✅ Verificações: ${m.check_count}\n\n`;
          });
        }

        await editMessage(BOT_TOKEN, chatId, cb.message.message_id, text, {
          inline_keyboard: [[{ text: "◀️ Voltar", callback_data: "monitoring" }]],
        });
        return new Response("OK");
      }

      if (data === "history") {
        const { data: queries } = await supabase
          .from("telbot_queries")
          .select("*")
          .eq("telegram_user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);

        let text = "📋 <b>Seu Histórico de Consultas</b>\n\n";
        if (!queries || queries.length === 0) {
          text += "Nenhuma consulta realizada ainda.";
        } else {
          const riskEmoji: Record<string, string> = {
            baixo: "🟢", medio: "🟡", alto: "🟠", critico: "🔴",
          };
          queries.forEach((q: any, i: number) => {
            const emoji = riskEmoji[q.risk_level] || "⚪";
            const date = new Date(q.created_at).toLocaleDateString("pt-BR");
            text += `${i + 1}. ${emoji} <b>${q.query_type.toUpperCase()}</b> - ${q.query_input.substring(0, 20)}...\n   📅 ${date} | Risco: ${q.risk_level || "N/A"}\n\n`;
          });
        }

        await editMessage(BOT_TOKEN, chatId, cb.message.message_id, text, {
          inline_keyboard: [[{ text: "◀️ Menu Principal", callback_data: "main_menu" }]],
        });
        return new Response("OK");
      }

      if (data === "help") {
        await editMessage(
          BOT_TOKEN,
          chatId,
          cb.message.message_id,
          `ℹ️ <b>Como usar o Bot Anti-Fraude</b>\n\n` +
            `🔍 <b>Consultas:</b> Analise CPFs, CNPJs, nomes, telefones, links e mensagens suspeitas usando IA.\n\n` +
            `🔔 <b>Monitoramento:</b> Cadastre dados para receber alertas automáticos quando houver novos indícios de fraude.\n\n` +
            `📋 <b>Histórico:</b> Veja todas as suas consultas anteriores.\n\n` +
            `<b>Comandos:</b>\n/start - Menu principal\n/menu - Abrir menu\n/ajuda - Esta mensagem`,
          { inline_keyboard: [[{ text: "◀️ Menu Principal", callback_data: "main_menu" }]] },
        );
        return new Response("OK");
      }

      if (data === "main_menu") {
        userStates.delete(userId);
        await editMessage(
          BOT_TOKEN,
          chatId,
          cb.message.message_id,
          "🛡️ <b>Bot Anti-Fraude</b>\n\nEscolha uma opção do menu abaixo:",
          mainMenuKeyboard(),
        );
        return new Response("OK");
      }

      return new Response("OK");
    }

    // ─── Handle text messages ────────────────────────────────────────
    if (update.message?.text) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const text = msg.text.trim();

      // Ensure user exists
      await supabase.from("telbot_users").upsert(
        {
          telegram_id: userId,
          telegram_username: msg.from.username || null,
          first_name: msg.from.first_name,
          last_name: msg.from.last_name || null,
          last_activity_at: new Date().toISOString(),
        },
        { onConflict: "telegram_id" },
      );

      // Commands
      if (text === "/start" || text === "/menu") {
        userStates.delete(userId);

        await supabase.from("telbot_logs").insert({
          log_type: "command",
          telegram_user_id: userId,
          command: text,
          message: `User ${msg.from.first_name} started bot`,
        });

        await sendMessage(
          BOT_TOKEN,
          chatId,
          `🛡️ <b>Bot Anti-Fraude</b>\n\nOlá, <b>${msg.from.first_name}</b>! 👋\n\nSou seu assistente de segurança digital. Posso analisar CPFs, CNPJs, links, mensagens suspeitas e muito mais usando Inteligência Artificial.\n\nEscolha uma opção:`,
          mainMenuKeyboard(),
        );
        return new Response("OK");
      }

      if (text === "/ajuda") {
        await sendMessage(
          BOT_TOKEN,
          chatId,
          `ℹ️ <b>Ajuda</b>\n\n/start - Menu principal\n/menu - Abrir menu\n/ajuda - Esta mensagem\n\nOu use os botões do menu interativo!`,
        );
        return new Response("OK");
      }

      // Handle user input based on state
      const state = userStates.get(userId);
      if (state && state.step === "waiting_input") {
        userStates.delete(userId);

        // Send processing message
        await sendMessage(BOT_TOKEN, chatId, "⏳ Analisando com IA... Aguarde.");

        const queryType = state.action.replace("query_", "").replace("monitor_", "");

        // If it's a monitoring action
        if (state.action.startsWith("monitor_")) {
          await supabase.from("telbot_monitoring").insert({
            telegram_user_id: userId,
            monitor_type: queryType,
            monitor_value: text,
            is_active: true,
          });

          await supabase.from("telbot_logs").insert({
            log_type: "info",
            telegram_user_id: userId,
            command: "monitor_add",
            message: `Added monitoring for ${queryType}: ${text}`,
          });

          await sendMessage(
            BOT_TOKEN,
            chatId,
            `✅ <b>Monitoramento Ativado!</b>\n\n📌 Tipo: <b>${queryType.toUpperCase()}</b>\n📌 Valor: <b>${text}</b>\n\nVocê receberá alertas automáticos quando houver novos indícios de fraude.`,
            { inline_keyboard: [[{ text: "◀️ Menu Principal", callback_data: "main_menu" }]] },
          );
          return new Response("OK");
        }

        // AI analysis for queries
        const analysis = await analyzeWithAI(queryType, text);

        // Save query
        await supabase.from("telbot_queries").insert({
          telegram_user_id: userId,
          query_type: queryType,
          query_input: text,
          risk_level: analysis.riskLevel,
          fraud_type: analysis.fraudType,
          ai_response: analysis.response,
        });

        // Update user stats
        await supabase
          .from("telbot_users")
          .update({ total_queries: undefined })
          .eq("telegram_id", userId);

        // Increment total_queries using raw increment
        await supabase.rpc("", {}).catch(() => {});
        // Simple update approach
        const { data: userData } = await supabase
          .from("telbot_users")
          .select("total_queries")
          .eq("telegram_id", userId)
          .single();
        
        if (userData) {
          await supabase
            .from("telbot_users")
            .update({ total_queries: (userData.total_queries || 0) + 1 })
            .eq("telegram_id", userId);
        }

        await supabase.from("telbot_logs").insert({
          log_type: "info",
          telegram_user_id: userId,
          command: `query_${queryType}`,
          message: `Query ${queryType}: ${text.substring(0, 50)} - Risk: ${analysis.riskLevel}`,
          metadata: { risk_level: analysis.riskLevel, fraud_type: analysis.fraudType },
        });

        await sendMessage(
          BOT_TOKEN,
          chatId,
          `${analysis.response}\n\n━━━━━━━━━━━━━━━━━━━━`,
          { inline_keyboard: [[{ text: "◀️ Menu Principal", callback_data: "main_menu" }]] },
        );
        return new Response("OK");
      }

      // Default: show menu
      await sendMessage(
        BOT_TOKEN,
        chatId,
        `Use /menu para abrir o menu interativo ou escolha uma opção:`,
        mainMenuKeyboard(),
      );
    }

    return new Response("OK");
  } catch (error) {
    console.error("Bot error:", error);
    return new Response("Error", { status: 500 });
  }
});
