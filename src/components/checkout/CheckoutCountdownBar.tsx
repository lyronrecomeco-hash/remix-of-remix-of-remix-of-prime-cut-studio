/**
 * CHECKOUT SYSTEM - Countdown Bar Component
 * Barra de contagem regressiva fixa no topo
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutCountdownBarProps {
  expiresAt?: string;
  defaultMinutes?: number;
  onExpire?: () => void;
}

export function CheckoutCountdownBar({ 
  expiresAt, 
  defaultMinutes = 10,
  onExpire 
}: CheckoutCountdownBarProps) {
  const [timeLeft, setTimeLeft] = useState<number>(defaultMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    if (expiresAt) {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, expiry - now);
      return Math.floor(diff / 1000);
    }
    return timeLeft;
  }, [expiresAt, timeLeft]);

  useEffect(() => {
    if (expiresAt) {
      setTimeLeft(calculateTimeLeft());
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = expiresAt ? calculateTimeLeft() : Math.max(0, prev - 1);
        
        if (newTime <= 0 && !isExpired) {
          setIsExpired(true);
          onExpire?.();
          clearInterval(timer);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, expiresAt, isExpired, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isWarning = timeLeft < 120; // Menos de 2 minutos
  const isCritical = timeLeft < 60; // Menos de 1 minuto

  if (isExpired) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-2 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Tempo esgotado! A oferta expirou.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 py-2.5 px-4 transition-colors duration-300",
      isCritical 
        ? "bg-red-600 animate-pulse" 
        : isWarning 
        ? "bg-orange-500" 
        : "bg-emerald-600"
    )}>
      <div className="max-w-lg mx-auto flex items-center justify-center gap-3">
        <Clock className="w-5 h-5 text-white" />
        <span className={cn(
          "font-mono text-xl font-bold tabular-nums text-white",
          isCritical && "animate-pulse"
        )}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-white/90 text-sm font-medium hidden sm:block">
          Oferta por tempo limitado
        </span>
        <span className="text-white/90 text-sm font-medium sm:hidden">
          Oferta limitada
        </span>
      </div>
    </div>
  );
}
