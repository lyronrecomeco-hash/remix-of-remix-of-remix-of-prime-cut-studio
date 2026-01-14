import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Copy,
  Check,
  MessageSquare,
  User,
  Building2,
  Target,
  Lightbulb,
  RefreshCw,
  Send,
  Save,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
    id: 'company_phone',
    question: 'Qual o WhatsApp da empresa?',
    placeholder: 'Ex: (11) 99999-9999',
    type: 'text',
    icon: <MessageSquare className="w-6 h-6" />,
    helperText: 'Para enviar a proposta diretamente'
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
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

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
      // Fallback proposal - mensagem base simples
      setGeneratedProposal(`Olá, tudo bem?

Me chamo ${affiliateName} e trabalho ajudando negócios locais a ter presença no Google e automatizar agendamentos e atendimentos.

Hoje desenvolvemos:

✅ Sites profissionais
✅ Sistema de agendamento automático  
✅ Automação de WhatsApp, reduzindo atendimento manual

Entrei em contato porque acredito que essas soluções podem otimizar o dia a dia da ${answers.company_name} e aumentar a conversão de clientes.

Se fizer sentido, posso te explicar rapidamente como funciona.`);
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

  const handleSaveToHistory = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('affiliate_prospects')
        .insert({
          affiliate_id: affiliateId,
          company_name: answers.company_name,
          company_phone: answers.company_phone || null,
          niche: answers.company_niche,
          notes: answers.main_problem,
          status: 'proposal_ready',
          generated_proposal: {
            headline: `Proposta para ${answers.company_name}`,
            problema_identificado: answers.main_problem,
            solucao_proposta: 'Soluções de automação e presença digital',
            beneficios: ['Mais clientes', 'Menos trabalho manual', 'Atendimento 24h'],
            mensagem_whatsapp: generatedProposal,
            raw_content: generatedProposal,
          },
          proposal_generated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Proposta salva no histórico!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar proposta');
    } finally {
      setSaving(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!answers.company_phone) {
      toast.error('Telefone não informado');
      return;
    }

    setSending(true);
    try {
      // First save to history
      const { data: prospect, error: insertError } = await supabase
        .from('affiliate_prospects')
        .insert({
          affiliate_id: affiliateId,
          company_name: answers.company_name,
          company_phone: answers.company_phone,
          niche: answers.company_niche,
          notes: answers.main_problem,
          status: 'proposal_ready',
          generated_proposal: {
            headline: `Proposta para ${answers.company_name}`,
            problema_identificado: answers.main_problem,
            solucao_proposta: 'Soluções de automação e presença digital',
            beneficios: ['Mais clientes', 'Menos trabalho manual', 'Atendimento 24h'],
            mensagem_whatsapp: generatedProposal,
            raw_content: generatedProposal,
          },
          proposal_generated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Then send via WhatsApp
      const { data, error } = await supabase.functions.invoke('prospect-sender', {
        body: {
          action: 'send_single',
          prospect_id: prospect.id,
          affiliate_id: affiliateId,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Proposta enviada via WhatsApp!');
      } else {
        // Fallback: open WhatsApp Web
        openWhatsAppManual();
      }
    } catch (error) {
      console.error('Erro ao enviar:', error);
      // Fallback: open WhatsApp Web
      openWhatsAppManual();
    } finally {
      setSending(false);
    }
  };

  const openWhatsAppManual = () => {
    if (!answers.company_phone) return;
    const phone = answers.company_phone.replace(/\D/g, '');
    const message = encodeURIComponent(generatedProposal);
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    toast.success('Abrindo WhatsApp...');
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
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                Proposta Gerada com Sucesso!
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4" />
                {answers.company_name}
                {answers.company_phone && (
                  <>
                    <span className="text-border">•</span>
                    <MessageSquare className="w-4 h-4" />
                    {answers.company_phone}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {isGeneratingProposal ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Luna está criando sua proposta...
              </h4>
              <p className="text-muted-foreground">
                Analisando dados e personalizando para {answers.company_niche}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="gap-2 text-primary border-primary/30">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Mensagem de Prospecção
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="gap-2"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>

              <Textarea
                value={generatedProposal}
                onChange={(e) => setGeneratedProposal(e.target.value)}
                className="min-h-[350px] bg-muted/30 border-border resize-none text-sm leading-relaxed"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <Button
                  onClick={handleSendWhatsApp}
                  disabled={sending || !answers.company_phone}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Enviar WhatsApp
                </Button>

                <Button
                  variant="outline"
                  onClick={openWhatsAppManual}
                  disabled={!answers.company_phone}
                  className="gap-2"
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir WhatsApp
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSaveToHistory}
                  disabled={saving}
                  className="gap-2"
                  size="lg"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar Histórico
                </Button>

                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="gap-2"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4" />
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
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Pergunta {currentStep + 1} de {allQuestions.length}
            </span>
            <Badge variant="outline" className="text-primary border-primary/30">
              {Math.round(progress)}% completo
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border border-primary/20 overflow-hidden">
        <div className="bg-primary/10 p-4 border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              {currentQuestion?.icon}
            </div>
            <div className="flex-1">
              {currentStep < FIXED_QUESTIONS.length ? (
                <Badge variant="secondary" className="text-xs">
                  Pergunta Base {currentStep + 1}/{FIXED_QUESTIONS.length}
                </Badge>
              ) : (
                <Badge className="text-xs gap-1 bg-primary/20 text-primary border-primary/30">
                  <Sparkles className="w-3 h-3" />
                  Pergunta Luna AI
                </Badge>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {isLoadingAI ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Luna está pensando...
              </h4>
              <p className="text-sm text-muted-foreground">
                Criando perguntas personalizadas para {answers.company_niche}
              </p>
            </div>
          ) : currentQuestion ? (
            <>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
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
                  className="min-h-[140px] bg-muted/30 border-border resize-none text-base"
                />
              ) : (
                <Input
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => setAnswers(prev => ({
                    ...prev,
                    [currentQuestion.id]: e.target.value
                  }))}
                  placeholder={currentQuestion.placeholder}
                  className="bg-muted/30 border-border text-lg h-14"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNext();
                  }}
                />
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
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
                  className="gap-2 bg-primary hover:bg-primary/90 min-w-[160px]"
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
      <Card className="border-border bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground">
                Proposta será gerada em nome de:
              </p>
              <p className="font-semibold text-foreground">
                {affiliateName || 'Carregando...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
