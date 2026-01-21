import React from 'react';
import { ShoppingBag, Tag, Shield, Lock, CheckCircle, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/checkout/validators';
import { calculateCheckoutPricing } from '@/lib/checkout/pricing';
import { cn } from '@/lib/utils';
import { AllPaymentIcons } from './PaymentIcons';

interface OrderSummaryProps {
  description?: string;
  amountCents: number;
  installments?: number;
  paymentMethod?: 'PIX' | 'CARD';
  className?: string;
}

export function OrderSummary({
  description = 'Pagamento',
  amountCents,
  installments = 1,
  paymentMethod = 'PIX',
  className,
}: OrderSummaryProps) {
  const pricing = calculateCheckoutPricing({
    baseAmountCents: amountCents,
    paymentMethod,
    installments,
  });

  return (
    <div className={cn(
      "rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5",
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-white/10">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm sm:text-base">Resumo do Pedido</h3>
          <p className="text-xs sm:text-sm text-white/60">Detalhes do pagamento</p>
        </div>
      </div>

      {/* Items */}
      <div className="py-3 sm:py-4 space-y-2 sm:space-y-3">
        {/* Descrição */}
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-white/70">{description}</span>
          <span className="text-sm sm:text-base text-white font-medium">{formatCurrency(amountCents)}</span>
        </div>

        {/* Desconto PIX */}
        {pricing.pixDiscountCents > 0 && (
          <div className="flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Desconto PIX (5%)
            </span>
            <span className="text-xs sm:text-sm font-medium">- {formatCurrency(pricing.pixDiscountCents)}</span>
          </div>
        )}

        {/* Juros cartão */}
        {pricing.hasInterest && (
          <div className="flex items-center justify-between text-yellow-400">
            <span className="text-xs sm:text-sm">Juros ({installments}x)</span>
            <span className="text-xs sm:text-sm font-medium">+ {formatCurrency(pricing.totalWithInterestCents - amountCents)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="pt-3 sm:pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base sm:text-lg font-semibold text-white">Total</span>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold text-emerald-400">
              {formatCurrency(pricing.finalAmountCents)}
            </span>
            {paymentMethod === 'CARD' && installments > 1 && (
              <p className="text-[10px] sm:text-xs text-white/50">
                ou {installments}x de {formatCurrency(pricing.installmentValueCents)}
              </p>
            )}
          </div>
        </div>

        {paymentMethod === 'PIX' && pricing.pixDiscountCents > 0 && (
          <div className="flex items-center gap-2 mt-2 sm:mt-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs text-emerald-400">
              Você economiza {formatCurrency(pricing.pixDiscountCents)} pagando com PIX!
            </span>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-[10px] sm:text-xs text-white/40 mb-2 text-center">Formas de pagamento aceitas</p>
        <div className="flex justify-center">
          <AllPaymentIcons />
        </div>
      </div>

      {/* Trust Signals */}
      <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-white/60">
          <Lock className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs">Pagamento 100% seguro e criptografado</span>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs">Seus dados estão protegidos (SSL)</span>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <Zap className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs">Processamento instantâneo</span>
        </div>
      </div>

      {/* Security badge */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-white/40">
        <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="text-[10px] sm:text-xs">Ambiente seguro • Compra protegida</span>
      </div>
    </div>
  );
}
