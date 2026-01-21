/**
 * CHECKOUT SYSTEM - Payment Method Selector
 * Seletor de método de pagamento - Layout igual à referência Cakto
 */

import React from 'react';
import { Check, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixIcon, CardBrandsRow } from './PaymentIcons';

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
            "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all",
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
          <PixIcon className="w-10 h-6 sm:w-12 sm:h-7 mb-2 mt-1" />

          {/* Name */}
          <span className={cn(
            "font-medium text-sm",
            value === 'PIX' ? "text-white" : "text-white/70"
          )}>
            PIX
          </span>

          {/* Description */}
          <span className="text-[10px] text-white/50 text-center mt-0.5">
            Aprovação instantânea • 5% desconto
          </span>
        </button>

        {/* Card Option */}
        <button
          type="button"
          onClick={() => !disabled && onChange('CARD')}
          disabled={disabled}
          className={cn(
            "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all",
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
            "w-8 h-8 sm:w-10 sm:h-10 mb-2 mt-1",
            value === 'CARD' ? "text-emerald-400" : "text-white/50"
          )} />

          {/* Name */}
          <span className={cn(
            "font-medium text-sm",
            value === 'CARD' ? "text-white" : "text-white/70"
          )}>
            Cartão de Crédito
          </span>

          {/* Card brands - Show only here */}
          <div className="mt-1.5">
            <CardBrandsRow className="opacity-70" />
          </div>

          {/* Description */}
          <span className="text-[10px] text-white/50 text-center mt-0.5">
            Parcele em até 12x
          </span>
        </button>
      </div>
    </div>
  );
}
