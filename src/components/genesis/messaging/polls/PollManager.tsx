import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
  BarChart2, 
  Plus, 
  Trash2, 
  Send, 
  Users,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { InstanceOption, PollOption, PollResult, SendLog } from '../types';
import { usePollVotes } from './usePollVotes';

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

  // Hook para capturar votos em tempo real
  const { votes, results, loading: loadingVotes, refresh } = usePollVotes(selectedInstance);

  const addOption = () => {
    if (options.length >= 12) {
      toast.warning('Máximo de 12 opções permitidas');
      return;
    }
    setOptions([...options, { id: Date.now().toString(), text: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      toast.warning('Mínimo de 2 opções necessárias');
      return;
    }
    setOptions(options.filter(o => o.id !== id));
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o));
  };

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

  const sendPoll = async () => {
    if (!selectedInstance) {
      toast.error('Selecione uma instância');
      return;
    }
    if (!recipientPhone.trim()) {
      toast.error('Digite o número do destinatário');
      return;
    }
    if (!pollName.trim()) {
      toast.error('Digite o título da enquete');
      return;
    }
    
    const validOptions = options.filter(o => o.text.trim());
    if (validOptions.length < 2) {
      toast.error('Adicione pelo menos 2 opções');
      return;
    }

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
        toast.success('Enquete enviada com sucesso!');
        
        // Reset form
        setPollName('');
        setOptions([
          { id: '1', text: '' },
          { id: '2', text: '' },
        ]);
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create Poll */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5" />
            Criar Enquete
          </CardTitle>
          <CardDescription>
            Crie enquetes interativas e capture votos automaticamente
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

          {/* Poll Name */}
          <div className="space-y-2">
            <Label>Título da Enquete</Label>
            <Input
              placeholder="Ex: Qual horário você prefere?"
              value={pollName}
              onChange={(e) => setPollName(e.target.value)}
              maxLength={256}
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Opções ({options.length}/12)</Label>
              <Button variant="ghost" size="sm" onClick={addOption}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {options.map((option, idx) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Input
                    placeholder={`Opção ${idx + 1}`}
                    value={option.text}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    maxLength={100}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(option.id)}
                    disabled={options.length <= 2}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Single Select */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Seleção Única</Label>
              <p className="text-xs text-muted-foreground">
                Permitir apenas uma resposta por pessoa
              </p>
            </div>
            <Switch
              checked={singleSelect}
              onCheckedChange={setSingleSelect}
            />
          </div>

          {/* Send Button */}
          <Button 
            onClick={sendPoll} 
            disabled={sending || !selectedInstance}
            className="w-full"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Enquete
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Poll Results & Logs */}
      <div className="space-y-6">
        {/* Live Results */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Votos em Tempo Real
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={refresh} disabled={loadingVotes}>
                <RefreshCw className={`w-4 h-4 ${loadingVotes ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum voto capturado ainda. Os votos aparecerão aqui automaticamente.
              </p>
            ) : (
              <ScrollArea className="h-[200px]">
                {results.map((result) => (
                  <div key={result.pollId} className="mb-4 p-3 rounded-lg bg-muted/50">
                    <p className="font-medium text-sm mb-2">{result.pollName}</p>
                    {result.options.map((opt) => (
                      <div key={opt.id} className="mb-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{opt.text}</span>
                          <span className="text-muted-foreground">
                            {opt.votes} ({opt.percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
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
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px]">
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
                      {log.type === 'info' && <BarChart2 className="w-3 h-3 text-blue-500 mt-0.5" />}
                      {log.type === 'warning' && <BarChart2 className="w-3 h-3 text-yellow-500 mt-0.5" />}
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
