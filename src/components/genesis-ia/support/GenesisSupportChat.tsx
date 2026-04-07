import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Send, Loader2, Bot, ExternalLink, User, Headphones, MessageCircle, Sparkles, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

const WHATSAPP_SUPPORT_NUMBER = '5527920005215';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  hasWhatsAppButton?: boolean;
  timestamp?: string;
}

type ChatMode = 'ai' | 'connecting' | 'live' | 'closed';

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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Subscribe to live chat messages
  useEffect(() => {
    if (!liveSessionId) return;

    const channel = supabase
      .channel(`support_${liveSessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_chat_messages',
        filter: `session_id=eq.${liveSessionId}`,
      }, (payload) => {
        const msg = payload.new as any;
        if (msg.sender_type === 'admin' || msg.sender_type === 'system') {
          setMessages(prev => [...prev, {
            id: msg.id,
            role: msg.sender_type === 'admin' ? 'assistant' : 'system',
            content: msg.message,
            timestamp: new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          }]);

          if (msg.sender_type === 'system' && msg.message.includes('conectada')) {
            setChatMode('live');
          }
          if (msg.sender_type === 'system' && msg.message.includes('Obrigado')) {
            setChatMode('closed');
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'support_chat_sessions',
        filter: `id=eq.${liveSessionId}`,
      }, (payload) => {
        const session = payload.new as any;
        if (session.status === 'active') setChatMode('live');
        if (session.status === 'closed') setChatMode('closed');
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [liveSessionId]);

  const detectSupportIntent = (text: string): boolean => {
    const keywords = ['suporte', 'atendente', 'humano', 'falar com alguém', 'ajuda', 'support', 'help'];
    return keywords.some(k => text.toLowerCase().includes(k));
  };

  const startLiveSupport = async () => {
    setShowSupportOptions(false);
    setChatMode('connecting');
    setMessages(prev => [...prev, {
      id: `sys_${Date.now()}`,
      role: 'system',
      content: '🔄 Conectando com a equipe Genesis...',
    }]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('genesis_users')
        .select('name, email')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      const userName = profile?.name || user.email?.split('@')[0] || 'Usuário';
      const userEmail = profile?.email || user.email || '';
      const firstMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

      const { data: session, error } = await supabase
        .from('support_chat_sessions')
        .insert({
          user_id: user.id,
          user_name: userName,
          user_email: userEmail,
          first_message: firstMessage,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) throw error;
      setLiveSessionId(session.id);

      await supabase.functions.invoke('support-chat-telegram', {
        body: {
          action: 'notify_new_session',
          session_id: session.id,
          user_name: userName,
          user_email: userEmail,
          first_message: firstMessage,
        },
      });

      setMessages(prev => [...prev, {
        id: `sys_wait_${Date.now()}`,
        role: 'system',
        content: '⏳ Aguardando um atendente aceitar seu chamado...',
      }]);
    } catch (err) {
      console.error('Live support error:', err);
      setChatMode('ai');
      setMessages(prev => [...prev, {
        id: `sys_err_${Date.now()}`,
        role: 'system',
        content: '❌ Não foi possível conectar ao suporte. Tente novamente ou use o WhatsApp.',
      }]);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    if (chatMode === 'live' && liveSessionId) {
      await supabase.from('support_chat_messages').insert({
        session_id: liveSessionId,
        sender_type: 'user',
        message: text,
      });
      await supabase.functions.invoke('support-chat-telegram', {
        body: { action: 'send_to_telegram', session_id: liveSessionId, message: text },
      });
      return;
    }

    setIsLoading(true);

    if (detectSupportIntent(text)) {
      setShowSupportOptions(true);
      setIsLoading(false);
      setMessages(prev => [...prev, {
        id: `opt_${Date.now()}`,
        role: 'assistant',
        content: 'Posso ajudar com a maioria das dúvidas! Mas se preferir, escolha como quer ser atendido:',
      }]);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('genesis-support-chat', {
        body: { messages: newMessages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })) },
      });

      if (error) throw error;

      const reply = data?.reply || 'Desculpe, não consegui processar sua mensagem.';
      const hasWhatsApp = data?.hasWhatsAppButton || false;

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        hasWhatsAppButton: hasWhatsApp,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }]);

      if (hasWhatsApp) setShowSupportOptions(true);
    } catch (err) {
      console.error('Support chat error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Ops, ocorreu um erro. Tente novamente em instantes.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const headerInfo = () => {
    if (chatMode === 'live') return { name: 'Equipe Genesis', status: 'Online agora', icon: Headphones, statusColor: 'bg-emerald-500', pulse: true };
    if (chatMode === 'connecting') return { name: 'Conectando...', status: 'Aguardando atendente', icon: Loader2, statusColor: 'bg-amber-500', pulse: false };
    if (chatMode === 'closed') return { name: 'Atendimento encerrado', status: 'Sessão finalizada', icon: Shield, statusColor: 'bg-muted-foreground', pulse: false };
    return { name: 'Genesis IA', status: 'Assistente inteligente', icon: Sparkles, statusColor: 'bg-emerald-500', pulse: true };
  };

  const header = headerInfo();
  const HeaderIcon = header.icon;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 flex items-center justify-center hover:shadow-primary/40 hover:scale-110 transition-all duration-300 group"
          >
            <Bot className="w-6 h-6 text-primary-foreground group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-5 right-5 z-50 w-[400px] sm:w-[440px] rounded-2xl border border-border/40 bg-card shadow-2xl shadow-black/30 flex flex-col overflow-hidden"
            style={{ maxHeight: 'min(780px, calc(100vh - 40px))' }}
          >
            {/* Header */}
            <div className="relative px-4 py-3.5 border-b border-border/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                      {chatMode === 'live' ? (
                        <Headphones className="w-5 h-5 text-primary" />
                      ) : (
                        <HeaderIcon className={`w-5 h-5 text-primary ${chatMode === 'connecting' ? 'animate-spin' : ''}`} />
                      )}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${header.statusColor} ${header.pulse ? 'animate-pulse' : ''}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight tracking-tight">{header.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${header.statusColor}`} />
                      <p className="text-[10px] text-muted-foreground font-medium">{header.status}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[500px] max-h-[580px] scrollbar-thin">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center py-12 px-4"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 border border-primary/10">
                    <Sparkles className="w-8 h-8 text-primary/50" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">Olá! Sou a Genesis IA 👋</p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[250px] mx-auto">
                    Tire dúvidas sobre a plataforma ou solicite suporte humano a qualquer momento.
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                    {['Como funciona?', 'Scanner IA', 'Meu plano'].map(q => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="px-3 py-1.5 rounded-full bg-muted/60 border border-border/50 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {msg.role === 'system' ? (
                    <div className="flex justify-center my-2">
                      <span className="text-[10px] text-muted-foreground bg-muted/40 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-border/30 font-medium">
                        {msg.content}
                      </span>
                    </div>
                  ) : (
                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/10">
                          {chatMode === 'live' ? (
                            <User className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Bot className="w-3.5 h-3.5 text-primary" />
                          )}
                        </div>
                      )}
                      <div className="flex flex-col max-w-[78%]">
                        <div className={`rounded-2xl text-[13px] leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md px-3.5 py-2.5 shadow-sm shadow-primary/10'
                            : 'bg-muted/60 text-foreground rounded-bl-md px-3.5 py-2.5 border border-border/30'
                        }`}>
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_strong]:text-foreground [&_a]:text-primary text-[13px] leading-relaxed">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            msg.content
                          )}
                          {msg.hasWhatsAppButton && (
                            <a
                              href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20Genesis%20Hub`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors text-xs font-medium border border-emerald-500/20"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Falar via WhatsApp
                            </a>
                          )}
                        </div>
                        {msg.timestamp && (
                          <span className={`text-[9px] text-muted-foreground/60 mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                            {msg.timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Support Options */}
              <AnimatePresence>
                {showSupportOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-col gap-2 px-1"
                  >
                    <button
                      onClick={startLiveSupport}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/8 border border-primary/20 text-primary hover:bg-primary/15 transition-all text-xs font-semibold group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold">Chat ao vivo</p>
                        <p className="text-[10px] text-primary/60 font-normal">Fale com a equipe em tempo real</p>
                      </div>
                    </button>
                    <a
                      href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20Genesis%20Hub`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15 transition-all text-xs font-semibold group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center group-hover:bg-emerald-500/25 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold">WhatsApp</p>
                        <p className="text-[10px] text-emerald-400/60 font-normal">Suporte pelo WhatsApp</p>
                      </div>
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start gap-2"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/10">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-muted/60 border border-border/30 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-border/50 bg-gradient-to-t from-card to-card/80">
              {chatMode === 'closed' ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => {
                    setChatMode('ai');
                    setLiveSessionId(null);
                    setMessages([]);
                    setShowSupportOptions(false);
                  }}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-xs font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
                >
                  ✨ Iniciar nova conversa
                </motion.button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder={chatMode === 'live' ? 'Responda ao atendente...' : 'Digite sua dúvida...'}
                    className="flex-1 h-11 px-4 rounded-xl bg-muted/50 border border-border/50 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                    disabled={chatMode === 'connecting'}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading || chatMode === 'connecting'}
                    className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-40 disabled:shadow-none"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-primary-foreground" />
                    )}
                  </button>
                </div>
              )}
              <p className="text-center text-[9px] text-muted-foreground/40 mt-2 font-medium">
                Powered by Genesis IA • Suporte 24/7
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
