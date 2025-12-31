import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  DollarSign,
  CheckSquare,
  Target,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRM } from '@/contexts/CRMContext';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
  pendingTasks: number;
  totalValue: number;
  conversionRate: number;
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function CRMDashboard() {
  const { crmTenant, crmUser } = useCRM();
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    activeLeads: 0,
    wonLeads: 0,
    lostLeads: 0,
    pendingTasks: 0,
    totalValue: 0,
    conversionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [leadsOverTime, setLeadsOverTime] = useState<any[]>([]);
  const [leadsByStage, setLeadsByStage] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  useEffect(() => {
    if (crmTenant) {
      fetchDashboardData();
    }
  }, [crmTenant]);

  const fetchDashboardData = async () => {
    if (!crmTenant) return;

    try {
      setIsLoading(true);

      // Fetch leads count by status
      const { data: leads } = await supabase
        .from('crm_leads')
        .select('id, status, value, stage_id, created_at')
        .eq('crm_tenant_id', crmTenant.id);

      const totalLeads = leads?.length || 0;
      const activeLeads = leads?.filter((l) => l.status === 'active' || l.status === 'new').length || 0;
      const wonLeads = leads?.filter((l) => l.status === 'won').length || 0;
      const lostLeads = leads?.filter((l) => l.status === 'lost').length || 0;
      const totalValue = leads?.reduce((sum, l) => sum + (Number(l.value) || 0), 0) || 0;
      const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

      // Fetch pending tasks
      const { count: pendingTasks } = await supabase
        .from('crm_tasks')
        .select('id', { count: 'exact' })
        .eq('crm_tenant_id', crmTenant.id)
        .eq('status', 'pending');

      setStats({
        totalLeads,
        activeLeads,
        wonLeads,
        lostLeads,
        pendingTasks: pendingTasks || 0,
        totalValue,
        conversionRate,
      });

      // Leads over time (last 7 days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayLeads = leads?.filter((l) =>
          l.created_at.startsWith(dateStr)
        ).length || 0;
        last7Days.push({
          date: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
          leads: dayLeads,
        });
      }
      setLeadsOverTime(last7Days);

      // Leads by stage
      const { data: stages } = await supabase
        .from('crm_funnel_stages')
        .select('id, name, color')
        .eq('crm_tenant_id', crmTenant.id);

      if (stages && leads) {
        const stageData = stages.map((stage) => ({
          name: stage.name,
          value: leads.filter((l) => l.stage_id === stage.id).length,
          color: stage.color,
        })).filter((s) => s.value > 0);
        setLeadsByStage(stageData);
      }

      // Recent leads
      const { data: recent } = await supabase
        .from('crm_leads')
        .select('id, name, value, status, created_at')
        .eq('crm_tenant_id', crmTenant.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentLeads(recent || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const statCards = [
    {
      title: 'Total de Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Leads Ativos',
      value: stats.activeLeads,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Leads Ganhos',
      value: stats.wonLeads,
      icon: Target,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Leads Perdidos',
      value: stats.lostLeads,
      icon: ArrowDown,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Tarefas Pendentes',
      value: stats.pendingTasks,
      icon: CheckSquare,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Valor em Negociação',
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      isString: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {crmUser?.name?.split(' ')[0]}!
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">
                      {stat.isString ? stat.value : stat.value.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Conversion Rate Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.conversionRate.toFixed(1)}%
                </p>
              </div>
              <div className="flex items-center gap-2">
                {stats.conversionRate >= 20 ? (
                  <ArrowUp className="w-5 h-5 text-green-500" />
                ) : (
                  <ArrowDown className="w-5 h-5 text-red-500" />
                )}
                <span className={stats.conversionRate >= 20 ? 'text-green-500' : 'text-red-500'}>
                  {stats.conversionRate >= 20 ? 'Bom' : 'Pode melhorar'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leads por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={leadsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="leads"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leads by Stage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leads por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {leadsByStage.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadsByStage}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {leadsByStage.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Nenhum lead cadastrado ainda
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Leads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leads Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLeads.length > 0 ? (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">
                        {formatCurrency(Number(lead.value) || 0)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          lead.status === 'won'
                            ? 'bg-green-500/20 text-green-500'
                            : lead.status === 'lost'
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-blue-500/20 text-blue-500'
                        }`}
                      >
                        {lead.status === 'won'
                          ? 'Ganho'
                          : lead.status === 'lost'
                          ? 'Perdido'
                          : lead.status === 'active'
                          ? 'Ativo'
                          : 'Novo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum lead cadastrado ainda. Comece adicionando seu primeiro lead!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
