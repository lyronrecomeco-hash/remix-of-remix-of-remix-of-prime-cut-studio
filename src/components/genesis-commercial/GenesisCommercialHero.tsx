import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, Search, Globe, CheckCircle, DollarSign, GraduationCap, Home, Layers, FileText, Users, Grid3X3, CreditCard, Settings, LogOut, Smartphone, PenTool, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GenesisCommercialHero = () => {
  const [typedText, setTypedText] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fullText = 'Crie, Gerencie e Escale';
  
  const quickActions = [
    { icon: Search, title: 'Encontrar Clientes', desc: 'Descubra clientes com maior potencial', color: 'bg-blue-500/20 text-blue-400' },
    { icon: Globe, title: 'Radar Global', desc: 'Oportunidades automáticas pela IA', color: 'bg-cyan-500/20 text-cyan-400' },
    { icon: CheckCircle, title: 'Propostas Aceitas', desc: 'Gerencie propostas aceitas', color: 'bg-emerald-500/20 text-emerald-400' },
  ];

  // Carousel items matching the real GenesisCarousel
  const accessAlso = [
    { icon: Layers, title: 'Criar Projetos', desc: 'Crie sites personalizados para se...' },
    { icon: DollarSign, title: 'Financeiro', desc: 'Acompanhe métricas e receitas' },
    { icon: GraduationCap, title: 'Academia Genesis', desc: 'Aprimore suas habilidades' },
    { icon: Smartphone, title: 'Apps Virais', desc: 'Exemplos de aplicativos de sucesso' },
    { icon: FileText, title: 'Propostas Personalizadas', desc: 'Crie propostas únicas com IA' },
    { icon: PenTool, title: 'Copy de Vendas', desc: 'Crie copy de vendas com IA' },
    { icon: Rocket, title: 'Redator Automatizado', desc: 'Automatize sua produção de...' },
  ];

  // Duplicate items for infinite scroll
  const duplicatedItems = [...accessAlso, ...accessAlso, ...accessAlso];

  const dockIcons = [Home, Layers, FileText, Grid3X3, Users, Grid3X3, CreditCard, Settings, LogOut];
  
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

  // Infinite auto-scroll carousel - matching real GenesisCarousel
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    let animationFrameId: number;
    let scrollPosition = scrollContainer.scrollLeft || 0;
    const scrollSpeed = 0.5;

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      const itemWidth = 130 + 12; // card width + gap
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
    <section id="inicio" className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Animated Background - Premium */}
      <div className="absolute inset-0">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(217,91%,60%,0.08),transparent_50%)]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--muted)/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.3)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_70%,transparent_100%)]" />
        
        {/* Floating orbs */}
        <motion.div 
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-blue-500/5 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-500/8 to-primary/5 rounded-full blur-[100px]" 
        />
      </div>

      {/* Main Content */}
      <div className="container relative z-10 px-4 pt-32 pb-16 max-w-7xl mx-auto flex-1 flex flex-col">
        {/* Hero Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-12"
        >
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-card/80 backdrop-blur-sm border border-border/50"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-muted-foreground">Assine e comece a fechar negócios hoje</span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
            <span className="text-foreground">Seu Hub de Negócios</span>
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
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Gerador de SaaS, páginas de vendas, contratos e prospecção de clientes — tudo em um só lugar.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                asChild 
                size="lg" 
                className="text-base px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 group font-semibold"
              >
                <Link to="/genesis" className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Assinar Agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base px-8 py-6 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card text-foreground"
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
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            {[
              { icon: CheckCircle2, text: 'Setup em 5 minutos' },
              { icon: CheckCircle2, text: 'Suporte 24h' },
              { icon: CheckCircle2, text: 'Cancele quando quiser' },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-primary" />
                {item.text}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* MacBook Mockup with Simulated Dashboard - Zoomed */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto w-full"
        >
          {/* Glow behind screen */}
          <div className="absolute -inset-10 bg-gradient-to-r from-primary/20 via-cyan-500/10 to-primary/20 rounded-[50px] blur-3xl opacity-60" />
          
          {/* Screen Only - No base, with zoom */}
          <div className="relative transform scale-105">
            {/* Screen Frame */}
            <div className="relative bg-[#0a0a12] rounded-2xl border-[4px] border-[#2a2a3a] overflow-hidden shadow-2xl">
              {/* Menu Bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0d0d14] border-b border-[#1a1a2a]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-[#1a1a2e] rounded-md text-xs text-gray-400">
                    genesis-ia.app/dashboard
                  </div>
                </div>
              </div>

              {/* Simulated Dashboard Content */}
              <div className="relative bg-gradient-to-b from-[#0a0a14] to-[#0d0d18] p-6 min-h-[420px]">
                {/* Stars background */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(30)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-0.5 h-0.5 bg-white/30 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                    />
                  ))}
                </div>

                {/* Welcome Header */}
                <div className="text-center mb-6 relative z-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-2">
                    Bom dia, ADM! <span className="text-2xl">👋</span>
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Crie, evolua e gerencie suas ideias em um só lugar.</p>
                </div>

                {/* Quick Action Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                  {quickActions.map((action, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      className="bg-[#12121c]/80 backdrop-blur-sm rounded-xl border border-[#1f1f2f] p-4 cursor-pointer hover:border-[#2a2a4a] transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-1">{action.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed">{action.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Acesse também - Real Infinite Carousel */}
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-white font-semibold text-sm">Acesse também</span>
                  </div>
                  
                  {/* Carousel matching real GenesisCarousel - Infinite scroll */}
                  <div 
                    className="relative overflow-hidden rounded-xl"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    {/* Gradient masks - matching original */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0a14] via-[#0a0a14]/80 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0a14] via-[#0a0a14]/80 to-transparent z-10 pointer-events-none" />
                    
                    <div 
                      ref={scrollRef}
                      className="flex gap-3 py-1 overflow-x-hidden scrollbar-hide"
                      style={{ scrollBehavior: 'auto' }}
                    >
                      {duplicatedItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={`${item.title}-${index}`}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="flex-shrink-0 cursor-pointer"
                          >
                            {/* Card matching real GenesisCarousel style */}
                            <div className="w-[130px] h-[80px] bg-[hsl(200_50%_15%/0.6)] rounded-[14px] border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-[hsl(200_50%_18%/0.7)] p-2.5 transition-all duration-300 flex flex-col justify-between">
                              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <Icon className="w-3 h-3 text-emerald-400" />
                              </div>
                              <div>
                                <h4 className="text-white font-medium text-[10px] mb-0 truncate">{item.title}</h4>
                                <p className="text-white/50 text-[8px] truncate">{item.desc}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Dock at bottom - matching real style */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="flex items-center gap-1 px-4 py-2.5 bg-[#12121c]/90 backdrop-blur-md rounded-2xl border border-[#2a2a3a]">
                    {dockIcons.map((Icon, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.15, y: -2 }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${i === 0 ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:bg-white/5'}`}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="relative z-10 py-10 border-t border-border/50 bg-card/20 backdrop-blur-sm"
      >
        <div className="container px-4 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '500+', label: 'Projetos Criados' },
              { value: '3.500+', label: 'Clientes Ativos' },
              { value: '98%', label: 'Satisfação' },
              { value: 'R$2M+', label: 'Gerado para Clientes' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-black text-primary mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default GenesisCommercialHero;
