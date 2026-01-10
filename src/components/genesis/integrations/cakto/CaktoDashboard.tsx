/**
 * CAKTO DASHBOARD - Métricas e gráficos
 * Layout profissional: Métricas no TOPO, Gráficos interativos abaixo
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
  AlertCircle,
  Percent,
} from 'lucide-react';
import { useCaktoIntegration } from './hooks/useCaktoIntegration';
import { useCaktoAnalytics } from './hooks/useCaktoAnalytics';
import { AnalyticsPeriod } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CaktoDashboardProps {
  instanceId: string;
}

// Dados placeholder para gráficos quando não há dados reais
const generatePlaceholderData = () => {
  const days = 7;
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, 'dd/MM', { locale: ptBR }),
      checkouts: Math.floor(Math.random() * 50) + 10,
      aprovadas: Math.floor(Math.random() * 30) + 5,
      recusadas: Math.floor(Math.random() * 10),
      receita: Math.floor(Math.random() * 5000) + 500,
    });
  }
  return data;
};

const placeholderPieData = [
  { name: 'Aprovadas', value: 65, color: '#10b981' },
  { name: 'Recusadas', value: 15, color: '#ef4444' },
  { name: 'Reembolsos', value: 8, color: '#f97316' },
  { name: 'Abandonos', value: 12, color: '#eab308' },
];

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

  const hasRealData = analytics && (
    analytics.checkouts_started > 0 || 
    analytics.purchases_approved > 0 || 
    analytics.total_revenue > 0
  );

  const chartData = hasRealData 
    ? analytics?.daily.map(day => ({
        date: format(new Date(day.date), 'dd/MM', { locale: ptBR }),
        checkouts: day.checkouts_started,
        aprovadas: day.purchases_approved,
        recusadas: day.purchases_refused,
        receita: Number(day.total_revenue),
      })) || []
    : generatePlaceholderData();

  const pieData = hasRealData 
    ? [
        { name: 'Aprovadas', value: analytics?.purchases_approved || 0, color: '#10b981' },
        { name: 'Recusadas', value: analytics?.purchases_refused || 0, color: '#ef4444' },
        { name: 'Reembolsos', value: analytics?.purchases_refunded || 0, color: '#f97316' },
        { name: 'Abandonos', value: analytics?.cart_abandonments || 0, color: '#eab308' },
      ].filter(d => d.value > 0)
    : placeholderPieData;

  // Loading State
  if (integrationLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-base text-muted-foreground">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  // Not Connected State
  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg text-muted-foreground">
            Configure a integração Cakto para ver as métricas
          </p>
        </CardContent>
      </Card>
    );
  }

  const ticketMedio = analytics?.purchases_approved 
    ? (analytics.total_revenue || 0) / analytics.purchases_approved
    : 0;

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════════════
          SELETOR DE PERÍODO
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Período de Análise</h3>
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
          {(['today', '7d', '30d'] as AnalyticsPeriod[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod(p)}
              className="h-9 px-4 text-sm font-medium"
            >
              {p === 'today' ? 'Hoje' : p === '7d' ? '7 dias' : '30 dias'}
            </Button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          BLOCO 1: MÉTRICAS PRINCIPAIS (PRIMEIRA DOBRA)
      ═══════════════════════════════════════════════════════════════ */}
      <section>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            label="Checkouts" 
            value={analytics?.checkouts_started || 0} 
            icon={ShoppingCart}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
          />
          <MetricCard 
            label="Aprovadas" 
            value={analytics?.purchases_approved || 0} 
            icon={CheckCircle2}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500/10"
            valueColor="text-emerald-600"
          />
          <MetricCard 
            label="Conversão" 
            value={formatPercent(analytics?.conversion_rate || 0)} 
            icon={Percent}
            iconColor="text-purple-500"
            iconBg="bg-purple-500/10"
          />
          <MetricCard 
            label="Receita" 
            value={formatCurrency(analytics?.total_revenue || 0)} 
            icon={DollarSign}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500/10"
            valueColor="text-emerald-600"
          />
        </div>

        {/* Métricas Secundárias */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mt-4">
          <MetricCardSecondary 
            label="Recusadas" 
            value={analytics?.purchases_refused || 0} 
            icon={XCircle}
            color="red"
          />
          <MetricCardSecondary 
            label="Reembolsos" 
            value={analytics?.purchases_refunded || 0} 
            icon={RefreshCw}
            color="orange"
          />
          <MetricCardSecondary 
            label="Abandonos" 
            value={analytics?.cart_abandonments || 0} 
            icon={Clock}
            color="yellow"
          />
          <MetricCardSecondary 
            label="Ticket Médio" 
            value={formatCurrency(ticketMedio)} 
            icon={TrendingUp}
            color="emerald"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BLOCO 2: GRÁFICOS (SEGUNDA DOBRA)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico de Evolução - Principal (2/3 do espaço) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Evolução
              </CardTitle>
              {!hasRealData && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  Dados de exemplo
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCheckouts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAprovadas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 13 }} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 13 }} 
                    tickLine={false} 
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '10px',
                      fontSize: '14px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      padding: '12px 16px',
                    }}
                    cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="checkouts" 
                    stroke="#3b82f6" 
                    fill="url(#colorCheckouts)"
                    strokeWidth={2.5}
                    name="Checkouts"
                    dot={false}
                    activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="aprovadas" 
                    stroke="#10b981" 
                    fill="url(#colorAprovadas)"
                    strokeWidth={2.5}
                    name="Aprovadas"
                    dot={false}
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição - Secundário (1/3 do espaço) */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Percent className="w-5 h-5 text-primary" />
                Distribuição
              </CardTitle>
              {!hasRealData && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  Exemplo
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '10px',
                      fontSize: '14px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legenda */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-3">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                  <span className="font-semibold">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

// Metric Card Principal
interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  valueColor?: string;
}

function MetricCard({ label, value, icon: Icon, iconColor, iconBg, valueColor }: MetricCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold ${valueColor || ''}`}>{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Metric Card Secundário
interface MetricCardSecondaryProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: 'red' | 'orange' | 'yellow' | 'emerald';
}

function MetricCardSecondary({ label, value, icon: Icon, color }: MetricCardSecondaryProps) {
  const colorClasses = {
    red: {
      border: 'border-red-500/20',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
    },
    orange: {
      border: 'border-orange-500/20',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
    },
    yellow: {
      border: 'border-yellow-500/20',
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
    },
    emerald: {
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
    },
  };

  const classes = colorClasses[color];

  return (
    <Card className={`${classes.border} bg-card/50 hover:shadow-md transition-shadow`}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl ${classes.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${classes.iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
