import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Copy, Check, Rocket, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWizard } from './WizardContext';
import { PromptPreview } from './PromptPreview';
import { toast } from 'sonner';

interface WizardNavigationProps {
  onComplete: (prompt: string) => void;
  onBack: () => void;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({ onComplete, onBack }) => {
  const { 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep, 
    canProceed, 
    generatedPrompt,
  } = useWizard();

  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast.success('Prompt copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  const handleComplete = () => {
    onComplete(generatedPrompt);
    setShowPreview(false);
  };

  const handleBack = () => {
    if (isFirstStep) {
      onBack();
    } else {
      prevStep();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between pt-4 border-t border-border shrink-0">
        {/* Left side - Back button */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isFirstStep ? 'Cancelar' : 'Voltar'}
          </span>
        </Button>

        {/* Center - Step dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index + 1 === currentStep 
                  ? 'bg-primary w-6' 
                  : index + 1 < currentStep 
                    ? 'bg-primary/60 w-1.5' 
                    : 'bg-muted w-1.5'
              }`}
              animate={{
                scale: index + 1 === currentStep ? 1 : 0.9,
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>

        {/* Right side - Next/Complete button */}
        <div className="flex items-center gap-2">
          {isLastStep ? (
            <>
              {/* Preview button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
                className="gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              
              {/* Copy button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
                className="gap-1.5"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
              </Button>
              
              {/* Generate button */}
              <Button
                onClick={handleComplete}
                disabled={!canProceed}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
              >
                <Rocket className="w-4 h-4" />
                <span className="hidden sm:inline">Gerar</span>
                <Sparkles className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed}
              className="gap-2"
            >
              <span>Próximo</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Preview do Prompt
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <PromptPreview 
              onGenerate={handleComplete}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
