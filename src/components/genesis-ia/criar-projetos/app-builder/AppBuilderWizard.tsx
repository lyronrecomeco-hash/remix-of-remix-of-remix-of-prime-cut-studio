import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Smartphone, X } from 'lucide-react';
import { AppBuilderProvider, useAppBuilder } from './AppBuilderContext';
import { AppBuilderPreview } from './AppBuilderPreview';
import { StepAppType } from './steps/StepAppType';
import { StepAppIdentity } from './steps/StepAppIdentity';
import { StepAppColors } from './steps/StepAppColors';
import { StepAppScreens } from './steps/StepAppScreens';
import { StepAppFeatures } from './steps/StepAppFeatures';
import { StepAppTech } from './steps/StepAppTech';
import { StepAppTargetAI } from './steps/StepAppTargetAI';
import { StepAppResult } from './steps/StepAppResult';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AppBuilderWizardProps {
  onBack: () => void;
  onComplete: () => void;
  affiliateId?: string;
}

const STEP_TITLES = [
  'Tipo do App',
  'Identidade',
  'Cores & Tema',
  'Telas',
  'Funcionalidades',
  'Extras Técnicos',
  'IA Destino',
  'Resultado'
];

function WizardContent({ onBack, onComplete, affiliateId }: AppBuilderWizardProps) {
  const { currentStep, totalSteps, nextStep, prevStep, canProceed } = useAppBuilder();
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleBack = () => {
    if (currentStep === 1) {
      onBack();
    } else {
      prevStep();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepAppType />;
      case 2: return <StepAppIdentity />;
      case 3: return <StepAppColors />;
      case 4: return <StepAppScreens />;
      case 5: return <StepAppFeatures />;
      case 6: return <StepAppTech />;
      case 7: return <StepAppTargetAI />;
      case 8: return <StepAppResult onComplete={onComplete} affiliateId={affiliateId} />;
      default: return null;
    }
  };

  const isLastStep = currentStep === totalSteps;

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === 1 ? 'Voltar' : 'Anterior'}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentStep} de {totalSteps}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i + 1 <= currentStep ? 'bg-primary' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mobile preview button */}
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setShowMobilePreview(true)}
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>

      {/* Step title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
            {currentStep}
          </div>
          {STEP_TITLES[currentStep - 1]}
        </h2>
      </div>

      {/* Main content - Split layout on desktop */}
      <div className="flex gap-6">
        {/* Left side - Preview (desktop only) */}
        <div className="hidden lg:block w-[320px] shrink-0">
          <div className="sticky top-4">
            <div className="h-[620px] flex items-center justify-center">
              <AppBuilderPreview />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Preview em tempo real
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            {!isLastStep && (
              <div className="flex justify-between mt-6 pt-4 border-t border-white/10">
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!canProceed}
                  className="bg-primary hover:bg-primary/90"
                >
                  {currentStep === totalSteps - 1 ? 'Gerar Prompt' : 'Próximo'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      <AnimatePresence>
        {showMobilePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowMobilePreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowMobilePreview(false)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="h-[600px] flex items-center justify-center">
                <AppBuilderPreview />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AppBuilderWizard(props: AppBuilderWizardProps) {
  return (
    <AppBuilderProvider>
      <WizardContent {...props} />
    </AppBuilderProvider>
  );
}
