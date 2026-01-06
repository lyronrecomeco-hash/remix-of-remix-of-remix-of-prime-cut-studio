import { useState, useEffect, useCallback } from 'react';
import { 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Wifi,
  WifiOff,
  Zap,
  Save,
  Activity,
  Users,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GlobalConfig {
  id: string;
  backend_url: string;
  master_token: string;
  is_connected: boolean;
  last_health_check?: string;
}

interface HealthCheckResult {
  success: boolean;
  pingMs: number;
  data?: {
    status: string;
    whatsapp: string;
    version?: string;
    uptime?: number;
    ready_to_send?: boolean;
    instances?: number;
    memory_mb?: number;
  };
  error?: string;
}

interface InstanceStats {
  total: number;
  connected: number;
  disconnected: number;
}

export default function VPSConfigManager() {
  const [config, setConfig] = useState<GlobalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);
  const [instanceStats, setInstanceStats] = useState<InstanceStats>({ total: 0, connected: 0, disconnected: 0 });
  
  const [editForm, setEditForm] = useState({
    backend_url: '',
    master_token: '',
  });

  const fetchConfig = useCallback(async () => {
    const { data, error } = await supabase
      .from('whatsapp_backend_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setConfig(data as GlobalConfig);
      setEditForm({
        backend_url: data.backend_url || '',
        master_token: data.master_token || '',
      });
    }
    setLoading(false);
  }, []);

  const fetchInstanceStats = useCallback(async () => {
    const { data, error } = await supabase
      .from('genesis_instances')
      .select('orchestrated_status, effective_status, status');

    if (!error && data) {
      const total = data.length;
      const connected = data.filter(i => 
        (i.orchestrated_status || i.effective_status || i.status) === 'connected'
      ).length;
      setInstanceStats({
        total,
        connected,
        disconnected: total - connected,
      });
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchInstanceStats();
    const interval = setInterval(() => {
      fetchConfig();
      fetchInstanceStats();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchConfig, fetchInstanceStats]);

  const handleSave = async () => {
    setSaving(true);

    const payload = {
      backend_url: editForm.backend_url.trim(),
      master_token: editForm.master_token.trim(),
      updated_at: new Date().toISOString(),
    };

    if (config?.id) {
      const { error } = await supabase
        .from('whatsapp_backend_config')
        .update(payload)
        .eq('id', config.id);

      if (error) {
        toast.error('Erro ao salvar configuração');
      } else {
        toast.success('Configuração VPS salva!');
        fetchConfig();
      }
    } else {
      const { error } = await supabase
        .from('whatsapp_backend_config')
        .insert([payload]);

      if (error) {
        toast.error('Erro ao criar configuração');
      } else {
        toast.success('Configuração VPS criada!');
        fetchConfig();
      }
    }
    setSaving(false);
  };

  const testConnection = async () => {
    if (!editForm.backend_url || !editForm.master_token) {
      toast.error('Preencha URL e Token primeiro');
      return;
    }

    // Salvar antes de testar se houve mudança
    if (editForm.backend_url !== config?.backend_url || 
        editForm.master_token !== config?.master_token) {
      await handleSave();
    }

    setTesting(true);
    setHealthResult(null);
    const startTime = Date.now();

    try {
      // Testar diretamente via fetch (sem precisar de instância)
      const cleanUrl = editForm.backend_url.replace(/\/$/, '');
      
      console.log('[VPS] Testando conexão direta...', { url: cleanUrl });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${cleanUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${editForm.master_token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const pingMs = Date.now() - startTime;
      
      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      console.log('[VPS] Resposta:', { status: response.status, data, pingMs });

      if (response.ok) {
        setHealthResult({
          success: true,
          pingMs,
          data: {
            status: data.status || 'ok',
            whatsapp: data.whatsapp || data.state || 'unknown',
            version: data.version,
            uptime: data.uptime,
            ready_to_send: data.ready_to_send ?? data.readyToSend,
            instances: data.instances?.length || data.instanceCount,
            memory_mb: data.metrics?.memory_mb || data.memory_mb,
          },
        });
        
        // Atualizar status de conexão no banco
        if (config?.id) {
          await supabase
            .from('whatsapp_backend_config')
            .update({ 
              is_connected: true, 
              last_health_check: new Date().toISOString() 
            })
            .eq('id', config.id);
        }
        
        toast.success(`Servidor conectado! Ping: ${pingMs}ms`);
      } else {
        setHealthResult({
          success: false,
          pingMs,
          error: data.error || `HTTP ${response.status}`,
        });
        toast.error('Servidor respondeu com erro');
      }
    } catch (err: any) {
      const pingMs = Date.now() - startTime;
      const isTimeout = err.name === 'AbortError';
      
      console.error('[VPS] Erro no teste:', err);
      
      setHealthResult({
        success: false,
        pingMs,
        error: isTimeout ? 'Timeout - servidor não respondeu' : (err.message || 'Erro de conexão'),
      });
      
      if (config?.id) {
        await supabase
          .from('whatsapp_backend_config')
          .update({ is_connected: false })
          .eq('id', config.id);
      }
      
      toast.error(isTimeout ? 'Timeout na conexão' : 'Falha ao conectar');
    } finally {
      setTesting(false);
    }
  };

  const formatAge = (dateStr?: string) => {
    if (!dateStr) return 'Nunca';
    const diff = Date.now() - new Date(dateStr).getTime();
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
            Configuração VPS Global
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Configure o servidor backend que todas as instâncias Genesis utilizam
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchConfig(); fetchInstanceStats(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-3 rounded-lg",
                config?.is_connected ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                {config?.is_connected ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status VPS</p>
                <p className={cn(
                  "font-semibold",
                  config?.is_connected ? "text-green-600" : "text-red-600"
                )}>
                  {config?.is_connected ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Instâncias</p>
                <p className="font-semibold">
                  <span className="text-green-600">{instanceStats.connected}</span>
                  <span className="text-muted-foreground"> / {instanceStats.total}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Último Health Check</p>
                <p className="font-semibold">{formatAge(config?.last_health_check)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Config Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuração do Backend</CardTitle>
          <CardDescription>
            Defina a URL e Token do servidor VPS que hospeda o WhatsApp Backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="backend_url">URL do Backend VPS</Label>
              <Input
                id="backend_url"
                value={editForm.backend_url}
                onChange={(e) => setEditForm({ ...editForm, backend_url: e.target.value })}
                placeholder="http://IP_DA_VPS:3000"
              />
              <p className="text-xs text-muted-foreground">
                Exemplo: http://72.62.108.24:3000
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="master_token">Master Token</Label>
              <Input
                id="master_token"
                type="password"
                value={editForm.master_token}
                onChange={(e) => setEditForm({ ...editForm, master_token: e.target.value })}
                placeholder="••••••••••••••••"
              />
              <p className="text-xs text-muted-foreground">
                O MASTER_TOKEN definido no .env da VPS
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Configuração
            </Button>
            <Button 
              variant="outline" 
              onClick={testConnection} 
              disabled={testing || !editForm.backend_url || !editForm.master_token}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="p-2 rounded bg-background/50">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="font-medium text-green-600">
                      ✓ {healthResult.data.status}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-background/50">
                    <div className="text-xs text-muted-foreground">WhatsApp</div>
                    <div className={cn(
                      "font-medium",
                      healthResult.data.whatsapp === 'connected' ? "text-green-600" : "text-yellow-600"
                    )}>
                      {healthResult.data.whatsapp}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-background/50">
                    <div className="text-xs text-muted-foreground">Versão</div>
                    <div className="font-medium">{healthResult.data.version || 'N/A'}</div>
                  </div>
                  <div className="p-2 rounded bg-background/50">
                    <div className="text-xs text-muted-foreground">Uptime</div>
                    <div className="font-medium">
                      {healthResult.data.uptime 
                        ? `${Math.floor(healthResult.data.uptime / 60)}min` 
                        : 'N/A'}
                    </div>
                  </div>
                  {healthResult.data.instances !== undefined && (
                    <div className="p-2 rounded bg-background/50">
                      <div className="text-xs text-muted-foreground">Instâncias VPS</div>
                      <div className="font-medium">{healthResult.data.instances}</div>
                    </div>
                  )}
                  {healthResult.data.memory_mb !== undefined && (
                    <div className="p-2 rounded bg-background/50">
                      <div className="text-xs text-muted-foreground">Memória</div>
                      <div className="font-medium">{healthResult.data.memory_mb}MB</div>
                    </div>
                  )}
                  <div className="p-2 rounded bg-background/50">
                    <div className="text-xs text-muted-foreground">Ready to Send</div>
                    <div className={cn(
                      "font-medium",
                      healthResult.data.ready_to_send ? "text-green-600" : "text-yellow-600"
                    )}>
                      {healthResult.data.ready_to_send ? '✓ Sim' : 'Não'}
                    </div>
                  </div>
                </div>
              )}

              {healthResult.error && (
                <div className="mt-2 text-sm text-red-600">
                  <strong>Erro:</strong> {healthResult.error}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Activity className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-600 mb-1">Como funciona</p>
              <p className="text-muted-foreground">
                Esta é a configuração <strong>global</strong> do servidor VPS. 
                Todas as instâncias criadas pelos clientes no <strong>/genesis</strong> utilizarão 
                automaticamente esta conexão para enviar e receber mensagens do WhatsApp.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}