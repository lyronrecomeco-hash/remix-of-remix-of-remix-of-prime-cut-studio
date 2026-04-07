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
const QUICK_ACTIONS = ['Como funciona?', 'Scanner IA', 'Planos', 'Preciso de ajuda'];

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  hasWhatsAppButton?: boolean;
  timestamp?: string;
}

type ChatMode = 'ai' | 'connecting' | 'live' | 'closed';

const ts = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random()}`;

const msg = (
  role: Message['role'],
  content: string,
  extra?: Partial<Pick<Message, 'hasWhatsAppButton' | 'timestamp'>>,
): Message => ({ id: uid(), role, content, ...extra });

const whatsappUrl = () =>
  `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent('Olá, preciso de suporte Genesis Hub')}`;

export function GenesisSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('ai');
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const [showSupportOptions, setShowSupportOptions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, showSupportOptions]);

  // Realtime for live chat
  useEffect(() => {
    if (!liveSessionId) return;

    const handle = (row: { id: string; message: string; sender_type: string; created_at?: string | null }) => {
      if (row.sender_type !== 'admin' && row.sender_type !== 'system') return;
      setMessages(prev => {
        if (prev.some(m => m.id === row.id)) return prev;
        return [...prev, {
          id: row.id,
          role: row.sender_type === 'admin' ? 'assistant' as const : 'system' as const,
          content: row.message,
          timestamp: row.sender_type === 'admin' ? ts() : undefined,
        }];
      });
      if (row.sender_type === 'system' && row.message.toLowerCase().includes('conectada')) setChatMode('live');
      if (row.sender_type === 'system' && row.message.toLowerCase().includes('obrigado')) setChatMode('closed');
    };

    supabase.from('support_chat_messages')
      .select('id, message, sender_type, created_at')
      .eq('session_id', liveSessionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => data?.forEach(handle));

    const channel = supabase
      .channel(`support_${liveSessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_chat_messages', filter: `session_id=eq.${liveSessionId}` },
        (payload) => handle(payload.new as any))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_chat_sessions', filter: `id=eq.${liveSessionId}` },
        (payload) => {
          const s = payload.new as any;
          if (s.status === 'active') setChatMode('live');
          if (s.status === 'closed') setChatMode('closed');
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [liveSessionId]);

  const append = (m: Message) => setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);

  const callAI = async (allMessages: Message[]): Promise<{ reply: string; hasWhatsAppButton: boolean }> => {
    const payload = {
      messages: allMessages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content })),
    };

    // Try supabase.functions.invoke first
    try {
      const { data, error } = await supabase.functions.invoke('genesis-support-chat', { body: payload });
      if (!error && data?.reply) return { reply: data.reply, hasWhatsAppButton: data.hasWhatsAppButton || false };
    } catch { /* fall through */ }

    // Direct fetch fallback
    const session = await supabase.auth.getSession();
    const token = session.data?.session?.access_token;

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/genesis-support-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { reply: json.reply || 'Desculpe, não consegui processar.', hasWhatsAppButton: json.hasWhatsAppButton || false };
  };

  const callTelegram = async (body: Record<string, unknown>) => {
    try {
      const { data, error } = await supabase.functions.invoke('support-chat-telegram', { body });
      if (!error && data) return data;
    } catch { /* fall through */ }

    const session = await supabase.auth.getSession();
    const token = session.data?.session?.access_token;

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    return res.json();
  };

  const startLiveSupport = async () => {
    setShowSupportOptions(false);
    setChatMode('connecting');
    append(msg('system', 'Conectando você com a equipe Genesis...'));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { data: profile } = await supabase
        .from('genesis_users')
        .select('name, email')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      const userName = profile?.name || user.email?.split('@')[0] || 'Usuário';
      const userEmail = profile?.email || user.email || '';
      const firstMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

      const { data: session, error } = await supabase
        .from('support_chat_sessions')
        .insert({ user_id: user.id, user_name: userName, user_email: userEmail, first_message: firstMessage, status: 'waiting' })
        .select('id')
        .single();

      if (error || !session) throw error || new Error('Sessão não criada');
      setLiveSessionId(session.id);

      await callTelegram({
        action: 'notify_new_session',
        session_id: session.id,
        user_name: userName,
        user_email: userEmail,
        first_message: firstMessage,
      });

      append(msg('system', 'Chamado enviado! Aguardando um atendente aceitar...'));
    } catch (err) {
      console.error('Live support error:', err);
      setChatMode('ai');
      setLiveSessionId(null);
      append(msg('system', 'Não foi possível conectar ao suporte ao vivo. Tente novamente ou use o WhatsApp.'));
      setShowSupportOptions(true);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setShowSupportOptions(false);
    const userMsg = msg('user', text, { timestamp: ts() });
    const next = [...messages, userMsg];
    append(userMsg);
    setInput('');

    // Live mode: send to telegram
    if (chatMode === 'live' && liveSessionId) {
      setIsLoading(true);
      try {
        await supabase.from('support_chat_messages').insert({ session_id: liveSessionId, sender_type: 'user', message: text });
        await callTelegram({ action: 'send_to_telegram', session_id: liveSessionId, message: text });
      } catch (err) {
        console.error('Live send error:', err);
        append(msg('system', 'Erro ao enviar mensagem. Tente novamente.'));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // AI mode
    setIsLoading(true);
    try {
      const result = await callAI(next);
      append(msg('assistant', result.reply, { hasWhatsAppButton: result.hasWhatsAppButton, timestamp: ts() }));
      if (result.hasWhatsAppButton) setShowSupportOptions(true);
    } catch (err) {
      console.error('AI chat error:', err);
      append(msg('assistant', 'Desculpe, estou com dificuldades técnicas no momento. Tente novamente em instantes ou fale com a equipe pelo WhatsApp.', { hasWhatsAppButton: true, timestamp: ts() }));
      setShowSupportOptions(true);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setChatMode('ai');
    setLiveSessionId(null);
    setMessages([]);
    setInput('');
    setShowSupportOptions(false);
  };

  const header = useMemo(() => {
    if (chatMode === 'live') return { icon: Headphones, title: 'Equipe Genesis', subtitle: 'Atendimento ao vivo', dot: 'bg-emerald-500' };
    if (chatMode === 'connecting') return { icon: Loader2, title: 'Conectando...', subtitle: 'Aguardando atendente', dot: 'bg-amber-400' };
    if (chatMode === 'closed') return { icon: Shield, title: 'Encerrado', subtitle: 'Inicie uma nova conversa', dot: 'bg-muted-foreground' };
    return { icon: Sparkles, title: 'Genesis IA', subtitle: 'Assistente inteligente', dot: 'bg-emerald-500' };
  }, [chatMode]);

  // --- CLOSED STATE: FAB BUTTON ---
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 group"
        aria-label="Abrir chat de suporte"
      >
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:shadow-cyan-500/40 hover:scale-105">
          <Bot className="h-6 w-6 text-white" />
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
        </div>
      </button>
    );
  }

  const Icon = header.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-20px)] max-w-[440px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1220] shadow-2xl shadow-black/50"
      style={{ maxHeight: 'min(800px, calc(100vh - 32px))' }}
    >
      {/* ─── HEADER ─── */}
      <div className="relative flex items-center justify-between gap-3 border-b border-white/[0.06] bg-gradient-to-r from-[#0f1a2e] to-[#0c1220] px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 ring-1 ring-white/[0.08]">
            <Icon className={`h-5 w-5 text-cyan-400 ${chatMode === 'connecting' ? 'animate-spin' : ''}`} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{header.title}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${header.dot}`} />
              <span className="text-[11px] text-white/50">{header.subtitle}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* ─── MESSAGES ─── */}
      <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto px-4 py-4 scrollbar-thin" style={{ minHeight: '520px', maxHeight: '600px' }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/10 ring-1 ring-cyan-500/20">
                <Sparkles className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-[15px] font-semibold text-white">Olá! Sou a Genesis IA 👋</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                Tire dúvidas sobre qualquer módulo da plataforma. Estou pronta para ajudar!
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => { setInput(q); }}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white/90"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map(m => (
          <div key={m.id}>
            {m.role === 'system' ? (
              <div className="flex justify-center">
                <span className="rounded-full bg-white/[0.04] px-3 py-1 text-[10px] font-medium text-white/40 ring-1 ring-white/[0.06]">
                  {m.content}
                </span>
              </div>
            ) : (
              <div className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/15 to-blue-500/10 ring-1 ring-white/[0.06]">
                    {chatMode === 'live' ? <User className="h-3.5 w-3.5 text-cyan-400" /> : <Bot className="h-3.5 w-3.5 text-cyan-400" />}
                  </div>
                )}
                <div className="max-w-[80%]">
                  <div className={
                    m.role === 'user'
                      ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-cyan-500 to-blue-600 px-3.5 py-2.5 text-[13px] leading-relaxed text-white shadow-lg shadow-cyan-500/10'
                      : 'rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-[13px] leading-relaxed text-white/90'
                  }>
                    {m.role === 'assistant' ? (
                      <div className="max-w-none [&_p]:my-0.5 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_strong]:text-white [&_a]:text-cyan-400 [&_a]:underline text-[13px] leading-relaxed">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : m.content}

                    {m.hasWhatsAppButton && (
                      <a
                        href={whatsappUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/20 transition-colors hover:bg-emerald-500/20"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Falar via WhatsApp
                      </a>
                    )}
                  </div>
                  {m.timestamp && (
                    <span className={`mt-0.5 block text-[9px] text-white/25 ${m.role === 'user' ? 'text-right' : ''}`}>{m.timestamp}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Support options */}
        {showSupportOptions && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={startLiveSupport}
              className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/20">
                <MessageCircle className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Chat ao vivo</p>
                <p className="text-[11px] text-white/40">Fale com a equipe em tempo real</p>
              </div>
            </button>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
                <ExternalLink className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">WhatsApp</p>
                <p className="text-[11px] text-white/40">Suporte pelo WhatsApp</p>
              </div>
            </a>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start gap-2.5">
            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/15 to-blue-500/10 ring-1 ring-white/[0.06]">
              <Bot className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* ─── INPUT ─── */}
      <div className="border-t border-white/[0.06] bg-[#0a0f1a] px-4 py-3">
        {chatMode === 'closed' ? (
          <button
            type="button"
            onClick={reset}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30"
          >
            Iniciar nova conversa
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
              placeholder={chatMode === 'live' ? 'Responda ao atendente...' : 'Digite sua dúvida...'}
              disabled={chatMode === 'connecting'}
              className="h-11 flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 text-[13px] text-white placeholder:text-white/25 outline-none transition-colors focus:border-cyan-500/40 focus:bg-white/[0.05] disabled:opacity-40"
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading || chatMode === 'connecting'}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 disabled:opacity-30 disabled:shadow-none"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        )}
        <p className="mt-2 text-center text-[9px] text-white/20">Genesis IA • Suporte inteligente 24/7</p>
      </div>
    </motion.div>
  );
}
