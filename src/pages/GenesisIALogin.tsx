import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2,
  ArrowRight,
  MessageCircle
} from "lucide-react";
import genesisLogo from "@/assets/genesis-logo.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Animated Canvas Background Component
const AnimatedGlow = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      ctx.clearRect(0, 0, width, height);

      // Create flowing gradient orbs
      const orbs = [
        {
          x: width * 0.3 + Math.sin(time * 0.5) * 50,
          y: height * 0.6 + Math.cos(time * 0.3) * 30,
          radius: 180 + Math.sin(time * 0.7) * 30,
          color: 'rgba(59, 130, 246, 0.4)'
        },
        {
          x: width * 0.5 + Math.cos(time * 0.4) * 40,
          y: height * 0.5 + Math.sin(time * 0.6) * 40,
          radius: 150 + Math.cos(time * 0.5) * 25,
          color: 'rgba(6, 182, 212, 0.35)'
        },
        {
          x: width * 0.7 + Math.sin(time * 0.6) * 30,
          y: height * 0.7 + Math.cos(time * 0.4) * 35,
          radius: 120 + Math.sin(time * 0.8) * 20,
          color: 'rgba(139, 92, 246, 0.25)'
        }
      ];

      // Draw flowing wave
      ctx.beginPath();
      ctx.moveTo(0, height * 0.7);
      
      for (let x = 0; x <= width; x += 5) {
        const y = height * 0.65 + 
          Math.sin((x * 0.01) + time) * 40 +
          Math.sin((x * 0.02) + time * 1.5) * 20 +
          Math.cos((x * 0.005) + time * 0.5) * 30;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();

      const waveGradient = ctx.createLinearGradient(0, height * 0.5, width, height);
      waveGradient.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      waveGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)');
      waveGradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');
      ctx.fillStyle = waveGradient;
      ctx.fill();

      // Draw orbs with glow
      orbs.forEach(orb => {
        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.radius
        );
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(0.5, orb.color.replace(/[\d.]+\)$/, '0.15)'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Draw flowing lines
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 + i * 0.05})`;
        ctx.lineWidth = 2 - i * 0.5;
        
        for (let x = 0; x <= width; x += 3) {
          const offset = i * 20;
          const y = height * 0.6 + offset +
            Math.sin((x * 0.008) + time + i) * 50 +
            Math.cos((x * 0.015) + time * 0.7 + i) * 25;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      time += 0.015;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
};

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
      navigate("/login/dashboard");
    } catch (error) {
      toast.error("Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 md:p-8 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Left Side - Branding & Animation */}
          <div className="relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-card to-background overflow-hidden min-h-[600px]">
            {/* Animated Background */}
            <AnimatedGlow />
            
            {/* Content overlay */}
            <div className="relative z-10">
              {/* Version Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 mb-8"
              >
                <div className="h-6 w-1 bg-primary rounded-full" />
                <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
                  Genesis Hub v2.0
                </span>
              </motion.div>

              {/* Main Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-4">
                  Automatize seus
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-primary">
                    Negócios.
                  </span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-sm">
                  A plataforma de automação que transforma prospecção em resultados reais.
                </p>
              </motion.div>
            </div>

            {/* Bottom Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative z-10 flex gap-8"
            >
              <div>
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-xs text-muted-foreground">Usuários ativos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">10K+</p>
                <p className="text-xs text-muted-foreground">Leads gerados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">98%</p>
                <p className="text-xs text-muted-foreground">Satisfação</p>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-10"
            >
              <div className="relative">
                <img src={genesisLogo} alt="Genesis Hub" className="w-16 h-16 object-contain" />
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Welcome Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Acesse sua conta
              </h2>
              <p className="text-muted-foreground text-sm">
                Bem-vindo de volta. Digite seus dados para entrar.
              </p>
            </motion.div>

            {/* Login Form */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="pt-2"
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all group"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="uppercase tracking-wider text-sm">Entrar</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            {/* Support Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center"
            >
              <a 
                href="https://wa.me/5527920005215" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-primary transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Dificuldades no acesso? Contatar o suporte
              </a>
            </motion.div>

            {/* Footer - Mobile only */}
            <div className="lg:hidden mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-muted-foreground/50 text-xs">
                © {new Date().getFullYear()} Genesis Hub
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="hidden lg:block mt-6 text-center"
        >
          <p className="text-muted-foreground/40 text-xs">
            © {new Date().getFullYear()} Genesis Hub. Todos os direitos reservados.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GenesisIALogin;
