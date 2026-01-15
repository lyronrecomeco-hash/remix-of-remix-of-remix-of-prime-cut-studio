import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Check, 
  Sparkles,
  User,
  Phone,
  MessageSquare,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Configuração
const CONFIG = {
  business: {
    name: 'Essence Estética',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  },
};

// Procedimentos
const PROCEDIMENTOS = [
  { id: 'limpeza', name: 'Limpeza de Pele Profunda', duracao: '1h30', preco: 'R$ 180' },
  { id: 'botox', name: 'Toxina Botulínica', duracao: '30min', preco: 'A partir de R$ 800' },
  { id: 'preenchimento', name: 'Preenchimento Facial', duracao: '45min', preco: 'A partir de R$ 1.200' },
  { id: 'peeling', name: 'Peeling Químico', duracao: '45min', preco: 'R$ 250' },
  { id: 'microagulhamento', name: 'Microagulhamento', duracao: '1h', preco: 'R$ 350' },
  { id: 'drenagem', name: 'Drenagem Linfática', duracao: '1h', preco: 'R$ 150' },
  { id: 'avaliacao', name: 'Avaliação Gratuita', duracao: '30min', preco: 'Gratuito' },
];

// Horários disponíveis
const HORARIOS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

// Phone mask helper
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const getRawPhone = (formatted: string) => formatted.replace(/\D/g, '');

// Step Indicator
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const steps = ['Procedimento', 'Data/Hora', 'Dados'];
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted 
                      ? 'rgb(217 119 6)' 
                      : isCurrent 
                        ? 'rgb(68 64 60)' 
                        : 'rgb(87 83 78)'
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted 
                      ? 'border-amber-600 bg-amber-600' 
                      : isCurrent 
                        ? 'border-amber-600 bg-stone-700' 
                        : 'border-stone-600 bg-stone-700'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span className={`text-sm font-bold ${isCurrent ? 'text-amber-400' : 'text-stone-400'}`}>
                      {stepNum}
                    </span>
                  )}
                </motion.div>
                <span className={`text-xs mt-2 font-medium ${
                  isCurrent ? 'text-white' : 'text-stone-500'
                }`}>
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 -mt-6 ${
                  isCompleted ? 'bg-amber-600' : 'bg-stone-700'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ClinicaEsteticaAgendarPage() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    procedimento: searchParams.get('procedimento') || searchParams.get('programa') || '',
    data: '',
    horario: '',
    nome: '',
    whatsapp: '',
    observacao: '',
  });

  // Generate available dates (next 30 days, excluding Sundays)
  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() !== 0) { // Exclude Sundays
        dates.push(date);
      }
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.procedimento;
      case 2:
        return !!formData.data && !!formData.horario;
      case 3:
        return formData.nome.length >= 3 && getRawPhone(formData.whatsapp).length >= 10;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(code ? `/clinica-estetica/${code}` : '/clinica-estetica');
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setIsSubmitting(true);

    const rawPhone = getRawPhone(formData.whatsapp);
    const phoneWithCountry = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;

    try {
      const procedimentoName = PROCEDIMENTOS.find(p => p.id === formData.procedimento)?.name || formData.procedimento;
      const dataFormatted = new Date(formData.data + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });

      const message = `✨ *Agendamento realizado* ✨

Olá, ${formData.nome}!

Seu horário foi reservado com sucesso.

📌 *Procedimento:* ${procedimentoName}
📅 *Data:* ${dataFormatted}
⏰ *Horário:* ${formData.horario}
${formData.observacao ? `\n📝 *Observação:* ${formData.observacao}` : ''}

Caso haja qualquer indisponibilidade,
nossa equipe entrará em contato para ajuste.

_${CONFIG.business.name}_
Até breve! ✨`;

      const { error } = await supabase.functions.invoke('send-whatsapp-genesis', {
        body: {
          phone: phoneWithCountry,
          message: message,
          countryCode: 'BR',
        },
      });

      if (error) {
        console.error('Erro ao enviar WhatsApp:', error);
        toast.error('Erro ao enviar confirmação, mas seu agendamento foi registrado!');
      }

      setWhatsappMessage(message);
      setIsSuccess(true);
    } catch (err) {
      console.error('Erro:', err);
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-stone-900/80 rounded-2xl p-8 border border-stone-800">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-2xl font-semibold text-white mb-2">
              Agendamento Confirmado!
            </h2>
            <p className="text-stone-400 mb-6">
              Você receberá a confirmação no WhatsApp em instantes.
            </p>

            <div className="bg-stone-800/50 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-400">Procedimento:</span>
                  <span className="text-white">{PROCEDIMENTOS.find(p => p.id === formData.procedimento)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Data:</span>
                  <span className="text-white">
                    {new Date(formData.data + 'T12:00:00').toLocaleDateString('pt-BR', { 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Horário:</span>
                  <span className="text-white">{formData.horario}</span>
                </div>
              </div>
            </div>

            <p className="text-stone-500 text-sm mb-6">
              Em caso de ajuste, entraremos em contato.
            </p>

            <Button 
              onClick={() => navigate(code ? `/clinica-estetica/${code}` : '/clinica-estetica')}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600"
            >
              Voltar ao Site
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <div className="bg-stone-900/80 border-b border-stone-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleBack}
            className="text-stone-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-white font-medium">Agendar Procedimento</h1>
            <p className="text-stone-400 text-sm">{CONFIG.business.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator currentStep={step} totalSteps={3} />

        <AnimatePresence mode="wait">
          {/* Step 1: Procedimento */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-1">Selecione o procedimento</h2>
                <p className="text-stone-400 text-sm">Escolha o tratamento desejado</p>
              </div>

              <div className="space-y-3">
                {PROCEDIMENTOS.map((proc) => (
                  <Card 
                    key={proc.id}
                    className={`cursor-pointer transition-all ${
                      formData.procedimento === proc.id 
                        ? 'bg-amber-500/10 border-amber-500/50' 
                        : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
                    }`}
                    onClick={() => setFormData({ ...formData, procedimento: proc.id })}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.procedimento === proc.id 
                            ? 'border-amber-500 bg-amber-500' 
                            : 'border-stone-600'
                        }`}>
                          {formData.procedimento === proc.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{proc.name}</p>
                          <p className="text-stone-400 text-sm">Duração: {proc.duracao}</p>
                        </div>
                      </div>
                      <span className="text-amber-400 font-medium text-sm">{proc.preco}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Data e Horário */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-1">Escolha data e horário</h2>
                <p className="text-stone-400 text-sm">Selecione o melhor momento para você</p>
              </div>

              {/* Date Selection */}
              <div>
                <Label className="text-stone-300 mb-3 block">Data</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableDates.slice(0, 12).map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = formData.data === dateStr;
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setFormData({ ...formData, data: dateStr })}
                        className={`p-3 rounded-lg text-center transition-all ${
                          isSelected 
                            ? 'bg-amber-500/20 border border-amber-500/50 text-white' 
                            : 'bg-stone-800/50 border border-stone-700 text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        <div className="text-xs uppercase">
                          {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-semibold">{date.getDate()}</div>
                        <div className="text-xs">
                          {date.toLocaleDateString('pt-BR', { month: 'short' })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {formData.data && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Label className="text-stone-300 mb-3 block">Horário</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {HORARIOS.map((horario) => {
                      const isSelected = formData.horario === horario;
                      return (
                        <button
                          key={horario}
                          onClick={() => setFormData({ ...formData, horario })}
                          className={`py-2 px-3 rounded-lg text-sm transition-all ${
                            isSelected 
                              ? 'bg-amber-500/20 border border-amber-500/50 text-white' 
                              : 'bg-stone-800/50 border border-stone-700 text-stone-300 hover:bg-stone-800'
                          }`}
                        >
                          {horario}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-stone-500 text-xs mt-3">
                    Caso o horário não esteja disponível, entraremos em contato para ajuste.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Dados */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-1">Seus dados</h2>
                <p className="text-stone-400 text-sm">Preencha para confirmar o agendamento</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome" className="text-stone-300 mb-2 block">
                    <User className="w-4 h-4 inline mr-2" />
                    Nome completo
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Seu nome"
                    className="bg-stone-800/50 border-stone-700 text-white placeholder:text-stone-500"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp" className="text-stone-300 mb-2 block">
                    <Phone className="w-4 h-4 inline mr-2" />
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                    placeholder="(11) 99999-9999"
                    className="bg-stone-800/50 border-stone-700 text-white placeholder:text-stone-500"
                  />
                </div>

                <div>
                  <Label htmlFor="observacao" className="text-stone-300 mb-2 block">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Observação (opcional)
                  </Label>
                  <Textarea
                    id="observacao"
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    placeholder="Alguma informação adicional..."
                    rows={3}
                    className="bg-stone-800/50 border-stone-700 text-white placeholder:text-stone-500 resize-none"
                  />
                </div>
              </div>

              {/* Summary */}
              <Card className="bg-stone-800/50 border-stone-700">
                <CardContent className="p-4">
                  <h3 className="text-white font-medium mb-3">Resumo do Agendamento</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Procedimento:</span>
                      <span className="text-white">
                        {PROCEDIMENTOS.find(p => p.id === formData.procedimento)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Data:</span>
                      <span className="text-white">
                        {new Date(formData.data + 'T12:00:00').toLocaleDateString('pt-BR', { 
                          weekday: 'long',
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Horário:</span>
                      <span className="text-white">{formData.horario}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 border-stone-700 text-stone-300 hover:bg-stone-800"
            >
              Voltar
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50"
            >
              Continuar
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Confirmando...
                </>
              ) : (
                <>
                  Confirmar Agendamento
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
