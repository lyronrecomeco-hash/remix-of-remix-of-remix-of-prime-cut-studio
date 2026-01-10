/**
 * CAKTO DASHBOARD - Métricas e gráficos estilo admin
 * Layout profissional: Métricas no TOPO, Gráficos interativos abaixo
 */

import { useState, useMemo } from 'react';
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
  BarChart3,
} from 'lucide-react';
import { useCaktoIntegration } from './hooks/useCaktoIntegration';
import { useCaktoAnalytics } from './hooks/useCaktoAnalytics';
import { AnalyticsPeriod } from './types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CaktoDashboardProps {
  instanceId: string;
}

// Dados de exemplo interativos (estilo admin)
const generateDemoData = () => {
  const days = 7;
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const checkouts = Math.floor(Math.random() * 80) + 20;
    const aprovadas = Math.floor(checkouts * (0.5 + Math.random() * 0.3));
    data.push({
      day: format(date, 'EEE', { locale: ptBR }),
      date: format(date, 'dd/MM', { locale: ptBR }),
      checkouts,
      aprovadas,
      receita: aprovadas * (97 + Math.floor(Math.random() * 200)),
    });
  }
  return data;
};

const demoPieData = [
  { name: 'Aprovadas', value: 65, color: '#10b981' },
  { name: 'Recusadas', value: 12, color: '#ef4444' },
  { name: 'Reembolsos', value: 5, color: '#f97316' },
  { name: 'Abandonos', value: 18, color: '#eab308' },
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

  // Dados para gráficos - usa reais ou demo
  const demoData = useMemo(() => generateDemoData(), []);
  
  const chartData = hasRealData 
    ? analytics?.daily.map(day => ({
        day: format(new Date(day.date), 'EEE', { locale: ptBR }),
        date: format(new Date(day.date), 'dd/MM', { locale: ptBR }),
        checkouts: day.checkouts_started,
        aprovadas: day.purchases_approved,
        receita: Number(day.total_revenue),
      })) || []
    : demoData;

  const pieData = hasRealData 
    ? [
        { name: 'Aprovadas', value: analytics?.purchases_approved || 0, color: '#10b981' },
        { name: 'Recusadas', value: analytics?.purchases_refused || 0, color: '#ef4444' },
        { name: 'Reembolsos', value: analytics?.purchases_refunded || 0, color: '#f97316' },
        { name: 'Abandonos', value: analytics?.cart_abandonments || 0, color: '#eab308' },
      ].filter(d => d.value > 0)
    : demoPieData;

  // Loading State
  if (integrationLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
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
        <CardContent className="py-12 text-center">
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
    : hasRealData ? 0 : 147.50;

  // Métricas demo se não houver dados reais
  const metrics = {
    checkouts: hasRealData ? analytics?.checkouts_started || 0 : 234,
    aprovadas: hasRealData ? analytics?.purchases_approved || 0 : 156,
    conversao: hasRealData ? analytics?.conversion_rate || 0 : 66.7,
    receita: hasRealData ? analytics?.total_revenue || 0 : 22990,
    recusadas: hasRealData ? analytics?.purchases_refused || 0 : 28,
    reembolsos: hasRealData ? analytics?.purchases_refunded || 0 : 8,
    abandonos: hasRealData ? analytics?.cart_abandonments || 0 : 42,
    ticketMedio: hasRealData ? ticketMedio : 147.50,
  };

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════════
          SELETOR DE PERÍODO
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Dashboard de Vendas</h3>
          {!hasRealData && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Dados de exemplo
            </span>
          )}
        </div>
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
          {(['today', '7d', '30d'] as AnalyticsPeriod[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod(p)}
              className="h-8 px-3 text-sm font-medium"
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
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            label="Checkouts" 
            value={metrics.checkouts} 
            icon={ShoppingCart}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
          />
          <MetricCard 
            label="Aprovadas" 
            value={metrics.aprovadas} 
            icon={CheckCircle2}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500/10"
            valueColor="text-emerald-600"
          />
          <MetricCard 
            label="Conversão" 
            value={formatPercent(metrics.conversao)} 
            icon={Percent}
            iconColor="text-purple-500"
            iconBg="bg-purple-500/10"
          />
          <MetricCard 
            label="Receita" 
            value={formatCurrency(metrics.receita)} 
            icon={DollarSign}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500/10"
            valueColor="text-emerald-600"
          />
        </div>

        {/* Métricas Secundárias */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mt-3">
          <MetricCardSecondary 
            label="Recusadas" 
            value={metrics.recusadas} 
            icon={XCircle}
            color="red"
          />
          <MetricCardSecondary 
            label="Reembolsos" 
            value={metrics.reembolsos} 
            icon={RefreshCw}
            color="orange"
          />
          <MetricCardSecondary 
            label="Abandonos" 
            value={metrics.abandonos} 
            icon={Clock}
            color="yellow"
          />
          <MetricCardSecondary 
            label="Ticket Médio" 
            value={formatCurrency(metrics.ticketMedio)} 
            icon={TrendingUp}
            color="emerald"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BLOCO 2: GRÁFICOS ESTILO ADMIN (BarChart)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Gráfico de Barras - Receita (2/3) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Receita dos Últimos 7 Dias
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                  />
                  <Bar 
                    dataKey="receita" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição (1/3) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              Status das Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
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
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legenda */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-sm">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
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
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold ${valueColor || ''}`}>{value}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
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
    <Card className={`${classes.border} bg-card/50 hover:shadow-sm transition-shadow`}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${classes.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${classes.iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-bold truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
