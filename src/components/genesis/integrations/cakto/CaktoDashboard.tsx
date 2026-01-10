/**
 * CAKTO DASHBOARD - Métricas e gráficos
 * Componente limpo sem tabs próprias (tabs são do CaktoPanel pai)
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  TrendingUp,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { useCaktoIntegration } from './hooks/useCaktoIntegration';
import { useCaktoAnalytics } from './hooks/useCaktoAnalytics';
import { AnalyticsPeriod } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CaktoDashboardProps {
  instanceId: string;
}

export function CaktoDashboard({ instanceId }: CaktoDashboardProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');

  const { integration, loading: integrationLoading, isConnected } = useCaktoIntegration(instanceId);
  const { data: analytics, loading: analyticsLoading } = useCaktoAnalytics(instanceId, integration?.id, period);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Dados para o gráfico de área
  const chartData = analytics?.daily.map(day => ({
    date: format(new Date(day.date), 'dd/MM', { locale: ptBR }),
    checkouts: day.checkouts_started,
    aprovadas: day.purchases_approved,
    recusadas: day.purchases_refused,
    receita: Number(day.total_revenue),
  })) || [];

  // Dados para o gráfico de pizza
  const pieData = [
    { name: 'Aprovadas', value: analytics?.purchases_approved || 0, color: '#22c55e' },
    { name: 'Recusadas', value: analytics?.purchases_refused || 0, color: '#ef4444' },
    { name: 'Reembolsos', value: analytics?.purchases_refunded || 0, color: '#f97316' },
    { name: 'Abandonos', value: analytics?.cart_abandonments || 0, color: '#eab308' },
  ].filter(d => d.value > 0);

  if (integrationLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          Configure a integração Cakto primeiro para ver as métricas
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seletor de período */}
      <div className="flex gap-2">
        {(['today', '7d', '30d'] as AnalyticsPeriod[]).map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {p === 'today' ? 'Hoje' : p === '7d' ? '7 dias' : '30 dias'}
          </Button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Checkouts</p>
                <p className="text-2xl font-bold">{analytics?.checkouts_started || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{analytics?.purchases_approved || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversão</p>
                <p className="text-2xl font-bold">{formatPercent(analytics?.conversion_rate || 0)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics?.total_revenue || 0)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Evolução</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
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
                      dataKey="checkouts" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.2}
                      name="Checkouts"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="aprovadas" 
                      stackId="2"
                      stroke="#22c55e" 
                      fill="#22c55e" 
                      fillOpacity={0.4}
                      name="Aprovadas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Sem dados no período</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribuição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Sem dados</p>
                </div>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards Secundários */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recusadas</p>
              <p className="text-xl font-bold">{analytics?.purchases_refused || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reembolsos</p>
              <p className="text-xl font-bold">{analytics?.purchases_refunded || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Abandonos</p>
              <p className="text-xl font-bold">{analytics?.cart_abandonments || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-xl font-bold">
                {analytics?.purchases_approved 
                  ? formatCurrency((analytics.total_revenue || 0) / analytics.purchases_approved)
                  : formatCurrency(0)
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
