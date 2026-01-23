/**
 * CHECKOUT SYSTEM - Complete Page
 * Página para usuário criar senha após pagamento confirmado
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { CheckoutLayout } from '@/components/checkout/CheckoutLayout';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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

  // Verificar se o email existe e precisa de senha
  useEffect(() => {
    async function verifyAccess() {
      if (!email || !code) {
        setIsVerifying(false);
        setIsValid(false);
        return;
      }

      try {
        // Verificar se o pagamento existe
        const { data: payment } = await supabase
          .from('checkout_payments')
          .select('status, checkout_customers(email)')
          .eq('payment_code', code)
          .single();

        if (!payment || payment.status !== 'paid') {
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

    if (!validateForm() || !email) return;

    setIsLoading(true);

    try {
      // Tentar fazer login com senha temporária ou magic link
      // Como o usuário foi criado sem senha, precisamos usar updateUser
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        // Se não está logado, tentar login primeiro
        // Gerar um link de redefinição de senha via edge function seria ideal
        // Por agora, vamos orientar o usuário
        toast.error('Por favor, use o link enviado para seu email para definir a senha.');
        navigate('/genesis-ia', { replace: true });
        return;
      }

      toast.success('Senha definida com sucesso! Redirecionando...');
      
      // Aguardar um momento e redirecionar
      setTimeout(() => {
        navigate('/genesis-ia', { replace: true });
      }, 1500);

    } catch (error) {
      console.error('Error setting password:', error);
      toast.error('Erro ao definir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
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
    <CheckoutLayout showSecurityBadges={false}>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
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
              <input
                type="email"
                value={email}
                disabled
                className="w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-white/60 cursor-not-allowed"
              />
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
                  Criando acesso...
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
        </div>
      </div>
    </CheckoutLayout>
  );
}
