import { motion } from 'framer-motion';
import { LayoutTemplate, Sparkles, ArrowRight, X, Globe, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface CreationMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: () => void;
  onStartFromScratch: (type: 'site' | 'app') => void;
}

export function CreationMethodModal({
  isOpen,
  onClose,
  onSelectTemplate,
  onStartFromScratch,
}: CreationMethodModalProps) {
  const [showTypeChoice, setShowTypeChoice] = useState(false);

  if (!isOpen) return null;

  const handleFromScratchClick = () => {
    setShowTypeChoice(true);
  };

  const handleTypeSelect = (type: 'site' | 'app') => {
    setShowTypeChoice(false);
    onStartFromScratch(type);
  };

  const handleClose = () => {
    setShowTypeChoice(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal - Genesis Style */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[hsl(220,20%,8%)] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Header - Genesis Style */}
        <div className="p-6 pb-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {showTypeChoice ? 'Escolha o Tipo' : 'Criar Novo Projeto'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {showTypeChoice ? 'Site comercial ou aplicativo web?' : 'Como você deseja começar?'}
              </p>
            </div>
          </div>
        </div>

        {/* Options - Genesis Style */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {!showTypeChoice ? (
            <>
              {/* Template Option */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={onSelectTemplate}
                className="group relative p-5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LayoutTemplate className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
                      Escolher Modelo
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-xs text-muted-foreground">
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
                onClick={handleFromScratchClick}
                className="group relative p-5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
                      Criar do Zero
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Quiz interativo para gerar prompt ultra-completo
                    </p>
                  </div>
                </div>
              </motion.button>
            </>
          ) : (
            <>
              {/* Site Option */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => handleTypeSelect('site')}
                className="group relative p-5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
                      Site Comercial
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Landing page, institucional, portfólio
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {['SEO', 'Conversão', 'Design'].map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-blue-500/10 text-[10px] text-blue-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* App Option */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => handleTypeSelect('app')}
                className="group relative p-5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Smartphone className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
                      Aplicativo Web
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      SaaS, dashboard, e-commerce, delivery
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {['CRUD', 'Auth', 'Backend'].map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-purple-500/10 text-[10px] text-purple-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            </>
          )}
        </div>

        {/* Footer - Genesis Style */}
        <div className="px-6 pb-5 flex justify-center border-t border-white/10 pt-4 bg-white/[0.02]">
          {showTypeChoice ? (
            <Button variant="ghost" size="sm" onClick={() => setShowTypeChoice(false)} className="text-muted-foreground hover:bg-white/10">
              ← Voltar
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-muted-foreground hover:bg-white/10">
              Cancelar
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
