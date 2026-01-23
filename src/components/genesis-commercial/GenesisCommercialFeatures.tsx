import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  MessageSquare, Palette, MousePointer, Rocket,
  Sparkles
} from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    number: '01',
    title: 'Responda as Perguntas',
    description: 'Explique seu projeto, público e objetivos. Nossa IA compreenderá o planejamento e estrutura ideal.',
  },
  {
    icon: Palette,
    number: '02',
    title: 'Visualize e Personalize',
    description: 'Personalize cores, fontes e design de forma simples para refletir a identidade do seu negócio.',
  },
  {
    icon: MousePointer,
    number: '03',
    title: 'Gere com 1 Clique',
    description: 'Em segundos, sua solução completa está pronta: website, sistemas e páginas de vendas.',
  },
  {
    icon: Rocket,
    number: '04',
    title: 'Publique e Lucre',
    description: 'Publique online, conecte pagamentos e comece a lucrar com seu novo produto digital.',
  },
];

const GenesisCommercialFeatures = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
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
      className="py-24 md:py-32 relative overflow-hidden bg-[hsl(222_47%_7%)]"
    >
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      <div className="container px-4 relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 mb-8 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Sparkles className="w-4 h-4" />
            Como Funciona
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white tracking-tight">
            Com a <span className="text-primary">Genesis</span>, desenvolver
            <br className="hidden md:block" />
            um SaaS é <span className="text-primary">simples</span>
          </h2>
          
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Tudo o que você precisa para criar SaaS profissionais e escaláveis.
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="relative">
          {/* Timeline Connection - Only visible on desktop */}
          <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          
          {/* Progress Line */}
          <div className="hidden lg:block absolute top-8 left-[12%] h-px overflow-hidden" style={{ width: `${(activeStep / (steps.length - 1)) * 76}%` }}>
            <motion.div 
              className="h-full w-full bg-gradient-to-r from-primary to-cyan-400"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5 }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isCompleted = index < activeStep;
              const Icon = step.icon;
              
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                  onClick={() => {
                    setActiveStep(index);
                    setIsPlaying(false);
                  }}
                  onMouseEnter={() => setIsPlaying(false)}
                  onMouseLeave={() => setIsPlaying(true)}
                >
                  {/* Step Number - Floating Circle */}
                  <div className="flex justify-center mb-6">
                    <motion.div
                      className={`
                        w-16 h-16 rounded-full flex items-center justify-center
                        text-xl font-bold cursor-pointer transition-all duration-500
                        ${isActive || isCompleted
                          ? 'bg-gradient-to-br from-primary to-cyan-400 text-white shadow-lg shadow-primary/30'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-slate-500'
                        }
                      `}
                      animate={isActive ? { 
                        scale: [1, 1.08, 1],
                      } : {}}
                      transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {step.number}
                    </motion.div>
                  </div>

                  {/* Card */}
                  <motion.div
                    className={`
                      relative p-6 rounded-2xl cursor-pointer h-[200px]
                      transition-all duration-500 overflow-hidden
                      ${isActive 
                        ? 'bg-gradient-to-br from-primary via-primary to-cyan-500 shadow-2xl shadow-primary/20' 
                        : 'bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/80 hover:bg-slate-800/60'
                      }
                    `}
                    animate={isActive ? { y: -6 } : { y: 0 }}
                    whileHover={!isActive ? { y: -3 } : {}}
                  >
                    {/* Background Number Watermark */}
                    <span className={`
                      absolute -top-4 -right-2 text-[120px] font-black leading-none select-none pointer-events-none
                      ${isActive ? 'text-white/[0.08]' : 'text-slate-700/20'}
                    `}>
                      {step.number}
                    </span>

                    {/* Icon Container */}
                    <div className={`
                      relative w-12 h-12 rounded-xl flex items-center justify-center mb-4
                      ${isActive 
                        ? 'bg-white/20' 
                        : 'bg-slate-700/50'
                      }
                    `}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-primary'}`} />
                    </div>

                    {/* Content */}
                    <h3 className={`text-lg font-semibold mb-2 relative z-10 ${
                      isActive ? 'text-white' : 'text-white'
                    }`}>
                      {step.title}
                    </h3>
                    
                    <p className={`text-sm leading-relaxed relative z-10 ${
                      isActive ? 'text-white/85' : 'text-slate-400'
                    }`}>
                      {step.description}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Dots */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="flex justify-center items-center gap-2.5 mt-12"
          >
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveStep(index);
                  setIsPlaying(false);
                }}
                className="relative p-1"
              >
                <motion.div
                  className={`
                    w-2.5 h-2.5 rounded-full transition-all duration-300
                    ${index === activeStep 
                      ? 'bg-primary scale-125' 
                      : index < activeStep 
                        ? 'bg-primary/50' 
                        : 'bg-slate-600 hover:bg-slate-500'
                    }
                  `}
                />
              </button>
            ))}
            
            {/* Auto indicator */}
            {isPlaying && (
              <div className="ml-3 flex items-center gap-1.5 text-xs text-slate-500">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                Auto
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GenesisCommercialFeatures;
