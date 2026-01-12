import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Bot, Sparkles, MessageSquare, Brain, Zap,
  CheckCircle2, ArrowRight, Star, Heart, Settings,
  Lightbulb, Target, TrendingUp, Shield, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface LunaMessage {
  id: string;
  type: 'luna' | 'system' | 'user';
  content: string;
  delay: number;
}

const lunaShowcase: LunaMessage[] = [
  { id: '1', type: 'system', content: '🎯 Cliente perguntou sobre preços...', delay: 0 },
  { id: '2', type: 'luna', content: '💭 Analisando contexto da conversa...', delay: 800 },
  { id: '3', type: 'luna', content: '🧠 Identificando intenção: INTERESSE DE COMPRA', delay: 1600 },
  { id: '4', type: 'luna', content: '✨ Gerando resposta personalizada...', delay: 2400 },
  { id: '5', type: 'user', content: 'Oi, quanto custa o serviço de vocês?', delay: 3200 },
  { id: '6', type: 'luna', content: 'Olá! 😊 Que bom ter você aqui!\n\nNossos planos começam em R$97/mês, mas tenho uma oferta especial pra novos clientes!\n\nPosso te contar mais sobre? 🚀', delay: 4000 },
];

const lunaCapabilities = [
  {
    icon: Brain,
    title: 'Entende Contexto',
    description: 'Compreende a conversa completa, não só a última mensagem',
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: Target,
    title: 'Foco em Vendas',
    description: 'Treinada para converter leads em clientes reais',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Lightbulb,
    title: 'Aprende com Você',
    description: 'Se adapta ao tom e estilo do seu negócio',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Shield,
    title: 'Segura e Confiável',
    description: 'Nunca fala o que não deve, respeita limites',
    color: 'from-green-500 to-emerald-600',
  },
];

const VendaAgentesIA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate Luna showcase when in view
  useEffect(() => {
    if (isInView && !isAnimating && visibleMessages.length === 0) {
      setIsAnimating(true);
      
      lunaShowcase.forEach((msg) => {
        setTimeout(() => {
          setVisibleMessages(prev => [...prev, msg.id]);
        }, msg.delay);
      });
    }
  }, [isInView, isAnimating, visibleMessages.length]);

  return (
    <section id="agentes-ia" ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500"
          >
            <Bot className="w-4 h-4" />
            Agentes de IA
            <Badge variant="secondary" className="ml-1 text-[10px] bg-purple-500/20 text-purple-500 border-purple-500/30">LUNA</Badge>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Conheça a <span className="bg-gradient-to-r from-purple-500 via-primary to-blue-500 bg-clip-text text-transparent">Luna</span>
            <br />
            <span className="text-muted-foreground text-2xl md:text-4xl">Sua vendedora IA 24/7</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            A Luna não é um chatbot comum. É uma <span className="text-foreground font-semibold">inteligência artificial avançada</span> que
            entende contexto, gera respostas <span className="text-purple-500 font-semibold">personalizadas</span> e fecha vendas por você.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto items-center">
          {/* Luna Brain Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 md:p-8 bg-gradient-to-br from-card via-card to-purple-500/5 border-purple-500/20 relative overflow-hidden">
              {/* Luna Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-primary to-blue-600 flex items-center justify-center shadow-xl shadow-purple-500/30">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-card flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    Luna IA
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </h3>
                  <p className="text-sm text-muted-foreground">Agente de Vendas Inteligente</p>
                </div>
              </div>

              {/* Luna "Thinking" Process */}
              <div className="space-y-3 mb-6">
                <AnimatePresence>
                  {lunaShowcase.map((msg) => (
                    visibleMessages.includes(msg.id) && (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`p-3 rounded-lg ${
                          msg.type === 'system' 
                            ? 'bg-muted/50 text-muted-foreground text-sm' 
                            : msg.type === 'luna'
                              ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm'
                              : 'bg-primary/10 border border-primary/20'
                        }`}
                      >
                        {msg.type === 'luna' && (
                          <div className="flex items-center gap-2 mb-1">
                            <Brain className="w-3 h-3" />
                            <span className="text-[10px] uppercase tracking-wider font-medium">Processando...</span>
                          </div>
                        )}
                        <p className="whitespace-pre-line text-sm">{msg.content}</p>
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-500">~2s</div>
                  <div className="text-[10px] text-muted-foreground">Resposta</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">97%</div>
                  <div className="text-[10px] text-muted-foreground">Precisão</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-500">3.2x</div>
                  <div className="text-[10px] text-muted-foreground">+ Vendas</div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Capabilities Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            {lunaCapabilities.map((cap, index) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="p-4 md:p-5 flex items-start gap-4 bg-card/50 backdrop-blur border-border/50 hover:border-purple-500/30 transition-all group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cap.color} flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                    <cap.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{cap.title}</h4>
                    <p className="text-sm text-muted-foreground">{cap.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Use Cases */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
            O que a Luna faz por você
          </h3>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: MessageSquare, text: 'Responde dúvidas automaticamente' },
              { icon: Target, text: 'Qualifica leads por interesse' },
              { icon: Clock, text: 'Agenda consultas e reuniões' },
              { icon: TrendingUp, text: 'Envia ofertas personalizadas' },
              { icon: Heart, text: 'Faz follow-up automático' },
              { icon: Settings, text: 'Integra com seu CRM' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-sm font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Button asChild size="lg" className="gap-2 shadow-xl shadow-purple-500/30 bg-gradient-to-r from-purple-600 to-primary hover:from-purple-700 hover:to-primary/90">
            <Link to="/genesis">
              <Bot className="w-5 h-5" />
              Ativar Luna no Meu WhatsApp
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            7 dias grátis • Sem cartão de crédito
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaAgentesIA;
