import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FromScratchProvider, useFromScratch } from './FromScratchContext';
import { StepProjectType } from './steps/StepProjectType';
import { StepNicheSelect } from './steps/StepNicheSelect';
import { StepIdentity } from './steps/StepIdentity';
import { StepLanguage } from './steps/StepLanguage';
import { StepObjectives } from './steps/StepObjectives';
import { StepStructure } from './steps/StepStructure';
import { StepVisual } from './steps/StepVisual';
import { StepFeatures } from './steps/StepFeatures';
import { StepExtras } from './steps/StepExtras';
import { StepTargetAI } from './steps/StepTargetAI';
import { StepPreview } from './steps/StepPreview';

const STEPS = [
  { id: 1, title: 'Tipo', subtitle: 'Escolha o tipo' },
  { id: 2, title: 'Nicho', subtitle: 'Segmento' },
  { id: 3, title: 'Identidade', subtitle: 'Nome e info' },
  { id: 4, title: 'Idioma', subtitle: 'Regional' },
  { id: 5, title: 'Objetivos', subtitle: 'Metas' },
  { id: 6, title: 'Estrutura', subtitle: 'Páginas' },
  { id: 7, title: 'Visual', subtitle: 'Cores' },
  { id: 8, title: 'Features', subtitle: 'Funções' },
  { id: 9, title: 'Extras', subtitle: 'PWA/SEO' },
  { id: 10, title: 'IA Destino', subtitle: 'Ferramenta' },
  { id: 11, title: 'Preview', subtitle: 'Finalizar' },
];

interface FromScratchWizardProps {
  onBack: () => void;
  onComplete: () => void;
  affiliateId?: string;
}

function WizardContent({ onBack, onComplete, affiliateId }: FromScratchWizardProps) {
  const { currentStep, totalSteps, nextStep, prevStep, canProceed } = useFromScratch();

  const currentStepInfo = STEPS[currentStep - 1];

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepProjectType />;
      case 2: return <StepNicheSelect />;
      case 3: return <StepIdentity />;
      case 4: return <StepLanguage />;
      case 5: return <StepObjectives />;
      case 6: return <StepStructure />;
      case 7: return <StepVisual />;
      case 8: return <StepFeatures />;
      case 9: return <StepExtras />;
      case 10: return <StepTargetAI />;
      case 11: return <StepPreview onComplete={onComplete} affiliateId={affiliateId} />;
      default: return null;
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onBack();
    } else {
      prevStep();
    }
  };

  return (
    <div className="space-y-0">
      {/* Header Modal-like */}
      <div className="flex items-center justify-between p-4 rounded-t-xl bg-white/5 border border-white/10 border-b-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8 rounded-lg hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-tight">Criar do Zero</h3>
              <p className="text-xs text-muted-foreground">
                {currentStepInfo.title} • {currentStepInfo.subtitle}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
          <span className="text-xs font-semibold text-primary">{currentStep}</span>
          <span className="text-xs text-muted-foreground">de {totalSteps}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1 px-4 py-2 bg-white/5 border-x border-white/10">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`h-1 flex-1 rounded-full transition-colors ${
              step.id <= currentStep ? 'bg-primary' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Content Area - No scroll, extends naturally */}
      <div className="p-4 sm:p-5 rounded-b-xl bg-white/5 border border-white/10 border-t-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Footer */}
        {currentStep < 11 && (
          <div className="flex justify-end pt-4 mt-4 border-t border-white/10">
            <Button
              onClick={nextStep}
              disabled={!canProceed}
              size="sm"
              className="h-9 text-sm gap-2"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function FromScratchWizard(props: FromScratchWizardProps) {
  return (
    <FromScratchProvider>
      <WizardContent {...props} />
    </FromScratchProvider>
  );
}
