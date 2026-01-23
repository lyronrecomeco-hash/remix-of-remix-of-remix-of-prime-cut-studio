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

// Password strength checker with security levels
const getPasswordStrength = (password: string): { 
  level: 'weak' | 'medium' | 'strong'; 
  score: number;
  isValid: boolean;
} => {
  let score = 0;
  
  // Length checks
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character type checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)) score += 1;
  
  // Penalize common patterns
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated chars
  if (/^[0-9]+$/.test(password)) score -= 1; // Only numbers
  if (/^(123|abc|qwe|password|senha)/i.test(password)) score -= 2; // Common patterns
  
  // Minimum requirements: 6 chars and at least 2 requirements met
  const isValid = password.length >= 6 && score >= 3;
  
  if (score <= 2) return { level: 'weak', score: Math.max(0, score), isValid };
  if (score <= 4) return { level: 'medium', score, isValid };
  return { level: 'strong', score, isValid };
};

const strengthConfig = {
  weak: { 
    color: 'bg-red-500', 
    text: 'Fraca', 
    textColor: 'text-red-400',
    description: 'Adicione mais caracteres e variedade'
  },
  medium: { 
    color: 'bg-amber-500', 
    text: 'Média', 
    textColor: 'text-amber-400',
    description: 'Adicione caracteres especiais para melhorar'
  },
  strong: { 
    color: 'bg-emerald-500', 
    text: 'Forte', 
    textColor: 'text-emerald-400',
    description: 'Excelente! Senha segura'
  },
};

// Sanitize password input (remove potentially dangerous chars but allow special chars for strength)
const sanitizePassword = (input: string): string => {
  // Allow letters, numbers, and common special characters
  // Remove control characters and null bytes
  return input.replace(/[\x00-\x1F\x7F]/g, '').slice(0, 128);
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
  const [attempts, setAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Password strength
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  // Password requirements with icons
  const requirements = useMemo(() => [
    { met: password.length >= 6, text: 'Mínimo 6 caracteres', priority: 1 },
    { met: password.length >= 8, text: '8+ caracteres (recomendado)', priority: 2 },
    { met: /[a-z]/.test(password), text: 'Uma letra minúscula', priority: 1 },
    { met: /[A-Z]/.test(password), text: 'Uma letra maiúscula', priority: 1 },
    { met: /[0-9]/.test(password), text: 'Um número', priority: 1 },
    { met: /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password), text: 'Caractere especial (!@#$...)', priority: 2 },
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

    // Rate limiting check
    if (attempts >= 5) {
      setIsRateLimited(true);
      setTimeout(() => {
        setIsRateLimited(false);
        setAttempts(0);
      }, 60000); // 1 minute cooldown
      newErrors.password = 'Muitas tentativas. Aguarde 1 minuto.';
      setErrors(newErrors);
      return false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    } else if (password.length > 128) {
      newErrors.password = 'Senha muito longa (máximo 128 caracteres)';
    } else if (!passwordStrength.isValid) {
      newErrors.password = 'Senha muito fraca. Adicione mais variedade de caracteres.';
    } else if (/(.)\1{3,}/.test(password)) {
      newErrors.password = 'Evite repetir o mesmo caractere muitas vezes';
    } else if (/^(123456|password|senha123|qwerty)/i.test(password)) {
      newErrors.password = 'Senha muito comum. Escolha uma senha única.';
    }

    // Confirm password validation
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

    if (isRateLimited) {
      toast.error('Aguarde antes de tentar novamente.');
      return;
    }

    setAttempts(prev => prev + 1);

    if (!validateForm() || !email || !code) return;

    setIsLoading(true);

    try {
      // Sanitize password before sending
      const sanitizedPassword = sanitizePassword(password);
      
      // Chamar edge function para ativar conta
      const { data, error } = await supabase.functions.invoke('checkout-activate-user', {
        body: { 
          email: email.toLowerCase().trim(), 
          code: code.trim(), 
          password: sanitizedPassword 
        }
      });

      if (error) {
        console.error('Activation error:', error);
        toast.error('Erro ao ativar conta. Tente novamente.');
        setIsLoading(false);
        return;
      }

      if (!data?.success) {
        const errorMsg = data?.error || 'Erro ao criar conta';
        toast.error(errorMsg);
        
        // Log security event (without sensitive data)
        console.warn('Account activation failed:', { email: email.substring(0, 3) + '***', code: code.substring(0, 4) + '***' });
        
        setIsLoading(false);
        return;
      }

      // Reset attempts on success
      setAttempts(0);

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
                      const sanitized = sanitizePassword(e.target.value);
                      setPassword(sanitized);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: '' }));
                      }
                    }}
                    disabled={isLoading || isRateLimited}
                    placeholder="Mínimo 6 caracteres"
                    maxLength={128}
                    autoComplete="new-password"
                    className={cn(
                      "w-full h-12 pl-12 pr-12 rounded-xl border border-white/10",
                      "bg-white/5 text-white placeholder:text-white/30",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                      errors.password && "border-red-500/50",
                      isRateLimited && "opacity-50 cursor-not-allowed"
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
                    className="mt-3 space-y-3"
                  >
                    {/* Strength Bar with segments */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex gap-1">
                          {[1, 2, 3, 4, 5].map((segment) => (
                            <div 
                              key={segment}
                              className={cn(
                                "h-1.5 flex-1 rounded-full transition-all duration-300",
                                passwordStrength.score >= segment 
                                  ? strengthConfig[passwordStrength.level].color
                                  : "bg-white/10"
                              )}
                            />
                          ))}
                        </div>
                        <span className={cn("text-xs font-medium min-w-[50px] text-right", strengthConfig[passwordStrength.level].textColor)}>
                          {strengthConfig[passwordStrength.level].text}
                        </span>
                      </div>
                      <p className="text-xs text-white/40">
                        {strengthConfig[passwordStrength.level].description}
                      </p>
                    </div>

                    {/* Requirements Grid */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-white/5 border border-white/5">
                      {requirements.map((req, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "flex items-center gap-2 text-xs transition-all",
                            req.priority === 2 && "opacity-70"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center transition-all",
                            req.met 
                              ? "bg-emerald-500/20" 
                              : "bg-white/5"
                          )}>
                            {req.met ? (
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                            ) : (
                              <X className="w-2.5 h-2.5 text-white/20" />
                            )}
                          </div>
                          <span className={cn(
                            "transition-colors",
                            req.met ? 'text-white/70' : 'text-white/30'
                          )}>
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
