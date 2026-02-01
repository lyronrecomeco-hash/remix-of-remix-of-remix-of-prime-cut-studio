import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { toast } from 'sonner';

// Animated dumbbell component
const AnimatedDumbbell = ({ delay = 0, className = '' }: { delay?: number; className?: string }) => (
  <motion.div
    initial={{ rotate: -15, scale: 0.9 }}
    animate={{ 
      rotate: [null, 15, -15],
      scale: [null, 1.1, 0.9]
    }}
    transition={{ 
      duration: 2,
      delay,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut'
    }}
    className={className}
  >
    <Dumbbell className="w-full h-full text-orange-500" />
  </motion.div>
);

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

      {/* Right side - Animated Gym Visual */}
      <div className="hidden lg:flex lg:flex-1 bg-zinc-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-600/10" />
        
        {/* Floating dumbbells animation */}
        <div className="absolute inset-0">
          <AnimatedDumbbell delay={0} className="absolute top-20 left-20 w-12 h-12 opacity-20" />
          <AnimatedDumbbell delay={0.5} className="absolute top-40 right-32 w-8 h-8 opacity-15" />
          <AnimatedDumbbell delay={1} className="absolute bottom-32 left-32 w-10 h-10 opacity-20" />
          <AnimatedDumbbell delay={1.5} className="absolute bottom-20 right-20 w-14 h-14 opacity-15" />
          <AnimatedDumbbell delay={0.3} className="absolute top-1/3 left-1/4 w-6 h-6 opacity-10" />
          <AnimatedDumbbell delay={0.8} className="absolute bottom-1/3 right-1/4 w-8 h-8 opacity-10" />
        </div>
        
        {/* Animated rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-96 h-96 rounded-full border-2 border-orange-500/20"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute w-80 h-80 rounded-full border border-orange-500/15"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute w-64 h-64 rounded-full border border-orange-500/10"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center px-12"
        >
          {/* Main animated dumbbell */}
          <motion.div 
            className="w-32 h-32 mx-auto mb-8 rounded-2xl bg-orange-500/20 flex items-center justify-center relative"
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(249, 115, 22, 0.2)',
                '0 0 40px rgba(249, 115, 22, 0.4)',
                '0 0 20px rgba(249, 115, 22, 0.2)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, 0, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Dumbbell className="w-16 h-16 text-orange-500" />
            </motion.div>
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Gerencie sua academia
          </h2>
          <p className="text-zinc-400 text-lg max-w-md">
            Controle completo de alunos, treinos, aulas e finanças em um único lugar.
          </p>
          
          {/* Animated features */}
          <motion.div 
            className="mt-12 flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {['Treinos', 'Aulas', 'Alunos', 'Financeiro'].map((feature, i) => (
              <motion.span
                key={feature}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="px-4 py-2 bg-zinc-800/50 rounded-full text-sm text-zinc-300 border border-zinc-700/50"
              >
                {feature}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
