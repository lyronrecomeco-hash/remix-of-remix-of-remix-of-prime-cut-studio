import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { 
  Radio, 
  Loader2,
  CheckCircle2,
  XCircle,
  Edit3,
  Mic,
  Circle,
  CircleOff
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { InstanceOption, SendLog, PresenceType } from '../types';

interface PresenceIndicatorProps {
  instances: InstanceOption[];
}

const PRESENCE_OPTIONS: { value: PresenceType; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: 'composing', 
    label: 'Digitando...', 
    icon: <Edit3 className="w-4 h-4" />,
    description: 'Mostra "digitando..." para o destinatário'
  },
  { 
    value: 'recording', 
    label: 'Gravando áudio...', 
    icon: <Mic className="w-4 h-4" />,
    description: 'Mostra "gravando áudio..." para o destinatário'
  },
  { 
    value: 'available', 
    label: 'Disponível', 
    icon: <Circle className="w-4 h-4 text-green-500" />,
    description: 'Marca como online'
  },
  { 
    value: 'unavailable', 
    label: 'Indisponível', 
    icon: <CircleOff className="w-4 h-4 text-muted-foreground" />,
    description: 'Marca como offline'
  },
  { 
    value: 'paused', 
    label: 'Parado', 
    icon: <Circle className="w-4 h-4 text-yellow-500" />,
    description: 'Para de mostrar indicador'
  },
];

export const PresenceIndicator = ({ instances }: PresenceIndicatorProps) => {
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [selectedPresence, setSelectedPresence] = useState<PresenceType>('composing');
  const [duration, setDuration] = useState(5); // seconds
  const [sending, setSending] = useState(false);
  const [activePresence, setActivePresence] = useState<string | null>(null);
  const [logs, setLogs] = useState<SendLog[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const addLog = (type: SendLog['type'], message: string, details?: string) => {
    const log: SendLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      details
    };
    setLogs(prev => [log, ...prev].slice(0, 50));
  };

  const sendPresence = async (presence: PresenceType, continuous: boolean = false) => {
    if (!selectedInstance) {
      toast.error('Selecione uma instância');
      return;
    }
    if (!recipientPhone.trim()) {
      toast.error('Digite o número do destinatário');
      return;
    }

    if (!continuous) {
      setSending(true);
    }

    try {
      const { data, error } = await supabase.functions.invoke('genesis-backend-proxy', {
        body: {
          action: 'send-presence',
          instanceId: selectedInstance,
          phone: recipientPhone.replace(/\D/g, ''),
          presence: presence
        }
      });

      if (error) throw error;

      if (data?.success) {
        if (!continuous) {
          addLog('success', `Presença "${presence}" enviada!`);
        }
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      addLog('error', 'Falha ao enviar', err.message);
      if (!continuous) {
        toast.error(`Erro: ${err.message}`);
      }
    } finally {
      if (!continuous) {
        setSending(false);
      }
    }
  };

  const startContinuousPresence = async () => {
    // Send initial presence
    await sendPresence(selectedPresence, true);
    setActivePresence(selectedPresence);
    addLog('info', `Iniciando presença "${selectedPresence}"`, `Por ${duration}s`);

    // WhatsApp requires sending presence every ~3-5 seconds to maintain it
    intervalRef.current = setInterval(() => {
      sendPresence(selectedPresence, true);
    }, 3000);

    // Stop after duration
    timeoutRef.current = setTimeout(() => {
      stopContinuousPresence();
    }, duration * 1000);
  };

  const stopContinuousPresence = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Send paused to stop the indicator
    await sendPresence('paused', true);
    setActivePresence(null);
    addLog('info', 'Presença encerrada');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Presence Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5" />
            Indicador de Presença
          </CardTitle>
          <CardDescription>
            Mostre "digitando..." ou "gravando áudio..." para o destinatário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instance Selection */}
          <div className="space-y-2">
            <Label>Instância</Label>
            <Select value={selectedInstance} onValueChange={setSelectedInstance}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma instância" />
              </SelectTrigger>
              <SelectContent>
                {instances.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id}>
                    {inst.name} {inst.phone_number && `(${inst.phone_number})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <Label>Destinatário</Label>
            <Input
              placeholder="5511999999999"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
            />
          </div>

          {/* Presence Type */}
          <div className="space-y-2">
            <Label>Tipo de Presença</Label>
            <div className="grid grid-cols-1 gap-2">
              {PRESENCE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedPresence === option.value ? 'default' : 'outline'}
                  className="justify-start h-auto py-3"
                  onClick={() => setSelectedPresence(option.value)}
                  disabled={activePresence !== null}
                >
                  <div className="flex items-center gap-3">
                    {option.icon}
                    <div className="text-left">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs opacity-70">{option.description}</p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Duração</Label>
              <span className="text-sm text-muted-foreground">{duration}s</span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={([val]) => setDuration(val)}
              min={3}
              max={60}
              step={1}
              disabled={activePresence !== null}
            />
            <p className="text-xs text-muted-foreground">
              Quanto tempo mostrar o indicador (3-60 segundos)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {activePresence ? (
              <Button 
                variant="destructive"
                onClick={stopContinuousPresence}
                className="flex-1"
              >
                <Circle className="w-4 h-4 mr-2 animate-pulse" />
                Parar ({activePresence})
              </Button>
            ) : (
              <>
                <Button 
                  onClick={startContinuousPresence}
                  disabled={sending || !selectedInstance}
                  className="flex-1"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Radio className="w-4 h-4 mr-2" />
                      Iniciar por {duration}s
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => sendPresence(selectedPresence)}
                  disabled={sending || !selectedInstance}
                >
                  1x
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info & Logs */}
      <div className="space-y-6">
        {/* Usage Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Como Usar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Edit3 className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Digitando...</p>
                <p className="text-xs text-muted-foreground">
                  Útil para simular que está preparando uma resposta. O WhatsApp mostra "digitando..." no chat.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Mic className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Gravando áudio...</p>
                <p className="text-xs text-muted-foreground">
                  Mostra que está gravando uma mensagem de voz. Ótimo para preparar o usuário para um áudio.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              ⚠️ O WhatsApp requer que a presença seja enviada a cada 3-5s para manter o indicador visível.
            </p>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum log ainda
                </p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div 
                      key={log.id}
                      className="flex items-start gap-2 text-xs"
                    >
                      {log.type === 'success' && <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5" />}
                      {log.type === 'error' && <XCircle className="w-3 h-3 text-destructive mt-0.5" />}
                      {log.type === 'info' && <Radio className="w-3 h-3 text-blue-500 mt-0.5" />}
                      <div>
                        <span className="text-muted-foreground">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        {' '}
                        <span>{log.message}</span>
                        {log.details && (
                          <span className="text-muted-foreground block">
                            {log.details}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
