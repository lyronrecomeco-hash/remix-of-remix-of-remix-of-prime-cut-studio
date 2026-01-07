import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================================
// CHATBOT ENGINE - ENTERPRISE FLOW CONTROL
// Sistema de autoatendimento profissional com fluxo
// guiado, controlado e escalável
// =====================================================

// =====================================================
// INTERFACES
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
  flow_config: FlowConfig;
  max_attempts: number;
  fallback_message: string;
  company_name: string;
}

interface FlowStep {
  id: string;
  type: 'greeting' | 'menu' | 'submenu' | 'collect' | 'ai' | 'transfer' | 'end';
  message: string;
  options?: MenuOption[];
  next?: string;
  transitions?: Record<string, string>;
  ai_enabled?: boolean;
  collect_field?: string;
  validation?: string;
}

interface MenuOption {
  id: string | number;
  text: string;
  emoji?: string;
  next?: string;
}

interface FlowConfig {
  version?: string;
  steps: Record<string, FlowStep>;
  startStep: string;
  greetings?: {
    morning?: string;
    afternoon?: string;
    evening?: string;
  };
  settings?: {
    greeting_dynamic?: boolean;
    morning_greeting?: string;
    afternoon_greeting?: string;
    evening_greeting?: string;
  };
}

interface Session {
  id: string;
  chatbot_id: string;
  contact_id: string;
  instance_id: string | null;
  current_step: string;
  current_step_id: string;
  awaiting_response: boolean;
  awaiting_type: string | null;
  expected_options: any;
  context: Record<string, any>;
  history: Array<{ role: 'user' | 'bot'; message: string; timestamp: string }>;
  status: 'active' | 'completed' | 'timeout' | 'cancelled';
  attempt_count: number;
  step_data: Record<string, any>;
}

interface IncomingMessage {
  from: string;
  message: string;
  instanceId: string;
  messageId?: string;
  timestamp?: string;
}

// =====================================================
// HELPER: Dedup - evitar processar mesma mensagem 2x
// =====================================================
async function checkAndRegisterDedup(
  supabase: any,
  instanceId: string,
  messageId: string | undefined,
  fromJid: string
): Promise<boolean> {
  // Se não há messageId, não podemos fazer dedup - permitir
  if (!messageId) return true;

  try {
    const { error } = await supabase
      .from('chatbot_inbound_dedup')
      .insert({
        instance_id: instanceId,
        message_id: messageId,
        from_jid: fromJid,
      });

    // Se constraint unique falhou = já existe = duplicada
    if (error) {
      if (error.code === '23505') {
        console.log(`[DEDUP] Message ${messageId} already processed, skipping`);
        return false; // Duplicada
      }
      // Outro erro, logar mas permitir
      console.error('[DEDUP] Insert error (allowing):', error.message);
    }

    return true; // Primeira vez, processar
  } catch (e) {
    console.error('[DEDUP] Exception (allowing):', e);
    return true;
  }
}

// =====================================================
// CONSTANTS
// =====================================================
const LUNA_BASE_PROMPT = `Você é Luna, a assistente virtual inteligente.
Seu papel é auxiliar o usuário de forma clara, educada e objetiva.
Você deve SEMPRE respeitar o fluxo configurado.
Nunca avance passos sem confirmação válida.
Nunca invente informações.
Se o usuário sair do contexto, redirecione para o menu.
Responda de forma concisa (máximo 3 parágrafos).
Use emojis com moderação (máximo 2 por mensagem).`;

// =====================================================
// DEFAULT ENTERPRISE FLOW
// =====================================================
const DEFAULT_ENTERPRISE_FLOW: FlowConfig = {
  version: '2.0',
  startStep: 'greeting',
  steps: {
    greeting: {
      id: 'greeting',
      type: 'greeting',
      message: '{{saudacao}}\n\nSou a assistente virtual da {{empresa}}.\nPara te atender melhor, escolha uma das opções abaixo:',
      next: 'main_menu'
    },
    main_menu: {
      id: 'main_menu',
      type: 'menu',
      message: '📋 *Menu Principal*\n\nEscolha uma opção:',
      options: [
        { id: 1, text: '💰 Financeiro', emoji: '💰', next: 'menu_financeiro' },
        { id: 2, text: '📦 Produtos e Serviços', emoji: '📦', next: 'menu_produtos' },
        { id: 3, text: '📅 Agendamentos', emoji: '📅', next: 'menu_agendamentos' },
        { id: 4, text: '🔧 Suporte Técnico', emoji: '🔧', next: 'menu_suporte' },
        { id: 5, text: '👤 Falar com atendente', emoji: '👤', next: 'transfer_human' }
      ]
    },
    menu_financeiro: {
      id: 'menu_financeiro',
      type: 'submenu',
      message: '💰 *Financeiro*\n\nComo posso ajudar?',
      options: [
        { id: 1, text: '📄 Segunda via de boleto', next: 'action_boleto' },
        { id: 2, text: '💳 Status de pagamento', next: 'action_pagamento' },
        { id: 3, text: '🤝 Negociação', next: 'action_negociacao' },
        { id: 0, text: '↩️ Voltar ao menu', next: 'main_menu' }
      ]
    },
    menu_produtos: {
      id: 'menu_produtos',
      type: 'submenu',
      message: '📦 *Produtos e Serviços*\n\nO que você procura?',
      options: [
        { id: 1, text: '🔍 Ver catálogo', next: 'action_catalogo' },
        { id: 2, text: '💵 Consultar preços', next: 'action_precos' },
        { id: 3, text: '📝 Fazer pedido', next: 'action_pedido' },
        { id: 0, text: '↩️ Voltar ao menu', next: 'main_menu' }
      ]
    },
    menu_agendamentos: {
      id: 'menu_agendamentos',
      type: 'submenu',
      message: '📅 *Agendamentos*\n\nSelecione uma opção:',
      options: [
        { id: 1, text: '➕ Novo agendamento', next: 'action_novo_agendamento' },
        { id: 2, text: '🔄 Remarcar', next: 'action_remarcar' },
        { id: 3, text: '❌ Cancelar', next: 'action_cancelar' },
        { id: 0, text: '↩️ Voltar ao menu', next: 'main_menu' }
      ]
    },
    menu_suporte: {
      id: 'menu_suporte',
      type: 'submenu',
      message: '🔧 *Suporte Técnico*\n\nQual o problema?',
      options: [
        { id: 1, text: '🐛 Reportar problema', next: 'action_problema' },
        { id: 2, text: '❓ Dúvidas frequentes', next: 'action_faq' },
        { id: 3, text: '📞 Falar com técnico', next: 'transfer_human' },
        { id: 0, text: '↩️ Voltar ao menu', next: 'main_menu' }
      ]
    },
    // Ações genéricas (podem usar IA se habilitado)
    action_boleto: {
      id: 'action_boleto',
      type: 'collect',
      message: 'Para gerar a segunda via do boleto, preciso de alguns dados.\n\n📧 Por favor, informe seu *CPF ou CNPJ*:',
      collect_field: 'documento',
      ai_enabled: true,
      next: 'confirm_boleto'
    },
    confirm_boleto: {
      id: 'confirm_boleto',
      type: 'ai',
      message: 'Processando sua solicitação de segunda via...',
      ai_enabled: true,
      next: 'end_flow'
    },
    action_pagamento: {
      id: 'action_pagamento',
      type: 'ai',
      message: 'Consultando status de pagamento...\n\nPor favor, informe seu *CPF ou CNPJ* para consulta:',
      ai_enabled: true,
      next: 'end_flow'
    },
    action_negociacao: {
      id: 'action_negociacao',
      type: 'ai',
      message: '🤝 Vamos negociar!\n\nInforme seu *CPF ou CNPJ* para verificar suas pendências:',
      ai_enabled: true,
      next: 'end_flow'
    },
    action_catalogo: {
      id: 'action_catalogo',
      type: 'ai',
      message: '📦 Nosso catálogo completo está disponível!\n\nQual categoria você procura?',
      ai_enabled: true,
      next: 'end_flow'
    },
    action_precos: {
      id: 'action_precos',
      type: 'ai',
      message: '💵 Consulta de Preços\n\nQual produto você gostaria de consultar?',
      ai_enabled: true,
      next: 'end_flow'
    },
    action_pedido: {
      id: 'action_pedido',
      type: 'ai',
      message: '📝 Vamos fazer seu pedido!\n\nO que você gostaria de pedir?',
      ai_enabled: true,
      next: 'end_flow'
    },
    action_novo_agendamento: {
      id: 'action_novo_agendamento',
      type: 'ai',
      message: '📅 Novo Agendamento\n\nPara qual serviço você gostaria de agendar?',
      ai_enabled: true,
      next: 'end_flow'
    },
    action_remarcar: {
      id: 'action_remarcar',
      type: 'ai',
      message: '🔄 Remarcar Agendamento\n\nInforme o número do seu agendamento atual:',
      ai_enabled: true,
      next: 'end_flow'
    },
    action_cancelar: {
      id: 'action_cancelar',
      type: 'ai',
      message: '❌ Cancelar Agendamento\n\nInforme o número do seu agendamento:',
      ai_enabled: true,
      next: 'end_flow'
    },
    action_problema: {
      id: 'action_problema',
      type: 'ai',
      message: '🐛 Reportar Problema\n\nDescreva detalhadamente o problema que você está enfrentando:',
      ai_enabled: true,
      next: 'end_flow'
    },
    action_faq: {
      id: 'action_faq',
      type: 'ai',
      message: '❓ Perguntas Frequentes\n\nDigite sua dúvida que vou tentar ajudar:',
      ai_enabled: true,
      next: 'end_flow'
    },
    transfer_human: {
      id: 'transfer_human',
      type: 'transfer',
      message: '👤 Transferindo para atendente humano...\n\nUm momento, por favor. Em breve você será atendido por nossa equipe.\n\n_Horário de atendimento: Seg-Sex, 08h às 18h_',
      next: 'end_flow'
    },
    end_flow: {
      id: 'end_flow',
      type: 'menu',
      message: '✅ Posso te ajudar com mais alguma coisa?',
      options: [
        { id: 1, text: '📋 Voltar ao menu principal', next: 'main_menu' },
        { id: 2, text: '👋 Encerrar atendimento', next: 'goodbye' }
      ]
    },
    goodbye: {
      id: 'goodbye',
      type: 'end',
      message: '✅ Atendimento finalizado!\n\nObrigado por falar com a {{empresa}}.\nVolte sempre! 👋'
    }
  }
};

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
// HELPER: Normalizar texto
// =====================================================
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// =====================================================
// HELPER: Gerar saudação por horário
// =====================================================
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia ☀️';
  if (hour >= 12 && hour < 18) return 'Boa tarde 😊';
  return 'Boa noite 🌙';
}

// =====================================================
// HELPER: Gerar saudação dinâmica completa (com mensagens personalizadas)
// Suporta AMBOS formatos: greetings e settings
// =====================================================
function getDynamicGreeting(context: Record<string, any>): string {
  const hour = new Date().getHours();
  const companyName = context.company_name || 'nossa empresa';
  
  // Usa saudações personalizadas se disponíveis
  if (hour >= 5 && hour < 12) {
    const customGreeting = context.morning_greeting;
    if (customGreeting && customGreeting.trim()) {
      return customGreeting.replace(/\{\{empresa\}\}/gi, companyName);
    }
    return `Bom dia! ☀️ Bem-vindo(a) à ${companyName}!`;
  }
  if (hour >= 12 && hour < 18) {
    const customGreeting = context.afternoon_greeting;
    if (customGreeting && customGreeting.trim()) {
      return customGreeting.replace(/\{\{empresa\}\}/gi, companyName);
    }
    return `Boa tarde! 🌤️ Bem-vindo(a) à ${companyName}!`;
  }
  const customGreeting = context.evening_greeting;
  if (customGreeting && customGreeting.trim()) {
    return customGreeting.replace(/\{\{empresa\}\}/gi, companyName);
  }
  return `Boa noite! 🌙 Bem-vindo(a) à ${companyName}!`;
}

// =====================================================
// HELPER: Substituir variáveis
// =====================================================
function replaceVariables(text: string, context: Record<string, any>): string {
  if (!text) return '';
  
  const greeting = getGreeting();
  const dynamicGreeting = getDynamicGreeting(context);
  const companyName = context.company_name || 'Nossa Empresa';
  const clientName = context.client_name || 'Cliente';
  const product = context.product || 'nosso produto';
  
  return text
    .replace(/\{\{saudacao_dinamica\}\}/gi, dynamicGreeting)
    .replace(/\{\{saudacao\}\}/gi, greeting)
    .replace(/\{\{empresa\}\}/gi, companyName)
    .replace(/\{\{nome\}\}/gi, clientName)
    .replace(/\{\{produto\}\}/gi, product);
}

// =====================================================
// HELPER: Formatar menu
// =====================================================
function formatMenu(step: FlowStep): string {
  if (!step.options || step.options.length === 0) return step.message;
  
  const optionsText = step.options
    .map(opt => `${opt.id}️⃣ ${opt.text}`)
    .join('\n');
  
  return `${step.message}\n\n${optionsText}\n\n_Digite o número da opção:_`;
}

// =====================================================
// HELPER: Validar resposta de menu
// =====================================================
function validateMenuResponse(
  userMessage: string,
  options: MenuOption[]
): { valid: boolean; matchedOption: MenuOption | null } {
  const normalized = normalizeText(userMessage);
  
  // Match por número
  const numMatch = normalized.match(/^(\d+)$/);
  if (numMatch) {
    const num = parseInt(numMatch[1]);
    const found = options.find(o => o.id === num || o.id === String(num));
    if (found) return { valid: true, matchedOption: found };
  }
  
  // Match por texto
  for (const option of options) {
    const optText = normalizeText(option.text.replace(/[^\w\s]/g, ''));
    if (optText.includes(normalized) || normalized.includes(optText)) {
      return { valid: true, matchedOption: option };
    }
  }
  
  return { valid: false, matchedOption: null };
}

// =====================================================
// HELPER: Verificar gatilho (início de conversa)
// =====================================================
function checkKeywordTrigger(message: string, keywords: string[]): boolean {
  if (!keywords || keywords.length === 0) return false;
  if (keywords.includes('*')) return true;

  const normalized = normalizeText(message);
  return keywords.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    return normalized.includes(normalizedKeyword) || normalizedKeyword.includes(normalized);
  });
}

// =====================================================
// HELPER: Verificar reinício de sessão (NÃO usa trigger_keywords)
// Evita duplicação: usuário digita "corte" no meio do fluxo e não reinicia.
// =====================================================
const RESTART_KEYWORDS = new Set([
  'oi',
  'ola',
  'olá',
  'menu',
  'reiniciar',
  'recomecar',
  'recomeçar',
  'comecar',
  'começar',
  'inicio',
  'início',
  'start',
]);

function shouldRestartSession(message: string): boolean {
  const n = normalizeText(message);
  return RESTART_KEYWORDS.has(n);
}

// =====================================================
// HELPER: Enviar mensagem ao VPS
// - respeita rate-limit do backend ("Aguarde Xms")
// - considera payload { success: false }
// =====================================================
function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function sendMessage(
  supabase: any,
  instanceId: string,
  to: string,
  message: string,
  attempt: number = 0
): Promise<boolean> {
  try {
    const NATIVE_VPS_URL = 'http://72.62.108.24:3000';
    const NATIVE_VPS_TOKEN = 'genesis-master-token-2024-secure';

    const { data: globalConfig } = await supabase
      .from('whatsapp_backend_config')
      .select('backend_url, master_token')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: instance } = await supabase
      .from('genesis_instances')
      .select('backend_url, backend_token')
      .eq('id', instanceId)
      .maybeSingle();

    const backendUrl = (globalConfig?.backend_url || instance?.backend_url || NATIVE_VPS_URL) as string;
    const backendToken = (globalConfig?.master_token || instance?.backend_token || NATIVE_VPS_TOKEN) as string;

    const cleanUrl = backendUrl.replace(/\/$/, '');
    const targetUrl = `${cleanUrl}/api/instance/${instanceId}/send`;

    console.log('[SEND] Sending to', { instanceId, to: to.slice(0, 10) + '...', targetUrl });

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${backendToken}`,
      },
      body: JSON.stringify({
        phone: to,
        message,
        to,
        text: message,
        number: to,
        instanceId,
      }),
    });

    const responseText = await response.text();
    console.log('[SEND] Response', { status: response.status, preview: responseText.slice(0, 200) });

    let parsed: any = null;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = null;
    }

    // Alguns backends retornam 200 com { success: false, error: "Aguarde ...", retryAfter: 2 }
    if (parsed && typeof parsed.success === 'boolean') {
      if (parsed.success === true) return true;

      const retryAfterSec = typeof parsed.retryAfter === 'number' ? parsed.retryAfter : null;
      if (retryAfterSec && attempt < 2) {
        const waitMs = Math.max(1200, Math.round(retryAfterSec * 1000));
        await sleep(waitMs);
        return await sendMessage(supabase, instanceId, to, message, attempt + 1);
      }

      // Tenta extrair ms do texto "Aguarde 1122ms..." caso não tenha retryAfter
      const m = typeof parsed.error === 'string' ? parsed.error.match(/Aguarde\s+(\d+)ms/i) : null;
      if (m && attempt < 2) {
        const waitMs = Math.max(1200, parseInt(m[1], 10));
        await sleep(waitMs);
        return await sendMessage(supabase, instanceId, to, message, attempt + 1);
      }

      return false;
    }

    // HTTP não OK: pequeno retry
    if (!response.ok) {
      if (attempt < 1) {
        await sleep(1300);
        return await sendMessage(supabase, instanceId, to, message, attempt + 1);
      }
      return false;
    }

    return true;
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
    return { response: 'Desculpe, estou com dificuldades técnicas. Um momento, por favor.' };
  }
  
  const messages = [
    { role: 'system', content: `${LUNA_BASE_PROMPT}\n\n${systemPrompt}` },
  ];
  
  // Histórico recente
  const recentHistory = history.slice(-8);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.message,
    });
  }
  
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
        max_tokens: 400,
      }),
    });
    
    if (!response.ok) {
      console.error('[LUNA] API error:', response.status);
      return { response: 'Desculpe, estou processando muitas mensagens. Aguarde um momento.' };
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    
    return { response: content, reasoning: 'AI response' };
  } catch (e) {
    console.error('[LUNA] Error:', e);
    return { response: 'Ocorreu um erro. Por favor, tente novamente.' };
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
  if (forceNew) {
    await supabase
      .from('chatbot_sessions')
      .update({ status: 'cancelled', ended_at: new Date().toISOString() })
      .eq('contact_id', contactId)
      .eq('instance_id', instanceId)
      .eq('status', 'active');
  }
  
  const { data: existingSession } = await supabase
    .from('chatbot_sessions')
    .select('*')
    .eq('contact_id', contactId)
    .eq('instance_id', instanceId)
    .eq('status', 'active')
    .maybeSingle();
  
  if (existingSession && !forceNew) {
    return existingSession as Session;
  }
  
  const { data: newSession, error } = await supabase
    .from('chatbot_sessions')
    .insert({
      chatbot_id: chatbotId,
      contact_id: contactId,
      instance_id: instanceId,
      current_step: 'start',
      current_step_id: 'greeting',
      awaiting_response: false,
      context: {},
      history: [],
      status: 'active',
      attempt_count: 0,
      step_data: {},
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
  return newHistory.slice(-50);
}

// =====================================================
// CORE: Obter flow config do chatbot
// =====================================================
function getFlowConfig(chatbot: ChatbotConfig): FlowConfig {
  // Se tem flow_config customizado, usar
  if (chatbot.flow_config && Object.keys(chatbot.flow_config).length > 0 && chatbot.flow_config.steps) {
    return chatbot.flow_config;
  }
  
  // Usar flow padrão enterprise
  return DEFAULT_ENTERPRISE_FLOW;
}

// =====================================================
// CORE: Processar passo do fluxo
// =====================================================
async function processFlowStep(
  supabase: any,
  chatbot: ChatbotConfig,
  session: Session,
  userMessage: string | null,
  instanceId: string,
  contactId: string
): Promise<{ success: boolean; response: string }> {
  const flowConfig = getFlowConfig(chatbot);
  const currentStepId = session.current_step_id || flowConfig.startStep || 'greeting';
  const currentStep = flowConfig.steps[currentStepId];
  
  if (!currentStep) {
    console.error('[FLOW] Step not found:', currentStepId);
    return { success: false, response: 'Erro interno. Tente novamente.' };
  }
  
  // Extrair saudações personalizadas - suporta AMBOS formatos: greetings e settings
  const greetingConfig = flowConfig.greetings || {};
  const settingsConfig = flowConfig.settings || {};
  
  const context = {
    ...session.context,
    company_name: chatbot.company_name || 'Nossa Empresa',
    // Prioridade: settings (formato antigo) > greetings (formato novo)
    morning_greeting: settingsConfig.morning_greeting || greetingConfig.morning || null,
    afternoon_greeting: settingsConfig.afternoon_greeting || greetingConfig.afternoon || null,
    evening_greeting: settingsConfig.evening_greeting || greetingConfig.evening || null,
  };
  
  console.log(`[FLOW] Processing step: ${currentStepId}, type: ${currentStep.type}`);
  
  // =====================================================
  // GREETING: Primeira mensagem (sem input do usuário)
  // =====================================================
  if (currentStep.type === 'greeting' && !userMessage) {
    // Avançar para próximo passo (menu principal)
    const nextStepId = currentStep.next || 'main_menu';
    const nextStep = flowConfig.steps[nextStepId];

    const greetingMsg = replaceVariables(currentStep.message, context).trim();

    if (nextStep && (nextStep.type === 'menu' || nextStep.type === 'submenu')) {
      const menuMsg = replaceVariables(formatMenu(nextStep), context).trim();
      const combinedMsg = [greetingMsg, menuMsg].filter(Boolean).join('\n\n');

      const ok = await sendMessage(supabase, instanceId, contactId, combinedMsg);
      if (!ok) {
        await logSession(supabase, session.id, chatbot.id, 'send_failed', {
          messageOut: combinedMsg,
          stepFrom: currentStepId,
          stepTo: nextStepId,
          error: 'send_failed',
        });
        return { success: false, response: '' };
      }

      await updateSession(supabase, session.id, {
        current_step_id: nextStepId,
        awaiting_response: true,
        awaiting_type: 'menu',
        expected_options: nextStep.options || [],
        attempt_count: 0,
        history: addToHistory(session.history, 'bot', combinedMsg),
      });

      await logSession(supabase, session.id, chatbot.id, 'step_transition', {
        messageOut: combinedMsg,
        stepFrom: currentStepId,
        stepTo: nextStepId,
      });

      return { success: true, response: combinedMsg };
    }

    const ok = await sendMessage(supabase, instanceId, contactId, greetingMsg);
    return { success: ok, response: greetingMsg };
  }
  
  // =====================================================
  // MENU / SUBMENU: Aguardando resposta válida
  // =====================================================
  if ((currentStep.type === 'menu' || currentStep.type === 'submenu') && userMessage) {
    const options = currentStep.options || [];
    const validation = validateMenuResponse(userMessage, options);
    
    if (!validation.valid) {
      // Resposta inválida
      const attemptCount = (session.attempt_count || 0) + 1;
      const maxAttempts = chatbot.max_attempts || 3;
      
      if (attemptCount >= maxAttempts) {
        // Máximo de tentativas - encerrar educadamente
        const endMsg = `😔 Desculpe, não consegui entender suas respostas.\n\nSe precisar de ajuda, digite *oi* para reiniciar o atendimento.\n\nObrigado por falar com a ${context.company_name}!`;
        await sendMessage(supabase, instanceId, contactId, endMsg);
        
        await updateSession(supabase, session.id, {
          status: 'completed',
          history: addToHistory(session.history, 'bot', endMsg),
        });
        
        await logSession(supabase, session.id, chatbot.id, 'max_attempts_reached', {
          messageIn: userMessage,
          messageOut: endMsg,
          eventData: { attemptCount, maxAttempts },
        });
        
        return { success: true, response: endMsg };
      }
      
      // Repetir menu com fallback (1 envio só para evitar rate-limit/duplicação)
      const fallbackMsg = chatbot.fallback_message || 'Não entendi sua resposta. Por favor, escolha uma opção válida.';
      const finalMenuMsg = replaceVariables(formatMenu(currentStep), context);
      const combinedMsg = `${fallbackMsg}\n\n${finalMenuMsg}`.trim();

      await sendMessage(supabase, instanceId, contactId, combinedMsg);

      await updateSession(supabase, session.id, {
        attempt_count: attemptCount,
        history: addToHistory(
          addToHistory(session.history, 'user', userMessage),
          'bot',
          combinedMsg
        ),
      });

      await logSession(supabase, session.id, chatbot.id, 'invalid_response', {
        messageIn: userMessage,
        messageOut: combinedMsg,
        eventData: { attemptCount, remainingAttempts: maxAttempts - attemptCount },
      });

      return { success: true, response: combinedMsg };
    }
    
    // Resposta válida - avançar para próximo passo
    const matchedOption = validation.matchedOption!;
    const nextStepId = matchedOption.next || currentStep.next || 'end_flow';
    const nextStep = flowConfig.steps[nextStepId];
    
    if (!nextStep) {
      console.error('[FLOW] Next step not found:', nextStepId);
      return { success: false, response: 'Erro interno.' };
    }
    
    console.log(`[FLOW] Valid response, transitioning to: ${nextStepId}`);
    
    // Processar próximo passo
    return await processNextStep(
      supabase,
      chatbot,
      session,
      userMessage,
      instanceId,
      contactId,
      nextStep,
      nextStepId,
      context,
      flowConfig
    );
  }
  
  // =====================================================
  // COLLECT: Coletando dados
  // =====================================================
  if (currentStep.type === 'collect' && userMessage) {
    // Armazenar dado coletado
    const stepData = {
      ...session.step_data,
      [currentStep.collect_field || 'data']: userMessage,
    };
    
    // Se tem IA habilitada no passo, processar com Luna
    if (currentStep.ai_enabled && chatbot.ai_enabled) {
      const aiPrompt = chatbot.ai_system_prompt || '';
      const { response: aiResponse } = await callLunaAI(
        aiPrompt,
        userMessage,
        session.history,
        { ...context, ...stepData },
        chatbot.ai_temperature || 0.7
      );

      // Avançar para próximo passo
      const nextStepId = currentStep.next || 'end_flow';
      const nextStep = flowConfig.steps[nextStepId];

      const outParts: string[] = [aiResponse];
      if (nextStep && (nextStep.type === 'menu' || nextStep.type === 'submenu')) {
        outParts.push(replaceVariables(formatMenu(nextStep), context));
      }
      const outMsg = outParts.filter(Boolean).join('\n\n').trim();

      await sendMessage(supabase, instanceId, contactId, outMsg);

      await updateSession(supabase, session.id, {
        current_step_id: nextStepId,
        step_data: stepData,
        awaiting_response: nextStep?.type === 'menu' || nextStep?.type === 'submenu',
        awaiting_type: nextStep?.type === 'menu' || nextStep?.type === 'submenu' ? 'menu' : null,
        expected_options: nextStep?.options || [],
        attempt_count: 0,
        history: addToHistory(
          addToHistory(session.history, 'user', userMessage),
          'bot',
          outMsg
        ),
      });

      return { success: true, response: outMsg };
    }
    
    // Sem IA, só confirmar e avançar
    const confirmMsg = `✅ Dados recebidos. Processando...`;
    await sendMessage(supabase, instanceId, contactId, confirmMsg);
    
    const nextStepId = currentStep.next || 'end_flow';
    const nextStep = flowConfig.steps[nextStepId];
    
    if (nextStep) {
      return await processNextStep(
        supabase,
        chatbot,
        session,
        null,
        instanceId,
        contactId,
        nextStep,
        nextStepId,
        context,
        flowConfig
      );
    }
    
    return { success: true, response: confirmMsg };
  }
  
  // =====================================================
  // AI: Passo com IA
  // =====================================================
  if (currentStep.type === 'ai' && userMessage) {
    if (chatbot.ai_enabled) {
      const aiPrompt = chatbot.ai_system_prompt || '';
      const { response: aiResponse } = await callLunaAI(
        aiPrompt,
        userMessage,
        session.history,
        context,
        chatbot.ai_temperature || 0.7
      );
      
      await sendMessage(supabase, instanceId, contactId, aiResponse);
      
      // Avançar para próximo passo (geralmente end_flow)
      const nextStepId = currentStep.next || 'end_flow';
      const nextStep = flowConfig.steps[nextStepId];
      
      await updateSession(supabase, session.id, {
        current_step_id: nextStepId,
        history: addToHistory(
          addToHistory(session.history, 'user', userMessage),
          'bot',
          aiResponse
        ),
      });
      
      // Se próximo é menu (end_flow), enviar
      if (nextStep && (nextStep.type === 'menu' || nextStep.type === 'submenu')) {
        const menuMsg = formatMenu(nextStep);
        const finalMenuMsg = replaceVariables(menuMsg, context);
        await sendMessage(supabase, instanceId, contactId, finalMenuMsg);
        
        await updateSession(supabase, session.id, {
          awaiting_response: true,
          awaiting_type: 'menu',
          expected_options: nextStep.options || [],
          attempt_count: 0,
        });
      }
      
      return { success: true, response: aiResponse };
    }
    
    // Sem IA, mensagem genérica
    const genericMsg = currentStep.message || 'Entendido! Como posso ajudar mais?';
    await sendMessage(supabase, instanceId, contactId, genericMsg);
    return { success: true, response: genericMsg };
  }
  
  // =====================================================
  // TRANSFER: Transferir para humano
  // =====================================================
  if (currentStep.type === 'transfer') {
    const transferMsg = replaceVariables(currentStep.message, context);
    await sendMessage(supabase, instanceId, contactId, transferMsg);
    
    await updateSession(supabase, session.id, {
      status: 'completed',
      current_step_id: 'transfer_human',
      history: addToHistory(session.history, 'bot', transferMsg),
    });
    
    await logSession(supabase, session.id, chatbot.id, 'transfer_to_human', {
      messageOut: transferMsg,
    });
    
    return { success: true, response: transferMsg };
  }
  
  // =====================================================
  // END: Encerrar atendimento
  // =====================================================
  if (currentStep.type === 'end') {
    const endMsg = replaceVariables(currentStep.message, context);
    await sendMessage(supabase, instanceId, contactId, endMsg);
    
    await updateSession(supabase, session.id, {
      status: 'completed',
      history: addToHistory(session.history, 'bot', endMsg),
    });
    
    await logSession(supabase, session.id, chatbot.id, 'session_completed', {
      messageOut: endMsg,
    });
    
    return { success: true, response: endMsg };
  }
  
  // Fallback
  console.log('[FLOW] Unhandled step type:', currentStep.type);
  return { success: false, response: '' };
}

// =====================================================
// HELPER: Processar próximo passo
// =====================================================
async function processNextStep(
  supabase: any,
  chatbot: ChatbotConfig,
  session: Session,
  userMessage: string | null,
  instanceId: string,
  contactId: string,
  nextStep: FlowStep,
  nextStepId: string,
  context: Record<string, any>,
  flowConfig: FlowConfig
): Promise<{ success: boolean; response: string }> {
  // Atualizar sessão para novo passo
  await updateSession(supabase, session.id, {
    current_step_id: nextStepId,
    attempt_count: 0,
    history: userMessage 
      ? addToHistory(session.history, 'user', userMessage)
      : session.history,
  });
  
  // Menu/Submenu: Enviar opções
  if (nextStep.type === 'menu' || nextStep.type === 'submenu') {
    const menuMsg = formatMenu(nextStep);
    const finalMenuMsg = replaceVariables(menuMsg, context);
    await sendMessage(supabase, instanceId, contactId, finalMenuMsg);
    
    await updateSession(supabase, session.id, {
      awaiting_response: true,
      awaiting_type: 'menu',
      expected_options: nextStep.options || [],
      history: addToHistory(session.history, 'bot', finalMenuMsg),
    });
    
    await logSession(supabase, session.id, chatbot.id, 'step_transition', {
      messageIn: userMessage || undefined,
      messageOut: finalMenuMsg,
      stepTo: nextStepId,
    });
    
    return { success: true, response: finalMenuMsg };
  }
  
  // Collect: Enviar mensagem de coleta
  if (nextStep.type === 'collect') {
    const collectMsg = replaceVariables(nextStep.message, context);
    await sendMessage(supabase, instanceId, contactId, collectMsg);
    
    await updateSession(supabase, session.id, {
      awaiting_response: true,
      awaiting_type: 'collect',
      history: addToHistory(session.history, 'bot', collectMsg),
    });
    
    return { success: true, response: collectMsg };
  }
  
  // AI: Enviar mensagem inicial do passo IA
  if (nextStep.type === 'ai') {
    const aiMsg = replaceVariables(nextStep.message, context);
    await sendMessage(supabase, instanceId, contactId, aiMsg);
    
    await updateSession(supabase, session.id, {
      awaiting_response: true,
      awaiting_type: 'ai',
      history: addToHistory(session.history, 'bot', aiMsg),
    });
    
    return { success: true, response: aiMsg };
  }
  
  // Transfer
  if (nextStep.type === 'transfer') {
    const transferMsg = replaceVariables(nextStep.message, context);
    await sendMessage(supabase, instanceId, contactId, transferMsg);
    
    await updateSession(supabase, session.id, {
      status: 'completed',
      history: addToHistory(session.history, 'bot', transferMsg),
    });
    
    return { success: true, response: transferMsg };
  }
  
  // End
  if (nextStep.type === 'end') {
    const endMsg = replaceVariables(nextStep.message, context);
    await sendMessage(supabase, instanceId, contactId, endMsg);
    
    await updateSession(supabase, session.id, {
      status: 'completed',
      history: addToHistory(session.history, 'bot', endMsg),
    });
    
    return { success: true, response: endMsg };
  }
  
  return { success: false, response: '' };
}

// =====================================================
// MAIN: Processar mensagem recebida
// =====================================================
async function processIncomingMessage(
  supabase: any,
  message: IncomingMessage
): Promise<{ success: boolean; response?: string; chatbotId?: string; chatbotName?: string }> {
  const { from: contactId, message: userMessage, instanceId, messageId } = message;
  
  console.log(`[ENGINE] Processing message from ${contactId}: ${userMessage.slice(0, 50)}...`);

  // =====================================================
  // ANTI-DUPLICAÇÃO: Verificar se já processamos este messageId
  // =====================================================
  const isNew = await checkAndRegisterDedup(supabase, instanceId, messageId, contactId);
  if (!isNew) {
    // Mensagem duplicada - responder success mas não processar
    return { success: true, response: '[DEDUP] Already processed' };
  }
  
  // PRIORIDADE 1: Verificar sessão ativa
  const { data: activeSession } = await supabase
    .from('chatbot_sessions')
    .select('*, chatbot:whatsapp_automations(*)')
    .eq('contact_id', contactId)
    .eq('instance_id', instanceId)
    .eq('status', 'active')
    .maybeSingle();
  
  if (activeSession && activeSession.chatbot) {
    console.log(`[ENGINE] Found active session: ${activeSession.id}, step: ${activeSession.current_step_id}`);

    const chatbot = activeSession.chatbot as ChatbotConfig;

    // Verificar reinício APENAS com palavras explícitas (oi, menu, reiniciar...)
    // NÃO reinicia por trigger_keywords (evita duplicação: usuário digita "corte" e não reinicia)
    if (shouldRestartSession(userMessage)) {
      console.log(`[ENGINE] Restart keyword detected, restarting session`);
      const newSession = await getOrCreateSession(supabase, chatbot.id, contactId, instanceId, true);
      if (newSession) {
        const result = await processFlowStep(supabase, chatbot, newSession, null, instanceId, contactId);
        return { ...result, chatbotId: chatbot.id, chatbotName: chatbot.name };
      }
    }

    // Processar mensagem no fluxo atual
    const result = await processFlowStep(supabase, chatbot, activeSession, userMessage, instanceId, contactId);
    return { ...result, chatbotId: chatbot.id, chatbotName: chatbot.name };
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
      
      // Processar primeiro passo (greeting)
      const result = await processFlowStep(supabase, chatbot, session, null, instanceId, contactId);
      return { ...result, chatbotId: chatbot.id, chatbotName: chatbot.name };
    }
    
    // Trigger all messages
    if (chatbot.trigger_type === 'all') {
      console.log(`[ENGINE] Matched all-messages chatbot: ${chatbot.name}`);
      
      const session = await getOrCreateSession(supabase, chatbot.id, contactId, instanceId);
      if (!session) continue;
      
      const result = await processFlowStep(supabase, chatbot, session, userMessage, instanceId, contactId);
      return { ...result, chatbotId: chatbot.id, chatbotName: chatbot.name };
    }
  }
  
  console.log(`[ENGINE] No matching chatbot found`);
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
  
  await supabase
    .from('chatbot_sessions')
    .update({ status: 'timeout', ended_at: new Date().toISOString() })
    .eq('status', 'active')
    .lt('last_interaction_at', cutoffTime);
  
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
