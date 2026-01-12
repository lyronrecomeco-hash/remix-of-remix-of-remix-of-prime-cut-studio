import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bot, Zap, Clock, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const benefits = [
  {
    icon: Zap,
    title: 'Resposta instantânea',
    description: 'Menos de 3 segundos para responder qualquer cliente, 24 horas por dia.',
    stat: '<3s',
  },
  {
    icon: Bot,
    title: 'IA que vende',
    description: 'Luna entende contexto, qualifica leads e fecha vendas como seu melhor vendedor.',
    stat: '3.2x',
  },
  {
    icon: Clock,
    title: '4h economizadas',
    description: 'Por dia em atendimento manual. Sua equipe focada em fechar negócios.',
    stat: '4h/dia',
  },
  {
    icon: TrendingUp,
    title: 'ROI garantido',
    description: 'Aumento médio de 340% no retorno nos primeiros 90 dias.',
    stat: '340%',
  },
];

const SiteSolution = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="container px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-green-50 border border-green-200 text-green-700">
            <Bot className="w-4 h-4" />
            Conheça a Luna
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Sua nova funcionária que{' '}
            <span className="text-green-600">nunca dorme</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A Luna é uma IA treinada especificamente para vendas. Ela entende seu negócio, 
            qualifica leads e fecha vendas — tudo automaticamente.
          </p>
        </motion.div>

        {/* Luna Avatar + Features */}
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Luna Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative mx-auto w-80 h-80">
              {/* Outer Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-green-200"
              />
              
              {/* Middle Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-8 rounded-full border-2 border-dashed border-green-300"
              />
              
              {/* Inner Circle - Luna */}
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-green-600/40 flex items-center justify-center">
                <Bot className="w-20 h-20 text-white" />
              </div>
              
              {/* Floating Stats */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl p-3 shadow-xl border border-gray-100"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">24/7</p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </motion.div>
              
              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3 shadow-xl border border-gray-100"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">97%</p>
                  <p className="text-xs text-gray-500">Satisfação</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Benefits List */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="flex gap-4 p-6 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-200"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                  <benefit.icon className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{benefit.title}</h3>
                    <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      {benefit.stat}
                    </span>
                  </div>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </motion.div>
            ))}

            <Button asChild size="lg" className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 rounded-2xl shadow-lg shadow-green-600/30">
              <Link to="/genesis" className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Ativar Luna Gratuitamente
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SiteSolution;
