import { useState, useEffect, useRef } from 'react';
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
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [open]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsScanning(true);
      startScanning();
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Não foi possível acessar a câmera');
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setScanResult(null);
  };

  const startScanning = () => {
    // In production, integrate with jsQR library for real QR scanning
    // For now, simulate QR detection
    scanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !isScanning) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Here you would use jsQR library to scan
      // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // const code = jsQR(imageData.data, imageData.width, imageData.height);
    }, 200);

    // Demo: simulate successful scan after 3 seconds
    setTimeout(() => {
      if (isScanning && !scanResult && !isProcessing) {
        handleSuccessfulScan('GYM-GENESIS-DEMO');
      }
    }, 3000);
  };

  const handleSuccessfulScan = async (code: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Validate QR code format
      if (!code.startsWith('GYM-GENESIS-')) {
        setScanResult('error');
        toast.error('QR Code inválido');
        setIsProcessing(false);
        return;
      }

      // Register check-in
      const { error } = await supabase
        .from('gym_check_ins')
        .insert({
          user_id: user?.id,
          checked_in_at: new Date().toISOString(),
          check_in_type: 'qr_code'
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('Você já fez check-in hoje!');
        } else {
          throw error;
        }
      } else {
        toast.success('Check-in realizado com sucesso! 💪');
      }

      setScanResult('success');
      
      // Close after success
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error('Check-in error:', error);
      setScanResult('error');
      toast.error('Erro ao registrar check-in');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFlash = async () => {
    if (!stream) return;
    
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as any;
    
    if (capabilities.torch) {
      await track.applyConstraints({
        advanced: [{ torch: !flashEnabled } as any]
      });
      setFlashEnabled(!flashEnabled);
    } else {
      toast.info('Flash não disponível neste dispositivo');
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
            {/* Scan Frame */}
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

              {/* Scanning animation line */}
              {isScanning && !scanResult && (
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

              {/* Result icon */}
              {scanResult === 'success' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-28 h-28 rounded-full bg-green-500/30 backdrop-blur-sm flex items-center justify-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                  </div>
                </motion.div>
              )}

              {scanResult === 'error' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-28 h-28 rounded-full bg-red-500/30 backdrop-blur-sm flex items-center justify-center">
                    <AlertCircle className="w-16 h-16 text-red-500" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Dimmed overlay outside scan area */}
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
              {isProcessing ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  <span className="text-lg">Processando...</span>
                </div>
              ) : scanResult === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-green-400 font-semibold text-xl">
                    ✓ Check-in realizado!
                  </p>
                  <p className="text-zinc-400">
                    Bom treino, {profile?.full_name?.split(' ')[0]}! 💪
                  </p>
                </motion.div>
              ) : scanResult === 'error' ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-red-400 font-semibold text-lg">QR Code inválido</p>
                  <p className="text-zinc-400 text-sm">
                    Escaneie o código da academia
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Scan className="w-6 h-6 text-orange-500" />
                    <span className="text-lg font-medium">Posicione o QR Code no quadro</span>
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
