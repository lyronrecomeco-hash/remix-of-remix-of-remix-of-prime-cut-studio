import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, User, Sparkles, ArrowRight, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  'Quais são os planos?',
  'Como funciona a Luna?',
  'Posso testar grátis?',
  'É difícil configurar?',
];

const VendaLiveDemo = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Eu sou a Luna, assistente de IA do Genesis Hub. Estou aqui para mostrar como posso automatizar seu atendimento. Pergunte-me qualquer coisa!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('proposal-chat', {
        body: {
          message: text,
          context: {
            isVendaDemo: true,
            conversationHistory,
          },
          systemPrompt: `Você é a Luna, assistente de IA do Genesis Hub - a plataforma líder em automação de WhatsApp para empresas.

SOBRE O GENESIS HUB:
- Flow Builder visual: crie automações arrastando blocos, zero código
- Luna IA: responde clientes 24/7 com inteligência artificial avançada
- Multi-instâncias: gerencie vários números de WhatsApp em um painel
- Analytics: métricas de conversão, tempo de resposta, satisfação
- Integrações: CRMs, ERPs, e-commerce, webhooks

PLANOS:
- Free: 1 instância, 500 msgs/mês, Flow Builder básico - R$0
- Premium: 5 instâncias, msgs ilimitadas, Luna IA, analytics - R$197/mês
- Lifetime: tudo ilimitado, atualizações vitalícias - R$997 único

BENEFÍCIOS:
- Economia de 4h/dia em atendimento manual
- Aumento de 3x nas conversões
- Atendimento 24/7 sem contratar equipe
- ROI médio de 340%

REGRAS:
- Respostas CURTAS (2-3 frases no máximo)
- Seja persuasiva mas natural
- Use 1-2 emojis por resposta
- Sempre termine com pergunta ou CTA sutil
- Destaque benefícios, não features
- Crie urgência suavemente`,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.response || 'Desculpe, tive um problema. Pode repetir?',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Ops! Estou com uma pequena dificuldade técnica. 😅 Mas posso garantir: o Genesis Hub vai transformar seu atendimento! Quer experimentar grátis?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="demo" ref={ref} className="py-24 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-green-500/10 border border-green-500/20 text-green-500">
            <Wifi className="w-4 h-4" />
            IA Online — Teste Agora
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Converse com a Luna
            <br />
            <span className="text-muted-foreground">em tempo real</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Esta é a mesma inteligência artificial que vai atender seus clientes 24 horas por dia.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          {/* Chat Container */}
          <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10 bg-card/95 backdrop-blur">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary via-blue-600 to-primary p-4 flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg">Luna IA</h3>
                <p className="text-sm text-white/80">Assistente Genesis Hub</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Online
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-muted/20 to-background">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-primary/20' 
                          : 'bg-gradient-to-br from-primary to-blue-600'
                      }`}>
                        {message.role === 'user' 
                          ? <User className="w-4 h-4 text-primary" />
                          : <Bot className="w-4 h-4 text-white" />
                        }
                      </div>
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-card border border-border shadow-sm rounded-bl-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Pergunte algo:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 border border-primary/20"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <form 
                onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                  className="flex-1 bg-muted/50"
                />
                <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>

          {/* CTA Below Chat */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-10 text-center"
          >
            <p className="text-lg text-muted-foreground mb-4">
              Impressionado? Tenha a Luna trabalhando para você <strong className="text-foreground">24 horas por dia</strong>.
            </p>
            <Button asChild size="lg" className="group shadow-lg shadow-primary/20">
              <a href="/genesis" className="flex items-center gap-2">
                Ativar Luna no Meu WhatsApp
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaLiveDemo;
