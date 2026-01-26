/**
 * GENESIS-IA - Renewal/Upgrade Modal
 * Modal de renovação ou upgrade de plano com pagamento integrado
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Check, 
  Loader2,
  X,
  Calendar,
  Sparkles,
  ArrowUp,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PaymentModal } from './PaymentModal';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  price_cents: number;
  promo_price_cents: number | null;
  duration_months: number;
  is_popular: boolean;
}

interface RenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentPlan: string;
  currentExpiresAt?: string;
  isPromoUser?: boolean;
  onSuccess: () => void;
}

// Map checkout plan names to genesis_plan enum values
const PLAN_TO_ENUM: Record<string, 'free' | 'starter' | 'professional' | 'enterprise'> = {
  monthly: 'starter',
  quarterly: 'professional',
  yearly: 'enterprise',
};

export function RenewalModal({
  isOpen,
  onClose,
  userId,
  currentPlan,
  currentExpiresAt,
  isPromoUser = false,
  onSuccess,
}: RenewalModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentCode: string;
    pixBrCode: string;
    pixQrCodeBase64?: string;
    expiresAt: string;
  } | null>(null);

  const isFreeUser = currentPlan === 'free' || !currentPlan;
  const isUpgrade = isFreeUser;

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('checkout_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_cents');

      if (error) throw error;
      setPlans(data || []);
      
      // Pre-select current plan or popular one
      const popular = data?.find(p => p.is_popular);
      setSelectedPlan(popular || data?.[0] || null);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNewExpiration = (durationMonths: number) => {
    const baseDate = currentExpiresAt && new Date(currentExpiresAt) > new Date() 
      ? new Date(currentExpiresAt) 
      : new Date();
    return addMonths(baseDate, durationMonths);
  };

  const getPrice = (plan: Plan) => {
    // If promo user, use promo price if available
    if (isPromoUser && plan.promo_price_cents) {
      return plan.promo_price_cents;
    }
    return plan.price_cents;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const handleProceed = async () => {
    if (!selectedPlan) return;

    setProcessing(true);
    try {
      // Get user info for payment
      const { data: userData } = await supabase
        .from('genesis_users')
        .select('email, name, phone')
        .eq('auth_user_id', userId)
        .maybeSingle();

      // Try to get CPF from checkout_customers if user has purchased before
      const { data: customerData } = await supabase
        .from('checkout_customers')
        .select('cpf, first_name, last_name, phone')
        .eq('email', userData?.email || '')
        .maybeSingle();

      const userName = userData?.name || 'Usuário';
      const userEmail = userData?.email || '';
      const userPhone = customerData?.phone || userData?.phone || '';
      const userCpf = customerData?.cpf || '';

      // Create payment via checkout-create-payment
      const priceCents = getPrice(selectedPlan);
      
      const { data, error } = await supabase.functions.invoke('checkout-create-payment', {
        body: {
          customer: {
            firstName: userName.split(' ')[0] || 'Usuário',
            lastName: userName.split(' ').slice(1).join(' ') || '',
            email: userEmail,
            phone: userPhone || '00000000000',
            phoneCountryCode: '+55',
            cpf: userCpf || '00000000000',
          },
          amountCents: priceCents,
          description: `${isUpgrade ? 'Upgrade' : 'Renovação'} - ${selectedPlan.display_name}`,
          paymentMethod: 'PIX',
          metadata: {
            userId,
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            planDisplayName: selectedPlan.display_name,
            durationMonths: selectedPlan.duration_months,
            isRenewal: !isUpgrade,
            isUpgrade,
            isPromoUser,
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Erro ao criar pagamento');
      }

      if (!data?.paymentCode || !data?.pixBrCode) {
        throw new Error('Dados de pagamento incompletos');
      }

      // Show payment modal
      setPaymentData({
        paymentCode: data.paymentCode,
        pixBrCode: data.pixBrCode,
        pixQrCodeBase64: data.pixQrCodeBase64,
        expiresAt: data.expiresAt,
      });
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast.error('Erro ao processar', {
        description: error.message || 'Tente novamente'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    // Payment confirmed - subscription will be activated by webhook
    // But we can also update locally for immediate feedback
    try {
      if (!selectedPlan) return;

      const newExpiresAt = calculateNewExpiration(selectedPlan.duration_months);
      const enumValue = PLAN_TO_ENUM[selectedPlan.name] || 'starter';
      
      // Update subscription
      const { data: existing } = await supabase
        .from('genesis_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('genesis_subscriptions')
          .update({
            plan: enumValue,
            plan_name: selectedPlan.display_name,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: newExpiresAt.toISOString(),
          })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('genesis_subscriptions')
          .insert({
            user_id: userId,
            plan: enumValue,
            plan_name: selectedPlan.display_name,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: newExpiresAt.toISOString(),
          });
      }

      toast.success(isUpgrade ? 'Upgrade realizado!' : 'Renovação concluída!', {
        description: `Válido até ${format(newExpiresAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
      });

      setShowPaymentModal(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating subscription:', error);
      // Payment was successful, subscription will be activated by webhook
      onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {!showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="bg-[#0a0f1a] border border-white/10 shadow-2xl overflow-hidden rounded-2xl"
              >
                {/* Header */}
                <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-primary/10 to-cyan-500/10">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      {isUpgrade ? (
                        <ArrowUp className="w-6 h-6 text-primary" />
                      ) : (
                        <RefreshCw className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {isUpgrade ? 'Fazer Upgrade' : 'Renovar Assinatura'}
                      </h2>
                      <p className="text-sm text-white/50">
                        {isUpgrade ? 'Escolha seu plano' : 'Estenda sua assinatura'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {/* Promo badge */}
                      {isPromoUser && (
                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                          <p className="text-sm text-primary">
                            Você tem direito ao preço promocional!
                          </p>
                        </div>
                      )}

                      {/* Plan Selection */}
                      <div className="space-y-3">
                        {plans.map((plan) => {
                          const isSelected = selectedPlan?.id === plan.id;
                          const newExpiration = calculateNewExpiration(plan.duration_months);
                          const price = getPrice(plan);
                          const hasDiscount = isPromoUser && plan.promo_price_cents;
                          
                          return (
                            <motion.button
                              key={plan.id}
                              onClick={() => setSelectedPlan(plan)}
                              className={cn(
                                "w-full p-4 rounded-xl border-2 transition-all text-left",
                                isSelected 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-white/10 bg-white/5 hover:border-white/20'
                              )}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                    isSelected ? 'border-primary bg-primary' : 'border-white/30'
                                  )}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-white">{plan.display_name}</span>
                                      {plan.is_popular && (
                                        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                                          <Sparkles className="w-3 h-3 mr-1" />
                                          Popular
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-white/50 mt-0.5">
                                      {plan.duration_months} {plan.duration_months === 1 ? 'mês' : 'meses'} de acesso
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {hasDiscount && (
                                    <span className="text-xs text-white/40 line-through block">
                                      {formatCurrency(plan.price_cents)}
                                    </span>
                                  )}
                                  <span className="text-lg font-bold text-white">
                                    {formatCurrency(price)}
                                  </span>
                                </div>
                              </div>
                              
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-3 pt-3 border-t border-white/10"
                                >
                                  <div className="flex items-center gap-2 text-sm text-white/60">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span>
                                      {isUpgrade ? 'Válido até: ' : 'Novo vencimento: '}
                                      <strong className="text-white">
                                        {format(newExpiration, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                      </strong>
                                    </span>
                                  </div>
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={handleProceed}
                        disabled={!selectedPlan || processing}
                        className="w-full h-12 text-base font-semibold gap-2"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Crown className="w-5 h-5" />
                            {isUpgrade ? 'Continuar para Pagamento' : 'Renovar Agora'}
                          </>
                        )}
                      </Button>

                      <p className="text-center text-xs text-white/40">
                        Pagamento seguro via PIX
                      </p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      {paymentData && selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentData(null);
          }}
          paymentCode={paymentData.paymentCode}
          pixBrCode={paymentData.pixBrCode}
          pixQrCodeBase64={paymentData.pixQrCodeBase64}
          amountCents={getPrice(selectedPlan)}
          planName={selectedPlan.display_name}
          expiresAt={paymentData.expiresAt}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
