/**
 * CHECKOUT SYSTEM - Phone Input Component
 * Input de telefone com seleção de código do país
 */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { COUNTRY_CODES, type CountryCode } from '@/lib/checkout/types';
import { formatPhone } from '@/lib/checkout/validators';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  countryCode: string;
  onChange: (phone: string, countryCode: string) => void;
  error?: string;
  disabled?: boolean;
}

export function PhoneInput({
  value,
  countryCode,
  onChange,
  error,
  disabled = false,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedCountry = COUNTRY_CODES.find(c => c.dialCode === countryCode) || COUNTRY_CODES[0];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onChange(formatted, countryCode);
  };

  const handleCountrySelect = (country: CountryCode) => {
    onChange(value, country.dialCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white/80 mb-1.5">
        Telefone <span className="text-red-400">*</span>
      </label>
      
      <div className="flex">
        {/* Country Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1.5 h-12 px-3 rounded-l-xl border border-r-0 border-white/10",
              "bg-white/5 text-white transition-all",
              "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm text-white/60">{selectedCountry.dialCode}</span>
            <ChevronDown className="w-4 h-4 text-white/40" />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-[min(16rem,calc(100vw-2rem))] max-h-60 overflow-y-auto z-20 rounded-xl border border-white/10 bg-slate-800 shadow-xl">
                {COUNTRY_CODES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      "hover:bg-white/10",
                      country.dialCode === countryCode && "bg-emerald-500/20"
                    )}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1 text-sm text-white">{country.name}</span>
                    <span className="text-sm text-white/60">{country.dialCode}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Phone Input */}
        <input
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          disabled={disabled}
          placeholder="(11) 99999-9999"
          className={cn(
            "flex-1 h-12 px-4 rounded-r-xl border border-white/10",
            "bg-white/5 text-white placeholder:text-white/30",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50",
            "transition-all",
            error && "border-red-500/50 focus:ring-red-500/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
