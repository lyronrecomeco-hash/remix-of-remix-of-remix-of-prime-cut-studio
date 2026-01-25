import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, Search, Globe, CheckCircle, DollarSign, GraduationCap, Home, Layers, FileText, Grid3X3, CreditCard, Settings, LogOut, Smartphone, PenTool, Rocket, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GenesisCommercialHero = () => {
  const [typedText, setTypedText] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fullText = 'Crie, Gerencie e Escale';
  
  const quickActions = [
    { icon: Search, title: 'Encontrar Clientes', desc: 'Descubra clientes com maior potencial' },
    { icon: Globe, title: 'Radar Global', desc: 'Oportunidades automáticas pela IA' },
    { icon: CheckCircle, title: 'Propostas Aceitas', desc: 'Gerencie as propostas aceitas do Radar Global e...' },
  ];

  // Carousel items matching the ORIGINAL GenesisCarousel - ALL cards restored
  const accessAlso = [
    { icon: PenTool, title: 'Construir Página', desc: 'Crie páginas modernas com IA' },
    { icon: Smartphone, title: 'Apps Virais', desc: 'Exemplos de aplicativos de sucesso' },
    { icon: FileText, title: 'Propostas Personalizadas', desc: 'Crie propostas únicas com IA' },
    { icon: GraduationCap, title: 'Academia Genesis', desc: 'Aprimore suas habilidades' },
    { icon: Rocket, title: 'Redator Automatizado', desc: 'Automatize sua produção de conteúdo' },
  ];

  // Duplicate items for infinite scroll
  const duplicatedItems = [...accessAlso, ...accessAlso, ...accessAlso];

  // Dock icons for regular user (NOT admin)
  const dockIcons = [Home, Layers, FileText, Grid3X3, CreditCard, Settings, LogOut];
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Infinite auto-scroll carousel
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    let animationFrameId: number;
    let scrollPosition = scrollContainer.scrollLeft || 0;
    const scrollSpeed = 0.8;

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      const itemWidth = 130 + 12;
      const resetPoint = itemWidth * accessAlso.length;
      
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
  }, [isPaused, accessAlso.length]);

  return (
    <section id="inicio" className="relative min-h-screen flex flex-col overflow-hidden bg-transparent">

      {/* Main Content */}
      <div className="container relative z-10 px-4 pt-24 md:pt-32 pb-12 md:pb-16 max-w-7xl mx-auto flex-1 flex flex-col">
        {/* Hero Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-8 md:mb-12"
        >
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 mb-4 md:mb-6 text-xs md:text-sm font-medium rounded-full bg-card/80 backdrop-blur-sm border border-border/50"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-muted-foreground">Assine e comece a fechar negócios hoje</span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-5 leading-[1.1] tracking-tight">
            <span className="text-foreground">Seu Hub de Automação</span>
            <br />
            <span className="text-primary">
              {typedText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-primary/50"
              >
                |
              </motion.span>
            </span>
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4"
          >
            Radar de prospecção com IA, automação de WhatsApp, gerador de páginas e contratos — tudo em um só lugar.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-6 px-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Button 
                asChild 
                size="lg" 
                className="w-full sm:w-auto text-sm md:text-base px-6 md:px-8 py-5 md:py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 group font-semibold"
              >
                <Link to="/genesis" className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                  Assinar Agora
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto text-sm md:text-base px-6 md:px-8 py-5 md:py-6 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card text-foreground"
              onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Planos
            </Button>
          </motion.div>

          {/* Trust Points */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-x-4 md:gap-x-6 gap-y-2 text-xs md:text-sm text-muted-foreground px-4"
          >
            {[
              { icon: CheckCircle2, text: 'Setup em 5 minutos' },
              { icon: CheckCircle2, text: 'Suporte 24h' },
              { icon: CheckCircle2, text: 'Cancele quando quiser' },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-1.5 md:gap-2">
                <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                {item.text}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* MacBook Mockup with Simulated Dashboard - RESPONSIVE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-6xl mx-auto w-full px-2 md:px-0"
        >
          {/* Glow behind screen */}
          <div className="absolute -inset-8 md:-inset-16 bg-gradient-to-r from-primary/20 via-cyan-500/10 to-primary/20 rounded-[30px] md:rounded-[50px] blur-3xl opacity-60" />
          
          {/* Screen Only - RESPONSIVE */}
          <div className="relative">
            {/* Screen Frame */}
            <div className="relative bg-[#0a0a12] rounded-xl md:rounded-2xl border-[4px] md:border-[6px] border-[#2a2a3a] overflow-hidden shadow-2xl">
              {/* Menu Bar */}
              <div className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 bg-[#0d0d14] border-b border-[#1a1a2a]">
                <div className="flex gap-1.5 md:gap-2">
                  <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-3 md:px-6 py-1 md:py-1.5 bg-[#1a1a2e] rounded-md md:rounded-lg text-[10px] md:text-sm text-gray-400">
                    genesis-ia.app/dashboard
                  </div>
                </div>
              </div>

              {/* Simulated Dashboard Content - RESPONSIVE */}
              <div className="relative bg-[hsl(220_25%_10%)] p-4 md:p-8 min-h-[320px] md:min-h-[520px]">
                {/* Background effects */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
                  
                  <motion.div 
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-10 right-20 w-40 h-40 bg-primary/10 rounded-full blur-[60px]" 
                  />
                  <motion.div 
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-20 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px]" 
                  />
                  
                  {/* Stars */}
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-0.5 h-0.5 bg-white/40 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                    />
                  ))}
                </div>

                {/* Welcome Toast - Top Right */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute top-3 md:top-4 right-3 md:right-4 z-20 hidden sm:flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg"
                >
                  <span className="text-lg">👋</span>
                  <div>
                    <p className="text-white text-xs font-semibold">Bem vindo de volta, ADM</p>
                    <p className="text-white/50 text-[10px]">A forma mais simples de transformar sua ideia em SaaS em minutos com IA.</p>
                  </div>
                </motion.div>

                {/* Welcome Header - RESPONSIVE */}
                <div className="text-center mb-4 md:mb-8 relative z-10 pt-6 sm:pt-0">
                  <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-white flex items-center justify-center gap-2 md:gap-3">
                    Bom dia, ADM! <span className="text-lg md:text-2xl">👋</span>
                  </h2>
                  <p className="text-white/50 text-xs md:text-sm mt-1 md:mt-2">Crie, evolua e gerencie suas ideias em um só lugar.</p>
                </div>

                {/* Quick Action Cards - RESPONSIVE */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6 relative z-10">
                  {quickActions.map((action, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 cursor-pointer p-3 md:p-4"
                      style={{ borderRadius: '12px' }}
                    >
                      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                          <action.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        </div>
                        <h3 className="text-white font-semibold text-xs md:text-sm">{action.title}</h3>
                      </div>
                      <p className="text-white/50 text-[10px] md:text-xs leading-relaxed line-clamp-2">{action.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Acesse também - RESPONSIVE */}
                <div className="relative z-10">
                  <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-5">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <span className="text-white font-bold text-sm md:text-base">Acesse também</span>
                  </div>
                  
                  {/* Carousel */}
                  <div 
                    className="relative overflow-hidden"
                    style={{ borderRadius: '14px' }}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    {/* Gradient masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-[hsl(220_25%_10%)] via-[hsl(220_25%_10%/0.8)] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-[hsl(220_25%_10%)] via-[hsl(220_25%_10%/0.8)] to-transparent z-10 pointer-events-none" />
                    
                    <div 
                      ref={scrollRef}
                      className="flex gap-3 md:gap-4 py-2 overflow-x-hidden scrollbar-hide"
                      style={{ scrollBehavior: 'auto' }}
                    >
                      {duplicatedItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={`${item.title}-${index}`}
                            whileHover={{ scale: 1.02, y: -3 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className="flex-shrink-0 cursor-pointer"
                          >
                            <div
                              className="w-[120px] h-[100px] md:w-[160px] md:h-[130px] bg-[hsl(200_50%_15%/0.6)] border border-primary/20 hover:border-primary/40 hover:bg-[hsl(200_50%_18%/0.7)] transition-all duration-300 p-3 md:p-4 flex flex-col justify-between group backdrop-blur-sm"
                              style={{ borderRadius: '12px' }}
                            >
                              {/* Icon */}
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                              </div>

                              {/* Text */}
                              <div>
                                <h3 className="font-bold text-white text-xs md:text-sm leading-tight mb-0.5 md:mb-1">
                                  {item.title}
                                </h3>
                                <p className="text-[9px] md:text-xs text-white/50 leading-tight line-clamp-2">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Dock at bottom - RESPONSIVE */}
                <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-20">
                  <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-white/5 backdrop-blur-md border border-white/10" style={{ borderRadius: '16px' }}>
                    {dockIcons.map((Icon, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.2, y: -3 }}
                        className={`w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg flex items-center justify-center cursor-pointer transition-colors ${i === 0 ? 'bg-primary/20 text-primary' : 'text-white/40 hover:text-white/60'}`}
                      >
                        <Icon className="w-3 h-3 md:w-4 md:h-4" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisCommercialHero;
