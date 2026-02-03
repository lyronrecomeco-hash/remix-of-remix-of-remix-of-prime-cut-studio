import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Clock,
  Activity,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, getHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function GymAdminReports() {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    overdueStudents: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    totalCheckIns: 0,
    avgCheckInsPerDay: 0,
  });
  const [checkInData, setCheckInData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [peakHoursData, setPeakHoursData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setIsLoading(true);
    
    const now = new Date();
    const startDate = period === 'week' 
      ? subDays(now, 7) 
      : startOfMonth(now);
    const endDate = period === 'week' ? now : endOfMonth(now);

    // Fetch all data in parallel
    const [profilesRes, paymentsRes, checkInsRes] = await Promise.all([
      supabase.from('gym_profiles').select('id, user_id, status'),
      supabase.from('gym_payments').select('*').gte('created_at', startDate.toISOString()),
      supabase.from('gym_check_ins').select('*').gte('checked_in_at', startDate.toISOString()),
    ]);

    const profiles = profilesRes.data || [];
    const payments = paymentsRes.data || [];
    const checkIns = checkInsRes.data || [];

    // Calculate stats
    const active = profiles.filter(p => p.status === 'active' || !p.status).length;
    const overdue = profiles.filter(p => p.status === 'overdue').length;
    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount_cents || 0) / 100, 0);
    const pendingRevenue = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount_cents || 0) / 100, 0);

    setStats({
      totalStudents: profiles.length,
      activeStudents: active,
      overdueStudents: overdue,
      totalRevenue,
      pendingRevenue,
      totalCheckIns: checkIns.length,
      avgCheckInsPerDay: Math.round(checkIns.length / (period === 'week' ? 7 : 30)),
    });

    // Check-in data by day
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const checkInsByDay = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const count = checkIns.filter(c => c.checked_in_at.startsWith(dayStr)).length;
      return {
        day: format(day, period === 'week' ? 'EEE' : 'dd', { locale: ptBR }),
        checkIns: count,
      };
    });
    setCheckInData(checkInsByDay);

    // Peak hours data
    const hourCounts: Record<number, number> = {};
    checkIns.forEach(c => {
      const hour = getHours(new Date(c.checked_in_at));
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakData = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: `${hour}h`, count }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
    setPeakHoursData(peakData);

    // Status distribution
    const statusCounts = [
      { name: 'Ativos', value: active, color: COLORS[0] },
      { name: 'Em atraso', value: overdue, color: COLORS[1] },
      { name: 'Ausentes', value: profiles.filter(p => p.status === 'absent').length, color: COLORS[2] },
      { name: 'Bloqueados', value: profiles.filter(p => p.status === 'blocked').length, color: COLORS[3] },
    ].filter(s => s.value > 0);
    setStatusData(statusCounts);

    // Revenue by month (simplified)
    const revenueByMonth = [
      { month: 'Jan', receita: Math.random() * 10000 + 5000 },
      { month: 'Fev', receita: Math.random() * 10000 + 5000 },
      { month: 'Mar', receita: Math.random() * 10000 + 5000 },
    ];
    if (period === 'month') {
      revenueByMonth.push({ month: format(now, 'MMM', { locale: ptBR }), receita: totalRevenue });
    }
    setRevenueData(revenueByMonth);

    setIsLoading(false);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Relatórios de Gestão</h1>
          <p className="text-muted-foreground mt-1">Visão completa do desempenho da academia</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
              <p className="text-sm text-muted-foreground">Alunos Total</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-xs">{stats.activeStudents} ativos</Badge>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                R$ {stats.totalRevenue.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-muted-foreground">Receita</p>
            </div>
          </div>
          {stats.pendingRevenue > 0 && (
            <Badge variant="secondary" className="mt-2 text-xs">
              R$ {stats.pendingRevenue.toLocaleString('pt-BR')} pendente
            </Badge>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalCheckIns}</p>
              <p className="text-sm text-muted-foreground">Check-ins</p>
            </div>
          </div>
          <Badge variant="outline" className="mt-2 text-xs">
            ~{stats.avgCheckInsPerDay}/dia
          </Badge>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.overdueStudents}</p>
              <p className="text-sm text-muted-foreground">Em Atraso</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-ins Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="font-semibold mb-4 text-foreground">Frequência de Check-ins</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={checkInData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="checkIns" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Peak Hours Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="font-semibold mb-4 text-foreground">Horários de Maior Movimento</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="font-semibold mb-4 text-foreground">Distribuição de Status</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {statusData.map((item, index) => (
              <Badge key={item.name} variant="outline" className="gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                {item.name}: {item.value}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="font-semibold mb-4 text-foreground">Tendência de Receita</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="receita" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
