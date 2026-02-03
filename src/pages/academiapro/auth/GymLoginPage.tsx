import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Mail, Lock, Eye, EyeOff, Loader2, Heart, Flame, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { toast } from 'sonner';

// Animated person lifting weights
const AnimatedPerson = () => (
  <motion.div className="relative w-48 h-48">
    {/* Body */}
    <motion.div 
      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-12 h-24 bg-primary rounded-t-3xl"
      animate={{ scaleY: [1, 0.95, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
    {/* Head */}
    <motion.div 
      className="absolute bottom-32 left-1/2 -translate-x-1/2 w-10 h-10 bg-primary/80 rounded-full"
    />
    {/* Arms with weights */}
    <motion.div 
      className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4"
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Left weight */}
      <div className="flex items-center">
        <div className="w-4 h-4 bg-muted-foreground rounded" />
        <div className="w-10 h-2 bg-muted" />
        <div className="w-4 h-4 bg-muted-foreground rounded" />
      </div>
      {/* Bar */}
      <div className="w-8 h-2 bg-border -mx-6" />
      {/* Right weight */}
      <div className="flex items-center">
        <div className="w-4 h-4 bg-muted-foreground rounded" />
        <div className="w-10 h-2 bg-muted" />
        <div className="w-4 h-4 bg-muted-foreground rounded" />
      </div>
    </motion.div>
    {/* Legs */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
      <motion.div 
        className="w-4 h-8 bg-primary/90 rounded-b-lg"
        animate={{ scaleY: [1, 0.9, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div 
        className="w-4 h-8 bg-primary/90 rounded-b-lg"
        animate={{ scaleY: [1, 0.9, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
      />
    </div>
  </motion.div>
);

// Floating gym elements
const FloatingElement = ({ icon: Icon, delay, x, y, size = 24 }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.2, 0.4, 0.2],
      scale: [1, 1.2, 1],
      y: [0, -10, 0]
    }}
    transition={{ 
      duration: 3,
      delay,
      repeat: Infinity,
      ease: 'easeInOut'
    }}
    className="absolute"
    style={{ left: x, top: y }}
  >
    <Icon size={size} className="text-primary" />
  </motion.div>
);

// Heartbeat line animation
const HeartbeatLine = () => (
  <svg className="w-full h-16 text-primary/30" viewBox="0 0 400 50">
    <motion.path
      d="M0,25 L80,25 L100,10 L120,40 L140,15 L160,35 L180,25 L400,25"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />
  </svg>
);

// Pulsing circles
const PulsingCircle = ({ delay, size }: { delay: number; size: number }) => (
  <motion.div
    className="absolute rounded-full border-2 border-primary/20"
    style={{ width: size, height: size }}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ 
      scale: [1, 1.5, 1],
      opacity: [0.1, 0.3, 0.1]
    }}
    transition={{ 
      duration: 4,
      delay,
      repeat: Infinity,
      ease: 'easeInOut'
    }}
  />
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
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-8">
            <motion.div 
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div 
                className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Dumbbell className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Academia Genesis</h1>
                <p className="text-muted-foreground text-sm">Sistema de gestão</p>
              </div>
            </motion.div>
            <motion.h2 
              className="text-2xl lg:text-3xl font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Bem-vindo de volta
            </motion.h2>
            <motion.p 
              className="text-muted-foreground mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Entre com suas credenciais para acessar
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label htmlFor="email" className="text-foreground/80 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  required
                />
              </div>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Label htmlFor="password" className="text-foreground/80 text-sm">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                disabled={isLoading || authLoading}
                className="w-full h-12 bg-primary hover:bg-primary/80 text-primary-foreground font-semibold"
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
            </motion.div>
          </form>

          <motion.p 
            className="mt-8 text-center text-muted-foreground text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Seu acesso é criado pelo administrador da academia.
          </motion.p>
        </motion.div>
      </div>

      {/* Right side - Animated Gym Visual */}
      <div className="hidden lg:flex lg:flex-1 bg-card items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        
        {/* Floating gym icons */}
        <FloatingElement icon={Dumbbell} delay={0} x="15%" y="20%" size={32} />
        <FloatingElement icon={Heart} delay={0.5} x="80%" y="15%" size={24} />
        <FloatingElement icon={Flame} delay={1} x="20%" y="75%" size={28} />
        <FloatingElement icon={Trophy} delay={1.5} x="85%" y="70%" size={26} />
        <FloatingElement icon={Zap} delay={0.8} x="10%" y="45%" size={20} />
        <FloatingElement icon={Dumbbell} delay={1.2} x="90%" y="45%" size={22} />
        
        {/* Pulsing circles in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <PulsingCircle delay={0} size={200} />
          <PulsingCircle delay={0.5} size={280} />
          <PulsingCircle delay={1} size={360} />
          <PulsingCircle delay={1.5} size={440} />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center px-12"
        >
          {/* Animated person lifting */}
          <div className="flex justify-center mb-8">
            <AnimatedPerson />
          </div>
          
          {/* Heartbeat line */}
          <div className="max-w-sm mx-auto mb-6">
            <HeartbeatLine />
          </div>
          
          <motion.h2 
            className="text-3xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Supere seus limites
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-lg max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Gerencie treinos, acompanhe evolução e transforme vidas
          </motion.p>
          
          {/* Animated features */}
          <motion.div 
            className="mt-10 flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { icon: Dumbbell, text: 'Treinos' },
              { icon: Heart, text: 'Saúde' },
              { icon: Trophy, text: 'Metas' },
              { icon: Flame, text: 'Evolução' }
            ].map((feature, i) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-foreground/80 border border-border/50"
              >
                <feature.icon className="w-4 h-4 text-primary" />
                {feature.text}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
