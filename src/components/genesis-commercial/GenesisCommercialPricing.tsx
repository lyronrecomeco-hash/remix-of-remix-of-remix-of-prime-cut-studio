import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Sparkles, Crown, ArrowRight, Shield, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Premium',
    tagline: 'Para negócios que querem escalar',
    price: '197',
    originalPrice: '297',
    period: '/mês',
    discount: '34% OFF',
    icon: Sparkles,
    popular: true,
    features: [
      { text: '5 instâncias WhatsApp', included: true },
      { text: 'Mensagens ilimitadas', included: true },
      { text: 'Luna IA conversacional', included: true, highlight: true },
      { text: 'Flow Builder completo', included: true },
      { text: 'Analytics avançado', included: true },
      { text: 'Integrações premium', included: true },
      { text: 'Suporte prioritário 24h', included: true },
      { text: 'Treinamento incluso', included: true },
    ],
    cta: 'Assinar Premium',
    guarantee: true,
  },
  {
    name: 'Lifetime',
    tagline: 'Investimento único, acesso vitalício',
    price: '997',
    originalPrice: '2.997',
    period: 'único',
    discount: '67% OFF',
    icon: Crown,
    popular: false,
    limitedSpots: 17,
    features: [
      { text: 'Tudo do Premium incluso', included: true, highlight: true },
      { text: 'Instâncias ilimitadas', included: true, highlight: true },
      { text: 'Atualizações vitalícias', included: true },
      { text: 'Onboarding VIP 1:1', included: true },
      { text: 'Suporte WhatsApp direto', included: true },
      { text: 'Acesso beta exclusivo', included: true },
      { text: 'Comunidade founders', included: true },
      { text: 'Consultoria mensal', included: true, highlight: true },
    ],
    cta: 'Assinar Lifetime',
    guarantee: true,
  },
];

const GenesisCommercialPricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="planos" ref={ref} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(217_91%_60%/0.08),transparent_60%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container px-4 relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Crown className="w-4 h-4" />
            Planos Premium
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-foreground">
            Escolha o plano{' '}
            <span className="text-gold-shine">ideal para você</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Planos flexíveis para todas as necessidades.
            <span className="text-primary font-semibold"> Sem surpresas, sem taxas ocultas.</span>
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
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
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-5 py-2 rounded-full shadow-lg shadow-primary/30 flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    MAIS POPULAR
                  </span>
                </motion.div>
              )}

              {/* Limited Spots Badge */}
              {plan.limitedSpots && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                >
                  <span className="bg-amber-500 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-2">
                    <Crown className="w-3.5 h-3.5" />
                    Apenas {plan.limitedSpots} vagas
                  </span>
                </motion.div>
              )}

              {/* Card */}
              <div className={`relative h-full p-8 rounded-2xl overflow-hidden transition-all duration-300 ${
                plan.popular 
                  ? 'bg-card border-2 border-primary/50 shadow-xl shadow-primary/10' 
                  : 'bg-card border border-border hover:border-primary/30'
              }`}>
                {/* Background Glow for Popular */}
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                )}

                <div className="relative">
                  {/* Header */}
                  <div className="mb-8">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${
                      plan.popular ? 'bg-primary' : 'bg-amber-500'
                    }`}>
                      <plan.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-base text-muted-foreground line-through">R$ {plan.originalPrice}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        plan.popular ? 'bg-primary text-primary-foreground' : 'bg-amber-500 text-white'
                      }`}>
                        {plan.discount}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-foreground">R$ {plan.price}</span>
                      <span className="text-muted-foreground font-medium">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          feature.highlight 
                            ? (plan.popular ? 'bg-primary' : 'bg-amber-500')
                            : 'bg-primary/10'
                        }`}>
                          <Check className={`w-3 h-3 ${feature.highlight ? 'text-white' : 'text-primary'}`} />
                        </div>
                        <span className={`text-sm ${feature.highlight ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      asChild
                      size="lg"
                      className={`w-full py-6 text-base font-bold group ${
                        plan.popular 
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25' 
                          : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25'
                      }`}
                    >
                      <Link to="/genesis" className="flex items-center justify-center gap-2">
                        {plan.cta}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </motion.div>

                  {/* Guarantee */}
                  {plan.guarantee && (
                    <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span>Garantia de 7 dias ou seu dinheiro de volta</span>
                    </div>
                  )}
                </div>
              </div>
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
              { icon: Star, text: '+3.500 clientes satisfeitos' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          
          <p className="text-center text-xs text-muted-foreground/70 mt-6">
            Aceito: Cartão de crédito, PIX e boleto • Pagamento 100% seguro
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisCommercialPricing;
