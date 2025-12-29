import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Crown, Star, MessageCircle, X, Check, Sparkles, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription, FEATURE_BLOCKING_INFO, FeatureName } from '@/contexts/SubscriptionContext';

const UpgradeModal = () => {
  const { upgradeModalOpen, upgradeModalFeature, hideUpgradeModal, currentPlan, allPlans } = useSubscription();

  if (!upgradeModalOpen || !upgradeModalFeature) return null;

  const featureInfo = FEATURE_BLOCKING_INFO[upgradeModalFeature] || {
    title: 'Recurso Premium',
    stat: 'Desbloqueie este recurso com o plano Premium!',
    description: 'Este recurso está disponível apenas para assinantes Premium.',
  };

  const premiumPlan = allPlans.find(p => p.name === 'premium');
  const lifetimePlan = allPlans.find(p => p.name === 'lifetime');

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse em assinar o plano Premium para minha barbearia. Gostaria de saber mais sobre os benefícios e como realizar o pagamento.`
    );
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const premiumFeatures = [
    'Agendamentos ilimitados',
    'Marketing via WhatsApp',
    'Relatórios avançados',
    'Galeria de fotos',
    'Templates de mensagem',
    'Suporte prioritário',
  ];

  const lifetimeFeatures = [
    'Tudo do Premium',
    'Acesso vitalício',
    'Atualizações gratuitas para sempre',
    'Suporte VIP',
  ];

  return (
    <AnimatePresence>
      {upgradeModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={hideUpgradeModal}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-3xl my-8"
            >
              <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-2xl">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 sm:p-8">
                  <button
                    onClick={hideUpgradeModal}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{featureInfo.title}</h2>
                      <p className="text-muted-foreground">Recurso exclusivo para assinantes</p>
                    </div>
                  </div>

                  {/* Persuasive stat */}
                  <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-primary">Você sabia?</span>
                    </div>
                    <p className="text-foreground font-semibold">{featureInfo.stat}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                  <p className="text-muted-foreground mb-8 text-center">{featureInfo.description}</p>

                  {/* Plans Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Premium Plan */}
                    <div className="relative flex flex-col p-6 rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent hover:border-primary/50 transition-colors">
                      <div className="absolute -top-3 left-4">
                        <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          POPULAR
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-4 mt-2">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">Premium</h3>
                          <p className="text-sm text-muted-foreground">Mensal</p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-foreground">R$ {premiumPlan?.price || 49}</span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                      
                      <ul className="space-y-3 mb-6 flex-1">
                        {premiumFeatures.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-foreground text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className="w-full h-12 text-base bg-primary hover:bg-primary/90"
                        onClick={handleWhatsAppContact}
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Assinar Premium
                      </Button>
                    </div>

                    {/* Lifetime Plan */}
                    <div className="relative flex flex-col p-6 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent hover:border-amber-500/70 transition-colors">
                      <div className="absolute -top-3 left-4">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          MELHOR VALOR
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-4 mt-2">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                          <Crown className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">Vitalício</h3>
                          <p className="text-sm text-muted-foreground">Pagamento único</p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-foreground">R$ {lifetimePlan?.price || 497}</span>
                        <span className="text-muted-foreground"> único</span>
                      </div>
                      
                      <ul className="space-y-3 mb-6 flex-1">
                        {lifetimeFeatures.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-amber-500" />
                            </div>
                            <span className="text-foreground text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className="w-full h-12 text-base bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold"
                        onClick={handleWhatsAppContact}
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Comprar Vitalício
                      </Button>
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Pagamento seguro
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Garantia de 7 dias
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      Suporte dedicado
                    </span>
                  </div>

                  {/* Cancel button */}
                  <div className="mt-6 text-center">
                    <Button
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={hideUpgradeModal}
                    >
                      Talvez depois
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
