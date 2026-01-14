import React from 'react';
import { motion } from 'framer-motion';
import { Check, Settings, Palette, Type, Puzzle, FileText } from 'lucide-react';
import { useWizard } from './WizardContext';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  Settings,
  Palette,
  Type,
  Puzzle,
  FileText,
};

export const WizardProgress: React.FC = () => {
  const { steps, currentStep, goToStep, isStepValid } = useWizard();

  return (
    <div className="w-full">
      {/* Desktop Progress */}
      <div className="hidden sm:block relative">
        {/* Connector line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-10" />
        
        {/* Animated progress line */}
        <motion.div
          className="absolute top-5 left-10 h-0.5 bg-gradient-to-r from-primary to-primary/60"
          initial={{ width: 0 }}
          animate={{ 
            width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 40px)` 
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon] || Settings;
            const isCompleted = step.isCompleted && !step.isActive;
            const isActive = step.isActive;
            const canClick = index + 1 < currentStep || (index + 1 === currentStep) || 
              (index + 1 > currentStep && isStepValid(index));

            return (
              <motion.button
                key={step.id}
                onClick={() => canClick && goToStep(step.id)}
                disabled={!canClick}
                className={cn(
                  "flex flex-col items-center gap-1.5 group relative z-10",
                  canClick ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                )}
                whileHover={canClick ? { scale: 1.05 } : {}}
                whileTap={canClick ? { scale: 0.95 } : {}}
              >
                {/* Circle indicator */}
                <motion.div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isActive && "bg-primary/10 border-primary text-primary ring-4 ring-primary/20",
                    !isCompleted && !isActive && "bg-background border-border text-muted-foreground"
                  )}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </motion.div>

                {/* Labels */}
                <div className="text-center">
                  <motion.p
                    className={cn(
                      "text-xs font-medium transition-colors duration-200",
                      (isActive || isCompleted) ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </motion.p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground font-medium">
            Etapa {currentStep} de {steps.length}
          </span>
          <span className="text-primary font-bold">
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-primary to-primary/70 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                step.id <= currentStep ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
