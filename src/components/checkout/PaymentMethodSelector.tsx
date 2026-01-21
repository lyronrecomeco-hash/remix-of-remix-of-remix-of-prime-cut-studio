/**
 * CHECKOUT SYSTEM - Payment Method Selector
 * Seletor de método de pagamento - Layout limpo
 */

import React from 'react';
import { Check, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixIcon } from './PaymentIcons';

interface PaymentMethodSelectorProps {
  value: 'PIX' | 'CARD';
  onChange: (method: 'PIX' | 'CARD') => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-xs sm:text-sm font-medium text-white/80">
        Forma de pagamento <span className="text-red-400">*</span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        {/* PIX Option */}
        <button
          type="button"
          onClick={() => !disabled && onChange('PIX')}
          disabled={disabled}
          className={cn(
            "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all min-h-[100px]",
            value === 'PIX'
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-white/10 bg-white/5 hover:border-white/20",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* Badge */}
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-medium whitespace-nowrap">
            Recomendado
          </span>

          {/* Radio */}
          <div
            className={cn(
              "absolute top-2 left-2 w-4 h-4 rounded-full border-2 flex items-center justify-center",
              value === 'PIX'
                ? "border-emerald-500 bg-emerald-500"
                : "border-white/30"
            )}
          >
            {value === 'PIX' && <Check className="w-2.5 h-2.5 text-white" />}
          </div>

          {/* Icon */}
          <PixIcon className="w-12 h-7 sm:w-14 sm:h-8" />

          {/* Name */}
          <span className={cn(
            "font-medium text-sm mt-2",
            value === 'PIX' ? "text-white" : "text-white/70"
          )}>
            PIX
          </span>
        </button>

        {/* Card Option */}
        <button
          type="button"
          onClick={() => !disabled && onChange('CARD')}
          disabled={disabled}
          className={cn(
            "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all min-h-[100px]",
            value === 'CARD'
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-white/10 bg-white/5 hover:border-white/20",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* Radio */}
          <div
            className={cn(
              "absolute top-2 left-2 w-4 h-4 rounded-full border-2 flex items-center justify-center",
              value === 'CARD'
                ? "border-emerald-500 bg-emerald-500"
                : "border-white/30"
            )}
          >
            {value === 'CARD' && <Check className="w-2.5 h-2.5 text-white" />}
          </div>

          {/* Icon - Simple credit card icon */}
          <CreditCard className={cn(
            "w-10 h-10 sm:w-12 sm:h-12",
            value === 'CARD' ? "text-emerald-400" : "text-white/50"
          )} />

          {/* Name */}
          <span className={cn(
            "font-medium text-sm mt-2",
            value === 'CARD' ? "text-white" : "text-white/70"
          )}>
            Cartão de Crédito
          </span>
        </button>
      </div>
    </div>
  );
}
