import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Dumbbell, 
  CalendarDays, 
  TrendingUp,
  DollarSign,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Clock,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GymAdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeSubscriptions: 0,
    todayCheckIns: 0,
    monthlyRevenue: 0,
    pendingPayments: 0
  });
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentCheckIns();
  }, []);

  const fetchStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [studentsRes, subsRes, checkInsRes, revenueRes, pendingRes] = await Promise.all([
      supabase.from('gym_profiles').select('id', { count: 'exact' })
        .not('user_id', 'is', null),
      supabase.from('gym_subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('gym_check_ins').select('id', { count: 'exact' }).gte('checked_in_at', today.toISOString()),
      supabase.from('gym_payments').select('amount_cents').eq('status', 'paid').gte('paid_at', monthStart.toISOString()),
      supabase.from('gym_payments').select('id', { count: 'exact' }).eq('status', 'pending')
    ]);

    const monthlyRevenue = (revenueRes.data || []).reduce((sum, p) => sum + (p.amount_cents || 0), 0);

    setStats({
      totalStudents: studentsRes.count || 0,
      activeSubscriptions: subsRes.count || 0,
      todayCheckIns: checkInsRes.count || 0,
      monthlyRevenue,
      pendingPayments: pendingRes.count || 0
    });
    setIsLoading(false);
  };

  const fetchRecentCheckIns = async () => {
    const { data } = await supabase
      .from('gym_check_ins')
      .select(`
        *,
        gym_profiles(full_name, avatar_url)
      `)
      .order('checked_in_at', { ascending: false })
      .limit(5);

    if (data) setRecentCheckIns(data);
  };

  const statCards = [
    { 
      icon: Users, 
      label: 'Total de Alunos', 
      value: stats.totalStudents,
      change: '+12%',
      positive: true,
      bgColor: 'bg-zinc-800/50',
      iconBg: 'bg-zinc-700',
      iconColor: 'text-zinc-300'
    },
    { 
      icon: UserPlus, 
      label: 'Assinaturas Ativas', 
      value: stats.activeSubscriptions,
      change: '+8%',
      positive: true,
      bgColor: 'bg-zinc-800/50',
      iconBg: 'bg-zinc-700',
      iconColor: 'text-zinc-300'
    },
    { 
      icon: CalendarDays, 
      label: 'Check-ins Hoje', 
      value: stats.todayCheckIns,
      change: stats.todayCheckIns > 0 ? '+' + stats.todayCheckIns : '0',
      positive: stats.todayCheckIns > 0,
      bgColor: 'bg-zinc-800/50',
      iconBg: 'bg-zinc-700',
      iconColor: 'text-zinc-300'
    },
    { 
      icon: DollarSign, 
      label: 'Receita Mensal', 
      value: `R$ ${(stats.monthlyRevenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: '+15%',
      positive: true,
      bgColor: 'bg-zinc-800/50',
      iconBg: 'bg-zinc-700',
      iconColor: 'text-zinc-300'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Visão geral da academia</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-emerald-500' : 'text-zinc-500'}`}>
                {stat.positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold">
              {isLoading ? '--' : stat.value}
            </p>
            <p className="text-zinc-400 text-sm mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Check-ins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-zinc-400" />
            Check-ins Recentes
          </h2>
          {recentCheckIns.length > 0 ? (
            <div className="space-y-3">
              {recentCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium">
                    {checkIn.gym_profiles?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{checkIn.gym_profiles?.full_name || 'Usuário'}</p>
                    <p className="text-xs text-zinc-400">
                      {format(new Date(checkIn.checked_in_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-zinc-500" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400">
              <CalendarDays className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
              <p>Nenhum check-in hoje</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-zinc-400" />
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: UserPlus, label: 'Novo Aluno', path: '/academiapro/admin/alunos' },
              { icon: Dumbbell, label: 'Criar Treino', path: '/academiapro/admin/treinos' },
              { icon: CalendarDays, label: 'Nova Aula', path: '/academiapro/admin/aulas' },
              { icon: DollarSign, label: 'Financeiro', path: '/academiapro/admin/financeiro' },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.path}
                className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors border border-zinc-700/50"
              >
                <action.icon className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
