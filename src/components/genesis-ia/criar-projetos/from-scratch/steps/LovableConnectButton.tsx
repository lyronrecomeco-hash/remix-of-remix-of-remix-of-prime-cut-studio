import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Sparkles, Copy, Check, Gift, Rocket, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Lovable logo SVG
const LovableLogo = () => (
  <svg viewBox="0 0 32 32" className="w-6 h-6">
    <defs>
      <linearGradient id="lovable-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="100%" stopColor="#FF8E8E" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#lovable-grad)"/>
    <path 
      d="M16 24c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm0-14c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6z" 
      fill="white"
    />
    <circle cx="16" cy="16" r="3" fill="white"/>
  </svg>
);

interface LovableConnectButtonProps {
  prompt: string;
  projectName: string;
}

export function LovableConnectButton({ prompt, projectName }: LovableConnectButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAndOpen = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success('Prompt copiado! Abrindo Lovable...');
      
      // Open Lovable in new tab after short delay
      setTimeout(() => {
        window.open('https://lovable.dev/projects/create', '_blank');
        setCopied(false);
      }, 800);
    } catch (err) {
      toast.error('Erro ao copiar prompt');
    }
  };

  const handleOpenLovable = () => {
    window.open('https://lovable.dev', '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Main Card */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF6B6B]/10 via-card to-[#FF8E8E]/5 border border-[#FF6B6B]/30 p-5"
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Background Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF6B6B]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#FF8E8E]/10 rounded-full blur-2xl" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="p-2 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] shadow-lg shadow-[#FF6B6B]/30"
          >
            <LovableLogo />
          </motion.div>
          <div className="flex-1">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              Criar na Lovable
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-[#FF6B6B]" />
              </motion.span>
            </h4>
            <p className="text-xs text-muted-foreground">
              Transforme seu prompt em app real
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 rounded-lg px-2 py-1.5">
            <Gift className="w-3.5 h-3.5 text-[#FF6B6B]" />
            <span>10 créditos grátis</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 rounded-lg px-2 py-1.5">
            <Zap className="w-3.5 h-3.5 text-[#FF6B6B]" />
            <span>Deploy instantâneo</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 rounded-lg px-2 py-1.5">
            <Rocket className="w-3.5 h-3.5 text-[#FF6B6B]" />
            <span>100% otimizado</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 relative z-10">
          <Button
            onClick={handleCopyAndOpen}
            className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:from-[#FF5555] hover:to-[#FF7777] text-white shadow-lg shadow-[#FF6B6B]/25"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar & Abrir Lovable
              </>
            )}
          </Button>
          <Button
            onClick={handleOpenLovable}
            variant="outline"
            className="border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10 hover:border-[#FF6B6B]/50"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Tip */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(true)}
              className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              Como funciona? ↓
            </motion.button>
          )}
        </AnimatePresence>

        {/* Expanded Instructions */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold">1</span>
                  <span>Clique em "Copiar & Abrir Lovable"</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold">2</span>
                  <span>Crie uma conta ou faça login (10 créditos grátis!)</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold">3</span>
                  <span>Cole o prompt no chat e veja sua ideia virar realidade</span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center mt-2"
                >
                  Fechar ↑
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}