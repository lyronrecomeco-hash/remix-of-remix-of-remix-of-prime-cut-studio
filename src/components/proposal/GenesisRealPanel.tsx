import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MessageSquare, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Bell,
  Zap,
  DollarSign,
  BarChart3,
  Settings,
  Sparkles,
  Phone,
  Activity,
  Star,
  ArrowUpRight
} from 'lucide-react';

interface GenesisRealPanelProps {
  niche?: string;
  companyName?: string;
}

interface LiveActivity {
  id: number;
  type: 'booking' | 'message' | 'payment' | 'automation' | 'reminder';
  title: string;
  subtitle: string;
  time: string;
}

// Configuração por nicho - dados realistas
const nicheConfig: Record<string, {
  stats: { label: string; value: number; suffix?: string; icon: any; color: string }[];
  activities: Omit<LiveActivity, 'id' | 'time'>[];
  metric1Label: string;
  metric2Label: string;
}> = {
  barbearia: {
    stats: [
      { label: 'Agendamentos Hoje', value: 18, icon: Calendar, color: 'text-primary' },
      { label: 'Confirmados', value: 15, icon: CheckCircle, color: 'text-emerald-400' },
      { label: 'Mensagens Auto', value: 47, icon: MessageSquare, color: 'text-blue-400' },
      { label: 'Faturamento', value: 1850, suffix: 'R$', icon: DollarSign, color: 'text-amber-400' },
    ],
    activities: [
      { type: 'booking', title: 'Novo agendamento', subtitle: 'Carlos Santos - Degradê + Barba às 15:30' },
      { type: 'message', title: 'Resposta automática', subtitle: 'João enviou "qual o preço" → atendido em 3s' },
      { type: 'reminder', title: 'Lembrete enviado', subtitle: '8 clientes notificados para amanhã' },
      { type: 'automation', title: 'Cliente fidelizado', subtitle: 'Maria atingiu 5 cortes → cupom 15% enviado' },
      { type: 'booking', title: 'Reagendamento', subtitle: 'Pedro moveu de 14h para 16h automaticamente' },
      { type: 'payment', title: 'Pagamento confirmado', subtitle: 'PIX de R$ 65 recebido - Ana Costa' },
    ],
    metric1Label: 'Cadeiras Ocupadas',
    metric2Label: 'Taxa de Retorno'
  },
  clinica: {
    stats: [
      { label: 'Consultas Hoje', value: 24, icon: Calendar, color: 'text-primary' },
      { label: 'Confirmadas', value: 21, icon: CheckCircle, color: 'text-emerald-400' },
      { label: 'Lembretes Enviados', value: 156, icon: Bell, color: 'text-blue-400' },
      { label: 'Faturamento', value: 8500, suffix: 'R$', icon: DollarSign, color: 'text-amber-400' },
    ],
    activities: [
      { type: 'booking', title: 'Nova consulta agendada', subtitle: 'Dr. Silva - Maria Santos às 14:00' },
      { type: 'message', title: 'Confirmação automática', subtitle: 'Paciente confirmou via WhatsApp' },
      { type: 'reminder', title: 'Lembrete 24h', subtitle: '15 pacientes notificados' },
      { type: 'automation', title: 'Retorno agendado', subtitle: 'Sistema sugeriu retorno para João' },
      { type: 'booking', title: 'Encaixe automático', subtitle: 'Vaga das 11h preenchida em 5min' },
      { type: 'payment', title: 'Convênio processado', subtitle: 'Guia autorizada - Ana Lima' },
    ],
    metric1Label: 'Salas Ocupadas',
    metric2Label: 'Satisfação'
  },
  restaurante: {
    stats: [
      { label: 'Pedidos Hoje', value: 67, icon: Calendar, color: 'text-primary' },
      { label: 'Entregas', value: 45, icon: CheckCircle, color: 'text-emerald-400' },
      { label: 'Atendimentos Auto', value: 89, icon: MessageSquare, color: 'text-blue-400' },
      { label: 'Faturamento', value: 4200, suffix: 'R$', icon: DollarSign, color: 'text-amber-400' },
    ],
    activities: [
      { type: 'booking', title: 'Novo pedido', subtitle: 'Combo família + bebidas - R$ 89' },
      { type: 'message', title: 'Cardápio enviado', subtitle: 'Cliente pediu menu → resposta em 2s' },
      { type: 'automation', title: 'Entrega rastreada', subtitle: 'Motoboy a 5min do destino' },
      { type: 'reminder', title: 'Promoção disparada', subtitle: '200 clientes notificados sobre oferta' },
      { type: 'payment', title: 'PIX confirmado', subtitle: 'R$ 65 - Pedido #1247' },
      { type: 'booking', title: 'Reserva confirmada', subtitle: 'Mesa para 6 às 20h - João Silva' },
    ],
    metric1Label: 'Tempo Médio Entrega',
    metric2Label: 'Avaliação Média'
  },
  servicos: {
    stats: [
      { label: 'Orçamentos Hoje', value: 12, icon: Calendar, color: 'text-primary' },
      { label: 'Aprovados', value: 8, icon: CheckCircle, color: 'text-emerald-400' },
      { label: 'Follow-ups Auto', value: 34, icon: MessageSquare, color: 'text-blue-400' },
      { label: 'Faturamento', value: 12500, suffix: 'R$', icon: DollarSign, color: 'text-amber-400' },
    ],
    activities: [
      { type: 'booking', title: 'Visita agendada', subtitle: 'Técnico João - Rua das Flores 123 às 14h' },
      { type: 'message', title: 'Orçamento enviado', subtitle: 'Cliente recebeu proposta de R$ 450' },
      { type: 'automation', title: 'Follow-up automático', subtitle: 'Lead sem resposta há 48h → mensagem enviada' },
      { type: 'reminder', title: 'Serviço confirmado', subtitle: 'Cliente confirmou visita de amanhã' },
      { type: 'payment', title: 'Pagamento parcial', subtitle: 'Entrada de R$ 500 recebida' },
      { type: 'booking', title: 'Serviço concluído', subtitle: 'Avaliação 5 estrelas recebida' },
    ],
    metric1Label: 'Taxa Conversão',
    metric2Label: 'Tempo Resposta'
  }
};

export const GenesisRealPanel = ({ niche = 'barbearia', companyName = 'Sua Empresa' }: GenesisRealPanelProps) => {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [stats, setStats] = useState(nicheConfig[niche]?.stats || nicheConfig.barbearia.stats);
  const [animatedStats, setAnimatedStats] = useState(stats.map(() => 0));
  const config = nicheConfig[niche] || nicheConfig.barbearia;

  // Animar estatísticas subindo
  useEffect(() => {
    const intervals = stats.map((stat, index) => {
      const increment = Math.ceil(stat.value / 30);
      return setInterval(() => {
        setAnimatedStats(prev => {
          const newStats = [...prev];
          newStats[index] = Math.min(newStats[index] + increment, stat.value);
          return newStats;
        });
      }, 50);
    });

    return () => intervals.forEach(clearInterval);
  }, [stats]);

  // Simular atividades em tempo real
  useEffect(() => {
    let activityId = 0;
    
    const interval = setInterval(() => {
      const template = config.activities[Math.floor(Math.random() * config.activities.length)];
      const newActivity: LiveActivity = {
        ...template,
        id: activityId++,
        time: 'agora'
      };
      
      setActivities(prev => [newActivity, ...prev].slice(0, 5));
    }, 2500);

    return () => clearInterval(interval);
  }, [config.activities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'message': return MessageSquare;
      case 'payment': return DollarSign;
      case 'automation': return Zap;
      case 'reminder': return Bell;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'booking': return 'from-violet-500 to-purple-500';
      case 'message': return 'from-blue-500 to-cyan-500';
      case 'payment': return 'from-emerald-500 to-green-500';
      case 'automation': return 'from-amber-500 to-orange-500';
      case 'reminder': return 'from-pink-500 to-rose-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto"
    >
      {/* Browser Frame Premium */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10 border border-white/10">
        {/* Browser Header */}
        <div className="bg-slate-950/80 px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors" />
          </div>
          <div className="flex-1 bg-slate-800/50 rounded-lg px-4 py-1.5 flex items-center gap-2 border border-white/5">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-violet-500 to-fuchsia-500" />
            <span className="text-white/60 text-sm">app.genesishub.cloud/painel/{companyName.toLowerCase().replace(/\s+/g, '-')}</span>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs">ao vivo</span>
            </div>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex min-h-[500px]">
          {/* Sidebar */}
          <div className="w-16 bg-slate-950/50 p-3 flex flex-col gap-3 items-center border-r border-white/5">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30"
              whileHover={{ scale: 1.1 }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            {[BarChart3, Calendar, Users, MessageSquare, Settings].map((Icon, i) => (
              <motion.div 
                key={i}
                className={`w-10 h-10 rounded-xl ${i === 0 ? 'bg-white/10 text-white' : 'bg-white/5 text-white/40'} flex items-center justify-center`}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Dashboard</h2>
                <p className="text-white/50 text-sm">{companyName} • Operação automática</p>
              </div>
              <motion.div 
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">Sistema Ativo 24/7</span>
              </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <motion.div
                      animate={{ y: [-2, 2, -2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stat.suffix === 'R$' && 'R$ '}
                    {animatedStats[index].toLocaleString('pt-BR')}
                    {stat.suffix && stat.suffix !== 'R$' && stat.suffix}
                  </p>
                  <p className="text-sm text-white/50">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Activity Feed */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-400" />
                  Atividade em Tempo Real
                </h3>
                <span className="text-white/40 text-xs">Atualiza automaticamente</span>
              </div>
              
              <div className="space-y-3 max-h-[200px] overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {activities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <motion.div
                        key={activity.id}
                        layout
                        initial={{ opacity: 0, x: -30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 30, scale: 0.95 }}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{activity.title}</p>
                          <p className="text-white/50 text-xs truncate">{activity.subtitle}</p>
                        </div>
                        <span className="text-white/30 text-xs">{activity.time}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {activities.length === 0 && (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Activity className="w-8 h-8 text-white/20 mx-auto" />
                    </motion.div>
                    <p className="text-white/30 text-sm mt-2">Carregando atividades...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-xl p-4 border border-violet-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-violet-400" />
                  <span className="text-white/70 text-sm">{config.metric1Label}</span>
                </div>
                <div className="flex items-end gap-2">
                  <motion.span 
                    className="text-3xl font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    87%
                  </motion.span>
                  <span className="text-emerald-400 text-sm mb-1">↑ 12%</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-xl p-4 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/70 text-sm">{config.metric2Label}</span>
                </div>
                <div className="flex items-end gap-2">
                  <motion.span 
                    className="text-3xl font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    98.5%
                  </motion.span>
                  <span className="text-emerald-400 text-sm mb-1">↑ 5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="bg-slate-950/80 px-6 py-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/50 text-xs">WhatsApp conectado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-white/50 text-xs">Automações ativas</span>
            </div>
          </div>
          <span className="text-white/30 text-xs">Genesis Hub v4.0</span>
        </div>
      </div>
    </motion.div>
  );
};

export default GenesisRealPanel;
