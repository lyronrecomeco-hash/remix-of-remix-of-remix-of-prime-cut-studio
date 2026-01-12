import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, X, Zap, Star, Crown, ArrowRight, Shield, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';

const plans = [
  {
    name: 'Free',
    description: 'Para começar a automatizar',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    color: 'gray',
    cta: 'Começar Grátis',
    features: [
      { text: '1 instância WhatsApp', included: true },
      { text: '500 mensagens/mês', included: true },
      { text: 'Flow Builder básico', included: true },
      { text: 'Luna IA', included: false },
      { text: 'Analytics avançado', included: false },
      { text: 'Integrações', included: false },
      { text: 'Suporte prioritário', included: false },
    ],
  },
  {
    name: 'Premium',
    description: 'Para escalar seu negócio',
    monthlyPrice: 197,
    yearlyPrice: 164,
    icon: Star,
    color: 'green',
    popular: true,
    cta: 'Começar Trial Grátis',
    features: [
      { text: '5 instâncias WhatsApp', included: true },
      { text: 'Mensagens ilimitadas', included: true },
      { text: 'Flow Builder completo', included: true },
      { text: 'Luna IA avançada', included: true },
      { text: 'Analytics em tempo real', included: true },
      { text: 'Todas integrações', included: true },
      { text: 'Suporte 24h', included: true },
    ],
  },
  {
    name: 'Lifetime',
    description: 'Pagamento único, acesso vitalício',
    monthlyPrice: 997,
    yearlyPrice: 997,
    isLifetime: true,
    icon: Crown,
    color: 'purple',
    badge: '23 vagas',
    cta: 'Garantir Minha Vaga',
    features: [
      { text: 'Instâncias ilimitadas', included: true },
      { text: 'Mensagens ilimitadas', included: true },
      { text: 'Todos os recursos', included: true },
      { text: 'Luna IA sem limites', included: true },
      { text: 'Atualizações vitalícias', included: true },
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
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      <div className="container px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-green-50 border border-green-200 text-green-700">
            <Zap className="w-4 h-4" />
            Preços simples e transparentes
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Escolha o plano ideal{' '}
            <span className="text-green-600">para você</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Comece grátis, escale conforme cresce.
            <strong className="text-gray-900"> Sem surpresas.</strong>
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>Mensal</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Anual <span className="text-green-600 font-bold">(17% OFF)</span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const isPopular = plan.popular;
            const price = plan.isLifetime ? plan.monthlyPrice : (isYearly ? plan.yearlyPrice : plan.monthlyPrice);
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className={`relative rounded-3xl p-8 transition-all ${
                  isPopular
                    ? 'bg-gradient-to-b from-green-50 to-white border-2 border-green-500 shadow-xl shadow-green-500/20 scale-105 z-10'
                    : 'bg-white border border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-green-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                      Mais Popular
                    </div>
                  </div>
                )}

                {/* Limited Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-purple-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg animate-pulse">
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  isPopular 
                    ? 'bg-green-600 text-white' 
                    : plan.color === 'purple' 
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  <plan.icon className="w-7 h-7" />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  {plan.isLifetime ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">R$ {price}</span>
                        <span className="text-gray-500">único</span>
                      </div>
                      <p className="text-sm text-purple-600 font-medium">Acesso vitalício</p>
                    </>
                  ) : price === 0 ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900">Grátis</span>
                      <p className="text-sm text-gray-500">Para sempre</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">R$ {price}</span>
                        <span className="text-gray-500">/mês</span>
                      </div>
                      {isYearly && (
                        <p className="text-sm text-green-600 font-medium">
                          Economia de R$ {(plan.monthlyPrice - plan.yearlyPrice) * 12}/ano
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* CTA */}
                <Button 
                  asChild 
                  className={`w-full mb-6 py-6 rounded-2xl ${
                    isPopular
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30'
                      : plan.color === 'purple'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  <Link to="/genesis" className="flex items-center justify-center gap-2">
                    {plan.cta}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
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
          className="mt-16 flex flex-wrap justify-center gap-8"
        >
          {[
            { icon: Shield, text: 'Garantia de 7 dias' },
            { icon: Clock, text: 'Cancele quando quiser' },
            { icon: Users, text: 'Suporte brasileiro' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-600">
              <item.icon className="w-5 h-5 text-green-600" />
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SitePricing;
