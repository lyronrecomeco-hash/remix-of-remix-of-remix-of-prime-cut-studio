/**
 * CHECKOUT SYSTEM - Payment Method Selector
 * Seletor de método de pagamento com ícones reais
 */

import React from 'react';
import { Check } from 'lucide-react';
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
  const methods = [
    {
      id: 'PIX' as const,
      name: 'PIX',
      description: 'Aprovação instantânea • 5% desconto',
      badge: 'Recomendado',
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'CARD' as const,
      name: 'Cartão de Crédito',
      description: 'Parcele em até 12x',
      badge: null,
      badgeColor: null,
    },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-xs sm:text-sm font-medium text-white/80">
        Forma de pagamento <span className="text-red-400">*</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {methods.map((method) => {
          const isSelected = value === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => !disabled && onChange(method.id)}
              disabled={disabled}
              className={cn(
                "relative flex flex-col p-3 sm:p-4 rounded-xl border-2 transition-all text-left",
                isSelected
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Badge */}
              {method.badge && (
                <span className={cn(
                  "absolute -top-2 right-3 text-[10px] px-2 py-0.5 rounded-full text-white font-medium",
                  method.badgeColor
                )}>
                  {method.badge}
                </span>
              )}

              {/* Header with radio and name */}
              <div className="flex items-center gap-3 mb-2">
                {/* Selection indicator */}
                <div
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-white/30"
                  )}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />}
                </div>

                <span className={cn(
                  "font-medium text-sm sm:text-base",
                  isSelected ? "text-white" : "text-white/80"
                )}>
                  {method.name}
                </span>
              </div>

              {/* Icon row */}
              <div className="pl-7 sm:pl-8">
                {method.id === 'PIX' ? (
                  <PixIcon className="w-12 h-7 sm:w-14 sm:h-8" />
                ) : (
                  <CardBrandsRow className="opacity-80" />
                )}
              </div>

              {/* Description */}
              <p className="pl-7 sm:pl-8 mt-1.5 text-[10px] sm:text-xs text-white/50">
                {method.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
