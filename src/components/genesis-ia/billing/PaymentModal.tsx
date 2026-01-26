/**
 * GENESIS-IA - Payment Modal
 * Modal de pagamento PIX integrado para renovação/upgrade
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Loader2, 
  CheckCircle2, 
  Clock,
  Copy,
  Check,
  QrCode,
  Smartphone,
  Shield,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentCode: string;
  pixBrCode: string;
  pixQrCodeBase64?: string;
  amountCents: number;
  planName: string;
  expiresAt: string;
  onSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  paymentCode,
  pixBrCode,
  pixQrCodeBase64,
  amountCents,
  planName,
  expiresAt,
  onSuccess,
}: PaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isPaid || isExpired) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(expiresAt).getTime();
      const remaining = Math.max(0, expires - now);
      
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setIsExpired(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen, expiresAt, isPaid, isExpired]);

  // Polling for payment status
  useEffect(() => {
    if (!isOpen || isPaid || isExpired || !paymentCode) return;

    const checkStatus = async () => {
      try {
        const { data } = await supabase
          .from('checkout_payments')
          .select('status')
          .eq('payment_code', paymentCode)
          .single();

        if (data?.status === 'paid') {
          setIsPaid(true);
          toast.success('Pagamento confirmado!');
          setTimeout(() => {
            onSuccess();
          }, 2000);
        } else if (data?.status === 'expired') {
          setIsExpired(true);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, [isOpen, paymentCode, isPaid, isExpired, onSuccess]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixBrCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error('Erro ao copiar código');
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  // Paid state
  if (isPaid) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-md rounded-2xl bg-[#0a0f1a] border border-white/10 p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Pagamento Confirmado!
            </h2>
            <p className="text-white/60 mb-4">
              Seu plano foi ativado com sucesso.
            </p>
            <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Expired state
  if (isExpired) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-md rounded-2xl bg-[#0a0f1a] border border-white/10 p-8 text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              PIX Expirado
            </h2>
            <p className="text-white/60 mb-6">
              O tempo para pagamento terminou. Feche e tente novamente.
            </p>
            <Button onClick={onClose} className="w-full">
              Fechar
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0a0f1a] border border-white/10 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header with timer */}
          <div className="sticky top-0 z-10 p-5 border-b border-white/10 bg-gradient-to-r from-primary/10 to-cyan-500/10 backdrop-blur-xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Pagamento PIX</h2>
                <p className="text-sm text-white/50">{planName}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(amountCents)}
                </p>
                <div className="flex items-center gap-1.5 text-white/50 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span className={cn(
                    "font-mono",
                    timeRemaining < 60000 && "text-red-400"
                  )}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="p-4 bg-white rounded-2xl shadow-lg">
                  {pixQrCodeBase64 ? (
                    <img
                      src={pixQrCodeBase64.startsWith('data:') ? pixQrCodeBase64 : `data:image/png;base64,${pixQrCodeBase64}`}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                      <QrCode className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Corner decorations - primary color */}
                <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br-lg" />
              </div>

              <p className="mt-4 text-xs text-white/60 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Escaneie com o app do seu banco
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/40 font-medium">OU COPIE O CÓDIGO</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Copy code */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="font-mono text-xs text-white/70 break-all max-h-16 overflow-y-auto leading-relaxed mb-3">
                {pixBrCode}
              </div>
              
              <button
                onClick={handleCopy}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
                  "text-sm font-semibold transition-all",
                  copied
                    ? "bg-primary text-white"
                    : "bg-primary/20 text-primary hover:bg-primary/30"
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Código copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar código PIX
                  </>
                )}
              </button>
            </div>

            {/* Instructions */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Como pagar com PIX
              </h4>
              <div className="space-y-2">
                {[
                  'Abra o app do seu banco',
                  'Escolha pagar com PIX e escaneie ou cole',
                  'Confirme o pagamento'
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-white/70">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Waiting indicator */}
            <div className="flex items-center justify-center gap-3 py-3">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping absolute" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              </div>
              <span className="text-sm text-white/60">Aguardando pagamento...</span>
            </div>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 text-white/40 text-xs">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>Pagamento seguro</span>
              </div>
              <div className="w-px h-3 bg-white/20" />
              <span className="font-mono">{paymentCode}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
