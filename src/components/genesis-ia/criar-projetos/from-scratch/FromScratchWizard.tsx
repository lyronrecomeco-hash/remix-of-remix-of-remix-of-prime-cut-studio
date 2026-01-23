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
}

function WizardContent({ onBack, onComplete }: FromScratchWizardProps) {
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
      case 11: return <StepPreview onComplete={onComplete} />;
      default: return null;
    }
  };

  const currentStepInfo = STEPS[currentStep - 1];

  return (
    <div className="min-h-[calc(100vh-200px)] w-full">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Criar do Zero</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {currentStepInfo.title} - {currentStepInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-0.5">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex-1 h-1 rounded-full transition-colors ${
                step.id <= currentStep 
                  ? 'bg-primary' 
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
          Etapa {currentStep} de {totalSteps}
        </p>
      </div>

      {/* Step Content */}
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
      {currentStep < 11 && (
        <div className="flex justify-between mt-6 pt-4 border-t border-white/10">
          <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Voltar
          </Button>
          <Button
            onClick={nextStep}
            disabled={!canProceed}
            size="sm"
            className="bg-primary hover:bg-primary/90 h-8 text-xs"
          >
            Próximo
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
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
