import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
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
  { id: 1, title: 'Tipo de Projeto', subtitle: 'Aplicativo ou Site' },
  { id: 2, title: 'Nicho', subtitle: 'Segmento do negócio' },
  { id: 3, title: 'Identidade', subtitle: 'Nome e informações' },
  { id: 4, title: 'Idioma', subtitle: 'Localização e região' },
  { id: 5, title: 'Objetivos', subtitle: 'O que deseja alcançar' },
  { id: 6, title: 'Estrutura', subtitle: 'Páginas e seções' },
  { id: 7, title: 'Visual', subtitle: 'Cores e estilo' },
  { id: 8, title: 'Funcionalidades', subtitle: 'Features e integrações' },
  { id: 9, title: 'Extras', subtitle: 'PWA, SEO e mais' },
  { id: 10, title: 'IA Destino', subtitle: 'Onde usar o prompt' },
  { id: 11, title: 'Finalizar', subtitle: 'Preview e exportar' },
];

interface FromScratchWizardProps {
  onBack: () => void;
  onComplete: () => void;
  affiliateId?: string;
}

function WizardContent({ onBack, onComplete, affiliateId }: FromScratchWizardProps) {
  const { currentStep, totalSteps, nextStep, prevStep, canProceed } = useFromScratch();

  const handleBack = () => {
    if (currentStep === 1) {
      onBack();
    } else {
      prevStep();
    }
  };

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

  const currentStepInfo = STEPS[currentStep - 1];

  return (
    <div className="w-full">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-7 w-7">
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Criar do Zero</h2>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {currentStepInfo.title} - {currentStepInfo.subtitle}
            </p>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {currentStep}/{totalSteps}
        </span>
      </div>

      {/* Compact Progress Bar */}
      <div className="flex items-center gap-0.5 mb-3">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`flex-1 h-0.5 rounded-full transition-colors ${
              step.id <= currentStep ? 'bg-primary' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.15 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Compact Navigation */}
      {currentStep < 11 && (
        <div className="flex justify-between mt-4 pt-3 border-t border-white/10">
          <Button variant="ghost" size="sm" onClick={handleBack} className="h-7 text-[11px] px-2">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Voltar
          </Button>
          <Button
            onClick={nextStep}
            disabled={!canProceed}
            size="sm"
            className="bg-primary hover:bg-primary/90 h-7 text-[11px] px-3"
          >
            Próximo
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      )}
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
