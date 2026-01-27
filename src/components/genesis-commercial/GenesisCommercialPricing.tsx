import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Crown, ArrowRight, Shield, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Plan {
  id: string;
  name: string;
  displayName: string;
  tagline: string | null;
  priceCents: number;
  originalPriceCents: number | null;
  period: string;
  discountPercentage: number | null;
  isPopular: boolean;
  features: string[];
}

const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      const { data } = await supabase
        .from('checkout_plans')
        .select('*')
        .eq('is_active', true)
        .order('duration_months', { ascending: true });

      if (data) {
        setPlans(data.map(p => ({
          id: p.id,
          name: p.name,
          displayName: p.display_name,
          tagline: p.tagline,
          priceCents: p.price_cents,
          originalPriceCents: p.discount_percentage ? Math.round(p.price_cents / (1 - p.discount_percentage / 100)) : null,
          period: p.duration_months === 1 ? '/mês' : p.duration_months === 3 ? '/3 meses' : '/ano',
          discountPercentage: p.discount_percentage,
          isPopular: p.is_popular,
          features: Array.isArray(p.features) ? p.features as string[] : [],
        })));
      }
      setIsLoading(false);
    }
    loadPlans();
  }, []);

  return { plans, isLoading };
};

const GenesisCommercialPricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();
  const { plans, isLoading } = usePlans();

  const handleSelectPlan = (plan: Plan) => {
    const params = new URLSearchParams({
      amount: plan.priceCents.toString(),
      plan: plan.name,
      description: plan.displayName,
    });
    navigate(`/checkout?${params.toString()}`);
  };

  const formatPrice = (cents: number) => (cents / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return (
    <section id="planos" ref={ref} className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.05),transparent_60%)]" />

      <div className="container px-4 relative z-10 max-w-6xl mx-auto">
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

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && (
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative ${plan.isPopular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {plan.isPopular && (
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

              <div className={`relative h-full p-6 rounded-2xl overflow-hidden transition-all duration-300 ${
                plan.isPopular 
                  ? 'bg-gradient-to-b from-primary/10 to-card border-2 border-primary/40 shadow-xl shadow-primary/10' 
                  : 'bg-card border border-border hover:border-primary/20'
              }`}>
                <div className="relative">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-foreground">{plan.displayName}</h3>
                    <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  </div>

                  <div className="mb-6">
                    {plan.originalPriceCents && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground line-through">
                          de R${formatPrice(plan.originalPriceCents)}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">por</span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black ${plan.isPopular ? 'text-primary' : 'text-foreground'}`}>
                        R${formatPrice(plan.priceCents)}
                      </span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.isPopular ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          <Check className={`w-3 h-3 ${plan.isPopular ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.discountPercentage && plan.discountPercentage > 0 && (
                    <div className="mb-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                        plan.isPopular ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Check className="w-3 h-3" />
                        {plan.discountPercentage}% de desconto
                      </span>
                    </div>
                  )}

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => handleSelectPlan(plan)}
                      size="lg"
                      variant={plan.isPopular ? "default" : "outline"}
                      className={`w-full py-5 text-sm font-semibold ${
                        plan.isPopular 
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20' 
                          : 'border-border hover:bg-muted/50 text-foreground'
                      }`}
                    >
                      Assinar {plan.displayName}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}

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
