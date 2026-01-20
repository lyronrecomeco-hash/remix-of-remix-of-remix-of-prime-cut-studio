import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Bot, Zap, BarChart3, MessageSquare, Shield, 
  Sparkles, Users, Clock, Workflow, Brain, 
  Globe, Lock
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'Luna IA Avançada',
    description: 'Assistente conversacional que entende contexto e responde de forma natural 24/7.',
    gradient: 'from-cyan-500 to-blue-600',
    delay: 0,
  },
  {
    icon: Workflow,
    title: 'Flow Builder Visual',
    description: 'Crie fluxos de automação complexos com interface drag-and-drop intuitiva.',
    gradient: 'from-purple-500 to-pink-600',
    delay: 0.1,
  },
  {
    icon: Brain,
    title: 'Machine Learning',
    description: 'Sistema que aprende com cada conversa e melhora continuamente suas respostas.',
    gradient: 'from-orange-500 to-red-600',
    delay: 0.2,
  },
  {
    icon: BarChart3,
    title: 'Analytics Avançado',
    description: 'Dashboards em tempo real com métricas de conversão, engajamento e ROI.',
    gradient: 'from-emerald-500 to-teal-600',
    delay: 0.3,
  },
  {
    icon: Shield,
    title: 'Segurança Enterprise',
    description: 'Criptografia end-to-end, LGPD compliant e backups automáticos.',
    gradient: 'from-blue-500 to-indigo-600',
    delay: 0.4,
  },
  {
    icon: Globe,
    title: 'Multi-instâncias',
    description: 'Gerencie múltiplos números de WhatsApp em um único painel centralizado.',
    gradient: 'from-pink-500 to-rose-600',
    delay: 0.5,
  },
];

const GenesisCommercialFeatures = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="recursos" ref={ref} className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05),transparent_70%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="container px-4 relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
          >
            <Sparkles className="w-4 h-4" />
            Recursos Poderosos
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 text-white">
            Tudo que você precisa
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              para automatizar vendas
            </span>
          </h2>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Ferramentas enterprise-grade para transformar seu WhatsApp em uma 
            <span className="text-cyan-400 font-semibold"> máquina de vendas automatizada</span>.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: feature.delay }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 overflow-hidden">
                {/* Hover Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative Corner */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GenesisCommercialFeatures;
