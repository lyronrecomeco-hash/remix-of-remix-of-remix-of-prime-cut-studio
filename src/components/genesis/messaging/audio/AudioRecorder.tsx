import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
  Mic, 
  Square, 
  Send, 
  Loader2,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Trash2,
  Radio
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { InstanceOption, SendLog } from '../types';

interface AudioRecorderProps {
  instances: InstanceOption[];
}

export const AudioRecorder = ({ instances }: AudioRecorderProps) => {
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [isPtt, setIsPtt] = useState(true); // Push to talk (voice message style)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<SendLog[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audioUrl]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        
        // Revoke previous URL
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        addLog('success', 'Gravação concluída', `${recordingTime}s`);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      addLog('info', 'Gravação iniciada');
    } catch (err: any) {
      addLog('error', 'Erro ao iniciar gravação', err.message);
      toast.error('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    addLog('info', 'Gravação excluída');
  };

  const sendAudio = async () => {
    if (!selectedInstance) {
      toast.error('Selecione uma instância');
      return;
    }
    if (!recipientPhone.trim()) {
      toast.error('Digite o número do destinatário');
      return;
    }
    if (!audioBlob) {
      toast.error('Grave um áudio primeiro');
      return;
    }

    setSending(true);
    addLog('info', 'Enviando áudio...', `Para: ${recipientPhone}`);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      
      const base64Audio = await base64Promise;

      const { data, error } = await supabase.functions.invoke('genesis-backend-proxy', {
        body: {
          action: 'send-audio',
          instanceId: selectedInstance,
          phone: recipientPhone.replace(/\D/g, ''),
          audio: base64Audio,
          ptt: isPtt,
          mimetype: 'audio/ogg; codecs=opus',
          seconds: recordingTime
        }
      });

      if (error) throw error;

      if (data?.success) {
        addLog('success', 'Áudio enviado!', isPtt ? 'Como mensagem de voz' : 'Como arquivo de áudio');
        toast.success('Áudio enviado com sucesso!');
        deleteRecording();
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Audio Recorder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Gravar Áudio
          </CardTitle>
          <CardDescription>
            Grave e envie áudios como mensagem de voz (PTT)
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

          {/* PTT Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Mensagem de Voz (PTT)
              </Label>
              <p className="text-xs text-muted-foreground">
                Envia como áudio que toca no chat (não como arquivo)
              </p>
            </div>
            <Switch
              checked={isPtt}
              onCheckedChange={setIsPtt}
            />
          </div>

          {/* Recording Controls */}
          <div className="flex flex-col items-center gap-4 py-4">
            {/* Recording Button */}
            {!isRecording && !audioBlob && (
              <Button
                size="lg"
                onClick={startRecording}
                className="w-20 h-20 rounded-full"
              >
                <Mic className="w-8 h-8" />
              </Button>
            )}

            {/* Stop Button */}
            {isRecording && (
              <div className="flex flex-col items-center gap-2">
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full animate-pulse"
                >
                  <Square className="w-8 h-8" />
                </Button>
                <span className="text-lg font-mono">
                  {formatTime(recordingTime)}
                </span>
              </div>
            )}

            {/* Playback Controls */}
            {audioBlob && !isRecording && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={playAudio}
                    className="w-12 h-12 rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>
                  <span className="text-lg font-mono">
                    {formatTime(recordingTime)}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={deleteRecording}
                    className="w-12 h-12 rounded-full"
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </Button>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              {isRecording 
                ? 'Clique para parar a gravação'
                : audioBlob
                  ? 'Pronto para enviar'
                  : 'Clique para começar a gravar'
              }
            </p>
          </div>

          {/* Send Button */}
          <Button 
            onClick={sendAudio} 
            disabled={sending || !selectedInstance || !audioBlob}
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
                Enviar Áudio
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
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
                    {log.type === 'info' && <Mic className="w-3 h-3 text-blue-500 mt-0.5" />}
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
  );
};
