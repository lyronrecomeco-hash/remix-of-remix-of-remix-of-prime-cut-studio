import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, ArrowRight, X, Star, Shield, Clock, Gift, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    description: 'Perfeito para testar o poder da automação',
    priceMonthly: 0,
    priceYearly: 0,
    icon: Zap,
    color: 'from-slate-500 to-zinc-600',
    features: [
      { text: '1 instância WhatsApp', included: true },
      { text: '500 mensagens/mês', included: true },
      { text: 'Flow Builder básico', included: true },
      { text: 'Suporte por email', included: true },
      { text: 'Luna IA', included: false },
      { text: 'Integrações premium', included: false },
      { text: 'Analytics avançado', included: false },
    ],
    cta: 'Começar Grátis',
    ctaVariant: 'outline' as const,
  },
  {
    name: 'Premium',
    description: 'Para negócios que querem escalar vendas',
    priceMonthly: 197,
    priceYearly: 1970,
    savings: '17%',
    icon: Sparkles,
    color: 'from-primary to-blue-600',
    popular: true,
    features: [
      { text: '5 instâncias WhatsApp', included: true },
      { text: 'Mensagens ilimitadas', included: true },
      { text: 'Flow Builder completo', included: true },
      { text: 'Luna IA conversacional', included: true, highlight: true },
      { text: 'Analytics avançado', included: true },
      { text: 'Integrações premium', included: true },
      { text: 'Suporte prioritário 24h', included: true },
    ],
    cta: 'Começar 7 Dias Grátis',
    ctaVariant: 'default' as const,
    guarantee: true,
  },
  {
    name: 'Lifetime',
    description: 'Investimento único, acesso vitalício',
    priceMonthly: 997,
    priceYearly: 997,
    isLifetime: true,
    icon: Crown,
    color: 'from-amber-500 to-orange-600',
    features: [
      { text: 'Tudo do Premium', included: true },
      { text: 'Instâncias ilimitadas', included: true, highlight: true },
      { text: 'Atualizações vitalícias', included: true },
      { text: 'Onboarding VIP 1:1', included: true },
      { text: 'Suporte WhatsApp direto', included: true },
      { text: 'Acesso beta exclusivo', included: true },
      { text: 'Comunidade founders', included: true },
    ],
    cta: 'Garantir Acesso Vitalício',
    ctaVariant: 'outline' as const,
    limitedSpots: 23,
  },
];

const VendaPricing = () => {
  const [isYearly, setIsYearly] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-20 left-20 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Crown className="w-4 h-4" />
            Planos & Preços
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Escolha o plano
            <br />
            <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
              ideal para você
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Comece grátis e escale conforme cresce. 
            <span className="text-primary font-semibold"> Sem surpresas, sem taxas ocultas.</span>
          </p>
          
          {/* Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-4 p-2 rounded-full bg-card/80 border border-border/50"
          >
            <span className={`px-3 py-1.5 rounded-full transition-all ${!isYearly ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground'}`}>
              Mensal
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`px-3 py-1.5 rounded-full transition-all ${isYearly ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground'}`}>
              Anual
              <Badge className="ml-2 bg-green-500/20 text-green-500 border-green-500/30 text-[10px]">
                -17%
              </Badge>
            </span>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                >
                  <span className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary/30 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    MAIS POPULAR
                  </span>
                </motion.div>
              )}
              
              {/* Limited Spots */}
              {plan.limitedSpots && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                >
                  <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    Apenas {plan.limitedSpots} vagas
                  </span>
                </motion.div>
              )}
              
              <Card className={`p-6 md:p-8 h-full flex flex-col relative overflow-hidden transition-all ${
                plan.popular 
                  ? 'border-primary/50 bg-gradient-to-b from-primary/10 to-transparent shadow-2xl shadow-primary/20' 
                  : 'bg-card/50 border-border/50 hover:border-primary/30'
              }`}>
                {/* Background Glow */}
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                )}
                
                <div className="relative">
                  {/* Header */}
                  <div className="mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <plan.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.isLifetime ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold">R$ {plan.priceMonthly}</span>
                        <span className="text-muted-foreground">único</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold">
                            R$ {isYearly ? Math.round(plan.priceYearly / 12) : plan.priceMonthly}
                          </span>
                          <span className="text-muted-foreground">/mês</span>
                        </div>
                        {isYearly && plan.priceMonthly > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Cobrado R$ {plan.priceYearly}/ano
                            <span className="text-green-500 ml-2 font-semibold">
                              Economia de R$ {(plan.priceMonthly * 12) - plan.priceYearly}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            feature.highlight ? 'bg-green-500' : 'bg-primary/20'
                          }`}>
                            <Check className={`w-3 h-3 ${feature.highlight ? 'text-white' : 'text-primary'}`} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <span className={`text-sm ${feature.included ? '' : 'text-muted-foreground line-through'}`}>
                          {feature.text}
                          {feature.highlight && (
                            <Badge className="ml-2 text-[9px] bg-green-500/20 text-green-500 border-green-500/30">
                              NOVO
                            </Badge>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button 
                    asChild
                    variant={plan.ctaVariant}
                    size="lg"
                    className={`w-full group ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/30' 
                        : ''
                    }`}
                  >
                    <Link to="/genesis" className="flex items-center justify-center gap-2">
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  
                  {/* Guarantee Badge */}
                  {plan.guarantee && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Garantia de 7 dias ou seu dinheiro de volta</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {[
              { icon: Shield, text: 'Garantia 7 dias' },
              { icon: Clock, text: 'Cancele quando quiser' },
              { icon: TrendingUp, text: '+2.800 clientes satisfeitos' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
          
          {/* Payment Methods */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Aceito: Cartão de crédito, PIX e boleto • Pagamento 100% seguro
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaPricing;
