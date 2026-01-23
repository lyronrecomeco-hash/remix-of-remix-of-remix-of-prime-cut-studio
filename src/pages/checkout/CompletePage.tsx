/**
 * CHECKOUT SYSTEM - Complete Page
 * Página para usuário criar senha após pagamento confirmado
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

import { CheckoutLayout } from '@/components/checkout/CheckoutLayout';
import { AccountCreatedModal } from '@/components/checkout/AccountCreatedModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Password strength checker
const getPasswordStrength = (password: string): { level: 'weak' | 'medium' | 'strong'; score: number } => {
  let score = 0;
  
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return { level: 'weak', score };
  if (score <= 4) return { level: 'medium', score };
  return { level: 'strong', score };
};

const strengthConfig = {
  weak: { color: 'bg-red-500', text: 'Fraca', textColor: 'text-red-400' },
  medium: { color: 'bg-amber-500', text: 'Média', textColor: 'text-amber-400' },
  strong: { color: 'bg-emerald-500', text: 'Forte', textColor: 'text-emerald-400' },
};

export default function CompletePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get('email');
  const code = searchParams.get('code');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activationResult, setActivationResult] = useState<{
    plan: string;
    credits: number;
  } | null>(null);

  // Password strength
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  // Password requirements
  const requirements = useMemo(() => [
    { met: password.length >= 6, text: 'Mínimo 6 caracteres' },
    { met: /[a-z]/.test(password), text: 'Uma letra minúscula' },
    { met: /[A-Z]/.test(password), text: 'Uma letra maiúscula' },
    { met: /[0-9]/.test(password), text: 'Um número' },
  ], [password]);

  // Verificar se o email existe e pagamento está pago
  useEffect(() => {
    async function verifyAccess() {
      if (!email || !code) {
        setIsVerifying(false);
        setIsValid(false);
        return;
      }

      try {
        // Verificar se o pagamento existe e está pago
        const { data: payment, error } = await supabase
          .from('checkout_payments')
          .select('status, checkout_customers(email)')
          .eq('payment_code', code)
          .single();

        if (error || !payment || payment.status !== 'paid') {
          setIsValid(false);
          setIsVerifying(false);
          return;
        }

        const customerEmail = (payment.checkout_customers as any)?.email;
        if (customerEmail?.toLowerCase() !== email.toLowerCase()) {
          setIsValid(false);
          setIsVerifying(false);
          return;
        }

        setIsValid(true);
      } catch (error) {
        console.error('Error verifying access:', error);
        setIsValid(false);
      } finally {
        setIsVerifying(false);
      }
    }

    verifyAccess();
  }, [email, code]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !email || !code) return;

    setIsLoading(true);

    try {
      // Chamar edge function para ativar conta
      const { data, error } = await supabase.functions.invoke('checkout-activate-user', {
        body: { email, code, password }
      });

      if (error) {
        console.error('Activation error:', error);
        toast.error('Erro ao ativar conta. Tente novamente.');
        setIsLoading(false);
        return;
      }

      if (!data?.success) {
        toast.error(data?.error || 'Erro ao criar conta');
        setIsLoading(false);
        return;
      }

      // Sucesso! Mostrar modal
      setActivationResult({
        plan: data.plan || 'basic',
        credits: data.credits || 300
      });
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error activating account:', error);
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    // Fazer login automático
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email!,
        password: password
      });

      if (error) {
        console.error('Auto-login error:', error);
        toast.error('Faça login manualmente com suas credenciais.');
        navigate('/genesis-ia?welcome=true');
        return;
      }

      // Sucesso no login, redirecionar
      navigate('/genesis-ia?welcome=true', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      navigate('/genesis-ia?welcome=true');
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <CheckoutLayout showSecurityBadges={false}>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Verificando acesso...</p>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  // Invalid access
  if (!isValid || !email) {
    return (
      <CheckoutLayout showSecurityBadges={false}>
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Link Inválido
            </h1>
            <p className="text-white/60 mb-6">
              Este link de ativação é inválido ou já foi utilizado.
            </p>
            <button
              onClick={() => navigate('/genesis-ia')}
              className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  return (
    <>
      <CheckoutLayout showSecurityBadges={false}>
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Pagamento Confirmado!
              </h1>
              <p className="text-white/60">
                Crie sua senha para acessar o Genesis IA
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-white/60 cursor-not-allowed"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Shield className="w-4 h-4 text-emerald-500/60" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-white/40">
                  Email vinculado ao seu pagamento
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Criar Senha <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: '' }));
                      }
                    }}
                    disabled={isLoading}
                    placeholder="Mínimo 6 caracteres"
                    className={cn(
                      "w-full h-12 pl-12 pr-12 rounded-xl border border-white/10",
                      "bg-white/5 text-white placeholder:text-white/30",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                      errors.password && "border-red-500/50"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                )}

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-2"
                  >
                    {/* Strength Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={cn("h-full rounded-full", strengthConfig[passwordStrength.level].color)}
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className={cn("text-xs font-medium", strengthConfig[passwordStrength.level].textColor)}>
                        {strengthConfig[passwordStrength.level].text}
                      </span>
                    </div>

                    {/* Requirements */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {requirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          {req.met ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <X className="w-3 h-3 text-white/30" />
                          )}
                          <span className={req.met ? 'text-white/60' : 'text-white/30'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Confirmar Senha <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    disabled={isLoading}
                    placeholder="Digite a senha novamente"
                    className={cn(
                      "w-full h-12 pl-12 pr-12 rounded-xl border border-white/10",
                      "bg-white/5 text-white placeholder:text-white/30",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                      errors.confirmPassword && "border-red-500/50"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
                )}
                {/* Password match indicator */}
                {confirmPassword.length > 0 && password === confirmPassword && (
                  <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Senhas coincidem
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-14 rounded-xl font-semibold text-white",
                  "bg-gradient-to-r from-emerald-500 to-emerald-600",
                  "hover:from-emerald-600 hover:to-emerald-700",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                  "transition-all flex items-center justify-center gap-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "shadow-lg shadow-emerald-500/20"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Criando sua conta...
                  </>
                ) : (
                  'Criar Conta e Acessar'
                )}
              </button>
            </form>

            {/* Support */}
            <p className="mt-6 text-center text-sm text-white/40">
              Dúvidas? Entre em contato com nosso suporte.
            </p>
          </motion.div>
        </div>
      </CheckoutLayout>

      {/* Success Modal */}
      <AccountCreatedModal
        open={showSuccessModal}
        email={email || ''}
        password={password}
        planName={activationResult?.plan}
        credits={activationResult?.credits}
        onContinue={handleContinue}
      />
    </>
  );
}
