import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================================
// CHATBOT ENGINE - CORE PROCESSOR
// Engine central para processamento de chatbots
// =====================================================

interface ChatbotConfig {
  id: string;
  name: string;
  trigger_type: string;
  trigger_keywords: string[];
  response_type: string;
  response_content: string | null;
  response_buttons: any;
  response_list: any;
  delay_seconds: number;
  ai_enabled: boolean;
  ai_model: string | null;
  ai_temperature: number;
  ai_system_prompt: string | null;
  is_active: boolean;
  instance_id: string | null;
}

interface Session {
  id: string;
  chatbot_id: string;
  contact_id: string;
  instance_id: string | null;
  current_step: string;
  awaiting_response: boolean;
  awaiting_type: string | null;
  expected_options: any;
  context: Record<string, any>;
  history: Array<{ role: 'user' | 'bot'; message: string; timestamp: string }>;
  status: 'active' | 'completed' | 'timeout' | 'cancelled';
}

interface IncomingMessage {
  from: string;
  message: string;
  instanceId: string;
  messageId?: string;
  timestamp?: string;
}

// Fallback message padrão
const FALLBACK_MESSAGE = `Não entendi 😅
Por favor, escolha uma opção válida para continuar.`;

// Luna system prompt base
const LUNA_BASE_PROMPT = `Você é Luna, a atendente virtual do Genesis Hub.
Seu papel é conduzir o usuário de forma clara, educada e objetiva.
Você deve SEMPRE respeitar o fluxo configurado.
Nunca avance passos sem confirmação válida.
Nunca invente informações.
Se o usuário sair do contexto, redirecione para o menu.`;

// =====================================================
// HELPER: Log de sessão
// =====================================================
async function logSession(
  supabase: any,
  sessionId: string | null,
  chatbotId: string,
  eventType: string,
  data: {
    messageIn?: string;
    messageOut?: string;
    lunaReasoning?: string;
    stepFrom?: string;
    stepTo?: string;
    error?: string;
    eventData?: any;
  }
) {
  try {
    await supabase.from('chatbot_session_logs').insert({
      session_id: sessionId,
      chatbot_id: chatbotId,
      event_type: eventType,
      message_in: data.messageIn,
      message_out: data.messageOut,
      luna_reasoning: data.lunaReasoning,
      step_from: data.stepFrom,
      step_to: data.stepTo,
      error_message: data.error,
      event_data: data.eventData || {},
    });
  } catch (e) {
    console.error('[LOG] Error logging session:', e);
  }
}

// =====================================================
// HELPER: Normalizar texto para comparação
// =====================================================
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// =====================================================
// HELPER: Validar resposta de menu
// =====================================================
function validateMenuResponse(
  userMessage: string,
  expectedOptions: any[]
): { valid: boolean; matchedOption: any | null } {
  const normalized = normalizeText(userMessage);
  
  // Tenta match por número
  const numMatch = normalized.match(/^(\d+)$/);
  if (numMatch) {
    const num = parseInt(numMatch[1]);
    if (expectedOptions && expectedOptions[num - 1]) {
      return { valid: true, matchedOption: expectedOptions[num - 1] };
    }
  }
  
  // Tenta match por texto
  for (const option of expectedOptions || []) {
    const optionText = normalizeText(option.text || option.label || '');
    if (optionText.includes(normalized) || normalized.includes(optionText)) {
      return { valid: true, matchedOption: option };
    }
  }
  
  return { valid: false, matchedOption: null };
}

// =====================================================
// HELPER: Verificar gatilho de palavra-chave
// =====================================================
function checkKeywordTrigger(message: string, keywords: string[]): boolean {
  if (!keywords || keywords.length === 0) return false;
  
  // Asterisco = match tudo
  if (keywords.includes('*')) return true;
  
  const normalized = normalizeText(message);
  return keywords.some(keyword => {
    const normalizedKeyword = normalizeText(keyword);
    return normalized.includes(normalizedKeyword) || normalizedKeyword.includes(normalized);
  });
}

// =====================================================
// HELPER: Enviar mensagem via proxy
// =====================================================
async function sendMessage(
  supabase: any,
  instanceId: string,
  to: string,
  message: string
): Promise<boolean> {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/genesis-backend-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'send',
        instanceId,
        endpoint: `/api/instance/${instanceId}/send`,
        method: 'POST',
        body: { to, message, type: 'text' },
      }),
    });
    
    const result = await response.json();
    return response.ok && result.success !== false;
  } catch (e) {
    console.error('[SEND] Error:', e);
    return false;
  }
}

// =====================================================
// HELPER: Chamar Luna IA
// =====================================================
async function callLunaAI(
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: string; message: string }>,
  context: Record<string, any>,
  temperature: number = 0.7
): Promise<{ response: string; reasoning?: string }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.error('[LUNA] No API key configured');
    return { response: 'Desculpe, estou com dificuldades técnicas. Tente novamente em instantes.' };
  }
  
  // Construir mensagens para a IA
  const messages = [
    { role: 'system', content: `${LUNA_BASE_PROMPT}\n\n${systemPrompt}` },
  ];
  
  // Adicionar histórico (últimas 10 mensagens)
  const recentHistory = history.slice(-10);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.message,
    });
  }
  
  // Adicionar mensagem atual
  messages.push({ role: 'user', content: userMessage });
  
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature,
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      console.error('[LUNA] API error:', response.status);
      return { response: 'Desculpe, estou processando muitas mensagens. Aguarde um momento.' };
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    
    return { response: content, reasoning: 'AI response generated' };
  } catch (e) {
    console.error('[LUNA] Error:', e);
    return { response: 'Desculpe, ocorreu um erro. Por favor, tente novamente.' };
  }
}

// =====================================================
// CORE: Obter ou criar sessão
// =====================================================
async function getOrCreateSession(
  supabase: any,
  chatbotId: string,
  contactId: string,
  instanceId: string,
  forceNew: boolean = false
): Promise<Session | null> {
  // Se forceNew, encerra sessões antigas
  if (forceNew) {
    await supabase
      .from('chatbot_sessions')
      .update({ status: 'cancelled', ended_at: new Date().toISOString() })
      .eq('contact_id', contactId)
      .eq('instance_id', instanceId)
      .eq('status', 'active');
  }
  
  // Buscar sessão ativa existente
  const { data: existingSession } = await supabase
    .from('chatbot_sessions')
    .select('*')
    .eq('contact_id', contactId)
    .eq('instance_id', instanceId)
    .eq('status', 'active')
    .single();
  
  if (existingSession && !forceNew) {
    return existingSession as Session;
  }
  
  // Criar nova sessão
  const { data: newSession, error } = await supabase
    .from('chatbot_sessions')
    .insert({
      chatbot_id: chatbotId,
      contact_id: contactId,
      instance_id: instanceId,
      current_step: 'start',
      awaiting_response: false,
      context: {},
      history: [],
      status: 'active',
    })
    .select()
    .single();
  
  if (error) {
    console.error('[SESSION] Error creating session:', error);
    return null;
  }
  
  return newSession as Session;
}

// =====================================================
// CORE: Atualizar sessão
// =====================================================
async function updateSession(
  supabase: any,
  sessionId: string,
  updates: Partial<Session>
): Promise<void> {
  await supabase
    .from('chatbot_sessions')
    .update({
      ...updates,
      last_interaction_at: new Date().toISOString(),
    })
    .eq('id', sessionId);
}

// =====================================================
// CORE: Adicionar ao histórico
// =====================================================
function addToHistory(
  history: Session['history'],
  role: 'user' | 'bot',
  message: string
): Session['history'] {
  const newHistory = [...history, { role, message, timestamp: new Date().toISOString() }];
  // Manter apenas últimas 50 mensagens
  return newHistory.slice(-50);
}

// =====================================================
// CORE: Processar resposta de texto simples
// =====================================================
async function processTextResponse(
  supabase: any,
  chatbot: ChatbotConfig,
  session: Session,
  instanceId: string,
  contactId: string
): Promise<{ success: boolean; response: string }> {
  const response = chatbot.response_content || 'Olá! Como posso ajudar?';
  
  // Enviar mensagem
  await sendMessage(supabase, instanceId, contactId, response);
  
  // Finalizar sessão para texto simples
  await updateSession(supabase, session.id, {
    status: 'completed',
    history: addToHistory(session.history, 'bot', response),
  });
  
  await logSession(supabase, session.id, chatbot.id, 'message_sent', {
    messageOut: response,
  });
  
  return { success: true, response };
}

// =====================================================
// CORE: Processar resposta com IA
// =====================================================
async function processAIResponse(
  supabase: any,
  chatbot: ChatbotConfig,
  session: Session,
  userMessage: string,
  instanceId: string,
  contactId: string
): Promise<{ success: boolean; response: string }> {
  const systemPrompt = chatbot.ai_system_prompt || '';
  const temperature = chatbot.ai_temperature || 0.7;
  
  // Adicionar mensagem do usuário ao histórico
  const updatedHistory = addToHistory(session.history, 'user', userMessage);
  
  // Chamar Luna IA
  const { response, reasoning } = await callLunaAI(
    systemPrompt,
    userMessage,
    updatedHistory,
    session.context,
    temperature
  );
  
  // Enviar resposta
  if (chatbot.delay_seconds > 0) {
    await new Promise(r => setTimeout(r, Math.min(chatbot.delay_seconds, 5) * 1000));
  }
  
  await sendMessage(supabase, instanceId, contactId, response);
  
  // Atualizar sessão
  const finalHistory = addToHistory(updatedHistory, 'bot', response);
  await updateSession(supabase, session.id, {
    history: finalHistory,
    awaiting_response: true, // Mantém sessão aberta para IA
    awaiting_type: 'text',
  });
  
  await logSession(supabase, session.id, chatbot.id, 'luna_decision', {
    messageIn: userMessage,
    messageOut: response,
    lunaReasoning: reasoning,
  });
  
  return { success: true, response };
}

// =====================================================
// CORE: Processar resposta de menu
// =====================================================
async function processMenuResponse(
  supabase: any,
  chatbot: ChatbotConfig,
  session: Session,
  userMessage: string,
  instanceId: string,
  contactId: string
): Promise<{ success: boolean; response: string }> {
  // Se aguardando resposta, validar
  if (session.awaiting_response && session.awaiting_type === 'menu') {
    const validation = validateMenuResponse(userMessage, session.expected_options);
    
    if (!validation.valid) {
      // Resposta inválida - repetir menu
      await sendMessage(supabase, instanceId, contactId, FALLBACK_MESSAGE);
      
      // Reenviar menu
      const menuText = chatbot.response_content || 'Escolha uma opção:';
      await sendMessage(supabase, instanceId, contactId, menuText);
      
      await logSession(supabase, session.id, chatbot.id, 'message_sent', {
        messageIn: userMessage,
        messageOut: FALLBACK_MESSAGE,
        eventData: { invalidResponse: true },
      });
      
      return { success: true, response: FALLBACK_MESSAGE };
    }
    
    // Resposta válida - processar opção
    // Aqui pode-se implementar lógica de próximo passo
    const response = `Você escolheu: ${validation.matchedOption?.text || userMessage}. Obrigado!`;
    await sendMessage(supabase, instanceId, contactId, response);
    
    await updateSession(supabase, session.id, {
      status: 'completed',
      history: addToHistory(session.history, 'bot', response),
    });
    
    return { success: true, response };
  }
  
  // Enviar menu inicial
  const menuText = chatbot.response_content || 'Escolha uma opção:';
  await sendMessage(supabase, instanceId, contactId, menuText);
  
  // Marcar como aguardando resposta
  await updateSession(supabase, session.id, {
    awaiting_response: true,
    awaiting_type: 'menu',
    expected_options: chatbot.response_list?.options || [],
    history: addToHistory(session.history, 'bot', menuText),
  });
  
  return { success: true, response: menuText };
}

// =====================================================
// MAIN: Processar mensagem recebida
// =====================================================
async function processIncomingMessage(
  supabase: any,
  message: IncomingMessage
): Promise<{ success: boolean; response?: string; chatbotId?: string; chatbotName?: string }> {
  const { from: contactId, message: userMessage, instanceId } = message;
  
  console.log(`[ENGINE] Processing message from ${contactId}: ${userMessage.slice(0, 50)}...`);
  
  // PRIORIDADE 1: Verificar sessão ativa aguardando resposta
  const { data: activeSession } = await supabase
    .from('chatbot_sessions')
    .select('*, chatbot:whatsapp_automations(*)')
    .eq('contact_id', contactId)
    .eq('instance_id', instanceId)
    .eq('status', 'active')
    .eq('awaiting_response', true)
    .single();
  
  if (activeSession && activeSession.chatbot) {
    console.log(`[ENGINE] Found active session awaiting response: ${activeSession.id}`);
    
    const chatbot = activeSession.chatbot as ChatbotConfig;
    
    // Verificar se é palavra-chave de reinício
    if (checkKeywordTrigger(userMessage, chatbot.trigger_keywords)) {
      console.log(`[ENGINE] Keyword detected, restarting session`);
      // Reiniciar sessão
      const newSession = await getOrCreateSession(supabase, chatbot.id, contactId, instanceId, true);
      if (newSession) {
        await logSession(supabase, newSession.id, chatbot.id, 'session_start', {
          messageIn: userMessage,
          eventData: { restarted: true },
        });
      }
    }
    
      // Processar de acordo com o tipo
      if (chatbot.ai_enabled) {
        const result = await processAIResponse(
          supabase,
          chatbot,
          activeSession,
          userMessage,
          instanceId,
          contactId
        );
        return { ...result, chatbotId: chatbot.id, chatbotName: chatbot.name };
      } else if (activeSession.awaiting_type === 'menu') {
        const result = await processMenuResponse(
          supabase,
          chatbot,
          activeSession,
          userMessage,
          instanceId,
          contactId
        );
        return { ...result, chatbotId: chatbot.id, chatbotName: chatbot.name };
      }
    }
  
  // PRIORIDADE 2: Verificar gatilho de palavra-chave
  const { data: chatbots } = await supabase
    .from('whatsapp_automations')
    .select('*')
    .eq('is_active', true)
    .or(`instance_id.eq.${instanceId},instance_id.is.null`)
    .order('priority', { ascending: true });
  
  for (const chatbot of (chatbots || []) as ChatbotConfig[]) {
    if (chatbot.trigger_type === 'keyword' && checkKeywordTrigger(userMessage, chatbot.trigger_keywords)) {
      console.log(`[ENGINE] Matched chatbot: ${chatbot.name}`);
      
      // Criar nova sessão
      const session = await getOrCreateSession(supabase, chatbot.id, contactId, instanceId, true);
      
      if (!session) {
        console.error('[ENGINE] Failed to create session');
        continue;
      }
      
      await logSession(supabase, session.id, chatbot.id, 'session_start', {
        messageIn: userMessage,
        eventData: { trigger: 'keyword' },
      });
      
      // Processar de acordo com o tipo de resposta
      let result;
      if (chatbot.ai_enabled) {
        result = await processAIResponse(supabase, chatbot, session, userMessage, instanceId, contactId);
      } else if (chatbot.response_type === 'text') {
        result = await processTextResponse(supabase, chatbot, session, instanceId, contactId);
      } else if (chatbot.response_type === 'list' || chatbot.response_type === 'menu') {
        result = await processMenuResponse(supabase, chatbot, session, userMessage, instanceId, contactId);
      }
      
      if (result) {
        return { ...result, chatbotId: chatbot.id, chatbotName: chatbot.name };
      }
    }
    
    // Verificar trigger all messages
    if (chatbot.trigger_type === 'all') {
      console.log(`[ENGINE] Matched all-messages chatbot: ${chatbot.name}`);
      
      const session = await getOrCreateSession(supabase, chatbot.id, contactId, instanceId);
      
      if (!session) continue;
      
      let result;
      if (chatbot.ai_enabled) {
        result = await processAIResponse(supabase, chatbot, session, userMessage, instanceId, contactId);
      } else if (chatbot.response_type === 'text') {
        result = await processTextResponse(supabase, chatbot, session, instanceId, contactId);
      }
      
      if (result) {
        return { ...result, chatbotId: chatbot.id, chatbotName: chatbot.name };
      }
    }
  }
  
  console.log(`[ENGINE] No matching chatbot found for message`);
  return { success: false };
}

// =====================================================
// CLEANUP: Encerrar sessões por timeout
// =====================================================
async function cleanupTimeoutSessions(supabase: any, timeoutMinutes: number = 30): Promise<number> {
  const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000).toISOString();
  
  const { data: timedOutSessions } = await supabase
    .from('chatbot_sessions')
    .select('id, chatbot_id')
    .eq('status', 'active')
    .lt('last_interaction_at', cutoffTime);
  
  if (!timedOutSessions || timedOutSessions.length === 0) {
    return 0;
  }
  
  // Marcar como timeout
  await supabase
    .from('chatbot_sessions')
    .update({ status: 'timeout', ended_at: new Date().toISOString() })
    .eq('status', 'active')
    .lt('last_interaction_at', cutoffTime);
  
  // Log
  for (const session of timedOutSessions) {
    await logSession(supabase, session.id, session.chatbot_id, 'timeout', {
      eventData: { timeoutMinutes },
    });
  }
  
  console.log(`[CLEANUP] Timed out ${timedOutSessions.length} sessions`);
  return timedOutSessions.length;
}

// =====================================================
// HANDLER
// =====================================================
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const body = await req.json();
    const { action, ...data } = body;

    switch (action) {
      case 'process_message': {
        const result = await processIncomingMessage(supabase, data as IncomingMessage);
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'cleanup_timeout': {
        const timeoutMinutes = data.timeoutMinutes || 30;
        const count = await cleanupTimeoutSessions(supabase, timeoutMinutes);
        return new Response(
          JSON.stringify({ success: true, timedOut: count }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_session': {
        const { contactId, instanceId } = data;
        const { data: session } = await supabase
          .from('chatbot_sessions')
          .select('*')
          .eq('contact_id', contactId)
          .eq('instance_id', instanceId)
          .eq('status', 'active')
          .single();
        
        return new Response(
          JSON.stringify({ success: true, session }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'end_session': {
        const { sessionId, reason } = data;
        await supabase
          .from('chatbot_sessions')
          .update({ status: reason || 'completed', ended_at: new Date().toISOString() })
          .eq('id', sessionId);
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: any) {
    console.error('[ENGINE] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
