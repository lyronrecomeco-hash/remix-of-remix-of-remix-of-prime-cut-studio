/**
 * CHECKOUT SYSTEM - Validators
 * Validação de CPF, telefone e dados do checkout
 */

import { z } from 'zod';

// Validação de CPF
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleanCPF[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleanCPF[10])) return false;
  
  return true;
}

// Formatação de CPF
export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
}

// Formatação de telefone
export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

// Validação de telefone brasileiro
export function isValidBrazilianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

// Formatação de valor monetário
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

// Schema de validação do formulário de checkout
export const checkoutFormSchema = z.object({
  firstName: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  
  lastName: z.string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Sobrenome deve conter apenas letras'),
  
  cpf: z.string()
    .transform(val => val.replace(/\D/g, ''))
    .refine(val => val.length === 11, 'CPF deve ter 11 dígitos')
    .refine(isValidCPF, 'CPF inválido'),
  
  phone: z.string()
    .transform(val => val.replace(/\D/g, ''))
    .refine(val => val.length >= 10 && val.length <= 11, 'Telefone inválido'),
  
  phoneCountryCode: z.string().default('+55'),
  
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  
  paymentMethod: z.enum(['PIX', 'CARD']),
  
  installments: z.number().min(1).max(12).optional(),
  
  // Campos de cartão (validados apenas se paymentMethod === 'CARD')
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  cardHolderName: z.string().optional(),
}).refine((data) => {
  if (data.paymentMethod === 'CARD') {
    return data.cardNumber && data.cardExpiry && data.cardCvv && data.cardHolderName;
  }
  return true;
}, {
  message: 'Preencha todos os dados do cartão',
  path: ['cardNumber'],
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

// Validação de cartão de crédito (Luhn algorithm)
export function isValidCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// Detectar bandeira do cartão
export function detectCardBrand(cardNumber: string): string | null {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^6(?:011|5)/.test(digits)) return 'discover';
  if (/^(636368|438935|504175|451416|636297)/.test(digits) || 
      /^5(?:067|090|0[6-8]|02)/.test(digits)) return 'elo';
  if (/^(606282|3841)/.test(digits)) return 'hipercard';
  
  return null;
}

// Formatação de número do cartão
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : digits;
}

// Formatação de validade do cartão
export function formatCardExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
