import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Sparkles, Zap, Bot, MessageSquare, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SiteHero = () => {
  const [count, setCount] = useState({ empresas: 0, mensagens: 0, conversao: 0 });
  
  useEffect(() => {
    const targets = { empresas: 2847, mensagens: 10, conversao: 340 };
    const duration = 2000;
    const steps = 60;
    const increment = {
      empresas: targets.empresas / steps,
      mensagens: targets.mensagens / steps,
      conversao: targets.conversao / steps,
    };
    
    let step = 0;
    const timer = setInterval(() => {
      if (step < steps) {
        setCount({
          empresas: Math.floor(increment.empresas * step),
          mensagens: Math.floor(increment.mensagens * step),
          conversao: Math.floor(increment.conversao * step),
        });
        step++;
      } else {
        setCount(targets);
        clearInterval(timer);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 bg-white overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-green-50/50" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-br from-emerald-200/40 to-green-300/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-tr from-green-200/30 to-emerald-100/40 rounded-full blur-3xl" />
      
      {/* Floating Cards */}
      <motion.div
        initial={{ opacity: 0, x: -50, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute top-1/4 left-8 hidden xl:block"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl shadow-gray-200/50 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">+340%</p>
              <p className="text-xs text-gray-500">ROI médio</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="absolute top-1/3 right-8 hidden xl:block"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl shadow-gray-200/50 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Luna IA</p>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-xs text-emerald-600">Ativa agora</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-1/4 right-16 hidden xl:block"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl shadow-gray-200/50 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">10M+ mensagens</p>
              <p className="text-xs text-gray-500">por mês</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container relative z-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              Plataforma #1 em Automação WhatsApp no Brasil
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-6"
          >
            Venda mais no{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                WhatsApp
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute bottom-2 left-0 right-0 h-3 bg-emerald-200/60 -z-0 origin-left rounded-sm"
              />
            </span>{' '}
            com IA
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            A <span className="font-semibold text-gray-900">Luna IA</span> atende, qualifica e fecha vendas 
            automaticamente — <span className="text-emerald-600 font-medium">24h por dia, 7 dias por semana</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-8 py-7 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-2xl shadow-emerald-500/30 group min-w-[240px] rounded-2xl"
            >
              <Link to="/genesis" className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Testar Grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-7 border-gray-300 text-gray-700 hover:bg-gray-50 group min-w-[240px] rounded-2xl"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver como funciona
            </Button>
          </motion.div>

          {/* Trust Points */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-16"
          >
            {[
              { icon: CheckCircle, text: '7 dias grátis' },
              { icon: Shield, text: 'Sem cartão de crédito' },
              { icon: Zap, text: 'Setup em 5 min' },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-emerald-500" />
                {item.text}
              </span>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {[
              { value: `${count.empresas.toLocaleString()}+`, label: 'Empresas ativas' },
              { value: `${count.mensagens}M+`, label: 'Mensagens/mês' },
              { value: `${count.conversao}%`, label: 'ROI médio' },
            ].map((stat, i) => (
              <div key={i} className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SiteHero;
