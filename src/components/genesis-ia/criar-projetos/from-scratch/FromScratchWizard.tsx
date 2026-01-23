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
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
      {/* Fixed Header */}
      <div className="shrink-0 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack} 
              className="h-8 w-8 rounded-lg hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">Criar do Zero</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentStepInfo.title} • {currentStepInfo.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
            <span className="text-xs font-semibold text-primary">{currentStep}</span>
            <span className="text-xs text-muted-foreground">de {totalSteps}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-1">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                step.id < currentStep 
                  ? 'bg-primary' 
                  : step.id === currentStep 
                    ? 'bg-primary/70' 
                    : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Title */}
      <div className="shrink-0 py-4">
        <h3 className="text-lg font-bold text-foreground">
          {currentStepInfo.title === 'Nicho' ? 'Qual é o segmento do negócio?' : currentStepInfo.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {currentStepInfo.title === 'Nicho' 
            ? 'Selecione o nicho para gerar um prompt contextualizado'
            : currentStepInfo.subtitle
          }
        </p>
      </div>

      {/* Scrollable Step Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Navigation */}
      {currentStep < 11 && (
        <div className="shrink-0 flex justify-between items-center pt-4 mt-4 border-t border-white/10">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            className="h-9 px-4 text-sm hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={nextStep}
            disabled={!canProceed}
            className="h-9 px-6 text-sm bg-primary hover:bg-primary/90"
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
