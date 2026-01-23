import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Palette, MousePointer, Rocket,
  Sparkles, ArrowRight, Zap, Check, Play
} from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    number: '01',
    title: 'Responda as Perguntas',
    description: 'Explique seu projeto, público e objetivos. Nossa IA compreenderá o planejamento e estrutura ideal.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20',
  },
  {
    icon: Palette,
    number: '02',
    title: 'Visualize e Personalize',
    description: 'Personalize cores, fontes e design de forma simples para refletir a identidade do seu negócio.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/20',
  },
  {
    icon: MousePointer,
    number: '03',
    title: 'Gere com 1 clique',
    description: 'Em segundos, sua solução completa está pronta: website, sistemas e páginas de vendas inclusas.',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/20',
  },
  {
    icon: Rocket,
    number: '04',
    title: 'Publique e Lucre',
    description: 'Publique online, conecte seu método de pagamento e comece a lucrar com seu novo produto digital.',
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    glowColor: 'shadow-emerald-500/20',
  },
];

const GenesisCommercialFeatures = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance steps
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section id="recursos" ref={ref} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />
        
        {/* Moving particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}

        {/* Animated gradient orbs */}
        <motion.div
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-primary/10 to-cyan-500/5 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-purple-500/8 to-pink-500/5 rounded-full blur-[100px]"
        />
      </div>

      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container px-4 relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            Como Funciona
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-foreground">
            Com a <span className="text-primary">Genesis</span>, desenvolver um SaaS é{' '}
            <br className="hidden md:block" />
            <motion.span 
              className="text-primary inline-block"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              fácil, ágil e eficiente
            </motion.span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo o que você precisa para criar SaaS profissionais e escaláveis, em um único lugar.
          </p>
        </motion.div>

        {/* Interactive Steps Flow */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Progress Line - Desktop */}
          <div className="hidden lg:block absolute top-[88px] left-[10%] right-[10%] h-1 bg-muted/30 rounded-full overflow-hidden z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-cyan-500 to-primary rounded-full"
              initial={{ width: "0%" }}
              animate={isInView ? { 
                width: `${((activeStep + 1) / steps.length) * 100}%` 
              } : {}}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isCompleted = index < activeStep;
              
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={isInView ? { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                  } : {}}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.15,
                    type: "spring",
                    stiffness: 100
                  }}
                  className="relative group cursor-pointer"
                  onClick={() => setActiveStep(index)}
                  onMouseEnter={() => setIsPlaying(false)}
                  onMouseLeave={() => setIsPlaying(true)}
                >
                  {/* Connector Arrow - Mobile/Tablet */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
                      <motion.div
                        animate={{ 
                          y: [0, 6, 0],
                          opacity: isCompleted || isActive ? [1, 0.5, 1] : 0.3,
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ArrowRight className={`w-6 h-6 rotate-90 md:rotate-0 transition-colors ${
                          isCompleted || isActive ? 'text-primary' : 'text-muted-foreground/30'
                        }`} />
                      </motion.div>
                    </div>
                  )}

                  {/* Step Indicator Dot - Desktop */}
                  <motion.div 
                    className={`hidden lg:flex absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full items-center justify-center z-20 border-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary border-primary scale-110' 
                        : isCompleted 
                          ? 'bg-primary/80 border-primary/80' 
                          : 'bg-card border-muted-foreground/30'
                    }`}
                    animate={isActive ? { 
                      scale: [1.1, 1.2, 1.1],
                      boxShadow: ['0 0 0 0 rgba(var(--primary), 0)', '0 0 0 8px rgba(var(--primary), 0.2)', '0 0 0 0 rgba(var(--primary), 0)']
                    } : {}}
                    transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                        {index + 1}
                      </span>
                    )}
                  </motion.div>

                  {/* Card */}
                  <motion.div 
                    className={`relative h-full p-6 rounded-2xl border-2 transition-all duration-500 overflow-hidden ${
                      isActive 
                        ? `bg-card ${step.borderColor} shadow-xl ${step.glowColor}` 
                        : 'bg-card/50 border-border hover:border-primary/30'
                    }`}
                    animate={isActive ? {
                      y: -8,
                    } : {
                      y: 0,
                    }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    {/* Active Indicator Pulse */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-5`}
                        />
                      )}
                    </AnimatePresence>

                    {/* Animated Background Particles */}
                    {isActive && (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className={`absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color}`}
                            initial={{ 
                              x: Math.random() * 100, 
                              y: Math.random() * 100 + 50,
                              opacity: 0 
                            }}
                            animate={{ 
                              y: -20,
                              opacity: [0, 1, 0],
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.3,
                            }}
                          />
                        ))}
                      </>
                    )}
                    
                    {/* Step Number */}
                    <motion.div 
                      className={`absolute top-4 right-4 text-4xl font-black transition-colors duration-300 ${
                        isActive ? 'text-primary/30' : 'text-muted/20'
                      }`}
                      animate={isActive ? { scale: [1, 1.1, 1], rotate: [0, 5, 0] } : {}}
                      transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                    >
                      {step.number}
                    </motion.div>

                    {/* Icon */}
                    <motion.div 
                      className={`relative w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 z-10 ${
                        isActive 
                          ? `bg-gradient-to-br ${step.color} shadow-lg`
                          : step.bgColor
                      }`}
                      animate={isActive ? {
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1],
                      } : {}}
                      transition={{ duration: 3, repeat: isActive ? Infinity : 0 }}
                    >
                      <step.icon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-primary'}`} />
                      
                      {/* Icon Glow */}
                      {isActive && (
                        <motion.div
                          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${step.color} blur-xl opacity-50`}
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.3, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>

                    {/* Content */}
                    <motion.h3 
                      className={`text-lg font-bold mb-3 transition-colors duration-300 relative z-10 ${
                        isActive ? 'text-foreground' : 'text-foreground/80'
                      }`}
                    >
                      {step.title}
                    </motion.h3>
                    <p className={`text-sm leading-relaxed relative z-10 transition-colors duration-300 ${
                      isActive ? 'text-muted-foreground' : 'text-muted-foreground/70'
                    }`}>
                      {step.description}
                    </p>

                    {/* Active Step CTA */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="mt-4 flex items-center gap-2 text-sm text-primary font-semibold"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Etapa atual</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Connector Arrow - Desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-5 -translate-y-1/2 z-10">
                      <motion.div
                        animate={{ 
                          x: [0, 6, 0],
                          opacity: isCompleted || isActive ? 1 : 0.3,
                        }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.1 }}
                      >
                        <ArrowRight className={`w-6 h-6 transition-colors ${
                          isCompleted || isActive ? 'text-primary' : 'text-muted-foreground/30'
                        }`} />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Step Navigation Dots - Mobile */}
          <div className="flex justify-center gap-2 mt-8 lg:hidden">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeStep 
                    ? 'bg-primary scale-125' 
                    : index < activeStep 
                      ? 'bg-primary/50' 
                      : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          {/* Play/Pause Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-6"
          >
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <motion.div
                animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
              >
                {isPlaying ? (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="flex gap-0.5">
                      <div className="w-1 h-3 bg-primary rounded-full" />
                      <div className="w-1 h-3 bg-primary rounded-full" />
                    </div>
                  </div>
                ) : (
                  <Play className="w-4 h-4 text-primary" />
                )}
              </motion.div>
              <span>{isPlaying ? 'Reproduzindo' : 'Pausado'}</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GenesisCommercialFeatures;