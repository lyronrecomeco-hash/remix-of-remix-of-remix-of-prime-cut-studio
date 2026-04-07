/**
 * Página de retorno Cakto — captura email do checkout, cria senha, ativa acesso
 */
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, Lock, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CaktoReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [success, setSuccess] = useState(false);

  // Filter out literal template variables like {email}, {name}, etc.
  const cleanParam = (val: string | null): string => {
    if (!val) return '';
    if (/^\{.*\}$/.test(val.trim())) return ''; // literal template var
    return val;
  };

  const emailParam = cleanParam(searchParams.get('email')) || cleanParam(searchParams.get('customer_email'));
  const nameParam = cleanParam(searchParams.get('name')) || cleanParam(searchParams.get('first_name')) || cleanParam(searchParams.get('customer_name'));
  const phoneParam = cleanParam(searchParams.get('phone')) || cleanParam(searchParams.get('customer_phone'));
  const planIdParam = cleanParam(searchParams.get('plan_id')) || cleanParam(searchParams.get('planId'));
  const userTypeParam = cleanParam(searchParams.get('user_type'));

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    if (nameParam) setName(nameParam);

    const check = async () => {
      if (emailParam) {
        const { data } = await supabase
          .from('genesis_users')
          .select('id')
          .eq('email', emailParam)
          .maybeSingle();
        if (data) setAlreadyExists(true);
      }
      setChecking(false);
    };
    check();
  }, [emailParam, nameParam]);

  const handleCreateAccount = async () => {
    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      // Call edge function to create account + subscription
      const { data, error } = await supabase.functions.invoke('cakto-activate-user', {
        body: {
          email,
          password,
          name: name || undefined,
          phone: phoneParam || undefined,
          planId: planIdParam || undefined,
          userType: userTypeParam || undefined,
        },
      });

      if (error) throw new Error(error.message || 'Erro ao criar conta');
      if (data?.error) throw new Error(data.error);

      // Sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      setSuccess(true);
      toast.success('Conta criada com sucesso!');

      setTimeout(() => navigate('/login/dashboard'), 2000);
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Tudo pronto!</h2>
          <p className="text-gray-400">Redirecionando para o painel...</p>
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500 mx-auto" />
        </motion.div>
      </div>
    );
  }

  if (alreadyExists) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#12121a] border border-emerald-500/20 rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Pagamento Confirmado!</h2>
              <p className="text-gray-400 mt-2">Sua conta já existe. Faça login para acessar.</p>
            </div>
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl"
            >
              Ir para Login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-3">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-400 font-medium">Pagamento Confirmado</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Crie sua senha</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Defina sua senha para acessar o painel Genesis Hub
            </p>
          </motion.div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#12121a] border border-white/5 rounded-2xl p-6 space-y-5"
        >
          {/* Email (locked) */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">E-mail</Label>
            <Input
              value={email}
              disabled
              className="bg-white/5 border-white/10 text-gray-300 h-11 rounded-xl"
            />
          </div>

          {/* Name */}
          {!nameParam && (
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Seu nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como quer ser chamado?"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-11 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20"
              />
            </div>
          )}

          {/* Password */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">Criar Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-11 rounded-xl pl-10 pr-10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">Confirmar Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-11 rounded-xl pl-10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-xs">As senhas não coincidem</p>
            )}
          </div>

          {/* Submit */}
          <Button
            onClick={handleCreateAccount}
            disabled={loading || !password || !confirmPassword || password !== confirmPassword}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white h-12 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Criar Conta e Acessar
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>

        <p className="text-center text-gray-500 text-xs mt-4">
          Ao criar sua conta, você concorda com nossos termos de uso.
        </p>
      </motion.div>
    </div>
  );
};

export default CaktoReturn;
