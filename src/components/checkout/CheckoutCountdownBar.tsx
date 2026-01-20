/**
 * CHECKOUT SYSTEM - Countdown Bar Component
 * Barra de contagem regressiva fixa no topo
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutCountdownBarProps {
  expiresAt?: string;
  defaultMinutes?: number;
  onExpire?: () => void;
}

function secondsUntil(iso: string) {
  const now = Date.now();
  const expiry = new Date(iso).getTime();
  const diff = Math.max(0, expiry - now);
  return Math.floor(diff / 1000);
}

export function CheckoutCountdownBar({
  expiresAt,
  defaultMinutes = 10,
  onExpire,
}: CheckoutCountdownBarProps) {
  const initialSeconds = useMemo(() => {
    if (expiresAt) return secondsUntil(expiresAt);
    return defaultMinutes * 60;
  }, [expiresAt, defaultMinutes]);

  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isExpired, setIsExpired] = useState(false);

  const hasExpiredRef = useRef(false);

  // Reset when input changes
  useEffect(() => {
    hasExpiredRef.current = false;
    setIsExpired(false);
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  // Tick
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        const next = expiresAt ? secondsUntil(expiresAt) : Math.max(0, prev - 1);

        if (next <= 0 && !hasExpiredRef.current) {
          hasExpiredRef.current = true;
          setIsExpired(true);
          onExpire?.();
        }

        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isCritical = timeLeft < 60;

  if (isExpired) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-2 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Tempo esgotado! A oferta expirou.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-2.5 px-4 transition-colors duration-300 bg-destructive text-destructive-foreground",
        isCritical && "animate-pulse"
      )}
      role="status"
      aria-live="polite"
    >
      <div className="max-w-lg mx-auto flex items-center justify-center gap-3">
        <Clock className="w-5 h-5" />
        <span className={cn("font-mono text-xl font-bold tabular-nums", isCritical && "animate-pulse")}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-sm font-medium hidden sm:block opacity-90">Oferta por tempo limitado</span>
        <span className="text-sm font-medium sm:hidden opacity-90">Oferta limitada</span>
      </div>
    </div>
  );
}

