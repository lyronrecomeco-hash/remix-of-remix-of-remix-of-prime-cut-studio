import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Clock, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrialInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  expiresAt: string;
}

export function TrialInfoModal({ isOpen, onClose, expiresAt }: TrialInfoModalProps) {
  const expiry = new Date(expiresAt);
  const formattedDate = expiry.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Seu Período de Teste
          </DialogTitle>
          <DialogDescription>
            Informações sobre seu acesso ao Genesis Hub
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-sm">Mentorado Santiago — Trial</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Você está utilizando um acesso de teste de <strong>3 dias</strong>. 
              Após esse período, o acesso será bloqueado automaticamente.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
            <p className="text-xs text-muted-foreground">Seu acesso expira em:</p>
            <p className="text-lg font-bold text-foreground mt-1">{formattedDate}</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Garanta seu acesso!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Assine um plano para manter todas as funcionalidades ativas e continue crescendo.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
