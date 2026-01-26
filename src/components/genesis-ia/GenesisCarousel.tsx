import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Smartphone,
  FileText,
  Sparkles,
  Rocket,
  Code2,
  Lock
} from 'lucide-react';

interface CarouselItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  tabId?: string;
  blocked?: boolean;
}

interface GenesisCarouselProps {
  onNavigate?: (tabId: string) => void;
}

const carouselItems: CarouselItem[] = [
  {
    id: '1',
    icon: Code2,
    title: 'Construir Página',
    description: 'Em desenvolvimento',
    tabId: 'page-builder',
    blocked: true
  },
  {
    id: '2',
    icon: Smartphone,
    title: 'Apps Virais',
    description: 'Exemplos de aplicativos de sucesso'
  },
  {
    id: '3',
    icon: FileText,
    title: 'Propostas Personalizadas',
    description: 'Crie propostas únicas com IA',
    tabId: 'proposals'
  },
  {
    id: '4',
    icon: GraduationCap,
    title: 'Academia Genesis',
    description: 'Aprimore suas habilidades',
    tabId: 'academia'
  },
  {
    id: '5',
    icon: Rocket,
    title: 'Missão Sprint',
    description: 'Metas reais, execução guiada por IA',
    tabId: 'sprint-mission'
  }
];

export const GenesisCarousel = ({ onNavigate }: GenesisCarouselProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Duplicate items for infinite effect
  const duplicatedItems = [...carouselItems, ...carouselItems, ...carouselItems];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    let animationFrameId: number;
    let scrollPosition = scrollContainer.scrollLeft || 0;
    const scrollSpeed = 0.6;

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      // Calculate item width based on screen size
      const isMobile = window.innerWidth < 640;
      const itemWidth = isMobile ? (160 + 10) : (260 + 20);
      const resetPoint = itemWidth * carouselItems.length;
      
      if (scrollPosition >= resetPoint) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused]);

  return (
    <div className="w-full max-w-6xl mx-auto mt-5 sm:mt-10">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">Acesse também</h2>
      </div>

      {/* Carousel Container */}
      <div 
        className="relative overflow-hidden -mx-2 sm:mx-0"
        style={{ borderRadius: '14px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-[hsl(220_25%_10%)] via-[hsl(220_25%_10%/0.8)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-[hsl(220_25%_10%)] via-[hsl(220_25%_10%/0.8)] to-transparent z-10 pointer-events-none" />

        {/* Scrolling container - auto-scroll on all devices */}
        <div
          ref={scrollRef}
          className="flex gap-2.5 sm:gap-5 overflow-x-hidden py-2 px-2 scrollbar-hide"
          style={{ scrollBehavior: 'auto' }}
        >
          {duplicatedItems.map((item, index) => {
            const IconComponent = item.icon;
            const isBlocked = item.blocked;
            
            return (
              <motion.div
                key={`${item.id}-${index}`}
                whileHover={!isBlocked ? { scale: 1.02, y: -4 } : {}}
                whileTap={!isBlocked ? { scale: 0.98 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`flex-shrink-0 snap-start ${isBlocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => item.tabId && onNavigate?.(item.tabId)}
              >
                <div 
                  className={`w-[160px] sm:w-[260px] h-[100px] sm:h-[140px] transition-all duration-300 p-3 sm:p-5 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden ${
                    isBlocked 
                      ? 'bg-white/[0.02] border border-white/5 opacity-50 grayscale' 
                      : 'bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-white/[0.08] group'
                  }`}
                  style={{ borderRadius: '14px' }}
                >
                  {/* Blocked overlay */}
                  {isBlocked && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-transform ${
                    isBlocked 
                      ? 'bg-white/5' 
                      : 'bg-primary/20 group-hover:scale-105'
                  }`}>
                    <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${isBlocked ? 'text-white/20' : 'text-primary'}`} />
                  </div>

                  {/* Text */}
                  <div className="space-y-0">
                    <h3 className={`font-semibold text-xs sm:text-base leading-tight line-clamp-1 ${
                      isBlocked ? 'text-white/30' : 'text-white group-hover:text-white/90'
                    } transition-colors`}>
                      {item.title}
                    </h3>
                    <p className={`text-[10px] sm:text-sm line-clamp-1 ${
                      isBlocked ? 'text-white/20' : 'text-white/50 group-hover:text-white/60'
                    } transition-colors`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
