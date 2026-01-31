import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { toast } from 'sonner';

export default function GymLoginPage() {
  const navigate = useNavigate();
  const { signIn, isLoading: authLoading } = useGymAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error('Erro ao fazer login', {
        description: error.message || 'Verifique suas credenciais'
      });
      setIsLoading(false);
      return;
    }

    toast.success('Login realizado com sucesso!');
    navigate('/academiapro/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-zinc-950 to-zinc-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Academia Genesis</h1>
          <p className="text-zinc-400 mt-2">Acesse sua conta</p>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-orange-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-orange-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || authLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              Não tem uma conta?{' '}
              <Link to="/academiapro/auth/register" className="text-orange-500 hover:text-orange-400 font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>

        {/* Admin Link */}
        <div className="mt-6 text-center">
          <Link to="/academiapro/admin/login" className="text-zinc-500 hover:text-zinc-400 text-sm">
            Acesso Administrativo →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
