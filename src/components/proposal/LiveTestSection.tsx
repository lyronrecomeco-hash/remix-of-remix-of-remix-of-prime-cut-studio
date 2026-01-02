import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Send, 
  CheckCircle2, 
  Sparkles,
  MessageCircle,
  Loader2,
  PartyPopper,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { LunaAvatar } from './LunaAvatar';
import { toast } from 'sonner';

interface LiveTestSectionProps {
  proposalId: string;
  companyName: string;
  niche: string;
  affiliateName?: string;
}

type TestState = 'intro' | 'input' | 'sending' | 'success' | 'error';

export const LiveTestSection = ({ proposalId, companyName, niche, affiliateName }: LiveTestSectionProps) => {
  const [state, setState] = useState<TestState>('intro');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lunaMessage, setLunaMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const inputRef = useRef<HTMLInputElement>(null);

  const lunaIntroMessages = [
    `Oi! Sou a Luna, sua consultora digital. 🤖✨`,
    `Já te mostrei como o Genesis transforma negócios...`,
    `Agora, quero te provar que isso funciona DE VERDADE.`,
    `Coloca seu WhatsApp aí 👇 que vou te mandar algo especial.`,
    `Em segundos. Literalmente. ⚡`
  ];

  const [currentIntroIndex, setCurrentIntroIndex] = useState(0);

  useEffect(() => {
    if (state !== 'intro') return;

    const timer = setInterval(() => {
      setCurrentIntroIndex(prev => {
        if (prev >= lunaIntroMessages.length - 1) {
          setState('input');
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [state]);

  useEffect(() => {
    if (state === 'input' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhoneNumber(formatted);
  };

  const isValidPhone = () => {
    const numbers = phoneNumber.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 11;
  };

  const sendTestMessage = async () => {
    if (!isValidPhone()) {
      toast.error('Digite um número válido');
      return;
    }

    setState('sending');
    setLunaMessage('Preparando algo especial...');

    try {
      // Formatar número
      let phone = phoneNumber.replace(/\D/g, '');
      if (!phone.startsWith('55')) {
        phone = '55' + phone;
      }

      // Mensagem personalizada
      const message = `✨ *Teste Ao Vivo - Genesis Hub*

Oi! Sou a Luna, e acabei de te enviar essa mensagem em SEGUNDOS.

Se você está vendo isso, significa que:

✅ Sua automação está funcionando
✅ Clientes seriam respondidos instantaneamente
✅ Você não perderia mais vendas por demora

Isso é só uma amostra do que o Genesis faz pela *${companyName}*.

🚀 Pronto(a) para transformar seu negócio?

_Enviado automaticamente pela IA Luna_`;

      // Chamar edge function
      const { data, error } = await supabase.functions.invoke('send-proposal-whatsapp', {
        body: { 
          proposalId,
          customPhone: phone,
          customMessage: message,
          isTest: true
        }
      });

      if (error) throw error;

      setLunaMessage('');
      setCountdown(3);
      
      // Countdown before success
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setState('success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Test message error:', err);
      setState('error');
      setLunaMessage('Ops! Algo deu errado. Mas não se preocupe, isso é só um teste. 😅');
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-16 px-4 relative"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-primary/20 rounded-full text-white text-sm mb-4 border border-emerald-500/30">
            <Zap className="w-4 h-4 text-emerald-400" />
            Experiência Ao Vivo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Quer <span className="text-primary">sentir</span> a diferença?
          </h2>
          <p className="text-white/50">
            Nada de promessas. Teste agora, no seu próprio WhatsApp.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          layout
          className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
        >
          {/* Luna Avatar */}
          <div className="flex justify-center mb-6">
            <LunaAvatar 
              state={state === 'sending' ? 'thinking' : state === 'success' ? 'confident' : 'talking'} 
              size="lg" 
            />
          </div>

          <AnimatePresence mode="wait">
            {/* INTRO STATE */}
            {state === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentIntroIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xl text-white leading-relaxed"
                  >
                    {lunaIntroMessages[currentIntroIndex]}
                  </motion.p>
                </AnimatePresence>
                
                {/* Typing indicator */}
                <motion.div 
                  className="flex justify-center gap-1 mt-6"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-primary rounded-full" />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* INPUT STATE */}
            {state === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <p className="text-center text-white text-lg mb-6">
                  Digite seu WhatsApp e receba uma mensagem <span className="text-primary font-bold">instantânea</span>:
                </p>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    ref={inputRef}
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="w-full h-14 pl-12 pr-4 text-lg bg-white/5 border-white/20 text-white placeholder:text-white/30 rounded-xl focus:border-primary focus:ring-primary"
                    maxLength={15}
                  />
                </div>

                <Button
                  onClick={sendTestMessage}
                  disabled={!isValidPhone()}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-emerald-500 hover:opacity-90 rounded-xl gap-3 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  Testar Agora
                </Button>

                <p className="text-center text-white/30 text-sm">
                  🔒 Seu número não será armazenado
                </p>
              </motion.div>
            )}

            {/* SENDING STATE */}
            {state === 'sending' && (
              <motion.div
                key="sending"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 mx-auto mb-6"
                >
                  <Loader2 className="w-16 h-16 text-primary" />
                </motion.div>
                
                <p className="text-white text-lg">{lunaMessage || 'Enviando...'}</p>
                
                {countdown > 0 && countdown < 3 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4"
                  >
                    <span className="text-5xl font-bold text-primary">{countdown}</span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* SUCCESS STATE */}
            {state === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </motion.div>

                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white mb-3"
                >
                  Mensagem Enviada! 🎉
                </motion.h3>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/60 mb-6"
                >
                  Confere seu WhatsApp agora. Isso levou <span className="text-primary font-bold">menos de 3 segundos</span>.
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <p className="text-white/80 text-sm">
                    💡 <span className="font-medium">Imagina</span> isso acontecendo com cada cliente que entra em contato com a {companyName}.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3 mt-6"
                >
                  <Button
                    onClick={() => {
                      setState('input');
                      setPhoneNumber('');
                    }}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Testar Novamente
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* ERROR STATE */}
            {state === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>

                <p className="text-white text-lg mb-2">{lunaMessage}</p>
                <p className="text-white/50 text-sm mb-6">
                  O sistema de WhatsApp pode estar offline no momento.
                </p>

                <Button
                  onClick={() => {
                    setState('input');
                    setLunaMessage('');
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  Tentar Novamente
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          {[
            { icon: '🔒', text: 'Dados seguros' },
            { icon: '⚡', text: 'Resposta < 3s' },
            { icon: '🤖', text: '100% automático' }
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <span>{badge.icon}</span>
              <span className="text-white/60 text-sm">{badge.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default LiveTestSection;
