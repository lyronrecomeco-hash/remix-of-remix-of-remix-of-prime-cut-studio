import { useState } from 'react';
import { Loader2, UserPlus, Copy, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface CreatePromotionalUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultCommissionRate: number;
}

const USER_TYPES = [
  { value: 'influencer', label: 'Influenciador' },
  { value: 'partner', label: 'Parceiro' },
];

export const CreatePromotionalUserModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultCommissionRate,
}: CreatePromotionalUserModalProps) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    type: 'influencer',
    commissionRate: defaultCommissionRate.toString(),
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.whatsapp) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('create-promotional-user', {
        body: {
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp,
          type: formData.type,
          commissionRate: parseFloat(formData.commissionRate),
        },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);

      setCreatedUser(response.data.user);
      setWelcomeMessage(response.data.welcomeMessage);
      setStep('success');
      onSuccess();
    } catch (error: any) {
      console.error('Create user error:', error);
      toast.error(error.message || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(welcomeMessage);
      setCopied(true);
      toast.success('Mensagem copiada!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      name: '',
      email: '',
      whatsapp: '',
      type: 'influencer',
      commissionRate: defaultCommissionRate.toString(),
    });
    setCreatedUser(null);
    setWelcomeMessage('');
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Criar Usuário Promocional
              </DialogTitle>
              <DialogDescription>
                Crie acesso gratuito para influenciadores e parceiros
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  placeholder="Nome do influenciador/parceiro"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>WhatsApp *</Label>
                <Input
                  placeholder="11999999999"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(p => ({ ...p, whatsapp: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Comissão por Indicação (%)</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  placeholder="10"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData(p => ({ ...p, commissionRate: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Criar Usuário
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                Usuário Criado com Sucesso!
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-emerald-400">Dados do Acesso</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{createdUser?.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Senha:</span>
                    <p className="font-medium font-mono">{createdUser?.password}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Código:</span>
                    <p className="font-medium font-mono">{createdUser?.referral_code}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Comissão:</span>
                    <p className="font-medium">{createdUser?.commission_rate}%</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Mensagem de Boas-vindas</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="gap-1"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={welcomeMessage}
                  className="min-h-[200px] text-xs font-mono bg-muted/50"
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">Fechar</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
