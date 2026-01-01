import { motion } from 'framer-motion';
import { 
  Calendar, Phone, MessageSquare, CreditCard, Users, 
  TrendingUp, Clock, CheckCircle, AlertCircle, ArrowRight,
  Zap, BarChart3, Target, Sparkles
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface FlowStep {
  icon: LucideIcon;
  label: string;
  status: 'manual' | 'slow' | 'optimized';
}

interface NicheConfig {
  name: string;
  flows: {
    before: FlowStep[];
    after: FlowStep[];
  };
  metrics: {
    before: { label: string; value: string; color: string }[];
    after: { label: string; value: string; color: string }[];
  };
}

const nicheConfigs: Record<string, NicheConfig> = {
  'clinica-estetica': {
    name: 'Clínica de Estética',
    flows: {
      before: [
        { icon: Phone, label: 'Agendamento Manual', status: 'manual' },
        { icon: MessageSquare, label: 'Confirmação por Ligação', status: 'slow' },
        { icon: Calendar, label: 'Controle em Planilha', status: 'manual' },
        { icon: CreditCard, label: 'Cobrança Manual', status: 'slow' },
      ],
      after: [
        { icon: Calendar, label: 'Agendamento Automático', status: 'optimized' },
        { icon: Zap, label: 'Confirmação Instantânea', status: 'optimized' },
        { icon: BarChart3, label: 'Dashboard Inteligente', status: 'optimized' },
        { icon: CreditCard, label: 'Cobrança Automatizada', status: 'optimized' },
      ]
    },
    metrics: {
      before: [
        { label: 'Taxa de No-Show', value: '35%', color: 'text-red-400' },
        { label: 'Tempo de Resposta', value: '24h', color: 'text-amber-400' },
        { label: 'Retorno de Clientes', value: '40%', color: 'text-amber-400' },
      ],
      after: [
        { label: 'Taxa de No-Show', value: '8%', color: 'text-emerald-400' },
        { label: 'Tempo de Resposta', value: '3min', color: 'text-emerald-400' },
        { label: 'Retorno de Clientes', value: '78%', color: 'text-emerald-400' },
      ]
    }
  },
  'barbearia': {
    name: 'Barbearia',
    flows: {
      before: [
        { icon: Phone, label: 'Ligação para Agendar', status: 'manual' },
        { icon: Users, label: 'Fila de Espera', status: 'slow' },
        { icon: Clock, label: 'Sem Previsão', status: 'manual' },
        { icon: CreditCard, label: 'Só Dinheiro/Pix', status: 'slow' },
      ],
      after: [
        { icon: Calendar, label: 'Booking Online 24h', status: 'optimized' },
        { icon: Zap, label: 'Lembretes Automáticos', status: 'optimized' },
        { icon: Target, label: 'Previsibilidade Total', status: 'optimized' },
        { icon: TrendingUp, label: 'Recorrência Inteligente', status: 'optimized' },
      ]
    },
    metrics: {
      before: [
        { label: 'Clientes Perdidos', value: '25%', color: 'text-red-400' },
        { label: 'Ociosidade', value: '40%', color: 'text-amber-400' },
        { label: 'Fidelização', value: '30%', color: 'text-amber-400' },
      ],
      after: [
        { label: 'Clientes Perdidos', value: '5%', color: 'text-emerald-400' },
        { label: 'Ociosidade', value: '10%', color: 'text-emerald-400' },
        { label: 'Fidelização', value: '75%', color: 'text-emerald-400' },
      ]
    }
  },
  'restaurante': {
    name: 'Restaurante/Delivery',
    flows: {
      before: [
        { icon: Phone, label: 'Pedidos por Telefone', status: 'manual' },
        { icon: MessageSquare, label: 'Cardápio Impresso', status: 'slow' },
        { icon: Clock, label: 'Entrega Sem Rastreio', status: 'manual' },
        { icon: Users, label: 'Sem Base de Clientes', status: 'slow' },
      ],
      after: [
        { icon: Zap, label: 'Pedidos Automatizados', status: 'optimized' },
        { icon: Sparkles, label: 'Cardápio Digital', status: 'optimized' },
        { icon: Target, label: 'Rastreio em Tempo Real', status: 'optimized' },
        { icon: TrendingUp, label: 'CRM de Clientes', status: 'optimized' },
      ]
    },
    metrics: {
      before: [
        { label: 'Pedidos Errados', value: '15%', color: 'text-red-400' },
        { label: 'Tempo Médio', value: '45min', color: 'text-amber-400' },
        { label: 'Recorrência', value: '25%', color: 'text-amber-400' },
      ],
      after: [
        { label: 'Pedidos Errados', value: '2%', color: 'text-emerald-400' },
        { label: 'Tempo Médio', value: '28min', color: 'text-emerald-400' },
        { label: 'Recorrência', value: '60%', color: 'text-emerald-400' },
      ]
    }
  },
  'default': {
    name: 'Empresa',
    flows: {
      before: [
        { icon: Phone, label: 'Processos Manuais', status: 'manual' },
        { icon: Clock, label: 'Tempo Desperdiçado', status: 'slow' },
        { icon: Users, label: 'Gestão Fragmentada', status: 'manual' },
        { icon: AlertCircle, label: 'Sem Visibilidade', status: 'slow' },
      ],
      after: [
        { icon: Zap, label: 'Automação Inteligente', status: 'optimized' },
        { icon: Target, label: 'Eficiência Máxima', status: 'optimized' },
        { icon: BarChart3, label: 'Gestão Unificada', status: 'optimized' },
        { icon: TrendingUp, label: 'Dados em Tempo Real', status: 'optimized' },
      ]
    },
    metrics: {
      before: [
        { label: 'Eficiência', value: '45%', color: 'text-red-400' },
        { label: 'Tempo Manual', value: '20h/sem', color: 'text-amber-400' },
        { label: 'Visibilidade', value: 'Baixa', color: 'text-amber-400' },
      ],
      after: [
        { label: 'Eficiência', value: '92%', color: 'text-emerald-400' },
        { label: 'Tempo Manual', value: '3h/sem', color: 'text-emerald-400' },
        { label: 'Visibilidade', value: 'Total', color: 'text-emerald-400' },
      ]
    }
  }
};

interface NicheFlowSimulationProps {
  niche?: string;
  showAfter: boolean;
  onTransitionComplete?: () => void;
}

export const NicheFlowSimulation = ({ 
  niche = 'default', 
  showAfter,
  onTransitionComplete
}: NicheFlowSimulationProps) => {
  const config = nicheConfigs[niche] || nicheConfigs.default;
  const flows = showAfter ? config.flows.after : config.flows.before;
  const metrics = showAfter ? config.metrics.after : config.metrics.before;

  const statusColors = {
    manual: 'border-red-500/30 bg-red-500/10 text-red-400',
    slow: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    optimized: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Flow Steps */}
      <motion.div 
        className="flex flex-wrap justify-center items-center gap-4 mb-12"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.15 } }
        }}
      >
        {flows.map((step, index) => (
          <motion.div
            key={`${step.label}-${index}`}
            className="flex items-center gap-3"
            variants={{
              hidden: { opacity: 0, scale: 0.8, y: 20 },
              visible: { opacity: 1, scale: 1, y: 0 }
            }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={() => {
              if (index === flows.length - 1 && onTransitionComplete) {
                setTimeout(onTransitionComplete, 500);
              }
            }}
          >
            <div className={`flex flex-col items-center p-4 rounded-xl border-2 ${statusColors[step.status]} transition-all duration-500`}>
              <step.icon className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium text-center max-w-[100px]">{step.label}</span>
            </div>
            
            {index < flows.length - 1 && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                transition={{ delay: 0.3 + index * 0.15, duration: 0.3 }}
              >
                <ArrowRight className={`w-6 h-6 ${showAfter ? 'text-emerald-400' : 'text-slate-500'}`} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Metrics */}
      <motion.div 
        className="grid grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
          >
            <div className={`text-3xl font-bold mb-1 ${metric.color}`}>
              {metric.value}
            </div>
            <div className="text-sm text-white/60">{metric.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export const getNicheSlug = (nicheName: string): string => {
  const mapping: Record<string, string> = {
    'Barbearia': 'barbearia',
    'Clínica de Estética': 'clinica-estetica',
    'Estética': 'clinica-estetica',
    'Restaurante': 'restaurante',
    'Delivery': 'restaurante',
    'Academia': 'default',
    'Consultório': 'clinica-estetica',
  };
  
  for (const [key, value] of Object.entries(mapping)) {
    if (nicheName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return 'default';
};
