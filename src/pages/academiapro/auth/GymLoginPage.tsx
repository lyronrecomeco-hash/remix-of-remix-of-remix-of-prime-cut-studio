import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { toast } from 'sonner';

export default function GymLoginPage() {
  const navigate = useNavigate();
  const { signIn, isLoading: authLoading, isAuthenticated, role } = useGymAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'admin' || role === 'instrutor') {
        navigate('/academiapro/admin');
      } else {
        navigate('/academiapro/app');
      }
    }
  }, [isAuthenticated, role, navigate]);

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
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Academia Genesis</h1>
                <p className="text-zinc-500 text-sm">Sistema de gestão</p>
              </div>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">Bem-vindo de volta</h2>
            <p className="text-zinc-400 mt-2">Entre com suas credenciais para acessar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 h-12 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300 text-sm">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-orange-500 focus:ring-orange-500"
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
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
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

          <p className="mt-8 text-center text-zinc-500 text-xs">
            Seu acesso é criado pelo administrador da academia.
          </p>
        </motion.div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-zinc-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-600/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center px-12"
        >
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-orange-500/20 flex items-center justify-center">
            <Dumbbell className="w-12 h-12 text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Gerencie sua academia
          </h2>
          <p className="text-zinc-400 text-lg max-w-md">
            Controle completo de alunos, treinos, aulas e finanças em um único lugar.
          </p>
          
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: 'Alunos', value: '500+' },
              { label: 'Treinos', value: '1.2K' },
              { label: 'Aulas', value: '50+' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-zinc-800/50 rounded-xl p-4"
              >
                <p className="text-2xl font-bold text-orange-500">{stat.value}</p>
                <p className="text-zinc-500 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
