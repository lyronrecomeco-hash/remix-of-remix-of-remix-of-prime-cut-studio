import React from 'react';
import { ShoppingBag, Tag, Shield } from 'lucide-react';
import { formatCurrency } from '@/lib/checkout/validators';
import { calculateCheckoutPricing } from '@/lib/checkout/pricing';
import { cn } from '@/lib/utils';

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
      "rounded-xl border border-white/10 bg-white/5 p-5",
      className
    )}>
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Resumo do Pedido</h3>
          <p className="text-sm text-white/60">Detalhes do pagamento</p>
        </div>
      </div>

      <div className="py-4 space-y-3">
        {/* Descrição */}
        <div className="flex items-center justify-between">
          <span className="text-white/70">{description}</span>
          <span className="text-white">{formatCurrency(amountCents)}</span>
        </div>

        {/* Desconto PIX */}
        {pricing.pixDiscountCents > 0 && (
          <div className="flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Desconto PIX (5%)
            </span>
            <span>- {formatCurrency(pricing.pixDiscountCents)}</span>
          </div>
        )}

        {/* Juros cartão */}
        {pricing.hasInterest && (
          <div className="flex items-center justify-between text-yellow-400">
            <span>Juros ({installments}x)</span>
            <span>+ {formatCurrency(pricing.totalWithInterestCents - amountCents)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold text-white">Total</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-emerald-400">
              {formatCurrency(pricing.finalAmountCents)}
            </span>
            {paymentMethod === 'CARD' && installments > 1 && (
              <p className="text-xs text-white/50">
                ou {installments}x de {formatCurrency(pricing.installmentValueCents)}
              </p>
            )}
          </div>
        </div>

        {paymentMethod === 'PIX' && pricing.pixDiscountCents > 0 && (
          <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Tag className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">
              Você está economizando {formatCurrency(pricing.pixDiscountCents)} pagando com PIX!
            </span>
          </div>
        )}
      </div>

      {/* Security badge */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-white/40">
        <Shield className="w-4 h-4" />
        <span className="text-xs">Pagamento 100% seguro</span>
      </div>
    </div>
  );
}
