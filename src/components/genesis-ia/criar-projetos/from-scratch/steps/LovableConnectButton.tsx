import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Sparkles, Copy, Check, Gift, Rocket, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Official Lovable logo (heart icon)
const LovableLogo = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 256 256" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="256" rx="60" fill="white"/>
    <path 
      d="M128 216C128 216 208 168 208 112C208 78.8 181.2 52 148 52C134.8 52 122.4 56.8 112 64.8C101.6 56.8 89.2 52 76 52C42.8 52 16 78.8 16 112C16 168 96 216 96 216L128 216Z"
      fill="#FF6B6B"
    />
    <path 
      d="M128 216C128 216 48 168 48 112C48 78.8 74.8 52 108 52C121.2 52 133.6 56.8 144 64.8C154.4 56.8 166.8 52 180 52C213.2 52 240 78.8 240 112C240 168 160 216 160 216L128 216Z"
      fill="url(#lovable-heart-grad)"
    />
    <defs>
      <linearGradient id="lovable-heart-grad" x1="48" y1="52" x2="240" y2="216" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF6B6B"/>
        <stop offset="1" stopColor="#FF8E8E"/>
      </linearGradient>
    </defs>
  </svg>
);

interface LovableConnectButtonProps {
  prompt: string;
  projectName: string;
}

export function LovableConnectButton({ prompt, projectName }: LovableConnectButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Referral link with 10 free credits
  const LOVABLE_REFERRAL_LINK = 'https://lovable.dev/invite/G0FY6YR';
  
  // Build Lovable URL with auto-submit
  const buildLovableUrl = () => {
    const encodedPrompt = encodeURIComponent(prompt);
    return `https://lovable.dev/?autosubmit=true#prompt=${encodedPrompt}`;
  };

  const handleCopyAndOpen = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success('Prompt copiado! Abrindo Lovable com 10 créditos grátis...');
      
      // First time users go to referral link, returning users go to auto-submit
      // We use referral link to ensure they get the bonus credits
      setTimeout(() => {
        window.open(LOVABLE_REFERRAL_LINK, '_blank');
        setCopied(false);
      }, 500);
    } catch (err) {
      // Fallback: just open referral link even if copy fails
      toast.info('Abrindo Lovable...');
      window.open(LOVABLE_REFERRAL_LINK, '_blank');
    }
  };

  const handleOpenLovable = () => {
    window.open(LOVABLE_REFERRAL_LINK, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Main Card - Genesis standardized */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 p-5 hover:border-[#FF6B6B]/40 transition-colors"
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Background Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF6B6B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#FF8E8E]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 rounded-xl bg-white shadow-lg shadow-[#FF6B6B]/20 flex items-center justify-center overflow-hidden"
          >
            <LovableLogo className="w-8 h-8" />
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
              Deploy automático ao abrir
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded-lg px-2 py-1.5">
            <Gift className="w-3.5 h-3.5 text-[#FF6B6B]" />
            <span>5 créditos/dia</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded-lg px-2 py-1.5">
            <Zap className="w-3.5 h-3.5 text-[#FF6B6B]" />
            <span>Deploy grátis</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded-lg px-2 py-1.5">
            <Rocket className="w-3.5 h-3.5 text-[#FF6B6B]" />
            <span>Prompt otimizado</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 relative z-10">
          <Button
            onClick={handleCopyAndOpen}
            className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:from-[#FF5555] hover:to-[#FF7777] text-white shadow-lg shadow-[#FF6B6B]/20"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado! Abrindo...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Criar Projeto na Lovable
              </>
            )}
          </Button>
          <Button
            onClick={handleOpenLovable}
            variant="outline"
            className="border-border/60 hover:bg-muted/30 hover:border-[#FF6B6B]/40"
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