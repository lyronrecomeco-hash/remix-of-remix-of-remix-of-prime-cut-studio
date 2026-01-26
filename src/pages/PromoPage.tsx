import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Crown, 
  Sparkles, 
  Check, 
  Gift, 
  Shield, 
  Zap, 
  Clock,
  Star,
  Rocket
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
            Este link promocional não existe ou expirou.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Urgency Timer */}
      <div className="bg-gradient-to-r from-primary to-cyan-500 py-3 px-4 relative z-10">
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

      {/* Header */}
      <header className="py-6 px-4 border-b border-border relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            Genesis Hub
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero - Título e Descrição Persuasiva */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-primary/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Oferta Exclusiva</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight"
            >
              Multiplique Seus Resultados com{' '}
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                Inteligência Artificial
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Automatize prospecção, gere propostas personalizadas e escale seu negócio 
              com a plataforma que já ajudou <strong className="text-foreground">+500 profissionais</strong> a 
              conquistar mais clientes. Você recebeu um convite especial com 
              <strong className="text-primary"> preços exclusivos</strong>.
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-8"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-border text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                Garantia de 7 dias
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-border text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-primary" />
                Acesso imediato
              </div>
            </motion.div>
          </div>

          {/* Planos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12"
          >
            {/* Plano Mensal */}
            <Card className="border border-border bg-white/5 backdrop-blur-sm hover:border-primary/30 transition-all">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Mensal</h3>
                  <p className="text-xs text-muted-foreground">1 mês de acesso</p>
                </div>
                
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">R$ 197</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-through">De R$ 297</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {['Acesso completo', 'Suporte via chat', 'Cancele quando quiser'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleSelectPlan('monthly')}
                  variant="outline"
                  className="w-full"
                >
                  Escolher Mensal
                </Button>
              </CardContent>
            </Card>

            {/* Plano Trimestral - Destaque */}
            <Card className="border-2 border-primary bg-gradient-to-b from-primary/10 to-transparent backdrop-blur-sm relative scale-[1.02] shadow-xl shadow-primary/10">
              <div className="absolute top-0 left-0 right-0 bg-primary py-1.5 text-center rounded-t-lg">
                <span className="text-xs font-bold text-primary-foreground flex items-center justify-center gap-1">
                  <Star className="w-3 h-3" /> MAIS POPULAR
                </span>
              </div>
              <CardContent className="p-6 pt-10">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Trimestral</h3>
                  <p className="text-xs text-muted-foreground">3 meses de acesso</p>
                </div>
                
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">R$ 297</span>
                    <span className="text-muted-foreground text-sm">/3 meses</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground line-through">De R$ 591</p>
                    <Badge className="bg-primary/20 text-primary border-0 text-[10px]">-50%</Badge>
                  </div>
                  <p className="text-xs text-primary mt-1.5 font-medium">= R$ 99/mês</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {['Tudo do mensal', 'Economia de 50%', 'Suporte prioritário', 'Bônus exclusivos'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
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
            <Card className="border border-cyan-500/30 bg-white/5 backdrop-blur-sm hover:border-cyan-500/50 transition-all relative">
              <div className="absolute top-3 right-3">
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px]">
                  <Crown className="w-3 h-3 mr-1" />
                  MELHOR VALOR
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Anual</h3>
                  <p className="text-xs text-muted-foreground">12 meses de acesso</p>
                </div>
                
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">R$ 697</span>
                    <span className="text-muted-foreground text-sm">/ano</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground line-through">De R$ 2.364</p>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-0 text-[10px]">-70%</Badge>
                  </div>
                  <p className="text-xs text-cyan-400 mt-1.5 font-medium">= R$ 58/mês</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {['Tudo do trimestral', '12 meses de acesso', 'Economia máxima', 'Updates vitalícios'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
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
          </motion.div>

          {/* Garantia */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-primary/20">
              <Shield className="w-6 h-6 text-primary" />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Garantia de 7 Dias</p>
                <p className="text-xs text-muted-foreground">100% do seu dinheiro de volta, sem perguntas</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border text-center relative z-10">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Genesis Hub. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
