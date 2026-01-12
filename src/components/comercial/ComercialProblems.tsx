import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Clock, UserX, TrendingDown, MessageSquareX, AlertTriangle, XCircle } from 'lucide-react';

const problems = [
  {
    icon: Clock,
    title: 'Clientes abandonam',
    description: 'Demora no atendimento faz você perder vendas para concorrentes mais rápidos',
    stat: '67%',
    statLabel: 'desistem após 5min',
  },
  {
    icon: UserX,
    title: 'Equipe sobrecarregada',
    description: 'Atendentes não conseguem responder todos, qualidade cai drasticamente',
    stat: '3x',
    statLabel: 'mais erros sob pressão',
  },
  {
    icon: TrendingDown,
    title: 'Vendas perdidas',
    description: 'Fora do horário comercial, leads quentes esfriam e compram em outro lugar',
    stat: '40%',
    statLabel: 'mensagens à noite',
  },
  {
    icon: MessageSquareX,
    title: 'Atendimento inconsistente',
    description: 'Cada atendente responde de um jeito, sem padrão de qualidade',
    stat: '52%',
    statLabel: 'reclamam do atendimento',
  },
];

const ComercialProblems = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-24 lg:py-32 bg-gradient-to-b from-white via-red-50/30 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-red-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 border border-red-200 mb-6"
          >
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-600">O problema</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
            Quanto você perde por
            <span className="block mt-2 text-red-500">atendimento lento?</span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Cada minuto de demora é dinheiro saindo do seu bolso. Veja os problemas que empresas enfrentam diariamente.
          </p>
        </motion.div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-red-500/5 border border-red-100/50 hover:border-red-200 transition-all duration-300 overflow-hidden"
              >
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <problem.icon className="w-7 h-7 text-red-500" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-red-500">{problem.stat}</p>
                      <p className="text-xs text-gray-500">{problem.statLabel}</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" />
                    {problem.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{problem.description}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl">
            <div className="text-left">
              <p className="text-white font-bold text-lg">Pronto para resolver isso?</p>
              <p className="text-gray-400 text-sm">Role para conhecer a solução</p>
            </div>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComercialProblems;
