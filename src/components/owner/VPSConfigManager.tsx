import { useState, useEffect, useCallback } from 'react';
import { 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Wifi,
  WifiOff,
  Loader2,
  Clock,
  Zap,
  Settings,
  Save,
  ExternalLink,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GenesisInstance {
  id: string;
  name: string;
  phone_number?: string;
  status: string;
  effective_status?: string;
  orchestrated_status?: string;
  backend_url?: string;
  backend_token?: string;
  last_heartbeat?: string;
  health_status?: string;
  user_id: string;
}

interface HealthCheckResult {
  success: boolean;
  pingMs: number;
  data?: {
    status: string;
    whatsapp: string;
    phone?: string;
    version?: string;
    uptime?: number;
    ready_to_send?: boolean;
    stable?: boolean;
    metrics?: {
      sent?: number;
      received?: number;
      memory_mb?: number;
    };
  };
  error?: string;
}

export default function VPSConfigManager() {
  const [instances, setInstances] = useState<GenesisInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstance, setSelectedInstance] = useState<GenesisInstance | null>(null);
  const [editForm, setEditForm] = useState({ backend_url: '', backend_token: '' });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);

  const fetchInstances = useCallback(async () => {
    const { data, error } = await supabase
      .from('genesis_instances')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInstances(data);
      // Se já tinha uma instância selecionada, atualiza com os novos dados
      if (selectedInstance) {
        const updated = data.find(i => i.id === selectedInstance.id);
        if (updated) {
          setSelectedInstance(updated);
        }
      }
    }
    setLoading(false);
  }, [selectedInstance]);

  useEffect(() => {
    fetchInstances();
    const interval = setInterval(fetchInstances, 15000);
    return () => clearInterval(interval);
  }, [fetchInstances]);

  useEffect(() => {
    if (selectedInstance) {
      setEditForm({
        backend_url: selectedInstance.backend_url || '',
        backend_token: selectedInstance.backend_token || '',
      });
      setHealthResult(null);
    }
  }, [selectedInstance]);

  const handleSave = async () => {
    if (!selectedInstance) return;
    setSaving(true);

    const { error } = await supabase
      .from('genesis_instances')
      .update({
        backend_url: editForm.backend_url.trim() || null,
        backend_token: editForm.backend_token.trim() || null,
      })
      .eq('id', selectedInstance.id);

    if (error) {
      toast.error('Erro ao salvar configuração');
    } else {
      toast.success('Configuração VPS salva!');
      fetchInstances();
    }
    setSaving(false);
  };

  const testConnection = async () => {
    if (!editForm.backend_url) {
      toast.error('Insira a URL do backend primeiro');
      return;
    }

    setTesting(true);
    setHealthResult(null);
    const startTime = Date.now();

    try {
      // Tentar via proxy primeiro
      const { data, error } = await supabase.functions.invoke('genesis-backend-proxy', {
        body: {
          instanceId: selectedInstance?.id,
          path: '/health',
          method: 'GET',
        },
      });

      const pingMs = Date.now() - startTime;

      if (error) {
        setHealthResult({
          success: false,
          pingMs,
          error: error.message || 'Erro ao conectar',
        });
        toast.error('Falha na conexão com o servidor');
      } else if (data?.success !== false) {
        setHealthResult({
          success: true,
          pingMs,
          data: data,
        });
        toast.success(`Servidor conectado! Ping: ${pingMs}ms`);
      } else {
        setHealthResult({
          success: false,
          pingMs,
          error: data?.error || 'Resposta inválida',
        });
        toast.error('Servidor respondeu com erro');
      }
    } catch (err: any) {
      const pingMs = Date.now() - startTime;
      setHealthResult({
        success: false,
        pingMs,
        error: err.message || 'Erro de conexão',
      });
      toast.error('Falha ao conectar com o servidor');
    }

    setTesting(false);
  };

  const getStatusBadge = (instance: GenesisInstance) => {
    // Prioriza orchestrated_status (verdade da máquina de estados)
    const status = instance.orchestrated_status || instance.effective_status || instance.status;
    
    switch (status) {
      case 'connected':
        return (
          <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
            <Wifi className="w-3 h-3" />
            Conectado
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge className="gap-1 bg-red-500/10 text-red-600 border-red-500/30">
            <WifiOff className="w-3 h-3" />
            Desconectado
          </Badge>
        );
      case 'connecting':
      case 'stabilizing':
        return (
          <Badge className="gap-1 bg-blue-500/10 text-blue-600 border-blue-500/30">
            <Loader2 className="w-3 h-3 animate-spin" />
            Conectando
          </Badge>
        );
      case 'qr_pending':
        return (
          <Badge className="gap-1 bg-purple-500/10 text-purple-600 border-purple-500/30">
            <Clock className="w-3 h-3" />
            Aguardando QR
          </Badge>
        );
      default:
        return (
          <Badge className="gap-1 bg-muted text-muted-foreground">
            <AlertCircle className="w-3 h-3" />
            {status || 'Desconhecido'}
          </Badge>
        );
    }
  };

  const formatHeartbeatAge = (lastHeartbeat?: string) => {
    if (!lastHeartbeat) return 'Nunca';
    const diff = Date.now() - new Date(lastHeartbeat).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s atrás`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Server className="w-6 h-6 text-primary" />
            Configuração VPS
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Configure a conexão backend de cada instância Genesis
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchInstances()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Instâncias */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Instâncias</CardTitle>
            <CardDescription>{instances.length} instância(s) encontrada(s)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {instances.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Server className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma instância encontrada</p>
                </div>
              ) : (
                <div className="divide-y">
                  {instances.map((instance) => (
                    <button
                      key={instance.id}
                      onClick={() => setSelectedInstance(instance)}
                      className={cn(
                        "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                        selectedInstance?.id === instance.id && "bg-muted"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium truncate">{instance.name}</span>
                        {getStatusBadge(instance)}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Heartbeat: {formatHeartbeatAge(instance.last_heartbeat)}
                        </div>
                        {instance.phone_number && (
                          <div className="truncate">📱 {instance.phone_number}</div>
                        )}
                        {instance.backend_url ? (
                          <div className="truncate text-green-600">
                            ✓ VPS: {instance.backend_url.replace(/https?:\/\//, '').split(':')[0]}
                          </div>
                        ) : (
                          <div className="text-yellow-600">⚠ VPS não configurada</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Painel de Configuração */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {selectedInstance ? `Configurar: ${selectedInstance.name}` : 'Selecione uma instância'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedInstance ? (
              <div className="p-12 text-center text-muted-foreground">
                <Server className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Selecione uma instância para configurar a conexão VPS</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status atual */}
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium mb-1">Status Atual</div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(selectedInstance)}
                        {selectedInstance.phone_number && (
                          <span className="text-sm text-muted-foreground">
                            📱 {selectedInstance.phone_number}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>Heartbeat: {formatHeartbeatAge(selectedInstance.last_heartbeat)}</div>
                      <div>Health: {selectedInstance.health_status || 'unknown'}</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Formulário de configuração */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="backend_url">URL do Backend VPS</Label>
                    <Input
                      id="backend_url"
                      value={editForm.backend_url}
                      onChange={(e) => setEditForm({ ...editForm, backend_url: e.target.value })}
                      placeholder="http://IP_DA_VPS:3000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Exemplo: http://72.62.108.24:3000 (porta padrão: 3000)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backend_token">Token de Autenticação (MASTER_TOKEN)</Label>
                    <Input
                      id="backend_token"
                      type="password"
                      value={editForm.backend_token}
                      onChange={(e) => setEditForm({ ...editForm, backend_token: e.target.value })}
                      placeholder="••••••••••••••••"
                    />
                    <p className="text-xs text-muted-foreground">
                      O mesmo valor definido no arquivo .env da VPS
                    </p>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Configuração
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={testConnection} 
                    disabled={testing || !editForm.backend_url}
                    className="gap-2"
                  >
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Testar Conexão
                  </Button>
                </div>

                {/* Resultado do teste */}
                {healthResult && (
                  <div className={cn(
                    "p-4 rounded-lg border",
                    healthResult.success 
                      ? "bg-green-500/5 border-green-500/30" 
                      : "bg-red-500/5 border-red-500/30"
                  )}>
                    <div className="flex items-center gap-2 mb-3">
                      {healthResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className={cn(
                        "font-medium",
                        healthResult.success ? "text-green-600" : "text-red-600"
                      )}>
                        {healthResult.success ? 'Servidor Conectado' : 'Falha na Conexão'}
                      </span>
                      <Badge variant="outline" className="ml-auto">
                        Ping: {healthResult.pingMs}ms
                      </Badge>
                    </div>

                    {healthResult.success && healthResult.data && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-2 rounded bg-background/50">
                          <div className="text-xs text-muted-foreground">WhatsApp</div>
                          <div className={cn(
                            "font-medium",
                            healthResult.data.whatsapp === 'connected' ? "text-green-600" : "text-yellow-600"
                          )}>
                            {healthResult.data.whatsapp === 'connected' ? '✓ Conectado' : healthResult.data.whatsapp}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-background/50">
                          <div className="text-xs text-muted-foreground">Versão</div>
                          <div className="font-medium">{healthResult.data.version || 'N/A'}</div>
                        </div>
                        <div className="p-2 rounded bg-background/50">
                          <div className="text-xs text-muted-foreground">Ready to Send</div>
                          <div className={cn(
                            "font-medium",
                            healthResult.data.ready_to_send ? "text-green-600" : "text-yellow-600"
                          )}>
                            {healthResult.data.ready_to_send ? '✓ Sim' : 'Não'}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-background/50">
                          <div className="text-xs text-muted-foreground">Uptime</div>
                          <div className="font-medium">
                            {healthResult.data.uptime 
                              ? `${Math.floor(healthResult.data.uptime / 60)}min` 
                              : 'N/A'}
                          </div>
                        </div>
                        {healthResult.data.phone && (
                          <div className="p-2 rounded bg-background/50 col-span-2">
                            <div className="text-xs text-muted-foreground">Telefone</div>
                            <div className="font-medium">📱 {healthResult.data.phone}</div>
                          </div>
                        )}
                        {healthResult.data.metrics && (
                          <div className="p-2 rounded bg-background/50 col-span-2">
                            <div className="text-xs text-muted-foreground">Métricas</div>
                            <div className="font-medium text-xs">
                              Enviadas: {healthResult.data.metrics.sent || 0} | 
                              Recebidas: {healthResult.data.metrics.received || 0} | 
                              Memória: {healthResult.data.metrics.memory_mb || 0}MB
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!healthResult.success && healthResult.error && (
                      <p className="text-sm text-red-600">{healthResult.error}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
