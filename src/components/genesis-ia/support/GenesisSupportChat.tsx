import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Bot,
  ChevronDown,
  Headphones,
  ImagePlus,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  User,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';

const QUICK_ACTIONS = ['Como funciona a Genesis Hub?', 'Scanner IA', 'Radar Global', 'Planos'];

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  hasWhatsAppButton?: boolean;
  timestamp?: string;
}

interface SupportChatMessageRow {
  id: string;
  message: string;
  sender_type: string;
  created_at?: string | null;
}

interface SupportChatSessionRow {
  status?: string;
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

export function GenesisSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('ai');
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const [showSupportOptions, setShowSupportOptions] = useState(false);
  const [liveSupportAvailable, setLiveSupportAvailable] = useState<boolean | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        (payload) => handle(payload.new as SupportChatMessageRow))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_chat_sessions', filter: `id=eq.${liveSessionId}` },
        (payload) => {
          const s = payload.new as SupportChatSessionRow;
          if (s.status === 'active') setChatMode('live');
          if (s.status === 'closed') setChatMode('closed');
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [liveSessionId]);

  const append = (m: Message) => setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);

  const loadSupportAvailability = async () => {
    try {
      const result = await callTelegram({ action: 'get_status' });
      setLiveSupportAvailable(Boolean(result?.available));
    } catch (error) {
      console.error('Support availability error:', error);
      setLiveSupportAvailable(false);
    }
  };

  useEffect(() => {
    void loadSupportAvailability();
  }, []);

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

    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
    return json;
  };

  const startLiveSupport = async () => {
    setShowSupportOptions(false);

    try {
      const supportStatus = await callTelegram({ action: 'get_status' });
      const available = Boolean(supportStatus?.available);
      setLiveSupportAvailable(available);

      if (!available) {
        setChatMode('ai');
        append(msg('system', 'O atendimento humano no chat está indisponível no momento. Você ainda pode continuar falando com a Genesis IA aqui.'));
        return;
      }

      setChatMode('connecting');
      append(msg('system', 'Conectando você com a equipe Genesis no chat...'));

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

      const notifyResult = await callTelegram({
        action: 'notify_new_session',
        session_id: session.id,
        user_name: userName,
        user_email: userEmail,
        first_message: firstMessage,
      });

      if (!notifyResult?.success) {
        setChatMode('ai');
        setLiveSessionId(null);
        append(msg('system', 'No momento não há atendente disponível no chat. Continue sua conversa comigo que eu sigo te ajudando.'));
        return;
      }

      append(msg('system', 'Chamado enviado! Aguardando um atendente aceitar...'));
    } catch (err) {
      console.error('Live support error:', err);
      setChatMode('ai');
      setLiveSessionId(null);
      append(msg('system', 'Não foi possível iniciar o atendimento humano no chat agora. Continue com a Genesis IA e tente novamente em instantes.'));
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
      append(msg('assistant', 'Desculpe, estou com uma instabilidade técnica no momento. Tente novamente em instantes.', { timestamp: ts() }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file?: File | null) => {
    if (!file) return;

    if (chatMode !== 'live' || !liveSessionId) {
      append(msg('system', 'O envio de imagem fica disponível durante o atendimento humano no chat.'));
      return;
    }

    setIsUploadingImage(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || '');
          const content = result.includes(',') ? result.split(',')[1] : result;
          resolve(content);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await supabase.from('support_chat_messages').insert({
        session_id: liveSessionId,
        sender_type: 'user',
        message: `🖼️ Imagem enviada: ${file.name}`,
      });

      await callTelegram({
        action: 'send_to_telegram',
        session_id: liveSessionId,
        file_base64: base64,
        file_name: file.name,
      });

      append(msg('system', `Imagem enviada: ${file.name}`));
    } catch (error) {
      console.error('Image upload error:', error);
      append(msg('system', 'Não foi possível enviar a imagem. Tente novamente.'));
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (chatMode === 'live') return { icon: Headphones, title: 'Equipe Genesis', subtitle: 'Atendimento humano no chat', dot: 'bg-primary' };
    if (chatMode === 'connecting') return { icon: Loader2, title: 'Conectando...', subtitle: 'Aguardando atendimento', dot: 'bg-accent' };
    if (chatMode === 'closed') return { icon: AlertCircle, title: 'Atendimento encerrado', subtitle: 'Você pode iniciar uma nova conversa', dot: 'bg-muted-foreground' };
    return { icon: Sparkles, title: 'Genesis IA', subtitle: 'Assistente autônoma da plataforma', dot: 'bg-primary' };
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
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40">
          <Bot className="h-6 w-6" />
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
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
      className="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-20px)] max-w-[430px] flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-card backdrop-blur-xl"
      style={{ maxHeight: 'min(800px, calc(100vh - 32px))' }}
    >
      <div className="relative flex items-center justify-between gap-3 border-b border-border bg-gradient-dark px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-secondary text-primary">
            <Icon className={`h-5 w-5 ${chatMode === 'connecting' ? 'animate-spin' : ''}`} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{header.title}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${header.dot}`} />
              <span className="text-[11px] text-muted-foreground">{header.subtitle}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto bg-background/40 px-4 py-4 scrollbar-thin" style={{ minHeight: '520px', maxHeight: '600px' }}>

        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-secondary text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-[15px] font-semibold text-foreground">Olá! Sou a Genesis IA 👋</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                Posso responder perguntas sobre Scanner IA, Radar Global, Biblioteca, propostas, contratos, financeiro e demais módulos da Genesis Hub.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => { setInput(q); }}
                  className="rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] font-medium text-secondary-foreground transition-colors hover:bg-muted"
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
                <span className="rounded-full border border-border bg-muted px-3 py-1 text-[10px] font-medium text-muted-foreground">
                  {m.content}
                </span>
              </div>
            ) : (
              <div className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-primary">
                    {chatMode === 'live' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>
                )}
                <div className="max-w-[80%]">
                  <div className={
                    m.role === 'user'
                      ? 'rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-[13px] leading-relaxed text-primary-foreground'
                      : 'rounded-2xl rounded-bl-md border border-border bg-secondary px-3.5 py-2.5 text-[13px] leading-relaxed text-secondary-foreground'
                  }>
                    {m.role === 'assistant' ? (
                      <div className="max-w-none text-[13px] leading-relaxed [&_a]:text-primary [&_a]:underline [&_li]:my-0.5 [&_ol]:my-1 [&_p]:my-0.5 [&_strong]:text-foreground [&_ul]:my-1">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : m.content}
                  </div>
                  {m.timestamp && (
                    <span className={`mt-0.5 block text-[9px] text-muted-foreground ${m.role === 'user' ? 'text-right' : ''}`}>{m.timestamp}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {showSupportOptions && (
          <div className="space-y-2">
            {liveSupportAvailable !== false ? (
              <button
                type="button"
                onClick={startLiveSupport}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-secondary"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-primary">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">Falar com atendimento humano</p>
                  <p className="text-[11px] text-muted-foreground">Abrir atendimento diretamente neste chat</p>
                </div>
              </button>
            ) : (
              <div className="rounded-2xl border border-border bg-card px-4 py-3">
                <p className="text-[13px] font-semibold text-foreground">Atendimento humano indisponível</p>
                <p className="mt-1 text-[11px] text-muted-foreground">No momento, a Genesis IA segue atendendo normalmente aqui no chat.</p>
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start gap-2.5">
            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-primary">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-secondary px-4 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card/90 px-4 py-3">
        {chatMode === 'closed' ? (
          <button
            type="button"
            onClick={reset}
            className="flex h-11 w-full items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Iniciar nova conversa
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleImageUpload(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={chatMode === 'connecting' || isUploadingImage}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-input bg-secondary text-primary transition-opacity hover:opacity-90 disabled:opacity-30"
              aria-label="Enviar imagem"
            >
              {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
              placeholder={chatMode === 'live' ? 'Responda ao atendente...' : 'Digite sua dúvida...'}
              disabled={chatMode === 'connecting'}
              className="h-11 flex-1 rounded-2xl border border-input bg-secondary px-3.5 text-[13px] text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-ring focus:bg-card disabled:opacity-40"
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading || isUploadingImage || chatMode === 'connecting'}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        )}
        <p className="mt-2 text-center text-[9px] text-muted-foreground">Genesis IA • suporte inteligente da plataforma</p>
      </div>
    </motion.div>
  );
}
