import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface HeatScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const HeatScoreBadge = ({ score, size = 'md' }: HeatScoreBadgeProps) => {
  const getColor = () => {
    if (score >= 80) return { bg: 'from-red-500/20 to-orange-500/20', text: 'text-red-400', border: 'border-red-500/30', glow: 'shadow-red-500/20' };
    if (score >= 60) return { bg: 'from-orange-500/20 to-amber-500/20', text: 'text-orange-400', border: 'border-orange-500/30', glow: 'shadow-orange-500/20' };
    if (score >= 40) return { bg: 'from-amber-500/20 to-yellow-500/20', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' };
    return { bg: 'from-blue-500/20 to-cyan-500/20', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' };
  };

  const getLabel = () => {
    if (score >= 80) return 'Explosivo';
    if (score >= 60) return 'Quente';
    if (score >= 40) return 'Morno';
    return 'Frio';
  };

  const colors = getColor();
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center ${sizeClasses[size]} rounded-full bg-gradient-to-r ${colors.bg} border ${colors.border} ${colors.text} font-semibold shadow-lg ${colors.glow}`}
    >
      <Flame className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{score}</span>
      {size !== 'sm' && <span className="opacity-70 text-[0.75em]">• {getLabel()}</span>}
    </motion.div>
  );
};
