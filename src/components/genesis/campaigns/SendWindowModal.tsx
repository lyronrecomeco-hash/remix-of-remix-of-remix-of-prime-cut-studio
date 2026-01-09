/**
 * GENESIS CAMPAIGNS - Send Window Modal
 * Animated modal showing when campaign is outside send window
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Moon, Sun, X, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SendWindowModalProps {
  open: boolean;
  onClose: () => void;
  windowStart?: string;
  windowEnd?: string;
}

export function SendWindowModal({
  open,
  onClose,
  windowStart = '08:00',
  windowEnd = '22:00',
}: SendWindowModalProps) {
  // Get current Brazil time
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const currentHour = brazilTime.getHours();
  const currentMinutes = brazilTime.getMinutes();
  const formattedTime = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

  const isNight = currentHour < 8 || currentHour >= 22;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="sr-only">Fora do Horário de Envio</DialogTitle>
          <DialogDescription className="sr-only">
            Sua campanha só pode ser iniciada dentro da janela de envio configurada.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="text-center py-4"
          >
            {/* Animated Icon */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 15 }}
              className="relative mx-auto w-24 h-24 mb-6"
            >
              {/* Background glow */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={cn(
                  "absolute inset-0 rounded-full blur-xl",
                  isNight ? "bg-indigo-500/40" : "bg-orange-500/40"
                )}
              />

              {/* Icon container */}
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={cn(
                  "relative w-24 h-24 rounded-full flex items-center justify-center",
                  isNight
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                    : "bg-gradient-to-br from-orange-400 to-amber-500"
                )}
              >
                {isNight ? (
                  <Moon className="w-12 h-12 text-white" />
                ) : (
                  <Sun className="w-12 h-12 text-white" />
                )}
              </motion.div>

              {/* Floating clock */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 10 }}
                className="absolute -bottom-1 -right-1 bg-background border-2 border-border rounded-full p-2"
              >
                <Clock className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold mb-2"
            >
              Fora do Horário de Envio
            </motion.h3>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground mb-6"
            >
              As campanhas só podem ser iniciadas dentro da janela de envio configurada.
            </motion.p>

            {/* Time Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              {/* Current Time */}
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Horário atual (BR)</p>
                <p className="text-2xl font-bold font-mono">{formattedTime}</p>
              </div>

              {/* Allowed Window */}
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Janela permitida</p>
                <p className="text-2xl font-bold font-mono text-primary">
                  {windowStart.slice(0, 5)}-{windowEnd.slice(0, 5)}
                </p>
              </div>
            </motion.div>

            {/* Warning */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 mb-6"
            >
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span>
                {isNight
                  ? 'Aguarde até as 08:00 para iniciar sua campanha'
                  : 'Você poderá iniciar após as 08:00'}
              </span>
            </motion.div>

            {/* Close Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button onClick={onClose} className="w-full">
                Entendi
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
