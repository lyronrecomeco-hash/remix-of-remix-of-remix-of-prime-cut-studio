/**
 * CAKTO DASHBOARD - ENTERPRISE
 * Dashboard completo com métricas reais da integração Cakto
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ShoppingCart,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
  Settings2,
  Play,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useCaktoIntegration } from './hooks/useCaktoIntegration';
import { useCaktoAnalytics } from './hooks/useCaktoAnalytics';
import { useCaktoEvents } from './hooks/useCaktoEvents';
import { CaktoEventRules } from './CaktoEventRules';
import { CaktoEventsLog } from './CaktoEventsLog';
import { CaktoSimulator } from './CaktoSimulator';
import { CaktoConfigModal } from './CaktoConfigModal';
import { AnalyticsPeriod, CAKTO_EVENT_LABELS, CAKTO_EVENT_COLORS } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import caktoLogo from '@/assets/integrations/cakto-logo.png';

interface CaktoDashboardProps {
  instanceId: string;
  onBack?: () => void;
}

export function CaktoDashboard({ instanceId, onBack }: CaktoDashboardProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [showConfig, setShowConfig] = useState(false);

  const { integration, loading: integrationLoading, isConnected, refetch: refetchIntegration } = useCaktoIntegration(instanceId);
  const { data: analytics, loading: analyticsLoading, refetch: refetchAnalytics } = useCaktoAnalytics(instanceId, integration?.id, period);

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

  // Não conectado
  if (!integrationLoading && !isConnected) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white border-2 flex items-center justify-center shadow-sm">
              <img src={caktoLogo} alt="Cakto" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Cakto</h2>
              <p className="text-muted-foreground">Plataforma de vendas digitais</p>
            </div>
          </div>
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              Voltar
            </Button>
          )}
        </div>

        {/* CTA de conexão */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
              <img src={caktoLogo} alt="Cakto" className="w-14 h-14 object-contain opacity-60" />
            </div>
            <h3 className="text-xl font-semibold">Conecte sua conta Cakto</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Integre sua conta da Cakto para receber eventos de vendas e disparar campanhas automaticamente via WhatsApp.
            </p>
            <Button onClick={() => setShowConfig(true)} className="gap-2 mt-2">
              <Play className="w-4 h-4" />
              Conectar Cakto
            </Button>
          </CardContent>
        </Card>

        <CaktoConfigModal
          isOpen={showConfig}
          onClose={() => setShowConfig(false)}
          instanceId={instanceId}
          existingIntegration={null}
          onSuccess={refetchIntegration}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white border-2 flex items-center justify-center shadow-sm">
            <img src={caktoLogo} alt="Cakto" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Cakto</h2>
              <Badge variant="default" className="bg-green-500/20 text-green-600 border-green-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Conectado
              </Badge>
            </div>
            <p className="text-muted-foreground">Plataforma de vendas digitais</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowConfig(true)}>
            <Settings2 className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              Voltar
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-1.5">
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Regras</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Eventos</span>
          </TabsTrigger>
          <TabsTrigger value="simulator" className="gap-1.5">
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Simular</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Period selector */}
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

          {/* Stats Cards */}
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
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="mt-6">
          <CaktoEventRules 
            instanceId={instanceId} 
            integrationId={integration?.id}
          />
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="mt-6">
          <CaktoEventsLog instanceId={instanceId} />
        </TabsContent>

        {/* Simulator Tab */}
        <TabsContent value="simulator" className="mt-6">
          <CaktoSimulator 
            instanceId={instanceId}
            integrationId={integration?.id}
          />
        </TabsContent>
      </Tabs>

      {/* Config Modal */}
      <CaktoConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        instanceId={instanceId}
        existingIntegration={integration}
        onSuccess={refetchIntegration}
      />
    </div>
  );
}
