import { motion } from 'framer-motion';
import { 
  Crown, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { differenceInDays, format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SubscriptionBillingCardProps {
  plan: string;
  planName?: string;
  status: string;
  startedAt?: string;
  expiresAt?: string;
  maxInstances: number;
  maxFlows: number;
  onRenew?: () => void;
  onUpgrade?: () => void;
}

export function SubscriptionBillingCard({
  plan,
  planName,
  status,
  startedAt,
  expiresAt,
  maxInstances,
  maxFlows,
  onRenew,
  onUpgrade,
}: SubscriptionBillingCardProps) {
  const now = new Date();
  const expirationDate = expiresAt ? new Date(expiresAt) : null;
  const startDate = startedAt ? new Date(startedAt) : null;
  
  // Calculate days remaining
  const daysRemaining = expirationDate ? differenceInDays(expirationDate, now) : null;
  const isExpired = daysRemaining !== null && daysRemaining < 0;
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;
  const isFree = plan === 'free';

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
        className: 'bg-destructive/20 text-destructive border-destructive/30',
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
    return { 
      label: 'Ativo', 
      className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2
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
  }[plan] || 'Plano Básico';

  // Plan tier color
  const planColorClass = {
    free: 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
    starter: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    professional: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    enterprise: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  }[plan] || 'from-primary/20 to-primary/10 border-primary/30';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className={cn(
        "border-2 bg-gradient-to-br overflow-hidden",
        planColorClass
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Minha Assinatura
            </CardTitle>
            <Badge 
              variant="outline" 
              className={cn("flex items-center gap-1.5", statusConfig.className)}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Plan Name & Tier */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{displayPlanName}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isFree ? 'Recursos limitados' : `${maxInstances} instância${maxInstances > 1 ? 's' : ''} • ${maxFlows} fluxos`}
              </p>
            </div>
            {!isFree && plan !== 'enterprise' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onUpgrade}
                className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
              >
                <TrendingUp className="w-4 h-4" />
                Upgrade
              </Button>
            )}
          </div>

          {/* Billing Period Info - Only for paid plans */}
          {!isFree && expirationDate && (
            <>
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Período de assinatura</span>
                  <span>{Math.round(progressPercentage)}% utilizado</span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className={cn(
                    "h-2",
                    isExpired ? "[&>div]:bg-destructive" : 
                    isExpiringSoon ? "[&>div]:bg-amber-500" : 
                    "[&>div]:bg-primary"
                  )}
                />
              </div>

              {/* Dates Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Início</span>
                  </div>
                  <p className="text-foreground font-medium text-sm">
                    {startDate 
                      ? format(startDate, "dd MMM yyyy", { locale: ptBR })
                      : 'N/A'
                    }
                  </p>
                </div>

                <div className={cn(
                  "rounded-lg p-3 border",
                  isExpired 
                    ? "bg-destructive/10 border-destructive/30" 
                    : isExpiringSoon 
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-muted/30 border-border/50"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className={cn(
                      "w-4 h-4",
                      isExpired ? "text-destructive" : 
                      isExpiringSoon ? "text-amber-500" : 
                      "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs",
                      isExpired ? "text-destructive" : 
                      isExpiringSoon ? "text-amber-500" : 
                      "text-muted-foreground"
                    )}>
                      {isExpired ? 'Expirou' : 'Expira'}
                    </span>
                  </div>
                  <p className={cn(
                    "font-medium text-sm",
                    isExpired ? "text-destructive" : 
                    isExpiringSoon ? "text-amber-500" : 
                    "text-foreground"
                  )}>
                    {format(expirationDate, "dd MMM yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {/* Days Counter */}
              <div className={cn(
                "flex items-center justify-between p-4 rounded-lg border",
                isExpired 
                  ? "bg-destructive/10 border-destructive/30" 
                  : isExpiringSoon 
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-emerald-500/10 border-emerald-500/30"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl",
                    isExpired 
                      ? "bg-destructive/20 text-destructive" 
                      : isExpiringSoon 
                        ? "bg-amber-500/20 text-amber-500"
                        : "bg-emerald-500/20 text-emerald-500"
                  )}>
                    {isExpired ? Math.abs(daysRemaining!) : daysRemaining}
                  </div>
                  <div>
                    <p className={cn(
                      "font-medium",
                      isExpired ? "text-destructive" : 
                      isExpiringSoon ? "text-amber-500" : 
                      "text-emerald-500"
                    )}>
                      {isExpired 
                        ? `Dia${Math.abs(daysRemaining!) !== 1 ? 's' : ''} desde a expiração`
                        : `Dia${daysRemaining !== 1 ? 's' : ''} restante${daysRemaining !== 1 ? 's' : ''}`
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isExpired 
                        ? 'Renove para reativar o acesso'
                        : formatDistanceToNow(expirationDate, { locale: ptBR, addSuffix: true })
                      }
                    </p>
                  </div>
                </div>
                
                {(isExpired || isExpiringSoon) && (
                  <Button
                    onClick={onRenew}
                    size="sm"
                    className={cn(
                      "gap-1.5",
                      isExpired 
                        ? "bg-destructive hover:bg-destructive/90" 
                        : "bg-amber-500 hover:bg-amber-500/90 text-black"
                    )}
                  >
                    <CreditCard className="w-4 h-4" />
                    Renovar
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Free plan CTA */}
          {isFree && (
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Desbloqueie mais recursos</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Faça upgrade para acessar mais instâncias e fluxos
                  </p>
                </div>
                <Button onClick={onUpgrade} size="sm" className="gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Assinar
                </Button>
              </div>
            </div>
          )}

          {/* Resources Summary */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Instâncias WhatsApp</p>
              <p className="text-lg font-bold text-foreground">{maxInstances}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Fluxos de Automação</p>
              <p className="text-lg font-bold text-foreground">{maxFlows}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
