import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, MessageCircle, Zap, Bot, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

const stats = [
  { value: '10x', label: 'Mais Vendas', icon: TrendingUp },
  { value: '24/7', label: 'Atendimento', icon: Bot },
  { value: '<3s', label: 'Resposta', icon: Zap },
];

const ComercialHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div style={{ y }} className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        </motion.div>

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Radial Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-32 left-[10%] hidden lg:block"
      >
        <div className="w-16 h-16 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 flex items-center justify-center shadow-2xl">
          <MessageCircle className="w-8 h-8 text-primary" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [20, -20, 20], rotate: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-40 right-[15%] hidden lg:block"
      >
        <div className="w-14 h-14 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 flex items-center justify-center shadow-2xl">
          <Bot className="w-7 h-7 text-primary" />
        </div>
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
                <span className="text-sm font-semibold text-primary">
                  Inteligência Artificial que Vende
                </span>
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-foreground leading-[1.1] tracking-tight"
              >
                Automatize seu
                <span className="block mt-2">
                  <span className="text-gold-shine">
                    WhatsApp
                  </span>
                </span>
                <span className="block mt-2 text-muted-foreground text-3xl sm:text-4xl lg:text-5xl font-bold">
                  com IA de verdade
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                A <strong className="text-foreground">Luna IA</strong> atende, qualifica leads e fecha vendas automaticamente. 
                Nunca mais perca um cliente por demora no atendimento.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 mt-10 justify-center lg:justify-start"
              >
                <Link to="/genesis/login">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 group"
                  >
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.querySelector('#demo')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto border-2 border-border hover:border-primary/50 hover:bg-primary/5 text-foreground font-semibold text-lg px-8 py-6 rounded-2xl transition-all duration-300"
                >
                  Ver Demonstração
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-4 mt-12 justify-center lg:justify-start"
              >
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-3 px-5 py-3 bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg"
                  >
                    <stat.icon className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-black text-gold-shine">
                      {stat.value}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right - Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="relative z-10"
                >
                  <div className="w-[300px] sm:w-[340px] bg-card rounded-[3rem] p-3 border border-border shadow-2xl shadow-black/50">
                    <div className="bg-background rounded-[2.5rem] overflow-hidden">
                      {/* WhatsApp Header */}
                      <div className="bg-primary px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">Luna IA</p>
                          <p className="text-white/70 text-xs">online agora</p>
                        </div>
                        <div className="ml-auto">
                          <span className="px-2 py-1 bg-white/20 rounded-full text-[10px] text-white font-medium">IA</span>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="bg-card/50 p-4 space-y-3 min-h-[380px]">
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                          className="flex justify-end"
                        >
                          <div className="bg-primary/20 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                            <p className="text-sm text-foreground">Olá, quero saber sobre os planos</p>
                            <p className="text-[10px] text-muted-foreground text-right mt-1">14:32</p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 }}
                          className="flex justify-start"
                        >
                          <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%] border border-border/50">
                            <p className="text-sm text-foreground">
                              Olá! 👋 Sou a Luna, sua assistente virtual!
                            </p>
                            <p className="text-sm text-foreground mt-2">
                              Temos planos perfeitos para você. Qual o tamanho do seu negócio?
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium border border-primary/30">
                                Iniciante
                              </span>
                              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium border border-primary/30">
                                Crescimento
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2">14:32 ✓✓</p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.6 }}
                          className="flex justify-center"
                        >
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border/30">
                            <motion.span
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="w-2 h-2 bg-primary rounded-full"
                            />
                            <span className="text-xs text-muted-foreground">Luna está digitando...</span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Glow Effects */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-border flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 bg-primary rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ComercialHero;
