/**
 * CHECKOUT SYSTEM - Account Created Modal
 * Modal de confirmação após criação de conta
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Shield, 
  ArrowRight,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AccountCreatedModalProps {
  open: boolean;
  email: string;
  password: string;
  planName?: string;
  credits?: number;
  onContinue: () => void;
}

export const AccountCreatedModal = ({ 
  open, 
  email, 
  password, 
  planName = 'Básico',
  credits = 300,
  onContinue 
}: AccountCreatedModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const maskedPassword = '•'.repeat(password.length);

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-md p-0 overflow-hidden border-0 bg-[hsl(220,20%,8%)]" 
        hideClose
      >
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative p-8"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                </div>
                {/* Pulse rings */}
                <motion.div
                  className="absolute inset-0 w-20 h-20 rounded-full border-2 border-emerald-500/30"
                  animate={{ scale: [1, 1.3, 1.3], opacity: [0.5, 0, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-6"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Conta Criada com Sucesso! 🎉
              </h2>
              <p className="text-white/60 text-sm">
                Sua conta Genesis IA está pronta para uso
              </p>
            </motion.div>

            {/* Credentials Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-white/10 bg-white/5 p-4 mb-4 space-y-3"
            >
              {/* Email */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Email</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-mono">{email}</span>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                  >
                    {copiedEmail ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/40" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Senha</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-mono">
                    {showPassword ? password : maskedPassword}
                  </span>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-white/40" />
                    ) : (
                      <Eye className="w-4 h-4 text-white/40" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Plan & Credits Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid grid-cols-2 gap-3 mb-4"
            >
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-white/60">Plano</span>
                </div>
                <span className="text-sm font-semibold text-white capitalize">{planName}</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-white/60">Créditos</span>
                </div>
                <span className="text-sm font-semibold text-emerald-400">+{credits} grátis</span>
              </div>
            </motion.div>

            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-6"
            >
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-400 mb-1">
                    Observação de Segurança
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Guarde sua senha em local seguro. Não compartilhe suas credenciais com terceiros.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Button
                onClick={onContinue}
                className={cn(
                  "w-full h-14 rounded-xl font-semibold text-white",
                  "bg-gradient-to-r from-emerald-500 to-emerald-600",
                  "hover:from-emerald-600 hover:to-emerald-700",
                  "shadow-lg shadow-emerald-500/20",
                  "transition-all flex items-center justify-center gap-2"
                )}
              >
                Acessar Genesis IA
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
