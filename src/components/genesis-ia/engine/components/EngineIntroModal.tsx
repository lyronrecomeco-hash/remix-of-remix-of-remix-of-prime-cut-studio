import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Sparkles, Target, Layers, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EngineIntroModalProps {
  isOpen: boolean;
  onContinue: (dontShowAgain: boolean) => void;
}

export const EngineIntroModal = ({ isOpen, onContinue }: EngineIntroModalProps) => {
  const [dontShow, setDontShow] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-lg bg-[hsl(220_25%_12%)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header accent */}
              <div className="h-0.5 bg-primary/60" />

              <div className="p-6 sm:p-8">
                {/* Icon */}
                <div className="flex justify-center mb-5">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 border border-white/[0.06] flex items-center justify-center">
                    <Cpu className="w-7 h-7 text-primary" />
                  </div>
                </div>

                <h2 className="text-lg font-bold text-white text-center mb-1">
                  Genesis Engine
                </h2>
                <p className="text-xs text-white/40 text-center mb-6">
                  Motor de Conversão e Planejamento Estratégico
                </p>

                {/* Features */}
                <div className="space-y-2.5 mb-6">
                  {[
                    { icon: Sparkles, title: 'IA Contextual Integrada', desc: 'Analisa automaticamente o prospect e gera estratégias personalizadas.' },
                    { icon: Target, title: 'Canvas Estratégico', desc: 'Organize visualmente blocos de estratégia, oferta, escopo e entrega.' },
                    { icon: Layers, title: 'Geração Completa', desc: 'Gere prompts, blueprints técnicos, escopos e planos de execução.' },
                    { icon: Zap, title: 'Conversão Acelerada', desc: 'Transforme propostas aceitas em projetos estruturados em minutos.' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white/80">{title}</h4>
                        <p className="text-[11px] text-white/40 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Don't show again */}
                <label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dontShow}
                    onChange={(e) => setDontShow(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                  />
                  <span className="text-xs text-white/40">Não mostrar novamente</span>
                </label>

                {/* Actions - NO NEON, normal button */}
                <Button
                  onClick={() => onContinue(dontShow)}
                  className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl"
                >
                  Abrir Genesis Engine
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
