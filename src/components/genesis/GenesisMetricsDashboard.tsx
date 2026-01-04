import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  AlertTriangle,
  Bell,
  BellOff,
  Activity,
  Heart,
  Clock,
  Zap,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardSummary {
  instances: {
    total: number;
    connected: number;
    disconnected: number;
  };
  alerts: {
    active: number;
    recent: Alert[];
  };
  metrics_24h: {
    messages_sent: number;
    messages_received: number;
    messages_failed: number;
    api_calls: number;
    disconnections: number;
  };
  health: {
    average_score: number;
    instances: RealtimeMetric[];
  };
}

interface Alert {
  id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  status: string;
  created_at: string;
  instance?: { id: string; name: string };
}

interface RealtimeMetric {
  instance_id: string;
  current_status: string;
  messages_today: number;
  health_score: number;
  health_factors: Record<string, number>;
  updated_at: string;
}

const SEVERITY_COLORS = {
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const SEVERITY_ICONS = {
  info: AlertCircle,
  warning: AlertTriangle,
  critical: XCircle,
};

export function GenesisMetricsDashboard() {
  const { genesisUser } = useGenesisAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!genesisUser) return;

    try {
      const { data, error } = await supabase.functions.invoke('genesis-metrics', {
        body: {
          action: 'get_dashboard_summary',
          user_id: genesisUser.id,
        },
      });

      if (error) throw error;
      if (data?.success) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [genesisUser]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    if (!genesisUser) return;
    
    try {
      await supabase.functions.invoke('genesis-metrics', {
        body: {
          action: 'acknowledge_alert',
          alert_id: alertId,
          user_id: genesisUser.id,
        },
      });
      fetchDashboard();
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await supabase.functions.invoke('genesis-metrics', {
        body: {
          action: 'dismiss_alert',
          alert_id: alertId,
        },
      });
      fetchDashboard();
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const healthColor = summary?.health.average_score 
    ? summary.health.average_score >= 80 
      ? 'text-green-500' 
      : summary.health.average_score >= 50 
        ? 'text-amber-500' 
        : 'text-red-500'
    : 'text-muted-foreground';

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BarChart3 className="w-7 h-7 text-primary" />
            </motion.div>
            Métricas & Alertas
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento em tempo real das suas instâncias
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          Atualizar
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Health Score"
          value={summary?.health.average_score || 0}
          suffix="%"
          icon={Heart}
          color={healthColor}
          delay={0}
        />
        <StatCard
          title="Mensagens Enviadas"
          value={summary?.metrics_24h.messages_sent || 0}
          subtitle="últimas 24h"
          icon={MessageSquare}
          color="text-blue-500"
          delay={100}
        />
        <StatCard
          title="Alertas Ativos"
          value={summary?.alerts.active || 0}
          icon={Bell}
          color={summary?.alerts.active ? "text-amber-500" : "text-green-500"}
          delay={200}
        />
        <StatCard
          title="Instâncias Online"
          value={`${summary?.instances.connected || 0}/${summary?.instances.total || 0}`}
          icon={Activity}
          color="text-green-500"
          delay={300}
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="w-4 h-4" />
            Alertas
            {summary?.alerts.active ? (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {summary.alerts.active}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-2">
            <Heart className="w-4 h-4" />
            Saúde
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Metrics Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Métricas 24h
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricRow 
                  label="Mensagens Enviadas" 
                  value={summary?.metrics_24h.messages_sent || 0} 
                  color="text-green-500"
                />
                <MetricRow 
                  label="Mensagens Recebidas" 
                  value={summary?.metrics_24h.messages_received || 0}
                  color="text-blue-500" 
                />
                <MetricRow 
                  label="Mensagens Falhas" 
                  value={summary?.metrics_24h.messages_failed || 0}
                  color="text-red-500" 
                />
                <MetricRow 
                  label="Chamadas de API" 
                  value={summary?.metrics_24h.api_calls || 0}
                  color="text-purple-500" 
                />
                <MetricRow 
                  label="Desconexões" 
                  value={summary?.metrics_24h.disconnections || 0}
                  color="text-amber-500" 
                />
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Alertas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.alerts.recent && summary.alerts.recent.length > 0 ? (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {summary.alerts.recent.slice(0, 5).map((alert) => (
                        <AlertItem
                          key={alert.id}
                          alert={alert}
                          onAcknowledge={handleAcknowledgeAlert}
                          onDismiss={handleDismissAlert}
                          compact
                        />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <BellOff className="w-10 h-10 mb-2 opacity-50" />
                    <p>Nenhum alerta ativo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Todos os Alertas
                </span>
                <Badge variant="outline">
                  {summary?.alerts.active || 0} ativos
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary?.alerts.recent && summary.alerts.recent.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {summary.alerts.recent.map((alert, index) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <AlertItem
                            alert={alert}
                            onAcknowledge={handleAcknowledgeAlert}
                            onDismiss={handleDismissAlert}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-16 h-16 mb-4 text-green-500/50" />
                  <p className="text-lg font-medium">Tudo tranquilo!</p>
                  <p className="text-sm">Nenhum alerta ativo no momento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Saúde das Instâncias
              </CardTitle>
              <CardDescription>
                Score de saúde calculado com base em conexão, falhas e latência
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summary?.health.instances && summary.health.instances.length > 0 ? (
                <div className="space-y-4">
                  {summary.health.instances.map((metric, index) => (
                    <HealthCard key={metric.instance_id} metric={metric} index={index} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Activity className="w-16 h-16 mb-4 opacity-50" />
                  <p>Nenhuma métrica disponível</p>
                  <p className="text-sm">Conecte uma instância para ver as métricas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components
function StatCard({ 
  title, 
  value, 
  subtitle, 
  suffix,
  icon: Icon, 
  color, 
  delay 
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  suffix?: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 }}
    >
      <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-1">
                {value}{suffix}
              </p>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                "bg-primary/10"
              )}
            >
              <Icon className={cn("w-6 h-6", color)} />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MetricRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("font-semibold", color)}>{value.toLocaleString()}</span>
    </div>
  );
}

function AlertItem({ 
  alert, 
  onAcknowledge, 
  onDismiss,
  compact = false 
}: { 
  alert: Alert; 
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
  compact?: boolean;
}) {
  const SeverityIcon = SEVERITY_ICONS[alert.severity];
  
  return (
    <div className={cn(
      "p-3 rounded-lg border",
      SEVERITY_COLORS[alert.severity]
    )}>
      <div className="flex items-start gap-3">
        <SeverityIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{alert.title}</span>
            {alert.instance && (
              <Badge variant="outline" className="text-xs">
                {alert.instance.name}
              </Badge>
            )}
          </div>
          {!compact && (
            <p className="text-sm opacity-80 mt-1">{alert.message}</p>
          )}
          <p className="text-xs opacity-60 mt-1">
            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
        {!compact && alert.status === 'active' && (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => onAcknowledge(alert.id)}
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => onDismiss(alert.id)}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function HealthCard({ metric, index }: { metric: RealtimeMetric; index: number }) {
  const healthColor = metric.health_score >= 80 
    ? 'text-green-500' 
    : metric.health_score >= 50 
      ? 'text-amber-500' 
      : 'text-red-500';

  const progressColor = metric.health_score >= 80 
    ? 'bg-green-500' 
    : metric.health_score >= 50 
      ? 'bg-amber-500' 
      : 'bg-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 rounded-lg border bg-card"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            metric.current_status === 'connected' ? 'bg-green-500' : 'bg-red-500'
          )} />
          <span className="font-medium">Instância</span>
          <Badge variant="outline" className="text-xs">
            {metric.current_status}
          </Badge>
        </div>
        <span className={cn("text-2xl font-bold", healthColor)}>
          {metric.health_score}%
        </span>
      </div>
      
      <Progress 
        value={metric.health_score} 
        className="h-2"
      />
      
      <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
        <span>{metric.messages_today} mensagens hoje</span>
        <span>
          Atualizado {formatDistanceToNow(new Date(metric.updated_at), { addSuffix: true, locale: ptBR })}
        </span>
      </div>
    </motion.div>
  );
}
