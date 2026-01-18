import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Smartphone,
  FileText,
  PenTool,
  Sparkles,
  Rocket,
  DollarSign,
  Layers
} from 'lucide-react';

interface CarouselItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  tabId?: string;
}

interface GenesisCarouselProps {
  onNavigate?: (tabId: string) => void;
}

const carouselItems: CarouselItem[] = [
  {
    id: 'project-builder',
    icon: Layers,
    title: 'Project Prompt Builder',
    description: 'Crie prompts completos para gerar projetos com IA',
    tabId: 'project-builder'
  },
  {
    id: 'financial',
    icon: DollarSign,
    title: 'Financeiro',
    description: 'Acompanhe métricas e receitas',
    tabId: 'financial'
  },
  {
    id: '1',
    icon: GraduationCap,
    title: 'Academia Genesis',
    description: 'Aprimore suas habilidades'
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
    description: 'Crie propostas únicas com IA'
  },
  {
    id: '4',
    icon: PenTool,
    title: 'Copy de Vendas',
    description: 'Crie copy de vendas personalizada com IA'
  },
  {
    id: '5',
    icon: Rocket,
    title: 'Redator Automatizado',
    description: 'Automatize sua produção de conteúdo'
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
    const scrollSpeed = 0.8;

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      const itemWidth = 260 + 20;
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
    <div className="w-full max-w-6xl mx-auto mt-6 sm:mt-10 px-2 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Acesse também</h2>
      </div>

      {/* Carousel Container */}
      <div 
        className="relative overflow-hidden rounded-xl sm:rounded-2xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

        {/* Scrolling container */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-5 overflow-x-auto sm:overflow-x-hidden py-2 sm:py-3 px-1 sm:px-2 scrollbar-hide"
          style={{ scrollBehavior: 'auto', WebkitOverflowScrolling: 'touch' }}
        >
          {duplicatedItems.map((item, index) => {
            const IconComponent = item.icon;
            
            return (
              <motion.div
                key={`${item.id}-${index}`}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex-shrink-0 cursor-pointer"
                onClick={() => item.tabId && onNavigate?.(item.tabId)}
              >
                <div className="w-[200px] sm:w-[260px] h-[120px] sm:h-[140px] rounded-xl sm:rounded-2xl bg-card border border-primary/30 hover:border-primary/60 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between group backdrop-blur-sm shadow-lg shadow-primary/5 hover:shadow-primary/15">
                  {/* Icon */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/35 transition-all duration-300 group-hover:scale-105">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-primary/80 transition-colors" />
                  </div>

                  {/* Text */}
                  <div className="space-y-0.5 sm:space-y-1">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base leading-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors line-clamp-1">
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
