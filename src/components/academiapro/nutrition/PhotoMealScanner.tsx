import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image, Loader2, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PhotoMealScannerProps {
  onPhotoAnalyzed: (base64: string) => void;
  isProcessing: boolean;
}

// Compress and convert image to JPEG base64
async function processImage(file: File): Promise<{ preview: string; base64: string }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      // Create canvas for compression
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // Max dimensions
      const MAX_SIZE = 1024;
      let { width, height } = img;
      
      if (width > height && width > MAX_SIZE) {
        height = (height * MAX_SIZE) / width;
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width = (width * MAX_SIZE) / height;
        height = MAX_SIZE;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get as JPEG with 80% quality
      const preview = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = preview.split(',')[1];
      
      resolve({ preview, base64 });
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    
    // Read file
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function PhotoMealScanner({
  onPhotoAnalyzed,
  isProcessing
}: PhotoMealScannerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem válido');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 10MB');
      return;
    }
    
    setIsLoadingImage(true);
    
    try {
      const { preview, base64 } = await processImage(file);
      setPreviewUrl(preview);
      setCapturedBase64(base64);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Erro ao processar imagem');
    } finally {
      setIsLoadingImage(false);
    }
  }, []);

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
        {isProcessing || isLoadingImage ? (
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
            <p className="text-sm text-muted-foreground">
              {isLoadingImage ? 'Carregando...' : 'Analisando foto...'}
            </p>
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
