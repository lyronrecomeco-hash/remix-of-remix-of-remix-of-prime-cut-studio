import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, ArrowRight, CheckCircle, Star, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SiteFinalCTA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 59, seconds: 59 });

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
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={ref} className="py-24 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-4 px-6 py-3 mb-8 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30"
          >
            <span className="text-orange-400 font-medium">🔥 Oferta expira em:</span>
            <div className="flex gap-2 font-mono">
              <span className="px-2 py-1 bg-white/10 rounded text-white font-bold">
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span className="text-white">:</span>
              <span className="px-2 py-1 bg-white/10 rounded text-white font-bold">
                {String(countdown.minutes).padStart(2, '0')}
              </span>
              <span className="text-white">:</span>
              <span className="px-2 py-1 bg-white/10 rounded text-white font-bold">
                {String(countdown.seconds).padStart(2, '0')}
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Pronto para{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              multiplicar suas vendas?
            </span>
          </h2>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Junte-se a mais de <strong className="text-white">2.800 empresas</strong> que já estão 
            faturando mais com a Luna IA.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {[
              'Trial grátis de 7 dias',
              'Setup em 5 minutos',
              'Sem cartão de crédito',
              'Suporte 24h',
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 text-gray-300"
              >
                <CheckCircle className="w-5 h-5 text-green-400" />
                {item}
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
          >
            <Button 
              asChild 
              size="lg" 
              className="text-xl px-12 py-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-2xl shadow-green-500/40 rounded-2xl group"
            >
              <Link to="/genesis" className="flex items-center gap-3">
                <Zap className="w-6 h-6" />
                Começar Meu Trial Grátis
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7 }}
            className="mt-10 flex flex-wrap justify-center gap-8"
          >
            {[
              { icon: Shield, text: 'Garantia 7 dias' },
              { icon: Star, text: '4.9/5 avaliações' },
              { icon: Clock, text: 'Suporte 24/7' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-500">
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9 }}
            className="mt-12 inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/10"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 border-2 border-gray-900" />
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-400">+127 empresas ativaram hoje</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SiteFinalCTA;
