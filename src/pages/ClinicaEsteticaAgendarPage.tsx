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
  CheckCircle2,
  ArrowRight,
  Gem,
  Heart,
  Leaf,
  Zap
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
  { id: 'limpeza', name: 'Limpeza de Pele', duracao: '1h30', icon: Sparkles, color: 'from-rose-500 to-pink-600' },
  { id: 'botox', name: 'Toxina Botulínica', duracao: '30min', icon: Gem, color: 'from-violet-500 to-purple-600' },
  { id: 'preenchimento', name: 'Preenchimento Facial', duracao: '45min', icon: Heart, color: 'from-pink-500 to-rose-600' },
  { id: 'peeling', name: 'Peeling Químico', duracao: '45min', icon: Leaf, color: 'from-emerald-500 to-teal-600' },
  { id: 'microagulhamento', name: 'Microagulhamento', duracao: '1h', icon: Zap, color: 'from-amber-500 to-orange-600' },
  { id: 'drenagem', name: 'Drenagem Linfática', duracao: '1h', icon: Heart, color: 'from-cyan-500 to-sky-600' },
  { id: 'avaliacao', name: 'Avaliação Gratuita', duracao: '30min', icon: Sparkles, color: 'from-rose-500 to-purple-600' },
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

// Step Indicator - Premium design
const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { label: 'Procedimento', icon: Sparkles },
    { label: 'Data e Hora', icon: Calendar },
    { label: 'Seus Dados', icon: User },
  ];
  
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between relative max-w-md mx-auto">
        {/* Progress line */}
        <div className="absolute top-6 left-8 right-8 h-1 bg-slate-200 -z-10 rounded-full">
          <motion.div 
            className="h-full bg-gradient-to-r from-rose-500 to-purple-600 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          const Icon = step.icon;
          
          return (
            <div key={step.label} className="flex flex-col items-center z-10">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-rose-500 to-purple-600 text-white shadow-lg shadow-pink-500/30' 
                    : isCurrent 
                      ? 'bg-white text-pink-600 shadow-xl shadow-pink-100 border-2 border-pink-500' 
                      : 'bg-slate-100 text-slate-400 border-2 border-transparent'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </motion.div>
              <span className={`text-xs mt-3 font-semibold ${
                isCurrent ? 'text-pink-600' : isCompleted ? 'text-purple-600' : 'text-slate-400'
              }`}>
                {step.label}
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

  // Success screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full text-center relative"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/20 shadow-2xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center mb-8 shadow-2xl shadow-pink-500/40"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Confirmado!
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              Você receberá a confirmação no WhatsApp
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 text-left border border-white/10">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 font-medium">Procedimento</span>
                  <span className="text-white font-bold">{PROCEDIMENTOS.find(p => p.id === formData.procedimento)?.name}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-white/60 font-medium">Data</span>
                  <span className="text-white font-bold">
                    {new Date(formData.data + 'T12:00:00').toLocaleDateString('pt-BR', { 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-white/60 font-medium">Horário</span>
                  <span className="text-white font-bold">{formData.horario}</span>
                </div>
              </div>
            </div>

            <p className="text-white/50 text-sm mb-8">
              Em caso de ajuste, entraremos em contato
            </p>

            <Button 
              onClick={() => navigate(code ? `/clinica-estetica/${code}` : '/clinica-estetica')}
              className="w-full h-14 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl shadow-pink-500/30"
            >
              Voltar ao Site
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleBack}
            className="text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl h-11 w-11"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30 rotate-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900 font-bold text-lg">Agendar Procedimento</h1>
              <p className="text-slate-500 text-sm">{CONFIG.business.name}</p>
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
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  Qual procedimento você deseja?
                </h2>
                <p className="text-slate-500">Escolha o tratamento ideal para você</p>
              </div>

              <div className="space-y-3">
                {PROCEDIMENTOS.map((proc) => {
                  const Icon = proc.icon;
                  const isSelected = formData.procedimento === proc.id;
                  
                  return (
                    <motion.div
                      key={proc.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                          isSelected 
                            ? 'border-2 border-pink-500 shadow-xl shadow-pink-100' 
                            : 'border border-slate-200 hover:border-pink-300 hover:shadow-lg shadow-sm'
                        }`}
                        onClick={() => setFormData({ ...formData, procedimento: proc.id })}
                      >
                        <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${proc.color} flex items-center justify-center shadow-lg shrink-0 ${
                            isSelected ? 'shadow-pink-500/30' : ''
                          }`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 font-bold text-lg">{proc.name}</p>
                            <p className="text-slate-500 text-sm">Duração: {proc.duracao}</p>
                          </div>
                          
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                            isSelected 
                              ? 'border-pink-500 bg-gradient-to-br from-rose-500 to-purple-600' 
                              : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
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
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  Quando você pode vir?
                </h2>
                <p className="text-slate-500">Selecione a melhor data e horário</p>
              </div>

              {/* Date Selection */}
              <div>
                <Label className="text-slate-900 mb-4 flex items-center gap-2 font-bold text-lg">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-pink-600" />
                  </div>
                  Escolha a data
                </Label>
                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                  {availableDates.slice(0, 12).map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = formData.data === dateStr;
                    return (
                      <motion.button
                        key={dateStr}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormData({ ...formData, data: dateStr })}
                        className={`p-3 sm:p-4 rounded-2xl text-center transition-all duration-300 ${
                          isSelected 
                            ? 'bg-gradient-to-br from-rose-500 to-purple-600 text-white shadow-xl shadow-pink-500/30' 
                            : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-pink-300 hover:shadow-lg shadow-sm'
                        }`}
                      >
                        <div className="text-[10px] sm:text-xs uppercase font-bold opacity-80">
                          {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </div>
                        <div className="text-xl sm:text-2xl font-bold">{date.getDate()}</div>
                        <div className="text-[10px] sm:text-xs font-medium opacity-80">
                          {date.toLocaleDateString('pt-BR', { month: 'short' })}
                        </div>
                      </motion.button>
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
                  <Label className="text-slate-900 mb-4 flex items-center gap-2 font-bold text-lg">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-pink-600" />
                    </div>
                    Escolha o horário
                  </Label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                    {HORARIOS.map((horario) => {
                      const isSelected = formData.horario === horario;
                      return (
                        <motion.button
                          key={horario}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData({ ...formData, horario })}
                          className={`py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                            isSelected 
                              ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg shadow-pink-500/30' 
                              : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-pink-300 hover:shadow-md'
                          }`}
                        >
                          {horario}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Dados Pessoais */}
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
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  Quase lá! Seus dados
                </h2>
                <p className="text-slate-500">Precisamos de algumas informações para confirmar</p>
              </div>

              {/* Summary Card */}
              <Card className="bg-gradient-to-br from-rose-50 to-purple-50 border-0 shadow-lg overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-bold text-lg">
                        {PROCEDIMENTOS.find(p => p.id === formData.procedimento)?.name}
                      </p>
                      <p className="text-slate-600 text-sm">
                        {new Date(formData.data + 'T12:00:00').toLocaleDateString('pt-BR', { 
                          weekday: 'long',
                          day: 'numeric', 
                          month: 'long' 
                        })} às {formData.horario}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Fields */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-slate-700 font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-pink-500" />
                    Nome completo
                  </Label>
                  <Input
                    id="nome"
                    placeholder="Digite seu nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="h-14 rounded-xl border-2 border-slate-200 focus:border-pink-500 text-lg bg-white shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-slate-700 font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4 text-pink-500" />
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    placeholder="(00) 00000-0000"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                    className="h-14 rounded-xl border-2 border-slate-200 focus:border-pink-500 text-lg bg-white shadow-sm"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacao" className="text-slate-700 font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-pink-500" />
                    Observações <span className="text-slate-400 font-normal">(opcional)</span>
                  </Label>
                  <Textarea
                    id="observacao"
                    placeholder="Alguma informação adicional?"
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    className="rounded-xl border-2 border-slate-200 focus:border-pink-500 min-h-[100px] bg-white shadow-sm resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-10 flex gap-4">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-14 px-6 rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 h-14 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold shadow-xl shadow-pink-500/30 disabled:opacity-50 disabled:shadow-none"
            >
              Continuar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex-1 h-14 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold shadow-xl shadow-pink-500/30 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
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

        {/* Trust badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Confirmação instantânea</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Sem compromisso</span>
          </div>
        </div>
      </div>
    </div>
  );
}
