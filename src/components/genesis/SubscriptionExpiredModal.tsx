import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Calendar, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SubscriptionExpiredModalProps {
  isOpen: boolean;
  expiresAt: string | null;
  planName?: string;
  onRenew: () => void;
}

export function SubscriptionExpiredModal({ 
  isOpen, 
  expiresAt, 
  planName,
  onRenew 
}: SubscriptionExpiredModalProps) {
  if (!isOpen) return null;

  const expiredDate = expiresAt ? new Date(expiresAt) : new Date();
  const daysSinceExpiry = differenceInDays(new Date(), expiredDate);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md mx-4"
        >
          {/* Card */}
          <div className="bg-card rounded-2xl border border-destructive/30 shadow-2xl overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-destructive/10 p-6 border-b border-destructive/20">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Assinatura Expirada</h2>
                  <p className="text-destructive/70 text-sm mt-0.5">
                    Seu acesso foi temporariamente suspenso
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Info cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-destructive" />
                    <span className="text-xs text-muted-foreground">Expirou em</span>
                  </div>
                  <p className="text-foreground font-medium text-sm">
                    {format(expiredDate, "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-muted-foreground">Há</span>
                  </div>
                  <p className="text-foreground font-medium text-sm">
                    {daysSinceExpiry} dia{daysSinceExpiry !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Message */}
              <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                <p className="text-amber-200/80 text-sm leading-relaxed">
                  <strong>Seus dados estão seguros!</strong> Renove agora para retomar 
                  o acesso ao painel com todas as suas configurações, instâncias e 
                  automações preservadas.
                </p>
              </div>

              {/* Plan info if available */}
              {planName && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                  <span className="text-muted-foreground text-sm">Último plano ativo</span>
                  <span className="text-foreground font-medium">{planName}</span>
                </div>
              )}

              {/* Action button */}
              <Button
                onClick={onRenew}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base gap-2 shadow-lg"
              >
                <CreditCard className="w-5 h-5" />
                Renovar Agora
              </Button>

              <p className="text-center text-muted-foreground text-xs">
                Pagamento rápido e seguro via PIX ou Cartão
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
