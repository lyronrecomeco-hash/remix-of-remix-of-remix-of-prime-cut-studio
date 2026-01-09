import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageSquare, Loader2, CheckCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface PhoneVerificationProps {
  phone: string;
  email?: string;
  name?: string;
  passwordHash?: string;
  onVerified: (data: { phone: string; email?: string; name?: string }) => void;
  onBack: () => void;
  onResend?: () => void;
}

export function PhoneVerification({
  phone,
  email,
  name,
  passwordHash,
  onVerified,
  onBack,
  onResend,
}: PhoneVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take only last character
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (fullCode?: string) => {
    const codeToVerify = fullCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      setError('Digite o código completo');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: verifyError } = await supabase.functions.invoke('verify-phone-code', {
        body: { phone, code: codeToVerify },
      });

      if (verifyError || !data?.success) {
        setError(data?.error || 'Código inválido');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      setSuccess(true);
      
      // Wait for animation then callback
      setTimeout(() => {
        onVerified({
          phone: data.data.phone,
          email: data.data.email,
          name: data.data.name,
        });
      }, 1500);
    } catch (err) {
      console.error('Verification error:', err);
      setError('Erro ao verificar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsResending(true);
    setError('');

    try {
      const { data, error: sendError } = await supabase.functions.invoke('send-phone-verification', {
        body: { phone, email, name, passwordHash },
      });

      if (sendError || !data?.success) {
        setError(data?.error || 'Erro ao reenviar código');
        return;
      }

      setCountdown(60);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
      onResend?.();
    } catch (err) {
      console.error('Resend error:', err);
      setError('Erro ao reenviar código');
    } finally {
      setIsResending(false);
    }
  };

  const formatPhone = (p: string) => {
    const clean = p.replace(/\D/g, '');
    if (clean.length === 13 && clean.startsWith('55')) {
      const ddd = clean.slice(2, 4);
      const part1 = clean.slice(4, 9);
      const part2 = clean.slice(9);
      return `(${ddd}) ${part1}-${part2}`;
    }
    return p;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
            ) : (
              <motion.div
                key="phone"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <MessageSquare className="w-10 h-10 text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <h2 className="text-xl font-bold text-foreground">
          {success ? 'Verificado!' : 'Verifique seu WhatsApp'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {success 
            ? 'Seu número foi verificado com sucesso'
            : `Enviamos um código de 6 dígitos para ${formatPhone(phone)}`
          }
        </p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30"
          >
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code Input */}
      {!success && (
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  className={`
                    w-12 h-14 text-center text-2xl font-bold
                    bg-secondary/50 border-2 
                    focus:border-primary focus:ring-primary/20
                    transition-all duration-200
                    ${digit ? 'border-primary/50 bg-primary/5' : 'border-border'}
                    ${error ? 'border-destructive/50 animate-shake' : ''}
                  `}
                />
              </motion.div>
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={() => handleVerify()}
            disabled={code.join('').length !== 6 || isLoading}
            className="w-full h-12"
            variant="hero"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Verificando...
              </>
            ) : (
              'Verificar Código'
            )}
          </Button>

          {/* Resend */}
          <div className="text-center">
            {canResend ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={isResending}
                className="text-primary"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reenviar código
                  </>
                )}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Reenviar código em{' '}
                <span className="font-mono font-bold text-primary">
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                </span>
              </p>
            )}
          </div>

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar e corrigir número
          </Button>
        </div>
      )}

      {/* Success Animation */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-4"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              className="h-1 bg-gradient-to-r from-primary to-green-500 rounded-full"
            />
            <p className="text-sm text-muted-foreground animate-pulse">
              Criando sua conta...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default PhoneVerification;
