import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, TrendingUp, Users, FileText, DollarSign, Layers, Home, Gift, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

        {/* MacBook Mockup with Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto w-full"
        >
          {/* Glow behind MacBook */}
          <div className="absolute -inset-10 bg-gradient-to-r from-primary/20 via-cyan-500/10 to-primary/20 rounded-[50px] blur-3xl opacity-60" />
          
          {/* MacBook Frame */}
          <div className="relative">
            {/* Screen */}
            <div className="relative bg-[#1a1a2e] rounded-t-xl border border-[#333] overflow-hidden shadow-2xl">
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

              {/* Dashboard Content */}
              <div className="p-6 min-h-[400px]">
                {/* Welcome Header */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-foreground mb-1">Bom dia, Usuário! 👋</h2>
                  <p className="text-sm text-muted-foreground">Crie, evolua e gerencie suas ideias em um só lugar.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { icon: Layers, label: 'Projetos', value: '12', color: 'from-blue-500/20 to-blue-600/10' },
                    { icon: FileText, label: 'Propostas', value: '48', color: 'from-purple-500/20 to-purple-600/10' },
                    { icon: Users, label: 'Leads', value: '156', color: 'from-emerald-500/20 to-emerald-600/10' },
                    { icon: DollarSign, label: 'Receita', value: 'R$8.5k', color: 'from-amber-500/20 to-amber-600/10' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 border border-border/30`}
                    >
                      <stat.icon className="w-5 h-5 text-primary mb-2" />
                      <div className="text-lg font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { icon: FileText, title: 'Gerar Proposta', desc: 'IA personalizada' },
                    { icon: Layers, title: 'Novo Projeto', desc: 'Sites em minutos' },
                    { icon: TrendingUp, title: 'Radar Global', desc: '156 leads disponíveis' },
                  ].map((action, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="bg-card/50 rounded-xl p-4 border border-border/30 hover:border-primary/30 transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <action.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-sm font-semibold text-foreground">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.desc}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom Dock */}
                <div className="flex items-center justify-center gap-2">
                  {[
                    { icon: Home, active: true },
                    { icon: Layers },
                    { icon: FileText },
                    { icon: Gift },
                    { icon: Users },
                    { icon: BarChart3 },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + i * 0.05 }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        item.active 
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* MacBook Bottom/Notch */}
            <div className="relative h-4 bg-gradient-to-b from-[#2a2a3a] to-[#1a1a25] rounded-b-xl border-x border-b border-[#333]">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-[#444]" />
              <div className="absolute left-1/2 -translate-x-1/2 top-1 w-16 h-1 bg-[#333] rounded-full" />
            </div>

            {/* MacBook Base */}
            <div className="relative h-3 bg-gradient-to-b from-[#c0c0c5] to-[#a0a0a5] rounded-b-lg mx-12 border border-[#888]/30">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-[#d5d5d8]" />
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
