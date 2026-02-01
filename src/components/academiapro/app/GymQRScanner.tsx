import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
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
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setScanResult(null);
  };

  const startScanning = () => {
    const scanInterval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !isScanning) {
        clearInterval(scanInterval);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Simple QR detection simulation - in production use jsQR library
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // For demo purposes, simulate QR detection after 3 seconds
      // In production, use a proper QR library like jsQR
    }, 100);

    // Simulate successful scan after 3 seconds for demo
    setTimeout(() => {
      if (isScanning && !scanResult) {
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
          // Duplicate check-in
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
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
            <h2 className="text-white font-semibold">Escanear Check-in</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFlash}
              className="text-white hover:bg-white/20"
            >
              {flashEnabled ? (
                <Flashlight className="w-6 h-6 text-yellow-400" />
              ) : (
                <FlashlightOff className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Camera View */}
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan Frame Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Scan Frame */}
              <motion.div
                animate={scanResult === 'success' ? { scale: [1, 1.1, 1] } : {}}
                className={`w-64 h-64 border-4 rounded-3xl ${
                  scanResult === 'success' 
                    ? 'border-green-500' 
                    : scanResult === 'error'
                    ? 'border-red-500'
                    : 'border-orange-500'
                }`}
              >
                {/* Corner accents */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-xl" />
              </motion.div>

              {/* Scanning animation */}
              {isScanning && !scanResult && (
                <motion.div
                  initial={{ y: -120 }}
                  animate={{ y: 120 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'linear'
                  }}
                  className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full"
                />
              )}

              {/* Result icon */}
              {scanResult === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-24 h-24 rounded-full bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                  </div>
                </motion.div>
              )}

              {scanResult === 'error' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-24 h-24 rounded-full bg-red-500/20 backdrop-blur-sm flex items-center justify-center">
                    <AlertCircle className="w-16 h-16 text-red-500" />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="text-center text-white">
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando...</span>
                </div>
              ) : scanResult === 'success' ? (
                <div className="space-y-2">
                  <p className="text-green-400 font-semibold text-lg">
                    ✓ Check-in realizado!
                  </p>
                  <p className="text-sm text-zinc-400">
                    Bom treino, {profile?.full_name?.split(' ')[0]}! 💪
                  </p>
                </div>
              ) : scanResult === 'error' ? (
                <div className="space-y-2">
                  <p className="text-red-400 font-semibold">QR Code inválido</p>
                  <p className="text-sm text-zinc-400">Escaneie o código da academia</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Scan className="w-5 h-5 text-orange-500" />
                    <span>Posicione o QR Code no quadro</span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    Escaneie o código da recepção para registrar sua entrada
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
