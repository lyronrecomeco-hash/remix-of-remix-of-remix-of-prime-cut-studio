/**
 * CHECKOUT SYSTEM - Success Page
 * Página intermediária que redireciona para /checkout/complete
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

import { CheckoutLayout } from '@/components/checkout/CheckoutLayout';
import { getPaymentByCode } from '@/lib/checkout/api';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');
  
  const [isLoading, setIsLoading] = useState(true);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    async function loadPaymentAndRedirect() {
      if (!code) {
        navigate('/');
        return;
      }

      // Buscar dados do pagamento para pegar o email
      const data = await getPaymentByCode(code);
      
      if (data?.customerEmail) {
        setCustomerEmail(data.customerEmail);
      }
      
      setIsLoading(false);

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
    }

    loadPaymentAndRedirect();
  }, [code, navigate]);

  // Countdown e redirect automático
  useEffect(() => {
    if (isLoading || !customerEmail) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirecionar para página de criar senha
          navigate(`/checkout/complete?email=${encodeURIComponent(customerEmail)}&code=${code}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, customerEmail, code, navigate]);

  return (
    <CheckoutLayout showSecurityBadges={false}>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          {/* Success Icon */}
          <div className="relative mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
            </motion.div>
            
            {/* Pulse animation */}
            <motion.div 
              className="absolute inset-0 w-24 h-24 rounded-full bg-emerald-500/20 mx-auto"
              animate={{ scale: [1, 1.3, 1.3], opacity: [0.5, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-white mb-3"
          >
            Pagamento Confirmado! 🎉
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 mb-8"
          >
            Seu pagamento foi processado com sucesso.
          </motion.p>

          {/* Loading/Redirect Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6 mb-6"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              <span className="text-white">Criando sua conta...</span>
            </div>
            
            <p className="text-sm text-white/50">
              Você será redirecionado em <span className="text-emerald-400 font-bold">{countdown}</span> segundos
            </p>
          </motion.div>

          {/* Manual redirect link */}
          {customerEmail && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => navigate(`/checkout/complete?email=${encodeURIComponent(customerEmail)}&code=${code}`)}
              className="text-sm text-white/40 hover:text-white/60 underline underline-offset-4 transition-colors"
            >
              Clique aqui se não for redirecionado
            </motion.button>
          )}
        </motion.div>
      </div>
    </CheckoutLayout>
  );
}
