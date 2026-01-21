/**
 * CHECKOUT SYSTEM - Layout Component
 * Layout base mobile-first com footer dinâmico
 */

import React, { useEffect, useState } from 'react';
import { Shield, Lock, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AllPaymentIcons } from './PaymentIcons';

interface CheckoutLayoutProps {
  children: React.ReactNode;
  showSecurityBadges?: boolean;
}

// Gateway display names
const GATEWAY_NAMES: Record<string, string> = {
  abacatepay: 'AbacatePay',
  asaas: 'Asaas',
  misticpay: 'MisticPay',
};

export function CheckoutLayout({ children, showSecurityBadges = true }: CheckoutLayoutProps) {
  const [activeGateway, setActiveGateway] = useState<string>('');

  // Fetch active gateway
  useEffect(() => {
    const fetchGateway = async () => {
      try {
        const { data } = await supabase
          .from('checkout_gateway_config')
          .select('gateway')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();
        
        if (data?.gateway) {
          setActiveGateway(data.gateway);
        }
      } catch (error) {
        console.error('Error fetching gateway:', error);
      }
    };

    fetchGateway();
  }, []);

  const gatewayDisplayName = GATEWAY_NAMES[activeGateway] || 'Gateway Seguro';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* Header - Mobile Optimized */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/95 backdrop-blur-xl safe-area-inset-top">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm sm:text-base">Checkout Seguro</span>
              <p className="text-[10px] sm:text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                Ambiente Protegido
              </p>
            </div>
          </div>
          
          {showSecurityBadges && (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] sm:text-xs text-emerald-400 font-medium hidden sm:inline">Verificado</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                <Shield className="w-3 h-3 text-white/70" />
                <span className="text-[10px] sm:text-xs text-white/70 font-medium">SSL</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-safe">
        {children}
      </main>

      {/* Footer - Mobile Optimized */}
      <footer className="border-t border-white/10 bg-slate-900/90 backdrop-blur-xl py-4 sm:py-6 safe-area-inset-bottom">
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          {/* Trust Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <div className="flex items-center gap-2 p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 flex-shrink-0" />
              <div>
                <div className="text-[10px] sm:text-xs font-semibold text-white">Compra Segura</div>
                <div className="text-[9px] sm:text-[10px] text-white/50">100% Protegido</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 flex-shrink-0" />
              <div>
                <div className="text-[10px] sm:text-xs font-semibold text-white">SSL 256-bit</div>
                <div className="text-[9px] sm:text-[10px] text-white/50">Criptografia</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 flex-shrink-0" />
              <div>
                <div className="text-[10px] sm:text-xs font-semibold text-white">PIX Instantâneo</div>
                <div className="text-[9px] sm:text-[10px] text-white/50">24/7</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 flex-shrink-0" />
              <div>
                <div className="text-[10px] sm:text-xs font-semibold text-white">Garantia</div>
                <div className="text-[9px] sm:text-[10px] text-white/50">Satisfação</div>
              </div>
            </div>
          </div>
          
          {/* Payment Methods - Real Icons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] sm:text-xs text-white/50 mr-2">Formas de pagamento:</span>
            <AllPaymentIcons />
          </div>

          {/* Copyright & Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="text-[10px] sm:text-xs text-white/40">
              Processado por <span className="text-emerald-400 font-medium">{gatewayDisplayName}</span> • Ambiente 100% Seguro
            </div>
            <div className="flex items-center gap-3 text-[10px] sm:text-xs">
              <a href="/termos-de-uso" className="text-white/40 hover:text-white/60 transition">Termos</a>
              <span className="text-white/20">•</span>
              <a href="/politica-de-privacidade" className="text-white/40 hover:text-white/60 transition">Privacidade</a>
            </div>
          </div>

          {/* LGPD Notice */}
          <div className="mt-3 pt-3 border-t border-white/5 text-center">
            <p className="text-[9px] sm:text-[10px] text-white/30 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Seus dados são protegidos de acordo com a LGPD (Lei Geral de Proteção de Dados)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
