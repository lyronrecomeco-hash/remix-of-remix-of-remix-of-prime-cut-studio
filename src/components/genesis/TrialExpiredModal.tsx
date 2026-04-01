/**
 * Modal que bloqueia o acesso quando o período de teste expira
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RenewalModal } from '@/components/genesis-ia/billing/RenewalModal';

interface TrialExpiredModalProps {
  isOpen: boolean;
  userId: string;
  onSuccess?: () => void;
}

export function TrialExpiredModal({ isOpen, userId, onSuccess }: TrialExpiredModalProps) {
  const [showPlans, setShowPlans] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {!showPlans && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md mx-4"
            >
              <div className="bg-card rounded-2xl border border-amber-500/50 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-6 border-b border-amber-500/30">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-amber-500/30 flex items-center justify-center">
                      <Clock className="w-9 h-9 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Período de Teste Encerrado</h2>
                      <p className="text-amber-400/80 text-sm mt-0.5">
                        Seus 3 dias de teste expiraram
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-foreground font-medium text-sm">
                          Seu acesso de teste como Mentorado Santiago acabou
                        </p>
                        <p className="text-muted-foreground text-sm mt-1">
                          Para continuar utilizando todos os recursos do Genesis Hub, 
                          assine um dos nossos planos e tenha acesso ilimitado.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Crown className="w-5 h-5 text-primary" />
                      <p className="text-foreground font-semibold text-sm">
                        Vantagens do plano pago:
                      </p>
                    </div>
                    <ul className="text-muted-foreground text-sm space-y-1.5 ml-8">
                      <li>✅ Acesso completo a todos os módulos</li>
                      <li>✅ Instâncias WhatsApp ilimitadas</li>
                      <li>✅ Suporte prioritário</li>
                      <li>✅ Scanner IA e Radar Global</li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => setShowPlans(true)}
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold text-base gap-2"
                  >
                    <Crown className="w-5 h-5" />
                    Assinar Plano
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <p className="text-center text-muted-foreground text-xs">
                    Seus dados foram preservados e estarão disponíveis após a assinatura
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <RenewalModal
        isOpen={showPlans}
        onClose={() => setShowPlans(false)}
        userId={userId}
        currentPlan="free"
        onSuccess={() => {
          setShowPlans(false);
          onSuccess?.();
        }}
      />
    </>
  );
}
