import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles, Zap, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const benefits = [
  { icon: Zap, text: 'Setup em 5 minutos' },
  { icon: Shield, text: 'Sem cartão de crédito' },
  { icon: Clock, text: '7 dias grátis' },
];

const ComercialCTA = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900" />
      
      {/* Animated Gradient Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-3xl"
      />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </motion.div>
            <span className="text-sm font-semibold text-emerald-300">Oferta por tempo limitado</span>
          </motion.div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            Pronto para multiplicar
            <span className="block mt-3">
              <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                suas vendas
              </span>
              ?
            </span>
          </h2>

          <p className="mt-8 text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Junte-se a mais de <span className="text-white font-bold">500 empresas</span> que já transformaram 
            seu WhatsApp em uma máquina de vendas automática.
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12"
          >
            <Link to="/genesis/login">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-gray-900 font-black text-xl px-12 py-8 rounded-2xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300"
              >
                Começar Meu Teste Grátis
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 mt-10"
          >
            {benefits.map((benefit, index) => (
              <div key={benefit.text} className="flex items-center gap-2 text-gray-300">
                <benefit.icon className="w-5 h-5 text-emerald-400" />
                <span className="font-medium">{benefit.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Trust Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 pt-12 border-t border-white/10"
          >
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <div className="text-center">
                <p className="text-3xl font-black text-white">500+</p>
                <p className="text-gray-400 text-sm">Empresas ativas</p>
              </div>
              <div className="w-px h-12 bg-white/20 hidden sm:block" />
              <div className="text-center">
                <p className="text-3xl font-black text-white">2M+</p>
                <p className="text-gray-400 text-sm">Mensagens/mês</p>
              </div>
              <div className="w-px h-12 bg-white/20 hidden sm:block" />
              <div className="text-center">
                <p className="text-3xl font-black text-white">99.9%</p>
                <p className="text-gray-400 text-sm">Uptime</p>
              </div>
              <div className="w-px h-12 bg-white/20 hidden sm:block" />
              <div className="text-center">
                <p className="text-3xl font-black text-white">4.9⭐</p>
                <p className="text-gray-400 text-sm">Avaliação</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComercialCTA;
