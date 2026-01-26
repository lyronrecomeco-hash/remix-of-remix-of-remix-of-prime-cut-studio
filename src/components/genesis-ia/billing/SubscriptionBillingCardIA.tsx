import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  CreditCard,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { differenceInDays, format, addMonths, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { RenewalModal } from './RenewalModal';

interface SubscriptionBillingCardIAProps {
  userId: string;
  plan: string;
  planName?: string;
  status: string;
  startedAt?: string;
  expiresAt?: string;
  isPromoUser?: boolean;
  onRenewed?: () => void;
}

export function SubscriptionBillingCardIA({
  userId,
  plan,
  planName,
  status,
  startedAt,
  expiresAt,
  isPromoUser = false,
  onRenewed,
}: SubscriptionBillingCardIAProps) {
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  
  const now = new Date();
  const expirationDate = expiresAt ? new Date(expiresAt) : null;
  const startDate = startedAt ? new Date(startedAt) : null;
  
  // Calculate days remaining
  const daysRemaining = expirationDate ? differenceInDays(expirationDate, now) : null;
  const isExpired = daysRemaining !== null && daysRemaining < 0;
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;
  const isFree = plan === 'free' || !plan;

  // Calculate progress for the billing period
  const progressPercentage = (() => {
    if (!startDate || !expirationDate) return 0;
    const totalDays = differenceInDays(expirationDate, startDate);
    const elapsedDays = differenceInDays(now, startDate);
    return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  })();

  // Status badge config
  const getStatusConfig = () => {
    if (isExpired) {
      return { 
        label: 'Expirado', 
        className: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: AlertTriangle
      };
    }
    if (isExpiringSoon) {
      return { 
        label: 'Expirando', 
        className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        icon: Clock
      };
    }
    if (status === 'active') {
      return { 
        label: 'Ativo', 
        className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        icon: CheckCircle2
      };
    }
    return { 
      label: 'Inativo', 
      className: 'bg-white/10 text-white/50 border-white/20',
      icon: Clock
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Plan display name
  const displayPlanName = planName || {
    free: 'Plano Gratuito',
    starter: 'Plano Mensal',
    professional: 'Plano Trimestral',
    enterprise: 'Plano Anual',
  }[plan] || 'Sem Plano';

  const handleRenewalSuccess = () => {
    setShowRenewalModal(false);
    onRenewed?.();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card 
          className="bg-white/5 border-white/10 overflow-hidden"
          style={{ borderRadius: '14px' }}
        >
          <CardContent className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Minha Assinatura</h4>
                  <p className="text-xs text-white/50">Gerencie seu plano</p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={cn("flex items-center gap-1.5", statusConfig.className)}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </Badge>
            </div>

            {/* Plan Info */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-white">{displayPlanName}</span>
                {!isFree && daysRemaining !== null && (
                  <span className={cn(
                    "text-sm font-medium",
                    isExpired ? "text-red-400" : isExpiringSoon ? "text-amber-400" : "text-white/50"
                  )}>
                    {isExpired 
                      ? `Expirou há ${Math.abs(daysRemaining)} dia${Math.abs(daysRemaining) !== 1 ? 's' : ''}`
                      : `${daysRemaining} dia${daysRemaining !== 1 ? 's' : ''} restante${daysRemaining !== 1 ? 's' : ''}`
                    }
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {!isFree && startDate && expirationDate && (
                <div className="space-y-2">
                  <Progress 
                    value={progressPercentage} 
                    className="h-2 bg-white/10"
                  />
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Início: {format(startDate, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Vencimento: {format(expirationDate, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              )}

              {isFree && (
                <p className="text-sm text-white/40">
                  Você está usando o plano gratuito com recursos limitados.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowRenewalModal(true)}
                className="flex-1 gap-2"
                variant={isExpired || isExpiringSoon ? "default" : "outline"}
              >
                <RefreshCw className="w-4 h-4" />
                {isExpired ? 'Renovar Agora' : isFree ? 'Fazer Upgrade' : 'Renovar Plano'}
              </Button>
            </div>

            {/* Warning for expired/expiring */}
            {(isExpired || isExpiringSoon) && (
              <div className={cn(
                "p-3 rounded-lg border flex items-start gap-2",
                isExpired 
                  ? "bg-red-500/10 border-red-500/20" 
                  : "bg-amber-500/10 border-amber-500/20"
              )}>
                <AlertTriangle className={cn(
                  "w-4 h-4 mt-0.5 flex-shrink-0",
                  isExpired ? "text-red-400" : "text-amber-400"
                )} />
                <p className={cn(
                  "text-sm",
                  isExpired ? "text-red-300" : "text-amber-300"
                )}>
                  {isExpired 
                    ? "Sua assinatura expirou. Renove agora para continuar usando todos os recursos."
                    : "Sua assinatura está prestes a expirar. Renove para evitar interrupções."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Renewal Modal */}
      <RenewalModal
        isOpen={showRenewalModal}
        onClose={() => setShowRenewalModal(false)}
        userId={userId}
        currentPlan={plan}
        currentExpiresAt={expiresAt}
        isPromoUser={isPromoUser}
        onSuccess={handleRenewalSuccess}
      />
    </>
  );
}
