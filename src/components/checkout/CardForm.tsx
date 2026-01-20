/**
 * CHECKOUT SYSTEM - Card Form Component
 * Formulário de cartão de crédito
 */

import React from 'react';
import { CreditCard, Calendar, Lock, User } from 'lucide-react';
import { formatCardNumber, formatCardExpiry, detectCardBrand } from '@/lib/checkout/validators';
import { cn } from '@/lib/utils';

interface CardFormProps {
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardHolderName: string;
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function CardForm({
  cardNumber,
  cardExpiry,
  cardCvv,
  cardHolderName,
  onChange,
  errors = {},
  disabled = false,
}: CardFormProps) {
  const cardBrand = detectCardBrand(cardNumber);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('cardNumber', formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('cardExpiry', formatCardExpiry(e.target.value));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    onChange('cardCvv', value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('cardHolderName', e.target.value.toUpperCase());
  };

  // Card brand icons (simplified)
  const getBrandIcon = () => {
    switch (cardBrand) {
      case 'visa':
        return <span className="text-xs font-bold text-blue-400">VISA</span>;
      case 'mastercard':
        return <span className="text-xs font-bold text-orange-400">MC</span>;
      case 'amex':
        return <span className="text-xs font-bold text-blue-300">AMEX</span>;
      case 'elo':
        return <span className="text-xs font-bold text-yellow-400">ELO</span>;
      case 'hipercard':
        return <span className="text-xs font-bold text-red-400">HIPER</span>;
      default:
        return <CreditCard className="w-4 h-4 text-white/40" />;
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-center gap-2 pb-3 border-b border-white/10">
        <CreditCard className="w-5 h-5 text-emerald-400" />
        <span className="font-medium text-white">Dados do Cartão</span>
      </div>

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1.5">
          Número do Cartão <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            disabled={disabled}
            placeholder="0000 0000 0000 0000"
            maxLength={23}
            className={cn(
              "w-full h-12 px-4 pr-16 rounded-xl border border-white/10",
              "bg-white/5 text-white placeholder:text-white/30 font-mono",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
              errors.cardNumber && "border-red-500/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {getBrandIcon()}
          </div>
        </div>
        {errors.cardNumber && (
          <p className="mt-1 text-xs text-red-400">{errors.cardNumber}</p>
        )}
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            Validade <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={cardExpiry}
              onChange={handleExpiryChange}
              disabled={disabled}
              placeholder="MM/AA"
              maxLength={5}
              className={cn(
                "w-full h-12 pl-11 pr-4 rounded-xl border border-white/10",
                "bg-white/5 text-white placeholder:text-white/30 font-mono",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                errors.cardExpiry && "border-red-500/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            />
          </div>
          {errors.cardExpiry && (
            <p className="mt-1 text-xs text-red-400">{errors.cardExpiry}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            CVV <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={cardCvv}
              onChange={handleCvvChange}
              disabled={disabled}
              placeholder="123"
              maxLength={4}
              className={cn(
                "w-full h-12 pl-11 pr-4 rounded-xl border border-white/10",
                "bg-white/5 text-white placeholder:text-white/30 font-mono",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                errors.cardCvv && "border-red-500/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            />
          </div>
          {errors.cardCvv && (
            <p className="mt-1 text-xs text-red-400">{errors.cardCvv}</p>
          )}
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1.5">
          Nome no Cartão <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={cardHolderName}
            onChange={handleNameChange}
            disabled={disabled}
            placeholder="NOME COMO ESTÁ NO CARTÃO"
            className={cn(
              "w-full h-12 pl-11 pr-4 rounded-xl border border-white/10",
              "bg-white/5 text-white placeholder:text-white/30 uppercase",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
              errors.cardHolderName && "border-red-500/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
        {errors.cardHolderName && (
          <p className="mt-1 text-xs text-red-400">{errors.cardHolderName}</p>
        )}
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
        <Lock className="w-4 h-4 text-emerald-500" />
        <span className="text-xs text-white/50">
          Seus dados estão protegidos com criptografia de ponta a ponta
        </span>
      </div>
    </div>
  );
}
