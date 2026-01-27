/**
 * Modal que bloqueia o acesso quando conta foi bloqueada por reembolso
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, Ban, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountBlockedModalProps {
  isOpen: boolean;
  reason?: string;
  onContactSupport?: () => void;
}

export function AccountBlockedModal({ 
  isOpen, 
  reason = 'Reembolso processado',
  onContactSupport 
}: AccountBlockedModalProps) {
  if (!isOpen) return null;

  const handleContactWhatsApp = () => {
    window.open('https://wa.me/5527981120322?text=Olá, minha conta foi bloqueada e gostaria de mais informações.', '_blank');
  };

  const handleContactEmail = () => {
    window.location.href = 'mailto:suporte@genesishub.cloud?subject=Conta Bloqueada - Solicitação de Suporte';
  };

  return (
    <AnimatePresence>
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
          {/* Card */}
          <div className="bg-card rounded-2xl border border-destructive/50 shadow-2xl overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-destructive/20 to-red-900/20 p-6 border-b border-destructive/30">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-destructive/30 flex items-center justify-center">
                  <Ban className="w-9 h-9 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Conta Bloqueada</h2>
                  <p className="text-destructive/80 text-sm mt-0.5">
                    Seu acesso foi suspenso
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Warning message */}
              <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <AlertOctagon className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-foreground font-medium text-sm">
                      Motivo: {reason}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Esta conta foi bloqueada e você não pode acessar o painel no momento.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                <p className="text-amber-200/80 text-sm leading-relaxed">
                  Se você acredita que houve um engano ou deseja reativar sua conta, 
                  entre em contato com nosso suporte. Teremos prazer em ajudar.
                </p>
              </div>

              {/* Contact buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleContactWhatsApp}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Falar pelo WhatsApp
                </Button>
                
                <Button
                  onClick={handleContactEmail}
                  variant="outline"
                  className="w-full h-12 font-semibold text-base gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Enviar Email
                </Button>
              </div>

              <p className="text-center text-muted-foreground text-xs">
                Responderemos o mais rápido possível
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}