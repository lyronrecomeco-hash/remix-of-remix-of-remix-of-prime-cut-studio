import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Crown, ArrowRight, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Plano Mensal',
    tagline: 'Ideal para começar',
    price: '197',
    originalPrice: null,
    period: '/mês',
    discount: null,
    popular: false,
    features: [
      { text: 'Gerador de SaaS Premium Ilimitado', included: true },
      { text: 'Gerador de página de vendas', included: true },
      { text: 'Prospecte clientes ilimitado', included: true },
      { text: 'Suporte exclusivo (WhatsApp)', included: true },
    ],
    cta: 'Assinar Mensal',
  },
  {
    name: 'Plano Trimestral',
    tagline: 'Economize 50%',
    price: '297',
    originalPrice: '597',
    period: '/3 meses',
    discount: '50% de desconto',
    popular: true,
    features: [
      { text: 'Tudo do plano mensal', included: true },
      { text: 'Calls semanais ao vivo', included: true },
      { text: 'Serviços de Freelancer', included: true },
    ],
    cta: 'Assinar Trimestral',
  },
  {
    name: 'Plano Anual',
    tagline: 'Maior economia!',
    price: '997',
    originalPrice: '2.364',
    period: '/ano',
    discount: '58% de desconto',
    popular: false,
    features: [
      { text: 'Tudo do plano trimestral', included: true },
      { text: 'Acesso prioritário a novidades', included: true },
      { text: 'Área de membros exclusiva', included: true },
    ],
    cta: 'Assinar Anual',
  },
];

const GenesisCommercialPricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="planos" ref={ref} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.05),transparent_60%)]" />

      <div className="container px-4 relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-foreground italic">
            Escolha o plano ideal para você
          </h2>
          <p className="text-muted-foreground">
            Planos flexíveis para todas as necessidades
          </p>
        </motion.div>

        {/* Pricing Cards - 3 columns */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
                >
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary/30">
                    MAIS POPULAR
                  </span>
                </motion.div>
              )}

              {/* Card */}
              <div className={`relative h-full p-6 rounded-2xl overflow-hidden transition-all duration-300 ${
                plan.popular 
                  ? 'bg-gradient-to-b from-primary/10 to-card border-2 border-primary/40 shadow-xl shadow-primary/10' 
                  : 'bg-card border border-border hover:border-primary/20'
              }`}>
                <div className="relative">
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.originalPrice && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground line-through">
                          de R${plan.originalPrice}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">por</span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black ${plan.popular ? 'text-primary' : 'text-foreground'}`}>
                        R${plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.popular ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          <Check className={`w-3 h-3 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Discount Badge */}
                  {plan.discount && (
                    <div className="mb-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                        plan.popular 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Check className="w-3 h-3" />
                        {plan.discount}
                      </span>
                    </div>
                  )}

                  {/* CTA */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      asChild
                      size="lg"
                      variant={plan.popular ? "default" : "outline"}
                      className={`w-full py-5 text-sm font-semibold ${
                        plan.popular 
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20' 
                          : 'border-border hover:bg-muted/50 text-foreground'
                      }`}
                    >
                      <Link to="/genesis" className="flex items-center justify-center gap-2">
                        {plan.cta}
                      </Link>
                    </Button>
                  </motion.div>
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
          className="mt-12"
        >
          <div className="flex flex-wrap justify-center gap-6 items-center">
            {[
              { icon: Shield, text: 'Garantia 7 dias' },
              { icon: Star, text: '+3.500 clientes satisfeitos' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisCommercialPricing;
