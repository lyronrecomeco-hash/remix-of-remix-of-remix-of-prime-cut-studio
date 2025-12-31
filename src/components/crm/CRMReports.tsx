import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  XCircle,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  Cell,
  Legend,
} from 'recharts';

interface ReportData {
  conversionByStage: { name: string; rate: number; color: string }[];
  avgTimeInFunnel: number;
  lossReasons: { name: string; count: number }[];
  teamPerformance: { name: string; won: number; lost: number; total: number }[];
  monthlyTrend: { month: string; leads: number; won: number }[];
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function CRMReports() {
  const { crmTenant } = useCRM();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('90');
  const [reportData, setReportData] = useState<ReportData>({
    conversionByStage: [],
    avgTimeInFunnel: 0,
    lossReasons: [],
    teamPerformance: [],
    monthlyTrend: [],
  });

  useEffect(() => {
    if (crmTenant) {
      fetchReportData();
    }
  }, [crmTenant, period]);

  const fetchReportData = async () => {
    if (!crmTenant) return;

    try {
      setIsLoading(true);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Fetch all necessary data
      const [
        { data: leads },
        { data: stages },
        { data: lossReasons },
        { data: users },
      ] = await Promise.all([
        supabase
          .from('crm_leads')
          .select('*, responsible:crm_users(name)')
          .eq('crm_tenant_id', crmTenant.id)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('crm_funnel_stages')
          .select('*')
          .eq('crm_tenant_id', crmTenant.id)
          .order('position'),
        supabase
          .from('crm_loss_reasons')
          .select('*')
          .eq('crm_tenant_id', crmTenant.id),
        supabase
          .from('crm_users')
          .select('*')
          .eq('crm_tenant_id', crmTenant.id)
          .eq('is_active', true),
      ]);

      // Calculate conversion by stage
      const conversionByStage = stages?.map((stage) => {
        const stageLeads = leads?.filter((l) => l.stage_id === stage.id) || [];
        const wonLeads = stageLeads.filter((l) => l.status === 'won');
        const rate = stageLeads.length > 0 ? (wonLeads.length / stageLeads.length) * 100 : 0;
        return {
          name: stage.name,
          rate: Math.round(rate),
          color: stage.color,
        };
      }) || [];

      // Calculate average time in funnel (days)
      const wonLeads = leads?.filter((l) => l.status === 'won' && l.won_at) || [];
      let avgTime = 0;
      if (wonLeads.length > 0) {
        const totalDays = wonLeads.reduce((sum, l) => {
          const created = new Date(l.created_at);
          const won = new Date(l.won_at!);
          const days = Math.ceil((won.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);
        avgTime = Math.round(totalDays / wonLeads.length);
      }

      // Loss reasons breakdown
      const lostLeads = leads?.filter((l) => l.status === 'lost') || [];
      const lossReasonCounts: Record<string, number> = {};
      lostLeads.forEach((l) => {
        const reason = lossReasons?.find((r) => r.id === l.loss_reason_id);
        const name = reason?.name || 'Não especificado';
        lossReasonCounts[name] = (lossReasonCounts[name] || 0) + 1;
      });

      const lossReasonsData = Object.entries(lossReasonCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Team performance
      const teamPerformance = users?.map((user) => {
        const userLeads = leads?.filter((l) => (l.responsible as any)?.name === user.name) || [];
        const won = userLeads.filter((l) => l.status === 'won').length;
        const lost = userLeads.filter((l) => l.status === 'lost').length;
        return {
          name: user.name,
          won,
          lost,
          total: userLeads.length,
        };
      }).filter((p) => p.total > 0) || [];

      // Monthly trend (last 6 months)
      const monthlyTrend: Record<string, { leads: number; won: number }> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleDateString('pt-BR', { month: 'short' });
        monthlyTrend[key] = { leads: 0, won: 0 };
      }

      leads?.forEach((l) => {
        const date = new Date(l.created_at);
        const key = date.toLocaleDateString('pt-BR', { month: 'short' });
        if (monthlyTrend[key]) {
          monthlyTrend[key].leads++;
          if (l.status === 'won') {
            monthlyTrend[key].won++;
          }
        }
      });

      const monthlyTrendData = Object.entries(monthlyTrend).map(([month, data]) => ({
        month,
        ...data,
      }));

      setReportData({
        conversionByStage,
        avgTimeInFunnel: avgTime,
        lossReasons: lossReasonsData,
        teamPerformance,
        monthlyTrend: monthlyTrendData,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-4 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
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
          <h1 className="text-xl font-bold">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            Análise detalhada do seu funil de vendas
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="180">Últimos 6 meses</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tempo Médio no Funil
                  </p>
                  <p className="text-3xl font-bold">
                    {reportData.avgTimeInFunnel} dias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Target className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Melhor Etapa de Conversão
                  </p>
                  <p className="text-xl font-bold">
                    {reportData.conversionByStage.length > 0
                      ? reportData.conversionByStage.reduce((best, curr) =>
                          curr.rate > best.rate ? curr : best
                        ).name
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversion by Stage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Conversão por Etapa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {reportData.conversionByStage.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.conversionByStage}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" unit="%" />
                      <Tooltip
                        formatter={(value: number) => `${value}%`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                        {reportData.conversionByStage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
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

        {/* Loss Reasons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Motivos de Perda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {reportData.lossReasons.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.lossReasons}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        label={({ name, count }) => `${name}: ${count}`}
                        labelLine={false}
                      >
                        {reportData.lossReasons.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
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

        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Tendência Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="leads"
                      name="Leads"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="won"
                      name="Ganhos"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: '#22c55e' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Performance da Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {reportData.teamPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.teamPerformance} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                        horizontal={false}
                      />
                      <XAxis type="number" className="text-xs" />
                      <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="won" name="Ganhos" fill="#22c55e" stackId="a" />
                      <Bar dataKey="lost" name="Perdidos" fill="#ef4444" stackId="a" />
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
