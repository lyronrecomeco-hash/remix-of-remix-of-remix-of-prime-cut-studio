import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Target,
  MessageSquare,
  Users,
  ArrowRight,
  CheckCircle,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Bem-vindo ao Genesis Hub!',
    description: 'Sua plataforma completa de automação WhatsApp. Vamos configurar sua conta em poucos passos.',
    icon: <Zap className="w-8 h-8" />,
  },
  {
    id: 2,
    title: 'Conecte seu WhatsApp',
    description: 'Escaneie o QR Code para conectar sua primeira instância e começar a automatizar.',
    icon: <MessageSquare className="w-8 h-8" />,
    action: 'Conectar WhatsApp',
  },
  {
    id: 3,
    title: 'Crie seu primeiro Chatbot',
    description: 'Use nossos templates prontos ou crie do zero com o Flow Builder visual.',
    icon: <Target className="w-8 h-8" />,
    action: 'Ver Templates',
  },
  {
    id: 4,
    title: 'Importe seus Contatos',
    description: 'Organize seus contatos em listas para disparos de campanhas inteligentes.',
    icon: <Users className="w-8 h-8" />,
    action: 'Importar Contatos',
  },
  {
    id: 5,
    title: 'Tudo Pronto!',
    description: 'Você está pronto para automatizar seu atendimento e disparar campanhas. Boas vendas!',
    icon: <CheckCircle className="w-8 h-8" />,
  },
];

interface OnboardingGuideProps {
  onComplete: () => void;
  onStepAction?: (step: number) => void;
  currentStep?: number;
}

export function OnboardingGuide({ onComplete, onStepAction, currentStep = 1 }: OnboardingGuideProps) {
  const [step, setStep] = useState(currentStep);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleAction = () => {
    onStepAction?.(step);
    handleNext();
  };

  const currentStepData = steps[step - 1];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Skip Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10"
            onClick={handleComplete}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Progress Bar */}
          <div className="h-1 bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-primary to-primary/60"
            />
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Icon */}
            <motion.div
              key={step}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mx-auto mb-6 text-primary"
            >
              {currentStepData.icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              key={`title-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold mb-3"
            >
              {currentStepData.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              key={`desc-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mb-8"
            >
              {currentStepData.description}
            </motion.p>

            {/* Step Indicator */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    width: i + 1 === step ? 24 : 8,
                    backgroundColor: i + 1 <= step ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                  }}
                  className="h-2 rounded-full"
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              {step > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Voltar
                </Button>
              )}

              {currentStepData.action ? (
                <>
                  <Button variant="outline" onClick={handleNext}>
                    Pular
                  </Button>
                  <Button onClick={handleAction} className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    {currentStepData.action}
                  </Button>
                </>
              ) : (
                <Button onClick={handleNext} className="gap-2 min-w-[140px]">
                  {step === steps.length ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Começar!
                    </>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default OnboardingGuide;
