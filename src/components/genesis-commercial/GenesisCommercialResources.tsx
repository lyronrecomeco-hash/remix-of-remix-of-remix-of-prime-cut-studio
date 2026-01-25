import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Radar, 
  FileText, 
  GraduationCap, 
  Sparkles,
  Globe,
  Zap,
  TrendingUp
} from 'lucide-react';

const resources = [
  {
    id: 'radar',
    icon: Radar,
    title: 'Radar Global',
    highlight: 'Prospecção em +15 países',
    description: 'Nossa IA varre o mercado internacional 24/7. Brasil, Portugal, EUA, Espanha e mais.',
    stats: [
      { label: 'Países', value: '15+' },
      { label: 'Leads/dia', value: '500+' },
      { label: 'Precisão', value: '97%' },
    ],
  },
  {
    id: 'proposals',
    icon: FileText,
    title: 'Propostas com IA',
    highlight: 'Conversão 3x maior',
    description: 'Propostas personalizadas que entendem seu cliente. Argumentos únicos, fechamento rápido.',
    stats: [
      { label: 'Tempo', value: '30s' },
      { label: 'Conversão', value: '+312%' },
      { label: 'Templates', value: '50+' },
    ],
  },
  {
    id: 'academy',
    icon: GraduationCap,
    title: 'Academia Genesis',
    highlight: 'Domine vendas',
    description: 'Simuladores de objeções, scripts prontos e técnicas avançadas de negociação.',
    stats: [
      { label: 'Módulos', value: '25+' },
      { label: 'Exercícios', value: '100+' },
      { label: 'Alunos', value: '2.8k' },
    ],
  },
];

const GenesisCommercialResources = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-cycle through resources
  useEffect(() => {
    if (isHovering) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % resources.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <section id="recursos" ref={ref} className="py-20 md:py-28 relative overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_70%)]" />
        
        {/* Floating orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl"
        />
      </div>

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
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-5 text-sm font-semibold rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Globe className="w-4 h-4" />
            Alcance Global
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-foreground">
            Ferramentas que{' '}
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              vendem sozinhas
            </span>
          </h2>
          
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Enquanto você descansa, a Genesis trabalha.
          </p>
        </motion.div>

        {/* Interactive Cards Grid */}
        <div 
          className="grid md:grid-cols-3 gap-5"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            const isActive = activeIndex === index;

            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                onClick={() => setActiveIndex(index)}
                className="relative cursor-pointer group"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.02 : 1,
                    y: isActive ? -4 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`
                    relative h-full rounded-2xl border p-6 backdrop-blur-sm
                    transition-all duration-500 overflow-hidden
                    ${isActive 
                      ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10' 
                      : 'bg-card/50 border-border/40 hover:border-primary/20'
                    }
                  `}
                >
                  {/* Active glow */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10 pointer-events-none"
                      />
                    )}
                  </AnimatePresence>

                  {/* Scanning line animation for active */}
                  {isActive && (
                    <motion.div
                      initial={{ top: 0, opacity: 0 }}
                      animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent pointer-events-none"
                    />
                  )}

                  <div className="relative z-10">
                    {/* Icon with pulse */}
                    <div className="relative mb-4">
                      <motion.div
                        animate={isActive ? {
                          boxShadow: ['0 0 0 0 hsl(var(--primary)/0.4)', '0 0 0 12px hsl(var(--primary)/0)', '0 0 0 0 hsl(var(--primary)/0)'],
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`
                          w-14 h-14 rounded-xl flex items-center justify-center
                          transition-all duration-300
                          ${isActive ? 'bg-primary/20' : 'bg-primary/10'}
                        `}
                      >
                        <Icon className={`w-7 h-7 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-primary/60'}`} />
                      </motion.div>
                    </div>

                    {/* Title & Highlight */}
                    <h3 className="text-xl font-bold text-foreground mb-1">{resource.title}</h3>
                    <p className={`text-sm font-medium mb-3 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-primary/60'}`}>
                      {resource.highlight}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                      {resource.description}
                    </p>

                    {/* Stats - Only show when active */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex justify-between pt-4 border-t border-primary/20"
                        >
                          {resource.stats.map((stat, i) => (
                            <motion.div
                              key={stat.label}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="text-center"
                            >
                              <div className="text-lg font-bold text-primary">{stat.value}</div>
                              <div className="text-xs text-muted-foreground">{stat.label}</div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Progress indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 3, ease: "linear" }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-cyan-400 to-primary origin-left"
                    />
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* "E muito mais..." Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-14 text-center"
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
            
            <div className="flex flex-col items-start">
              <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                E muito mais...
              </span>
              <span className="text-xs text-muted-foreground">Descubra ao entrar</span>
            </div>

            <motion.div
              animate={{ 
                y: [0, -4, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisCommercialResources;
