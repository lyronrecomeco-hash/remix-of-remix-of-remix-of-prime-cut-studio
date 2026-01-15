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
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import WhatsAppScreen from '@/components/venda/WhatsAppScreen';
import RealisticPhoneMockup from '@/components/venda/RealisticPhoneMockup';

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
  { id: 'mensal', name: 'Mensal', price: 'R$ 129,90/mês' },
  { id: 'trimestral', name: 'Trimestral', price: 'R$ 99,90/mês' },
  { id: 'semestral', name: 'Semestral', price: 'R$ 79,90/mês' },
  { id: 'anual', name: 'Anual', price: 'R$ 59,90/mês' },
];

const TIPOS_AGENDAMENTO = [
  { id: 'avaliacao', name: 'Avaliação Física', description: 'Análise completa do seu condicionamento' },
  { id: 'aula', name: 'Aula Experimental', description: 'Experimente uma aula gratuitamente' },
  { id: 'visita', name: 'Visita Guiada', description: 'Conheça toda nossa estrutura' },
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
  // Agendamento
  tipoAgendamento: string;
  dataAgendamento: string;
  horarioAgendamento: string;
}

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

        // Mensagem para o aluno
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

        // Mensagem para o aluno
        message = `Olá ${formData.nome} 👋

Seu agendamento na *${CONFIG.business.name}* foi confirmado! ✅

📌 *${tipoName}*
📆 ${dataFormatted}
⏰ ${formData.horarioAgendamento}

Te esperamos! 💪

_Qualquer dúvida, estamos à disposição._`;
      }

      // Enviar via WhatsApp Genesis
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

  // Gerar datas disponíveis (próximos 14 dias, exceto domingo)
  const getAvailableDates = () => {
    const dates: { value: string; label: string }[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (date.getDay() !== 0) { // Excluir domingo
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
        });
      }
    }
    return dates;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">
              {mode === 'matricula' ? 'Pré-matrícula realizada!' : 'Agendamento confirmado!'}
            </h1>
            <p className="text-muted-foreground">
              Você receberá uma confirmação no WhatsApp em instantes.
            </p>
          </div>

          {/* Preview da mensagem */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Mensagem enviada para seu WhatsApp:
            </p>
            <RealisticPhoneMockup>
              <WhatsAppScreen title={CONFIG.business.name} subtitle="online" icon={<Dumbbell className="w-5 h-5 text-white" />}>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-[85%] ml-auto"
                  >
                    <div className="bg-[#005c4b] rounded-lg rounded-tr-none p-3">
                      <p className="text-white text-sm whitespace-pre-line">{whatsappMessage}</p>
                      <span className="text-[10px] text-white/60 float-right mt-1">Agora ✓✓</span>
                    </div>
                  </motion.div>
                </div>
              </WhatsAppScreen>
            </RealisticPhoneMockup>
          </div>

          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-orange-500">
              <Link to={code ? `/academia/${code}` : '/academia'}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao site
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-4">
          <Link to={code ? `/academia/${code}` : '/academia'} className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Voltar</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-base">{CONFIG.business.name}</span>
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
            className="space-y-6"
          >
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">O que você deseja?</h1>
              <p className="text-muted-foreground">Escolha uma opção para continuar</p>
            </div>

            <div className="grid gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setMode('matricula'); setStep(1); }}
                className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-orange-500/10 border-2 border-primary/30 hover:border-primary transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Pré-matrícula Online</h3>
                    <p className="text-muted-foreground text-sm">
                      Escolha seu plano e modalidade. Finalize presencialmente e comece a treinar!
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setMode('agendamento'); setStep(1); }}
                className="p-6 rounded-2xl bg-secondary/50 border-2 border-border hover:border-primary/50 transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Agendar Visita/Aula</h3>
                    <p className="text-muted-foreground text-sm">
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
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Passo {step} de 3
                </span>
                <span className="text-sm font-medium">
                  {mode === 'matricula' ? 'Pré-matrícula' : 'Agendamento'}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* MATRÍCULA - Step 1: Plano */}
              {mode === 'matricula' && step === 1 && (
                <motion.div
                  key="matricula-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold">Escolha seu plano</h2>
                    <p className="text-muted-foreground text-sm">Selecione o plano ideal para você</p>
                  </div>

                  <div className="grid gap-3">
                    {PLANOS.map((plano) => (
                      <button
                        key={plano.id}
                        onClick={() => updateField('plano', plano.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          formData.plano === plano.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">{plano.name}</p>
                            <p className="text-primary font-semibold">{plano.price}</p>
                          </div>
                          {formData.plano === plano.id && (
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                          )}
                        </div>
                      </button>
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
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold">Modalidade principal</h2>
                    <p className="text-muted-foreground text-sm">Qual atividade você mais deseja praticar?</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {MODALIDADES.map((mod) => (
                      <button
                        key={mod.id}
                        onClick={() => updateField('modalidade', mod.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          formData.modalidade === mod.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <mod.icon className={`w-8 h-8 mx-auto mb-2 ${formData.modalidade === mod.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="font-medium text-sm">{mod.name}</p>
                      </button>
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
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold">Seus dados</h2>
                    <p className="text-muted-foreground text-sm">Preencha para finalizar</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome completo *</Label>
                      <Input
                        id="nome"
                        placeholder="Seu nome"
                        value={formData.nome}
                        onChange={(e) => updateField('nome', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp">WhatsApp *</Label>
                      <Input
                        id="whatsapp"
                        placeholder="(11) 99999-9999"
                        value={formData.whatsapp}
                        onChange={(e) => updateField('whatsapp', formatPhone(e.target.value))}
                        className="mt-1"
                        maxLength={15}
                      />
                    </div>

                    <div>
                      <Label htmlFor="horario">Melhor horário para treinar</Label>
                      <Input
                        id="horario"
                        placeholder="Ex: Manhã, Noite, Após 18h..."
                        value={formData.horarioPreferido}
                        onChange={(e) => updateField('horarioPreferido', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="obs">Observações</Label>
                      <Textarea
                        id="obs"
                        placeholder="Alguma informação adicional?"
                        value={formData.observacoes}
                        onChange={(e) => updateField('observacoes', e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
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
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold">Tipo de agendamento</h2>
                    <p className="text-muted-foreground text-sm">O que você deseja agendar?</p>
                  </div>

                  <div className="grid gap-3">
                    {TIPOS_AGENDAMENTO.map((tipo) => (
                      <button
                        key={tipo.id}
                        onClick={() => updateField('tipoAgendamento', tipo.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          formData.tipoAgendamento === tipo.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">{tipo.name}</p>
                            <p className="text-muted-foreground text-sm">{tipo.description}</p>
                          </div>
                          {formData.tipoAgendamento === tipo.id && (
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                          )}
                        </div>
                      </button>
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
                    <h2 className="text-xl font-bold">Data e horário</h2>
                    <p className="text-muted-foreground text-sm">Escolha quando deseja vir</p>
                  </div>

                  <div>
                    <Label className="mb-3 block">Selecione a data</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {getAvailableDates().slice(0, 8).map((date) => (
                        <button
                          key={date.value}
                          onClick={() => updateField('dataAgendamento', date.value)}
                          className={`p-3 rounded-lg border text-center text-sm transition-all ${
                            formData.dataAgendamento === date.value
                              ? 'border-primary bg-primary/10 font-medium'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {date.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Selecione o horário</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {HORARIOS.map((horario) => (
                        <button
                          key={horario}
                          onClick={() => updateField('horarioAgendamento', horario)}
                          className={`p-3 rounded-lg border text-center text-sm transition-all ${
                            formData.horarioAgendamento === horario
                              ? 'border-primary bg-primary/10 font-medium'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {horario}
                        </button>
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
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold">Seus dados</h2>
                    <p className="text-muted-foreground text-sm">Preencha para confirmar</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome2">Nome completo *</Label>
                      <Input
                        id="nome2"
                        placeholder="Seu nome"
                        value={formData.nome}
                        onChange={(e) => updateField('nome', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp2">WhatsApp *</Label>
                      <Input
                        id="whatsapp2"
                        placeholder="(11) 99999-9999"
                        value={formData.whatsapp}
                        onChange={(e) => updateField('whatsapp', formatPhone(e.target.value))}
                        className="mt-1"
                        maxLength={15}
                      />
                    </div>
                  </div>

                  {/* Resumo */}
                  <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border">
                    <h3 className="font-semibold mb-3">Resumo do agendamento</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="font-medium">{TIPOS_AGENDAMENTO.find(t => t.id === formData.tipoAgendamento)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data:</span>
                        <span className="font-medium">
                          {formData.dataAgendamento && new Date(formData.dataAgendamento + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Horário:</span>
                        <span className="font-medium">{formData.horarioAgendamento}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              {step < 3 ? (
                <Button 
                  onClick={nextStep} 
                  disabled={!canProceed()}
                  className="flex-1 bg-gradient-to-r from-primary to-orange-500"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!canProceed() || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-primary to-orange-500"
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
