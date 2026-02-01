import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Scan, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Flashlight,
  FlashlightOff
} from 'lucide-react';
import jsQR from 'jsqr';
import { Button } from '@/components/ui/button';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GymQRScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GymQRScanner({ open, onOpenChange }: GymQRScannerProps) {
  const { user, profile } = useGymAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);
  const hasScannedRef = useRef(false);

  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Iniciando câmera...');

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleSuccessfulScan = useCallback(async (code: string) => {
    if (isProcessingRef.current || hasScannedRef.current) return;
    isProcessingRef.current = true;
    hasScannedRef.current = true;

    setStatusMessage('Processando...');

    try {
      // Validate QR code format
      if (!code.startsWith('GYM-GENESIS-')) {
        setScanResult('error');
        toast.error('QR Code inválido');
        isProcessingRef.current = false;
        return;
      }

      if (!user?.id) {
        setScanResult('error');
        toast.error('Você precisa estar logado');
        isProcessingRef.current = false;
        return;
      }

      // Check if already checked-in today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const { data: existing } = await supabase
        .from('gym_check_ins')
        .select('id, checked_in_at')
        .eq('user_id', user.id)
        .gte('checked_in_at', startOfDay.toISOString())
        .lt('checked_in_at', endOfDay.toISOString())
        .limit(1)
        .maybeSingle();

      if (existing) {
        toast.info('Você já fez check-in hoje!');
        setScanResult('success');
        setStatusMessage('Já registrado hoje');
        setTimeout(() => onOpenChange(false), 1500);
        return;
      }

      // Register check-in
      const { error } = await supabase
        .from('gym_check_ins')
        .insert({
          user_id: user.id,
          checked_in_at: new Date().toISOString(),
          method: 'qr'
        });

      if (error) throw error;
      
      toast.success('Check-in realizado com sucesso! 💪');
      setScanResult('success');
      setStatusMessage('Check-in realizado!');
      
      setTimeout(() => onOpenChange(false), 2000);
    } catch (error) {
      console.error('Check-in error:', error);
      setScanResult('error');
      setStatusMessage('Erro ao registrar');
      toast.error('Erro ao registrar check-in');
    } finally {
      isProcessingRef.current = false;
    }
  }, [user, onOpenChange]);

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || hasScannedRef.current || isProcessingRef.current) {
      if (!hasScannedRef.current) {
        rafRef.current = requestAnimationFrame(scanFrame);
      }
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (code?.data) {
      handleSuccessfulScan(code.data);
      return;
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [handleSuccessfulScan]);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage('Acessando câmera...');
    hasScannedRef.current = false;
    isProcessingRef.current = false;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      setIsLoading(false);
      setStatusMessage('Posicione o QR Code');
      
      // Start scanning loop
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (error) {
      console.error('Camera error:', error);
      setIsLoading(false);
      setStatusMessage('Erro ao acessar câmera');
      toast.error('Não foi possível acessar a câmera');
    }
  }, [scanFrame]);

  useEffect(() => {
    if (open) {
      setScanResult(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [open, startCamera, stopCamera]);

  const toggleFlash = async () => {
    if (!streamRef.current) {
      toast.info('Câmera não disponível');
      return;
    }
    
    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      
      if (!capabilities?.torch) {
        toast.info('Flash não disponível neste dispositivo');
        return;
      }
      
      await track.applyConstraints({
        advanced: [{ torch: !flashEnabled } as any]
      });
      setFlashEnabled(!flashEnabled);
      toast.success(flashEnabled ? 'Flash desligado' : 'Flash ligado');
    } catch (error) {
      console.error('Flash error:', error);
      toast.error('Erro ao controlar flash');
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 safe-area-top">
          <div className="p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/20 w-12 h-12"
              >
                <X className="w-6 h-6" />
              </Button>
              <h2 className="text-white font-semibold text-lg">Escanear Check-in</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFlash}
                className="text-white hover:bg-white/20 w-12 h-12"
              >
                {flashEnabled ? (
                  <Flashlight className="w-6 h-6 text-yellow-400" />
                ) : (
                  <FlashlightOff className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Camera View */}
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan Frame Overlay */}
          <div className="relative z-10">
            <motion.div
              animate={scanResult === 'success' ? { scale: [1, 1.05, 1] } : {}}
              className={`w-72 h-72 sm:w-80 sm:h-80 border-4 rounded-3xl relative ${
                scanResult === 'success' 
                  ? 'border-green-500' 
                  : scanResult === 'error'
                  ? 'border-red-500'
                  : 'border-orange-500'
              }`}
            >
              {/* Corner accents */}
              <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl" />
              <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl" />
              <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-orange-500 rounded-bl-2xl" />
              <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-orange-500 rounded-br-2xl" />

              {/* Scanning animation */}
              {!scanResult && !isLoading && (
                <motion.div
                  initial={{ y: -130 }}
                  animate={{ y: 130 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'linear'
                  }}
                  className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full"
                />
              )}

              {/* Loading state */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                </div>
              )}

              {/* Success icon */}
              {scanResult === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-28 h-28 rounded-full bg-green-500/30 backdrop-blur-sm flex items-center justify-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                  </div>
                </motion.div>
              )}

              {/* Error icon */}
              {scanResult === 'error' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-28 h-28 rounded-full bg-red-500/30 backdrop-blur-sm flex items-center justify-center">
                    <AlertCircle className="w-16 h-16 text-red-500" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Dimmed overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-black/50" style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, calc(50% - 144px) calc(50% - 144px), calc(50% - 144px) calc(50% + 144px), calc(50% + 144px) calc(50% + 144px), calc(50% + 144px) calc(50% - 144px), calc(50% - 144px) calc(50% - 144px))'
            }} />
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 z-10 safe-area-bottom">
          <div className="p-6 bg-gradient-to-t from-black/90 to-transparent">
            <div className="text-center text-white max-w-sm mx-auto">
              {scanResult === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-green-400 font-semibold text-xl">✓ Check-in realizado!</p>
                  <p className="text-zinc-400">Bom treino, {profile?.full_name?.split(' ')[0]}! 💪</p>
                </motion.div>
              ) : scanResult === 'error' ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-red-400 font-semibold text-lg">QR Code inválido</p>
                  <p className="text-zinc-400 text-sm">Escaneie o código da academia</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Scan className="w-6 h-6 text-orange-500" />
                    <span className="text-lg font-medium">{statusMessage}</span>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    Escaneie o código na recepção para registrar sua entrada
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
