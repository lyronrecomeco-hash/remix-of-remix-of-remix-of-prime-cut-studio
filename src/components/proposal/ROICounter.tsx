import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, DollarSign, Target } from 'lucide-react';

interface ROICounterProps {
  estimatedSavings: number;
  timeRecovery: number;
  revenueIncrease: number;
  paybackPeriod: number;
  animate?: boolean;
}

const AnimatedNumber = ({ 
  value, 
  prefix = '', 
  suffix = '',
  animate = true,
  duration = 2000
}: { 
  value: number; 
  prefix?: string; 
  suffix?: string;
  animate?: boolean;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!animate);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!animate) {
      setCount(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animate, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    
    let start = 0;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [hasStarted, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString('pt-BR')}{suffix}
    </span>
  );
};

export const ROICounter = ({ 
  estimatedSavings, 
  timeRecovery, 
  revenueIncrease,
  paybackPeriod,
  animate = true
}: ROICounterProps) => {
  const metrics = [
    {
      icon: DollarSign,
      label: 'Economia Estimada',
      value: estimatedSavings,
      prefix: 'R$ ',
      suffix: '/mês',
      color: 'from-emerald-400 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30'
    },
    {
      icon: Clock,
      label: 'Horas Recuperadas',
      value: timeRecovery,
      prefix: '',
      suffix: 'h/mês',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      icon: TrendingUp,
      label: 'Aumento de Receita',
      value: revenueIncrease,
      prefix: '+',
      suffix: '%',
      color: 'from-violet-400 to-violet-600',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/30'
    },
    {
      icon: Target,
      label: 'Retorno em',
      value: paybackPeriod,
      prefix: '',
      suffix: ' meses',
      color: 'from-amber-400 to-amber-600',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mx-auto">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: index * 0.15, duration: 0.6, ease: 'easeOut' }}
          className={`relative overflow-hidden rounded-2xl ${metric.bgColor} border ${metric.borderColor} p-6`}
        >
          {/* Gradient glow effect */}
          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${metric.color} opacity-20 blur-2xl`} />
          
          {/* Icon */}
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${metric.color} mb-4`}>
            <metric.icon className="w-6 h-6 text-white" />
          </div>
          
          {/* Value */}
          <div className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent mb-2`}>
            <AnimatedNumber 
              value={metric.value} 
              prefix={metric.prefix} 
              suffix={metric.suffix}
              animate={animate}
            />
          </div>
          
          {/* Label */}
          <div className="text-sm text-white/60 font-medium">
            {metric.label}
          </div>

          {/* Animated border */}
          <motion.div
            className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${metric.color}`}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: index * 0.15 + 0.5, duration: 1, ease: 'easeOut' }}
          />
        </motion.div>
      ))}
    </div>
  );
};
