import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Crown, Sparkles, Check, ArrowRight, Gift } from 'lucide-react';
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

  const handleSelectPlan = (planType: 'monthly' | 'yearly') => {
    // Redirecionar para checkout com parâmetros do plano promocional
    const params = new URLSearchParams({
      ref: codigo || '',
      plan: planType,
      promo: 'true'
    });
    navigate(`/genesis-ia?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-4">
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
          <Button onClick={() => navigate('/')} variant="outline">
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, hsl(220 25% 10%) 0%, hsl(230 30% 12%) 50%, hsl(220 25% 10%) 100%)',
      }}
    >
      {/* Header */}
      <header className="py-6 px-4 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Genesis Hub</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Acesso Exclusivo</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Planos Promocionais
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mb-10 max-w-xl mx-auto"
          >
            Você recebeu acesso a condições especiais não disponíveis no site oficial. Aproveite enquanto está disponível.
          </motion.p>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plano Mensal */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border border-white/10 bg-card/50 backdrop-blur h-full relative overflow-hidden hover:border-orange-500/30 transition-colors">
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Promocional
                  </Badge>
                </div>
                <CardContent className="p-6 pt-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-orange-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-foreground">Plano Mensal</h3>
                      <p className="text-sm text-muted-foreground">Acesso completo</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">R$ 197</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <p className="text-sm text-green-400 mt-2">
                      Economia em relação ao site comercial
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8 text-left">
                    {['Acesso a todos os recursos', 'Suporte prioritário', 'Atualizações incluídas', 'Cancele quando quiser'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
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
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Plano Anual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border border-primary/30 bg-card/50 backdrop-blur h-full relative overflow-hidden hover:border-primary/50 transition-colors">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    <Crown className="w-3 h-3 mr-1" />
                    Melhor Escolha
                  </Badge>
                </div>
                <CardContent className="p-6 pt-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Crown className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-foreground">Plano Anual</h3>
                      <p className="text-sm text-muted-foreground">12 meses de acesso</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">R$ 697</span>
                      <span className="text-muted-foreground">/ano</span>
                    </div>
                    <p className="text-sm text-green-400 mt-2">
                      Equivale a R$ 58/mês • Economia máxima
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8 text-left">
                    {['Tudo do plano mensal', '12 meses de acesso', 'Economia de mais de 70%', 'Prioridade em novidades'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleSelectPlan('yearly')}
                    className="w-full"
                  >
                    Escolher Anual
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-muted-foreground/60 mt-8"
          >
            Oferta exclusiva por tempo limitado. Válida apenas através deste link.
          </motion.p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-white/10 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Genesis Hub. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
