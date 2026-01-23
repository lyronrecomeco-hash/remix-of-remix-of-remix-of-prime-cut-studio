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
    <div className="min-h-[calc(100vh-200px)] max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Criar do Zero</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentStepInfo.title} - {currentStepInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-1">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                step.id <= currentStep 
                  ? 'bg-primary' 
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-right">
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
        <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={nextStep}
            disabled={!canProceed}
            className="bg-primary hover:bg-primary/90"
          >
            Próximo
            <ArrowRight className="w-4 h-4 ml-2" />
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
