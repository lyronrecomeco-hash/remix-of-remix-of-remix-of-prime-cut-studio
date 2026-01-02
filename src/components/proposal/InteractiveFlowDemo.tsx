import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Calendar, 
  CheckCircle2, 
  Users, 
  TrendingUp,
  Bot,
  Clock,
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface InteractiveFlowDemoProps {
  niche: string;
  onComplete?: () => void;
}

interface FlowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'waiting' | 'active' | 'completed';
  metrics?: { label: string; value: string };
}

export const InteractiveFlowDemo = ({ niche, onComplete }: InteractiveFlowDemoProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const getNicheFlow = (): FlowStep[] => {
    const baseFlow = [
      {
        id: 1,
        title: 'Cliente Entra em Contato',
        description: 'WhatsApp, Instagram, Site...',
        icon: <MessageCircle className="w-5 h-5" />,
        status: 'waiting' as const,
        metrics: { label: 'Tempo médio', value: '3 segundos' }
      },
      {
        id: 2,
        title: 'IA Responde Instantaneamente',
        description: 'Atendimento 24/7 personalizado',
        icon: <Bot className="w-5 h-5" />,
        status: 'waiting' as const,
        metrics: { label: 'Taxa de resposta', value: '100%' }
      },
      {
        id: 3,
        title: 'Agenda Automaticamente',
        description: 'Horário confirmado sem esforço',
        icon: <Calendar className="w-5 h-5" />,
        status: 'waiting' as const,
        metrics: { label: 'Conversão', value: '+67%' }
      },
      {
        id: 4,
        title: 'Lembrete Enviado',
        description: '24h e 1h antes do horário',
        icon: <Clock className="w-5 h-5" />,
        status: 'waiting' as const,
        metrics: { label: 'No-shows', value: '-80%' }
      },
      {
        id: 5,
        title: 'Cliente Comparece',
        description: 'Atendimento realizado com sucesso',
        icon: <CheckCircle2 className="w-5 h-5" />,
        status: 'waiting' as const,
        metrics: { label: 'Satisfação', value: '4.9/5' }
      },
      {
        id: 6,
        title: 'Fidelização Automática',
        description: 'Pós-venda e remarketing',
        icon: <TrendingUp className="w-5 h-5" />,
        status: 'waiting' as const,
        metrics: { label: 'Retorno', value: '+45%' }
      }
    ];

    // Customizar por nicho
    switch (niche) {
      case 'clinica':
        baseFlow[0].description = 'Paciente busca consulta';
        baseFlow[2].title = 'Consulta Agendada';
        baseFlow[4].title = 'Paciente Atendido';
        break;
      case 'restaurante':
        baseFlow[0].description = 'Cliente quer fazer pedido';
        baseFlow[2].title = 'Pedido Confirmado';
        baseFlow[3].title = 'Preparo e Entrega';
        baseFlow[4].title = 'Pedido Entregue';
        break;
    }

    return baseFlow;
  };

  const [steps, setSteps] = useState<FlowStep[]>(getNicheFlow());

  useEffect(() => {
    if (!isAnimating) return;

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          setIsAnimating(false);
          onComplete?.();
          return prev;
        }
        return next;
      });
    }, 1800);

    return () => clearInterval(timer);
  }, [isAnimating, steps.length, onComplete]);

  useEffect(() => {
    setSteps(prev => prev.map((step, index) => ({
      ...step,
      status: index < currentStep ? 'completed' : index === currentStep ? 'active' : 'waiting'
    })));
  }, [currentStep]);

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm mb-4">
          <Sparkles className="w-4 h-4" />
          Fluxo de Trabalho Automatizado
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Veja Como Funciona na Prática
        </h3>
        <p className="text-white/50">
          Do primeiro contato à fidelização — tudo automático
        </p>
      </motion.div>

      {/* Flow Steps - Desktop */}
      <div className="hidden md:block relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />
        <motion.div 
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary to-primary/50 -translate-y-1/2"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />

        {/* Steps */}
        <div className="relative grid grid-cols-6 gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              {/* Step Circle */}
              <motion.div
                className={`relative w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                  step.status === 'completed' 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                    : step.status === 'active'
                    ? 'bg-primary/20 text-primary border-2 border-primary animate-pulse'
                    : 'bg-white/5 text-white/30 border border-white/10'
                }`}
                animate={step.status === 'active' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: step.status === 'active' ? Infinity : 0 }}
              >
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  step.icon
                )}
                
                {/* Pulse ring for active */}
                {step.status === 'active' && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <h4 className={`text-xs font-medium text-center mb-1 transition-colors ${
                step.status === 'waiting' ? 'text-white/40' : 'text-white'
              }`}>
                {step.title}
              </h4>
              <p className="text-[10px] text-white/30 text-center mb-2">
                {step.description}
              </p>

              {/* Metrics */}
              {step.metrics && step.status !== 'waiting' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-primary/10 rounded-lg px-2 py-1 text-center"
                >
                  <span className="text-primary text-xs font-bold">{step.metrics.value}</span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Flow Steps - Mobile (Vertical) */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
              step.status === 'completed' 
                ? 'bg-primary/10 border-primary/30' 
                : step.status === 'active'
                ? 'bg-white/5 border-primary animate-pulse'
                : 'bg-white/5 border-white/10 opacity-50'
            }`}
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              step.status === 'completed' ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white/50'
            }`}>
              {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white">{step.title}</h4>
              <p className="text-xs text-white/50">{step.description}</p>
            </div>

            {/* Metric */}
            {step.metrics && step.status !== 'waiting' && (
              <div className="bg-primary/20 rounded-lg px-3 py-1">
                <span className="text-primary text-sm font-bold">{step.metrics.value}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: currentStep >= steps.length - 1 ? 1 : 0, y: currentStep >= steps.length - 1 ? 0 : 20 }}
        className="mt-10 grid grid-cols-3 gap-4"
      >
        {[
          { label: 'Tempo Total', value: '< 2 min', icon: <Zap className="w-5 h-5" /> },
          { label: 'Esforço Manual', value: 'Zero', icon: <Bot className="w-5 h-5" /> },
          { label: 'Taxa de Sucesso', value: '95%', icon: <TrendingUp className="w-5 h-5" /> }
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-2">
              {stat.icon}
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/50">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default InteractiveFlowDemo;
