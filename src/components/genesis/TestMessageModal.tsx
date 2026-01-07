import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Phone,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface TestMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  instanceId: string;
  instanceName: string;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error';
  message: string;
  details?: string;
}

export function TestMessageModal({ isOpen, onClose, instanceId, instanceName }: TestMessageModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customMessage, setCustomMessage] = useState('🧪 Mensagem de teste do Genesis Auto!');
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [savedPhone, setSavedPhone] = useState<string | null>(null);

  // Buscar número salvo na conta do usuário
  useEffect(() => {
    const fetchSavedPhone = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) return;

        // @ts-ignore - TypeScript depth issue workaround
        const response = await (supabase
          .from('genesis_users')
          .select('whatsapp_test, whatsapp_commercial')
          .eq('user_id', user.id)
          .maybeSingle() as Promise<{ data: any; error: any }>);

        if (!response.error && response.data) {
          const phone = response.data.whatsapp_test || response.data.whatsapp_commercial;
          if (phone) {
            setSavedPhone(phone);
            setPhoneNumber(phone);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar telefone:', error);
      }
    };

    if (isOpen) {
      fetchSavedPhone();
      setLogs([]);
    }
  }, [isOpen]);

  const addLog = (type: LogEntry['type'], message: string, details?: string) => {
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
    // Normalização BR: se 10/11 dígitos sem 55, adiciona
    if (!digits.startsWith('55') && (digits.length === 10 || digits.length === 11)) {
      return `55${digits}`;
    }
    return digits;
  };

  const handleSendTest = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Digite um número de telefone');
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    if (normalizedPhone.length < 10) {
      toast.error('Número de telefone inválido');
      return;
    }

    setIsSending(true);
    addLog('info', 'Iniciando envio de mensagem de teste...');
    addLog('info', `Número destino: ${normalizedPhone}`);

    try {
      // Chamar o proxy para enviar mensagem usando o formato correto
      addLog('info', 'Conectando ao backend via proxy...');

      const { data, error } = await supabase.functions.invoke('genesis-backend-proxy', {
        body: {
          instanceId,
          path: `/api/instance/${instanceId}/send`,
          method: 'POST',
          body: {
            to: normalizedPhone,
            message: customMessage,
          },
        },
      });

      if (error) {
        addLog('error', 'Falha na chamada do proxy', error.message);
        throw error;
      }

      // Validar resposta real
      if (data?.success === false || data?.error) {
        const errorMsg = data?.error || data?.message || 'Erro desconhecido do backend';
        addLog('error', 'Backend retornou erro', errorMsg);
        throw new Error(errorMsg);
      }

      addLog('success', 'Mensagem enviada com sucesso!', JSON.stringify(data, null, 2));
      toast.success('Mensagem de teste enviada!');

      // Registrar no log de eventos
      await supabase.from('genesis_event_logs').insert({
        instance_id: instanceId,
        event_type: 'test_message_sent',
        severity: 'info',
        message: `Teste enviado para ${normalizedPhone}`,
        details: {
          to: normalizedPhone,
          message: customMessage,
          response: data,
        },
      });

    } catch (error: any) {
      const errorMessage = error.message || 'Erro desconhecido';
      addLog('error', 'Falha no envio', errorMessage);
      toast.error(`Erro: ${errorMessage}`);

      // Registrar falha no log
      await supabase.from('genesis_event_logs').insert({
        instance_id: instanceId,
        event_type: 'test_message_failed',
        severity: 'error',
        message: `Falha ao enviar para ${normalizePhoneNumber(phoneNumber)}`,
        details: {
          to: normalizePhoneNumber(phoneNumber),
          message: customMessage,
          error: errorMessage,
        },
      });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            Teste de Envio
          </DialogTitle>
          <DialogDescription>
            Envie uma mensagem de teste para validar a conexão da instância "{instanceName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Número de telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Número de destino
            </Label>
            <Input
              id="phone"
              placeholder="55 11 99999-9999"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="font-mono"
            />
            {savedPhone && (
              <p className="text-xs text-muted-foreground">
                Número salvo na sua conta: <span className="font-mono">{formatPhone(savedPhone)}</span>
              </p>
            )}
          </div>

          {/* Mensagem customizável */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Mensagem
            </Label>
            <Input
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Digite a mensagem de teste..."
            />
          </div>

          {/* Botão de envio */}
          <Button
            onClick={handleSendTest}
            disabled={isSending || !phoneNumber.trim()}
            className="w-full gap-2"
            size="lg"
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

          {/* Console de logs */}
          {logs.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Console de Execução
              </Label>
              <ScrollArea className="h-48 rounded-lg border bg-muted/30">
                <div className="p-3 space-y-2 font-mono text-xs">
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        'p-2 rounded-md',
                        log.type === 'success' && 'bg-green-500/10 border border-green-500/20',
                        log.type === 'error' && 'bg-destructive/10 border border-destructive/20',
                        log.type === 'info' && 'bg-blue-500/10 border border-blue-500/20',
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {log.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5" />}
                        {log.type === 'error' && <XCircle className="w-3.5 h-3.5 text-destructive mt-0.5" />}
                        {log.type === 'info' && <AlertCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                            <span className={cn(
                              log.type === 'success' && 'text-green-600',
                              log.type === 'error' && 'text-destructive',
                              log.type === 'info' && 'text-blue-600',
                            )}>
                              {log.message}
                            </span>
                          </div>
                          {log.details && (
                            <pre className="mt-1 text-[10px] text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                              {log.details}
                            </pre>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
