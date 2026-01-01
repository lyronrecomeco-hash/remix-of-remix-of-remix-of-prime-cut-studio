import { motion } from 'framer-motion';

interface LunaAvatarProps {
  state: 'idle' | 'talking' | 'thinking' | 'excited';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LunaAvatar = ({ state, size = 'md', className = '' }: LunaAvatarProps) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const glowIntensity = {
    idle: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
    talking: 'shadow-[0_0_50px_rgba(139,92,246,0.5)]',
    thinking: 'shadow-[0_0_40px_rgba(59,130,246,0.5)]',
    excited: 'shadow-[0_0_60px_rgba(16,185,129,0.5)]'
  };

  const borderColors = {
    idle: 'from-violet-500 to-purple-600',
    talking: 'from-violet-400 to-fuchsia-500',
    thinking: 'from-blue-400 to-cyan-500',
    excited: 'from-emerald-400 to-teal-500'
  };

  return (
    <motion.div 
      className={`relative ${sizeClasses[size]} ${className}`}
      animate={state === 'talking' ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.5, repeat: state === 'talking' ? Infinity : 0 }}
    >
      {/* Outer glow ring */}
      <motion.div 
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${borderColors[state]} blur-md opacity-60`}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Main avatar container */}
      <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${borderColors[state]} p-[3px] ${glowIntensity[state]} transition-shadow duration-500`}>
        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
          {/* Luna Face SVG */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background gradient */}
            <defs>
              <radialGradient id="faceGradient" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="rgba(139,92,246,0.2)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            
            {/* Ambient glow */}
            <circle cx="50" cy="50" r="48" fill="url(#faceGradient)" />
            
            {/* Hair */}
            <motion.ellipse 
              cx="50" cy="35" rx="35" ry="28" 
              fill="url(#hairGradient)"
              animate={state === 'excited' ? { ry: [28, 30, 28] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            
            {/* Face */}
            <ellipse cx="50" cy="55" rx="28" ry="32" fill="#FCD5CE" />
            
            {/* Left eye */}
            <motion.g
              animate={state === 'thinking' ? { y: [-1, 1, -1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ellipse cx="40" cy="50" rx="6" ry="7" fill="white" />
              <motion.circle 
                cx="40" 
                cy="50" 
                r="3.5" 
                fill="#1F2937"
                animate={state === 'talking' ? { cy: [50, 49, 50] } : {}}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
              <circle cx="41.5" cy="48.5" r="1" fill="white" />
            </motion.g>
            
            {/* Right eye */}
            <motion.g
              animate={state === 'thinking' ? { y: [-1, 1, -1] } : {}}
              transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            >
              <ellipse cx="60" cy="50" rx="6" ry="7" fill="white" />
              <motion.circle 
                cx="60" 
                cy="50" 
                r="3.5" 
                fill="#1F2937"
                animate={state === 'talking' ? { cy: [50, 49, 50] } : {}}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
              <circle cx="61.5" cy="48.5" r="1" fill="white" />
            </motion.g>
            
            {/* Eyebrows */}
            <motion.path
              d="M34 42 Q40 40 46 42"
              stroke="#6B7280"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              animate={state === 'excited' ? { d: "M34 40 Q40 38 46 40" } : {}}
            />
            <motion.path
              d="M54 42 Q60 40 66 42"
              stroke="#6B7280"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              animate={state === 'excited' ? { d: "M54 40 Q60 38 66 40" } : {}}
            />
            
            {/* Nose */}
            <path d="M48 56 Q50 60 52 56" stroke="#E5B5AD" strokeWidth="1.5" fill="none" />
            
            {/* Mouth */}
            <motion.path
              d={state === 'talking' ? "M42 68 Q50 75 58 68" : state === 'excited' ? "M40 66 Q50 78 60 66" : "M44 68 Q50 72 56 68"}
              stroke="#E57373"
              strokeWidth="2"
              fill={state === 'excited' ? "#FFCDD2" : "none"}
              strokeLinecap="round"
              animate={state === 'talking' ? { 
                d: ["M42 68 Q50 75 58 68", "M44 68 Q50 72 56 68", "M42 68 Q50 75 58 68"] 
              } : {}}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
            
            {/* Blush */}
            <circle cx="32" cy="60" r="5" fill="rgba(255,182,193,0.5)" />
            <circle cx="68" cy="60" r="5" fill="rgba(255,182,193,0.5)" />
          </svg>
        </div>
      </div>
      
      {/* Thinking particles */}
      {state === 'thinking' && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              style={{ top: '-10%', right: `${10 + i * 15}%` }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </>
      )}
      
      {/* Excited sparkles */}
      {state === 'excited' && (
        <>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-400"
              style={{ 
                top: `${Math.random() * 20}%`, 
                left: `${i * 25}%` 
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            >
              ✦
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  );
};
