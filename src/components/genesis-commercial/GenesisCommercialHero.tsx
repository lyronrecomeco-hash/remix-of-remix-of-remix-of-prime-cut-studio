import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, Bot, MessageSquare, 
  BarChart3, Users, Zap, CheckCircle2, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const GenesisCommercialHero = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = 'Sua IA que Vende 24/7';
  
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
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Animated Background - Genesis Identity */}
      <div className="absolute inset-0">
        {/* Primary Blue Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(217_91%_60%/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(217_91%_60%/0.08),transparent_50%)]" />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(217_91%_60%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(217_91%_60%/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Floating Orbs - Blue Theme */}
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/15 to-primary/5 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            y: [0, 15, 0],
            scale: [1, 0.95, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-[80px]" 
        />
      </div>

      {/* Main Content */}
      <div className="container relative z-10 px-4 pt-28 pb-16 max-w-7xl mx-auto flex-1 flex flex-col">
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
            className="inline-flex items-center gap-3 px-4 py-2 mb-8 text-sm font-medium rounded-full bg-primary/10 border border-primary/20"
          >
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-semibold">Automatize com IA de verdade</span>
            </span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
            <span className="text-foreground">Automatize seu WhatsApp com</span>
            <br />
            <span className="text-gold-shine">
              {typedText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-primary"
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
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            A <span className="text-primary font-semibold">Luna IA</span> atende, qualifica e 
            converte seus leads automaticamente — enquanto você foca no que importa.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                asChild 
                size="lg" 
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 group font-semibold"
              >
                <Link to="/genesis" className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  Assinar Agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 border-border bg-card/50 hover:bg-card text-foreground"
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
                <item.icon className="w-4 h-4 text-emerald-500" />
                {item.text}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Integrated Panel Preview - Below Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative max-w-5xl mx-auto w-full"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-2xl" />
          
          {/* Panel */}
          <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden">
            {/* Header Bar */}
            <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-xs text-muted-foreground font-medium">Genesis Hub - Dashboard</span>
              </div>
            </div>

            <div className="flex">
              {/* Sidebar */}
              <div className="w-14 bg-muted/30 border-r border-border py-4 flex flex-col items-center gap-3">
                {[
                  { icon: Bot, active: true },
                  { icon: MessageSquare },
                  { icon: BarChart3 },
                  { icon: Users },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      item.active 
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                  </motion.div>
                ))}
              </div>

              {/* Main Content */}
              <div className="flex-1 p-5">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Mensagens Hoje', value: '2.847', icon: MessageSquare, trend: '+12%' },
                    { label: 'Taxa Conversão', value: '34.2%', icon: TrendingUp, trend: '+5%' },
                    { label: 'Leads Ativos', value: '156', icon: Users, trend: '+8%' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                      className="bg-muted/50 rounded-xl p-3 border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <stat.icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-[10px] text-emerald-400 font-medium">{stat.trend}</span>
                      </div>
                      <div className="text-lg font-bold text-foreground">{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex gap-3"
                >
                  <div className="flex-1 bg-primary/5 rounded-xl p-3 border border-primary/20 hover:border-primary/40 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">Luna IA</div>
                        <div className="text-[10px] text-muted-foreground">Configurar assistente</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-muted/30 rounded-xl p-3 border border-border hover:border-primary/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">Flow Builder</div>
                        <div className="text-[10px] text-muted-foreground">Criar automação</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Live Activity */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="mt-4 bg-muted/30 rounded-xl p-3 border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Atividade em Tempo Real</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Ao vivo
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'João Silva', action: 'recebeu proposta', time: 'agora' },
                      { name: 'Maria Santos', action: 'iniciou conversa', time: '2min' },
                    ].map((activity, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.5 + i * 0.1 }}
                        className="flex items-center gap-2 text-xs"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[9px] font-bold">
                          {activity.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-foreground">{activity.name}</span>
                        <span className="text-muted-foreground">{activity.action}</span>
                        <span className="text-muted-foreground/60 ml-auto">{activity.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Row at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 py-12 border-t border-border bg-card/30 backdrop-blur-sm"
      >
        <div className="container px-4 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '15M+', label: 'Mensagens/mês' },
              { value: '< 2s', label: 'Tempo resposta' },
              { value: '98%', label: 'Satisfação' },
              { value: '420%', label: 'ROI médio' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
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
