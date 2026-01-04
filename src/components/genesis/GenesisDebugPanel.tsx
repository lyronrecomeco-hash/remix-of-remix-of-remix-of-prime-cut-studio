import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bug,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Zap,
  Wifi,
  WifiOff,
  Bell,
  Filter,
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventLog {
  id: string;
  instance_id: string | null;
  user_id: string | null;
  event_type: string;
  severity: string;
  message: string;
  details: Record<string, unknown>;
  created_at: string;
}

interface GenesisDebugPanelProps {
  instanceId?: string;
  userId?: string;
}

export function GenesisDebugPanel({ instanceId, userId }: GenesisDebugPanelProps) {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [instances, setInstances] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('all');

  const effectiveInstanceId = useMemo(() => {
    if (instanceId) return instanceId;
    if (selectedInstanceId === 'all') return undefined;
    return selectedInstanceId;
  }, [instanceId, selectedInstanceId]);

  useEffect(() => {
    if (instanceId) return; // quando o painel já está escopado por instância, não precisamos da lista
    setSelectedInstanceId('all');
  }, [userId, instanceId]);

  useEffect(() => {
    if (!userId || instanceId) return;

    let cancelled = false;
    const fetchInstances = async () => {
      const { data, error } = await supabase
        .from('genesis_instances')
        .select('id, name')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (cancelled) return;
      if (!error && data) setInstances(data as Array<{ id: string; name: string }>);
    };

    fetchInstances();
    return () => {
      cancelled = true;
    };
  }, [userId, instanceId]);

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from('genesis_event_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (effectiveInstanceId) {
        query = query.eq('instance_id', effectiveInstanceId);
      }
      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (filter !== 'all') {
        query = query.eq('event_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data || []) as EventLog[]);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLogs = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(logs, null, 2));
      toast.success('Logs copiados!');
    } catch {
      toast.error('Não foi possível copiar os logs');
    }
  };

  useEffect(() => {
    fetchLogs();

    const realtimeFilter = effectiveInstanceId
      ? `instance_id=eq.${effectiveInstanceId}`
      : userId
        ? `user_id=eq.${userId}`
        : undefined;

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`genesis-logs-${effectiveInstanceId ?? userId ?? 'all'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'genesis_event_logs',
          filter: realtimeFilter,
        },
        (payload) => {
          if (autoRefresh) {
            setLogs((prev) => [payload.new as EventLog, ...prev.slice(0, 99)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveInstanceId, userId, filter, autoRefresh]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, effectiveInstanceId, userId, filter]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'heartbeat':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'webhook_triggered':
      case 'webhook_dispatched':
        return <Bell className="w-4 h-4 text-purple-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'info':
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const eventTypes = [
    { value: 'all', label: 'Todos' },
    { value: 'connected', label: 'Conexões' },
    { value: 'disconnected', label: 'Desconexões' },
    { value: 'heartbeat', label: 'Heartbeats' },
    { value: 'webhook_triggered', label: 'Webhooks' },
    { value: 'error', label: 'Erros' },
    { value: 'qr_generated', label: 'QR Codes' },
  ];

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-muted/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-primary" />
            Logs de Conexão
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {userId && !instanceId && (
              <Select value={selectedInstanceId} onValueChange={setSelectedInstanceId}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Todas as instâncias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as instâncias</SelectItem>
                  {instances.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] h-8">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="h-8"
            >
              <RefreshCw className={cn('w-3 h-3 mr-1', autoRefresh && 'animate-spin')} />
              Auto
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={isLoading}
              className="h-8"
            >
              <RefreshCw className={cn('w-3 h-3', isLoading && 'animate-spin')} />
            </Button>

            <Button variant="outline" size="sm" onClick={handleCopyLogs} className="h-8">
              <Copy className="w-3 h-3 mr-1" />
              Copiar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Bug className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Nenhum log encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {logs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all',
                      getSeverityColor(log.severity),
                      expandedLog === log.id && 'ring-2 ring-primary/30'
                    )}
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getEventIcon(log.event_type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">
                            {log.message}
                          </span>
                          <Badge variant="outline" className="text-xs h-5">
                            {log.event_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(new Date(log.created_at), "dd/MM HH:mm:ss", { locale: ptBR })}
                        </div>

                        <AnimatePresence>
                          {expandedLog === log.id && log.details && Object.keys(log.details).length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t border-current/10"
                            >
                              <pre className="text-xs bg-background/50 p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex items-center gap-1">
                        {getSeverityIcon(log.severity)}
                        {expandedLog === log.id ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t">
          {[
            { label: 'Total', value: logs.length, color: 'text-foreground' },
            { label: 'Info', value: logs.filter(l => l.severity === 'info').length, color: 'text-blue-500' },
            { label: 'Warning', value: logs.filter(l => l.severity === 'warning').length, color: 'text-yellow-500' },
            { label: 'Erros', value: logs.filter(l => l.severity === 'error' || l.severity === 'critical').length, color: 'text-red-500' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-2 rounded-lg bg-muted/30">
              <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
