import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, 
  Send, 
  RefreshCw,
  Loader2,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { InstanceOption, SendLog } from '../types';
import { useReactions } from './useReactions';
import { InstanceSelect, PhoneInput, LogsPanel } from '../components';

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
    setLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      details
    }, ...prev].slice(0, 50));
  };

  const sendReaction = async () => {
    if (!selectedInstance) return toast.error('Selecione uma instância');
    if (!recipientPhone.trim()) return toast.error('Digite o número');
    if (!messageId.trim()) return toast.error('Digite o ID da mensagem');

    setSending(true);
    addLog('info', 'Enviando reação...', `${selectedEmoji} → msg ${messageId.substring(0, 15)}...`);

    try {
      const { data, error } = await supabase.functions.invoke('genesis-backend-proxy', {
        body: {
          action: 'send-reaction',
          instanceId: selectedInstance,
          phone: recipientPhone.replace(/\D/g, ''),
          messageId,
          emoji: selectedEmoji
        }
      });

      if (error) throw error;

      if (data?.success) {
        addLog('success', 'Reação enviada!', selectedEmoji);
        toast.success('Reação enviada!');
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
      return toast.error('Preencha todos os campos');
    }

    setSending(true);
    addLog('info', 'Removendo reação...');

    try {
      const { data, error } = await supabase.functions.invoke('genesis-backend-proxy', {
        body: {
          action: 'send-reaction',
          instanceId: selectedInstance,
          phone: recipientPhone.replace(/\D/g, ''),
          messageId,
          emoji: ''
        }
      });

      if (error) throw error;

      if (data?.success) {
        addLog('success', 'Reação removida!');
        toast.success('Reação removida!');
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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Send Reaction Form */}
      <Card className="lg:col-span-3">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-pink-500/10">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className="font-semibold">Enviar Reação</h3>
              <p className="text-sm text-muted-foreground">Reaja a mensagens com emojis</p>
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
              label="Número do Chat"
            />
          </div>

          <div className="space-y-1.5 mb-4">
            <Label className="text-xs font-medium">ID da Mensagem</Label>
            <Input
              placeholder="Ex: 3EB0A1B2C3D4E5F6..."
              value={messageId}
              onChange={(e) => setMessageId(e.target.value)}
              className="h-9 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              O ID é recebido nos webhooks de mensagens
            </p>
          </div>

          <div className="space-y-2 mb-4">
            <Label className="text-xs font-medium">Selecione o Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {REACTION_EMOJIS.map((emoji) => (
                <Button
                  key={emoji}
                  variant={selectedEmoji === emoji ? 'default' : 'outline'}
                  size="icon"
                  className="text-xl h-11 w-11 rounded-xl"
                  onClick={() => setSelectedEmoji(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={sendReaction} disabled={sending || !selectedInstance} className="flex-1">
              {sending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" />Enviar {selectedEmoji}</>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={removeReaction} 
              disabled={sending || !selectedInstance}
              className="px-4"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reactions & Logs */}
      <div className="lg:col-span-2 space-y-4">
        {/* Received Reactions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Reações Recebidas</span>
              </div>
              <Button variant="ghost" size="icon" onClick={refresh} disabled={loadingReactions} className="h-7 w-7">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingReactions ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <ScrollArea className="h-[180px]">
              {reactions.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-xs text-center">As reações aparecerão aqui quando forem recebidas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reactions.map((reaction) => (
                    <div 
                      key={reaction.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30"
                    >
                      <span className="text-2xl">{reaction.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {reaction.reactorName || reaction.reactorPhone}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          Msg: {reaction.messageId.substring(0, 20)}...
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {reaction.reactedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
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
