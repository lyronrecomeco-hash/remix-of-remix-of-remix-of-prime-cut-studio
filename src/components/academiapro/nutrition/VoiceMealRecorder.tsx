import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceMealRecorderProps {
  onTranscription: (text: string) => void;
  isProcessing: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

export function VoiceMealRecorder({
  onTranscription,
  isProcessing,
  onStartRecording,
  onStopRecording
}: VoiceMealRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      
      setIsRecording(true);
      setRecordingTime(0);
      onStartRecording?.();
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  }, [onStartRecording]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      return;
    }

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          onTranscription(base64);
          resolve();
        };
        reader.readAsDataURL(blob);
      };
      
      mediaRecorderRef.current!.stop();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsRecording(false);
      setRecordingTime(0);
      onStopRecording?.();
    });
  }, [onTranscription, onStopRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}

        {isRecording ? (
          <motion.div
            key="recording"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-4"
          >
            <Button
              size="icon"
              variant="ghost"
              onClick={cancelRecording}
              className="w-10 h-10 rounded-full hover:bg-destructive/10"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </Button>
            
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="relative"
              >
                <div className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
                  <Square className="w-6 h-6 text-destructive-foreground" />
                </div>
              </motion.div>
              <span className="text-sm font-mono mt-2 text-foreground">
                {formatTime(recordingTime)}
              </span>
            </div>
            
            <Button
              size="icon"
              onClick={stopRecording}
              className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90"
            >
              <Square className="w-4 h-4" />
            </Button>
          </motion.div>
        ) : isProcessing ? (
          <motion.div
            key="processing"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <span className="text-sm text-muted-foreground">
              Processando áudio...
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <Button
              size="lg"
              onClick={startRecording}
              className={cn(
                "w-16 h-16 rounded-full",
                "bg-gradient-to-br from-primary to-primary/80",
                "hover:from-primary/90 hover:to-primary/70",
                "shadow-lg hover:shadow-xl transition-all"
              )}
            >
              <Mic className="w-7 h-7" />
            </Button>
            <span className="text-xs text-muted-foreground text-center">
              Toque para gravar sua refeição
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
