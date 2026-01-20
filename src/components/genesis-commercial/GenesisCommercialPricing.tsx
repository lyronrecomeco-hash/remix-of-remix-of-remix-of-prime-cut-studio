import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Sparkles, Crown, ArrowRight, Shield, Clock, Star, Zap, Gift } from 'lucide-react';
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
    gradient: 'from-cyan-500 to-blue-600',
    popular: true,
    features: [
      { text: '5 instâncias WhatsApp', highlight: false },
      { text: 'Mensagens ilimitadas', highlight: false },
      { text: 'Luna IA conversacional', highlight: true },
      { text: 'Flow Builder completo', highlight: false },
      { text: 'Analytics avançado', highlight: false },
      { text: 'Integrações premium', highlight: false },
      { text: 'Suporte prioritário 24h', highlight: false },
      { text: 'Treinamento incluso', highlight: false },
    ],
    cta: 'Começar 7 Dias Grátis',
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
    gradient: 'from-amber-500 to-orange-600',
    popular: false,
    limitedSpots: 17,
    features: [
      { text: 'Tudo do Premium incluso', highlight: true },
      { text: 'Instâncias ilimitadas', highlight: true },
      { text: 'Atualizações vitalícias', highlight: false },
      { text: 'Onboarding VIP 1:1', highlight: false },
      { text: 'Suporte WhatsApp direto', highlight: false },
      { text: 'Acesso beta exclusivo', highlight: false },
      { text: 'Comunidade founders', highlight: false },
      { text: 'Consultoria mensal', highlight: true },
    ],
    cta: 'Garantir Acesso Vitalício',
    guarantee: true,
  },
];

const GenesisCommercialPricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="planos" ref={ref} className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.05),transparent_50%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

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
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400"
          >
            <Crown className="w-4 h-4" />
            Planos Premium
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 text-white">
            Escolha o plano
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              ideal para você
            </span>
          </h2>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Ofertas exclusivas por tempo limitado. 
            <span className="text-cyan-400 font-semibold"> Sem surpresas, sem taxas ocultas.</span>
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
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg shadow-cyan-500/30 flex items-center gap-2">
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
                  <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-2">
                    <Gift className="w-3.5 h-3.5" />
                    Apenas {plan.limitedSpots} vagas
                  </span>
                </motion.div>
              )}

              {/* Card */}
              <div className={`relative h-full p-8 rounded-3xl overflow-hidden transition-all duration-500 ${
                plan.popular 
                  ? 'bg-gradient-to-b from-cyan-500/10 via-slate-900/90 to-slate-900/90 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20' 
                  : 'bg-slate-900/70 border border-white/10 hover:border-amber-500/30'
              }`}>
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-5`} />

                <div className="relative">
                  {/* Header */}
                  <div className="mb-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-5 shadow-xl`}>
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                    <p className="text-sm text-slate-400">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg text-slate-500 line-through">R$ {plan.originalPrice}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r ${plan.gradient} text-white`}>
                        {plan.discount}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl md:text-6xl font-black text-white">R$ {plan.price}</span>
                      <span className="text-slate-400 font-medium">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          feature.highlight 
                            ? `bg-gradient-to-r ${plan.gradient}` 
                            : 'bg-white/10'
                        }`}>
                          <Check className={`w-3 h-3 ${feature.highlight ? 'text-white' : 'text-cyan-400'}`} />
                        </div>
                        <span className={`text-sm ${feature.highlight ? 'text-white font-semibold' : 'text-slate-300'}`}>
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
                      className={`w-full py-7 text-base font-bold group ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/25' 
                          : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-xl shadow-amber-500/25'
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
                    <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
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
              { icon: Zap, text: '+3.500 clientes satisfeitos' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-500">
                <item.icon className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          
          <p className="text-center text-xs text-slate-600 mt-6">
            Aceito: Cartão de crédito, PIX e boleto • Pagamento 100% seguro
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisCommercialPricing;
