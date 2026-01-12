import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Radio, 
  Loader2,
  Edit3,
  Mic,
  Circle,
  CircleOff
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { InstanceOption, SendLog, PresenceType } from '../types';
import { InstanceSelect, PhoneInput, LogsPanel } from '../components';
import { cn } from '@/lib/utils';

interface PresenceIndicatorProps {
  instances: InstanceOption[];
}

const PRESENCE_OPTIONS: { value: PresenceType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'composing', label: 'Digitando...', icon: <Edit3 className="w-4 h-4" />, color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  { value: 'recording', label: 'Gravando áudio...', icon: <Mic className="w-4 h-4" />, color: 'bg-green-500/10 text-green-500 border-green-500/30' },
  { value: 'available', label: 'Disponível', icon: <Circle className="w-4 h-4 fill-current" />, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
  { value: 'unavailable', label: 'Indisponível', icon: <CircleOff className="w-4 h-4" />, color: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
];

export const PresenceIndicator = ({ instances }: PresenceIndicatorProps) => {
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [selectedPresence, setSelectedPresence] = useState<PresenceType>('composing');
  const [duration, setDuration] = useState(5);
  const [sending, setSending] = useState(false);
  const [activePresence, setActivePresence] = useState<string | null>(null);
  const [logs, setLogs] = useState<SendLog[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const addLog = (type: SendLog['type'], message: string, details?: string) => {
    setLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      details
    }, ...prev].slice(0, 50));
  };

  const sendPresence = async (presence: PresenceType, continuous: boolean = false) => {
    if (!selectedInstance) return toast.error('Selecione uma instância');
    if (!recipientPhone.trim()) return toast.error('Digite o destinatário');

    if (!continuous) setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('genesis-backend-proxy', {
        body: {
          action: 'send-presence',
          instanceId: selectedInstance,
          phone: recipientPhone.replace(/\D/g, ''),
          presence
        }
      });

      if (error) throw error;
      if (data?.success && !continuous) addLog('success', `Presença "${presence}" enviada!`);
    } catch (err: any) {
      addLog('error', 'Falha', err.message);
      if (!continuous) toast.error(`Erro: ${err.message}`);
    } finally {
      if (!continuous) setSending(false);
    }
  };

  const startContinuousPresence = async () => {
    await sendPresence(selectedPresence, true);
    setActivePresence(selectedPresence);
    addLog('info', `Iniciando "${selectedPresence}"`, `Por ${duration}s`);

    intervalRef.current = setInterval(() => sendPresence(selectedPresence, true), 3000);
    timeoutRef.current = setTimeout(() => stopContinuousPresence(), duration * 1000);
  };

  const stopContinuousPresence = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    await sendPresence('paused', true);
    setActivePresence(null);
    addLog('info', 'Presença encerrada');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Presence Control */}
      <Card className="lg:col-span-3">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Radio className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">Indicador de Presença</h3>
              <p className="text-sm text-muted-foreground">Mostre digitando ou gravando</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <InstanceSelect 
              value={selectedInstance} 
              onValueChange={setSelectedInstance} 
              instances={instances} 
            />
            <PhoneInput 
              value={recipientPhone} 
              onChange={setRecipientPhone} 
            />
          </div>

          <div className="space-y-2 mb-5">
            <Label className="text-xs font-medium">Tipo de Presença</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESENCE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={cn(
                    "justify-start h-auto py-3 px-3",
                    selectedPresence === option.value && option.color,
                    selectedPresence === option.value && "border-2"
                  )}
                  onClick={() => setSelectedPresence(option.value)}
                  disabled={activePresence !== null}
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2 mb-5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Duração</Label>
              <span className="text-sm font-mono font-bold text-primary">{duration}s</span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={([val]) => setDuration(val)}
              min={3}
              max={60}
              step={1}
              disabled={activePresence !== null}
            />
            <p className="text-xs text-muted-foreground">Tempo do indicador (3-60 segundos)</p>
          </div>

          <div className="flex gap-2">
            {activePresence ? (
              <Button variant="destructive" onClick={stopContinuousPresence} className="flex-1">
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
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                  ) : (
                    <><Radio className="w-4 h-4 mr-2" />Iniciar por {duration}s</>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => sendPresence(selectedPresence)}
                  disabled={sending || !selectedInstance}
                  className="px-4"
                >
                  1x
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info & Logs */}
      <div className="lg:col-span-2 space-y-4">
        {/* How to Use */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-3">Como Funciona</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5">
                <Edit3 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">Digitando...</p>
                  <p className="text-xs text-muted-foreground">Mostra que está preparando uma resposta</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-green-500/5">
                <Mic className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">Gravando áudio...</p>
                  <p className="text-xs text-muted-foreground">Mostra que está gravando uma mensagem de voz</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              ⚠️ O WhatsApp requer envio a cada 3-5s para manter o indicador visível.
            </p>
          </CardContent>
        </Card>

        <LogsPanel logs={logs} />
      </div>
    </div>
  );
};
