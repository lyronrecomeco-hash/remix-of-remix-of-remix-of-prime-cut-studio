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
  Star,
  Rocket,
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  ArrowRight,
  BadgeCheck
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

  useEffect(() => {
    validateCode();
  }, [codigo]);

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

  const features = [
    { icon: Target, title: 'Prospecção Inteligente', desc: 'IA busca clientes ideais automaticamente' },
    { icon: MessageSquare, title: 'Propostas Automáticas', desc: 'Gere propostas personalizadas em segundos' },
    { icon: TrendingUp, title: 'Escale Sem Limites', desc: 'De 5 para 50 clientes/mês com a mesma equipe' },
    { icon: Users, title: 'CRM Completo', desc: 'Gerencie todos seus leads em um só lugar' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="py-8 px-4 border-b border-border/50 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
          <img 
            src="/genesis-logo.png" 
            alt="Genesis Hub" 
            className="w-12 h-12 object-contain"
          />
          <span className="text-2xl font-bold text-foreground">
            Genesis Hub
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 mb-8"
            >
              <Gift className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Você foi convidado para uma oferta especial!</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Multiplique Seus Resultados
              <br />
              com a{' '}
              <span className="text-primary">
                Genesis Hub
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              A plataforma de <strong className="text-foreground">Inteligência Artificial</strong> que já ajudou{' '}
              <span className="text-primary font-bold">+500 profissionais</span> a automatizar prospecção, 
              gerar propostas irresistíveis e <strong className="text-foreground">escalar suas vendas em até 300%</strong>.
            </motion.p>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-12"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-sm">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">Garantia de 7 dias</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-sm">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">Acesso imediato</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-sm">
                <BadgeCheck className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">Suporte dedicado</span>
              </div>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Pricing Section */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Escolha o Plano Ideal Para Você
              </h2>
              <p className="text-muted-foreground">
                Preços exclusivos válidos apenas para este link promocional
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Plano Mensal */}
              <Card className="border border-border bg-card hover:border-primary/30 transition-all group">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-foreground">Mensal</h3>
                    <p className="text-sm text-muted-foreground">Ideal para começar</p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-muted-foreground line-through">R$ 297</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">R$ 197</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <Badge className="mt-2 bg-primary/10 text-primary border-primary/20">
                      Economia de R$ 100
                    </Badge>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {['Acesso completo à plataforma', 'Prospecção com IA ilimitada', 'Suporte via chat', 'Cancele quando quiser'].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleSelectPlan('monthly')}
                    variant="outline"
                    className="w-full h-12 text-base group-hover:border-primary group-hover:text-primary transition-colors"
                  >
                    Começar Agora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Plano Trimestral - Destaque */}
              <Card className="border-2 border-primary bg-card relative md:scale-105 shadow-xl shadow-primary/10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1.5 text-sm font-bold shadow-lg">
                    <Star className="w-4 h-4 mr-1" /> MAIS POPULAR
                  </Badge>
                </div>
                <CardContent className="p-6 md:p-8 pt-10">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-foreground">Trimestral</h3>
                    <p className="text-sm text-muted-foreground">O mais escolhido</p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-muted-foreground line-through">R$ 591</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">R$ 297</span>
                      <span className="text-muted-foreground">/3 meses</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-primary text-primary-foreground">-50% OFF</Badge>
                      <span className="text-sm text-primary font-semibold">= R$ 99/mês</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      'Tudo do plano mensal',
                      'Economia de 50%',
                      'Suporte prioritário',
                      'Templates exclusivos',
                      'Treinamento em grupo'
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleSelectPlan('quarterly')}
                    className="w-full h-12 text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Escolher Trimestral
                  </Button>
                </CardContent>
              </Card>

              {/* Plano Anual */}
              <Card className="border border-border bg-card relative group hover:border-primary/30 transition-all">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Crown className="w-3 h-3 mr-1" />
                    MELHOR VALOR
                  </Badge>
                </div>
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-foreground">Anual</h3>
                    <p className="text-sm text-muted-foreground">Máxima economia</p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-muted-foreground line-through">R$ 2.364</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">R$ 697</span>
                      <span className="text-muted-foreground">/ano</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20">-70% OFF</Badge>
                      <span className="text-sm text-primary font-semibold">= R$ 58/mês</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      'Tudo do plano trimestral',
                      '12 meses de acesso',
                      'Economia de 70%',
                      'Atualizações vitalícias',
                      'Mentoria exclusiva'
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleSelectPlan('yearly')}
                    variant="outline"
                    className="w-full h-12 text-base group-hover:border-primary group-hover:text-primary transition-colors"
                  >
                    Escolher Anual
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-center"
          >
            <div className="inline-flex flex-col md:flex-row items-center gap-4 md:gap-6 p-6 md:p-8 rounded-2xl bg-card border border-primary/20">
              <Shield className="w-12 h-12 text-primary" />
              <div className="text-center md:text-left">
                <p className="text-lg font-bold text-foreground mb-1">Garantia Incondicional de 7 Dias</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu investimento. 
                  Sem burocracia, sem perguntas.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Genesis Hub</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2025 Genesis Hub. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
