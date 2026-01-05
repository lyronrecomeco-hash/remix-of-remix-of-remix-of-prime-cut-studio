import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Smartphone,
  MessageSquare,
  History,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sendMessageWithRetry } from '@/lib/sendWithRetry';

interface WATestMessageProps {
  instances: Array<{ id: string; name: string; status: string }>;
  backendMode: 'vps' | 'local';
  backendUrl: string;
  localEndpoint: string;
  localPort: string;
  localToken: string;
  masterToken: string;
  isBackendActive: boolean;
}

interface MessageLog {
  id: string;
  phone_to: string;
  message: string;
  status: string;
  created_at: string;
  error_message: string | null;
}

export const WATestMessage = ({
  instances,
  backendMode,
  localEndpoint,
  localPort,
  localToken,
  isBackendActive,
}: WATestMessageProps) => {
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState(
    '🔔 *Teste de WhatsApp Automação*\n\n' +
    'Esta é uma mensagem de teste para verificar se o sistema está funcionando corretamente.\n\n' +
    '✅ Sistema: Genesis Hub\n' +
    '📱 Enviado via: WhatsApp Automação'
  );
  const [isSending, setIsSending] = useState(false);
  const [retryInfo, setRetryInfo] = useState<string | null>(null);
  const [recentLogs, setRecentLogs] = useState<MessageLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchRecentLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_message_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  const sendTestMessage = async () => {
    if (!testPhone.trim()) {
      toast.error('Digite o número de telefone');
      return;
    }

    if (!isBackendActive) {
      toast.error('Backend não conectado. Configure na aba "Backend".');
      return;
    }

    const connectedInstance = instances.find(i => i.status === 'connected');
    if (!connectedInstance) {
      toast.error('Nenhuma instância conectada. Conecte uma instância primeiro.');
      return;
    }

    setIsSending(true);
    setRetryInfo(null);

    try {
      let formattedPhone = testPhone.replace(/\D/g, '');
      if (!formattedPhone.startsWith('55')) {
        formattedPhone = '55' + formattedPhone;
      }

      if (backendMode === 'local') {
        // Chamada direta para backend local
        const endpoint = `${localEndpoint}:${localPort}/api/instance`;
        const response = await fetch(`${endpoint}/${connectedInstance.id}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localToken}`,
          },
          body: JSON.stringify({
            phone: formattedPhone,
            message: testMessage,
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Erro ao enviar');
        
        toast.success('Mensagem de teste enviada com sucesso!');
        await supabase.from('whatsapp_message_logs').insert({
          instance_id: connectedInstance.id,
          direction: 'outgoing',
          phone_to: formattedPhone,
          message: testMessage,
          status: 'sent',
        });
      } else {
        // VPS - usar sistema de retry inteligente
        const result = await sendMessageWithRetry(
          connectedInstance.id,
          formattedPhone,
          testMessage,
          {
            maxRetries: 50,
            baseDelay: 1500,
            maxDelay: 30000,
            onRetry: (attempt, error, nextDelay) => {
              setRetryInfo(
                `Tentativa ${attempt} falhou (${error}). Retentando em ${Math.round(nextDelay / 1000)}s...`
              );
            },
          }
        );

        if (!result.success) {
          throw new Error(result.error || 'Falha ao enviar após múltiplas tentativas');
        }

        toast.success(`Mensagem enviada! (${result.attempts} tentativa${result.attempts > 1 ? 's' : ''})`);
        
        await supabase.from('whatsapp_message_logs').insert({
          instance_id: connectedInstance.id,
          direction: 'outgoing',
          phone_to: formattedPhone,
          message: testMessage,
          status: 'sent',
        });
      }

      fetchRecentLogs();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      
      // Log do erro
      const connectedInstance = instances.find(i => i.status === 'connected');
      if (connectedInstance) {
        await supabase.from('whatsapp_message_logs').insert({
          instance_id: connectedInstance.id,
          direction: 'outgoing',
          phone_to: testPhone.replace(/\D/g, ''),
          message: testMessage,
          status: 'failed',
          error_message: errorMessage,
        });
      }
    } finally {
      setIsSending(false);
      setRetryInfo(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Enviada</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500"><XCircle className="w-3 h-3 mr-1" />Falha</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Send Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Enviar Mensagem de Teste
          </CardTitle>
          <CardDescription>
            Valide a conexão enviando uma mensagem de teste
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isBackendActive && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-sm">
              ⚠️ Backend não conectado. Configure o backend primeiro.
            </div>
          )}

          {isBackendActive && instances.filter(i => i.status === 'connected').length === 0 && (
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-sm">
              📱 Nenhuma instância conectada. Conecte uma instância na aba "Instâncias".
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="test-phone">Número de Telefone</Label>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 bg-muted rounded-l-md border border-r-0">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">+55</span>
              </div>
              <Input
                id="test-phone"
                placeholder="27 99772-3328"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="rounded-l-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Digite apenas os números (DDD + número)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-message">Mensagem</Label>
            <Textarea
              id="test-message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Use *texto* para negrito, _texto_ para itálico
            </p>
          </div>

          {retryInfo && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {retryInfo}
            </div>
          )}

          <Button
            onClick={sendTestMessage}
            disabled={isSending || !isBackendActive}
            className="w-full"
            size="lg"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {retryInfo ? 'Retentando...' : 'Enviando...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Teste
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Últimos Envios
              </CardTitle>
              <CardDescription>
                Histórico recente de mensagens enviadas
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchRecentLogs} disabled={isLoadingLogs}>
              {isLoadingLogs ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Atualizar'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px]">
            {recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{log.phone_to}</span>
                      </div>
                      {getStatusBadge(log.status)}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {log.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </p>
                    {log.error_message && (
                      <p className="text-xs text-red-500 mt-1">
                        Erro: {log.error_message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">Nenhum envio recente</p>
                <Button variant="link" size="sm" onClick={fetchRecentLogs} className="mt-2">
                  Carregar histórico
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
