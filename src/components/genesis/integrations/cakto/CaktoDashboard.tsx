/**
 * CAKTO DASHBOARD - Métricas e gráficos estilo admin
 * Layout profissional: Métricas no TOPO, Gráficos interativos abaixo
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Activity,
  User,
  Phone,
  Package,
} from 'lucide-react';
import { useCaktoIntegration } from './hooks/useCaktoIntegration';
import { useCaktoAnalytics } from './hooks/useCaktoAnalytics';
import { useCaktoEvents } from './hooks/useCaktoEvents';
import { AnalyticsPeriod, CAKTO_EVENT_LABELS, CAKTO_EVENT_COLORS, CaktoEventType } from './types';
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
import { format, subDays, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CaktoDashboardProps {
  instanceId: string;
}

// Observação: este dashboard exibe APENAS números reais coletados pela integração.
// Se ainda não houver eventos recebidos, os valores serão 0.

export function CaktoDashboard({ instanceId }: CaktoDashboardProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');

  const { integration, loading: integrationLoading, isConnected } = useCaktoIntegration(instanceId);
  const { data: analytics, loading: analyticsLoading, refetch: refetchAnalytics } = useCaktoAnalytics(instanceId, integration?.id, period);
  const { events, loading: eventsLoading, refetch: refetchEvents } = useCaktoEvents(instanceId, { limit: 10 });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const hasAnyData = !!analytics?.daily?.length;

  const chartData = useMemo(() => {
    const daily = analytics?.daily || [];
    if (!daily.length) return [];

    return daily.map(day => ({
      day: format(new Date(day.date), 'EEE', { locale: ptBR }),
      date: format(new Date(day.date), 'dd/MM', { locale: ptBR }),
      checkouts: day.checkouts_started,
      aprovadas: day.purchases_approved,
      receita: Number(day.total_revenue),
    }));
  }, [analytics?.daily]);

  const pieData = useMemo(() => {
    const approved = analytics?.purchases_approved || 0;
    const refused = analytics?.purchases_refused || 0;
    const refunded = analytics?.purchases_refunded || 0;
    const abandoned = analytics?.cart_abandonments || 0;

    return [
      { name: 'Aprovadas', value: approved, color: 'hsl(var(--success))' },
      { name: 'Recusadas', value: refused, color: 'hsl(var(--destructive))' },
      { name: 'Reembolsos', value: refunded, color: 'hsl(var(--warning))' },
      { name: 'Abandonos', value: abandoned, color: 'hsl(var(--muted-foreground))' },
    ].filter(d => d.value > 0);
  }, [analytics]);

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

  const ticketMedio = (analytics?.purchases_approved || 0) > 0
    ? (analytics?.total_revenue || 0) / (analytics?.purchases_approved || 1)
    : 0;

  const metrics = {
    checkouts: analytics?.checkouts_started || 0,
    aprovadas: analytics?.purchases_approved || 0,
    conversao: analytics?.conversion_rate || 0,
    receita: analytics?.total_revenue || 0,
    recusadas: analytics?.purchases_refused || 0,
    reembolsos: analytics?.purchases_refunded || 0,
    abandonos: analytics?.cart_abandonments || 0,
    ticketMedio,
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
          {!hasAnyData && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Aguardando eventos
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
                Receita do Período
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Nenhum evento recebido no período selecionado.
                </div>
              ) : (
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
              )}
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

      {/* ═══════════════════════════════════════════════════════════════
          ÚLTIMOS EVENTOS EM TEMPO REAL
      ═══════════════════════════════════════════════════════════════ */}
      <section className="mt-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Últimos Eventos
                {events.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{events.length}</Badge>
                )}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { refetchEvents(); refetchAnalytics(); }}
                disabled={eventsLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${eventsLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {eventsLoading && events.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum evento recebido ainda</p>
                <p className="text-sm mt-1">Os eventos aparecerão aqui em tempo real</p>
              </div>
            ) : (
              <ScrollArea className="h-[280px]">
                <div className="space-y-2">
                  {events.map((event) => {
                    const eventColors = CAKTO_EVENT_COLORS[event.event_type as CaktoEventType] || {
                      bg: 'bg-muted',
                      text: 'text-muted-foreground',
                      border: 'border-muted',
                    };
                    const EventIcon = event.event_type === 'purchase_approved' ? CheckCircle2 :
                                      event.event_type === 'purchase_refused' ? XCircle :
                                      event.event_type === 'initiate_checkout' ? ShoppingCart :
                                      event.event_type === 'checkout_abandonment' ? Clock :
                                      RefreshCw;

                    return (
                      <div 
                        key={event.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg border ${eventColors.border} ${eventColors.bg} bg-opacity-30`}
                      >
                        <div className={`w-9 h-9 rounded-lg ${eventColors.bg} flex items-center justify-center flex-shrink-0`}>
                          <EventIcon className={`w-4 h-4 ${eventColors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {CAKTO_EVENT_LABELS[event.event_type as CaktoEventType] || event.event_type}
                            </span>
                            {event.processed && (
                              <Badge variant="outline" className="text-xs">Processado</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            {event.customer_name && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {event.customer_name}
                              </span>
                            )}
                            {event.product_name && (
                              <span className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {event.product_name}
                              </span>
                            )}
                            {event.order_value && (
                              <span className="font-semibold text-primary">
                                R$ {(event.order_value / 100).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
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
