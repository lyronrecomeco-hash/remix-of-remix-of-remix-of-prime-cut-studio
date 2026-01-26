import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

export default function PromoPage() {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const [isValidCode, setIsValidCode] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    validateCode();
  }, [codigo]);

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
      <div className="min-h-screen flex items-center justify-center bg-background">
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <Gift className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Link Inválido
          </h1>
          <p className="text-muted-foreground mb-6">
            Este link promocional não existe ou expirou. Entre em contato com quem compartilhou o link com você.
          </p>
          <Button onClick={() => navigate('/')} variant="outline" className="border-border">
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
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Orbs - Genesis Style */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />
      </div>

      {/* Urgency Timer Bar */}
      <div className="bg-gradient-to-r from-primary via-primary to-cyan-500 py-3 px-4 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 text-primary-foreground">
          <Clock className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-medium">
            Oferta expira em: 
            <span className="font-mono font-bold ml-2 bg-black/20 px-2 py-0.5 rounded">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </span>
        </div>
      </div>

      {/* Header - Glassmorphism */}
      <header className="py-6 px-4 border-b border-border/50 relative z-10 backdrop-blur-sm bg-card/30">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/30">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            Genesis Hub
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-14">
            {/* Exclusive Badge - Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-primary/30 mb-8 shadow-lg shadow-primary/10"
            >
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                Link Exclusivo • Preços Especiais
              </span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 leading-tight"
            >
              Transforme Seu Negócio com
              <br />
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                Inteligência Artificial
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Você foi selecionado para ter acesso a condições{' '}
              <strong className="text-foreground">exclusivas</strong> que 
              não estão disponíveis no site oficial.
            </motion.p>

            {/* Trust Indicators - Genesis Style */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6"
            >
              {[
                { icon: Shield, label: 'Pagamento Seguro' },
                { icon: BadgeCheck, label: 'Garantia de 7 dias' },
                { icon: Users, label: '+500 usuários ativos' },
              ].map((item) => (
                <div 
                  key={item.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-border/50"
                >
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Features Grid - Glassmorphism Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-14"
          >
            {features.map((feature) => (
              <div 
                key={feature.label}
                className="p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-border/50 hover:border-primary/40 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/30 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-1">{feature.label}</h4>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Pricing Cards - Genesis Premium Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-14"
          >
            <h2 className="text-center text-2xl font-bold text-foreground mb-8">
              Escolha Seu Plano
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plano Mensal */}
              <Card className="border border-border/50 bg-white/5 backdrop-blur-md h-full relative overflow-hidden hover:border-primary/30 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-foreground">Mensal</h3>
                    <p className="text-xs text-muted-foreground">1 mês de acesso</p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">R$ 197</span>
                      <span className="text-muted-foreground text-sm">/mês</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-through">De R$ 297</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {['Acesso completo', 'Suporte via chat', 'Cancele quando quiser'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleSelectPlan('monthly')}
                    variant="outline"
                    className="w-full border-border hover:bg-white/10 hover:border-primary/50"
                  >
                    Escolher Mensal
                  </Button>
                </CardContent>
              </Card>

              {/* Plano Trimestral - Popular */}
              <Card className="border-2 border-primary bg-gradient-to-b from-primary/10 via-white/5 to-transparent backdrop-blur-md h-full relative overflow-hidden scale-[1.03] shadow-2xl shadow-primary/20">
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-cyan-500 py-2 text-center">
                  <span className="text-xs font-bold text-primary-foreground flex items-center justify-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-current" /> MAIS POPULAR
                  </span>
                </div>
                <CardContent className="p-6 pt-12">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-foreground">Trimestral</h3>
                    <p className="text-xs text-muted-foreground">3 meses de acesso</p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">R$ 297</span>
                      <span className="text-muted-foreground text-sm">/3 meses</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground line-through">De R$ 697</p>
                      <Badge className="bg-primary/20 text-primary border-0 text-[10px] font-bold">
                        -57%
                      </Badge>
                    </div>
                    <p className="text-xs text-primary mt-2 font-medium">
                      = R$ 99/mês
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {['Tudo do mensal', 'Economia de 50%', 'Suporte prioritário', 'Bônus exclusivos'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleSelectPlan('quarterly')}
                    className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 gap-2 shadow-lg shadow-primary/30"
                  >
                    <Rocket className="w-4 h-4" />
                    Escolher Trimestral
                  </Button>
                </CardContent>
              </Card>

              {/* Plano Anual */}
              <Card className="border border-cyan-500/40 bg-white/5 backdrop-blur-md h-full relative overflow-hidden hover:border-cyan-500/60 transition-all duration-300 group">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40 text-[10px] font-bold">
                    <Crown className="w-3 h-3 mr-1" />
                    MELHOR VALOR
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-foreground">Anual</h3>
                    <p className="text-xs text-muted-foreground">12 meses de acesso</p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">R$ 697</span>
                      <span className="text-muted-foreground text-sm">/ano</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground line-through">De R$ 1.497</p>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-0 text-[10px] font-bold">
                        -53%
                      </Badge>
                    </div>
                    <p className="text-xs text-cyan-400 mt-2 font-medium">
                      = R$ 58/mês • Economia máxima
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {['Tudo do trimestral', '12 meses de acesso', 'Economia de 70%+', 'Acesso vitalício a updates'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-cyan-400" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleSelectPlan('yearly')}
                    variant="outline"
                    className="w-full border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/60"
                  >
                    Escolher Anual
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Social Proof - Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-14"
          >
            <h3 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">
              O que nossos clientes dizem
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <div 
                  key={i}
                  className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">"{t.text}"</p>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Guarantee Section - Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-center mb-14"
          >
            <div className="inline-flex flex-col items-center p-8 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent backdrop-blur-md border border-primary/30 shadow-lg shadow-primary/10">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Garantia de 7 Dias
              </h3>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                Teste a plataforma por 7 dias. Se não estiver satisfeito, devolvemos 100% do seu investimento. Sem perguntas.
              </p>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <p className="text-muted-foreground text-sm mb-5">
              <Zap className="w-4 h-4 inline-block mr-1 text-primary" />
              Mais de 50 pessoas acessaram este link nas últimas 24 horas
            </p>
            <Button 
              onClick={() => handleSelectPlan('quarterly')}
              size="lg"
              className="bg-gradient-to-r from-primary via-cyan-500 to-primary hover:opacity-90 text-lg px-12 py-7 h-auto gap-3 shadow-xl shadow-primary/30 font-semibold"
            >
              <Zap className="w-5 h-5" />
              Garantir Minha Vaga Agora
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-xs text-muted-foreground/60 mt-5">
              Oferta exclusiva • Válida apenas através deste link
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer - Genesis Style */}
      <footer className="py-8 px-4 border-t border-border/50 text-center relative z-10 backdrop-blur-sm bg-card/20">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Genesis Hub. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
