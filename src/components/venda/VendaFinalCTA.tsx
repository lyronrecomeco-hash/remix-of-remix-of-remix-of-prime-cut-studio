import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Rocket, Shield, Clock, Zap, Users, CheckCircle2, Gift, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const VendaFinalCTA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 47, seconds: 59 });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={ref} className="py-20 md:py-32 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-blue-600/10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Animated Orbs */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl"
      />

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Urgency Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-3 px-4 py-2 mb-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-500"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-sm font-medium">
              Oferta termina em: {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
            </span>
          </motion.div>

          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/40"
          >
            <Rocket className="w-12 h-12 text-white" />
          </motion.div>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Pronto para transformar
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              seu atendimento?
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a <span className="text-primary font-bold">+2.847 empresas</span> que já automatizaram
            seu WhatsApp e estão <span className="text-green-500 font-bold">fechando mais vendas</span> enquanto dormem.
          </p>

          {/* Benefits Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10"
          >
            {[
              { icon: Shield, text: 'Garantia 7 dias' },
              { icon: Clock, text: 'Setup em 5 min' },
              { icon: Gift, text: 'Sem cartão' },
              { icon: Zap, text: 'Suporte 24/7' },
            ].map((badge, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur"
              >
                <badge.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-10 py-8 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-2xl shadow-primary/40 group"
            >
              <Link to="/genesis" className="flex items-center gap-3">
                <Rocket className="w-6 h-6" />
                Começar Meu Trial Grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-10 flex flex-col items-center gap-4"
          >
            {/* Avatars */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 border-2 border-background flex items-center justify-center text-xs text-white font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm font-bold ml-1">4.9</span>
                </div>
                <p className="text-xs text-muted-foreground">+2.847 avaliações</p>
              </div>
            </div>
            
            {/* Live Activity */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <Users className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm text-green-600">
                <strong>23 pessoas</strong> estão testando agora
              </span>
            </div>
          </motion.div>

          {/* Urgency Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1 }}
            className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 max-w-md mx-auto"
          >
            <p className="text-sm text-amber-600 font-medium flex items-center justify-center gap-2">
              <Gift className="w-5 h-5" />
              <span>
                🔥 Bônus exclusivo: primeiros 100 usuários ganham <strong>30 dias extras</strong> de Premium
              </span>
            </p>
          </motion.div>

          {/* Trust Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.2 }}
            className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground"
          >
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Pagamento 100% seguro
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Dados protegidos por SSL
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Conformidade LGPD
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaFinalCTA;
