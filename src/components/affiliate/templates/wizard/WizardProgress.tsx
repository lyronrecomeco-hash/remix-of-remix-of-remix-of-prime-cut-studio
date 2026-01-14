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
      {/* Progress bar background */}
      <div className="relative">
        {/* Connector line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-border mx-12" />
        
        {/* Animated progress line */}
        <motion.div
          className="absolute top-6 left-12 h-0.5 bg-gradient-to-r from-primary via-primary to-primary/50"
          initial={{ width: 0 }}
          animate={{ 
            width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 48px)` 
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
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
                  "flex flex-col items-center gap-2 group relative z-10",
                  canClick ? "cursor-pointer" : "cursor-not-allowed"
                )}
                whileHover={canClick ? { scale: 1.05 } : {}}
                whileTap={canClick ? { scale: 0.95 } : {}}
              >
                {/* Circle indicator */}
                <motion.div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isActive && "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/25",
                    !isCompleted && !isActive && "bg-background border-border text-muted-foreground"
                  )}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    boxShadow: isActive 
                      ? '0 0 20px rgba(99, 102, 241, 0.4)' 
                      : '0 0 0px rgba(99, 102, 241, 0)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </motion.div>

                {/* Labels */}
                <div className="text-center">
                  <motion.p
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      isActive && "text-primary",
                      isCompleted && "text-primary",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </motion.p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {step.subtitle}
                  </p>
                </div>

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    className="absolute -bottom-1 w-2 h-2 rounded-full bg-primary"
                    layoutId="activeIndicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="mt-6 sm:hidden">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Etapa {currentStep} de {steps.length}</span>
          <span className="text-primary font-medium">
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
};
