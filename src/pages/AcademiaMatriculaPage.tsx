import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  ArrowLeft, 
  ArrowRight,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Flame,
  Zap,
  Heart,
  Target,
  Trophy,
  ClipboardList,
  CalendarCheck,
  Sparkles,
  Shield,
  Star,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ========== DATA ==========
const MODALIDADES = [
  { id: 'musculacao', name: 'Musculação', icon: Dumbbell },
  { id: 'crossfit', name: 'CrossFit', icon: Flame },
  { id: 'spinning', name: 'Spinning', icon: Zap },
  { id: 'yoga', name: 'Yoga', icon: Heart },
  { id: 'luta', name: 'Artes Marciais', icon: Target },
  { id: 'funcional', name: 'Funcional', icon: Trophy },
];

const PLANOS = [
  { id: 'mensal', name: 'Mensal', price: 'R$ 129,90/mês', badge: null },
  { id: 'trimestral', name: 'Trimestral', price: 'R$ 99,90/mês', badge: '23% OFF' },
  { id: 'semestral', name: 'Semestral', price: 'R$ 79,90/mês', badge: '38% OFF' },
  { id: 'anual', name: 'Anual', price: 'R$ 59,90/mês', badge: 'MELHOR' },
];

const TIPOS_AGENDAMENTO = [
  { id: 'avaliacao', name: 'Avaliação Física', description: 'Análise completa do seu condicionamento', icon: ClipboardList },
  { id: 'aula', name: 'Aula Experimental', description: 'Experimente uma aula gratuitamente', icon: Dumbbell },
  { id: 'visita', name: 'Visita Guiada', description: 'Conheça toda nossa estrutura', icon: Target },
];

const HORARIOS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const CONFIG = {
  business: {
    name: 'FitPower Academia',
    phone: '5511999999999',
  }
};

type FormMode = 'choice' | 'matricula' | 'agendamento';
type Step = 1 | 2 | 3 | 4;

interface FormData {
  nome: string;
  whatsapp: string;
  plano: string;
  modalidade: string;
  horarioPreferido: string;
  observacoes: string;
  tipoAgendamento: string;
  dataAgendamento: string;
  horarioAgendamento: string;
}

// ========== STEP INDICATOR COMPONENT ==========
const StepIndicator = ({ currentStep, totalSteps, mode }: { currentStep: number; totalSteps: number; mode: string }) => {
  const steps = mode === 'matricula' 
    ? ['Plano', 'Modalidade', 'Dados']
    : ['Tipo', 'Data/Hora', 'Dados'];
  
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
                      ? 'rgb(220 38 38)' 
                      : isCurrent 
                        ? 'rgb(39 39 42)' 
                        : 'rgb(63 63 70)'
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted 
                      ? 'border-red-600 bg-red-600' 
                      : isCurrent 
                        ? 'border-red-600 bg-zinc-800' 
                        : 'border-zinc-600 bg-zinc-700'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span className={`text-sm font-bold ${isCurrent ? 'text-red-500' : 'text-zinc-400'}`}>
                      {stepNum}
                    </span>
                  )}
                </motion.div>
                <span className={`text-xs mt-2 font-medium ${
                  isCurrent ? 'text-white' : 'text-zinc-500'
                }`}>
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 -mt-6 ${
                  isCompleted ? 'bg-red-600' : 'bg-zinc-700'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function AcademiaMatriculaPage() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<FormMode>('choice');
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    whatsapp: '',
    plano: searchParams.get('plano') || '',
    modalidade: searchParams.get('modalidade') || '',
    horarioPreferido: '',
    observacoes: '',
    tipoAgendamento: '',
    dataAgendamento: '',
    horarioAgendamento: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const getRawPhone = (formatted: string) => {
    return formatted.replace(/\D/g, '');
  };

  const canProceed = useCallback(() => {
    if (mode === 'matricula') {
      switch (step) {
        case 1: return formData.plano !== '';
        case 2: return formData.modalidade !== '';
        case 3: return formData.nome.trim().length >= 3 && getRawPhone(formData.whatsapp).length >= 10;
        default: return true;
      }
    } else {
      switch (step) {
        case 1: return formData.tipoAgendamento !== '';
        case 2: return formData.dataAgendamento !== '' && formData.horarioAgendamento !== '';
        case 3: return formData.nome.trim().length >= 3 && getRawPhone(formData.whatsapp).length >= 10;
        default: return true;
      }
    }
  }, [mode, step, formData]);

  const nextStep = () => {
    if (canProceed() && step < 4) {
      setStep((step + 1) as Step);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    } else {
      setMode('choice');
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setIsSubmitting(true);

    const rawPhone = getRawPhone(formData.whatsapp);
    const phoneWithCountry = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;

    try {
      let message = '';
      
      if (mode === 'matricula') {
        const planoName = PLANOS.find(p => p.id === formData.plano)?.name || formData.plano;
        const modalidadeName = MODALIDADES.find(m => m.id === formData.modalidade)?.name || formData.modalidade;

        message = `Olá ${formData.nome} 👋

Recebemos sua pré-matrícula na *${CONFIG.business.name}* 💪

📋 *Seus dados:*
• Plano: ${planoName}
• Modalidade: ${modalidadeName}
${formData.horarioPreferido ? `• Horário preferido: ${formData.horarioPreferido}` : ''}

Em breve nossa equipe entrará em contato para finalizar sua matrícula!

_Obrigado por escolher a ${CONFIG.business.name}!_ 🏋️`;

      } else {
        const tipoName = TIPOS_AGENDAMENTO.find(t => t.id === formData.tipoAgendamento)?.name || formData.tipoAgendamento;
        const dataFormatted = new Date(formData.dataAgendamento + 'T12:00:00').toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });

        message = `Olá ${formData.nome} 👋

Seu agendamento na *${CONFIG.business.name}* foi confirmado! ✅

📌 *${tipoName}*
📆 ${dataFormatted}
⏰ ${formData.horarioAgendamento}

Te esperamos! 💪

_Qualquer dúvida, estamos à disposição._`;
      }

      const { data, error } = await supabase.functions.invoke('send-whatsapp-genesis', {
        body: {
          phone: phoneWithCountry,
          message: message,
          countryCode: 'BR',
        },
      });

      if (error) {
        console.error('Erro ao enviar WhatsApp:', error);
        toast.error('Erro ao enviar confirmação, mas sua solicitação foi registrada!');
      }

      setWhatsappMessage(message);
      setIsSuccess(true);
      toast.success(mode === 'matricula' ? 'Pré-matrícula realizada!' : 'Agendamento confirmado!');

    } catch (err) {
      console.error('Erro:', err);
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableDates = () => {
    const dates: { value: string; label: string; day: string; weekday: string }[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }),
          day: date.getDate().toString(),
          weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
        });
      }
    }
    return dates;
  };

  // ========== SUCCESS SCREEN ==========
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
            className="relative mx-auto mb-8"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-2xl shadow-red-600/30">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-bold text-white mb-3"
          >
            {mode === 'matricula' ? 'Pré-matrícula Realizada!' : 'Agendamento Confirmado!'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-zinc-400 mb-8"
          >
            Você receberá uma confirmação no WhatsApp em instantes.
          </motion.p>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-800">
              <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
                {mode === 'matricula' ? (
                  <ClipboardList className="w-6 h-6 text-red-500" />
                ) : (
                  <CalendarCheck className="w-6 h-6 text-red-500" />
                )}
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">{formData.nome}</p>
                <p className="text-zinc-500 text-sm">{formData.whatsapp}</p>
              </div>
            </div>

            {mode === 'matricula' ? (
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Plano:</span>
                  <span className="text-white font-medium">{PLANOS.find(p => p.id === formData.plano)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Modalidade:</span>
                  <span className="text-white font-medium">{MODALIDADES.find(m => m.id === formData.modalidade)?.name}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tipo:</span>
                  <span className="text-white font-medium">{TIPOS_AGENDAMENTO.find(t => t.id === formData.tipoAgendamento)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Data:</span>
                  <span className="text-white font-medium">
                    {formData.dataAgendamento && new Date(formData.dataAgendamento + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Horário:</span>
                  <span className="text-white font-medium">{formData.horarioAgendamento}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 mb-8 text-zinc-500"
          >
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm">Seus dados estão seguros</span>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button 
              asChild 
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              <Link to={code ? `/academia/${code}` : '/academia'}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao site
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              onClick={() => {
                setIsSuccess(false);
                setStep(1);
                setMode('choice');
                setFormData({
                  nome: '',
                  whatsapp: '',
                  plano: '',
                  modalidade: '',
                  horarioPreferido: '',
                  observacoes: '',
                  tipoAgendamento: '',
                  dataAgendamento: '',
                  horarioAgendamento: '',
                });
              }}
            >
              Fazer outro {mode === 'matricula' ? 'pré-matrícula' : 'agendamento'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-4">
          <Link 
            to={code ? `/academia/${code}` : '/academia'} 
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Voltar</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/20">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">{CONFIG.business.name}</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-6 sm:py-8">
        {/* Choice Mode */}
        {mode === 'choice' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">O que você deseja?</h1>
              <p className="text-zinc-400">Escolha uma opção para continuar</p>
            </div>

            <div className="grid gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setMode('matricula'); setStep(1); }}
                className="group p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 hover:border-red-600/50 transition-all text-left relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shrink-0 shadow-lg shadow-red-600/20">
                    <ClipboardList className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Pré-matrícula Online</h3>
                    <p className="text-zinc-400 text-sm">
                      Escolha seu plano e modalidade. Finalize presencialmente!
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setMode('agendamento'); setStep(1); }}
                className="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-7 h-7 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Agendar Visita/Aula</h3>
                    <p className="text-zinc-400 text-sm">
                      Avaliação física, aula experimental ou visita guiada.
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Form Steps */}
        {mode !== 'choice' && (
          <>
            {/* Step Indicator */}
            <StepIndicator currentStep={step} totalSteps={3} mode={mode} />

            <AnimatePresence mode="wait">
              {/* MATRÍCULA - Step 1: Plano */}
              {mode === 'matricula' && step === 1 && (
                <motion.div
                  key="matricula-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-white">Escolha seu plano</h2>
                    <p className="text-zinc-400 text-sm">Selecione o plano ideal para você</p>
                  </div>

                  <div className="grid gap-3">
                    {PLANOS.map((plano) => (
                      <motion.button
                        key={plano.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => updateField('plano', plano.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                          formData.plano === plano.id
                            ? 'border-red-600 bg-red-600/10'
                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                        }`}
                      >
                        {plano.badge && (
                          <span className={`absolute -top-2 right-4 px-2 py-0.5 rounded text-xs font-bold ${
                            plano.badge === 'MELHOR' 
                              ? 'bg-red-600 text-white' 
                              : 'bg-zinc-700 text-zinc-300'
                          }`}>
                            {plano.badge}
                          </span>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white">{plano.name}</p>
                            <p className="text-red-500 font-semibold">{plano.price}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            formData.plano === plano.id
                              ? 'border-red-600 bg-red-600'
                              : 'border-zinc-600'
                          }`}>
                            {formData.plano === plano.id && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* MATRÍCULA - Step 2: Modalidade */}
              {mode === 'matricula' && step === 2 && (
                <motion.div
                  key="matricula-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-white">Modalidade principal</h2>
                    <p className="text-zinc-400 text-sm">Qual atividade você mais deseja praticar?</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {MODALIDADES.map((mod) => (
                      <motion.button
                        key={mod.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateField('modalidade', mod.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          formData.modalidade === mod.id
                            ? 'border-red-600 bg-red-600/10'
                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                        }`}
                      >
                        <mod.icon className={`w-8 h-8 mx-auto mb-2 ${
                          formData.modalidade === mod.id ? 'text-red-500' : 'text-zinc-500'
                        }`} />
                        <p className={`font-medium text-sm ${
                          formData.modalidade === mod.id ? 'text-white' : 'text-zinc-400'
                        }`}>{mod.name}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* MATRÍCULA - Step 3: Dados */}
              {mode === 'matricula' && step === 3 && (
                <motion.div
                  key="matricula-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-white">Seus dados</h2>
                    <p className="text-zinc-400 text-sm">Preencha para finalizar</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome" className="text-zinc-300">Nome completo *</Label>
                      <Input
                        id="nome"
                        placeholder="Seu nome"
                        value={formData.nome}
                        onChange={(e) => updateField('nome', e.target.value)}
                        className="mt-1 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp" className="text-zinc-300">WhatsApp *</Label>
                      <Input
                        id="whatsapp"
                        placeholder="(11) 99999-9999"
                        value={formData.whatsapp}
                        onChange={(e) => updateField('whatsapp', formatPhone(e.target.value))}
                        className="mt-1 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-600"
                        maxLength={15}
                      />
                    </div>

                    <div>
                      <Label htmlFor="horario" className="text-zinc-300">Melhor horário para treinar</Label>
                      <Input
                        id="horario"
                        placeholder="Ex: Manhã, Noite, Após 18h..."
                        value={formData.horarioPreferido}
                        onChange={(e) => updateField('horarioPreferido', e.target.value)}
                        className="mt-1 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="obs" className="text-zinc-300">Observações</Label>
                      <Textarea
                        id="obs"
                        placeholder="Alguma informação adicional?"
                        value={formData.observacoes}
                        onChange={(e) => updateField('observacoes', e.target.value)}
                        className="mt-1 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-600"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Resumo */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <h3 className="font-semibold text-white mb-3">Resumo da pré-matrícula</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Plano:</span>
                        <span className="text-white font-medium">{PLANOS.find(p => p.id === formData.plano)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Modalidade:</span>
                        <span className="text-white font-medium">{MODALIDADES.find(m => m.id === formData.modalidade)?.name}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* AGENDAMENTO - Step 1: Tipo */}
              {mode === 'agendamento' && step === 1 && (
                <motion.div
                  key="agendamento-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-white">Tipo de agendamento</h2>
                    <p className="text-zinc-400 text-sm">O que você deseja agendar?</p>
                  </div>

                  <div className="grid gap-3">
                    {TIPOS_AGENDAMENTO.map((tipo) => (
                      <motion.button
                        key={tipo.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => updateField('tipoAgendamento', tipo.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          formData.tipoAgendamento === tipo.id
                            ? 'border-red-600 bg-red-600/10'
                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            formData.tipoAgendamento === tipo.id
                              ? 'bg-red-600'
                              : 'bg-zinc-800'
                          }`}>
                            <tipo.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-white">{tipo.name}</p>
                            <p className="text-zinc-400 text-sm">{tipo.description}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            formData.tipoAgendamento === tipo.id
                              ? 'border-red-600 bg-red-600'
                              : 'border-zinc-600'
                          }`}>
                            {formData.tipoAgendamento === tipo.id && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* AGENDAMENTO - Step 2: Data e Horário */}
              {mode === 'agendamento' && step === 2 && (
                <motion.div
                  key="agendamento-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-white">Data e horário</h2>
                    <p className="text-zinc-400 text-sm">Escolha quando deseja vir</p>
                  </div>

                  <div>
                    <Label className="mb-3 block text-zinc-300">Selecione a data</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {getAvailableDates().slice(0, 8).map((date) => (
                        <motion.button
                          key={date.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateField('dataAgendamento', date.value)}
                          className={`p-3 rounded-xl border transition-all text-center ${
                            formData.dataAgendamento === date.value
                              ? 'border-red-600 bg-red-600/20'
                              : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                          }`}
                        >
                          <p className={`text-xs ${
                            formData.dataAgendamento === date.value ? 'text-red-400' : 'text-zinc-500'
                          }`}>{date.weekday}</p>
                          <p className={`text-lg font-bold ${
                            formData.dataAgendamento === date.value ? 'text-white' : 'text-zinc-300'
                          }`}>{date.day}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block text-zinc-300">Selecione o horário</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {HORARIOS.map((horario) => (
                        <motion.button
                          key={horario}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateField('horarioAgendamento', horario)}
                          className={`p-3 rounded-lg border text-center text-sm font-medium transition-all ${
                            formData.horarioAgendamento === horario
                              ? 'border-red-600 bg-red-600/20 text-white'
                              : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          {horario}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* AGENDAMENTO - Step 3: Dados */}
              {mode === 'agendamento' && step === 3 && (
                <motion.div
                  key="agendamento-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-white">Seus dados</h2>
                    <p className="text-zinc-400 text-sm">Preencha para confirmar</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome2" className="text-zinc-300">Nome completo *</Label>
                      <Input
                        id="nome2"
                        placeholder="Seu nome"
                        value={formData.nome}
                        onChange={(e) => updateField('nome', e.target.value)}
                        className="mt-1 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp2" className="text-zinc-300">WhatsApp *</Label>
                      <Input
                        id="whatsapp2"
                        placeholder="(11) 99999-9999"
                        value={formData.whatsapp}
                        onChange={(e) => updateField('whatsapp', formatPhone(e.target.value))}
                        className="mt-1 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-600"
                        maxLength={15}
                      />
                    </div>
                  </div>

                  {/* Resumo */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <h3 className="font-semibold text-white mb-3">Resumo do agendamento</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Tipo:</span>
                        <span className="text-white font-medium">{TIPOS_AGENDAMENTO.find(t => t.id === formData.tipoAgendamento)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Data:</span>
                        <span className="text-white font-medium">
                          {formData.dataAgendamento && new Date(formData.dataAgendamento + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Horário:</span>
                        <span className="text-white font-medium">{formData.horarioAgendamento}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              {step < 3 ? (
                <Button 
                  onClick={nextStep} 
                  disabled={!canProceed()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!canProceed() || isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirmar
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
