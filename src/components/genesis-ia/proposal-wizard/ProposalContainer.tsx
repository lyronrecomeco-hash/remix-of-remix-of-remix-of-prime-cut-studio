import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProposalWizard } from './ProposalWizard';
import { ProposalList } from './ProposalList';

interface ProposalContainerProps {
  affiliateId: string | null;
  onBack?: () => void;
}

type View = 'create' | 'library';

export const ProposalContainer = ({ affiliateId, onBack }: ProposalContainerProps) => {
  const [activeView, setActiveView] = useState<View>('create');

  return (
    <div className="space-y-4">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8 rounded-lg hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold">Proposta Personalizada</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Gere argumentos de venda com IA</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10 w-full sm:w-auto">
          <button
            onClick={() => setActiveView('create')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none justify-center ${
              activeView === 'create'
                ? 'bg-primary text-primary-foreground'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Criar Nova
          </button>
          <button
            onClick={() => setActiveView('library')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none justify-center ${
              activeView === 'library'
                ? 'bg-primary text-primary-foreground'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Biblioteca
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeView === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ProposalWizard affiliateId={affiliateId} />
          </motion.div>
        )}

        {activeView === 'library' && affiliateId && (
          <motion.div
            key="library"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ProposalList affiliateId={affiliateId} />
          </motion.div>
        )}

        {activeView === 'library' && !affiliateId && (
          <motion.div
            key="no-affiliate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[300px] bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-primary/50" />
            </div>
            <h3 className="text-sm font-semibold text-white">Faça login para acessar</h3>
            <p className="text-xs text-white/40 mt-1">
              Suas propostas salvas aparecerão aqui
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};