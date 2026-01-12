import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, 
  Send, 
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { InstanceOption, SendLog, COMMON_REACTIONS } from '../types';
import { useReactions } from './useReactions';

interface ReactionManagerProps {
  instances: InstanceOption[];
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥', '👏', '💯'];

export const ReactionManager = ({ instances }: ReactionManagerProps) => {
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [messageId, setMessageId] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('👍');
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<SendLog[]>([]);

  const { reactions, loading: loadingReactions, refresh } = useReactions(selectedInstance);

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

  const sendReaction = async () => {
    if (!selectedInstance) {
      toast.error('Selecione uma instância');
      return;
    }
    if (!recipientPhone.trim()) {
      toast.error('Digite o número do destinatário');
      return;
    }
    if (!messageId.trim()) {
      toast.error('Digite o ID da mensagem');
      return;
    }

    setSending(true);
    addLog('info', 'Enviando reação...', `${selectedEmoji} para msg ${messageId}`);

    try {
      const { data, error } = await supabase.functions.invoke('genesis-backend-proxy', {
        body: {
          action: 'send-reaction',
          instanceId: selectedInstance,
          phone: recipientPhone.replace(/\D/g, ''),
          messageId: messageId,
          emoji: selectedEmoji
        }
      });

      if (error) throw error;

      if (data?.success) {
        addLog('success', 'Reação enviada!', selectedEmoji);
        toast.success('Reação enviada com sucesso!');
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

  const removeReaction = async () => {
    if (!selectedInstance || !recipientPhone || !messageId) {
      toast.error('Preencha todos os campos');
      return;
    }

    setSending(true);
    addLog('info', 'Removendo reação...', `msg ${messageId}`);

    try {
      const { data, error } = await supabase.functions.invoke('genesis-backend-proxy', {
        body: {
          action: 'send-reaction',
          instanceId: selectedInstance,
          phone: recipientPhone.replace(/\D/g, ''),
          messageId: messageId,
          emoji: '' // Empty emoji = remove reaction
        }
      });

      if (error) throw error;

      if (data?.success) {
        addLog('success', 'Reação removida!');
        toast.success('Reação removida com sucesso!');
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      addLog('error', 'Falha ao remover', err.message);
      toast.error(`Erro: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Send Reaction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Enviar Reação
          </CardTitle>
          <CardDescription>
            Envie reações (emoji) em mensagens específicas
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
            <Label>Número do Chat</Label>
            <Input
              placeholder="5511999999999"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
            />
          </div>

          {/* Message ID */}
          <div className="space-y-2">
            <Label>ID da Mensagem</Label>
            <Input
              placeholder="Ex: 3EB0A1B2C3D4E5F6..."
              value={messageId}
              onChange={(e) => setMessageId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              O ID da mensagem é recebido nos webhooks de mensagens
            </p>
          </div>

          {/* Emoji Selection */}
          <div className="space-y-2">
            <Label>Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {REACTION_EMOJIS.map((emoji) => (
                <Button
                  key={emoji}
                  variant={selectedEmoji === emoji ? 'default' : 'outline'}
                  size="icon"
                  className="text-xl h-10 w-10"
                  onClick={() => setSelectedEmoji(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={sendReaction} 
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
                  <Send className="w-4 h-4 mr-2" />
                  Enviar {selectedEmoji}
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={removeReaction} 
              disabled={sending || !selectedInstance}
            >
              Remover
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reactions History & Logs */}
      <div className="space-y-6">
        {/* Received Reactions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Reações Recebidas
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={refresh} disabled={loadingReactions}>
                <RefreshCw className={`w-4 h-4 ${loadingReactions ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma reação capturada ainda. As reações aparecerão aqui quando forem recebidas.
              </p>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {reactions.map((reaction) => (
                    <div 
                      key={reaction.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                    >
                      <span className="text-2xl">{reaction.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {reaction.reactorName || reaction.reactorPhone}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Msg: {reaction.messageId.substring(0, 20)}...
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {reaction.reactedAt.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
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
                      {log.type === 'info' && <Heart className="w-3 h-3 text-pink-500 mt-0.5" />}
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
