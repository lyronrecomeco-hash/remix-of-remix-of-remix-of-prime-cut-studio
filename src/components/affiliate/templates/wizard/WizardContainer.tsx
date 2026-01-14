import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WizardProvider, useWizard } from './WizardContext';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';

// Step components (to be implemented in Phase 2 & 3)
import { StepBasicInfo } from './steps/StepBasicInfo';
import { StepVisualStyle } from './steps/StepVisualStyle';
import { StepTypography } from './steps/StepTypography';
import { StepFeatures } from './steps/StepFeatures';
import { StepDetails } from './steps/StepDetails';

interface WizardContainerProps {
  onBack: () => void;
  onComplete: (prompt: string) => void;
}

const stepComponents: Record<number, React.FC> = {
  1: StepBasicInfo,
  2: StepVisualStyle,
  3: StepTypography,
  4: StepFeatures,
  5: StepDetails,
};

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

const WizardContent: React.FC<WizardContainerProps> = ({ onBack, onComplete }) => {
  const { currentStep, steps } = useWizard();
  const [direction, setDirection] = React.useState(0);
  const prevStep = React.useRef(currentStep);

  React.useEffect(() => {
    setDirection(currentStep > prevStep.current ? 1 : -1);
    prevStep.current = currentStep;
  }, [currentStep]);

  const CurrentStepComponent = stepComponents[currentStep];
  const currentStepInfo = steps.find(s => s.id === currentStep);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wand2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Criar Template Personalizado
            </h2>
            <p className="text-sm text-muted-foreground">
              Passo a passo para gerar seu template perfeito
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress */}
      <div className="py-6">
        <WizardProgress />
      </div>

      {/* Step Title */}
      <motion.div
        key={`title-${currentStep}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h3 className="text-lg font-semibold text-foreground">
          {currentStepInfo?.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {currentStepInfo?.subtitle}
        </p>
      </motion.div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="h-full"
          >
            {CurrentStepComponent && <CurrentStepComponent />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <WizardNavigation onComplete={onComplete} onBack={onBack} />
    </div>
  );
};

export const WizardContainer: React.FC<WizardContainerProps> = (props) => {
  return (
    <WizardProvider>
      <WizardContent {...props} />
    </WizardProvider>
  );
};
