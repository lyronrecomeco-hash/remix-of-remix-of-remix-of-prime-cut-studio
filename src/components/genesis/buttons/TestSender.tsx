import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Phone,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { InteractiveMessage, SendLog, WHATSAPP_LIMITS } from './types';
import { useConnectedInstances } from './useConnectedInstances';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';

interface TestSenderProps {
  message: InteractiveMessage;
}

export function TestSender({ message }: TestSenderProps) {
  const { genesisUser } = useGenesisAuth();
  const { instances, loading: loadingInstances, refetch } = useConnectedInstances();
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState<SendLog[]>([]);
  const [savedPhone, setSavedPhone] = useState<string | null>(null);

  // Set first instance as default when loaded
  useEffect(() => {
    if (instances.length > 0 && !selectedInstanceId) {
      setSelectedInstanceId(instances[0].id);
    }
  }, [instances, selectedInstanceId]);

  // Fetch saved phone from user account
  useEffect(() => {
    const fetchSavedPhone = async () => {
      if (!genesisUser) return;
      
      try {
        const { data } = await supabase
          .from('genesis_users')
          .select('whatsapp_test, whatsapp_commercial')
          .eq('id', genesisUser.id)
          .maybeSingle();

        if (data) {
          const phone = data.whatsapp_test || data.whatsapp_commercial;
          if (phone) {
            setSavedPhone(phone);
            if (!phoneNumber) setPhoneNumber(phone);
          }
        }
      } catch (error) {
        console.error('Error fetching saved phone:', error);
      }
    };

    fetchSavedPhone();
  }, [genesisUser]);

  const addLog = (type: SendLog['type'], message: string, details?: string) => {
    setLogs(prev => [{
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      message,
      details,
    }, ...prev]);
  };

  const normalizePhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (!digits.startsWith('55') && (digits.length === 10 || digits.length === 11)) {
      return `55${digits}`;
    }
    return digits;
  };

  const validateMessage = (): { valid: boolean; error?: string } => {
    if (!message.text.trim()) {
      return { valid: false, error: 'A mensagem não pode estar vazia' };
    }

    if (message.text.length > WHATSAPP_LIMITS.MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Mensagem muito longa (max ${WHATSAPP_LIMITS.MAX_MESSAGE_LENGTH} caracteres)` };
    }

    if (message.type === 'buttons' || message.type === 'url') {
      if (message.buttons.length === 0) {
        return { valid: false, error: 'Adicione pelo menos um botão' };
      }
      
      const emptyButton = message.buttons.find(b => !b.text.trim());
      if (emptyButton) {
        return { valid: false, error: 'Todos os botões devem ter texto' };
      }

      if (message.type === 'url') {
        const urlButton = message.buttons.find(b => b.type === 'url');
        if (urlButton && !urlButton.url?.trim()) {
          return { valid: false, error: 'Botão URL precisa de um link' };
        }
      }
    }

    if (message.type === 'list') {
      if (message.listSections.length === 0) {
        return { valid: false, error: 'Adicione pelo menos uma seção à lista' };
      }

      const emptySection = message.listSections.find(s => !s.title.trim());
      if (emptySection) {
        return { valid: false, error: 'Todas as seções devem ter título' };
      }

      for (const section of message.listSections) {
        const emptyRow = section.rows.find(r => !r.title.trim());
        if (emptyRow) {
          return { valid: false, error: 'Todos os itens devem ter título' };
        }
      }
    }

    return { valid: true };
  };

  const handleSendTest = async () => {
    // Validations
    if (!selectedInstanceId) {
      toast.error('Selecione uma instância');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Digite um número de telefone');
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (normalizedPhone.length < 10) {
      toast.error('Número de telefone inválido');
      return;
    }

    const validation = validateMessage();
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const selectedInstance = instances.find(i => i.id === selectedInstanceId);
    if (!selectedInstance) {
      toast.error('Instância não encontrada');
      return;
    }

    setIsSending(true);
    setLogs([]);
    addLog('info', 'Iniciando envio de teste...');
    addLog('info', `Instância: ${selectedInstance.name} (${selectedInstanceId.slice(0, 8)}...)`);
    addLog('info', `Destino: ${normalizedPhone}`);
    addLog('info', `Tipo: ${message.type}`);

    try {
      // Build payload based on message type
      let endpoint: string;
      let payload: Record<string, unknown>;

      if (message.type === 'list') {
        endpoint = 'send-list';
        payload = {
          phone: normalizedPhone,
          title: '', // WhatsApp deprecated title for lists
          body: message.text,
          footer: message.footer || '',
          buttonText: message.buttonText || 'Ver opções',
          sections: message.listSections.map(section => ({
            title: section.title,
            rows: section.rows.map(row => ({
              id: row.id,
              title: row.title,
              description: row.description || '',
            })),
          })),
        };
      } else {
        endpoint = 'send-buttons';
        payload = {
          phone: normalizedPhone,
          title: '',
          message: message.text,
          footer: message.footer || '',
          buttons: message.buttons.map((btn, idx) => ({
            id: btn.id,
            text: btn.text,
            ...(btn.type === 'url' && btn.url ? { url: btn.url } : {}),
          })),
        };
      }

      addLog('info', 'Conectando ao backend via proxy...');
      addLog('info', `Endpoint: ${endpoint}`);

      const { data, error } = await supabase.functions.invoke('genesis-backend-proxy', {
        body: {
          instanceId: selectedInstanceId,
          path: `/api/instance/${selectedInstanceId}/${endpoint}`,
          method: 'POST',
          body: payload,
        },
      });

      if (error) {
        addLog('error', 'Falha na chamada do proxy', error.message);
        throw error;
      }

      // Check for proxy-level errors (ok: false means VPS returned error)
      if (data?.ok === false || data?.status === 404) {
        const errorMsg = data?.data?.includes?.('Cannot POST') 
          ? 'Endpoint não encontrado no VPS. Atualize o script para v8.3 em /script'
          : (data?.error || data?.message || 'Erro desconhecido do backend');
        addLog('error', 'VPS retornou erro', `Status: ${data?.status || 'N/A'} - ${errorMsg}`);
        throw new Error(errorMsg);
      }

      if (data?.success === false || data?.error) {
        const errorMsg = data?.error || data?.message || 'Erro desconhecido do backend';
        addLog('error', 'Backend retornou erro', errorMsg);
        throw new Error(errorMsg);
      }

      addLog('success', 'Mensagem enviada com sucesso!', JSON.stringify(data, null, 2));
      toast.success('Mensagem de teste enviada!');

      // Log event
      try {
        await supabase.from('genesis_event_logs').insert({
          instance_id: selectedInstanceId,
          user_id: genesisUser?.id,
          event_type: 'interactive_test_sent',
          severity: 'info',
          message: `Teste ${message.type} enviado para ${normalizedPhone}`,
          details: {
            to: normalizedPhone,
            type: message.type,
            buttonsCount: message.buttons.length,
            sectionsCount: message.listSections.length,
            response: data,
          },
        });
      } catch (logError) {
        console.warn('Error saving log:', logError);
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Erro desconhecido';
      addLog('error', 'Falha no envio', errorMessage);
      toast.error(`Erro: ${errorMessage}`);

      // Log failure
      try {
        await supabase.from('genesis_event_logs').insert({
          instance_id: selectedInstanceId,
          user_id: genesisUser?.id,
          event_type: 'interactive_test_failed',
          severity: 'error',
          message: `Falha ao enviar ${message.type} para ${normalizedPhone}`,
          details: {
            to: normalizedPhone,
            type: message.type,
            error: errorMessage,
          },
        });
      } catch (logError) {
        console.warn('Error saving error log:', logError);
      }
    } finally {
      setIsSending(false);
    }
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 12) {
      return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
    }
    return phone;
  };

  const isValid = validateMessage().valid && !!selectedInstanceId && !!phoneNumber.trim();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Send className="w-4 h-4" />
          Envio de Teste
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instance Selector */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Instância
          </Label>
          <div className="flex gap-2">
            <Select
              value={selectedInstanceId}
              onValueChange={setSelectedInstanceId}
              disabled={loadingInstances}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={loadingInstances ? 'Carregando...' : 'Selecione'} />
              </SelectTrigger>
              <SelectContent>
                {instances.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      {inst.name}
                      {inst.phone_number && (
                        <span className="text-xs text-muted-foreground">
                          ({inst.phone_number})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={refetch}
              disabled={loadingInstances}
            >
              <RefreshCw className={cn("w-4 h-4", loadingInstances && "animate-spin")} />
            </Button>
          </div>
          {instances.length === 0 && !loadingInstances && (
            <p className="text-xs text-destructive">
              Nenhuma instância conectada. Conecte um WhatsApp primeiro.
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Número de Destino
          </Label>
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="55 11 99999-9999"
            className="font-mono"
          />
          {savedPhone && (
            <p className="text-xs text-muted-foreground">
              Número salvo: <span className="font-mono">{formatPhone(savedPhone)}</span>
            </p>
          )}
        </div>

        {/* Message Validation Status */}
        <div className="flex items-center gap-2 text-sm">
          {validateMessage().valid ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-green-600">Mensagem válida</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-amber-600">{validateMessage().error}</span>
            </>
          )}
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendTest}
          disabled={isSending || !isValid}
          className="w-full gap-2"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar Teste
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Envia uma mensagem real • Consome 1 crédito
        </p>

        {/* Logs Console */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Console de Execução
            </Label>
            <ScrollArea className="h-40 rounded-lg border bg-muted/30">
              <div className="p-2 space-y-1 font-mono text-xs">
                <AnimatePresence>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        'p-1.5 rounded',
                        log.type === 'success' && 'bg-green-500/10 border border-green-500/20',
                        log.type === 'error' && 'bg-destructive/10 border border-destructive/20',
                        log.type === 'warning' && 'bg-amber-500/10 border border-amber-500/20',
                        log.type === 'info' && 'bg-blue-500/10 border border-blue-500/20',
                      )}
                    >
                      <div className="flex items-start gap-1.5">
                        {log.type === 'success' && <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />}
                        {log.type === 'error' && <XCircle className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" />}
                        {log.type === 'warning' && <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />}
                        {log.type === 'info' && <AlertCircle className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-muted-foreground text-[10px]">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                            <span className={cn(
                              'break-words',
                              log.type === 'success' && 'text-green-600',
                              log.type === 'error' && 'text-destructive',
                              log.type === 'warning' && 'text-amber-600',
                              log.type === 'info' && 'text-blue-600',
                            )}>
                              {log.message}
                            </span>
                          </div>
                          {log.details && (
                            <pre className="mt-1 text-[9px] text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                              {log.details}
                            </pre>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
