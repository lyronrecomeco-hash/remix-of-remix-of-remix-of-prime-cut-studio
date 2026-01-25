import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Cpu,
  Network
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

      toast.success("Bem-vindo ao Genesis Hub!");
      navigate("/genesis-ia/dashboard");
    } catch (error) {
      toast.error("Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Bot, label: "IA Avançada" },
    { icon: Globe, label: "Alcance Global" },
    { icon: Users, label: "Prospecção" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Zap, label: "Automação" },
    { icon: Network, label: "Integração" },
  ];

  return (
    <div className="min-h-screen flex bg-[#0a0f1a]">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f1d32] to-[#0a0f1a]" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Floating Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 rounded-full bg-blue-500/20 blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 right-20 w-96 h-96 rounded-full bg-cyan-500/20 blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-500/15 blur-[80px]"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Brain className="w-9 h-9 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Genesis<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Hub</span>
                </h1>
                <p className="text-blue-300/60 text-sm font-medium">Plataforma de Negócios Inteligente</p>
              </div>
            </div>
          </motion.div>

          {/* Central Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative mb-16"
          >
            <div className="relative w-80 h-80">
              {/* Rotating Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-500/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-4 rounded-full border border-cyan-400/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-8 rounded-full border border-blue-400/15"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600/40 to-cyan-500/40 backdrop-blur-xl flex items-center justify-center border border-blue-400/30"
                  animate={{ 
                    boxShadow: [
                      "0 0 40px rgba(59, 130, 246, 0.3)",
                      "0 0 80px rgba(59, 130, 246, 0.5)",
                      "0 0 40px rgba(59, 130, 246, 0.3)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Cpu className="w-16 h-16 text-blue-400" />
                </motion.div>
              </div>

              {/* Floating Icons */}
              {features.map((feature, index) => {
                const angle = (index * 60) * (Math.PI / 180);
                const radius = 140;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                return (
                  <motion.div
                    key={index}
                    className="absolute left-1/2 top-1/2"
                    style={{ x: x - 20, y: y - 20 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  >
                    <motion.div
                      className="w-10 h-10 rounded-xl bg-[#0f1d32] border border-blue-500/30 flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.2 }}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2 + index * 0.5, repeat: Infinity }}
                    >
                      <feature.icon className="w-5 h-5 text-blue-400" />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold text-white mb-3">
              O Futuro da Prospecção
            </h2>
            <p className="text-blue-300/60 max-w-sm">
              Descubra oportunidades globais com inteligência artificial de última geração
            </p>
          </motion.div>
        </div>

      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Subtle Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#0c1322] to-[#0a0f1a]" />
        
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Genesis<span className="text-blue-400"> Hub</span>
            </h1>
          </div>

          {/* Welcome Card */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
            >
              <span className="text-lg">👋</span>
              <span className="text-blue-300 text-sm font-medium">Bem-vindo de volta</span>
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              Acesse sua conta
            </h2>
            <p className="text-blue-300/60">
              Entre para continuar explorando o poder da IA
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-200/80">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-[#0f1d32]/50 border-blue-500/20 text-white placeholder:text-blue-300/30 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-200/80">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 bg-[#0f1d32]/50 border-blue-500/20 text-white placeholder:text-blue-300/30 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl transition-all"
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

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-blue-400/70 hover:text-blue-400 transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Entrar</span>
                    <Sparkles className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            <span className="text-blue-300/40 text-sm">ou</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          </div>

          {/* Support Link */}
          <div className="text-center">
            <a 
              href="https://wa.me/5527920005215" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-300/50 text-sm hover:text-blue-300 transition-colors"
            >
              Dúvidas de acesso? Contacte nosso suporte
            </a>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-blue-300/30 text-xs">
              © {new Date().getFullYear()} Genesis Hub. Todos os direitos reservados.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GenesisIALogin;
