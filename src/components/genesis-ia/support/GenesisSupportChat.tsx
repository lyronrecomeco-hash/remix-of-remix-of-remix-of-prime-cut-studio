import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  ChevronDown,
  ExternalLink,
  Headphones,
  Loader2,
  MessageCircle,
  Send,
  Shield,
  Sparkles,
  User,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { supabase } from '@/integrations/supabase/client';

const WHATSAPP_SUPPORT_NUMBER = '5527920005215';
const SUPPORT_SETTING_TYPE = 'telegram_support_bot';
const QUICK_ACTIONS = ['Como funciona?', 'Scanner IA', 'Planos'];
const FUNCTIONS_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  hasWhatsAppButton?: boolean;
  timestamp?: string;
}

type ChatMode = 'ai' | 'connecting' | 'live' | 'closed';
type SupportAvailability = 'checking' | 'live' | 'whatsapp';

interface SupportChatResponse {
  reply?: string;
  hasWhatsAppButton?: boolean;
  error?: string;
}

interface SupportTelegramResponse {
  success?: boolean;
  error?: string;
}

const getTimestamp = () =>
  new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

const createMessage = (
  role: Message['role'],
  content: string,
  options?: Partial<Pick<Message, 'hasWhatsAppButton' | 'timestamp'>>,
): Message => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`,
  role,
  content,
  hasWhatsAppButton: options?.hasWhatsAppButton,
  timestamp: options?.timestamp,
});

const formatLiveTimestamp = (value?: string | null) => (value ? getTimestamp() : undefined);

const getWhatsAppLink = () =>
  `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent('Olá, preciso de suporte Genesis Hub')}`;

const getFallbackReply = (text: string) => {
  const query = text.toLowerCase();

  if (query.includes('scanner')) {
    return 'O **Scanner IA** encontra empresas sem presença digital e permite filtrar por cidade, nicho, estrelas e website. Se quiser, eu posso te orientar no fluxo ideal de uso.';
  }

  if (query.includes('radar')) {
    return 'O **Radar Global** faz buscas automáticas por cidades e nichos configurados, com filtros avançados e acompanhamento em tempo real.';
  }

  if (query.includes('plano') || query.includes('preço') || query.includes('valor')) {
    return 'A Genesis Hub trabalha com planos **mensal, trimestral e anual**. Se quiser suporte comercial ou ajuda com acesso, posso te direcionar para a equipe.';
  }

  return 'Recebi sua mensagem e posso ajudar com dúvidas sobre **Scanner IA, Radar Global, propostas, contratos, financeiro, Academia Genesis, Genesis WhatsApp e Central de Ajuda**.';
};

export function GenesisSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('ai');
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const [showSupportOptions, setShowSupportOptions] = useState(false);
  const [supportAvailability, setSupportAvailability] = useState<SupportAvailability>('checking');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, showSupportOptions]);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    const loadSupportAvailability = async () => {
      setSupportAvailability('checking');

      const { data, error } = await supabase
        .from('admin_settings')
        .select('settings')
        .eq('setting_type', SUPPORT_SETTING_TYPE)
        .maybeSingle();

      if (!active) return;

      if (error || !data?.settings) {
        setSupportAvailability('whatsapp');
        return;
      }

      const settings = data.settings as Record<string, unknown>;
      const enabled = settings.enabled === true;
      const rawChatId = settings.telegram_chat_id;
      const telegramChatId =
        typeof rawChatId === 'string'
          ? rawChatId.trim()
          : typeof rawChatId === 'number'
            ? String(rawChatId)
            : '';

      setSupportAvailability(enabled && telegramChatId ? 'live' : 'whatsapp');
    };

    void loadSupportAvailability();

    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!liveSessionId) return;

    const appendRealtimeMessage = (row: {
      id: string;
      message: string;
      sender_type: string;
      created_at?: string | null;
    }) => {
      if (row.sender_type !== 'admin' && row.sender_type !== 'system') return;

      setMessages((prev) => {
        if (prev.some((message) => message.id === row.id)) return prev;

        return [
          ...prev,
          {
            id: row.id,
            role: row.sender_type === 'admin' ? 'assistant' : 'system',
            content: row.message,
            timestamp: row.sender_type === 'admin' ? formatLiveTimestamp(row.created_at) : undefined,
          },
        ];
      });

      if (row.sender_type === 'system' && row.message.toLowerCase().includes('conectada')) {
        setChatMode('live');
      }

      if (row.sender_type === 'system' && row.message.toLowerCase().includes('obrigado')) {
        setChatMode('closed');
      }
    };

    void supabase
      .from('support_chat_messages')
      .select('id, message, sender_type, created_at')
      .eq('session_id', liveSessionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        data?.forEach((row) => appendRealtimeMessage(row));
      });

    const channel = supabase
      .channel(`support_${liveSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chat_messages',
          filter: `session_id=eq.${liveSessionId}`,
        },
        (payload) => appendRealtimeMessage(payload.new as { id: string; message: string; sender_type: string; created_at?: string | null }),
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_chat_sessions',
          filter: `id=eq.${liveSessionId}`,
        },
        (payload) => {
          const session = payload.new as { status?: string };
          if (session.status === 'active') setChatMode('live');
          if (session.status === 'closed') setChatMode('closed');
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [liveSessionId]);

  const canUseLiveSupport = supportAvailability === 'live';

  const header = useMemo(() => {
    if (chatMode === 'live') {
      return {
        icon: Headphones,
        title: 'Equipe Genesis',
        status: 'Atendimento ao vivo ativo',
        dotClassName: 'bg-primary',
      };
    }

    if (chatMode === 'connecting') {
      return {
        icon: Loader2,
        title: 'Conectando suporte',
        status: 'Preparando atendimento',
        dotClassName: 'bg-accent',
      };
    }

    if (chatMode === 'closed') {
      return {
        icon: Shield,
        title: 'Atendimento encerrado',
        status: 'Você pode iniciar uma nova conversa',
        dotClassName: 'bg-muted-foreground',
      };
    }

    return {
      icon: Sparkles,
      title: 'Genesis IA',
      status: canUseLiveSupport ? 'IA + suporte ao vivo' : 'IA + atendimento via WhatsApp',
      dotClassName: 'bg-primary',
    };
  }, [canUseLiveSupport, chatMode]);

  const detectSupportIntent = (text: string) => {
    const keywords = ['suporte', 'atendente', 'humano', 'falar com alguém', 'ajuda', 'support', 'help'];
    return keywords.some((keyword) => text.toLowerCase().includes(keyword));
  };

  const openWhatsApp = () => {
    window.open(getWhatsAppLink(), '_blank', 'noopener,noreferrer');
  };

  const invokeEdgeFunction = async <T,>(functionName: string, body: Record<string, unknown>): Promise<T> => {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, { body });

      if (error) throw error;
      if (!data) throw new Error('Resposta vazia da função');

      return data as T;
    } catch (initialError) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${FUNCTIONS_BASE_URL}/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const rawResponse = await response.text();
      let parsedResponse: unknown = {};

      if (rawResponse) {
        try {
          parsedResponse = JSON.parse(rawResponse);
        } catch {
          parsedResponse = { reply: rawResponse };
        }
      }

      if (!response.ok) {
        const message =
          typeof parsedResponse === 'object' && parsedResponse && 'error' in parsedResponse
            ? String((parsedResponse as { error?: string }).error)
            : initialError instanceof Error
              ? initialError.message
              : 'Falha ao conectar com o suporte';

        throw new Error(message);
      }

      return parsedResponse as T;
    }
  };

  const appendMessage = (message: Message) => {
    setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]));
  };

  const revealSupportOptions = () => {
    setShowSupportOptions(true);
    appendMessage(
      createMessage(
        'assistant',
        canUseLiveSupport
          ? 'Posso continuar por aqui ou te conectar ao **chat ao vivo** da equipe.'
          : 'Posso te ajudar por aqui ou te direcionar para o **WhatsApp** da equipe Genesis.',
        { timestamp: getTimestamp() },
      ),
    );
  };

  const startLiveSupport = async () => {
    if (!canUseLiveSupport) {
      openWhatsApp();
      return;
    }

    setShowSupportOptions(false);
    setChatMode('connecting');
    appendMessage(createMessage('system', 'Conectando você com a equipe Genesis...'));

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('genesis_users')
        .select('name, email')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      const userName = profile?.name || user.email?.split('@')[0] || 'Usuário';
      const userEmail = profile?.email || user.email || '';
      const firstMessage = [...messages].reverse().find((message) => message.role === 'user')?.content || '';

      const { data: session, error: sessionError } = await supabase
        .from('support_chat_sessions')
        .insert({
          user_id: user.id,
          user_name: userName,
          user_email: userEmail,
          first_message: firstMessage,
          status: 'waiting',
        })
        .select('id')
        .single();

      if (sessionError || !session) throw sessionError || new Error('Sessão de suporte não criada');

      setLiveSessionId(session.id);

      const telegramResult = await invokeEdgeFunction<SupportTelegramResponse>('support-chat-telegram', {
        action: 'notify_new_session',
        session_id: session.id,
        user_name: userName,
        user_email: userEmail,
        first_message: firstMessage,
      });

      if (telegramResult.error || telegramResult.success === false) {
        throw new Error(telegramResult.error || 'Não foi possível acionar o suporte ao vivo');
      }

      appendMessage(createMessage('system', 'Chamado enviado. Aguarde um atendente aceitar seu atendimento.'));
    } catch (error) {
      console.error('Live support error:', error);
      setChatMode('ai');
      setLiveSessionId(null);
      appendMessage(
        createMessage(
          'system',
          'O chat ao vivo está indisponível no momento. Você ainda pode continuar comigo aqui ou seguir para o WhatsApp da equipe.',
        ),
      );
      setShowSupportOptions(true);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setShowSupportOptions(false);

    const userMessage = createMessage('user', text, { timestamp: getTimestamp() });
    const nextMessages = [...messages, userMessage];

    appendMessage(userMessage);
    setInput('');

    if (chatMode === 'live' && liveSessionId) {
      setIsLoading(true);

      try {
        const { error: insertError } = await supabase.from('support_chat_messages').insert({
          session_id: liveSessionId,
          sender_type: 'user',
          message: text,
        });

        if (insertError) throw insertError;

        const telegramResult = await invokeEdgeFunction<SupportTelegramResponse>('support-chat-telegram', {
          action: 'send_to_telegram',
          session_id: liveSessionId,
          message: text,
        });

        if (telegramResult.error || telegramResult.success === false) {
          throw new Error(telegramResult.error || 'Falha ao enviar mensagem ao atendimento');
        }
      } catch (error) {
        console.error('Live support send error:', error);
        appendMessage(
          createMessage(
            'system',
            'Não foi possível entregar sua mensagem ao atendimento agora. Tente novamente ou use o WhatsApp da equipe.',
          ),
        );
        setShowSupportOptions(true);
      } finally {
        setIsLoading(false);
      }

      return;
    }

    if (detectSupportIntent(text)) {
      revealSupportOptions();
      return;
    }

    setIsLoading(true);

    try {
      const response = await invokeEdgeFunction<SupportChatResponse>('genesis-support-chat', {
        messages: nextMessages
          .filter((message) => message.role !== 'system')
          .map((message) => ({ role: message.role, content: message.content })),
      });

      const reply = response.reply || getFallbackReply(text);
      const hasWhatsAppButton = response.hasWhatsAppButton || false;

      appendMessage(createMessage('assistant', reply, { hasWhatsAppButton, timestamp: getTimestamp() }));

      if (hasWhatsAppButton) {
        setShowSupportOptions(true);
      }
    } catch (error) {
      console.error('Support chat error:', error);

      appendMessage(
        createMessage('assistant', getFallbackReply(text), {
          timestamp: getTimestamp(),
          hasWhatsAppButton: true,
        }),
      );

      setShowSupportOptions(true);
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setChatMode('ai');
    setLiveSessionId(null);
    setMessages([]);
    setInput('');
    setShowSupportOptions(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-primary text-primary-foreground shadow-xl transition-transform duration-200 hover:scale-[1.03]"
        aria-label="Abrir chat de suporte"
      >
        <Bot className="h-6 w-6" />
      </button>
    );
  }

  const HeaderIcon = header.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-24px)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl sm:bottom-5 sm:right-5 sm:w-[460px]"
      style={{ maxHeight: 'min(820px, calc(100vh - 32px))' }}
    >
      <div className="border-b border-border bg-background/95 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-muted text-primary">
              <HeaderIcon className={`h-5 w-5 ${chatMode === 'connecting' ? 'animate-spin' : ''}`} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{header.title}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${header.dotClassName}`} />
                <span className="truncate text-xs text-muted-foreground">{header.status}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar chat"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="min-h-[540px] max-h-[620px] flex-1 space-y-4 overflow-y-auto bg-background px-4 py-4 sm:px-5">
        {messages.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted text-primary">
              <Sparkles className="h-7 w-7" />
            </div>

            <h3 className="text-base font-semibold text-foreground">Olá! Sou a Genesis IA.</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Posso te ajudar com dúvidas sobre Scanner IA, Radar Global, propostas, contratos, financeiro e demais módulos da plataforma.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => setInput(question)}
                  className="rounded-full border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
              {supportAvailability === 'checking'
                ? 'Verificando disponibilidade do suporte humano...'
                : canUseLiveSupport
                  ? 'Suporte ao vivo disponível quando você solicitar atendimento humano.'
                  : 'No momento, o atendimento humano segue pelo WhatsApp da equipe.'}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id}>
            {message.role === 'system' ? (
              <div className="flex justify-center">
                <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
                  {message.content}
                </span>
              </div>
            ) : (
              <div className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-primary">
                    {chatMode === 'live' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                )}

                <div className="max-w-[82%]">
                  <div
                    className={
                      message.role === 'user'
                        ? 'rounded-3xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground'
                        : 'rounded-3xl rounded-bl-md border border-border bg-card px-4 py-3 text-sm leading-6 text-foreground'
                    }
                  >
                    {message.role === 'assistant' ? (
                      <div className="max-w-none text-sm leading-6 [&_a]:text-primary [&_a]:underline [&_li]:my-1 [&_ol]:my-2 [&_p]:my-1 [&_strong]:font-semibold [&_ul]:my-2">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      message.content
                    )}

                    {message.hasWhatsAppButton && (
                      <button
                        type="button"
                        onClick={openWhatsApp}
                        className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Abrir WhatsApp
                      </button>
                    )}
                  </div>

                  {message.timestamp && (
                    <span className={`mt-1 block text-[10px] text-muted-foreground ${message.role === 'user' ? 'text-right' : ''}`}>
                      {message.timestamp}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {showSupportOptions && (
          <div className="rounded-3xl border border-border bg-card p-3">
            <div className="grid gap-2">
              <button
                type="button"
                onClick={startLiveSupport}
                disabled={supportAvailability === 'checking'}
                className="flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-primary">
                  {supportAvailability === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">{canUseLiveSupport ? 'Chat ao vivo' : 'Atendimento humano'}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {supportAvailability === 'checking'
                      ? 'Verificando disponibilidade do suporte...'
                      : canUseLiveSupport
                        ? 'Abrir atendimento em tempo real com a equipe Genesis.'
                        : 'No momento, o atendimento humano segue via WhatsApp.'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={openWhatsApp}
                className="flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-muted"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-primary">
                  <ExternalLink className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">WhatsApp</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Falar diretamente com a equipe pelo WhatsApp.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start gap-2">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-primary">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 rounded-3xl rounded-bl-md border border-border bg-card px-4 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card px-4 py-4 sm:px-5">
        {chatMode === 'closed' ? (
          <button
            type="button"
            onClick={resetConversation}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
          >
            Iniciar nova conversa
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder={chatMode === 'live' ? 'Escreva para o atendimento...' : 'Digite sua dúvida...'}
              disabled={chatMode === 'connecting'}
              className="h-12 flex-1 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />

            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={!input.trim() || isLoading || chatMode === 'connecting'}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Enviar mensagem"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        )}

        <p className="mt-2 text-center text-[10px] text-muted-foreground">Genesis IA • suporte inteligente com atendimento humano quando disponível</p>
      </div>
    </motion.div>
  );
}
