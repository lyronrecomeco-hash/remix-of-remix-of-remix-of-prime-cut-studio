/**
 * CAKTO DASHBOARD - Métricas e gráficos
 * Layout organizado e profissional
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const chartData = analytics?.daily.map(day => ({
    date: format(new Date(day.date), 'dd/MM', { locale: ptBR }),
    checkouts: day.checkouts_started,
    aprovadas: day.purchases_approved,
    recusadas: day.purchases_refused,
    receita: Number(day.total_revenue),
  })) || [];

  const pieData = [
    { name: 'Aprovadas', value: analytics?.purchases_approved || 0, color: '#10b981' },
    { name: 'Recusadas', value: analytics?.purchases_refused || 0, color: '#ef4444' },
    { name: 'Reembolsos', value: analytics?.purchases_refunded || 0, color: '#f97316' },
    { name: 'Abandonos', value: analytics?.cart_abandonments || 0, color: '#eab308' },
  ].filter(d => d.value > 0);

  if (integrationLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          Configure a integração Cakto para ver as métricas
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
        <KPICard 
          label="Checkouts" 
          value={analytics?.checkouts_started || 0} 
          icon={ShoppingCart}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
        />
        <KPICard 
          label="Aprovadas" 
          value={analytics?.purchases_approved || 0} 
          icon={CheckCircle2}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-500"
          valueColor="text-emerald-600"
        />
        <KPICard 
          label="Conversão" 
          value={formatPercent(analytics?.conversion_rate || 0)} 
          icon={TrendingUp}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
        />
        <KPICard 
          label="Receita" 
          value={formatCurrency(analytics?.total_revenue || 0)} 
          icon={DollarSign}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-500"
          valueColor="text-emerald-600"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Evolução</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="checkouts" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.1}
                      strokeWidth={2}
                      name="Checkouts"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="aprovadas" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.2}
                      strokeWidth={2}
                      name="Aprovadas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Sem dados no período
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Distribuição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
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
                  Sem dados
                </div>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards Secundários */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Recusadas" 
          value={analytics?.purchases_refused || 0} 
          icon={XCircle}
          color="red"
        />
        <StatCard 
          label="Reembolsos" 
          value={analytics?.purchases_refunded || 0} 
          icon={RefreshCw}
          color="orange"
        />
        <StatCard 
          label="Abandonos" 
          value={analytics?.cart_abandonments || 0} 
          icon={Clock}
          color="yellow"
        />
        <StatCard 
          label="Ticket Médio" 
          value={analytics?.purchases_approved 
            ? formatCurrency((analytics.total_revenue || 0) / analytics.purchases_approved)
            : formatCurrency(0)
          } 
          icon={DollarSign}
          color="emerald"
        />
      </div>
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}

function KPICard({ label, value, icon: Icon, iconBg, iconColor, valueColor }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${valueColor || ''}`}>{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Stat Card Component  
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: 'red' | 'orange' | 'yellow' | 'emerald';
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    red: {
      bg: 'bg-red-500/5 border-red-500/20',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
    },
    orange: {
      bg: 'bg-orange-500/5 border-orange-500/20',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
    },
    yellow: {
      bg: 'bg-yellow-500/5 border-yellow-500/20',
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
    },
    emerald: {
      bg: 'bg-emerald-500/5 border-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
    },
  };

  const classes = colorClasses[color];

  return (
    <Card className={classes.bg}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl ${classes.iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${classes.iconColor}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
