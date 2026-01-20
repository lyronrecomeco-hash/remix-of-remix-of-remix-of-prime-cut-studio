/**
 * CHECKOUT SYSTEM - Trust Badges Component
 * Selos de confiança e segurança
 */

import React from 'react';
import { Shield, Lock, CheckCircle, AlertTriangle, Clock, CreditCard, Zap, ThumbsUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgesProps {
  variant?: 'inline' | 'grid' | 'compact';
  className?: string;
}

export function TrustBadges({ variant = 'inline', className }: TrustBadgesProps) {
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center justify-center gap-4 text-white/50", className)}>
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span className="text-xs">Seguro</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-emerald-500" />
          <span className="text-xs">Criptografado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span className="text-xs">Verificado</span>
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn("grid grid-cols-2 gap-3", className)}>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Shield className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-semibold text-white">Compra Segura</div>
            <div className="text-[10px] text-white/50">100% protegido</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Lock className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-xs font-semibold text-white">SSL 256-bit</div>
            <div className="text-[10px] text-white/50">Criptografia forte</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <Clock className="w-5 h-5 text-purple-400" />
          <div>
            <div className="text-xs font-semibold text-white">PIX Instantâneo</div>
            <div className="text-[10px] text-white/50">Confirmação em segundos</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-xs font-semibold text-white">Garantia</div>
            <div className="text-[10px] text-white/50">Satisfação garantida</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-wrap items-center justify-center gap-3 sm:gap-6 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10",
      className
    )}>
      <div className="flex items-center gap-1.5">
        <Shield className="w-4 h-4 text-emerald-500" />
        <span className="text-xs text-white/70">Compra Segura</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Lock className="w-4 h-4 text-emerald-500" />
        <span className="text-xs text-white/70">SSL Ativo</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Zap className="w-4 h-4 text-emerald-500" />
        <span className="text-xs text-white/70">PIX Instantâneo</span>
      </div>
      <div className="flex items-center gap-1.5">
        <ThumbsUp className="w-4 h-4 text-emerald-500" />
        <span className="text-xs text-white/70">Garantia</span>
      </div>
    </div>
  );
}

// Alert for important information
interface CheckoutAlertProps {
  type: 'info' | 'warning' | 'success' | 'pix';
  title: string;
  message: string;
  className?: string;
}

export function CheckoutAlert({ type, title, message, className }: CheckoutAlertProps) {
  const configs = {
    info: {
      bg: 'bg-blue-500/10 border-blue-500/20',
      icon: AlertTriangle,
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-300',
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/20',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-300',
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      icon: CheckCircle,
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-300',
    },
    pix: {
      bg: 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
      icon: Zap,
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-300',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 sm:p-4 rounded-xl border",
      config.bg,
      className
    )}>
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconColor)} />
      <div>
        <h4 className={cn("text-sm font-semibold", config.titleColor)}>{title}</h4>
        <p className="text-xs text-white/60 mt-0.5">{message}</p>
      </div>
    </div>
  );
}
