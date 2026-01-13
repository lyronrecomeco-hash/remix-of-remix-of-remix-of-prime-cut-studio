import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  Loader2,
  Copy,
  Send,
  Check,
  MessageSquare,
  User,
  Building2,
  Target,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateProposalTabProps {
  affiliateId: string;
}

interface QuestionStep {
  id: string;
  question: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
  icon: React.ReactNode;
  helperText?: string;
}

const FIXED_QUESTIONS: QuestionStep[] = [
  {
    id: 'company_name',
    question: 'Qual o nome da empresa que você quer prospectar?',
    placeholder: 'Ex: Barbearia do João',
    type: 'text',
    icon: <Building2 className="w-6 h-6" />,
    helperText: 'Digite o nome exato da empresa'
  },
  {
    id: 'company_niche',
    question: 'Qual o nicho ou segmento dessa empresa?',
    placeholder: 'Ex: Barbearia, Salão de Beleza, Restaurante...',
    type: 'text',
    icon: <Target className="w-6 h-6" />,
    helperText: 'Isso ajuda a Luna personalizar a proposta'
  },
  {
    id: 'main_problem',
    question: 'Qual o principal problema que você identificou nessa empresa?',
    placeholder: 'Ex: Não tem site, atendimento lento, não aparece no Google...',
    type: 'textarea',
    icon: <Lightbulb className="w-6 h-6" />,
    helperText: 'Descreva a dor que você percebeu'
  },
];

export const CreateProposalTab = ({ affiliateId }: CreateProposalTabProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [aiQuestions, setAiQuestions] = useState<QuestionStep[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState('');
  const [affiliateName, setAffiliateName] = useState('');
  const [copied, setCopied] = useState(false);
  const [proposalComplete, setProposalComplete] = useState(false);

  // Fetch affiliate name
  useEffect(() => {
    const fetchAffiliate = async () => {
      const { data } = await supabase
        .from('affiliates')
        .select('name')
        .eq('id', affiliateId)
        .single();
      if (data?.name) {
        setAffiliateName(data.name);
      }
    };
    fetchAffiliate();
  }, [affiliateId]);

  const allQuestions = [...FIXED_QUESTIONS, ...aiQuestions];
  const totalSteps = allQuestions.length + 1; // +1 for final proposal
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentQuestion = allQuestions[currentStep];
  const isLastFixedQuestion = currentStep === FIXED_QUESTIONS.length - 1;
  const isLastQuestion = currentStep === allQuestions.length - 1;

  const handleNext = async () => {
    const currentQ = allQuestions[currentStep];
    if (!answers[currentQ.id]?.trim()) {
      toast.error('Por favor, responda a pergunta antes de continuar');
      return;
    }

    // If finishing the third fixed question, generate AI follow-ups
    if (isLastFixedQuestion && aiQuestions.length === 0) {
      setIsLoadingAI(true);
      try {
        const { data, error } = await supabase.functions.invoke('luna-questionnaire-ai', {
          body: {
            companyName: answers.company_name,
            companyNiche: answers.company_niche,
            mainProblem: answers.main_problem,
            affiliateName,
          },
        });

        if (error) throw error;

        if (data?.questions && Array.isArray(data.questions)) {
          const formattedQuestions: QuestionStep[] = data.questions.map((q: any, idx: number) => ({
            id: `ai_q_${idx}`,
            question: q.question,
            placeholder: q.placeholder || 'Digite sua resposta...',
            type: q.type || 'text',
            icon: <Sparkles className="w-6 h-6" />,
            helperText: q.helperText,
          }));
          setAiQuestions(formattedQuestions);
        }
      } catch (error) {
        console.error('Erro ao gerar perguntas:', error);
        // Continue without AI questions
      } finally {
        setIsLoadingAI(false);
      }
    }

    // If it's the last question, generate the proposal
    if (isLastQuestion || (isLastFixedQuestion && aiQuestions.length === 0 && !isLoadingAI)) {
      generateProposal();
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setProposalComplete(false);
    }
  };

  const generateProposal = async () => {
    setIsGeneratingProposal(true);
    setProposalComplete(true);

    try {
      const { data, error } = await supabase.functions.invoke('luna-generate-full-proposal', {
        body: {
          answers,
          affiliateName,
        },
      });

      if (error) throw error;

      if (data?.proposal) {
        setGeneratedProposal(data.proposal);
      }
    } catch (error) {
      console.error('Erro ao gerar proposta:', error);
      // Fallback proposal
      setGeneratedProposal(`Olá, tudo bem?

Me chamo ${affiliateName} e atualmente trabalho em uma empresa especializada em ajudar negócios locais a fortalecer a presença no Google e automatizar processos do dia a dia.

Hoje ajudamos empresas como a ${answers.company_name} a:

✅ Ter um site profissional que gera mais confiança
✅ Aparecer melhor nas buscas do Google
✅ Utilizar sistemas de agendamento automatizado
✅ Melhorar a comunicação com clientes via WhatsApp

Identificamos que ${answers.main_problem?.toLowerCase() || 'há oportunidades de melhoria'}.

Posso te mostrar como podemos ajudar?`);
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedProposal);
    setCopied(true);
    toast.success('Proposta copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setCurrentStep(0);
    setAnswers({});
    setAiQuestions([]);
    setGeneratedProposal('');
    setProposalComplete(false);
  };

  // Proposal Complete View
  if (proposalComplete) {
    return (
      <Card className="border border-primary/20 overflow-hidden">
        <div className="bg-primary/10 p-6 border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Proposta Gerada com Sucesso!
              </h3>
              <p className="text-sm text-muted-foreground">
                Para: {answers.company_name}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {isGeneratingProposal ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Luna está criando sua proposta personalizada...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Mensagem de Prospecção
                </Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="gap-1"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>

              <Textarea
                value={generatedProposal}
                onChange={(e) => setGeneratedProposal(e.target.value)}
                className="min-h-[300px] bg-muted/30 border-border resize-none text-sm"
              />

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={copyToClipboard}
                  className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Proposta
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Nova Proposta
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Question Flow View
  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Pergunta {currentStep + 1} de {allQuestions.length}
          </span>
          <span className="text-primary font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="border border-primary/20 overflow-hidden">
        <div className="bg-primary/10 p-4 border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              {currentQuestion?.icon}
            </div>
            <div className="flex-1">
              {currentStep < FIXED_QUESTIONS.length ? (
                <span className="text-xs text-muted-foreground">Pergunta Base</span>
              ) : (
                <span className="text-xs text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Pergunta da Luna AI
                </span>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {isLoadingAI ? (
            <div className="text-center py-8">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
              <p className="text-foreground font-medium">Luna está pensando...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Criando perguntas personalizadas para sua proposta
              </p>
            </div>
          ) : currentQuestion ? (
            <>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {currentQuestion.question}
                </h3>
                {currentQuestion.helperText && (
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.helperText}
                  </p>
                )}
              </div>

              {currentQuestion.type === 'textarea' ? (
                <Textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => setAnswers(prev => ({
                    ...prev,
                    [currentQuestion.id]: e.target.value
                  }))}
                  placeholder={currentQuestion.placeholder}
                  className="min-h-[120px] bg-muted/30 border-border resize-none"
                />
              ) : (
                <Input
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => setAnswers(prev => ({
                    ...prev,
                    [currentQuestion.id]: e.target.value
                  }))}
                  placeholder={currentQuestion.placeholder}
                  className="bg-muted/30 border-border text-lg py-6"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNext();
                  }}
                />
              )}

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.id]?.trim()}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  {isLastQuestion ? (
                    <>
                      Gerar Proposta
                      <Sparkles className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Continuar
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Info Footer */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <User className="w-4 h-4" />
        <span>Proposta será gerada em nome de: <strong className="text-foreground">{affiliateName || 'Carregando...'}</strong></span>
      </div>
    </div>
  );
};
