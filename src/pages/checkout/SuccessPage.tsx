/**
 * CHECKOUT SYSTEM - Success Page
 * Página de sucesso após pagamento confirmado
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Download, Home, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

import { CheckoutLayout } from '@/components/checkout/CheckoutLayout';
import { getPaymentByCode } from '@/lib/checkout/api';
import { formatCurrency } from '@/lib/checkout/validators';
import type { CheckoutPayment } from '@/lib/checkout/types';
import { cn } from '@/lib/utils';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  
  const [payment, setPayment] = useState<CheckoutPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPayment() {
      if (code) {
        const data = await getPaymentByCode(code);
        setPayment(data);
      }
      setIsLoading(false);
    }

    loadPayment();

    // Confetti celebration!
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: ReturnType<typeof setInterval> = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, [code]);

  return (
    <CheckoutLayout showSecurityBadges={false}>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          {/* Success Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
            
            {/* Pulse animation */}
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-emerald-500/20 animate-ping mx-auto" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">
            Pagamento Confirmado!
          </h1>
          <p className="text-white/60 mb-8">
            Seu pagamento foi processado com sucesso. Você receberá uma confirmação em breve.
          </p>

          {/* Payment Details */}
          {payment && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 mb-8 text-left">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Código</span>
                  <span className="font-mono text-white">{payment.paymentCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Valor</span>
                  <span className="font-semibold text-emerald-400">
                    {formatCurrency(payment.amountCents)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Método</span>
                  <span className="text-white">{payment.paymentMethod}</span>
                </div>
                {payment.paidAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Data</span>
                    <span className="text-white">
                      {new Date(payment.paidAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/"
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-white",
                "bg-gradient-to-r from-emerald-500 to-emerald-600",
                "hover:from-emerald-600 hover:to-emerald-700",
                "transition-all flex items-center justify-center gap-2"
              )}
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </Link>
            
            <button
              onClick={() => window.print()}
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-white/80",
                "border border-white/10 bg-white/5",
                "hover:bg-white/10 transition-all",
                "flex items-center justify-center gap-2"
              )}
            >
              <Download className="w-5 h-5" />
              Baixar Comprovante
            </button>
          </div>

          {/* Support */}
          <p className="mt-8 text-sm text-white/40">
            Dúvidas? Entre em contato com nosso suporte.
          </p>
        </div>
      </div>
    </CheckoutLayout>
  );
}
