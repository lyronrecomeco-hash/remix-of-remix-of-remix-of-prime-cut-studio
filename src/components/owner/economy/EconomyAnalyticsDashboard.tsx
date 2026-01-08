/**
 * Economy Analytics Dashboard - Owner Panel
 * Visual dashboard with charts and metrics
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Coins,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import {
  useEconomyPlans,
  useEconomyStats,
  useConsumptionLogs,
  useUserSubscriptions,
} from '@/hooks/useGenesisEconomy';
import { cn } from '@/lib/utils';

// Mock data for charts (replace with real data)
const revenueData = [
  { date: '01/01', mrr: 2500, credits: 450 },
  { date: '08/01', mrr: 2800, credits: 520 },
  { date: '15/01', mrr: 3100, credits: 480 },
  { date: '22/01', mrr: 3400, credits: 600 },
  { date: '29/01', mrr: 3800, credits: 550 },
  { date: '05/02', mrr: 4200, credits: 720 },
];

const consumptionData = [
  { name: 'WhatsApp Enviado', value: 4500, color: '#22c55e' },
  { name: 'WhatsApp Recebido', value: 3200, color: '#3b82f6' },
  { name: 'IA (Luna)', value: 1800, color: '#8b5cf6' },
  { name: 'Flow Execution', value: 1200, color: '#f59e0b' },
  { name: 'Webhooks', value: 600, color: '#ef4444' },
];

const planDistribution = [
  { name: 'Free', value: 120, color: '#94a3b8' },
  { name: 'Starter', value: 45, color: '#3b82f6' },
  { name: 'Pro', value: 28, color: '#8b5cf6' },
  { name: 'Enterprise', value: 8, color: '#f59e0b' },
];

export default function EconomyAnalyticsDashboard() {
  const [period, setPeriod] = useState('30d');
  const { data: plans } = useEconomyPlans();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useEconomyStats();
  const { data: logs } = useConsumptionLogs({ limit: 100 });
  const { data: subscriptions } = useUserSubscriptions();

  // Calculate some metrics
  const totalUsers = subscriptions?.length || 0;
  const activeUsers = subscriptions?.filter(s => s.status === 'active').length || 0;
  const churnRate = totalUsers > 0 ? ((totalUsers - activeUsers) / totalUsers * 100).toFixed(1) : '0';

  const StatCard = ({ 
    title, 
    value, 
    change, 
    changeType = 'positive',
    icon: Icon,
    color = 'primary'
  }: {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    color?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              {change && (
                <div className={cn(
                  "flex items-center gap-1 mt-2 text-sm",
                  changeType === 'positive' && "text-green-600",
                  changeType === 'negative' && "text-red-600",
                  changeType === 'neutral' && "text-muted-foreground"
                )}>
                  {changeType === 'positive' && <ArrowUpRight className="w-4 h-4" />}
                  {changeType === 'negative' && <ArrowDownRight className="w-4 h-4" />}
                  <span>{change}</span>
                </div>
              )}
            </div>
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              color === 'primary' && "bg-primary/10 text-primary",
              color === 'green' && "bg-green-500/10 text-green-600",
              color === 'blue' && "bg-blue-500/10 text-blue-600",
              color === 'purple' && "bg-purple-500/10 text-purple-600",
              color === 'amber' && "bg-amber-500/10 text-amber-600"
            )}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Analytics & Economia
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Métricas de receita, consumo e conversão em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetchStats()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="MRR (Receita Mensal)"
          value={`R$ ${(stats?.mrr || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change="+12.5% vs mês anterior"
          changeType="positive"
          icon={CreditCard}
          color="green"
        />
        <StatCard
          title="Assinaturas Ativas"
          value={stats?.totalActiveSubscriptions || 0}
          change="+8 novas este mês"
          changeType="positive"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Créditos Consumidos"
          value={(stats?.totalCreditsConsumed || 0).toLocaleString()}
          change="Últimos 30 dias"
          changeType="neutral"
          icon={Coins}
          color="purple"
        />
        <StatCard
          title="Taxa de Churn"
          value={`${churnRate}%`}
          change="-2.1% vs mês anterior"
          changeType="positive"
          icon={Activity}
          color="amber"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Receita por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="mrr" name="MRR" stroke="#22c55e" fillOpacity={1} fill="url(#colorMrr)" />
                <Area type="monotone" dataKey="credits" name="Créditos" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCredits)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Consumption by Action */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" />
              Consumo por Ação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={consumptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {consumptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Distribuição de Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={planDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Funil de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Visitantes', value: 1000, percent: 100, color: 'bg-slate-500' },
              { label: 'Cadastros', value: 250, percent: 25, color: 'bg-blue-500' },
              { label: 'Trial', value: 120, percent: 48, color: 'bg-purple-500' },
              { label: 'Conversão', value: 45, percent: 37.5, color: 'bg-green-500' },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value} ({item.percent}%)</span>
                </div>
                <Progress value={item.percent} className={cn("h-2", item.color)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Alertas de Limite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { user: 'Empresa XYZ', usage: 92, plan: 'Pro' },
              { user: 'Startup ABC', usage: 85, plan: 'Starter' },
              { user: 'Loja 123', usage: 78, plan: 'Free' },
            ].map((alert, i) => (
              <div key={i} className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{alert.user}</span>
                  <Badge variant="outline" className="text-xs">{alert.plan}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={alert.usage} className="flex-1 h-1.5" />
                  <span className={cn(
                    "text-xs font-medium",
                    alert.usage >= 90 ? "text-red-500" : "text-amber-500"
                  )}>
                    {alert.usage}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Consumo Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs?.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{log.action_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono">
                  -{Number(log.credits_consumed).toFixed(1)} G
                </Badge>
              </div>
            ))}
            {(!logs || logs.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum consumo registrado ainda
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
