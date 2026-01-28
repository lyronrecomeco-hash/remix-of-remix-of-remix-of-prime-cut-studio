import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Video,
  Send,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const applicationSchema = z.object({
  fullName: z.string().min(3, 'Nome completo é obrigatório'),
  email: z.string().email('Email inválido'),
  age: z.number().min(16, 'Idade mínima: 16 anos').max(100, 'Idade inválida'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  instagram: z.string().optional(),
  tiktok: z.string().min(2, 'TikTok é obrigatório'),
});

const Inscricao = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'form' | 'success'>('info');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    whatsapp: '',
    instagram: '',
    tiktok: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Ferramentas de Prospecção',
      description: 'Use o painel completo para prospectar empresas e vender SaaS de forma profissional.'
    },
    {
      icon: Users,
      title: 'Ganhe por Indicação',
      description: 'Comissões recorrentes por cada indicação que se tornar assinante.'
    },
    {
      icon: Video,
      title: 'Gerador de Roteiros',
      description: 'Crie roteiros virais para TikTok com IA para seus vídeos de divulgação.'
    },
    {
      icon: Sparkles,
      title: 'Acesso Premium',
      description: 'Acesso completo ao painel Genesis Hub para criar conteúdo e prospectar.'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleSubmit = async () => {
    setErrors({});
    
    const validationData = {
      fullName: formData.fullName,
      email: formData.email,
      age: parseInt(formData.age) || 0,
      whatsapp: formData.whatsapp.replace(/\D/g, ''),
      instagram: formData.instagram || undefined,
      tiktok: formData.tiktok || undefined,
    };

    const result = applicationSchema.safeParse(validationData);
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('partner_applications')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          age: parseInt(formData.age),
          whatsapp: formData.whatsapp.replace(/\D/g, ''),
          instagram: formData.instagram || null,
          tiktok: formData.tiktok || null,
          status: 'pending'
        });

      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          toast.error('Este email já foi cadastrado');
        } else {
          toast.error('Erro ao enviar inscrição');
        }
        return;
      }

      setStep('success');
    } catch {
      toast.error('Erro ao enviar inscrição');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, hsl(220 25% 10%) 0%, hsl(230 30% 12%) 50%, hsl(220 25% 10%) 100%)',
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <div className="flex items-center gap-3">
            <img 
              src="/genesis-logo.png" 
              alt="Genesis Hub" 
              className="w-10 h-10 object-contain"
            />
            <span className="font-bold text-lg text-white">Genesis Hub</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        <AnimatePresence mode="wait">
          {/* Step 1: Info */}
          {step === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Title */}
              <div className="text-center space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  Parceiros Genesis Hub
                </h1>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                  Seja um criador de conteúdo e ganhe dinheiro divulgando a plataforma no TikTok e Instagram
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.08] hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <benefit.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                        <p className="text-sm text-white/60">{benefit.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Requirements */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Requisitos para Participar
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-white/80">
                    <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span>Criar uma conta no TikTok (se ainda não tiver)</span>
                  </li>
                  <li className="flex items-start gap-3 text-white/80">
                    <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span><strong>Postar pelo menos 3 vídeos por dia</strong> com conteúdo da plataforma Genesis Hub</span>
                  </li>
                  <li className="flex items-start gap-3 text-white/80">
                    <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span>Manter-se ativo para não perder acesso ao painel</span>
                  </li>
                  <li className="flex items-start gap-3 text-white/80">
                    <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span>Seguir as diretrizes de conteúdo da plataforma</span>
                  </li>
                </ul>
              </div>

              {/* Accept Terms */}
              <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-white/80 cursor-pointer">
                  Li e aceito os termos da parceria. Entendo que preciso manter a produção de conteúdo ativa para permanecer no programa.
                </label>
              </div>

              {/* Continue Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: acceptedTerms ? 1 : 0.5 }}
              >
                <Button
                  onClick={() => setStep('form')}
                  disabled={!acceptedTerms}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  Continuar
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Form */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Preencha seus dados
                </h1>
                <p className="text-white/60">
                  Complete o formulário abaixo para se inscrever como parceiro
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Nome Completo *</label>
                  <Input
                    placeholder="Seu nome completo"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-400">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Email *</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Age and WhatsApp */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Idade *</label>
                    <Input
                      type="number"
                      placeholder="18"
                      min="16"
                      max="100"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                    {errors.age && (
                      <p className="text-sm text-red-400">{errors.age}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">WhatsApp *</label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', formatWhatsApp(e.target.value))}
                      maxLength={15}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                    {errors.whatsapp && (
                      <p className="text-sm text-red-400">{errors.whatsapp}</p>
                    )}
                  </div>
                </div>

                {/* Social Media */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Instagram (opcional)</label>
                    <Input
                      placeholder="@seuinstagram"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">TikTok *</label>
                    <Input
                      placeholder="@seutiktok"
                      value={formData.tiktok}
                      onChange={(e) => handleInputChange('tiktok', e.target.value)}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                    {errors.tiktok && (
                      <p className="text-sm text-red-400">{errors.tiktok}</p>
                    )}
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <p className="text-sm text-white/80">
                    <strong className="text-primary">Importante:</strong> Caso aprovado, você receberá seu login e senha no WhatsApp em até 24 horas. 
                    Lembre-se de manter a produção de conteúdo ativa!
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('info')}
                  className="flex-1 h-12 border-white/20 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Send className="w-4 h-4" />
                      </motion.div>
                      Enviando...
                    </span>
                  ) : (
                    <>
                      Enviar Inscrição
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Inscrição Enviada!
                </h1>
                <p className="text-lg text-white/60 max-w-md mx-auto">
                  Sua inscrição foi recebida com sucesso. Em até 24 horas, caso aprovado, você receberá seu login no WhatsApp.
                </p>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-xl max-w-md mx-auto">
                <h3 className="font-semibold text-white mb-3">Próximos passos:</h3>
                <ul className="text-left space-y-2 text-white/80">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    Aguarde a análise da sua inscrição
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    Fique atento ao seu WhatsApp
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    Prepare-se para começar a criar conteúdo!
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => navigate('/')}
                className="h-12 px-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                Voltar ao Início
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Inscricao;
