import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import genesisLoginPreview from '@/assets/genesis-dashboard-real.png';

const GenesisCommercialHero = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = 'Crie, Gerencie e Escale';
  
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

        {/* MacBook Mockup with Real Screenshot - Screen Only */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto w-full"
        >
          {/* Glow behind screen */}
          <div className="absolute -inset-10 bg-gradient-to-r from-primary/20 via-cyan-500/10 to-primary/20 rounded-[50px] blur-3xl opacity-60" />
          
          {/* Screen Only - No base */}
          <div className="relative">
            {/* Screen Frame */}
            <div className="relative bg-[#1a1a2e] rounded-xl border-[3px] border-[#333] overflow-hidden shadow-2xl">
              {/* Menu Bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0d0d14] border-b border-[#222]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-[#1a1a2e] rounded-md text-xs text-muted-foreground">
                    genesis-ia.app
                  </div>
                </div>
              </div>

              {/* Real Dashboard Screenshot */}
              <div className="relative">
                <img 
                  src={genesisLoginPreview} 
                  alt="Genesis IA Dashboard" 
                  className="w-full h-auto object-cover"
                />
                {/* Subtle overlay for better integration */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/20 to-transparent pointer-events-none" />
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