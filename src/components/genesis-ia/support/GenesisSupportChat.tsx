import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Send, Loader2, Bot, ExternalLink, User, Headphones, MessageCircle } from 'lucide-react';
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

      // Get user profile
      const { data: profile } = await supabase
        .from('genesis_users')
        .select('name, email')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      const userName = profile?.name || user.email?.split('@')[0] || 'Usuário';
      const userEmail = profile?.email || user.email || '';
      const firstMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

      // Create support session
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

      // Notify admin via Telegram
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
        content: '⏳ Aguardando um atendente aceitar seu chamado... Você será notificado quando alguém conectar.',
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

    // If in live mode, send to session
    if (chatMode === 'live' && liveSessionId) {
      await supabase.from('support_chat_messages').insert({
        session_id: liveSessionId,
        sender_type: 'user',
        message: text,
      });
      // Forward to Telegram
      await supabase.functions.invoke('support-chat-telegram', {
        body: { action: 'send_to_telegram', session_id: liveSessionId, message: text },
      });
      return;
    }

    // AI mode
    setIsLoading(true);

    // Check if user is asking for support
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

      if (hasWhatsApp) {
        setShowSupportOptions(true);
      }
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
    if (chatMode === 'live') return { name: 'Equipe Genesis', status: 'Online agora', icon: Headphones, color: 'bg-emerald-500' };
    if (chatMode === 'connecting') return { name: 'Conectando...', status: 'Aguardando', icon: Loader2, color: 'bg-amber-500' };
    if (chatMode === 'closed') return { name: 'Atendimento encerrado', status: 'Finalizado', icon: Bot, color: 'bg-muted-foreground' };
    return { name: 'Genesis IA', status: 'Online agora', icon: Bot, color: 'bg-emerald-500' };
  };

  const header = headerInfo();
  const HeaderIcon = header.icon;

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Bot className="w-6 h-6 text-primary-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-5 right-5 z-50 w-[360px] sm:w-[400px] max-h-[720px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-card to-card/80">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                    {chatMode === 'live' ? (
                      <Headphones className="w-5 h-5 text-primary" />
                    ) : (
                      <HeaderIcon className={`w-5 h-5 text-primary ${chatMode === 'connecting' ? 'animate-spin' : ''}`} />
                    )}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${header.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{header.name}</p>
                  <p className="text-[10px] text-muted-foreground">{header.status}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[460px] max-h-[540px]">
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <Bot className="w-12 h-12 mx-auto text-primary/30 mb-3" />
                  <p className="text-xs text-muted-foreground">
                    Olá! Sou a Genesis IA.<br />
                    Como posso ajudar?
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.role === 'system' ? (
                    <div className="flex justify-center">
                      <span className="text-[10px] text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                        {msg.content}
                      </span>
                    </div>
                  ) : (
                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                          {chatMode === 'live' ? (
                            <User className="w-3 h-3 text-primary" />
                          ) : (
                            <Bot className="w-3 h-3 text-primary" />
                          )}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div className={`max-w-[80%] rounded-2xl text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md px-3 py-2'
                            : 'bg-muted text-foreground rounded-bl-md px-3 py-2'
                        }`}>
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_strong]:text-foreground [&_a]:text-primary text-xs">
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
                              className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-xs font-medium"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Falar com suporte via WhatsApp
                            </a>
                          )}
                        </div>
                        {msg.timestamp && (
                          <span className={`text-[9px] text-muted-foreground mt-0.5 ${msg.role === 'user' ? 'text-right' : ''}`}>
                            {msg.timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Support Options */}
              {showSupportOptions && (
                <div className="flex flex-col gap-2 px-2">
                  <button
                    onClick={startLiveSupport}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors text-xs font-medium"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat com a equipe (ao vivo)
                  </button>
                  <a
                    href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20Genesis%20Hub`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Falar via WhatsApp
                  </a>
                </div>
              )}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                  <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-bl-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-card">
              {chatMode === 'closed' ? (
                <button
                  onClick={() => {
                    setChatMode('ai');
                    setLiveSessionId(null);
                    setMessages([]);
                    setShowSupportOptions(false);
                  }}
                  className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Iniciar nova conversa
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder={chatMode === 'live' ? 'Responda ao atendente...' : 'Envie uma mensagem...'}
                    className="flex-1 h-10 px-3 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    disabled={chatMode === 'connecting'}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading || chatMode === 'connecting'}
                    className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-primary-foreground" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
