/**
 * CHECKOUT SYSTEM - Installment Selector
 * Seletor de parcelas para cartão de crédito
 */

import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/checkout/validators';
import { cn } from '@/lib/utils';

interface InstallmentSelectorProps {
  value: number;
  onChange: (installments: number) => void;
  totalCents: number;
  maxInstallments?: number;
  disabled?: boolean;
}

export function InstallmentSelector({
  value,
  onChange,
  totalCents,
  maxInstallments = 12,
  disabled = false,
}: InstallmentSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Gerar opções de parcelamento
  const options = Array.from({ length: maxInstallments }, (_, i) => {
    const installments = i + 1;
    const installmentValue = Math.ceil(totalCents / installments);
    const hasInterest = installments > 3; // Juros a partir de 4x (exemplo)
    const interestRate = hasInterest ? 0.0199 : 0; // 1.99% ao mês
    const totalWithInterest = hasInterest
      ? Math.ceil(totalCents * Math.pow(1 + interestRate, installments))
      : totalCents;
    const installmentWithInterest = Math.ceil(totalWithInterest / installments);

    return {
      installments,
      installmentValue: hasInterest ? installmentWithInterest : installmentValue,
      total: hasInterest ? totalWithInterest : totalCents,
      hasInterest,
      interestLabel: hasInterest ? 'com juros' : 'sem juros',
    };
  });

  const selectedOption = options.find((o) => o.installments === value) || options[0];

  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-1.5">
        Parcelamento
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "w-full h-12 px-4 rounded-xl border border-white/10",
            "bg-white/5 text-white text-left",
            "flex items-center justify-between",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
            "transition-all hover:bg-white/10",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span>
            {selectedOption.installments}x de{' '}
            <span className="font-semibold">
              {formatCurrency(selectedOption.installmentValue)}
            </span>{' '}
            <span className="text-white/50">{selectedOption.interestLabel}</span>
          </span>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-white/40 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-2 z-20 rounded-xl border border-white/10 bg-slate-800 shadow-xl overflow-hidden max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.installments}
                  type="button"
                  onClick={() => {
                    onChange(option.installments);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                    "hover:bg-white/10",
                    option.installments === value && "bg-emerald-500/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        option.installments === value
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-white/30"
                      )}
                    >
                      {option.installments === value && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <span className="text-white">
                        {option.installments}x de{' '}
                        <span className="font-semibold">
                          {formatCurrency(option.installmentValue)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "ml-2 text-xs",
                          option.hasInterest ? "text-yellow-400" : "text-emerald-400"
                        )}
                      >
                        {option.interestLabel}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-white/50">
                    Total: {formatCurrency(option.total)}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
