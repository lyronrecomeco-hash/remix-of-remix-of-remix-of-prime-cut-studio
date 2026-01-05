import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AlertTriangle, Clock, Users, TrendingDown, MessageSquareOff, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';

const problems = [
  {
    icon: Clock,
    title: 'Horas Desperdiçadas',
    description: 'Sua equipe gasta 4+ horas/dia respondendo as mesmas perguntas no WhatsApp.',
    stat: '4h',
    subStat: '/dia perdidas',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  {
    icon: MessageSquareOff,
    title: 'Leads Abandonados',
    description: '67% dos clientes desistem se não recebem resposta em 5 minutos.',
    stat: '67%',
    subStat: 'desistem',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  {
    icon: DollarSign,
    title: 'Dinheiro Evaporando',
    description: 'Cada lead perdido pode representar milhares de reais em vendas não realizadas.',
    stat: 'R$50k+',
    subStat: '/mês em vendas',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
];

const VendaProblems = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-background to-muted/20 relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-500/[0.02] to-transparent pointer-events-none" />
      
      <div className="container px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            O Problema
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Enquanto você lê isso,
            <br />
            <span className="text-red-400">leads estão escapando</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seu WhatsApp está lotado. Sua equipe está sobrecarregada. 
            E seus concorrentes? Já automatizaram.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Card className={`p-6 h-full bg-card/50 backdrop-blur border ${problem.borderColor} hover:border-opacity-50 transition-all group relative overflow-hidden`}>
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 ${problem.bgColor} opacity-0 group-hover:opacity-100 transition-opacity blur-3xl`} />
                
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl ${problem.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <problem.icon className={`w-7 h-7 ${problem.color}`} />
                  </div>
                  
                  <div className="mb-4">
                    <span className={`text-5xl font-bold ${problem.color}`}>
                      {problem.stat}
                    </span>
                    <span className="text-lg text-muted-foreground ml-1">{problem.subStat}</span>
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Transition Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <p className="text-xl">
            <span className="text-muted-foreground">Mas existe uma solução.</span>
            <br />
            <span className="text-foreground font-semibold">E ela funciona enquanto você dorme.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaProblems;
