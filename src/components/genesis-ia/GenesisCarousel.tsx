import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Smartphone,
  FileText,
  PenTool,
  Sparkles,
  Rocket
} from 'lucide-react';

interface CarouselItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const carouselItems: CarouselItem[] = [
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

export const GenesisCarousel = () => {
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
    <div className="w-full max-w-6xl mx-auto mt-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-emerald-400" />
        <h2 className="text-xl font-bold text-white tracking-tight">Acesse também</h2>
      </div>

      {/* Carousel Container */}
      <div 
        className="relative overflow-hidden rounded-2xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

        {/* Scrolling container */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-hidden py-3 px-2"
          style={{ scrollBehavior: 'auto' }}
        >
          {duplicatedItems.map((item, index) => {
            const IconComponent = item.icon;
            
            return (
              <motion.div
                key={`${item.id}-${index}`}
                whileHover={{ scale: 1.03, y: -6 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex-shrink-0 cursor-pointer"
              >
                <div className="w-[260px] h-[140px] rounded-2xl bg-zinc-900/80 border border-zinc-800/60 hover:border-emerald-500/40 transition-all duration-300 p-5 flex flex-col justify-between group backdrop-blur-sm">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center group-hover:bg-emerald-500/25 transition-all duration-300 group-hover:scale-105">
                    <IconComponent className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                  </div>

                  {/* Text */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-base leading-tight group-hover:text-emerald-50 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors line-clamp-1">
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
