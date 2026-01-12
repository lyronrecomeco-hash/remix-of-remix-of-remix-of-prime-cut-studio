import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, X, Zap, Star, Crown, ArrowRight, Shield, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';

const plans = [
  {
    name: 'Free',
    description: 'Para começar',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    cta: 'Começar Grátis',
    features: [
      { text: '1 instância WhatsApp', included: true },
      { text: '500 mensagens/mês', included: true },
      { text: 'Flow Builder básico', included: true },
      { text: 'Luna IA', included: false },
      { text: 'Analytics', included: false },
      { text: 'Integrações', included: false },
    ],
  },
  {
    name: 'Premium',
    description: 'Para escalar',
    monthlyPrice: 197,
    yearlyPrice: 164,
    icon: Star,
    popular: true,
    cta: 'Testar 7 dias grátis',
    features: [
      { text: '5 instâncias WhatsApp', included: true },
      { text: 'Mensagens ilimitadas', included: true },
      { text: 'Flow Builder completo', included: true },
      { text: 'Luna IA avançada', included: true },
      { text: 'Analytics tempo real', included: true },
      { text: 'Todas integrações', included: true },
    ],
  },
  {
    name: 'Lifetime',
    description: 'Pagamento único',
    monthlyPrice: 997,
    yearlyPrice: 997,
    isLifetime: true,
    icon: Crown,
    badge: '23 vagas',
    cta: 'Garantir Vaga',
    features: [
      { text: 'Instâncias ilimitadas', included: true },
      { text: 'Todos os recursos', included: true },
      { text: 'Luna IA sem limites', included: true },
      { text: 'Updates vitalícios', included: true },
      { text: 'Onboarding VIP', included: true },
      { text: 'Suporte prioritário', included: true },
    ],
  },
];

const SitePricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="precos" ref={ref} className="py-20 bg-white relative overflow-hidden">
      <div className="container px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
            <Zap className="w-4 h-4" />
            Preços transparentes
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Escolha seu <span className="text-emerald-600">plano</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-6">
            Comece grátis, escale conforme cresce.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>Mensal</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Anual <span className="text-emerald-600 font-bold">(17% OFF)</span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const isPopular = plan.popular;
            const price = plan.isLifetime ? plan.monthlyPrice : (isYearly ? plan.yearlyPrice : plan.monthlyPrice);
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className={`relative rounded-2xl p-6 transition-all ${
                  isPopular
                    ? 'bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-500 shadow-xl shadow-emerald-500/15 scale-[1.02] z-10'
                    : 'bg-white border border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Badges */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Mais Popular
                    </div>
                  </div>
                )}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  isPopular 
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30' 
                    : plan.isLifetime 
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  <plan.icon className="w-6 h-6" />
                </div>

                {/* Plan Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                {/* Price */}
                <div className="mb-5">
                  {plan.isLifetime ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">R$ {price}</span>
                        <span className="text-gray-500 text-sm">único</span>
                      </div>
                      <p className="text-xs text-purple-600 font-medium">Acesso vitalício</p>
                    </>
                  ) : price === 0 ? (
                    <span className="text-3xl font-bold text-gray-900">Grátis</span>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">R$ {price}</span>
                        <span className="text-gray-500 text-sm">/mês</span>
                      </div>
                      {isYearly && (
                        <p className="text-xs text-emerald-600 font-medium">
                          Economia de R$ {(plan.monthlyPrice - plan.yearlyPrice) * 12}/ano
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* CTA */}
                <Button 
                  asChild 
                  className={`w-full mb-5 py-5 rounded-xl ${
                    isPopular
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25'
                      : plan.isLifetime
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  <Link to="/genesis" className="flex items-center justify-center gap-2 text-sm">
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Elements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center gap-6"
        >
          {[
            { icon: Shield, text: 'Garantia 7 dias' },
            { icon: Clock, text: 'Cancele quando quiser' },
            { icon: Users, text: 'Suporte brasileiro' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-600 text-sm">
              <item.icon className="w-4 h-4 text-emerald-500" />
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SitePricing;
