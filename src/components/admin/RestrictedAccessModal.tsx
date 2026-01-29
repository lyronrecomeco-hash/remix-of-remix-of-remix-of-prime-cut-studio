import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, MessageCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface RestrictedAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuLabel?: string;
}

export const RestrictedAccessModal = ({ 
  open, 
  onOpenChange,
  menuLabel 
}: RestrictedAccessModalProps) => {
  const whatsappNumber = '5511999999915'; // WhatsApp Genesis final 15
  const whatsappMessage = encodeURIComponent(
    `Olá! Gostaria de solicitar acesso ao módulo "${menuLabel || 'restrito'}" na minha conta.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-[hsl(222,20%,8%)] border-white/10">
        {/* Header with gradient */}
        <div className="relative px-6 pt-8 pb-6 text-center bg-gradient-to-b from-primary/10 to-transparent">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mb-4"
          >
            <Lock className="w-10 h-10 text-amber-500" />
          </motion.div>
          
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold text-foreground"
          >
            Acesso Restrito
          </motion.h2>
          
          {menuLabel && (
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-sm text-primary mt-1"
            >
              {menuLabel}
            </motion.p>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Esta opção está <span className="text-amber-500 font-medium">inativa</span> em sua conta.
              <br />
              Consulte o seu colaborador ou entre em contato conosco.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col gap-3"
          >
            <Button
              onClick={() => window.open(whatsappUrl, '_blank')}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <MessageCircle className="w-4 h-4" />
              Falar com a Genesis
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Fechar
            </Button>
          </motion.div>

          <p className="text-xs text-center text-muted-foreground">
            WhatsApp: (11) 99999-99<span className="text-primary font-medium">15</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
