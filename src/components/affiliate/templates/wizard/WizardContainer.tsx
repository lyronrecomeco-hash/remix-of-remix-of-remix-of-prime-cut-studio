import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WizardProvider, useWizard } from './WizardContext';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';
import { ScrollArea } from '@/components/ui/scroll-area';

// Step components
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
  const { currentStep, steps, formData } = useWizard();
  const [direction, setDirection] = React.useState(0);
  const prevStep = React.useRef(currentStep);

  React.useEffect(() => {
    setDirection(currentStep > prevStep.current ? 1 : -1);
    prevStep.current = currentStep;
  }, [currentStep]);

  const CurrentStepComponent = stepComponents[currentStep];
  const currentStepInfo = steps.find(s => s.id === currentStep);

  return (
    <div className="flex flex-col h-full max-h-[75vh]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Wand2 className="w-5 h-5 text-primary" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
            </motion.div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Criar Template com IA
            </h2>
            <p className="text-xs text-muted-foreground">
              {formData.businessName ? `Para: ${formData.businessName}` : 'Gere seu site personalizado'}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground hover:bg-destructive/10 rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress */}
      <div className="py-4 shrink-0">
        <WizardProgress />
      </div>

      {/* Step Title */}
      <motion.div
        key={`title-${currentStep}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 shrink-0"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            Etapa {currentStep}
          </span>
          <h3 className="text-base font-semibold text-foreground">
            {currentStepInfo?.title}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {currentStepInfo?.subtitle}
        </p>
      </motion.div>

      {/* Step Content */}
      <ScrollArea className="flex-1 min-h-0 pr-2">
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
            className="pb-4"
          >
            {CurrentStepComponent && <CurrentStepComponent />}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>

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
