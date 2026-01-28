import { motion, AnimatePresence } from 'framer-motion';
import { Construction, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DevelopmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export function DevelopmentModal({ isOpen, onClose, featureName }: DevelopmentModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          >
            <div className="w-full max-w-[90vw] sm:max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
              {/* Header gradient - Genesis blue/cyan theme */}
              <div className="h-1 sm:h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
              
              <div className="p-4 sm:p-6 text-center">
                {/* Icon */}
                <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/20"
                  >
                    <Construction className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-500/30 flex items-center justify-center border border-cyan-400/30"
                  >
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
                  </motion.div>
                </div>
                
                {/* Title */}
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">
                  Em Desenvolvimento
                </h2>
                
                {/* Description */}
                <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-6">
                  <span className="text-blue-400 font-medium">{featureName}</span> está sendo 
                  desenvolvida com recursos avançados de IA. Em breve estará disponível 
                  para você criar experiências incríveis!
                </p>
                
                {/* Features coming */}
                <div className="bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-left">
                  <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-wider mb-1.5 sm:mb-2">O que vem por aí:</p>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {['Geração de páginas com IA avançada', 'Templates profissionais', 'Exportação completa'].map((item, i) => (
                      <li key={i} className="flex items-center gap-1.5 sm:gap-2 text-white/70 text-xs sm:text-sm">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Button - Genesis theme */}
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 h-9 sm:h-10 text-sm"
                >
                  Entendi
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
