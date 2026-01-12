import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle, Sparkles, Zap, Bot, MessageSquare, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SiteHero = () => {
  const [count, setCount] = useState({ empresas: 0, mensagens: 0, satisfacao: 0 });
  
  useEffect(() => {
    const targets = { empresas: 2847, mensagens: 10, satisfacao: 97 };
    const duration = 2000;
    const steps = 60;
    const increment = {
      empresas: targets.empresas / steps,
      mensagens: targets.mensagens / steps,
      satisfacao: targets.satisfacao / steps,
    };
    
    let step = 0;
    const timer = setInterval(() => {
      if (step < steps) {
        setCount({
          empresas: Math.floor(increment.empresas * step),
          mensagens: Math.floor(increment.mensagens * step),
          satisfacao: Math.floor(increment.satisfacao * step),
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
      {/* Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Gradient Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-green-100/50 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-50/50 to-transparent rounded-full blur-3xl" />
      
      {/* Floating Elements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute top-1/4 left-10 hidden xl:block"
      >
        <div className="bg-white rounded-2xl p-4 shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">+1.247 leads</p>
              <p className="text-xs text-gray-500">captados este mês</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute top-1/3 right-10 hidden xl:block"
      >
        <div className="bg-white rounded-2xl p-4 shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Luna IA ativa</p>
              <p className="text-xs text-gray-500">Respondendo agora...</p>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </motion.div>

      <div className="container relative z-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
          >
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Plataforma #1 em Automação WhatsApp
            </span>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-6"
          >
            Transforme seu WhatsApp em uma{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                máquina de vendas
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute bottom-2 left-0 right-0 h-3 bg-green-200/60 -z-0 origin-left"
              />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            A <span className="font-semibold text-gray-900">Luna IA</span> atende, qualifica e fecha vendas 
            automaticamente — 24h por dia, 7 dias por semana.
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
              className="text-lg px-8 py-7 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-2xl shadow-green-600/30 group min-w-[280px] rounded-2xl"
            >
              <Link to="/genesis" className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Começar Grátis Agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-7 border-gray-300 text-gray-700 hover:bg-gray-50 group min-w-[280px] rounded-2xl"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="w-5 h-5 mr-2 text-green-600 group-hover:scale-110 transition-transform" />
              Ver Demonstração
            </Button>
          </motion.div>

          {/* Trust Points */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-600 mb-16"
          >
            {[
              { icon: CheckCircle, text: 'Grátis por 7 dias' },
              { icon: CheckCircle, text: 'Sem cartão de crédito' },
              { icon: CheckCircle, text: 'Setup em 5 minutos' },
              { icon: CheckCircle, text: 'Suporte brasileiro' },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-green-600" />
                {item.text}
              </span>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto p-8 bg-gradient-to-r from-gray-50 to-white rounded-3xl border border-gray-100"
          >
            {[
              { value: `${count.empresas.toLocaleString()}+`, label: 'Empresas ativas' },
              { value: `${count.mensagens}M+`, label: 'Mensagens/mês' },
              { value: '<3s', label: 'Tempo resposta' },
              { value: `${count.satisfacao}%`, label: 'Satisfação' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
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
          <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SiteHero;
