import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    description: 'Para começar a automatizar',
    priceMonthly: 0,
    priceYearly: 0,
    icon: Zap,
    features: [
      '1 instância WhatsApp',
      '500 mensagens/mês',
      'Flow Builder básico',
      'Suporte por email',
    ],
    cta: 'Começar Grátis',
    variant: 'outline' as const,
  },
  {
    name: 'Premium',
    description: 'Para negócios em crescimento',
    priceMonthly: 197,
    priceYearly: 1970,
    icon: Sparkles,
    popular: true,
    features: [
      '5 instâncias WhatsApp',
      'Mensagens ilimitadas',
      'Flow Builder avançado',
      'IA conversacional Luna',
      'Analytics completo',
      'Integrações premium',
      'Suporte prioritário',
    ],
    cta: 'Assinar Premium',
    variant: 'default' as const,
  },
  {
    name: 'Lifetime',
    description: 'Acesso vitalício',
    priceMonthly: 997,
    priceYearly: 997,
    isLifetime: true,
    icon: Crown,
    features: [
      'Tudo do Premium',
      'Instâncias ilimitadas',
      'Atualizações vitalícias',
      'Onboarding VIP',
      'Suporte WhatsApp direto',
      'Acesso antecipado a novidades',
    ],
    cta: 'Garantir Lifetime',
    variant: 'outline' as const,
  },
];

const VendaPricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Crown className="w-4 h-4" />
            Planos
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Escolha o plano
            <br />
            <span className="text-primary">ideal para você</span>
          </h2>
          
          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={isYearly ? 'text-muted-foreground' : 'font-semibold'}>Mensal</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={isYearly ? 'font-semibold' : 'text-muted-foreground'}>
              Anual
              <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                -17%
              </span>
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                    Mais Popular
                  </span>
                </div>
              )}
              
              <Card className={`p-6 h-full flex flex-col ${
                plan.popular 
                  ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' 
                  : 'bg-card/50 border-border/50'
              }`}>
                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-xl ${
                    plan.popular ? 'bg-primary' : 'bg-primary/10'
                  } flex items-center justify-center mb-4`}>
                    <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-primary-foreground' : 'text-primary'}`} />
                  </div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.isLifetime ? (
                    <div>
                      <span className="text-4xl font-bold">R$ {plan.priceMonthly}</span>
                      <span className="text-muted-foreground ml-2">único</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold">
                        R$ {isYearly ? Math.round(plan.priceYearly / 12) : plan.priceMonthly}
                      </span>
                      <span className="text-muted-foreground">/mês</span>
                      {isYearly && plan.priceMonthly > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          R$ {plan.priceYearly}/ano
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  asChild
                  variant={plan.variant}
                  className={`w-full group ${plan.popular ? 'shadow-lg shadow-primary/25' : ''}`}
                >
                  <Link to="/genesis" className="flex items-center justify-center gap-2">
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground">
            ✓ Garantia de 7 dias &nbsp; ✓ Cancele quando quiser &nbsp; ✓ Suporte incluso
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default VendaPricing;
