import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Rocket,
  Search,
  Radar,
  FileText,
  Settings,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action?: string;
  highlight?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Genesis IA! 🚀',
    description: 'Sua plataforma inteligente para prospecção e vendas. Vamos fazer um tour rápido para você dominar todas as ferramentas.',
    icon: Rocket,
  },
  {
    id: 'prospects',
    title: 'Encontrar Clientes',
    description: 'Use a busca inteligente para encontrar prospects qualificados. A IA analisa e pontua cada lead automaticamente.',
    icon: Search,
    action: 'prospects',
    highlight: 'Clique em "Encontrar Clientes" no menu',
  },
  {
    id: 'radar',
    title: 'Radar Global',
    description: 'O Radar monitora empresas em tempo real e sugere leads quentes. Aceite oportunidades com um clique!',
    icon: Radar,
    action: 'radar',
    highlight: 'Acesse o "Radar Global" para ver leads automáticos',
  },
  {
    id: 'proposals',
    title: 'Propostas Personalizadas',
    description: 'Crie propostas matadoras em minutos usando IA. Responda um quiz simples e deixe a mágica acontecer.',
    icon: FileText,
    action: 'proposals',
    highlight: 'Use "Propostas" para criar textos de venda',
  },
  {
    id: 'settings',
    title: 'Configurações',
    description: 'Personalize templates de mensagem, configure notificações e ajuste o Radar conforme seu ritmo.',
    icon: Settings,
    action: 'settings',
    highlight: 'Ajuste tudo em "Configurações"',
  },
  {
    id: 'done',
    title: 'Pronto para Vender! 🎯',
    description: 'Você está preparado! Comece encontrando seus primeiros clientes ou explorando o Radar Global.',
    icon: CheckCircle2,
  },
];

interface GenesisOnboardingGuideProps {
  userId: string;
  onNavigate?: (tab: string) => void;
}

export const GenesisOnboardingGuide = ({ userId, onNavigate }: GenesisOnboardingGuideProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [userId]);

  const checkOnboardingStatus = async () => {
    try {
      const { data } = await supabase
        .from('genesis_user_onboarding')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!data) {
        // First time user - show onboarding
        await supabase.from('genesis_user_onboarding').insert({
          user_id: userId,
          first_login_at: new Date().toISOString(),
          current_step: 'welcome',
        });
        setIsVisible(true);
      } else if (!data.onboarding_completed) {
        // Continue from where they left off
        const stepIndex = ONBOARDING_STEPS.findIndex(s => s.id === data.current_step);
        setCurrentStepIndex(Math.max(0, stepIndex));
        setCompletedSteps(Array.isArray(data.completed_steps) ? data.completed_steps as string[] : []);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const saveProgress = async (stepId: string, completed: boolean = false) => {
    try {
      const newCompleted = completed 
        ? [...new Set([...completedSteps, stepId])]
        : completedSteps;

      await supabase
        .from('genesis_user_onboarding')
        .update({
          current_step: stepId,
          completed_steps: newCompleted,
          onboarding_completed: completed && stepId === 'done',
          last_step_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      setCompletedSteps(newCompleted);
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  };

  const handleNext = () => {
    const currentStep = ONBOARDING_STEPS[currentStepIndex];
    saveProgress(currentStep.id, true);

    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleClose = async () => {
    await saveProgress('done', true);
    setIsVisible(false);
  };

  const handleAction = (action?: string) => {
    if (action && onNavigate) {
      onNavigate(action);
    }
    handleNext();
  };

  if (!isVisible) return null;

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;
  const Icon = currentStep.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md bg-[hsl(220,20%,10%)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6 pt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
                  <Icon className="w-8 h-8 text-primary" />
                </div>

                {/* Title & Description */}
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-white">
                    {currentStep.title}
                  </h2>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {currentStep.description}
                  </p>
                </div>

                {/* Highlight tip */}
                {currentStep.highlight && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-xs text-primary">
                      {currentStep.highlight}
                    </p>
                  </div>
                )}

                {/* Step indicators */}
                <div className="flex justify-center gap-1.5 pt-2">
                  {ONBOARDING_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentStepIndex
                          ? 'bg-primary'
                          : i < currentStepIndex
                          ? 'bg-primary/50'
                          : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-between gap-3">
            {!isFirstStep ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-white/50 hover:text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            ) : (
              <div />
            )}

            {currentStep.action ? (
              <Button
                size="sm"
                onClick={() => handleAction(currentStep.action)}
                className="gap-2"
              >
                Ir para lá
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : isLastStep ? (
              <Button size="sm" onClick={handleClose} className="gap-2">
                <Rocket className="w-4 h-4" />
                Começar Agora!
              </Button>
            ) : (
              <Button size="sm" onClick={handleNext} className="gap-2">
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
