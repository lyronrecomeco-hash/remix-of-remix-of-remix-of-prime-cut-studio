/**
 * CHECKOUT SYSTEM - Countdown Bar Component
 * Barra de contagem regressiva fixa no topo - SEMPRE VERMELHO
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Timer } from 'lucide-react';
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-2.5 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Tempo esgotado! A oferta expirou.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 py-2.5 px-4 bg-red-600 text-white"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-lg mx-auto flex items-center justify-center gap-3">
        <Timer className={cn("w-5 h-5", isCritical && "animate-pulse")} />
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium opacity-90">Oferta expira em:</span>
          <span className={cn(
            "font-mono text-lg sm:text-xl font-bold tabular-nums bg-black/20 px-2 py-0.5 rounded",
            isCritical && "animate-pulse"
          )}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
        <span className="hidden sm:block text-xs opacity-75">• Aproveite agora!</span>
      </div>
    </div>
  );
}
