import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { AlertTriangle, Clock, Users, TrendingDown, MessageSquareOff, DollarSign, ArrowDown, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

const problems = [
  {
    icon: Clock,
    title: 'Horas Desperdiçadas',
    description: 'Sua equipe gasta 4+ horas/dia respondendo as mesmas perguntas. Tempo que poderia estar vendendo.',
    stat: '4h',
    subStat: '/dia perdidas',
    cost: 'R$ 2.400/mês jogados fora',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    gradient: 'from-red-500/20 to-red-600/5',
  },
  {
    icon: MessageSquareOff,
    title: 'Leads Abandonados',
    description: '67% dos clientes desistem se não recebem resposta em 5 minutos. Seu concorrente responde em 3 segundos.',
    stat: '67%',
    subStat: 'desistem',
    cost: '2 em cada 3 vendas perdidas',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    gradient: 'from-orange-500/20 to-orange-600/5',
  },
  {
    icon: DollarSign,
    title: 'Dinheiro Evaporando',
    description: 'Cada lead que escapa pode valer R$ 500 a R$ 50.000. Quantos você perdeu esse mês?',
    stat: 'R$50k+',
    subStat: '/mês em vendas',
    cost: 'Enquanto você dorme, eles compram do concorrente',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    gradient: 'from-amber-500/20 to-amber-600/5',
  },
];

const AnimatedNumber = ({ value, suffix = '' }: { value: string; suffix?: string }) => {
  return <span>{value}{suffix}</span>;
};

const VendaProblems = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [liveCount, setLiveCount] = useState(127);

  // Simulate live leads being lost
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-background via-red-500/[0.02] to-muted/20 relative overflow-hidden">
      {/* Animated Warning Glow */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/10 rounded-full blur-3xl"
      />
      
      <div className="container px-4 relative z-10">
        {/* Live Counter Alert */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-sm font-medium">
              <span className="font-bold text-red-500">{liveCount} leads</span> perdidos hoje por empresas sem automação
            </span>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            O Problema que Custa Caro
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Enquanto você lê isso,
            <br />
            <span className="text-red-500">dinheiro está escapando</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Seu WhatsApp está lotado. Sua equipe está esgotada. Leads desistem esperando.
            <br />
            <span className="text-foreground font-semibold">E seus concorrentes? Já automatizaram há meses.</span>
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30, rotateX: 10 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <Card className={`p-6 md:p-8 h-full bg-gradient-to-br ${problem.gradient} backdrop-blur border ${problem.borderColor} hover:border-opacity-60 transition-all relative overflow-hidden`}>
                {/* Animated Glow */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-t ${problem.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
                
                <div className="relative">
                  {/* Icon */}
                  <motion.div 
                    className={`w-16 h-16 rounded-2xl ${problem.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    animate={isInView ? { rotate: [0, -5, 5, 0] } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
                  >
                    <problem.icon className={`w-8 h-8 ${problem.color}`} />
                  </motion.div>
                  
                  {/* Stat */}
                  <div className="mb-4">
                    <motion.span 
                      className={`text-5xl md:text-6xl font-bold ${problem.color}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.15, type: 'spring' }}
                    >
                      {problem.stat}
                    </motion.span>
                    <span className="text-lg text-muted-foreground ml-2">{problem.subStat}</span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold mb-3">{problem.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">{problem.description}</p>
                  
                  {/* Cost Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${problem.bgColor} border ${problem.borderColor}`}>
                    <TrendingDown className={`w-4 h-4 ${problem.color}`} />
                    <span className={`text-sm font-medium ${problem.color}`}>{problem.cost}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Total Loss Calculator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <Card className="p-6 md:p-8 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              Prejuízo mensal estimado:
            </h3>
            <motion.div 
              className="text-4xl md:text-5xl font-bold text-red-500 mb-4"
              initial={{ scale: 0.8 }}
              animate={isInView ? { scale: [0.8, 1.1, 1] } : {}}
              transition={{ delay: 1, duration: 0.5 }}
            >
              R$ 15.000 a R$ 50.000
            </motion.div>
            <p className="text-muted-foreground">
              Em vendas perdidas, tempo desperdiçado e oportunidades que nunca voltam.
            </p>
          </Card>
        </motion.div>

        {/* Transition Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center"
        >
          <p className="text-xl md:text-2xl mb-4">
            <span className="text-muted-foreground">Mas existe uma solução comprovada.</span>
          </p>
          <p className="text-2xl md:text-3xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">
              E ela funciona enquanto você dorme.
            </span>
          </p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowDown className="w-8 h-8 text-primary mx-auto" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaProblems;
