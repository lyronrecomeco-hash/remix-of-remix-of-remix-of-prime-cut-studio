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
  Activity,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function GymAdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeSubscriptions: 0,
    todayCheckIns: 0,
    monthlyRevenue: 0,
    newStudentsThisMonth: 0
  });
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const [checkInTrend, setCheckInTrend] = useState<any[]>([]);
  const [subscriptionsByPlan, setSubscriptionsByPlan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentCheckIns();
    fetchCheckInTrend();
    fetchSubscriptionsByPlan();
  }, []);

  const fetchStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = startOfMonth(new Date());

    const [studentsRes, subsRes, checkInsRes, newStudentsRes] = await Promise.all([
      supabase.from('gym_profiles').select('id', { count: 'exact' }).not('user_id', 'is', null),
      supabase.from('gym_subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('gym_check_ins').select('id', { count: 'exact' }).gte('checked_in_at', today.toISOString()),
      supabase.from('gym_profiles').select('id', { count: 'exact' }).gte('created_at', monthStart.toISOString())
    ]);

    setStats({
      totalStudents: studentsRes.count || 0,
      activeSubscriptions: subsRes.count || 0,
      todayCheckIns: checkInsRes.count || 0,
      monthlyRevenue: 0,
      newStudentsThisMonth: newStudentsRes.count || 0
    });
    setIsLoading(false);
  };

  const fetchRecentCheckIns = async () => {
    const { data } = await supabase
      .from('gym_check_ins')
      .select(`*, gym_profiles(full_name, avatar_url)`)
      .order('checked_in_at', { ascending: false })
      .limit(5);

    if (data) setRecentCheckIns(data);
  };

  const fetchCheckInTrend = async () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const { count } = await supabase
        .from('gym_check_ins')
        .select('id', { count: 'exact' })
        .gte('checked_in_at', dayStart.toISOString())
        .lte('checked_in_at', dayEnd.toISOString());

      days.push({
        day: format(date, 'EEE', { locale: ptBR }),
        checkIns: count || 0
      });
    }
    setCheckInTrend(days);
  };

  const fetchSubscriptionsByPlan = async () => {
    const { data: subs } = await supabase
      .from('gym_subscriptions')
      .select(`plan_id, gym_plans(name)`)
      .eq('status', 'active');

    if (subs) {
      const grouped: { [key: string]: number } = {};
      subs.forEach((s: any) => {
        const planName = s.gym_plans?.name || 'Sem plano';
        grouped[planName] = (grouped[planName] || 0) + 1;
      });

      const result = Object.entries(grouped).map(([name, value]) => ({
        name,
        value
      }));
      setSubscriptionsByPlan(result);
    }
  };

  const COLORS = ['hsl(var(--primary))', '#ef4444', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  const statCards = [
    { 
      icon: Users, 
      label: 'Total de Alunos', 
      value: stats.totalStudents,
      change: `+${stats.newStudentsThisMonth} este mês`,
      positive: stats.newStudentsThisMonth > 0
    },
    { 
      icon: UserPlus, 
      label: 'Assinaturas Ativas', 
      value: stats.activeSubscriptions,
      change: `${Math.round((stats.activeSubscriptions / Math.max(stats.totalStudents, 1)) * 100)}% dos alunos`,
      positive: true
    },
    { 
      icon: CalendarDays, 
      label: 'Check-ins Hoje', 
      value: stats.todayCheckIns,
      change: stats.todayCheckIns > 0 ? `${stats.todayCheckIns} presente(s)` : 'Nenhum ainda',
      positive: stats.todayCheckIns > 0
    },
    { 
      icon: Target, 
      label: 'Taxa de Presença', 
      value: `${Math.round((stats.todayCheckIns / Math.max(stats.activeSubscriptions, 1)) * 100)}%`,
      change: 'Baseado em ativos',
      positive: true
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          {(() => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) return 'Bom dia';
            if (hour >= 12 && hour < 18) return 'Boa tarde';
            return 'Boa noite';
          })()}, Adm.
        </h1>
        <p className="text-muted-foreground mt-1 text-sm lg:text-base">Visão geral da academia</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl lg:rounded-2xl p-4 lg:p-6"
          >
            <div className="flex items-start justify-between mb-3 lg:mb-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-muted flex items-center justify-center">
                <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
              </div>
              <div className={`flex items-center gap-1 text-xs lg:text-sm ${stat.positive ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                {stat.positive ? <ArrowUp className="w-3 h-3 lg:w-4 lg:h-4" /> : <ArrowDown className="w-3 h-3 lg:w-4 lg:h-4" />}
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-foreground">
              {isLoading ? '--' : stat.value}
            </p>
            <p className="text-muted-foreground text-xs lg:text-sm mt-1">{stat.label}</p>
            <p className="text-muted-foreground/70 text-xs mt-1 truncate">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Check-in Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl lg:rounded-2xl p-4 lg:p-6"
        >
          <h2 className="font-semibold text-base lg:text-lg mb-4 flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5 text-primary" />
            Check-ins - Últimos 7 dias
          </h2>
          <div className="h-48 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={checkInTrend}>
                <defs>
                  <linearGradient id="colorCheckIns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="checkIns" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCheckIns)" 
                  name="Check-ins"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Subscriptions by Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl lg:rounded-2xl p-4 lg:p-6"
        >
          <h2 className="font-semibold text-base lg:text-lg mb-4 flex items-center gap-2 text-foreground">
            <DollarSign className="w-5 h-5 text-primary" />
            Distribuição de Planos
          </h2>
          <div className="h-48 lg:h-64">
            {subscriptionsByPlan.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionsByPlan}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subscriptionsByPlan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend 
                    formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Nenhuma assinatura ativa</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Check-ins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl lg:rounded-2xl p-4 lg:p-6"
        >
          <h2 className="font-semibold text-base lg:text-lg mb-4 flex items-center gap-2 text-foreground">
            <Activity className="w-5 h-5 text-primary" />
            Check-ins Recentes
          </h2>
          {recentCheckIns.length > 0 ? (
            <div className="space-y-3">
              {recentCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">
                    {checkIn.gym_profiles?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm lg:text-base text-foreground">{checkIn.gym_profiles?.full_name || 'Usuário'}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(checkIn.checked_in_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm">Nenhum check-in hoje</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card border border-border rounded-xl lg:rounded-2xl p-4 lg:p-6"
        >
          <h2 className="font-semibold text-base lg:text-lg mb-4 flex items-center gap-2 text-foreground">
            <Dumbbell className="w-5 h-5 text-primary" />
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
                className="flex items-center gap-3 p-3 lg:p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors border border-border/50"
              >
                <action.icon className="w-5 h-5 text-primary" />
                <span className="text-xs lg:text-sm font-medium text-foreground">{action.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
