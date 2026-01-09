import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { use2FA } from '@/hooks/use2FA';

interface TwoFactorVerifyProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TwoFactorVerify({ userId, onSuccess, onCancel }: TwoFactorVerifyProps) {
  const { verifyCode, isLoading, error } = use2FA();
  const [code, setCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await verifyCode(userId, code);
    if (isValid) {
      onSuccess();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Verificação em 2 Etapas</h2>
        <p className="text-sm text-muted-foreground">
          {useBackup 
            ? 'Digite um dos seus códigos de backup'
            : 'Digite o código do seu aplicativo autenticador'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            inputMode={useBackup ? 'text' : 'numeric'}
            pattern={useBackup ? undefined : '[0-9]*'}
            maxLength={useBackup ? 8 : 6}
            placeholder={useBackup ? 'XXXXXXXX' : '000000'}
            value={code}
            onChange={(e) => setCode(useBackup ? e.target.value : e.target.value.replace(/\D/g, ''))}
            className="pl-12 text-center text-xl tracking-widest font-mono h-14"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button
          type="submit"
          variant="hero"
          className="w-full h-12"
          disabled={code.length < (useBackup ? 8 : 6) || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Verificando...
            </>
          ) : (
            'Verificar'
          )}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setUseBackup(!useBackup);
              setCode('');
            }}
            className="text-primary hover:underline"
          >
            {useBackup ? 'Usar código do app' : 'Usar código de backup'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </button>
        </div>
      </form>
    </motion.div>
  );
}
