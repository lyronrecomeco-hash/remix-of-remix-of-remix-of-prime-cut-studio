/**
 * CHECKOUT SYSTEM - Layout Component
 * Layout base para todas as páginas de checkout
 */

import React from 'react';
import { Shield, Lock, CreditCard } from 'lucide-react';

interface CheckoutLayoutProps {
  children: React.ReactNode;
  showSecurityBadges?: boolean;
}

export function CheckoutLayout({ children, showSecurityBadges = true }: CheckoutLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Checkout Seguro</span>
          </div>
          
          {showSecurityBadges && (
            <div className="flex items-center gap-4 text-xs text-white/60">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span className="hidden sm:inline">SSL</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span className="hidden sm:inline">Seguro</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/50 backdrop-blur-xl py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Security Badges */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white/60">
                <Shield className="w-5 h-5 text-emerald-500" />
                <div className="text-xs">
                  <div className="font-medium text-white/80">Compra Segura</div>
                  <div>Dados protegidos</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-white/60">
                <Lock className="w-5 h-5 text-emerald-500" />
                <div className="text-xs">
                  <div className="font-medium text-white/80">Criptografia</div>
                  <div>SSL 256-bit</div>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-xs text-white/40">
              Processado por AbacatePay • Ambiente Seguro
            </div>
          </div>

          {/* LGPD Notice */}
          <div className="mt-4 pt-4 border-t border-white/5 text-center">
            <p className="text-xs text-white/40">
              Seus dados são protegidos de acordo com a LGPD (Lei Geral de Proteção de Dados).
              Ao prosseguir, você concorda com nossa{' '}
              <a href="#" className="text-emerald-400 hover:underline">Política de Privacidade</a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
