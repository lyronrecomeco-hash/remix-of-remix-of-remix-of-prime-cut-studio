import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Palette, MousePointer, Rocket,
  Sparkles, ArrowRight, Zap
} from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    number: '01',
    title: 'Responda as Perguntas',
    description: 'Explique seu projeto, público e objetivos. Nossa IA compreenderá o planejamento e estrutura ideal para você.',
    gradient: 'from-blue-500 to-cyan-400',
    glowColor: 'shadow-blue-500/30',
  },
  {
    icon: Palette,
    number: '02',
    title: 'Visualize e Personalize',
    description: 'Personalize cores, fontes e design de forma simples para refletir a identidade única do seu negócio.',
    gradient: 'from-violet-500 to-purple-400',
    glowColor: 'shadow-violet-500/30',
  },
  {
    icon: MousePointer,
    number: '03',
    title: 'Gere com 1 Clique',
    description: 'Em segundos, sua solução completa está pronta: website, sistemas e páginas de vendas inclusas.',
    gradient: 'from-emerald-500 to-teal-400',
    glowColor: 'shadow-emerald-500/30',
  },
  {
    icon: Rocket,
    number: '04',
    title: 'Publique e Lucre',
    description: 'Publique online, conecte seu método de pagamento e comece a lucrar com seu novo produto digital.',
    gradient: 'from-rose-500 to-pink-400',
    glowColor: 'shadow-rose-500/30',
  },
];

const GenesisCommercialFeatures = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  return (
    <section 
      id="recursos" 
      ref={ref} 
      className="py-24 md:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(222 47% 8%) 0%, hsl(222 47% 6%) 50%, hsl(222 47% 8%) 100%)'
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent)' }}
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{ background: 'radial-gradient(circle, hsl(320 80% 50%), transparent)' }}
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container px-4 relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 text-sm font-semibold rounded-full border border-primary/30 text-primary"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))',
              boxShadow: '0 0 30px hsl(var(--primary) / 0.2), inset 0 1px 0 hsl(var(--primary) / 0.2)'
            }}
          >
            <Sparkles className="w-4 h-4" />
            Como Funciona
            <Zap className="w-4 h-4" />
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 text-white leading-tight">
            Com a <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">Genesis</span>, desenvolver um SaaS é{' '}
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">fácil, ágil e eficiente</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Tudo o que você precisa para criar SaaS profissionais e escaláveis, em um único lugar.
          </p>
        </motion.div>

        {/* Interactive Steps Timeline */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-[100px] left-[10%] right-[10%] h-1 rounded-full overflow-hidden bg-slate-800/50">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(180 80% 50%), hsl(var(--primary)))'
              }}
              initial={{ width: "0%" }}
              animate={isInView ? { 
                width: `${((activeStep + 1) / steps.length) * 100}%` 
              } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            {/* Glowing Effect */}
            <motion.div
              className="absolute top-0 h-full w-20 blur-md"
              style={{
                background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
                left: `${((activeStep + 1) / steps.length) * 100 - 5}%`
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isCompleted = index < activeStep;
              const Icon = step.icon;
              
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative group"
                  onClick={() => {
                    setActiveStep(index);
                    setIsPlaying(false);
                  }}
                  onMouseEnter={() => setIsPlaying(false)}
                  onMouseLeave={() => setIsPlaying(true)}
                >
                  {/* Step Number Circle */}
                  <div className="flex justify-center mb-6 relative z-10">
                    <motion.div 
                      className={`
                        w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg
                        transition-all duration-500 cursor-pointer relative
                        ${isActive || isCompleted
                          ? `bg-gradient-to-br ${step.gradient} text-white shadow-xl ${step.glowColor}` 
                          : 'bg-slate-800/80 text-slate-400 border-2 border-slate-700 hover:border-slate-600'
                        }
                      `}
                      animate={isActive ? { 
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          '0 0 20px rgba(59, 130, 246, 0.3)',
                          '0 0 40px rgba(59, 130, 246, 0.5)',
                          '0 0 20px rgba(59, 130, 246, 0.3)'
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {step.number}
                      
                      {/* Pulse Ring */}
                      {isActive && (
                        <motion.div
                          className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.gradient}`}
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 1.8, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  </div>

                  {/* Card */}
                  <motion.div 
                    className={`
                      relative p-6 rounded-2xl cursor-pointer overflow-hidden
                      transition-all duration-500 min-h-[220px]
                      ${isActive 
                        ? `bg-gradient-to-br ${step.gradient} shadow-2xl ${step.glowColor}` 
                        : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                      }
                    `}
                    animate={isActive ? { 
                      y: -8, 
                      scale: 1.02,
                    } : { 
                      y: 0, 
                      scale: 1 
                    }}
                    whileHover={!isActive ? { y: -4, scale: 1.01 } : {}}
                    style={{
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {/* Background Number */}
                    <div className={`
                      absolute -top-2 -right-2 text-8xl font-black pointer-events-none select-none
                      ${isActive ? 'text-white/10' : 'text-slate-800/30'}
                    `}>
                      {step.number}
                    </div>

                    {/* Shimmer Effect */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                    )}

                    {/* Icon */}
                    <motion.div 
                      className={`
                        relative w-14 h-14 rounded-xl flex items-center justify-center mb-5
                        ${isActive 
                          ? 'bg-white/20 backdrop-blur-sm' 
                          : 'bg-slate-800/80 border border-slate-700'
                        }
                      `}
                      animate={isActive ? {
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      } : {}}
                      transition={{ duration: 3, repeat: isActive ? Infinity : 0 }}
                    >
                      <Icon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    </motion.div>

                    {/* Content */}
                    <h3 className={`text-lg font-bold mb-3 relative z-10 ${
                      isActive ? 'text-white' : 'text-white/90'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm leading-relaxed relative z-10 ${
                      isActive ? 'text-white/90' : 'text-slate-400'
                    }`}>
                      {step.description}
                    </p>

                    {/* Arrow Connector */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:flex absolute top-[100px] -right-6 z-20">
                        <motion.div
                          animate={isActive || isCompleted ? {
                            x: [0, 5, 0],
                            opacity: [0.6, 1, 0.6]
                          } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className={`w-5 h-5 ${
                            isActive || isCompleted ? 'text-primary' : 'text-slate-600'
                          }`} />
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Dots */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8 }}
            className="flex justify-center items-center gap-3 mt-12"
          >
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveStep(index);
                  setIsPlaying(false);
                }}
                className="relative group/dot"
              >
                <motion.div
                  className={`
                    w-3 h-3 rounded-full transition-all duration-300
                    ${index === activeStep 
                      ? `bg-gradient-to-r ${step.gradient} shadow-lg ${step.glowColor}` 
                      : index < activeStep 
                        ? 'bg-primary/60' 
                        : 'bg-slate-700 hover:bg-slate-600'
                    }
                  `}
                  animate={index === activeStep ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 1.5, repeat: index === activeStep ? Infinity : 0 }}
                />
                {index === activeStep && (
                  <motion.div
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${step.gradient}`}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </button>
            ))}
            
            {/* Auto-play indicator */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="ml-4 flex items-center gap-2 text-xs text-slate-500"
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span>Auto</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GenesisCommercialFeatures;
