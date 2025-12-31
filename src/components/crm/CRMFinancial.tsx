import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  ArrowUp,
  ArrowDown,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface FinancialStats {
  totalValue: number;
  wonValue: number;
  lostValue: number;
  inNegotiationValue: number;
  avgTicket: number;
  conversionRate: number;
}

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function CRMFinancial() {
  const { crmTenant } = useCRM();
  const [stats, setStats] = useState<FinancialStats>({
    totalValue: 0,
    wonValue: 0,
    lostValue: 0,
    inNegotiationValue: 0,
    avgTicket: 0,
    conversionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [revenueByMonth, setRevenueByMonth] = useState<any[]>([]);
  const [revenueByUser, setRevenueByUser] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);

  useEffect(() => {
    if (crmTenant) {
      fetchFinancialData();
    }
  }, [crmTenant, period]);

  const fetchFinancialData = async () => {
    if (!crmTenant) return;

    try {
      setIsLoading(true);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Fetch leads
      const { data: leads } = await supabase
        .from('crm_leads')
        .select(`
          id, value, status, won_at, created_at,
          responsible:crm_users(name)
        `)
        .eq('crm_tenant_id', crmTenant.id)
        .gte('created_at', startDate.toISOString());

      if (leads) {
        const totalValue = leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0);
        const wonLeads = leads.filter((l) => l.status === 'won');
        const wonValue = wonLeads.reduce((sum, l) => sum + (Number(l.value) || 0), 0);
        const lostValue = leads
          .filter((l) => l.status === 'lost')
          .reduce((sum, l) => sum + (Number(l.value) || 0), 0);
        const inNegotiationValue = leads
          .filter((l) => l.status === 'active' || l.status === 'new')
          .reduce((sum, l) => sum + (Number(l.value) || 0), 0);
        const avgTicket = wonLeads.length > 0 ? wonValue / wonLeads.length : 0;
        const conversionRate = leads.length > 0 ? (wonLeads.length / leads.length) * 100 : 0;

        setStats({
          totalValue,
          wonValue,
          lostValue,
          inNegotiationValue,
          avgTicket,
          conversionRate,
        });

        // Status distribution
        setStatusDistribution([
          { name: 'Ganhos', value: wonValue, color: '#22c55e' },
          { name: 'Perdidos', value: lostValue, color: '#ef4444' },
          { name: 'Em negociação', value: inNegotiationValue, color: '#3b82f6' },
        ].filter((s) => s.value > 0));

        // Revenue by user
        const userRevenue: Record<string, number> = {};
        leads
          .filter((l) => l.status === 'won' && l.responsible)
          .forEach((l) => {
            const userName = (l.responsible as any)?.name || 'Sem responsável';
            userRevenue[userName] = (userRevenue[userName] || 0) + (Number(l.value) || 0);
          });

        setRevenueByUser(
          Object.entries(userRevenue)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
        );

        // Revenue by month (last 6 months)
        const monthlyRevenue: Record<string, number> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = date.toLocaleDateString('pt-BR', { month: 'short' });
          monthlyRevenue[key] = 0;
        }

        leads
          .filter((l) => l.status === 'won' && l.won_at)
          .forEach((l) => {
            const date = new Date(l.won_at!);
            const key = date.toLocaleDateString('pt-BR', { month: 'short' });
            if (monthlyRevenue[key] !== undefined) {
              monthlyRevenue[key] += Number(l.value) || 0;
            }
          });

        setRevenueByMonth(
          Object.entries(monthlyRevenue).map(([month, value]) => ({ month, value }))
        );
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
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
      title: 'Valor Total',
      value: stats.totalValue,
      icon: DollarSign,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Receita (Ganhos)',
      value: stats.wonValue,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Valor Perdido',
      value: stats.lostValue,
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Em Negociação',
      value: stats.inNegotiationValue,
      icon: Target,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Ticket Médio',
      value: stats.avgTicket,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Performance financeira do seu CRM
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">
                      {stat.title}
                    </p>
                    <p className="text-lg font-bold truncate">
                      {formatCurrency(stat.value)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Conversion Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
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
                <span
                  className={
                    stats.conversionRate >= 20 ? 'text-green-500' : 'text-red-500'
                  }
                >
                  {stats.conversionRate >= 20 ? 'Bom desempenho' : 'Pode melhorar'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Receita por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis
                      className="text-xs"
                      tickFormatter={(value) =>
                        new Intl.NumberFormat('pt-BR', {
                          notation: 'compact',
                          compactDisplay: 'short',
                        }).format(value)
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
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

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
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
                    Sem dados para exibir
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue by User */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Receita por Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {revenueByUser.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByUser} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        className="text-xs"
                        tickFormatter={(value) =>
                          new Intl.NumberFormat('pt-BR', {
                            notation: 'compact',
                            compactDisplay: 'short',
                          }).format(value)
                        }
                      />
                      <YAxis type="category" dataKey="name" className="text-xs" width={100} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Sem dados para exibir
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
