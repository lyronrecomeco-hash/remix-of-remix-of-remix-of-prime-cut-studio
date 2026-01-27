/**
 * Seção de Saque para Usuários Promocionais (Influencers/Parceiros)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Banknote, 
  Send, 
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WithdrawalSectionProps {
  userId: string;
  availableBalance: number;
  onWithdrawalSubmitted?: () => void;
}

type PixType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

const PIX_TYPE_LABELS: Record<PixType, string> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  email: 'E-mail',
  phone: 'Telefone',
  random: 'Chave Aleatória',
};

export function WithdrawalSection({ 
  userId, 
  availableBalance, 
  onWithdrawalSubmitted 
}: WithdrawalSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    holderName: '',
    pixType: '' as PixType | '',
    pixKey: '',
    amount: '',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.holderName.trim()) {
      toast.error('Informe o nome do titular');
      return;
    }
    if (!formData.pixType) {
      toast.error('Selecione o tipo de chave PIX');
      return;
    }
    if (!formData.pixKey.trim()) {
      toast.error('Informe a chave PIX');
      return;
    }
    
    const amount = parseFloat(formData.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    if (amount > availableBalance) {
      toast.error('Valor excede o saldo disponível');
      return;
    }
    if (amount < 50) {
      toast.error('Valor mínimo para saque: R$ 50,00');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('promotional_withdrawals').insert({
        promotional_user_id: userId,
        holder_name: formData.holderName.trim(),
        pix_type: formData.pixType,
        pix_key: formData.pixKey.trim(),
        amount: amount,
        status: 'pending',
        requested_at: new Date().toISOString(),
      });

      if (error) throw error;

      setShowSuccessModal(true);
      setFormData({ holderName: '', pixType: '', pixKey: '', amount: '' });
      onWithdrawalSubmitted?.();
    } catch (error) {
      console.error('Erro ao solicitar saque:', error);
      toast.error('Erro ao solicitar saque. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="border border-white/[0.08] bg-[hsl(215_30%_12%)]" style={{ borderRadius: '14px' }}>
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Solicitar Saque</h3>
                <p className="text-sm text-white/50">Receba suas comissões via PIX</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/50">Saldo disponível</p>
              <p className="text-xl font-bold text-emerald-400">{formatCurrency(availableBalance)}</p>
            </div>
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            {/* Nome do Titular */}
            <div className="space-y-2">
              <Label className="text-white/70">Nome do Titular *</Label>
              <Input
                placeholder="Nome completo como no banco"
                value={formData.holderName}
                onChange={(e) => setFormData(prev => ({ ...prev, holderName: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                style={{ borderRadius: '10px' }}
              />
            </div>

            {/* Tipo de Chave PIX */}
            <div className="space-y-2">
              <Label className="text-white/70">Tipo de Chave PIX *</Label>
              <Select
                value={formData.pixType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, pixType: value as PixType }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white" style={{ borderRadius: '10px' }}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PIX_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chave PIX */}
            <div className="space-y-2">
              <Label className="text-white/70">Chave PIX *</Label>
              <Input
                placeholder="Digite sua chave PIX"
                value={formData.pixKey}
                onChange={(e) => setFormData(prev => ({ ...prev, pixKey: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                style={{ borderRadius: '10px' }}
              />
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label className="text-white/70">Valor do Saque *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">R$</span>
                <Input
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  style={{ borderRadius: '10px' }}
                />
              </div>
              <p className="text-xs text-white/40">Mínimo: R$ 50,00</p>
            </div>

            {/* Botão de Saque */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || availableBalance < 50}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
              style={{ borderRadius: '10px' }}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmitting ? 'Processando...' : 'Solicitar Saque'}
            </Button>

            {availableBalance < 50 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-300">
                    Saldo mínimo para saque: R$ 50,00
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Sucesso */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-[hsl(215_30%_12%)] border-white/10">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Clock className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-white">Saque Solicitado!</DialogTitle>
            <DialogDescription className="text-center text-white/60">
              Sua solicitação de saque foi registrada com sucesso.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
              <p className="text-sm text-white/50 mb-1">Prazo de processamento</p>
              <p className="text-xl font-bold text-white">Até 24 horas úteis</p>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-300">
                Fique tranquilo! Você receberá uma notificação quando o pagamento for efetuado.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setShowSuccessModal(false)} 
              className="w-full"
              style={{ borderRadius: '10px' }}
            >
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
