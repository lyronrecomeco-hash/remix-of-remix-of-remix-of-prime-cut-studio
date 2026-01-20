/**
 * CHECKOUT SYSTEM - Main Checkout Page
 * Página principal do checkout com formulário
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';

import { CheckoutLayout } from '@/components/checkout/CheckoutLayout';
import { CheckoutCountdownBar } from '@/components/checkout/CheckoutCountdownBar';
import { PhoneInput } from '@/components/checkout/PhoneInput';
import { CPFInput } from '@/components/checkout/CPFInput';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { CardForm } from '@/components/checkout/CardForm';
import { InstallmentSelector } from '@/components/checkout/InstallmentSelector';
import { OrderSummary } from '@/components/checkout/OrderSummary';

import { createPayment } from '@/lib/checkout/api';
import { checkoutFormSchema, type CheckoutFormValues } from '@/lib/checkout/validators';
import { cn } from '@/lib/utils';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Parâmetros da URL
  const amountCents = parseInt(searchParams.get('amount') || '9900', 10);
  const description = searchParams.get('description') || 'Pagamento';
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = useState<Partial<CheckoutFormValues>>({
    firstName: '',
    lastName: '',
    cpf: '',
    phone: '',
    phoneCountryCode: '+55',
    email: '',
    paymentMethod: 'PIX',
    installments: 1,
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardHolderName: '',
  });

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = checkoutFormSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setIsLoading(true);

    try {
      const response = await createPayment({
        customer: {
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          cpf: result.data.cpf,
          phone: result.data.phone,
          phoneCountryCode: result.data.phoneCountryCode,
          email: result.data.email || undefined,
        },
        amountCents,
        description,
        paymentMethod: result.data.paymentMethod,
        installments: result.data.installments,
        metadata: {
          cardNumber: result.data.cardNumber ? '****' + result.data.cardNumber.slice(-4) : undefined,
        },
      });

      if (response.success && response.paymentCode) {
        navigate(`/checkout/payment-code/${response.paymentCode}`);
      } else {
        toast.error(response.error || 'Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CheckoutLayout>
      {/* Countdown Bar - Fixed at top */}
      <CheckoutCountdownBar 
        defaultMinutes={10} 
        onExpire={() => {
          toast.error('O tempo da oferta expirou!');
        }}
      />
      
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pt-14 sm:pt-16">
        {/* Mobile-first Alert */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-emerald-300">Pagamento 100% Seguro</h3>
              <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                Ambiente criptografado • PIX instantâneo • Garantia de satisfação
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-4 sm:gap-8">
          {/* Form Column */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Personal Info */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">1</div>
                  Informações Pessoais
                </h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* First Name */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-1.5">
                        Nome <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        disabled={isLoading}
                        placeholder="Seu nome"
                        className={cn(
                          "w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl border border-white/10",
                          "bg-white/5 text-white placeholder:text-white/30 text-sm sm:text-base",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                          "transition-all duration-200",
                          errors.firstName && "border-red-500/50 ring-1 ring-red-500/30"
                        )}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-[10px] sm:text-xs text-red-400 flex items-center gap-1">
                          <span>⚠</span> {errors.firstName}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-1.5">
                        Sobrenome <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        disabled={isLoading}
                        placeholder="Seu sobrenome"
                        className={cn(
                          "w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl border border-white/10",
                          "bg-white/5 text-white placeholder:text-white/30 text-sm sm:text-base",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                          "transition-all duration-200",
                          errors.lastName && "border-red-500/50 ring-1 ring-red-500/30"
                        )}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-[10px] sm:text-xs text-red-400 flex items-center gap-1">
                          <span>⚠</span> {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CPF */}
                  <CPFInput
                    value={formData.cpf || ''}
                    onChange={(value) => updateField('cpf', value)}
                    error={errors.cpf}
                    disabled={isLoading}
                  />

                  {/* Phone */}
                  <PhoneInput
                    value={formData.phone || ''}
                    countryCode={formData.phoneCountryCode || '+55'}
                    onChange={(phone, countryCode) => {
                      updateField('phone', phone);
                      updateField('phoneCountryCode', countryCode);
                    }}
                    error={errors.phone}
                    disabled={isLoading}
                  />

                  {/* Email (optional) */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-1.5">
                      Email <span className="text-white/40 text-[10px] sm:text-xs">(opcional - para recibo)</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      disabled={isLoading}
                      placeholder="seu@email.com"
                      className={cn(
                        "w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl border border-white/10",
                        "bg-white/5 text-white placeholder:text-white/30 text-sm sm:text-base",
                        "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                        "transition-all duration-200",
                        errors.email && "border-red-500/50 ring-1 ring-red-500/30"
                      )}
                    />
                    {errors.email && (
                      <p className="mt-1 text-[10px] sm:text-xs text-red-400 flex items-center gap-1">
                        <span>⚠</span> {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">2</div>
                  Forma de Pagamento
                </h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <PaymentMethodSelector
                    value={formData.paymentMethod || 'PIX'}
                    onChange={(method) => updateField('paymentMethod', method)}
                    disabled={isLoading}
                  />

                  {/* PIX Info */}
                  {formData.paymentMethod === 'PIX' && (
                    <div className="p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <ArrowRight className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-emerald-300">PIX - Aprovação Instantânea</h4>
                          <p className="text-xs text-white/60 mt-0.5">
                            Pague com QR Code ou copie o código. Confirmação em segundos!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Form */}
                  {formData.paymentMethod === 'CARD' && (
                    <>
                      <CardForm
                        cardNumber={formData.cardNumber || ''}
                        cardExpiry={formData.cardExpiry || ''}
                        cardCvv={formData.cardCvv || ''}
                        cardHolderName={formData.cardHolderName || ''}
                        onChange={(field, value) => updateField(field, value)}
                        errors={errors}
                        disabled={isLoading}
                      />

                      <InstallmentSelector
                        value={formData.installments || 1}
                        onChange={(installments) => updateField('installments', installments)}
                        totalCents={amountCents}
                        disabled={isLoading}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-12 sm:h-14 rounded-xl font-semibold text-white text-sm sm:text-base",
                  "bg-gradient-to-r from-emerald-500 to-emerald-600",
                  "hover:from-emerald-600 hover:to-emerald-700",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                  "transition-all flex items-center justify-center gap-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    Continuar para pagamento
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="flex items-center justify-center gap-2 text-white/40 text-xs sm:text-sm">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Seus dados estão protegidos com criptografia SSL</span>
              </div>
            </form>
          </div>

          {/* Summary Column - Shows first on mobile */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <OrderSummary
                description={description}
                amountCents={amountCents}
                installments={formData.installments}
                paymentMethod={formData.paymentMethod}
              />
              
              {/* Trust badges for mobile */}
              <div className="mt-4 lg:hidden">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] text-white/70">Compra Segura</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                    <Loader2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] text-white/70">PIX Instantâneo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CheckoutLayout>
  );
}
