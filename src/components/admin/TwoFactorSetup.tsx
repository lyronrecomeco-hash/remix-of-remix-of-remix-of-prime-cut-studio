import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Copy, Check, AlertTriangle, Loader2, X, QrCode, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { use2FA } from '@/hooks/use2FA';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TwoFactorSetup({ isOpen, onClose }: TwoFactorSetupProps) {
  const { user } = useAuth();
  const { notify } = useNotification();
  const { getStatus, generateSecret, enable2FA, disable2FA, getBackupCodes, isLoading, error } = use2FA();
  
  const [step, setStep] = useState<'loading' | 'status' | 'setup' | 'verify' | 'backup'>('loading');
  const [isEnabled, setIsEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadStatus();
    }
  }, [isOpen, user]);

  const loadStatus = async () => {
    if (!user) return;
    setStep('loading');
    
    const status = await getStatus(user.id);
    setIsEnabled(status.isEnabled);
    
    if (status.isEnabled) {
      const codes = await getBackupCodes(user.id);
      setBackupCodes(codes);
    }
    
    setStep('status');
  };

  const handleStartSetup = async () => {
    if (!user) return;
    
    const result = await generateSecret(user.id);
    if (result) {
      setSecret(result.secret);
      setQrCode(result.qrCode);
      setStep('setup');
    }
  };

  const handleVerify = async () => {
    if (!user || verificationCode.length !== 6) return;
    
    const success = await enable2FA(user.id, verificationCode);
    if (success) {
      const codes = await getBackupCodes(user.id);
      setBackupCodes(codes);
      setIsEnabled(true);
      setStep('backup');
      notify.success('2FA ativado com sucesso!');
    }
  };

  const handleDisable = async () => {
    if (!user) return;
    
    const success = await disable2FA(user.id);
    if (success) {
      setIsEnabled(false);
      notify.success('2FA desativado');
      onClose();
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    notify.success('Códigos copiados!');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Autenticação 2FA</h2>
                <p className="text-sm text-muted-foreground">Proteção adicional</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 'loading' && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {step === 'status' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-xl ${isEnabled ? 'bg-green-500/10 border border-green-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
                <div className="flex items-center gap-3">
                  {isEnabled ? (
                    <>
                      <Check className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-500">2FA Ativado</p>
                        <p className="text-sm text-muted-foreground">Sua conta está protegida</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-yellow-500">2FA Desativado</p>
                        <p className="text-sm text-muted-foreground">Recomendamos ativar para maior segurança</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {isEnabled && backupCodes.length > 0 && (
                <div className="p-4 bg-secondary rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Códigos de backup</span>
                    <span className="text-xs text-muted-foreground">{backupCodes.length} restantes</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyBackupCodes}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar códigos
                  </Button>
                </div>
              )}

              <div className="flex gap-3">
                {isEnabled ? (
                  <Button variant="destructive" className="flex-1" onClick={handleDisable} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Desativar 2FA'}
                  </Button>
                ) : (
                  <Button variant="hero" className="flex-1" onClick={handleStartSetup} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Configurar 2FA'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 'setup' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Escaneie o QR Code com seu aplicativo autenticador (Google Authenticator, Authy, etc.)
                </p>
                
                <div className="w-48 h-48 mx-auto bg-white rounded-xl p-2 mb-4">
                  <img src={qrCode} alt="QR Code 2FA" className="w-full h-full" />
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  Ou insira o código manualmente:
                </div>
                
                <div className="flex items-center gap-2 justify-center">
                  <code className="px-3 py-2 bg-secondary rounded-lg font-mono text-sm">
                    {secret}
                  </code>
                  <button
                    onClick={copySecret}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    {copiedSecret ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button variant="hero" className="w-full" onClick={() => setStep('verify')}>
                Próximo
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <Key className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Digite o código de 6 dígitos do seu aplicativo autenticador
                </p>
              </div>

              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest font-mono"
              />

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('setup')}>
                  Voltar
                </Button>
                <Button 
                  variant="hero" 
                  className="flex-1" 
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6 || isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar e Ativar'}
                </Button>
              </div>
            </div>
          )}

          {step === 'backup' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">2FA Ativado!</h3>
                <p className="text-sm text-muted-foreground">
                  Salve seus códigos de backup em um lugar seguro. Eles serão necessários caso você perca acesso ao seu autenticador.
                </p>
              </div>

              <div className="bg-secondary rounded-xl p-4">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, i) => (
                    <code key={i} className="text-sm font-mono text-center py-1 bg-background rounded">
                      {code}
                    </code>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={copyBackupCodes}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Códigos
              </Button>

              <Button variant="hero" className="w-full" onClick={onClose}>
                Concluir
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
