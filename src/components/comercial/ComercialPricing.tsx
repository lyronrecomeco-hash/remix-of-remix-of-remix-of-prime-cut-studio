import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Check, Sparkles, Zap, Crown, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    icon: Zap,
    description: 'Perfeito para começar',
    monthlyPrice: 97,
    yearlyPrice: 77,
    popular: false,
    features: [
      '1 número WhatsApp',
      '1.000 mensagens/mês',
      'Luna IA básica',
      'Flow Builder (3 fluxos)',
      'Suporte por email',
      'Relatórios básicos',
    ],
    cta: 'Começar Agora',
    gradient: 'from-gray-600 to-gray-700',
  },
  {
    name: 'Pro',
    icon: Crown,
    description: 'Mais vendido',
    monthlyPrice: 197,
    yearlyPrice: 157,
    popular: true,
    features: [
      '3 números WhatsApp',
      '10.000 mensagens/mês',
      'Luna IA avançada',
      'Flow Builder ilimitado',
      'Suporte prioritário',
      'Analytics completo',
      'Integrações premium',
      'Transcrição de áudio',
    ],
    cta: 'Escolher Pro',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    name: 'Enterprise',
    icon: Building2,
    description: 'Para grandes operações',
    monthlyPrice: 497,
    yearlyPrice: 397,
    popular: false,
    features: [
      'Números ilimitados',
      'Mensagens ilimitadas',
      'Luna IA personalizada',
      'Flow Builder + API',
      'Gerente de sucesso',
      'Analytics avançado',
      'White-label',
      'SLA garantido 99.9%',
      'Treinamento presencial',
    ],
    cta: 'Falar com Vendas',
    gradient: 'from-violet-500 to-purple-600',
  },
];

const ComercialPricing = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="precos" ref={ref} className="relative py-24 lg:py-32 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-emerald-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200 mb-6"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-600">Planos Flexíveis</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
            Escolha o plano ideal
            <span className="block mt-2 text-emerald-500">para seu negócio</span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Comece grátis por 7 dias. Sem cartão de crédito. Cancele quando quiser.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <span className={`font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>Mensal</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                isYearly ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: isYearly ? 32 : 0 }}
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
              />
            </button>
            <span className={`font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Anual
              <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full">
                -20%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -8 }}
                className={`relative bg-white rounded-3xl p-8 h-full shadow-xl border-2 transition-all duration-300 ${
                  plan.popular
                    ? 'border-emerald-500 shadow-emerald-500/20'
                    : 'border-gray-100 shadow-gray-200/50 hover:border-gray-200'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full shadow-lg">
                      <span className="text-white text-sm font-bold">Mais Popular</span>
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                    <plan.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-500 text-sm">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-gray-900">
                      R$ {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-500 mb-2">/mês</span>
                  </div>
                  {isYearly && (
                    <p className="text-sm text-emerald-600 font-medium mt-2">
                      Economia de R$ {(plan.monthlyPrice - plan.yearlyPrice) * 12}/ano
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link to="/genesis/login">
                  <Button
                    className={`w-full h-14 text-lg font-bold rounded-xl transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🛡️</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Garantia de 7 dias</p>
              <p className="text-gray-600 text-sm">Não gostou? Devolvemos 100% do seu dinheiro.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComercialPricing;
