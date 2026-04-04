import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface EngineOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isStreaming?: boolean;
}

export const EngineOutputModal = ({ isOpen, onClose, title, content, isStreaming }: EngineOutputModalProps) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast.success('Copiado para a área de transferência!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-3xl max-h-[85vh] bg-[hsl(220_25%_12%)] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  {isStreaming && (
                    <span className="text-[10px] text-primary bg-primary/20 px-2 py-0.5 rounded-full animate-pulse">
                      Gerando...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-8 px-2 text-white/50 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copiar
                  </Button>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{content || 'Gerando conteúdo...'}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
