import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, Play, Bot, MessageSquare, 
  BarChart3, Users, Zap, CheckCircle2, Star
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
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Floating Orbs */}
        <motion.div 
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/20 to-blue-600/10 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            scale: [1, 0.95, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/15 to-pink-500/10 rounded-full blur-[80px]" 
        />
      </div>

      <div className="container relative z-10 px-4 py-24 md:py-32 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-4 py-2 mb-8 text-sm font-medium rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20"
            >
              <span className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-emerald-400 font-semibold">+3.500 empresas ativas</span>
              </span>
              <span className="text-white/20">|</span>
              <span className="text-slate-400">⭐ 4.9/5 avaliação</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 leading-[1.05] tracking-tight">
              <span className="text-white">Automatize seu</span>
              <br />
              <span className="text-white">WhatsApp com a</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                {typedText}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="text-cyan-400"
                >
                  |
                </motion.span>
              </span>
            </h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-slate-400 mb-10 max-w-lg leading-relaxed"
            >
              A <span className="text-cyan-400 font-semibold">Luna IA</span> atende, qualifica e 
              converte seus leads automaticamente — enquanto você foca no que importa.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-10"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  asChild 
                  size="lg" 
                  className="text-lg px-8 py-7 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-2xl shadow-cyan-500/30 border-0 group min-w-[260px] font-semibold"
                >
                  <Link to="/genesis" className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    Testar Grátis por 7 Dias
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-7 border-white/10 bg-white/5 hover:bg-white/10 text-white group min-w-[200px]"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="w-5 h-5 mr-2" />
                Ver Demo
              </Button>
            </motion.div>

            {/* Trust Points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400"
            >
              {[
                { icon: CheckCircle2, text: 'Sem cartão de crédito' },
                { icon: CheckCircle2, text: 'Setup em 5 minutos' },
                { icon: CheckCircle2, text: 'Suporte 24h' },
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-emerald-500" />
                  {item.text}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Integrated Panel Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* Main Panel Container */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
              
              {/* Panel */}
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Header Bar */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <span className="text-xs text-slate-500 font-medium">Genesis Hub - Dashboard</span>
                  </div>
                </div>

                <div className="flex">
                  {/* Sidebar */}
                  <div className="w-16 bg-slate-800/30 border-r border-white/5 py-4 flex flex-col items-center gap-4">
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
                        transition={{ delay: 0.8 + i * 0.1 }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          item.active 
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-5">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {[
                        { label: 'Mensagens Hoje', value: '2.847', icon: MessageSquare, color: 'cyan' },
                        { label: 'Taxa Conversão', value: '34.2%', icon: BarChart3, color: 'emerald' },
                        { label: 'Leads Ativos', value: '156', icon: Users, color: 'purple' },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 + i * 0.1 }}
                          className="bg-slate-800/50 rounded-xl p-3 border border-white/5"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center mb-2`}>
                            <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                          </div>
                          <div className="text-xl font-bold text-white">{stat.value}</div>
                          <div className="text-[10px] text-slate-500">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 }}
                      className="space-y-3"
                    >
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ações Rápidas</div>
                      
                      <div className="flex gap-3">
                        <div className="flex-1 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-xl p-4 border border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                              <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-white text-sm">Luna IA</div>
                              <div className="text-xs text-slate-400">Configurar assistente</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 bg-slate-800/30 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                              <Zap className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-white text-sm">Flow Builder</div>
                              <div className="text-xs text-slate-400">Criar automação</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Live Activity */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                      className="mt-5 bg-slate-800/30 rounded-xl p-4 border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Atividade em Tempo Real</span>
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
                            transition={{ delay: 1.7 + i * 0.15 }}
                            className="flex items-center gap-3 text-xs"
                          >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                              {activity.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-slate-300">{activity.name}</span>
                            <span className="text-slate-500">{activity.action}</span>
                            <span className="text-slate-600 ml-auto">{activity.time}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Floating Badges */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 }}
                className="absolute -left-8 top-1/4 bg-slate-900/90 backdrop-blur-xl rounded-xl p-3 border border-emerald-500/20 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Resposta enviada</div>
                    <div className="text-[10px] text-slate-500">IA respondeu em 1.2s</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2 }}
                className="absolute -right-6 bottom-1/4 bg-slate-900/90 backdrop-blur-xl rounded-xl p-3 border border-purple-500/20 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">+12 leads hoje</div>
                    <div className="text-[10px] text-slate-500">↑ 24% vs ontem</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-20 lg:mt-32 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {[
            { value: '15M+', label: 'Mensagens/mês', icon: MessageSquare },
            { value: '< 2s', label: 'Tempo resposta', icon: Zap },
            { value: '98%', label: 'Satisfação', icon: Star },
            { value: '420%', label: 'ROI médio', icon: BarChart3 },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 mb-3">
                <stat.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default GenesisCommercialHero;
