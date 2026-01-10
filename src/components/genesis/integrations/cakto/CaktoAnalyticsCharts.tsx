/**
 * CAKTO ANALYTICS CHARTS - Gráficos de performance
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, DollarSign, ShoppingCart, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useCaktoAnalytics } from './hooks/useCaktoAnalytics';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CaktoAnalyticsChartsProps {
  instanceId: string;
  period?: 'today' | '7d' | '30d';
}

const COLORS = {
  checkouts: 'hsl(var(--primary))',
  approved: '#22c55e',
  refused: '#ef4444',
  refunded: '#f97316',
  abandoned: '#eab308',
};

export function CaktoAnalyticsCharts({ instanceId, period = '7d' }: CaktoAnalyticsChartsProps) {
  const { data, loading } = useCaktoAnalytics(instanceId, undefined, period);
  const analytics = data?.daily || [];

  const totals = useMemo(() => {
    if (!analytics || analytics.length === 0) {
      return {
        checkouts: 0,
        approved: 0,
        refused: 0,
        refunded: 0,
        abandoned: 0,
        revenue: 0,
        conversionRate: 0,
      };
    }

    const sums = analytics.reduce((acc, day) => ({
      checkouts: acc.checkouts + (day.checkouts_started || 0),
      approved: acc.approved + (day.purchases_approved || 0),
      refused: acc.refused + (day.purchases_refused || 0),
      refunded: acc.refunded + (day.purchases_refunded || 0),
      abandoned: acc.abandoned + (day.cart_abandonments || 0),
      revenue: acc.revenue + Number(day.total_revenue || 0),
    }), { checkouts: 0, approved: 0, refused: 0, refunded: 0, abandoned: 0, revenue: 0 });

    const conversionRate = sums.checkouts > 0 
      ? ((sums.approved / sums.checkouts) * 100).toFixed(1) 
      : '0';

    return { ...sums, conversionRate: Number(conversionRate) };
  }, [analytics]);

  const chartData = useMemo(() => {
    if (!analytics) return [];
    
    return analytics.map(day => ({
      date: format(parseISO(day.date), 'dd/MM', { locale: ptBR }),
      fullDate: day.date,
      checkouts: day.checkouts_started || 0,
      aprovadas: day.purchases_approved || 0,
      recusadas: day.purchases_refused || 0,
      reembolsos: day.purchases_refunded || 0,
      abandonos: day.cart_abandonments || 0,
      receita: Number(day.total_revenue || 0),
    }));
  }, [analytics]);

  const pieData = useMemo(() => [
    { name: 'Aprovadas', value: totals.approved, color: COLORS.approved },
    { name: 'Recusadas', value: totals.refused, color: COLORS.refused },
    { name: 'Reembolsos', value: totals.refunded, color: COLORS.refunded },
    { name: 'Abandonos', value: totals.abandoned, color: COLORS.abandoned },
  ].filter(item => item.value > 0), [totals]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.checkouts}</p>
                <p className="text-xs text-muted-foreground">Checkouts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.approved}</p>
                <p className="text-xs text-muted-foreground">Aprovadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totals.revenue)}</p>
                <p className="text-xs text-muted-foreground">Receita</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Conversão</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Receita por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `R$${v}`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Receita']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="receita" 
                    stroke="#22c55e" 
                    fillOpacity={1} 
                    fill="url(#colorReceita)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Conversions Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vendas por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="aprovadas" name="Aprovadas" fill={COLORS.approved} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recusadas" name="Recusadas" fill={COLORS.refused} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribuição de Status</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumo do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-semibold">{totals.refused}</p>
                  <p className="text-xs text-muted-foreground">Compras Recusadas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-semibold">{totals.refunded}</p>
                  <p className="text-xs text-muted-foreground">Reembolsos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10">
                <ShoppingCart className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-semibold">{totals.abandoned}</p>
                  <p className="text-xs text-muted-foreground">Carrinhos Abandonados</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">
                    {totals.checkouts > 0 
                      ? ((totals.approved / totals.checkouts) * 100).toFixed(1) 
                      : '0'}%
                  </p>
                  <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
