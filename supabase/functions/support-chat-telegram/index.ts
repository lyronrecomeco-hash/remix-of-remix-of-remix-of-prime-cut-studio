import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BOT_TOKEN = '8682592618:AAFtm4eyffbspScQ0LRm9miKGKiY7ltbR94';

async function getBotStatus(supabase: ReturnType<typeof createClient>) {
  const { data: settings } = await supabase
    .from('admin_settings')
    .select('settings')
    .eq('setting_type', 'telegram_support_bot')
    .maybeSingle();

  const rawSettings = (settings?.settings as any) || {};
  const enabled = Boolean(rawSettings.enabled);
  const chatId = rawSettings.telegram_chat_id ? String(rawSettings.telegram_chat_id) : null;

  return {
    enabled,
    adminChatId: chatId,
    available: enabled && Boolean(chatId),
  };
}

async function sendTelegramMessage(chatId: number | string, text: string, replyMarkup?: any) {
  const body: any = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (replyMarkup) body.reply_markup = JSON.stringify(replyMarkup);
  
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { action } = body;

     if (action === 'get_status') {
       const status = await getBotStatus(supabase);
       return new Response(JSON.stringify({ success: true, ...status }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
       });
     }

    // Action: notify_new_session — Called when user requests live support
    if (action === 'notify_new_session') {
      const { session_id, user_name, user_email, first_message } = body;

       const { adminChatId, available, enabled } = await getBotStatus(supabase);
       if (!available || !adminChatId) {
         return new Response(JSON.stringify({ success: false, available, enabled, error: 'Bot not configured' }), {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' }
         });
      }

      const text = `🆕 <b>Novo Report de Suporte</b>\n\n👤 <b>Nome:</b> ${user_name || 'N/A'}\n📧 <b>Email:</b> ${user_email || 'N/A'}\n\n💬 <b>Mensagem:</b>\n${first_message || 'Sem mensagem inicial'}`;

      const result = await sendTelegramMessage(adminChatId, text, {
        inline_keyboard: [[
          { text: '✅ Aceitar Report', callback_data: `accept_${session_id}` }
        ]]
      });

      // Save telegram message id for reference
      if (result.ok) {
        await supabase
          .from('support_chat_sessions')
          .update({
            admin_telegram_chat_id: adminChatId,
            admin_telegram_message_id: result.result.message_id,
          })
          .eq('id', session_id);
      }

       return new Response(JSON.stringify({ success: true, available: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Action: send_to_telegram — Forward user message to admin telegram
    if (action === 'send_to_telegram') {
      const { session_id, message } = body;
      
      const { data: session } = await supabase
        .from('support_chat_sessions')
        .select('*')
        .eq('id', session_id)
        .single();

      if (!session?.admin_telegram_chat_id) {
         return new Response(JSON.stringify({ success: false, error: 'No active admin' }), {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const text = `💬 <b>${session.user_name || 'Usuário'}:</b>\n${message}`;
      await sendTelegramMessage(session.admin_telegram_chat_id, text);

       return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Action: telegram_webhook — Handle Telegram updates (callback queries + messages)
    if (action === 'telegram_webhook') {
      const update = body.update;
      
      // Handle callback query (accept report)
      if (update?.callback_query) {
        const callbackData = update.callback_query.data;
        const chatId = update.callback_query.message.chat.id;
        
        if (callbackData?.startsWith('accept_')) {
          const sessionId = callbackData.replace('accept_', '');
          
          await supabase
            .from('support_chat_sessions')
            .update({ status: 'active', admin_telegram_chat_id: chatId })
            .eq('id', sessionId);

          // Insert system message
          await supabase
            .from('support_chat_messages')
            .insert({
              session_id: sessionId,
              sender_type: 'system',
              message: 'Equipe Genesis conectada. Como podemos ajudar?',
            });

          // Answer callback
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callback_query_id: update.callback_query.id,
              text: 'Report aceito! Responda nesta conversa.',
            }),
          });

          await sendTelegramMessage(chatId, '✅ Report aceito. Suas respostas serão enviadas diretamente ao usuário.\n\nDigite /fechar para encerrar o atendimento.');
        }
        
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle admin text messages (reply to user)
      if (update?.message?.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text;

        // Check for /fechar command
        if (text === '/fechar') {
          // Find active session for this chat
          const { data: session } = await supabase
            .from('support_chat_sessions')
            .select('id')
            .eq('admin_telegram_chat_id', chatId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (session) {
            await supabase
              .from('support_chat_sessions')
              .update({ status: 'closed', closed_at: new Date().toISOString() })
              .eq('id', session.id);

            await supabase
              .from('support_chat_messages')
              .insert({
                session_id: session.id,
                sender_type: 'system',
                message: 'Obrigado por entrar em contato com a equipe Genesis! 🙏 Ficamos felizes em ajudar. Se precisar de algo mais, estamos aqui!',
              });

            await sendTelegramMessage(chatId, '🔒 Atendimento encerrado.');
          }
          
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Forward to active session
        const { data: session } = await supabase
          .from('support_chat_sessions')
          .select('id')
          .eq('admin_telegram_chat_id', chatId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (session) {
          await supabase
            .from('support_chat_messages')
            .insert({
              session_id: session.id,
              sender_type: 'admin',
              message: text,
            });
        }

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Support telegram error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
