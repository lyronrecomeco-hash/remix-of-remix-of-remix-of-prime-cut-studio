import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Crown, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Gift, 
  Shield, 
  Zap, 
  Users, 
  TrendingUp, 
  Clock,
  Star,
  BadgeCheck,
  Lock,
  Rocket,
  Target,
  MessageCircle,
  BarChart3,
  Globe
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export default function PromoPage() {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const [isValidCode, setIsValidCode] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    validateCode();
  }, [codigo]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const validateCode = async () => {
    if (!codigo) {
      setIsValidCode(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('promo_links')
        .select('id')
        .eq('promo_code', codigo)
        .maybeSingle();

      setIsValidCode(!!data);
    } catch (error) {
      console.error('Erro ao validar código:', error);
      setIsValidCode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (planType: 'monthly' | 'quarterly' | 'yearly') => {
    const amounts: Record<string, number> = {
      monthly: 19700,
      quarterly: 29700,
      yearly: 69700
    };
    const descriptions: Record<string, string> = {
      monthly: 'Plano Mensal - Genesis Hub',
      quarterly: 'Plano Trimestral - Genesis Hub',
      yearly: 'Plano Anual - Genesis Hub'
    };
    
    const params = new URLSearchParams({
      amount: amounts[planType].toString(),
      description: descriptions[planType],
      plan: planType,
      ref: codigo || '',
      source: 'promo'
    });
    navigate(`/checkout?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!isValidCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1a] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <Gift className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Link Inválido
          </h1>
          <p className="text-white/60 mb-6">
            Este link promocional não existe ou expirou. Entre em contato com quem compartilhou o link com você.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  const features = [
    { icon: Target, label: 'Radar de Prospecção', desc: 'Encontre clientes automaticamente' },
    { icon: Brain, label: 'Propostas com IA', desc: 'Geração automática de propostas' },
    { icon: MessageCircle, label: 'Chatbots Ilimitados', desc: 'Automação de WhatsApp' },
    { icon: BarChart3, label: 'Analytics Avançado', desc: 'Métricas em tempo real' },
    { icon: Globe, label: 'Portfólio Online', desc: 'Site profissional incluso' },
    { icon: Users, label: 'Academia de Vendas', desc: 'Treinamentos exclusivos' },
  ];

  const testimonials = [
    { name: 'Carlos M.', role: 'Agência Digital', text: 'Triplicamos nossos leads em 2 meses usando o Radar.' },
    { name: 'Amanda R.', role: 'Consultora', text: 'As propostas geradas por IA são impressionantes.' },
    { name: 'Roberto S.', role: 'Freelancer', text: 'O melhor investimento que fiz para meu negócio.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1a] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
      </div>

      {/* Urgency Bar */}
      <div className="bg-gradient-to-r from-primary to-cyan-500 py-2.5 px-4 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 text-white">
          <Clock className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-medium">
            Oferta expira em: 
            <span className="font-mono font-bold ml-2">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="py-6 px-4 border-b border-white/10 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-white">Genesis Hub</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-10 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            {/* Exclusive Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/30 mb-6"
            >
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Link Exclusivo • Preços Especiais</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight"
            >
              Transforme Seu Negócio com
              <br />
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                Inteligência Artificial
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/60 mb-6 max-w-2xl mx-auto"
            >
              Você foi selecionado para ter acesso a condições <strong className="text-white">exclusivas</strong> que 
              não estão disponíveis no site oficial. Aproveite antes que expire.
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Pagamento Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-primary" />
                <span>Garantia de 7 dias</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>+500 usuários ativos</span>
              </div>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12"
          >
            {features.map((feature, i) => (
              <div 
                key={feature.label}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors"
              >
                <feature.icon className="w-6 h-6 text-primary mb-2" />
                <h4 className="font-semibold text-white text-sm">{feature.label}</h4>
                <p className="text-xs text-white/50">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-center text-xl font-bold text-white mb-6">
              Escolha Seu Plano Promocional
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Plano Mensal */}
              <Card className="border border-white/10 bg-white/5 backdrop-blur h-full relative overflow-hidden hover:border-white/20 transition-all group">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white">Mensal</h3>
                    <p className="text-xs text-white/50">1 mês de acesso</p>
                  </div>
                  
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">R$ 197</span>
                      <span className="text-white/50 text-sm">/mês</span>
                    </div>
                    <p className="text-xs text-white/40 mt-1 line-through">De R$ 297</p>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {['Acesso completo', 'Suporte via chat', 'Cancele quando quiser'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleSelectPlan('monthly')}
                    variant="outline"
                    className="w-full border-white/20 hover:bg-white/10"
                  >
                    Escolher Mensal
                  </Button>
                </CardContent>
              </Card>

              {/* Plano Trimestral - Popular */}
              <Card className="border-2 border-primary bg-gradient-to-b from-primary/10 to-transparent backdrop-blur h-full relative overflow-hidden scale-[1.02] shadow-xl shadow-primary/10">
                <div className="absolute top-0 left-0 right-0 bg-primary py-1.5 text-center">
                  <span className="text-xs font-bold text-white flex items-center justify-center gap-1">
                    <Star className="w-3 h-3" /> MAIS POPULAR
                  </span>
                </div>
                <CardContent className="p-6 pt-10">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white">Trimestral</h3>
                    <p className="text-xs text-white/50">3 meses de acesso</p>
                  </div>
                  
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">R$ 297</span>
                      <span className="text-white/50 text-sm">/3 meses</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-white/40 line-through">De R$ 697</p>
                      <Badge className="bg-primary/20 text-primary border-0 text-[10px]">
                        -57%
                      </Badge>
                    </div>
                    <p className="text-xs text-primary mt-1.5">
                      = R$ 99/mês
                    </p>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {['Tudo do mensal', 'Economia de 50%', 'Suporte prioritário', 'Bônus exclusivos'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleSelectPlan('quarterly')}
                    className="w-full bg-primary hover:bg-primary/90 gap-2"
                  >
                    <Rocket className="w-4 h-4" />
                    Escolher Trimestral
                  </Button>
                </CardContent>
              </Card>

              {/* Plano Anual */}
              <Card className="border border-cyan-500/30 bg-white/5 backdrop-blur h-full relative overflow-hidden hover:border-cyan-500/50 transition-all group">
                <div className="absolute top-3 right-3">
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px]">
                    <Crown className="w-3 h-3 mr-1" />
                    MELHOR VALOR
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white">Anual</h3>
                    <p className="text-xs text-white/50">12 meses de acesso</p>
                  </div>
                  
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">R$ 697</span>
                      <span className="text-white/50 text-sm">/ano</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-white/40 line-through">De R$ 1.497</p>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-0 text-[10px]">
                        -53%
                      </Badge>
                    </div>
                    <p className="text-xs text-cyan-400 mt-1.5">
                      = R$ 58/mês • Economia máxima
                    </p>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {['Tudo do trimestral', '12 meses de acesso', 'Economia de 70%+', 'Acesso vitalício a updates'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                        <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleSelectPlan('yearly')}
                    variant="outline"
                    className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    Escolher Anual
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h3 className="text-center text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
              O que nossos clientes dizem
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testimonials.map((t, i) => (
                <div 
                  key={i}
                  className="p-5 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-white/70 mb-4">"{t.text}"</p>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/50">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Guarantee Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-center mb-12"
          >
            <div className="inline-flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20">
              <Shield className="w-12 h-12 text-primary mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">
                Garantia de 7 Dias
              </h3>
              <p className="text-sm text-white/60 max-w-md">
                Teste a plataforma por 7 dias. Se não estiver satisfeito, devolvemos 100% do seu investimento. Sem perguntas.
              </p>
            </div>
          </motion.div>

          {/* FAQ Mini */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-2xl mx-auto space-y-4 mb-12"
          >
            <h3 className="text-center text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
              Perguntas Frequentes
            </h3>
            {[
              { q: 'Posso cancelar a qualquer momento?', a: 'Sim! Você pode cancelar sua assinatura quando quiser, sem multas ou taxas.' },
              { q: 'Preciso de conhecimento técnico?', a: 'Não! A plataforma foi feita para ser simples e intuitiva.' },
              { q: 'Como funciona o suporte?', a: 'Oferecemos suporte via chat e WhatsApp em horário comercial.' },
            ].map((faq, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold text-white text-sm mb-1">{faq.q}</h4>
                <p className="text-xs text-white/60">{faq.a}</p>
              </div>
            ))}
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="text-center"
          >
            <p className="text-white/40 text-sm mb-4">
              ⚡ Mais de 50 pessoas acessaram este link nas últimas 24 horas
            </p>
            <Button 
              onClick={() => handleSelectPlan('quarterly')}
              size="lg"
              className="bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-lg px-10 py-6 h-auto gap-2 shadow-lg shadow-primary/20"
            >
              <Zap className="w-5 h-5" />
              Garantir Minha Vaga Agora
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-xs text-white/30 mt-4">
              Oferta exclusiva • Válida apenas através deste link
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-white/10 text-center relative z-10">
        <p className="text-sm text-white/40">
          © {new Date().getFullYear()} Genesis Hub. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
