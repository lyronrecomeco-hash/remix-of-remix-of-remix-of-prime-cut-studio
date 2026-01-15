import { useState } from 'react';
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
  { id: 'limpeza', name: 'Limpeza de Pele', duracao: '1h30' },
  { id: 'botox', name: 'Toxina Botulínica', duracao: '30min' },
  { id: 'preenchimento', name: 'Preenchimento Facial', duracao: '45min' },
  { id: 'peeling', name: 'Peeling Químico', duracao: '45min' },
  { id: 'microagulhamento', name: 'Microagulhamento', duracao: '1h' },
  { id: 'drenagem', name: 'Drenagem Linfática', duracao: '1h' },
  { id: 'avaliacao', name: 'Avaliação Gratuita', duracao: '30min' },
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
const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = ['Procedimento', 'Data/Hora', 'Seus Dados'];
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
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
                  }}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${
                    isCompleted 
                      ? 'border-rose-500 bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-rose-200' 
                      : isCurrent 
                        ? 'border-rose-400 bg-white text-rose-600 shadow-rose-100' 
                        : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stepNum}</span>
                  )}
                </motion.div>
                <span className={`text-xs mt-2 font-medium hidden sm:block ${
                  isCurrent ? 'text-rose-600' : isCompleted ? 'text-rose-500' : 'text-slate-400'
                }`}>
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 md:mx-2 -mt-6 sm:-mt-0 transition-colors ${
                  isCompleted ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-slate-200'
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
      if (date.getDay() !== 0) {
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-rose-200/50 border border-rose-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-rose-500" />
            </motion.div>

            <h2 className="text-xl md:text-2xl font-semibold text-slate-800 mb-2">
              Agendamento Confirmado!
            </h2>
            <p className="text-slate-500 mb-6 text-sm md:text-base">
              Você receberá a confirmação no WhatsApp em instantes.
            </p>

            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 mb-6 text-left border border-rose-100">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Procedimento:</span>
                  <span className="text-slate-800 font-medium">{PROCEDIMENTOS.find(p => p.id === formData.procedimento)?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Data:</span>
                  <span className="text-slate-800 font-medium">
                    {new Date(formData.data + 'T12:00:00').toLocaleDateString('pt-BR', { 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Horário:</span>
                  <span className="text-slate-800 font-medium">{formData.horario}</span>
                </div>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              Em caso de ajuste, entraremos em contato.
            </p>

            <Button 
              onClick={() => navigate(code ? `/clinica-estetica/${code}` : '/clinica-estetica')}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-300/40 font-medium"
            >
              Voltar ao Site
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-rose-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 md:py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleBack}
            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-slate-800 font-semibold text-sm md:text-base">Agendar Procedimento</h1>
              <p className="text-slate-500 text-xs">{CONFIG.business.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        <StepIndicator currentStep={step} />

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
                <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-1">Selecione o procedimento</h2>
                <p className="text-slate-500 text-sm">Escolha o tratamento desejado</p>
              </div>

              <div className="space-y-3">
                {PROCEDIMENTOS.map((proc) => (
                  <Card 
                    key={proc.id}
                    className={`cursor-pointer transition-all ${
                      formData.procedimento === proc.id 
                        ? 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-300 shadow-md shadow-rose-100' 
                        : 'bg-white border-slate-200 hover:border-rose-200 hover:shadow-md hover:shadow-rose-50'
                    }`}
                    onClick={() => setFormData({ ...formData, procedimento: proc.id })}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          formData.procedimento === proc.id 
                            ? 'border-rose-500 bg-gradient-to-br from-rose-500 to-pink-500' 
                            : 'border-slate-300'
                        }`}>
                          {formData.procedimento === proc.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-slate-800 font-medium">{proc.name}</p>
                          <p className="text-slate-500 text-sm">Duração: {proc.duracao}</p>
                        </div>
                      </div>
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
                <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-1">Escolha data e horário</h2>
                <p className="text-slate-500 text-sm">Selecione o melhor momento para você</p>
              </div>

              {/* Date Selection */}
              <div>
                <Label className="text-slate-700 mb-3 block font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  Data
                </Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availableDates.slice(0, 12).map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = formData.data === dateStr;
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setFormData({ ...formData, data: dateStr })}
                        className={`p-2 md:p-3 rounded-xl text-center transition-all ${
                          isSelected 
                            ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/50' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300 hover:shadow-md'
                        }`}
                      >
                        <div className="text-[10px] md:text-xs uppercase font-medium">
                          {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </div>
                        <div className="text-base md:text-lg font-bold">{date.getDate()}</div>
                        <div className="text-[10px] md:text-xs">
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
                  <Label className="text-slate-700 mb-3 block font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-500" />
                    Horário
                  </Label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {HORARIOS.map((horario) => {
                      const isSelected = formData.horario === horario;
                      return (
                        <button
                          key={horario}
                          onClick={() => setFormData({ ...formData, horario })}
                          className={`py-2.5 px-2 md:px-3 rounded-xl text-sm font-medium transition-all ${
                            isSelected 
                              ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/50' 
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300 hover:shadow-md'
                          }`}
                        >
                          {horario}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-slate-400 text-xs mt-3">
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
                <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-1">Seus dados</h2>
                <p className="text-slate-500 text-sm">Preencha para confirmar o agendamento</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome" className="text-slate-700 mb-2 block font-medium">
                    <User className="w-4 h-4 inline mr-2 text-rose-400" />
                    Nome completo
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Seu nome"
                    className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp" className="text-slate-700 mb-2 block font-medium">
                    <Phone className="w-4 h-4 inline mr-2 text-rose-400" />
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <Label htmlFor="observacao" className="text-slate-700 mb-2 block font-medium">
                    <MessageSquare className="w-4 h-4 inline mr-2 text-rose-400" />
                    Observação (opcional)
                  </Label>
                  <Textarea
                    id="observacao"
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    placeholder="Alguma informação adicional?"
                    rows={3}
                    className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:ring-rose-400 resize-none"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-100">
                <h4 className="text-slate-800 font-semibold mb-3 text-sm">Resumo do agendamento</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Procedimento:</span>
                    <span className="text-slate-800 font-medium">{PROCEDIMENTOS.find(p => p.id === formData.procedimento)?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Data:</span>
                    <span className="text-slate-800 font-medium">
                      {formData.data && new Date(formData.data + 'T12:00:00').toLocaleDateString('pt-BR', { 
                        weekday: 'short',
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Horário:</span>
                    <span className="text-slate-800 font-medium">{formData.horario}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
            >
              Voltar
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-300/40 disabled:opacity-50 disabled:shadow-none font-medium"
            >
              Continuar
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-300/40 disabled:opacity-50 disabled:shadow-none font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar Agendamento
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
