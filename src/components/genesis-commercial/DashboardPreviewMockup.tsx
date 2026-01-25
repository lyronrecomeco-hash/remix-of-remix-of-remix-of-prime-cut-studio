import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Radar, 
  Target,
  Smartphone, 
  FileText, 
  GraduationCap, 
  Zap,
  Home,
  LayoutGrid,
  FileCheck,
  Gift,
  QrCode,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';

const DashboardPreviewMockup = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Main dashboard cards - exact clone
  const mainCards = [
    { 
      icon: Search, 
      title: 'Encontrar Clientes', 
      description: 'Descubra clientes com maior potencial',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary'
    },
    { 
      icon: Radar, 
      title: 'Radar Global', 
      description: 'Oportunidades automáticas pela IA',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    { 
      icon: Target, 
      title: 'Propostas Aceitas', 
      description: 'Gerencie as propostas aceitas do Radar Global e...',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400'
    },
  ];

  // Carousel items - exact clone from GenesisCarousel
  const carouselItems = [
    { 
      id: 'apps',
      icon: Smartphone, 
      title: 'Apps Virais', 
      description: 'Exemplos de aplicativos de sucesso',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary'
    },
    { 
      id: 'proposals',
      icon: FileText, 
      title: 'Propostas Personalizadas', 
      description: 'Crie propostas únicas com IA',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400'
    },
    { 
      id: 'academy',
      icon: GraduationCap, 
      title: 'Academia Genesis', 
      description: 'Aprimore suas habilidades',
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-400'
    },
    { 
      id: 'sprint',
      icon: Zap, 
      title: 'Missão Sprint', 
      description: 'Metas reais, execução guiada',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400'
    },
  ];

  // Duplicate items for infinite scroll effect
  const duplicatedItems = [...carouselItems, ...carouselItems, ...carouselItems];

  // Auto-scroll carousel
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const speed = 0.5;

    const animate = () => {
      if (!isPaused && scrollContainer) {
        scrollPosition += speed;
        
        // Reset when reaching the end of first set
        const itemWidth = 140;
        const resetPoint = itemWidth * carouselItems.length;
        
        if (scrollPosition >= resetPoint) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPaused, carouselItems.length]);

  const bottomNavItems = [
    { icon: Home, active: true },
    { icon: LayoutGrid },
    { icon: FileCheck },
    { icon: Gift },
    { icon: QrCode },
    { icon: Settings },
    { icon: LogOut },
  ];

  return (
    <div className="w-full bg-[hsl(220_25%_10%)] p-4 md:p-8 flex flex-col min-h-[420px] md:min-h-[520px] relative overflow-hidden">
      {/* Animated Stars Background - same as real dashboard */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Welcome Header - exact clone */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6 md:mb-10 pt-4 md:pt-8 relative z-10"
      >
        <h2 className="text-xl md:text-4xl font-bold text-white mb-2">
          Bom dia, ADM! <span className="inline-block">👋</span>
        </h2>
        <p className="text-xs md:text-base text-white/50">
          Crie, evolua e gerencie suas ideias em um só lugar.
        </p>
      </motion.div>

      {/* Main Feature Cards - exact clone with glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8 max-w-5xl mx-auto w-full relative z-10"
      >
        {mainCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group cursor-pointer"
          >
            <div 
              className="relative overflow-hidden bg-white/5 border border-white/10 p-3 md:p-5 transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.08] h-[90px] md:h-[120px] flex flex-col"
              style={{ borderRadius: '14px' }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                    <card.icon className={`w-4 h-4 md:w-5 md:h-5 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-[10px] md:text-sm font-semibold text-white truncate">{card.title}</h3>
                </div>
                <p className="text-[8px] md:text-xs text-white/40 line-clamp-2 mt-auto">{card.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* "Acesse também" Carousel Section - exact clone */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-5xl mx-auto w-full relative z-10"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary" />
          </div>
          <h3 className="text-xs md:text-base font-bold text-white tracking-tight">Acesse também</h3>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative overflow-hidden"
          style={{ borderRadius: '14px' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Gradient masks - same as real */}
          <div className="absolute left-0 top-0 bottom-0 w-6 md:w-16 bg-gradient-to-r from-[hsl(220_25%_10%)] via-[hsl(220_25%_10%/0.8)] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 md:w-16 bg-gradient-to-l from-[hsl(220_25%_10%)] via-[hsl(220_25%_10%/0.8)] to-transparent z-10 pointer-events-none" />

          {/* Scrolling container */}
          <div
            ref={scrollRef}
            className="flex gap-2 md:gap-4 overflow-x-hidden py-1 scrollbar-hide"
          >
            {duplicatedItems.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                whileHover={{ scale: 1.02, y: -3 }}
                className="flex-shrink-0 w-[120px] md:w-[180px]"
              >
                <div 
                  className="bg-[hsl(210_60%_12%/0.7)] border border-white/10 p-2.5 md:p-4 transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.08] h-[80px] md:h-[110px] flex flex-col cursor-pointer"
                  style={{ borderRadius: '14px' }}
                >
                  <div className={`w-7 h-7 md:w-9 md:h-9 rounded-xl flex items-center justify-center mb-1.5 md:mb-2 ${item.iconBg}`}>
                    <item.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${item.iconColor}`} />
                  </div>
                  <h4 className="text-[9px] md:text-xs font-medium text-white truncate">{item.title}</h4>
                  <p className="text-[7px] md:text-[10px] text-white/40 truncate mt-0.5">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Spacer */}
      <div className="flex-1 min-h-4" />

      {/* Bottom Navigation - exact clone */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center relative z-10 mt-4"
      >
        <div className="inline-flex items-center gap-0.5 md:gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-2 md:px-4 py-1.5 md:py-2.5">
          {bottomNavItems.map((item, index) => (
            <button
              key={index}
              className={`w-7 h-7 md:w-9 md:h-9 rounded-xl flex items-center justify-center transition-colors ${
                item.active 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPreviewMockup;
