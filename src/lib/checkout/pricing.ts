/**
 * CHECKOUT SYSTEM - Pricing helpers
 * Centraliza o cálculo de desconto PIX e juros do cartão
 */

export type PaymentMethod = 'PIX' | 'CARD';

export interface CheckoutPricingInput {
  baseAmountCents: number;
  paymentMethod: PaymentMethod;
  installments?: number;
}

export interface CheckoutPricingResult {
  baseAmountCents: number;
  paymentMethod: PaymentMethod;
  installments: number;

  hasInterest: boolean;
  interestRate: number;

  totalWithInterestCents: number;
  installmentValueCents: number;

  pixDiscountCents: number;
  finalAmountCents: number;
}

export const MIN_GATEWAY_AMOUNT_CENTS = 100; // R$ 1,00

export function calculateCheckoutPricing(input: CheckoutPricingInput): CheckoutPricingResult {
  const baseAmountCents = Number.isFinite(input.baseAmountCents)
    ? Math.max(0, Math.floor(input.baseAmountCents))
    : 0;

  const installments = Math.max(1, Math.min(12, Math.floor(input.installments ?? 1)));

  const hasInterest = input.paymentMethod === 'CARD' && installments > 3;
  const interestRate = hasInterest ? 0.0199 : 0;

  const totalWithInterestCents = hasInterest
    ? Math.ceil(baseAmountCents * Math.pow(1 + interestRate, installments))
    : baseAmountCents;

  const installmentValueCents = Math.ceil(totalWithInterestCents / installments);

  if (input.paymentMethod === 'PIX') {
    const desiredDiscount = Math.ceil(baseAmountCents * 0.05);
    const discounted = baseAmountCents - desiredDiscount;

    // Gateway exige mínimo de R$ 1,00. Se o desconto quebrar o mínimo, zera o desconto.
    const finalAmountCents = Math.max(MIN_GATEWAY_AMOUNT_CENTS, discounted);
    const pixDiscountCents = Math.max(0, baseAmountCents - finalAmountCents);

    return {
      baseAmountCents,
      paymentMethod: 'PIX',
      installments: 1,
      hasInterest: false,
      interestRate: 0,
      totalWithInterestCents: baseAmountCents,
      installmentValueCents: baseAmountCents,
      pixDiscountCents,
      finalAmountCents,
    };
  }

  const finalAmountCents = Math.max(MIN_GATEWAY_AMOUNT_CENTS, totalWithInterestCents);

  return {
    baseAmountCents,
    paymentMethod: 'CARD',
    installments,
    hasInterest,
    interestRate,
    totalWithInterestCents,
    installmentValueCents,
    pixDiscountCents: 0,
    finalAmountCents,
  };
}
