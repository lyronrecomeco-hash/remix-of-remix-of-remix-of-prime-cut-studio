/**
 * CHECKOUT SYSTEM - Payment Icons Component
 * Ícones reais de bandeiras de cartão e PIX
 */

import React from 'react';
import visaIcon from '@/assets/payment-icons/visa.svg';
import mastercardIcon from '@/assets/payment-icons/mastercard.svg';
import eloIcon from '@/assets/payment-icons/elo.svg';
import hipercardIcon from '@/assets/payment-icons/hipercard.svg';
import amexIcon from '@/assets/payment-icons/amex.svg';
import pixIcon from '@/assets/payment-icons/pix.svg';

interface PaymentIconProps {
  className?: string;
}

export function VisaIcon({ className = "w-10 h-6" }: PaymentIconProps) {
  return <img src={visaIcon} alt="Visa" className={className} />;
}

export function MastercardIcon({ className = "w-10 h-6" }: PaymentIconProps) {
  return <img src={mastercardIcon} alt="Mastercard" className={className} />;
}

export function EloIcon({ className = "w-10 h-6" }: PaymentIconProps) {
  return <img src={eloIcon} alt="Elo" className={className} />;
}

export function HipercardIcon({ className = "w-10 h-6" }: PaymentIconProps) {
  return <img src={hipercardIcon} alt="Hipercard" className={className} />;
}

export function AmexIcon({ className = "w-10 h-6" }: PaymentIconProps) {
  return <img src={amexIcon} alt="American Express" className={className} />;
}

export function PixIcon({ className = "w-10 h-6" }: PaymentIconProps) {
  return <img src={pixIcon} alt="PIX" className={className} />;
}

export function CardBrandsRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <VisaIcon className="w-8 h-5" />
      <MastercardIcon className="w-8 h-5" />
      <EloIcon className="w-8 h-5" />
      <HipercardIcon className="w-8 h-5" />
      <AmexIcon className="w-8 h-5" />
    </div>
  );
}

export function AllPaymentIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <PixIcon className="w-10 h-6" />
      <div className="w-px h-4 bg-white/20" />
      <CardBrandsRow />
    </div>
  );
}
