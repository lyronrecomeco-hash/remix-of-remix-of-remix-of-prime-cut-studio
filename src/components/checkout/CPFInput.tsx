/**
 * CHECKOUT SYSTEM - CPF Input Component
 * Input de CPF com validação e formatação
 */

import React from 'react';
import { Check, X } from 'lucide-react';
import { formatCPF, isValidCPF } from '@/lib/checkout/validators';
import { cn } from '@/lib/utils';

interface CPFInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function CPFInput({
  value,
  onChange,
  error,
  disabled = false,
}: CPFInputProps) {
  const cleanValue = value.replace(/\D/g, '');
  const isComplete = cleanValue.length === 11;
  const isValid = isComplete && isValidCPF(cleanValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    onChange(formatted);
  };

  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-1.5">
        CPF <span className="text-red-400">*</span>
      </label>
      
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="000.000.000-00"
          maxLength={14}
          className={cn(
            "w-full h-11 sm:h-12 px-3 sm:px-4 pr-12 rounded-xl border border-white/10",
            "bg-white/5 text-white placeholder:text-white/30 text-sm sm:text-base",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50",
            "transition-all",
            error && "border-red-500/50 focus:ring-red-500/50",
            isComplete && isValid && "border-emerald-500/50",
            isComplete && !isValid && "border-red-500/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Validation indicator */}
        {isComplete && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isValid ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-[10px] sm:text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      
      {isComplete && !isValid && !error && (
        <p className="mt-1 text-[10px] sm:text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> CPF inválido
        </p>
      )}
    </div>
  );
}
