import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Brain, 
  Sparkles, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2,
  Zap,
  Globe,
  Users,
  BarChart3,
  Bot,
  Network,
  Rocket,
  Target,
  TrendingUp
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SUPER_ADMIN_EMAIL = "lyronrp@gmail.com";

const GenesisIALogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error("Credenciais inválidas");
        return;
      }

      const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      toast.success(isSuperAdmin ? "Bem-vindo, Administrador!" : "Bem-vindo ao Genesis IA!");
      navigate("/genesis-ia/dashboard");
    } catch (error) {
      toast.error("Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const orbitingIcons = [
    { icon: Target, delay: 0 },
    { icon: Users, delay: 0.5 },
    { icon: TrendingUp, delay: 1 },
    { icon: Rocket, delay: 1.5 },
    { icon: BarChart3, delay: 2 },
    { icon: Zap, delay: 2.5 },
  ];

  return (
    <div className="min-h-screen flex bg-[#050a12]">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Deep Space Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0a1628_0%,_#050a12_70%)]" />
        
        {/* Stars */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Nebula Glows */}
        <motion.div
          className="absolute top-10 left-10 w-96 h-96 rounded-full bg-blue-600/10 blur-[150px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-cyan-500/10 blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </motion.div>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                GENESIS<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> IA</span>
              </h1>
            </div>
          </motion.div>

          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Conquistar
            </h2>
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 italic mb-6">
              o mundo digital
            </h2>
            <p className="text-blue-200/60 text-lg max-w-md leading-relaxed">
              Acesse sua plataforma de prospecção inteligente e 
              descubra oportunidades globais com IA de última geração.
            </p>
          </motion.div>

          {/* Rotating Planet System */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative w-80 h-80"
          >
            {/* Outer Orbit Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border border-blue-500/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Middle Orbit Ring */}
            <motion.div
              className="absolute inset-8 rounded-full border border-cyan-400/15"
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner Orbit Ring */}
            <motion.div
              className="absolute inset-16 rounded-full border border-blue-400/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />

            {/* Orbiting Icons */}
            {orbitingIcons.map((item, index) => {
              const angle = (index * 60) * (Math.PI / 180);
              const radius = 130;
              
              return (
                <motion.div
                  key={index}
                  className="absolute left-1/2 top-1/2"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                    delay: item.delay,
                  }}
                  style={{
                    transformOrigin: "0 0",
                  }}
                >
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-[#0a1628]/80 backdrop-blur border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20"
                    style={{
                      transform: `translate(${Math.cos(angle) * radius - 20}px, ${Math.sin(angle) * radius - 20}px)`,
                    }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: item.delay }}
                  >
                    <item.icon className="w-5 h-5 text-blue-400" />
                  </motion.div>
                </motion.div>
              );
            })}

            {/* Center Planet */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="relative w-36 h-36"
                animate={{ rotate: 360 }}
                transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
              >
                {/* Planet Core */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-2xl shadow-blue-500/50">
                  {/* Planet Surface Details */}
                  <div className="absolute inset-2 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" 
                         style={{ transform: 'rotate(-30deg)' }} />
                    <motion.div 
                      className="absolute w-8 h-3 rounded-full bg-blue-400/40 top-6 left-4"
                      animate={{ x: [0, 30, 0] }}
                      transition={{ duration: 8, repeat: Infinity }}
                    />
                    <motion.div 
                      className="absolute w-12 h-4 rounded-full bg-cyan-300/30 bottom-8 right-4"
                      animate={{ x: [0, -20, 0] }}
                      transition={{ duration: 10, repeat: Infinity }}
                    />
                    <motion.div 
                      className="absolute w-6 h-2 rounded-full bg-blue-300/40 top-1/2 left-1/2"
                      animate={{ x: [0, 15, 0] }}
                      transition={{ duration: 6, repeat: Infinity }}
                    />
                  </div>
                </div>
                
                {/* Planet Glow */}
                <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl" />
                
                {/* Planet Ring */}
                <motion.div
                  className="absolute -inset-6 border-2 border-cyan-400/30 rounded-full"
                  style={{ 
                    transform: 'rotateX(70deg)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
              {orbitingIcons.map((_, index) => {
                const angle = (index * 60) * (Math.PI / 180);
                const startX = 160;
                const startY = 160;
                const endX = startX + Math.cos(angle) * 130;
                const endY = startY + Math.sin(angle) * 130;
                
                return (
                  <motion.line
                    key={index}
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="url(#lineGradient)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                  />
                );
              })}
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#0a1628_0%,_#050a12_60%)]" />
        
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                GENESIS<span className="text-blue-400"> IA</span>
              </h1>
            </div>
            <p className="text-blue-200/50 text-sm text-center">
              Prospecção inteligente com IA
            </p>
          </div>

          {/* Welcome Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-8"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">Acesso Global</span>
            </div>
          </motion.div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">
              Bem-vindo de volta
            </h2>
            <p className="text-blue-200/50 leading-relaxed">
              Entre para acessar sua central de prospecção e descobrir novas oportunidades de negócio.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-200/80">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-[#0a1628]/50 border-blue-500/20 text-white placeholder:text-blue-300/30 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-200/80">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 bg-[#0a1628]/50 border-blue-500/20 text-white placeholder:text-blue-300/30 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400/50 hover:text-blue-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm text-blue-400/70 hover:text-blue-400 transition-colors">
                Esqueceu a senha?
              </button>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Entrar na plataforma</span>
                    <Rocket className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Info */}
          <div className="mt-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <p className="text-blue-300/50 text-sm text-center">
              Acesso exclusivo para membros Genesis IA
            </p>
          </div>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-blue-300/30 text-xs">
              © 2025 Genesis IA. Prospecção Inteligente.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GenesisIALogin;
