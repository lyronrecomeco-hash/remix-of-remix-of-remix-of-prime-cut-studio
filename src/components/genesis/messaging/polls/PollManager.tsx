import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart2, 
  Plus, 
  Trash2, 
  Send, 
  Users,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { InstanceOption, PollOption, SendLog } from '../types';
import { usePollVotes } from './usePollVotes';
import { InstanceSelect, PhoneInput, LogsPanel } from '../components';

interface PollManagerProps {
  instances: InstanceOption[];
}

export const PollManager = ({ instances }: PollManagerProps) => {
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [pollName, setPollName] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);
  const [singleSelect, setSingleSelect] = useState(true);
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<SendLog[]>([]);

  const { results, loading: loadingVotes, refresh } = usePollVotes(selectedInstance);

  const addOption = () => {
    if (options.length >= 12) {
      toast.warning('Máximo de 12 opções');
      return;
    }
    setOptions([...options, { id: Date.now().toString(), text: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(o => o.id !== id));
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o));
  };

  const addLog = (type: SendLog['type'], message: string, details?: string) => {
    setLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      details
    }, ...prev].slice(0, 50));
  };

  const sendPoll = async () => {
    if (!selectedInstance) return toast.error('Selecione uma instância');
    if (!recipientPhone.trim()) return toast.error('Digite o destinatário');
    if (!pollName.trim()) return toast.error('Digite o título');
    
    const validOptions = options.filter(o => o.text.trim());
    if (validOptions.length < 2) return toast.error('Mínimo 2 opções');

    setSending(true);
    addLog('info', 'Enviando enquete...', `Para: ${recipientPhone}`);

    try {
      const { data, error } = await supabase.functions.invoke('genesis-backend-proxy', {
        body: {
          action: 'send-poll',
          instanceId: selectedInstance,
          phone: recipientPhone.replace(/\D/g, ''),
          poll: {
            name: pollName,
            values: validOptions.map(o => o.text),
            selectableCount: singleSelect ? 1 : 0
          }
        }
      });

      if (error) throw error;

      if (data?.success) {
        addLog('success', 'Enquete enviada!', `ID: ${data.messageId || 'N/A'}`);
        toast.success('Enquete enviada!');
        setPollName('');
        setOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      addLog('error', 'Falha ao enviar', err.message);
      toast.error(`Erro: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Create Poll - Main Form */}
      <Card className="lg:col-span-3">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <BarChart2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Criar Enquete</h3>
              <p className="text-sm text-muted-foreground">Crie enquetes interativas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

          <div className="space-y-1.5 mb-4">
            <Label className="text-xs font-medium">Título da Enquete</Label>
            <Input
              placeholder="Ex: Qual horário você prefere?"
              value={pollName}
              onChange={(e) => setPollName(e.target.value)}
              className="h-9"
              maxLength={256}
            />
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Opções ({options.length}/12)</Label>
              <Button variant="ghost" size="sm" onClick={addOption} className="h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {options.map((option, idx) => (
                <div key={option.id} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                    {idx + 1}
                  </div>
                  <Input
                    placeholder={`Opção ${idx + 1}`}
                    value={option.text}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    className="h-9"
                    maxLength={100}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(option.id)}
                    disabled={options.length <= 2}
                    className="h-9 w-9 shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 mb-4">
            <div>
              <Label className="text-sm">Seleção Única</Label>
              <p className="text-xs text-muted-foreground">Uma resposta por pessoa</p>
            </div>
            <Switch checked={singleSelect} onCheckedChange={setSingleSelect} />
          </div>

          <Button onClick={sendPoll} disabled={sending || !selectedInstance} className="w-full">
            {sending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" />Enviar Enquete</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results & Logs */}
      <div className="lg:col-span-2 space-y-4">
        {/* Live Results */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Votos em Tempo Real</span>
              </div>
              <Button variant="ghost" size="icon" onClick={refresh} disabled={loadingVotes} className="h-7 w-7">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingVotes ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <ScrollArea className="h-[180px]">
              {results.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-xs text-center">Os votos aparecerão aqui automaticamente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((result) => (
                    <div key={result.pollId} className="p-3 rounded-lg bg-muted/30">
                      <p className="font-medium text-sm mb-2 truncate">{result.pollName}</p>
                      {result.options.map((opt) => (
                        <div key={opt.id} className="mb-1.5">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="truncate">{opt.text}</span>
                            <span className="text-muted-foreground shrink-0 ml-2">
                              {opt.votes} ({opt.percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${opt.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground mt-2">
                        Total: {result.totalVotes} votos
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <LogsPanel logs={logs} />
      </div>
    </div>
  );
};
