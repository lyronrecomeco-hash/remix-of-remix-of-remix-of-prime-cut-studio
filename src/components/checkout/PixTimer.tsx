/**
 * CHECKOUT SYSTEM - PIX Timer Component
 * Contador regressivo para expiração do PIX
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PixTimerProps {
  expiresAt: string;
  onExpire: () => void;
}

export function PixTimer({ expiresAt, onExpire }: PixTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = Math.max(0, expiry - now);
    return Math.floor(diff / 1000);
  }, [expiresAt]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0 && !isExpired) {
        setIsExpired(true);
        onExpire();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, isExpired, onExpire]);

  const totalSeconds = 10 * 60; // 10 minutos
  const progress = Math.max(0, (timeLeft / totalSeconds) * 100);
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isWarning = timeLeft < 120; // Menos de 2 minutos
  const isCritical = timeLeft < 60; // Menos de 1 minuto

  if (isExpired) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h4 className="font-medium text-red-400">PIX Expirado</h4>
            <p className="text-sm text-white/60">
              O tempo para pagamento terminou
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all",
      isCritical
        ? "border-red-500/30 bg-red-500/10"
        : isWarning
        ? "border-yellow-500/30 bg-yellow-500/10"
        : "border-white/10 bg-white/5"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className={cn(
            "w-4 h-4",
            isCritical ? "text-red-400" : isWarning ? "text-yellow-400" : "text-white/60"
          )} />
          <span className="text-sm text-white/60">Tempo restante</span>
        </div>
        <div className={cn(
          "font-mono text-2xl font-bold tabular-nums",
          isCritical ? "text-red-400" : isWarning ? "text-yellow-400" : "text-white"
        )}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-linear",
            isCritical
              ? "bg-gradient-to-r from-red-500 to-red-400"
              : isWarning
              ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
              : "bg-gradient-to-r from-emerald-500 to-emerald-400"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Warning message */}
      {isWarning && !isCritical && (
        <p className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Menos de 2 minutos para expirar
        </p>
      )}
      
      {isCritical && (
        <p className="mt-2 text-xs text-red-400 flex items-center gap-1 animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          Finalize o pagamento agora!
        </p>
      )}
    </div>
  );
}
