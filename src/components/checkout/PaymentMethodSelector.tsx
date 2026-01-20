/**
 * CHECKOUT SYSTEM - Payment Method Selector
 * Seletor de método de pagamento (PIX ou Cartão)
 */

import React from 'react';
import { CreditCard, QrCode, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      description: 'Pagamento instantâneo',
      icon: QrCode,
      badge: 'Recomendado',
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'CARD' as const,
      name: 'Cartão de Crédito',
      description: 'Parcele em até 12x',
      icon: CreditCard,
      badge: null,
      badgeColor: null,
    },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white/80">
        Forma de pagamento <span className="text-red-400">*</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {methods.map((method) => {
          const isSelected = value === method.id;
          const Icon = method.icon;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => !disabled && onChange(method.id)}
              disabled={disabled}
              className={cn(
                "relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                isSelected
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Selection indicator */}
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-white/30"
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>

              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isSelected ? "bg-emerald-500/20" : "bg-white/10"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isSelected ? "text-emerald-400" : "text-white/60"
                  )}
                />
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium",
                    isSelected ? "text-white" : "text-white/80"
                  )}>
                    {method.name}
                  </span>
                  {method.badge && (
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full text-white",
                      method.badgeColor
                    )}>
                      {method.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs text-white/50">
                  {method.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
