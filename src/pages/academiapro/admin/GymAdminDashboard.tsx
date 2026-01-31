import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Dumbbell, 
  CalendarDays, 
  TrendingUp,
  DollarSign,
  UserPlus,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function GymAdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeSubscriptions: 0,
    todayCheckIns: 0,
    monthlyRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [studentsRes, subsRes, checkInsRes] = await Promise.all([
      supabase.from('gym_profiles').select('id', { count: 'exact' }),
      supabase.from('gym_subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('gym_check_ins').select('id', { count: 'exact' }).gte('checked_in_at', today.toISOString())
    ]);

    setStats({
      totalStudents: studentsRes.count || 0,
      activeSubscriptions: subsRes.count || 0,
      todayCheckIns: checkInsRes.count || 0,
      monthlyRevenue: 0 // Would need to calculate from subscriptions
    });
    setIsLoading(false);
  };

  const statCards = [
    { 
      icon: Users, 
      label: 'Total de Alunos', 
      value: stats.totalStudents,
      change: '+12%',
      positive: true,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: UserPlus, 
      label: 'Assinaturas Ativas', 
      value: stats.activeSubscriptions,
      change: '+8%',
      positive: true,
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      icon: CalendarDays, 
      label: 'Check-ins Hoje', 
      value: stats.todayCheckIns,
      change: '-3%',
      positive: false,
      gradient: 'from-orange-500 to-red-500'
    },
    { 
      icon: DollarSign, 
      label: 'Receita Mensal', 
      value: `R$ ${(stats.monthlyRevenue / 100).toLocaleString('pt-BR')}`,
      change: '+15%',
      positive: true,
      gradient: 'from-purple-500 to-pink-500'
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
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
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
            <CalendarDays className="w-5 h-5 text-orange-500" />
            Check-ins Recentes
          </h2>
          <div className="text-center py-8 text-zinc-400">
            <CalendarDays className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
            <p>Nenhum check-in hoje</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: UserPlus, label: 'Novo Aluno', path: '/academiapro/admin/alunos' },
              { icon: Dumbbell, label: 'Criar Treino', path: '/academiapro/admin/treinos' },
              { icon: CalendarDays, label: 'Nova Aula', path: '/academiapro/admin/aulas' },
              { icon: Users, label: 'Ver Alunos', path: '/academiapro/admin/alunos' },
            ].map((action, i) => (
              <a
                key={i}
                href={action.path}
                className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <action.icon className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium">{action.label}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
