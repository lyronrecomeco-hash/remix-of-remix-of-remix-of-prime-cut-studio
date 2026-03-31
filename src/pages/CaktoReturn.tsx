/**
 * Página de retorno Cakto — captura email do checkout, cria senha, ativa acesso
 */
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CaktoReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyExists, setAlreadyExists] = useState(false);

  const paymentCode = searchParams.get('payment_code') || '';
  const emailParam = searchParams.get('email') || '';

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    // Check if user already exists
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
  }, [emailParam]);

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
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { source: 'cakto_checkout', payment_code: paymentCode } }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          // User exists, just sign in
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
          toast.success('Login realizado! Redirecionando...');
          navigate('/login/dashboard');
          return;
        }
        throw authError;
      }

      if (authData.user) {
        toast.success('Conta criada com sucesso! Redirecionando...');
        // Auto sign-in
        await supabase.auth.signInWithPassword({ email, password });
        navigate('/login/dashboard');
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (alreadyExists) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-foreground">Pagamento Confirmado!</CardTitle>
            <p className="text-muted-foreground mt-2">Sua conta já existe. Faça login para acessar o painel.</p>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/login')}>
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-foreground">Pagamento Confirmado!</CardTitle>
          <p className="text-muted-foreground mt-2">Crie sua senha para acessar o painel Genesis Hub.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">E-mail</Label>
            <Input
              value={email}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Criar Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Confirmar Senha</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
            />
          </div>
          <Button
            className="w-full"
            onClick={handleCreateAccount}
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Criar Conta e Acessar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaktoReturn;
