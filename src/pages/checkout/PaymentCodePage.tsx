/**
 * CHECKOUT SYSTEM - Payment Code Page
 * Página de pagamento PIX com QR Code e timer
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { CheckoutLayout } from '@/components/checkout/CheckoutLayout';
import { PixDisplay } from '@/components/checkout/PixDisplay';
import { PixTimer } from '@/components/checkout/PixTimer';
import { OrderSummary } from '@/components/checkout/OrderSummary';

import { getPaymentByCode, checkPaymentStatus, regeneratePayment } from '@/lib/checkout/api';
import { formatCurrency } from '@/lib/checkout/validators';
import type { CheckoutPayment } from '@/lib/checkout/types';
import { cn } from '@/lib/utils';

export default function PaymentCodePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [payment, setPayment] = useState<CheckoutPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Carregar dados do pagamento
  useEffect(() => {
    async function loadPayment() {
      if (!code) {
        navigate('/checkout/error');
        return;
      }

      setIsLoading(true);
      const data = await getPaymentByCode(code);
      
      if (!data) {
        navigate('/checkout/error');
        return;
      }

      if (data.status === 'paid') {
        navigate(`/checkout/success?code=${code}`);
        return;
      }

      if (data.status === 'expired') {
        setIsExpired(true);
      }

      setPayment(data);
      setIsLoading(false);
    }

    loadPayment();
  }, [code, navigate]);

  // Polling para verificar status do pagamento
  useEffect(() => {
    if (!code || isPaid || isExpired || !payment) return;

    const interval = setInterval(async () => {
      const status = await checkPaymentStatus(code);
      
      if (status.status === 'paid') {
        setIsPaid(true);
        toast.success('Pagamento confirmado!');
        setTimeout(() => {
          navigate(`/checkout/success?code=${code}`);
        }, 2000);
      } else if (status.status === 'expired') {
        setIsExpired(true);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [code, isPaid, isExpired, payment, navigate]);

  // Handle timer expiration
  const handleExpire = useCallback(() => {
    setIsExpired(true);
    toast.warning('O tempo para pagamento expirou');
  }, []);

  // Regenerate payment
  const handleRegenerate = async () => {
    if (!code) return;
    
    setIsRegenerating(true);
    const result = await regeneratePayment(code);
    
    if (result.success && result.paymentCode) {
      toast.success('Novo código PIX gerado!');
      navigate(`/checkout/${result.paymentCode}`);
    } else {
      toast.error(result.error || 'Erro ao gerar novo pagamento');
    }
    
    setIsRegenerating(false);
  };

  if (isLoading) {
    return (
      <CheckoutLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Carregando pagamento...</p>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  if (!payment) {
    return null;
  }

  // Paid state
  if (isPaid) {
    return (
      <CheckoutLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-white/60 mb-6">
              Redirecionando para a página de sucesso...
            </p>
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* PIX Display Column */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-white mb-2">
                  Pagamento via PIX
                </h1>
                <p className="text-white/60">
                  Escaneie o QR Code ou copie o código para pagar
                </p>
              </div>

              {/* Timer */}
              {payment.expiresAt && !isExpired && (
                <div className="mb-6">
                  <PixTimer
                    expiresAt={payment.expiresAt}
                    onExpire={handleExpire}
                  />
                </div>
              )}

              {/* Expired state */}
              {isExpired ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-8 h-8 text-red-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white mb-2">
                    PIX Expirado
                  </h2>
                  <p className="text-white/60 mb-6">
                    O tempo para pagamento terminou. Gere um novo código para continuar.
                  </p>
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className={cn(
                      "px-6 py-3 rounded-xl font-semibold text-white",
                      "bg-gradient-to-r from-emerald-500 to-emerald-600",
                      "hover:from-emerald-600 hover:to-emerald-700",
                      "transition-all flex items-center gap-2 mx-auto",
                      "disabled:opacity-50"
                    )}
                  >
                    {isRegenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        Gerar Novo PIX
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* PIX QR Code and code */
                payment.pixBrCode && (
                  <PixDisplay
                    brCode={payment.pixBrCode}
                    qrCodeBase64={payment.pixQrCodeBase64 || undefined}
                  />
                )
              )}

              {/* Payment status indicator */}
              {!isExpired && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-center gap-3 text-white/60">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    <span className="text-sm">Aguardando confirmação do pagamento...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-8 space-y-4">
              <OrderSummary
                description={payment.description || 'Pagamento'}
                amountCents={payment.amountCents}
                paymentMethod="PIX"
              />

              {/* Payment Code */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Código do pedido</span>
                  <span className="font-mono text-sm text-white">{payment.paymentCode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CheckoutLayout>
  );
}
