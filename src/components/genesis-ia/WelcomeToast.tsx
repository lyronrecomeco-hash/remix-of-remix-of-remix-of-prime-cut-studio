import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface WelcomeToastProps {
  userName: string;
  onClose?: () => void;
}

export const WelcomeToast = ({ userName, onClose }: WelcomeToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto dismiss after 60 seconds (1 minute)
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 60000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-20 left-1/2 z-50"
        >
          <div className="relative flex items-start gap-3 px-5 py-4 rounded-xl bg-[#1a2a1a] border border-emerald-500/30 shadow-xl shadow-emerald-500/10 max-w-md">
            {/* Icon */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-emerald-400 mb-1">
                Bem vindo de volta, {userName}
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                A forma mais simples de transformar sua ideia em SaaS cria-e em minutos, gere páginas e textos de vendas e conquiste seus primeiros clientes com IA.
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/50 hover:text-white/80" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
