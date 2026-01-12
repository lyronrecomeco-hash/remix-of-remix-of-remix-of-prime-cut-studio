import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Clock, MessageSquareOff, TrendingDown, Users, AlertCircle, ArrowDown } from 'lucide-react';

const problems = [
  {
    icon: Clock,
    stat: '4h+',
    title: 'Tempo desperdiçado',
    description: 'Sua equipe gasta horas respondendo as mesmas perguntas. Tempo que poderia estar vendendo.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-100',
  },
  {
    icon: MessageSquareOff,
    stat: '67%',
    title: 'Leads abandonados',
    description: 'Dos clientes desistem se não recebem resposta em 5 minutos. Seu concorrente responde em 3s.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-100',
  },
  {
    icon: TrendingDown,
    stat: 'R$50k+',
    title: 'Vendas perdidas',
    description: 'Por mês em oportunidades que escapam enquanto você dorme ou está ocupado.',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
  },
];

const SiteProblem = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
      <div className="container px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-red-50 border border-red-100 text-red-700">
            <AlertCircle className="w-4 h-4" />
            O problema que ninguém fala
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Enquanto você lê isso,{' '}
            <span className="text-red-600">dinheiro está escapando</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Seu WhatsApp está lotado, sua equipe esgotada e leads desistem esperando.{' '}
            <strong className="text-gray-900">Seus concorrentes já automatizaram.</strong>
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`p-8 rounded-3xl ${problem.bgColor} border ${problem.borderColor} transition-all`}
            >
              <div className={`w-14 h-14 rounded-2xl ${problem.bgColor} flex items-center justify-center mb-6`}>
                <problem.icon className={`w-7 h-7 ${problem.color}`} />
              </div>
              <div className={`text-5xl font-bold ${problem.color} mb-4`}>{problem.stat}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{problem.title}</h3>
              <p className="text-gray-600 leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Total Loss */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="p-8 rounded-3xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100">
            <p className="text-lg text-gray-600 mb-2">Prejuízo mensal estimado:</p>
            <p className="text-4xl md:text-5xl font-bold text-red-600 mb-4">R$ 15.000 a R$ 50.000</p>
            <p className="text-gray-500">Em vendas perdidas e oportunidades que nunca voltam.</p>
          </div>
        </motion.div>

        {/* Transition */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-xl text-gray-600 mb-4">Mas existe uma solução comprovada.</p>
          <p className="text-2xl font-bold text-gray-900 mb-6">
            E ela funciona{' '}
            <span className="text-green-600">enquanto você dorme.</span>
          </p>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ArrowDown className="w-8 h-8 text-green-600 mx-auto" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SiteProblem;
