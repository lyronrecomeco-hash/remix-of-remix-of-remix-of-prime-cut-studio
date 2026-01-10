/**
 * CAKTO DASHBOARD - Métricas e gráficos
 * Layout compacto e responsivo
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
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Configure a integração Cakto para ver as métricas
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Seletor de período */}
      <div className="flex gap-1">
        {(['today', '7d', '30d'] as AnalyticsPeriod[]).map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'ghost'}
            size="sm"
            className="h-6 px-2.5 text-[10px]"
            onClick={() => setPeriod(p)}
          >
            {p === 'today' ? 'Hoje' : p === '7d' ? '7 dias' : '30 dias'}
          </Button>
        ))}
      </div>

      {/* KPI Cards - Grid compacto */}
      <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
        <KPICard 
          label="Checkouts" 
          value={analytics?.checkouts_started || 0} 
          icon={ShoppingCart}
          color="blue"
        />
        <KPICard 
          label="Aprovadas" 
          value={analytics?.purchases_approved || 0} 
          icon={CheckCircle2}
          color="emerald"
        />
        <KPICard 
          label="Conversão" 
          value={formatPercent(analytics?.conversion_rate || 0)} 
          icon={TrendingUp}
          color="purple"
          isText
        />
        <KPICard 
          label="Receita" 
          value={formatCurrency(analytics?.total_revenue || 0)} 
          icon={DollarSign}
          color="emerald"
          isText
        />
      </div>

      {/* Charts - Grid responsivo */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Area Chart */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Evolução</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="h-[180px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={25} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '11px',
                        padding: '6px 8px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="checkouts" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.1}
                      strokeWidth={1.5}
                      name="Checkouts"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="aprovadas" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.2}
                      strokeWidth={1.5}
                      name="Aprovadas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Sem dados no período
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-border/60">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Distribuição</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="h-[140px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Sem dados
                </div>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1 text-[9px]">
                  <div 
                    className="w-1.5 h-1.5 rounded-full" 
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
      <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
        <MiniStatCard 
          label="Recusadas" 
          value={analytics?.purchases_refused || 0} 
          icon={XCircle}
          color="red"
        />
        <MiniStatCard 
          label="Reembolsos" 
          value={analytics?.purchases_refunded || 0} 
          icon={RefreshCw}
          color="orange"
        />
        <MiniStatCard 
          label="Abandonos" 
          value={analytics?.cart_abandonments || 0} 
          icon={Clock}
          color="yellow"
        />
        <MiniStatCard 
          label="Ticket Médio" 
          value={analytics?.purchases_approved 
            ? formatCurrency((analytics.total_revenue || 0) / analytics.purchases_approved)
            : formatCurrency(0)
          } 
          icon={DollarSign}
          color="emerald"
          isText
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
  color: 'blue' | 'emerald' | 'purple' | 'red' | 'orange' | 'yellow';
  isText?: boolean;
}

function KPICard({ label, value, icon: Icon, color, isText }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    purple: 'bg-purple-500/10 text-purple-500',
    red: 'bg-red-500/10 text-red-500',
    orange: 'bg-orange-500/10 text-orange-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
  };

  return (
    <Card className="border-border/60">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground truncate">{label}</p>
            <p className={`text-lg font-bold truncate ${color === 'emerald' ? 'text-emerald-500' : ''}`}>
              {value}
            </p>
          </div>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClasses[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini Stat Card Component  
function MiniStatCard({ label, value, icon: Icon, color, isText }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };

  return (
    <Card className={`${colorClasses[color]} bg-opacity-5`}>
      <CardContent className="p-2.5 flex items-center gap-2">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] text-muted-foreground truncate">{label}</p>
          <p className="text-sm font-semibold truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
