import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWizard } from './WizardContext';
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
    formData 
  } = useWizard();

  const [copied, setCopied] = React.useState(false);

  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast.success('Prompt copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  const handleComplete = () => {
    onComplete(generatedPrompt);
  };

  const handleBack = () => {
    if (isFirstStep) {
      onBack();
    } else {
      prevStep();
    }
  };

  return (
    <div className="flex items-center justify-between pt-6 border-t border-border">
      {/* Left side - Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="outline"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isFirstStep ? 'Cancelar' : 'Voltar'}
          </span>
        </Button>
      </motion.div>

      {/* Center - Step indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index + 1 === currentStep 
                ? 'bg-primary' 
                : index + 1 < currentStep 
                  ? 'bg-primary/50' 
                  : 'bg-muted'
            }`}
            animate={{
              scale: index + 1 === currentStep ? 1.2 : 1,
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>

      {/* Right side - Next/Complete button */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2"
      >
        {isLastStep ? (
          <>
            <Button
              variant="outline"
              onClick={handleCopyPrompt}
              className="gap-2"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Copiar</span>
            </Button>
            
            <Button
              onClick={handleComplete}
              disabled={!canProceed}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gerar com IA</span>
            </Button>
          </>
        ) : (
          <Button
            onClick={nextStep}
            disabled={!canProceed}
            className="gap-2"
          >
            <span className="hidden sm:inline">Próximo</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </motion.div>
    </div>
  );
};
