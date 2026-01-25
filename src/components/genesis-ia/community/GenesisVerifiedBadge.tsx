import { motion } from 'framer-motion';

interface GenesisVerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GenesisVerifiedBadge = ({ size = 'md', className = '' }: GenesisVerifiedBadgeProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-[12px]'
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      className={`relative inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-[3px] opacity-60 animate-pulse" />
      
      {/* Main badge container */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-[1.5px] shadow-lg shadow-blue-500/40">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 flex items-center justify-center">
          {/* Checkmark icon */}
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            className={`${iconSizes[size]} text-white drop-shadow-sm`}
            style={{ width: '60%', height: '60%' }}
          >
            <path 
              d="M9 12.5L11.5 15L15 10" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Sparkle effects */}
      <motion.div
        animate={{ 
          opacity: [0.4, 1, 0.4],
          scale: [0.8, 1.1, 0.8]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white rounded-full"
      />
    </motion.div>
  );
};

export default GenesisVerifiedBadge;
