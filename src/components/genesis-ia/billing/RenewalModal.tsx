import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  CreditCard, 
  Check, 
  Loader2,
  X,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addMonths, addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  price_cents: number;
  duration_months: number;
  is_popular: boolean;
}

interface RenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentPlan: string;
  currentExpiresAt?: string;
  onSuccess: () => void;
}

export function RenewalModal({
  isOpen,
  onClose,
  userId,
  currentPlan,
  currentExpiresAt,
  onSuccess,
}: RenewalModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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
      const current = data?.find(p => p.name === currentPlan);
      const popular = data?.find(p => p.is_popular);
      setSelectedPlan(current || popular || data?.[0] || null);
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

  const handleRenew = async () => {
    if (!selectedPlan) return;

    setProcessing(true);
    try {
      const newExpiresAt = calculateNewExpiration(selectedPlan.duration_months);
      
      // Check if subscription exists
      const { data: existing } = await supabase
        .from('genesis_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (existing) {
        // Update existing subscription
        const { error } = await supabase
          .from('genesis_subscriptions')
          .update({
            plan: selectedPlan.name as 'free' | 'starter' | 'professional' | 'enterprise',
            plan_name: selectedPlan.display_name,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: newExpiresAt.toISOString(),
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new subscription
        const { error } = await supabase
          .from('genesis_subscriptions')
          .insert({
            user_id: userId,
            plan: selectedPlan.name as 'free' | 'starter' | 'professional' | 'enterprise',
            plan_name: selectedPlan.display_name,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: newExpiresAt.toISOString(),
          });

        if (error) throw error;
      }

      toast.success('Assinatura renovada com sucesso!', {
        description: `Novo vencimento: ${format(newExpiresAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error renewing subscription:', error);
      toast.error('Erro ao renovar assinatura', {
        description: error.message
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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
            className="bg-[#0a0f1a] border border-white/10 shadow-2xl overflow-hidden"
            style={{ borderRadius: '16px' }}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-primary/10 to-blue-500/10">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Renovar Assinatura</h2>
                  <p className="text-sm text-white/50">Escolha o plano para renovação</p>
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
                  {/* Plan Selection */}
                  <div className="space-y-3">
                    {plans.map((plan) => {
                      const isSelected = selectedPlan?.id === plan.id;
                      const newExpiration = calculateNewExpiration(plan.duration_months);
                      
                      return (
                        <motion.button
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan)}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected 
                              ? 'border-primary bg-primary/10' 
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-primary bg-primary' : 'border-white/30'
                              }`}>
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
                              <span className="text-lg font-bold text-white">
                                R$ {(plan.price_cents / 100).toFixed(2).replace('.', ',')}
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
                                  Novo vencimento: <strong className="text-white">
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
                    onClick={handleRenew}
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
                        <CreditCard className="w-5 h-5" />
                        Confirmar Renovação
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-white/40">
                    Ao confirmar, seu plano será renovado imediatamente
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
