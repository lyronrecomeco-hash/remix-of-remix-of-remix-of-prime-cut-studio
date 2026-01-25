import { motion } from 'framer-motion';

interface GenesisVerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GenesisVerifiedBadge = ({ size = 'md', className = '' }: GenesisVerifiedBadgeProps) => {
  const sizeMap = {
    sm: { width: 16, height: 16 },
    md: { width: 20, height: 20 },
    lg: { width: 24, height: 24 }
  };

  const { width, height } = sizeMap[size];

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
      style={{ width, height }}
      title="Conta Verificada"
    >
      {/* Glow effect */}
      <motion.div
        animate={{ 
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.15, 1]
        }}
        transition={{ 
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%)',
          filter: 'blur(3px)'
        }}
      />

      {/* Badge with slow rotation */}
      <motion.svg
        viewBox="0 0 22 22"
        fill="none"
        style={{ width: '100%', height: '100%' }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Wavy badge shape with Genesis gradient */}
        <path
          d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246-5.683 6.206z"
          fill="url(#genesis-badge-gradient)"
        />
        <defs>
          <linearGradient id="genesis-badge-gradient" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="0.5" stopColor="#06B6D4" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </motion.svg>
    </motion.div>
  );
};

export default GenesisVerifiedBadge;
