import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Smartphone,
  FileText,
  PenTool,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
    description: 'Aprimore suas habilidades com IA'
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
    icon: Sparkles,
    title: 'Automações IA',
    description: 'Automatize processos com inteligência'
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
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      // Reset scroll when reaching the middle set
      const itemWidth = 280 + 16; // card width + gap
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
    <div className="w-full max-w-6xl mx-auto mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-semibold text-foreground">Acesse também</h2>
      </div>

      <div 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Gradient masks for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-hidden scroll-smooth py-2"
          style={{ scrollBehavior: 'auto' }}
        >
          {duplicatedItems.map((item, index) => {
            const IconComponent = item.icon;
            
            return (
              <motion.div
                key={`${item.id}-${index}`}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex-shrink-0"
              >
                <Card 
                  className="w-[280px] h-[120px] bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 border-zinc-700/50 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group"
                >
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/30 transition-colors">
                        <IconComponent className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
