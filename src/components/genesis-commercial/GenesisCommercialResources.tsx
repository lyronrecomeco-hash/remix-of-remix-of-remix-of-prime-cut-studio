import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Radar, FileText, GraduationCap, Sparkles, Zap, ChevronRight } from 'lucide-react';
import { useSiteTexts } from '@/pages/GenesisCommercial';

const icons = [Radar, FileText, GraduationCap];

const GenesisCommercialResources = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const texts = useSiteTexts();

  const resources = [
    { id: 'radar', icon: icons[0], title: texts.resources.card1Title, description: texts.resources.card1Description },
    { id: 'proposals', icon: icons[1], title: texts.resources.card2Title, description: texts.resources.card2Description },
    { id: 'academy', icon: icons[2], title: texts.resources.card3Title, description: texts.resources.card3Description },
  ];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => setActiveIndex(prev => (prev + 1) % resources.length), 2500);
    return () => clearInterval(interval);
  }, [isPaused, resources.length]);

  return (
    <section id="recursos" ref={ref} className="py-20 md:py-28 relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.05),transparent_60%)]" />
      </div>

      <div className="container px-4 relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-5 text-sm font-semibold rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Zap className="w-4 h-4" />
            {texts.resources.badge}
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-foreground">
            {texts.resources.title}{' '}
            <span className="text-primary">{texts.resources.highlight}</span>
          </h2>
        </motion.div>

        <div 
          className="grid md:grid-cols-3 gap-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            const isActive = activeIndex === index;
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                onClick={() => setActiveIndex(index)}
                className="cursor-pointer"
              >
                <motion.div
                  animate={{ scale: isActive ? 1.02 : 1 }}
                  transition={{ duration: 0.2 }}
                  className={`relative h-full rounded-2xl border p-6 transition-all duration-300 ${
                    isActive ? 'bg-primary/10 border-primary/30' : 'bg-card/40 border-border/40 hover:border-primary/20'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${isActive ? 'bg-primary/20' : 'bg-primary/10'}`}>
                    <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-primary/60'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{resource.description}</p>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1 mt-4 text-primary text-sm font-medium">
                        <span>Saiba mais</span>
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 2.5, ease: "linear" }} className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/60 origin-left rounded-b-2xl" />
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }} className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/5 border border-primary/15">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold text-primary">{texts.resources.bottomBadge}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisCommercialResources;
