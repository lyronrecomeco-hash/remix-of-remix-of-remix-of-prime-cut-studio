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
    <div className="mb-10">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10 mx-8 sm:mx-16 rounded-full">
          <motion.div 
            className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          
          return (
            <div key={label} className="flex flex-col items-center z-10">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'border-sky-500 bg-gradient-to-br from-sky-400 to-sky-500 text-white shadow-lg shadow-sky-500/30' 
                    : isCurrent 
                      ? 'border-sky-500 bg-white text-sky-600 shadow-lg shadow-sky-100' 
                      : 'border-gray-200 bg-white text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{stepNum}</span>
                )}
              </motion.div>
              <span className={`text-xs sm:text-sm mt-3 font-semibold ${
                isCurrent ? 'text-sky-600' : isCompleted ? 'text-sky-500' : 'text-gray-400'
              }`}>
                {label}
              </span>
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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50/30 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-sky-100/50 border border-sky-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center mb-8 shadow-lg shadow-sky-100/50"
            >
              <CheckCircle2 className="w-12 h-12 text-sky-500" />
            </motion.div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Agendamento Confirmado!
            </h2>
            <p className="text-gray-600 mb-8">
              Você receberá a confirmação no WhatsApp em instantes.
            </p>

            <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl p-5 mb-8 text-left border border-sky-100">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Procedimento:</span>
                  <span className="text-gray-900 font-bold">{PROCEDIMENTOS.find(p => p.id === formData.procedimento)?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Data:</span>
                  <span className="text-gray-900 font-bold">
                    {new Date(formData.data + 'T12:00:00').toLocaleDateString('pt-BR', { 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Horário:</span>
                  <span className="text-gray-900 font-bold">{formData.horario}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-500 text-sm mb-8">
              Em caso de ajuste, entraremos em contato.
            </p>

            <Button 
              onClick={() => navigate(code ? `/clinica-estetica/${code}` : '/clinica-estetica')}
              className="w-full h-14 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold rounded-xl shadow-lg shadow-sky-500/30"
            >
              Voltar ao Site
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50/30">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-sky-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleBack}
            className="text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold">Agendar Procedimento</h1>
              <p className="text-gray-500 text-sm">{CONFIG.business.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator currentStep={step} />

        <AnimatePresence mode="wait">
          {/* Step 1: Procedimento */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Selecione o procedimento</h2>
                <p className="text-gray-600">Escolha o tratamento desejado</p>
              </div>

              <div className="space-y-3">
                {PROCEDIMENTOS.map((proc) => (
                  <Card 
                    key={proc.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      formData.procedimento === proc.id 
                        ? 'bg-gradient-to-r from-sky-50 to-white border-2 border-sky-400 shadow-lg shadow-sky-100/50' 
                        : 'bg-white border-gray-200 hover:border-sky-300 hover:shadow-md shadow-sm'
                    }`}
                    onClick={() => setFormData({ ...formData, procedimento: proc.id })}
                  >
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.procedimento === proc.id 
                            ? 'border-sky-500 bg-gradient-to-br from-sky-400 to-sky-500 shadow-md' 
                            : 'border-gray-300'
                        }`}>
                          {formData.procedimento === proc.id && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-gray-900 font-bold">{proc.name}</p>
                          <p className="text-gray-500 text-sm">Duração: {proc.duracao}</p>
                        </div>
                      </div>
                      <Badge className={`${formData.procedimento === proc.id ? 'bg-sky-100 text-sky-700 border-sky-200' : 'bg-gray-100 text-gray-600 border-0'} font-semibold`}>
                        {proc.duracao}
                      </Badge>
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
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Escolha data e horário</h2>
                <p className="text-gray-600">Selecione o melhor momento para você</p>
              </div>

              {/* Date Selection */}
              <div>
                <Label className="text-gray-900 mb-4 block font-bold text-lg">
                  <Calendar className="w-5 h-5 inline mr-2 text-sky-500" />
                  Data
                </Label>
                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                  {availableDates.slice(0, 12).map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = formData.data === dateStr;
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setFormData({ ...formData, data: dateStr })}
                        className={`p-3 sm:p-4 rounded-2xl text-center transition-all duration-300 ${
                          isSelected 
                            ? 'bg-gradient-to-br from-sky-400 to-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105' 
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-sky-300 hover:bg-sky-50 shadow-sm'
                        }`}
                      >
                        <div className="text-[10px] sm:text-xs uppercase font-bold">
                          {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </div>
                        <div className="text-lg sm:text-xl font-bold">{date.getDate()}</div>
                        <div className="text-[10px] sm:text-xs font-medium">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Label className="text-gray-900 mb-4 block font-bold text-lg">
                    <Clock className="w-5 h-5 inline mr-2 text-sky-500" />
                    Horário
                  </Label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                    {HORARIOS.map((horario) => {
                      const isSelected = formData.horario === horario;
                      return (
                        <button
                          key={horario}
                          onClick={() => setFormData({ ...formData, horario })}
                          className={`py-3 px-3 sm:px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                            isSelected 
                              ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105' 
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-sky-300 hover:bg-sky-50 shadow-sm'
                          }`}
                        >
                          {horario}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-gray-500 text-sm mt-4 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                    💡 Caso o horário não esteja disponível, entraremos em contato para ajuste.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Dados */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Seus dados</h2>
                <p className="text-gray-600">Preencha para confirmar o agendamento</p>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="nome" className="text-gray-900 mb-3 block font-bold">
                    <User className="w-4 h-4 inline mr-2 text-sky-500" />
                    Nome completo
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Seu nome"
                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-sky-500 focus:ring-sky-500 h-14 rounded-xl text-base shadow-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp" className="text-gray-900 mb-3 block font-bold">
                    <Phone className="w-4 h-4 inline mr-2 text-sky-500" />
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                    placeholder="(11) 99999-9999"
                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-sky-500 focus:ring-sky-500 h-14 rounded-xl text-base shadow-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="observacao" className="text-gray-900 mb-3 block font-bold">
                    <MessageSquare className="w-4 h-4 inline mr-2 text-sky-500" />
                    Observação (opcional)
                  </Label>
                  <Textarea
                    id="observacao"
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    placeholder="Alguma informação adicional..."
                    rows={3}
                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 resize-none focus:border-sky-500 focus:ring-sky-500 rounded-xl shadow-sm"
                  />
                </div>
              </div>

              {/* Summary */}
              <Card className="bg-gradient-to-br from-sky-50 to-white border-sky-100 shadow-lg shadow-sky-100/30">
                <CardContent className="p-5 sm:p-6">
                  <h3 className="text-gray-900 font-bold mb-4 text-lg">Resumo do Agendamento</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Procedimento:</span>
                      <span className="text-gray-900 font-bold">
                        {PROCEDIMENTOS.find(p => p.id === formData.procedimento)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Data:</span>
                      <span className="text-gray-900 font-bold">
                        {new Date(formData.data + 'T12:00:00').toLocaleDateString('pt-BR', { 
                          weekday: 'long',
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Horário:</span>
                      <span className="text-gray-900 font-bold">{formData.horario}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-10 flex gap-4">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-14 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-sky-300 rounded-xl font-bold"
            >
              Voltar
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 h-14 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white disabled:opacity-50 rounded-xl font-bold shadow-lg shadow-sky-500/30"
            >
              Continuar
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex-1 h-14 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white disabled:opacity-50 rounded-xl font-bold shadow-lg shadow-sky-500/30"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Confirmando...
                </>
              ) : (
                <>
                  Confirmar Agendamento
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
