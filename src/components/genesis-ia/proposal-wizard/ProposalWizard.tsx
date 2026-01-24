import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle
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
import { WIZARD_STEPS, ProposalFormData, GeneratedProposal } from './types';
import { ProposalResult } from './ProposalResult';

export const ProposalWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProposalFormData>({
    company_name: '',
    niche: '',
    main_problem: '',
    target_audience: '',
    current_solution: '',
    budget_range: '',
    urgency: '',
    contact_phone: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState<GeneratedProposal | null>(null);

  const currentQuestion = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  const getValue = () => {
    return formData[currentQuestion.id as keyof ProposalFormData] || '';
  };

  const setValue = (value: string) => {
    setFormData(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    return getValue().trim().length > 0;
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error('Por favor, preencha este campo');
      return;
    }
    
    if (isLastStep) {
      handleGenerate();
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
      const { data, error } = await supabase.functions.invoke('prospect-analyzer', {
        body: {
          action: 'generate_proposal_only',
          company_name: formData.company_name,
          niche: formData.niche,
          main_pain: formData.main_problem,
          additional_info: `
            Público-alvo: ${formData.target_audience || 'Não informado'}
            Solução atual: ${formData.current_solution || 'Não informado'}
            Orçamento: ${formData.budget_range || 'Não definido'}
            Urgência: ${formData.urgency || 'Não informada'}
          `.trim()
        }
      });

      if (error) throw error;

      if (data?.proposal) {
        setGeneratedProposal(data.proposal);
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
    setFormData({
      company_name: '',
      niche: '',
      main_problem: '',
      target_audience: '',
      current_solution: '',
      budget_range: '',
      urgency: '',
      contact_phone: ''
    });
  };

  // Show result if proposal is generated
  if (generatedProposal) {
    return (
      <ProposalResult 
        proposal={generatedProposal} 
        companyName={formData.company_name}
        phone={formData.contact_phone}
        onReset={handleReset}
      />
    );
  }

  // Generating state
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-[520px] bg-white/5 border border-white/10" style={{ borderRadius: '12px' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Gerando proposta...</h3>
            <p className="text-sm text-white/50">A IA está criando uma proposta personalizada</p>
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
    <div className="flex flex-col h-[520px] bg-white/5 border border-white/10 overflow-hidden" style={{ borderRadius: '12px' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Criar Proposta</h4>
              <p className="text-xs text-white/40">Pergunta {currentStep + 1} de {WIZARD_STEPS.length}</p>
            </div>
          </div>
          {currentStep > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-white/50 hover:text-white hover:bg-white/10 h-9"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Voltar
            </Button>
          )}
        </div>
        <Progress value={progress} className="h-1.5 bg-white/10" />
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Question */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">
                {currentQuestion.question}
              </h2>
              {currentQuestion.helperText && (
                <p className="text-sm text-white/50">
                  {currentQuestion.helperText}
                </p>
              )}
            </div>

            {/* Input */}
            <div className="max-w-md mx-auto">
              {currentQuestion.type === 'text' && (
                <Input
                  value={getValue()}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder={currentQuestion.placeholder}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 text-center text-base"
                  autoFocus
                />
              )}

              {currentQuestion.type === 'textarea' && (
                <Textarea
                  value={getValue()}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px] text-base resize-none"
                  autoFocus
                />
              )}

              {currentQuestion.type === 'select' && currentQuestion.options && (
                <Select value={getValue()} onValueChange={setValue}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                    <SelectValue placeholder={currentQuestion.placeholder} />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(220,20%,12%)] border-white/10">
                    {currentQuestion.options.map((option) => (
                      <SelectItem 
                        key={option} 
                        value={option}
                        className="text-white hover:bg-white/10 focus:bg-white/10"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Required indicator */}
            {currentQuestion.required && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-white/40">
                <AlertCircle className="w-3 h-3" />
                <span>Campo obrigatório</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 bg-white/5">
        <Button
          onClick={handleNext}
          disabled={currentQuestion.required && !canProceed()}
          className="w-full h-11 bg-purple-500 hover:bg-purple-600 text-white font-medium"
        >
          {isLastStep ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Proposta com IA
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
            className="w-full mt-2 text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Pular esta pergunta
          </button>
        )}
      </div>
    </div>
  );
};
