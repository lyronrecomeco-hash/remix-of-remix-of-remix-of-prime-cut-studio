/**
 * CHECKOUT SYSTEM - Main Checkout Page
 * Página principal do checkout com formulário
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';

import { CheckoutLayout } from '@/components/checkout/CheckoutLayout';
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Informações Pessoais
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">
                        Nome <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        disabled={isLoading}
                        placeholder="Seu nome"
                        className={cn(
                          "w-full h-12 px-4 rounded-xl border border-white/10",
                          "bg-white/5 text-white placeholder:text-white/30",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                          errors.firstName && "border-red-500/50"
                        )}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1.5">
                        Sobrenome <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        disabled={isLoading}
                        placeholder="Seu sobrenome"
                        className={cn(
                          "w-full h-12 px-4 rounded-xl border border-white/10",
                          "bg-white/5 text-white placeholder:text-white/30",
                          "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                          errors.lastName && "border-red-500/50"
                        )}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>
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
                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                      Email <span className="text-white/40">(opcional)</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      disabled={isLoading}
                      placeholder="seu@email.com"
                      className={cn(
                        "w-full h-12 px-4 rounded-xl border border-white/10",
                        "bg-white/5 text-white placeholder:text-white/30",
                        "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                        errors.email && "border-red-500/50"
                      )}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Forma de Pagamento
                </h2>
                
                <div className="space-y-4">
                  <PaymentMethodSelector
                    value={formData.paymentMethod || 'PIX'}
                    onChange={(method) => updateField('paymentMethod', method)}
                    disabled={isLoading}
                  />

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
                  "w-full h-14 rounded-xl font-semibold text-white",
                  "bg-gradient-to-r from-emerald-500 to-emerald-600",
                  "hover:from-emerald-600 hover:to-emerald-700",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                  "transition-all flex items-center justify-center gap-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    Continuar para pagamento
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                <Shield className="w-4 h-4" />
                <span>Seus dados estão protegidos</span>
              </div>
            </form>
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-8">
              <OrderSummary
                description={description}
                amountCents={amountCents}
                installments={formData.installments}
                paymentMethod={formData.paymentMethod}
              />
            </div>
          </div>
        </div>
      </div>
    </CheckoutLayout>
  );
}
