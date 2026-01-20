/**
 * CHECKOUT SYSTEM - Error Page
 * Página de erro genérico do checkout
 */

import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, RefreshCw, Home, MessageCircle } from 'lucide-react';

import { CheckoutLayout } from '@/components/checkout/CheckoutLayout';
import { cn } from '@/lib/utils';

export default function ErrorPage() {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('code');
  const message = searchParams.get('message');

  const getErrorMessage = () => {
    switch (errorCode) {
      case 'not_found':
        return 'Pagamento não encontrado';
      case 'expired':
        return 'O pagamento expirou';
      case 'failed':
        return 'Falha no processamento';
      case 'cancelled':
        return 'Pagamento cancelado';
      default:
        return message || 'Ocorreu um erro inesperado';
    }
  };

  return (
    <CheckoutLayout showSecurityBadges={false}>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          {/* Error Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <div className="w-16 h-16 rounded-full bg-red-500/40 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">
            Ops! Algo deu errado
          </h1>
          <p className="text-white/60 mb-8">
            {getErrorMessage()}
          </p>

          {/* Error Details */}
          {errorCode && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 mb-8">
              <p className="text-sm text-red-400">
                Código do erro: {errorCode}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/checkout"
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-white",
                "bg-gradient-to-r from-emerald-500 to-emerald-600",
                "hover:from-emerald-600 hover:to-emerald-700",
                "transition-all flex items-center justify-center gap-2"
              )}
            >
              <RefreshCw className="w-5 h-5" />
              Tentar Novamente
            </Link>
            
            <Link
              to="/"
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-white/80",
                "border border-white/10 bg-white/5",
                "hover:bg-white/10 transition-all",
                "flex items-center justify-center gap-2"
              )}
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-sm text-white/60 mb-3">
              Precisa de ajuda? Nosso suporte está disponível
            </p>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Falar com Suporte
            </a>
          </div>
        </div>
      </div>
    </CheckoutLayout>
  );
}
