import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, User, Sparkles, ArrowRight, Wifi, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  '💰 Quanto custa?',
  '🤖 Como a Luna funciona?',
  '⚡ Posso testar grátis?',
  '⏱️ Quanto tempo pra configurar?',
];

const VendaLiveDemo = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Eu sou a Luna, a IA do Genesis Hub.\n\nEstou aqui para mostrar como posso automatizar seu atendimento e multiplicar suas vendas 24h por dia.\n\nPode me perguntar qualquer coisa! 🚀',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

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
    setMessageCount(prev => prev + 1);

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
          systemPrompt: `Você é a Luna, assistente de IA do Genesis Hub - a plataforma líder em automação de WhatsApp para empresas brasileiras.

SOBRE O GENESIS HUB:
- Flow Builder visual: crie automações arrastando blocos, zero código
- Luna IA: responde clientes 24/7 com inteligência artificial avançada
- Multi-instâncias: gerencie vários números de WhatsApp em um painel
- Analytics: métricas de conversão, tempo de resposta, satisfação
- Integrações: CRMs, ERPs, e-commerce, webhooks, N8N, Zapier

PLANOS E PREÇOS:
- Free: 1 instância, 500 msgs/mês, Flow Builder básico - R$0
- Premium: 5 instâncias, msgs ilimitadas, Luna IA completa, analytics - R$197/mês (ou R$164/mês no anual)
- Lifetime: tudo ilimitado, atualizações vitalícias, onboarding VIP - R$997 único (apenas 23 vagas)

BENEFÍCIOS COMPROVADOS:
- Economia de 4h/dia em atendimento manual
- Aumento de 3.2x nas conversões (média)
- Atendimento 24/7 sem contratar equipe extra
- ROI médio de 340% nos primeiros 90 dias
- Setup em menos de 5 minutos

DIFERENCIAIS:
- IA treinada para vendas, não apenas FAQ
- Anti-ban nativo (99.9% uptime)
- Suporte brasileiro 24h
- +15 componentes no Flow Builder
- Comunidade ativa de usuários

REGRAS PARA RESPOSTAS:
1. Respostas CURTAS e IMPACTANTES (2-3 frases no máximo)
2. Seja persuasiva mas amigável e natural
3. Use 1-2 emojis relevantes por resposta
4. SEMPRE termine com uma pergunta ou CTA sutil
5. Destaque BENEFÍCIOS e RESULTADOS, não features técnicas
6. Crie urgência suave (vagas limitadas, resultados rápidos)
7. Se perguntar de preço, mencione o trial grátis primeiro
8. Conecte as respostas com a dor do cliente`,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.response || 'Desculpe, tive um problema técnico. Pode repetir? 😅',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Ops! Pequena falha técnica. 😅\n\nMas quer saber o melhor? No Genesis Hub você pode testar a Luna GRÁTIS por 7 dias e ver como ela fecha vendas por você!\n\nQuer experimentar? 🚀',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="demo" ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-muted/20 via-background to-muted/10 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-20 right-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
      
      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-green-500/10 border border-green-500/20 text-green-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            IA Online — Teste Agora Mesmo
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Converse com a Luna
            <br />
            <span className="text-muted-foreground">em <span className="text-primary">tempo real</span></span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Esta é a <span className="text-foreground font-semibold">mesma inteligência artificial</span> que vai atender 
            seus clientes 24 horas por dia, <span className="text-primary font-semibold">fechando vendas enquanto você dorme</span>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          {/* Chat Container */}
          <Card className="overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20 bg-card/95 backdrop-blur-xl">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary via-blue-600 to-cyan-600 p-4 flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-lg">Luna IA</h3>
                  <Badge className="bg-white/20 text-white text-[10px] border-white/30">PRO</Badge>
                </div>
                <p className="text-sm text-white/80">Assistente de Vendas Genesis Hub</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Online 24/7
                </div>
                <span className="text-[10px] text-white/60">&lt; 3s resposta</span>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 md:h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-muted/30 to-background">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                        message.role === 'user' 
                          ? 'bg-primary/20 border border-primary/30' 
                          : 'bg-gradient-to-br from-primary to-blue-600'
                      }`}>
                        {message.role === 'user' 
                          ? <User className="w-4 h-4 text-primary" />
                          : <Bot className="w-4 h-4 text-white" />
                        }
                      </div>
                      <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-card border border-border/50 rounded-bl-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">💡 Pergunte algo:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50 border border-primary/20 font-medium"
                  >
                    {q}
                  </motion.button>
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
                  placeholder="Digite sua pergunta..."
                  disabled={isLoading}
                  className="flex-1 bg-muted/50 border-border/50 focus:border-primary"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()} 
                  size="icon" 
                  className="shrink-0 bg-primary hover:bg-primary/90 shadow-md"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>

          {/* Stats Below Chat */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="mt-6 flex justify-center gap-6 text-center"
          >
            {[
              { value: '<3s', label: 'Tempo de resposta' },
              { value: '24/7', label: 'Disponibilidade' },
              { value: '97%', label: 'Satisfação' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-lg font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA Below Chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-10 text-center"
          >
            <p className="text-lg md:text-xl text-muted-foreground mb-6">
              Impressionado? Tenha a Luna trabalhando para você <br />
              <strong className="text-foreground">24 horas por dia, 7 dias por semana</strong>.
            </p>
            <Button asChild size="lg" className="group shadow-xl shadow-primary/30 text-base px-8 py-6">
              <Link to="/genesis" className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Ativar Luna no Meu WhatsApp
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Grátis por 7 dias • Sem cartão de crédito
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaLiveDemo;
