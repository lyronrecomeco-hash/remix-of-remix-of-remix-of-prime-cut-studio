import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  Building,
  Briefcase,
  AlertTriangle,
  UserCheck,
  Users,
  History,
  Star,
  Phone,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { WIZARD_STEPS, ProposalFormData, GeneratedProposal, COPY_STYLES } from './types';
import { ProposalResult } from './ProposalResult';

const iconMap: Record<string, React.ElementType> = {
  building: Building,
  briefcase: Briefcase,
  'alert-triangle': AlertTriangle,
  'user-check': UserCheck,
  users: Users,
  history: History,
  star: Star,
  phone: Phone
};

export const ProposalWizard = ({ affiliateId }: { affiliateId?: string | null }) => {
  const { genesisUser } = useGenesisAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProposalFormData>({
    company_name: '',
    company_niche: '',
    main_problem: '',
    decision_maker: '',
    competitors: '',
    failed_attempts: '',
    dream_result: '',
    contact_phone: '',
    copy_style: 'balanced',
    ai_questions: []
  });
  const [customNiche, setCustomNiche] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState<GeneratedProposal | null>(null);
  const [showAIQuestions, setShowAIQuestions] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<Array<{ question: string; placeholder: string; answer: string }>>([]);
  const [loadingAIQuestions, setLoadingAIQuestions] = useState(false);

  const currentQuestion = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;
  const userName = genesisUser?.name || 'Consultor';

  const getValue = () => {
    return formData[currentQuestion.id as keyof ProposalFormData] as string || '';
  };

  const setValue = (value: string) => {
    setFormData(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    const value = getValue();
    if (currentQuestion.id === 'company_niche' && customNiche) return true;
    return value.trim().length > 0;
  };

  const handleNext = async () => {
    if (!canProceed()) {
      toast.error('Por favor, preencha este campo');
      return;
    }

    // If custom niche, use it
    if (currentQuestion.id === 'company_niche' && customNiche) {
      setFormData(prev => ({ ...prev, company_niche: customNiche }));
    }
    
    if (isLastStep) {
      // First fetch AI follow-up questions, then generate proposal
      await fetchAIQuestions();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (showAIQuestions) {
      setShowAIQuestions(false);
      setAiQuestions([]);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const fetchAIQuestions = async () => {
    setLoadingAIQuestions(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('luna-questionnaire-ai', {
        body: {
          companyName: formData.company_name,
          companyNiche: formData.company_niche || customNiche,
          mainProblem: formData.main_problem,
          affiliateName: userName
        }
      });

      if (error) throw error;

      if (data?.questions && data.questions.length > 0) {
        setAiQuestions(data.questions.map((q: any) => ({
          question: q.question,
          placeholder: q.placeholder || '',
          answer: ''
        })));
        setShowAIQuestions(true);
      } else {
        // No AI questions, proceed directly
        await handleGenerate();
      }
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
      // Proceed without AI questions on error
      await handleGenerate();
    } finally {
      setLoadingAIQuestions(false);
    }
  };

  const handleAIQuestionAnswer = (index: number, answer: string) => {
    setAiQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, answer } : q
    ));
  };

  const handleGenerateWithAIAnswers = async () => {
    // Store AI answers in formData
    setFormData(prev => ({
      ...prev,
      ai_questions: aiQuestions.map(q => ({
        question: q.question,
        answer: q.answer
      }))
    }));
    
    await handleGenerate();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Build answers object
      const answers: Record<string, string> = {
        company_name: formData.company_name,
        company_niche: formData.company_niche || customNiche,
        main_problem: formData.main_problem,
        decision_maker: formData.decision_maker,
        competitors: formData.competitors,
        failed_attempts: formData.failed_attempts,
        dream_result: formData.dream_result
      };

      // Add AI question answers
      aiQuestions.forEach((q, i) => {
        if (q.answer) {
          answers[`ai_q_${i}`] = q.answer;
        }
      });

      const { data, error } = await supabase.functions.invoke('luna-generate-full-proposal', {
        body: {
          answers,
          affiliateName: userName,
          copyStyle: formData.copy_style || 'balanced'
        }
      });

      if (error) throw error;

      if (data?.proposal) {
        setGeneratedProposal({
          mensagem_prospecao: data.proposal
        });
        toast.success('Proposta gerada com sucesso!');
      } else {
        throw new Error('Proposta não retornada');
      }
    } catch (error) {
      console.error('Erro ao gerar proposta:', error);
      toast.error('Erro ao gerar proposta. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedProposal(null);
    setCurrentStep(0);
    setShowAIQuestions(false);
    setAiQuestions([]);
    setCustomNiche('');
    setFormData({
      company_name: '',
      company_niche: '',
      main_problem: '',
      decision_maker: '',
      competitors: '',
      failed_attempts: '',
      dream_result: '',
      contact_phone: '',
      ai_questions: []
    });
  };

  const IconComponent = currentQuestion.icon ? iconMap[currentQuestion.icon] : FileText;

  // Show result if proposal is generated
  if (generatedProposal) {
    return (
      <ProposalResult 
        proposal={generatedProposal} 
        companyName={formData.company_name}
        userName={userName}
        phone={formData.contact_phone}
        formData={formData}
        affiliateId={affiliateId}
        onReset={handleReset}
      />
    );
  }

  // Loading AI questions state
  if (loadingAIQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] sm:min-h-[480px] bg-white/5 border border-white/10 p-4" style={{ borderRadius: '14px' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto">
            <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Analisando contexto...</h3>
            <p className="text-xs sm:text-sm text-white/50">A IA está criando perguntas personalizadas</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // AI Follow-up questions view
  if (showAIQuestions && aiQuestions.length > 0) {
    return (
      <div className="flex flex-col min-h-[400px] sm:min-h-[480px] bg-white/5 border border-white/10 overflow-hidden" style={{ borderRadius: '14px' }}>
        {/* Header */}
        <div className="px-3 sm:px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Perguntas Inteligentes</h4>
                <p className="text-[10px] sm:text-xs text-white/40">Personalizadas para {formData.company_name}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-white/50 hover:text-white hover:bg-white/10 h-8 px-2 sm:px-3 text-xs"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          </div>
        </div>

        {/* Questions */}
        <div className="flex-1 px-3 sm:px-4 py-4 overflow-y-auto space-y-4">
          {aiQuestions.map((q, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <label className="text-xs sm:text-sm text-white font-medium">
                {index + 1}. {q.question}
              </label>
              <Textarea
                value={q.answer}
                onChange={(e) => handleAIQuestionAnswer(index, e.target.value)}
                placeholder={q.placeholder || 'Sua resposta...'}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[70px] sm:min-h-[80px] text-sm resize-none"
              />
            </motion.div>
          ))}

          {/* Copy Style Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: aiQuestions.length * 0.1 }}
            className="space-y-2 pt-2 border-t border-white/10"
          >
            <label className="text-xs sm:text-sm text-white font-medium flex items-center gap-2">
              🎯 Estilo da Copy
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COPY_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setFormData(prev => ({ ...prev, copy_style: style.id as any }))}
                  className={`p-2 rounded-lg text-left transition-all ${
                    formData.copy_style === style.id
                      ? 'bg-primary/20 border border-primary/50'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm">{style.emoji}</span>
                  <span className={`text-xs font-medium ml-1 ${formData.copy_style === style.id ? 'text-primary' : 'text-white'}`}>
                    {style.label}
                  </span>
                  <p className="text-[10px] text-white/40 mt-0.5">{style.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-4 py-3 border-t border-white/10 bg-white/5">
          <Button
            onClick={handleGenerateWithAIAnswers}
            disabled={isGenerating}
            className="w-full h-10 sm:h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar Proposta Matadora
          </Button>
        </div>
      </div>
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
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-spin" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Gerando proposta...</h3>
            <p className="text-xs sm:text-sm text-white/50">Criando mensagem personalizada para {formData.company_name}</p>
          </div>
          <div className="flex items-center gap-2 justify-center text-xs text-white/40">
            <Sparkles className="w-3 h-3" />
            <span>Isso pode levar alguns segundos</span>
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
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs sm:text-sm">Criar Proposta</h4>
              <p className="text-[10px] sm:text-xs text-white/40">
                Pergunta {currentStep + 1} de {WIZARD_STEPS.length}
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
                  value={getValue()}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder={currentQuestion.placeholder}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-10 sm:h-12 text-center text-sm sm:text-base"
                  autoFocus
                />
              )}

              {currentQuestion.type === 'textarea' && (
                <Textarea
                  value={getValue()}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[80px] sm:min-h-[100px] text-sm resize-none"
                  autoFocus
                />
              )}

              {currentQuestion.type === 'select' && currentQuestion.options && (
                <Select value={getValue()} onValueChange={setValue}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-10 sm:h-12 text-sm">
                    <SelectValue placeholder={currentQuestion.placeholder} />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(220,20%,12%)] border-white/10">
                    {currentQuestion.options.map((option) => (
                      <SelectItem 
                        key={option} 
                        value={option}
                        className="text-white hover:bg-white/10 focus:bg-white/10 text-sm"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {currentQuestion.type === 'chips' && currentQuestion.options && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center max-h-[140px] sm:max-h-[160px] overflow-y-auto">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setValue(option);
                          setCustomNiche('');
                        }}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
                          getValue() === option
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={customNiche}
                    onChange={(e) => {
                      setCustomNiche(e.target.value);
                      setValue('');
                    }}
                    placeholder="Ou digite outro nicho..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-9 sm:h-10 text-center text-xs sm:text-sm"
                  />
                </div>
              )}
            </div>

            {/* Required indicator */}
            {currentQuestion.required && (
              <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-white/40">
                <AlertCircle className="w-3 h-3" />
                <span>Campo obrigatório</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-3 sm:px-4 py-3 border-t border-white/10 bg-white/5">
        <Button
          onClick={handleNext}
          disabled={currentQuestion.required && !canProceed()}
          className="w-full h-10 sm:h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm"
        >
          {isLastStep ? (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Analisar e Gerar Proposta
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
        
        {!currentQuestion.required && !isLastStep && (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="w-full mt-2 text-[10px] sm:text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Pular esta pergunta
          </button>
        )}
      </div>
    </div>
  );
};
