import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image, Loader2, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoMealScannerProps {
  onPhotoAnalyzed: (base64: string) => void;
  isProcessing: boolean;
}

export function PhotoMealScanner({
  onPhotoAnalyzed,
  isProcessing
}: PhotoMealScannerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      // Extract base64 without prefix
      const base64 = result.split(',')[1];
      setCapturedBase64(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleAnalyze = useCallback(() => {
    if (capturedBase64) {
      onPhotoAnalyzed(capturedBase64);
    }
  }, [capturedBase64, onPhotoAnalyzed]);

  const handleReset = useCallback(() => {
    setPreviewUrl(null);
    setCapturedBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Analisando foto...</p>
          </motion.div>
        ) : previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-3 w-full"
          >
            <div className="relative w-full max-w-[200px] aspect-square rounded-2xl overflow-hidden border-2 border-border">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 w-8 h-8 bg-background/80 hover:bg-background"
                onClick={handleReset}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-2 w-full max-w-[200px]">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Nova
              </Button>
              <Button
                size="sm"
                onClick={handleAnalyze}
                className="flex-1"
              >
                Analisar
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="capture"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => cameraInputRef.current?.click()}
                className={cn(
                  "w-16 h-16 rounded-2xl p-0",
                  "border-2 border-dashed border-primary/30",
                  "hover:border-primary hover:bg-primary/5"
                )}
              >
                <Camera className="w-6 h-6 text-primary" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-16 h-16 rounded-2xl p-0",
                  "border-2 border-dashed border-muted-foreground/30",
                  "hover:border-primary hover:bg-primary/5"
                )}
              >
                <Image className="w-6 h-6 text-muted-foreground" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Câmera ou galeria
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
