import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Server, 
  MessageSquare, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Clock,
  Wifi,
  WifiOff,
  Bot,
  Send,
  Webhook
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface StatusData {
  instances: {
    total: number;
    connected: number;
    disconnected: number;
    connecting: number;
  };
  automations: {
    total: number;
    active: number;
    inactive: number;
  };
  campaigns: {
    total: number;
    running: number;
    paused: number;
    completed: number;
  };
  last_updated: string;
}

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  latency?: number;
  icon: React.ReactNode;
  description: string;
}

const StatusPage = () => {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbLatency, setDbLatency] = useState<number | null>(null);

  const fetchStatus = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      // Call the database function for status summary
      const { data, error } = await supabase.rpc('get_genesis_status_summary');
      
      const latency = Date.now() - startTime;
      setDbLatency(latency);

      if (error) {
        console.error('Error fetching status:', error);
        return;
      }

      if (data) {
        setStatusData(data as unknown as StatusData);
      }
    } catch (err) {
      console.error('Error in fetchStatus:', err);
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchStatus();
    setIsRefreshing(false);
  }, [fetchStatus]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto-refresh every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [fetchStatus]);

  const getStatusColor = (status: 'operational' | 'degraded' | 'outage' | 'maintenance') => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-500';
      case 'degraded':
        return 'bg-amber-500';
      case 'outage':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-blue-500';
    }
  };

  const getStatusIcon = (status: 'operational' | 'degraded' | 'outage' | 'maintenance') => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'outage':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'maintenance':
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: 'operational' | 'degraded' | 'outage' | 'maintenance') => {
    const variants: Record<typeof status, { label: string; className: string }> = {
      operational: { label: 'Operacional', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
      degraded: { label: 'Degradado', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
      outage: { label: 'Indisponível', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
      maintenance: { label: 'Manutenção', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    };
    const v = variants[status];
    return <Badge className={v.className}>{v.label}</Badge>;
  };

  // Determine overall system status based on data
  const getOverallStatus = (): 'operational' | 'degraded' | 'outage' => {
    if (!statusData) return 'outage';
    
    const instancesHealthy = statusData.instances.connected / Math.max(statusData.instances.total, 1) >= 0.8;
    const automationsHealthy = statusData.automations.active / Math.max(statusData.automations.total, 1) >= 0.5;
    
    if (instancesHealthy && automationsHealthy) return 'operational';
    if (instancesHealthy || automationsHealthy) return 'degraded';
    return 'outage';
  };

  // Build services list based on data
  const services: ServiceStatus[] = [
    {
      name: 'API Genesis',
      status: dbLatency && dbLatency < 1000 ? 'operational' : dbLatency && dbLatency < 3000 ? 'degraded' : 'outage',
      latency: dbLatency || undefined,
      icon: <Server className="w-5 h-5" />,
      description: 'API principal do sistema',
    },
    {
      name: 'Instâncias WhatsApp',
      status: statusData 
        ? (statusData.instances.connected / Math.max(statusData.instances.total, 1) >= 0.8 ? 'operational' : 
           statusData.instances.connected > 0 ? 'degraded' : 'outage')
        : 'outage',
      icon: <Wifi className="w-5 h-5" />,
      description: `${statusData?.instances.connected || 0}/${statusData?.instances.total || 0} conectadas`,
    },
    {
      name: 'Automações',
      status: statusData
        ? (statusData.automations.active > 0 ? 'operational' : statusData.automations.total > 0 ? 'degraded' : 'operational')
        : 'outage',
      icon: <Bot className="w-5 h-5" />,
      description: `${statusData?.automations.active || 0} ativas`,
    },
    {
      name: 'Campanhas',
      status: statusData
        ? (statusData.campaigns.running > 0 ? 'operational' : 'operational')
        : 'outage',
      icon: <Send className="w-5 h-5" />,
      description: `${statusData?.campaigns.running || 0} em execução`,
    },
    {
      name: 'Webhooks',
      status: 'operational',
      icon: <Webhook className="w-5 h-5" />,
      description: 'Sistema de webhooks',
    },
  ];

  const overallStatus = getOverallStatus();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(overallStatus)} animate-pulse`} />
              <h1 className="text-xl font-bold">Status da API Genesis</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overall Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className={`border-2 ${
            overallStatus === 'operational' ? 'border-emerald-500/30 bg-emerald-500/5' :
            overallStatus === 'degraded' ? 'border-amber-500/30 bg-amber-500/5' :
            'border-red-500/30 bg-red-500/5'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  overallStatus === 'operational' ? 'bg-emerald-500/20' :
                  overallStatus === 'degraded' ? 'bg-amber-500/20' :
                  'bg-red-500/20'
                }`}>
                  {overallStatus === 'operational' ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  ) : overallStatus === 'degraded' ? (
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {overallStatus === 'operational' ? 'Todos os sistemas operacionais' :
                     overallStatus === 'degraded' ? 'Alguns sistemas com problemas' :
                     'Sistema indisponível'}
                  </h2>
                  <p className="text-muted-foreground">
                    Atualização automática a cada 1 minuto
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-2 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Wifi className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Instâncias</span>
                      </div>
                      <p className="text-3xl font-bold text-emerald-500">
                        {statusData?.instances.connected || 0}
                        <span className="text-lg text-muted-foreground">/{statusData?.instances.total || 0}</span>
                      </p>
                      <Progress 
                        value={statusData ? (statusData.instances.connected / Math.max(statusData.instances.total, 1)) * 100 : 0} 
                        className="mt-2 h-2"
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Automações Ativas</span>
                      </div>
                      <p className="text-3xl font-bold text-primary">
                        {statusData?.automations.active || 0}
                        <span className="text-lg text-muted-foreground">/{statusData?.automations.total || 0}</span>
                      </p>
                      <Progress 
                        value={statusData ? (statusData.automations.active / Math.max(statusData.automations.total, 1)) * 100 : 0} 
                        className="mt-2 h-2"
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Send className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Campanhas</span>
                      </div>
                      <p className="text-3xl font-bold text-blue-500">
                        {statusData?.campaigns.running || 0}
                        <span className="text-lg text-muted-foreground"> em execução</span>
                      </p>
                      <div className="flex gap-2 mt-2 text-xs">
                        <span className="text-muted-foreground">Total: {statusData?.campaigns.total || 0}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-emerald-500">{statusData?.campaigns.completed || 0} concluídas</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Latência API</span>
                      </div>
                      <p className={`text-3xl font-bold ${
                        dbLatency && dbLatency < 500 ? 'text-emerald-500' :
                        dbLatency && dbLatency < 1000 ? 'text-amber-500' :
                        'text-red-500'
                      }`}>
                        {dbLatency || '—'}
                        <span className="text-lg text-muted-foreground">ms</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {dbLatency && dbLatency < 500 ? 'Excelente' :
                         dbLatency && dbLatency < 1000 ? 'Bom' :
                         dbLatency && dbLatency < 2000 ? 'Aceitável' :
                         'Lento'}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Services Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Status dos Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-background">
                      {service.icon}
                    </div>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {service.latency && (
                      <span className="text-sm text-muted-foreground">{service.latency}ms</span>
                    )}
                    {getStatusIcon(service.status)}
                    {getStatusBadge(service.status)}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Os dados são atualizados automaticamente a cada 60 segundos.</p>
          <p className="mt-1">
            Última verificação: {lastRefresh.toLocaleString('pt-BR')}
          </p>
        </div>
      </main>
    </div>
  );
};

export default StatusPage;
