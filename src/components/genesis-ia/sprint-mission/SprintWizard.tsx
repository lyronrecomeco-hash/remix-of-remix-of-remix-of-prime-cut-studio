import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Loader2,
  Target,
  DollarSign,
  Calendar,
  BarChart3,
  AlertTriangle,
  Briefcase,
  Clock,
  Zap,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { SPRINT_STEPS, SprintMissionFormData, GeneratedSprint } from './types';
import { SprintDashboard } from './SprintDashboard';

const iconMap: Record<string, React.ElementType> = {
  target: Target,
  'dollar-sign': DollarSign,
  calendar: Calendar,
  'chart-bar': BarChart3,
  'alert-triangle': AlertTriangle,
  briefcase: Briefcase,
  clock: Clock,
  zap: Zap
};

export const SprintWizard = () => {
  const { genesisUser } = useGenesisAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SprintMissionFormData>({
    goal_title: '',
    goal_value: '',
    goal_deadline: '',
    current_situation: '',
    main_obstacle: '',
    available_resources: '',
    daily_hours: '',
    priority_focus: ''
  });
  const [selectedChips, setSelectedChips] = useState<Record<string, string[]>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSprint, setGeneratedSprint] = useState<GeneratedSprint | null>(null);

  const currentQuestion = SPRINT_STEPS[currentStep];
  const progress = ((currentStep + 1) / SPRINT_STEPS.length) * 100;
  const isLastStep = currentStep === SPRINT_STEPS.length - 1;
  const userName = genesisUser?.name?.split(' ')[0] || 'Parceiro';

  const getValue = () => {
    // For chips, return joined values
    if (currentQuestion.type === 'chips' && selectedChips[currentQuestion.id]) {
      return selectedChips[currentQuestion.id].join(', ');
    }
    return formData[currentQuestion.id as keyof SprintMissionFormData] || '';
  };

  const setValue = (value: string) => {
    setFormData(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const toggleChip = (option: string) => {
    const currentId = currentQuestion.id;
    setSelectedChips(prev => {
      const current = prev[currentId] || [];
      // For single-select chips (like deadline), replace
      if (['goal_deadline', 'daily_hours', 'priority_focus', 'main_obstacle'].includes(currentId)) {
        return { ...prev, [currentId]: [option] };
      }
      // For multi-select, toggle
      if (current.includes(option)) {
        return { ...prev, [currentId]: current.filter(o => o !== option) };
      }
      return { ...prev, [currentId]: [...current, option] };
    });
    
    // Also update formData
    setFormData(prev => ({
      ...prev,
      [currentId]: option
    }));
  };

  const isChipSelected = (option: string) => {
    const chips = selectedChips[currentQuestion.id] || [];
    return chips.includes(option);
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    const value = getValue();
    return value.trim().length > 0;
  };

  const handleNext = async () => {
    if (!canProceed()) {
      toast.error('Por favor, responda esta pergunta');
      return;
    }
    
    if (isLastStep) {
      await handleGenerate();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Build complete form with chip selections
      const completeData = {
        ...formData,
        available_resources: selectedChips['available_resources']?.join(', ') || formData.available_resources
      };

      const { data, error } = await supabase.functions.invoke('luna-sprint-generator', {
        body: {
          formData: completeData,
          userName
        }
      });

      if (error) throw error;

      if (data?.sprint) {
        setGeneratedSprint(data.sprint);
        toast.success('Sprint criado com sucesso! 🚀');
      } else {
        throw new Error('Sprint não retornado');
      }
    } catch (error) {
      console.error('Erro ao gerar sprint:', error);
      toast.error('Erro ao gerar sprint. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedSprint(null);
    setCurrentStep(0);
    setSelectedChips({});
    setFormData({
      goal_title: '',
      goal_value: '',
      goal_deadline: '',
      current_situation: '',
      main_obstacle: '',
      available_resources: '',
      daily_hours: '',
      priority_focus: ''
    });
  };

  const IconComponent = currentQuestion.icon ? iconMap[currentQuestion.icon] : Target;

  // Show sprint dashboard if generated
  if (generatedSprint) {
    return (
      <SprintDashboard 
        sprint={generatedSprint} 
        userName={userName}
        formData={formData}
        onReset={handleReset}
      />
    );
  }

  // Generating state
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] sm:min-h-[480px] bg-white/5 border border-white/10 p-4" style={{ borderRadius: '14px' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto">
            <Rocket className="w-7 h-7 sm:w-8 sm:h-8 text-orange-400 animate-bounce" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Montando sua Missão...</h3>
            <p className="text-xs sm:text-sm text-white/50">A IA está criando seu plano de execução personalizado</p>
          </div>
          <div className="flex items-center gap-2 justify-center text-xs text-white/40">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Analisando metas e recursos</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[400px] sm:min-h-[480px] bg-white/5 border border-white/10 overflow-hidden" style={{ borderRadius: '14px' }}>
      {/* Header */}
      <div className="px-3 sm:px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs sm:text-sm">Missão Sprint</h4>
              <p className="text-[10px] sm:text-xs text-white/40">
                Etapa {currentStep + 1} de {SPRINT_STEPS.length}
              </p>
            </div>
          </div>
          {currentStep > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-white/50 hover:text-white hover:bg-white/10 h-8 px-2 sm:px-3 text-xs"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          )}
        </div>
        <Progress value={progress} className="h-1 sm:h-1.5 bg-white/10" />
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col justify-center px-3 sm:px-6 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 sm:space-y-5"
          >
            {/* Question */}
            <div className="text-center space-y-1 sm:space-y-2">
              <h2 className="text-base sm:text-xl font-bold text-white leading-tight">
                {currentQuestion.question}
              </h2>
              {currentQuestion.helperText && (
                <p className="text-[11px] sm:text-sm text-white/50">
                  {currentQuestion.helperText}
                </p>
              )}
            </div>

            {/* Input */}
            <div className="max-w-md mx-auto w-full">
              {currentQuestion.type === 'text' && (
                <Input
                  value={formData[currentQuestion.id as keyof SprintMissionFormData] || ''}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder={currentQuestion.placeholder}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-10 sm:h-12 text-center text-sm sm:text-base"
                  autoFocus
                />
              )}

              {currentQuestion.type === 'textarea' && (
                <Textarea
                  value={formData[currentQuestion.id as keyof SprintMissionFormData] || ''}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[80px] sm:min-h-[100px] text-sm resize-none"
                  autoFocus
                />
              )}

              {currentQuestion.type === 'chips' && currentQuestion.options && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center max-h-[160px] sm:max-h-[180px] overflow-y-auto py-1">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleChip(option)}
                      className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
                        isChipSelected(option)
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-3 sm:px-4 py-3 border-t border-white/10 bg-white/5">
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`w-full h-10 sm:h-11 font-medium text-sm transition-all ${
            isLastStep 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {isLastStep ? (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Iniciar Missão
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
