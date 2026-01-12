import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Mic, 
  Square, 
  Send, 
  Loader2,
  Play,
  Pause,
  Trash2,
  Radio
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { InstanceOption, SendLog } from '../types';
import { InstanceSelect, PhoneInput, LogsPanel } from '../components';

interface AudioRecorderProps {
  instances: InstanceOption[];
}

export const AudioRecorder = ({ instances }: AudioRecorderProps) => {
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [isPtt, setIsPtt] = useState(true);
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

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audioUrl]);

  const addLog = (type: SendLog['type'], message: string, details?: string) => {
    setLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      details
    }, ...prev].slice(0, 50));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
        addLog('success', 'Gravação concluída', `${recordingTime}s`);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      addLog('info', 'Gravação iniciada');
    } catch (err: any) {
      addLog('error', 'Erro no microfone', err.message);
      toast.error('Erro ao acessar microfone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
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
    if (!selectedInstance) return toast.error('Selecione uma instância');
    if (!recipientPhone.trim()) return toast.error('Digite o destinatário');
    if (!audioBlob) return toast.error('Grave um áudio primeiro');

    setSending(true);
    addLog('info', 'Enviando áudio...', `Para: ${recipientPhone}`);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
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
        addLog('success', 'Áudio enviado!', isPtt ? 'Mensagem de voz' : 'Arquivo');
        toast.success('Áudio enviado!');
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

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Audio Recorder */}
      <Card className="lg:col-span-3">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Mic className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">Gravar Áudio</h3>
              <p className="text-sm text-muted-foreground">Envie mensagens de voz (PTT)</p>
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

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 mb-5">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">Mensagem de Voz (PTT)</Label>
                <p className="text-xs text-muted-foreground">Toca direto no chat</p>
              </div>
            </div>
            <Switch checked={isPtt} onCheckedChange={setIsPtt} />
          </div>

          {/* Recording Controls */}
          <div className="flex flex-col items-center gap-4 py-6 mb-4 rounded-xl bg-muted/30">
            {!isRecording && !audioBlob && (
              <Button
                size="lg"
                onClick={startRecording}
                className="w-20 h-20 rounded-full text-lg"
              >
                <Mic className="w-8 h-8" />
              </Button>
            )}

            {isRecording && (
              <div className="flex flex-col items-center gap-3">
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full animate-pulse"
                >
                  <Square className="w-8 h-8" />
                </Button>
                <span className="text-2xl font-mono font-bold">
                  {formatTime(recordingTime)}
                </span>
              </div>
            )}

            {audioBlob && !isRecording && (
              <div className="flex items-center gap-4">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={playAudio}
                  className="w-14 h-14 rounded-full"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
                <span className="text-xl font-mono font-bold min-w-[60px] text-center">
                  {formatTime(recordingTime)}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={deleteRecording}
                  className="w-14 h-14 rounded-full hover:bg-destructive/10"
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {isRecording ? 'Clique para parar' : audioBlob ? 'Pronto para enviar' : 'Clique para gravar'}
            </p>
          </div>

          <Button onClick={sendAudio} disabled={sending || !selectedInstance || !audioBlob} className="w-full">
            {sending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" />Enviar Áudio</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Logs */}
      <div className="lg:col-span-2">
        <LogsPanel logs={logs} maxHeight="h-[400px]" />
      </div>
    </div>
  );
};
