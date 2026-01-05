import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AlertTriangle, Clock, Users, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

const problems = [
  {
    icon: Clock,
    title: 'Tempo Perdido',
    description: 'Horas respondendo as mesmas perguntas repetitivas no WhatsApp.',
    stat: '4h/dia',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: Users,
    title: 'Clientes Esperando',
    description: 'Leads esfriando enquanto você não consegue responder a todos.',
    stat: '67%',
    subStat: 'desistem',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: TrendingDown,
    title: 'Vendas Perdidas',
    description: 'Oportunidades escapando por falta de follow-up automatizado.',
    stat: 'R$ 50k+',
    subStat: '/mês',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
];

const VendaProblems = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
            <AlertTriangle className="w-4 h-4" />
            Você está perdendo dinheiro
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            O caos do atendimento
            <br />
            <span className="text-muted-foreground">está te custando caro</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enquanto você luta para responder manualmente, seus concorrentes já automatizaram.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="p-6 h-full bg-card/50 backdrop-blur border-border/50 hover:border-border transition-all group">
                <div className={`w-14 h-14 rounded-2xl ${problem.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <problem.icon className={`w-7 h-7 ${problem.color}`} />
                </div>
                
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${problem.color}`}>
                    {problem.stat}
                  </span>
                  {problem.subStat && (
                    <span className="text-lg text-muted-foreground ml-1">{problem.subStat}</span>
                  )}
                </div>

                <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pain Point Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-xl text-muted-foreground">
            <span className="text-foreground font-semibold">A boa notícia?</span> Existe uma solução.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaProblems;
