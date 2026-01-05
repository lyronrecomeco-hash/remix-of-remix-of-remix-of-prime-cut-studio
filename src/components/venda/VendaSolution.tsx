import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, X, Sparkles, TrendingUp, Clock, Users, DollarSign, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

const beforeAfter = {
  before: [
    { text: 'Responder manualmente cada mensagem', pain: 'Perde 4h/dia' },
    { text: 'Leads escapando fora do horário', pain: '-67% vendas' },
    { text: 'Esquecer de fazer follow-up', pain: 'R$ 50k perdidos' },
    { text: 'Copiar e colar respostas repetitivas', pain: 'Erro humano' },
    { text: 'Sem dados sobre conversão', pain: 'Decisões cegas' },
  ],
  after: [
    { text: 'IA responde instantaneamente 24/7', gain: '100% cobertura' },
    { text: 'Leads qualificados automaticamente', gain: '+300% vendas' },
    { text: 'Follow-up automático programado', gain: 'Zero esquecidos' },
    { text: 'Respostas personalizadas por contexto', gain: '97% satisfação' },
    { text: 'Dashboard completo de métricas', gain: 'Decisões data-driven' },
  ],
};

const stats = [
  { value: '87%', label: 'Menos tempo de resposta', icon: Clock, description: 'De 4h para 3seg' },
  { value: '3.2x', label: 'Mais conversões', icon: TrendingUp, description: 'Em média nos primeiros 30 dias' },
  { value: '52%', label: 'Redução de custos', icon: DollarSign, description: 'Economia com equipe' },
  { value: '24/7', label: 'Disponibilidade', icon: Zap, description: 'Sem hora extra' },
];

const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const VendaSolution = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [showAfter, setShowAfter] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShowAfter(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <section ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-20 right-20 w-32 h-32 bg-green-500/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-red-500/10 rounded-full blur-2xl animate-pulse delay-1000" />

      <div className="container px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Sparkles className="w-4 h-4" />
            A Transformação
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Do <span className="text-red-500 line-through opacity-60">caos</span> para o
            <br />
            <span className="bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">
              controle total
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Veja a diferença entre <span className="text-red-500 font-semibold">perder dinheiro</span> e 
            <span className="text-primary font-semibold"> faturar no automático</span>
          </p>
        </motion.div>

        {/* Before/After Comparison */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto mb-20">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 md:p-8 bg-red-500/5 border-red-500/20 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-500">Sem Genesis</h3>
                    <p className="text-sm text-muted-foreground">O que você está perdendo agora</p>
                  </div>
                </div>
                
                <ul className="space-y-4">
                  {beforeAfter.before.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{item.text}</span>
                        <span className="ml-2 text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full font-medium">
                          {item.pain}
                        </span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 1 }}
                  className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  <p className="text-sm text-red-400 font-medium text-center">
                    💸 Prejuízo estimado: <span className="text-red-500 font-bold">R$ 15.000/mês</span>
                  </p>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">Com Genesis</h3>
                    <p className="text-sm text-muted-foreground">Sua nova realidade</p>
                  </div>
                </div>
                
                <ul className="space-y-4">
                  {beforeAfter.after.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={showAfter ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <span className="text-foreground group-hover:text-primary transition-colors">{item.text}</span>
                        <span className="ml-2 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-medium">
                          {item.gain}
                        </span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={showAfter ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.8 }}
                  className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-green-500/10 border border-primary/20"
                >
                  <p className="text-sm text-primary font-medium text-center">
                    🚀 Potencial de faturamento: <span className="text-green-500 font-bold">+R$ 47.000/mês</span>
                  </p>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="p-4 md:p-6 bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all text-center h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm font-medium mb-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Urgency Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-green-500/10 border border-primary/20">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm">
              <span className="font-bold text-primary">127 empresas</span> começaram a usar hoje
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaSolution;
