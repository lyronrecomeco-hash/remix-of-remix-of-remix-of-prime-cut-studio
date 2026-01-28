import { motion } from 'framer-motion';
import { LayoutTemplate, Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreationMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: () => void;
  onStartFromScratch: () => void;
}

export function CreationMethodModal({
  isOpen,
  onClose,
  onSelectTemplate,
  onStartFromScratch,
}: CreationMethodModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Genesis Style */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg sm:max-w-2xl bg-[hsl(220,20%,8%)] border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        </button>

        {/* Header - Genesis Style */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Criar Novo Projeto
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Como você deseja começar?
              </p>
            </div>
          </div>
        </div>

        {/* Options - Genesis Style */}
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Template Option */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onSelectTemplate}
            className="group relative p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-left"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LayoutTemplate className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-0.5 sm:mb-1 flex items-center gap-2">
                  Escolher Modelo
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Templates prontos para personalizar rapidamente
                </p>
              </div>
            </div>
          </motion.button>

          {/* From Scratch Option */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onStartFromScratch}
            className="group relative p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 text-left"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-0.5 sm:mb-1 flex items-center gap-2">
                  Criar do Zero
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Quiz interativo para gerar prompt ultra-completo
                </p>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Footer - Genesis Style */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-5 flex justify-center border-t border-white/10 pt-3 sm:pt-4 bg-white/[0.02]">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:bg-white/10 h-8 text-xs sm:text-sm">
            Cancelar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
