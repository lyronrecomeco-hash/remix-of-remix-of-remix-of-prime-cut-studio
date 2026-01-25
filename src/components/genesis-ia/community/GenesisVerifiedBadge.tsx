import { motion } from 'framer-motion';
import sealImage from '@/assets/genesis-verified-seal.png';

interface GenesisVerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GenesisVerifiedBadge = ({ size = 'md', className = '' }: GenesisVerifiedBadgeProps) => {
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const dimension = sizeMap[size];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20,
        duration: 0.6
      }}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: dimension, height: dimension }}
      title="Conta Verificada"
    >
      {/* Glow effect */}
      <motion.div
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full bg-primary/30 blur-sm"
      />

      {/* Rotating seal */}
      <motion.img
        src={sealImage}
        alt="Verificado"
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="relative w-full h-full object-contain drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)]"
      />
    </motion.div>
  );
};

export default GenesisVerifiedBadge;
