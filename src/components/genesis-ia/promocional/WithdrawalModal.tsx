import { useState } from 'react';
import { Loader2, Wallet, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotionalUserId: string;
  availableBalance: number;
  onSuccess: () => void;
}

const PIX_TYPES = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Celular' },
  { value: 'random', label: 'Chave Aleatória' },
];

export const WithdrawalModal = ({
  isOpen,
  onClose,
  promotionalUserId,
  availableBalance,
  onSuccess,
}: WithdrawalModalProps) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    holderName: '',
    pixType: '',
    pixKey: '',
    amount: '',
  });

  const handleSubmit = async () => {
    const amount = parseFloat(formData.amount);
    
    if (!formData.holderName || !formData.pixType || !formData.pixKey) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (isNaN(amount) || amount < 100) {
      toast.error('Valor mínimo para saque é R$ 100');
      return;
    }

    if (amount > availableBalance) {
      toast.error('Saldo insuficiente');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('promotional_withdrawals').insert({
        promotional_user_id: promotionalUserId,
        holder_name: formData.holderName,
        pix_type: formData.pixType,
        pix_key: formData.pixKey,
        amount: amount,
        status: 'pending',
      });

      if (error) throw error;

      // Update available balance
      await supabase
        .from('promotional_users')
        .update({ 
          available_balance: availableBalance - amount,
          pending_balance: amount 
        })
        .eq('id', promotionalUserId);

      setStep('success');
      onSuccess();
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(error.message || 'Erro ao solicitar saque');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({ holderName: '', pixType: '', pixKey: '', amount: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Solicitar Saque
              </DialogTitle>
              <DialogDescription>
                Saldo disponível: <span className="font-semibold text-emerald-400">R$ {availableBalance.toFixed(2)}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo do Titular *</Label>
                <Input
                  placeholder="Nome completo"
                  value={formData.holderName}
                  onChange={(e) => setFormData(p => ({ ...p, holderName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Chave PIX *</Label>
                <Select
                  value={formData.pixType}
                  onValueChange={(v) => setFormData(p => ({ ...p, pixType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PIX_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chave PIX *</Label>
                <Input
                  placeholder="Digite sua chave PIX"
                  value={formData.pixKey}
                  onChange={(e) => setFormData(p => ({ ...p, pixKey: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Valor do Saque (mín. R$ 100) *</Label>
                <Input
                  type="number"
                  min="100"
                  max={availableBalance}
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Solicitar Saque
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                Saque Solicitado!
              </DialogTitle>
            </DialogHeader>

            <div className="py-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                <Wallet className="w-10 h-10 text-emerald-400" />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  R$ {parseFloat(formData.amount).toFixed(2)}
                </p>
                <p className="text-muted-foreground text-sm">
                  Seu saque foi solicitado com sucesso!
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">⏰ Prazo de processamento</p>
                <p>
                  Seu saque será processado em até <span className="font-semibold text-primary">24 horas úteis</span>. 
                  Fique tranquilo, você receberá uma notificação assim que o pagamento for efetuado.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">Entendi</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
