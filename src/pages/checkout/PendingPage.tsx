/**
 * CHECKOUT SYSTEM - Pending Page
 * Página de pagamento pendente/aguardando confirmação
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Clock, RefreshCw, Home, Loader2 } from 'lucide-react';

import { CheckoutLayout } from '@/components/checkout/CheckoutLayout';
import { getPaymentByCode, checkPaymentStatus } from '@/lib/checkout/api';
import { formatCurrency } from '@/lib/checkout/validators';
import type { CheckoutPayment } from '@/lib/checkout/types';
import { cn } from '@/lib/utils';

export default function PendingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');
  
  const [payment, setPayment] = useState<CheckoutPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    async function loadPayment() {
      if (code) {
        const data = await getPaymentByCode(code);
        
        if (data?.status === 'paid') {
          navigate(`/checkout/success?code=${code}`);
          return;
        }
        
        if (data?.status === 'expired') {
          navigate(`/checkout/error?code=expired`);
          return;
        }
        
        setPayment(data);
      }
      setIsLoading(false);
    }

    loadPayment();
  }, [code, navigate]);

  const handleCheckStatus = async () => {
    if (!code) return;
    
    setIsChecking(true);
    const status = await checkPaymentStatus(code);
    
    if (status.status === 'paid') {
      navigate(`/checkout/success?code=${code}`);
    } else if (status.status === 'expired') {
      navigate(`/checkout/error?code=expired`);
    }
    
    setIsChecking(false);
  };

  if (isLoading) {
    return (
      <CheckoutLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        </div>
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout showSecurityBadges={false}>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          {/* Pending Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto">
              <div className="w-16 h-16 rounded-full bg-yellow-500/40 flex items-center justify-center">
                <Clock className="w-10 h-10 text-yellow-500" />
              </div>
            </div>
            
            {/* Pulse animation */}
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-yellow-500/20 animate-pulse mx-auto" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">
            Pagamento Pendente
          </h1>
          <p className="text-white/60 mb-8">
            Estamos aguardando a confirmação do seu pagamento. Isso pode levar alguns minutos.
          </p>

          {/* Payment Details */}
          {payment && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 mb-8 text-left">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Cliente</span>
                  <span className="font-semibold text-white">{payment.customerName || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Valor</span>
                  <span className="font-semibold text-yellow-400">
                    {formatCurrency(payment.amountCents)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Status</span>
                  <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                    Aguardando
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-white",
                "bg-gradient-to-r from-yellow-500 to-yellow-600",
                "hover:from-yellow-600 hover:to-yellow-700",
                "transition-all flex items-center justify-center gap-2",
                "disabled:opacity-50"
              )}
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Verificar Status
                </>
              )}
            </button>
            
            {payment?.paymentMethod === 'PIX' && payment.paymentCode && (
              <Link
                to={`/checkout/${payment.paymentCode}`}
                className={cn(
                  "w-full h-12 rounded-xl font-semibold text-white/80",
                  "border border-white/10 bg-white/5",
                  "hover:bg-white/10 transition-all",
                  "flex items-center justify-center gap-2"
                )}
              >
                Ver QR Code PIX
              </Link>
            )}
            
            <Link
              to="/"
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-white/60",
                "hover:text-white transition-all",
                "flex items-center justify-center gap-2"
              )}
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </Link>
          </div>

          {/* Info */}
          <p className="mt-8 text-sm text-white/40">
            Você pode fechar esta página. Enviaremos uma notificação quando o pagamento for confirmado.
          </p>
        </div>
      </div>
    </CheckoutLayout>
  );
}
