import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  MessageSquare, Palette, MousePointer, Rocket,
  Sparkles, Check, Play, Pause
} from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    number: '01',
    title: 'Responda as Perguntas',
    description: 'Explique seu projeto, público e objetivos. Nossa IA compreenderá o planejamento e estrutura ideal.',
    color: 'primary',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
  },
  {
    icon: Palette,
    number: '02',
    title: 'Visualize e Personalize',
    description: 'Personalize cores, fontes e design de forma simples para refletir a identidade do seu negócio.',
    color: 'pink',
    iconBg: 'bg-gradient-to-br from-pink-500 to-rose-500',
    iconColor: 'text-white',
  },
  {
    icon: MousePointer,
    number: '03',
    title: 'Gere com 1 clique',
    description: 'Em segundos, sua solução completa está pronta: website, sistemas e páginas de vendas inclusas.',
    color: 'blue',
    iconBg: 'bg-slate-700/80',
    iconColor: 'text-primary',
  },
  {
    icon: Rocket,
    number: '04',
    title: 'Publique e Lucre',
    description: 'Publique online, conecte seu método de pagamento e comece a lucrar com seu novo produto digital.',
    color: 'cyan',
    iconBg: 'bg-slate-700/80',
    iconColor: 'text-primary',
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
    <section id="recursos" ref={ref} className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.03),transparent_70%)]" />
      </div>

      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container px-4 relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Sparkles className="w-4 h-4" />
            Como Funciona
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-5 text-foreground">
            Com a <span className="text-primary">Genesis</span>, desenvolver um SaaS é{' '}
            <br className="hidden md:block" />
            <span className="text-primary">fácil, ágil e eficiente</span>
          </h2>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo o que você precisa para criar SaaS profissionais e escaláveis, em um único lugar.
          </p>
        </motion.div>

        {/* Steps Flow - Horizontal Layout with Connection Line */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Progress Line - Desktop Only */}
          <div className="hidden lg:block absolute top-[52px] left-[12%] right-[12%] h-0.5 bg-muted/30">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-cyan-500 to-primary"
              initial={{ width: "0%" }}
              animate={isInView ? { 
                width: `${((activeStep + 1) / steps.length) * 100}%` 
              } : {}}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isCompleted = index < activeStep;
              const Icon = step.icon;
              
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group cursor-pointer"
                  onClick={() => setActiveStep(index)}
                  onMouseEnter={() => setIsPlaying(false)}
                  onMouseLeave={() => setIsPlaying(true)}
                >
                  {/* Step Number Indicator - Top Center */}
                  <div className="flex justify-center mb-3 relative z-10">
                    <motion.div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isActive 
                          ? 'bg-primary text-white shadow-lg shadow-primary/40' 
                          : isCompleted 
                            ? 'bg-primary/80 text-white' 
                            : 'bg-muted/50 text-muted-foreground border border-border'
                      }`}
                      animate={isActive ? { 
                        scale: [1, 1.1, 1],
                      } : {}}
                      transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </motion.div>
                  </div>

                  {/* Card */}
                  <motion.div 
                    className={`relative p-5 rounded-xl transition-all duration-300 overflow-hidden h-[200px] ${
                      isActive 
                        ? 'bg-gradient-to-br from-pink-500/90 to-rose-500/90 shadow-xl shadow-pink-500/20 border-0' 
                        : 'bg-card/80 border border-border/50 hover:border-border'
                    }`}
                    animate={isActive ? { y: -4, scale: 1.02 } : { y: 0, scale: 1 }}
                    whileHover={!isActive ? { y: -2 } : {}}
                  >
                    {/* Step Number Background */}
                    <div className={`absolute top-3 right-3 text-5xl font-black transition-colors ${
                      isActive ? 'text-white/20' : 'text-muted/10'
                    }`}>
                      {step.number}
                    </div>

                    {/* Icon */}
                    <motion.div 
                      className={`relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                        isActive 
                          ? 'bg-white/20' 
                          : step.iconBg
                      }`}
                      animate={isActive ? {
                        scale: [1, 1.05, 1],
                      } : {}}
                      transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                    >
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : step.iconColor}`} />
                    </motion.div>

                    {/* Content */}
                    <h3 className={`text-base font-bold mb-2 relative z-10 ${
                      isActive ? 'text-white' : 'text-foreground'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm leading-relaxed relative z-10 line-clamp-3 ${
                      isActive ? 'text-white/90' : 'text-muted-foreground'
                    }`}>
                      {step.description}
                    </p>

                    {/* Connection Arrow - Desktop */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-20">
                        <motion.div
                          className={`w-4 h-4 border-r-2 border-t-2 rotate-45 transition-colors ${
                            isCompleted || isActive ? 'border-primary' : 'border-muted-foreground/20'
                          }`}
                          animate={{ 
                            x: isCompleted || isActive ? [0, 3, 0] : 0,
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Step Navigation Dots - Mobile/Tablet */}
          <div className="flex justify-center gap-2 mt-8 lg:hidden">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
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
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full bg-card/50 border border-border/50"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-primary" />
                  <span>Reproduzindo</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-primary" />
                  <span>Pausado</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GenesisCommercialFeatures;