import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import { PhoneVerification } from './PhoneVerification';
import { toast } from 'sonner';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
  whatsapp: z.string().min(14, 'WhatsApp inválido'),
  email: z.string().email('Email inválido'),
  emailConfirm: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  passwordConfirm: z.string().min(6, 'Confirmação deve ter pelo menos 6 caracteres'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar os termos de uso' }),
  }),
}).refine(data => data.email === data.emailConfirm, {
  message: 'Os emails não conferem',
  path: ['emailConfirm'],
}).refine(data => data.password === data.passwordConfirm, {
  message: 'As senhas não conferem',
  path: ['passwordConfirm'],
});

interface RegisterFormProps {
  onSuccess: (email: string) => void;
  onBackToLogin: () => void;
}

type Step = 'form' | 'verification' | 'creating';

const RegisterFormWithVerification = ({ onSuccess, onBackToLogin }: RegisterFormProps) => {
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    whatsapp: '',
    email: '',
    emailConfirm: '',
    password: '',
    passwordConfirm: '',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const phoneMask = usePhoneMask(formData.whatsapp);

  // Calculate password strength
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 6) score += 20;
    if (password.length >= 8) score += 20;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^a-zA-Z0-9]/.test(password)) score += 20;

    if (score <= 20) return { score, label: 'Muito fraca', color: 'bg-destructive' };
    if (score <= 40) return { score, label: 'Fraca', color: 'bg-orange-500' };
    if (score <= 60) return { score, label: 'Razoável', color: 'bg-yellow-500' };
    if (score <= 80) return { score, label: 'Boa', color: 'bg-blue-500' };
    return { score, label: 'Excelente', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate form
    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsSendingCode(true);

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        setError('Este email já está cadastrado. Faça login ou recupere sua senha.');
        setIsSendingCode(false);
        return;
      }

      // Hash password for temporary storage (will be used after verification)
      // Note: In production, use proper hashing on backend
      const passwordHash = btoa(formData.password);

      // Send verification code
      const { data, error: sendError } = await supabase.functions.invoke('send-phone-verification', {
        body: {
          phone: formData.whatsapp,
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          passwordHash,
        },
      });

      if (sendError) {
        console.error('Send verification error:', sendError);
        setError('Erro ao enviar código de verificação');
        setIsSendingCode(false);
        return;
      }

      if (!data?.success) {
        setError(data?.error || 'Erro ao enviar código');
        setIsSendingCode(false);
        return;
      }

      // Show verification step
      setStep('verification');
      toast.success('Código enviado para seu WhatsApp!');

    } catch (err) {
      console.error('Error:', err);
      setError('Erro ao enviar código. Tente novamente.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerified = async (verifiedData: { phone: string; email?: string; name?: string }) => {
    setStep('creating');
    setIsLoading(true);

    try {
      // Get IP address for anti-fraud
      let ipAddress = 'unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch {
        console.log('Could not get IP address');
      }

      const userAgent = navigator.userAgent;

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmado`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            whatsapp: formData.whatsapp,
            phone_verified: true,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Este email já está cadastrado. Faça login ou recupere sua senha.');
        } else {
          setError(authError.message);
        }
        setStep('form');
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Erro ao criar conta. Tente novamente.');
        setStep('form');
        setIsLoading(false);
        return;
      }

      // Record in fraud protection
      await supabase.from('fraud_protection').insert({
        ip_address: ipAddress,
        user_id: authData.user.id,
        email: formData.email,
        user_agent: userAgent,
        attempt_type: 'registration',
        is_blocked: false,
      });

      // Create admin_users entry
      await supabase.from('admin_users').insert({
        user_id: authData.user.id,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        is_active: true,
      });

      // Create user_profile entry
      await supabase.from('user_profiles').insert({
        user_id: authData.user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        whatsapp: formData.whatsapp,
      });

      // Create user_roles entry
      await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: 'admin',
      });

      // Get free plan and create subscription
      const { data: freePlan } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('name', 'free')
        .single();

      if (freePlan) {
        await supabase.from('shop_subscriptions').insert({
          user_id: authData.user.id,
          plan_id: freePlan.id,
          status: 'active',
        });
      }

      // Create initial usage metrics
      const now = new Date();
      await supabase.from('usage_metrics').insert({
        user_id: authData.user.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        appointments_count: 0,
        clients_count: 0,
      });

      // Create user preferences with light theme default
      await supabase.from('user_preferences').insert({
        user_id: authData.user.id,
        theme: 'light',
        onboarding_completed: false,
      });

      toast.success('Conta criada com sucesso!');
      onSuccess(formData.email);

    } catch (err) {
      console.error('Registration error:', err);
      setError('Erro ao criar conta. Tente novamente.');
      setStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromVerification = () => {
    setStep('form');
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'verification' ? (
        <motion.div
          key="verification"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          <PhoneVerification
            phone={formData.whatsapp}
            email={formData.email}
            name={`${formData.firstName} ${formData.lastName}`}
            passwordHash={btoa(formData.password)}
            onVerified={handleVerified}
            onBack={handleBackFromVerification}
            onResend={() => toast.success('Novo código enviado!')}
          />
        </motion.div>
      ) : step === 'creating' ? (
        <motion.div
          key="creating"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </motion.div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Criando sua conta...</h3>
            <p className="text-sm text-muted-foreground">Aguarde enquanto configuramos tudo para você</p>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            className="h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full max-w-xs"
          />
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          onSubmit={handleSendVerification}
          className="space-y-5"
        >
          {/* Progress indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                1
              </div>
              <span className="text-sm font-medium">Dados</span>
            </div>
            <div className="flex-1 h-0.5 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold">
                2
              </div>
              <span className="text-sm text-muted-foreground">Verificar</span>
            </div>
            <div className="flex-1 h-0.5 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold">
                3
              </div>
              <span className="text-sm text-muted-foreground">Pronto</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30"
            >
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="João"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className={`pl-12 h-12 bg-secondary/50 border-border focus:border-primary ${fieldErrors.firstName ? 'border-destructive' : ''}`}
                  disabled={isSendingCode}
                />
              </div>
              {fieldErrors.firstName && (
                <p className="text-xs text-destructive">{fieldErrors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Sobrenome</label>
              <Input
                type="text"
                placeholder="Silva"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                className={`h-12 bg-secondary/50 border-border focus:border-primary ${fieldErrors.lastName ? 'border-destructive' : ''}`}
                disabled={isSendingCode}
              />
              {fieldErrors.lastName && (
                <p className="text-xs text-destructive">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              WhatsApp
              <span className="text-xs text-muted-foreground">(receberá código de verificação)</span>
            </label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="tel"
                placeholder="(11) 99999-9999"
                value={phoneMask.value}
                onChange={(e) => {
                  phoneMask.onChange(e);
                  updateField('whatsapp', e.target.value);
                }}
                className={`pl-12 h-12 bg-secondary/50 border-border focus:border-primary ${fieldErrors.whatsapp ? 'border-destructive' : ''}`}
                disabled={isSendingCode}
              />
            </div>
            {fieldErrors.whatsapp && (
              <p className="text-xs text-destructive">{fieldErrors.whatsapp}</p>
            )}
          </div>

          {/* Email Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`pl-12 h-12 bg-secondary/50 border-border focus:border-primary ${fieldErrors.email ? 'border-destructive' : ''}`}
                  disabled={isSendingCode}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirme o Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.emailConfirm}
                  onChange={(e) => updateField('emailConfirm', e.target.value)}
                  className={`pl-12 h-12 bg-secondary/50 border-border focus:border-primary ${fieldErrors.emailConfirm ? 'border-destructive' : ''}`}
                  disabled={isSendingCode}
                />
              </div>
              {fieldErrors.emailConfirm && (
                <p className="text-xs text-destructive">{fieldErrors.emailConfirm}</p>
              )}
            </div>
          </div>

          {/* Password Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className={`pl-12 pr-12 h-12 bg-secondary/50 border-border focus:border-primary ${fieldErrors.password ? 'border-destructive' : ''}`}
                  disabled={isSendingCode}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Progress value={passwordStrength.score} className="h-1.5 flex-1" />
                    <span className={`text-xs font-medium ${passwordStrength.score >= 60 ? 'text-green-600' : passwordStrength.score >= 40 ? 'text-yellow-600' : 'text-destructive'}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
              {fieldErrors.password && (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirme a Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.passwordConfirm}
                  onChange={(e) => updateField('passwordConfirm', e.target.value)}
                  className={`pl-12 pr-12 h-12 bg-secondary/50 border-border focus:border-primary ${fieldErrors.passwordConfirm ? 'border-destructive' : ''}`}
                  disabled={isSendingCode}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.passwordConfirm && (
                <p className="text-xs text-destructive">{fieldErrors.passwordConfirm}</p>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => updateField('acceptTerms', !!checked)}
              disabled={isSendingCode}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
              Li e aceito os{' '}
              <a href="/termos" target="_blank" className="text-primary hover:underline">
                Termos de Uso
              </a>{' '}
              e{' '}
              <a href="/privacidade" target="_blank" className="text-primary hover:underline">
                Política de Privacidade
              </a>
            </label>
          </div>
          {fieldErrors.acceptTerms && (
            <p className="text-xs text-destructive">{fieldErrors.acceptTerms}</p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="hero"
            className="w-full h-12 text-base font-semibold"
            disabled={isSendingCode}
          >
            {isSendingCode ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Enviando código...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Verificar WhatsApp
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {/* Back to login */}
          <p className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-primary hover:underline font-medium"
            >
              Faça login
            </button>
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
};

export default RegisterFormWithVerification;
