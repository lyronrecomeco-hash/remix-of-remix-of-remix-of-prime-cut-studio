import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, FileText, User, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatPhone } from '@/hooks/usePhoneMask';
import { formatCNPJ, formatCurrency } from '@/hooks/useInputMasks';
import type { CreateProposalData, AffiliateProposal } from './types';

interface CreateProposalModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProposalData) => Promise<unknown>;
  loading?: boolean;
  editingProposal?: AffiliateProposal | null;
}

export function CreateProposalModal({ open, onClose, onSubmit, loading, editingProposal }: CreateProposalModalProps) {
  const [formData, setFormData] = useState<CreateProposalData>({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_cnpj: '',
    contact_name: '',
    notes: '',
    proposal_value: 0,
  });

  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [cnpjDisplay, setCnpjDisplay] = useState('');
  const [valueDisplay, setValueDisplay] = useState('');

  // Reset or populate form when modal opens
  useEffect(() => {
    if (open) {
      if (editingProposal) {
        setFormData({
          company_name: editingProposal.company_name || '',
          company_email: editingProposal.company_email || '',
          company_phone: editingProposal.company_phone || '',
          company_cnpj: editingProposal.company_cnpj || '',
          contact_name: editingProposal.contact_name || '',
          notes: editingProposal.notes || '',
          proposal_value: editingProposal.proposal_value || 0,
        });
        setPhoneDisplay(formatPhone(editingProposal.company_phone || ''));
        setCnpjDisplay(formatCNPJ(editingProposal.company_cnpj || ''));
        setValueDisplay(editingProposal.proposal_value ? formatCurrency(editingProposal.proposal_value) : '');
      } else {
        setFormData({
          company_name: '',
          company_email: '',
          company_phone: '',
          company_cnpj: '',
          contact_name: '',
          notes: '',
          proposal_value: 0,
        });
        setPhoneDisplay('');
        setCnpjDisplay('');
        setValueDisplay('');
      }
    }
  }, [open, editingProposal]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '').slice(0, 11);
    setPhoneDisplay(formatPhone(digits));
    setFormData(prev => ({ ...prev, company_phone: digits }));
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '').slice(0, 14);
    setCnpjDisplay(formatCNPJ(digits));
    setFormData(prev => ({ ...prev, company_cnpj: digits }));
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '');
    const numValue = parseInt(digits, 10) / 100 || 0;
    setValueDisplay(formatCurrency(numValue));
    setFormData(prev => ({ ...prev, proposal_value: numValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name.trim()) return;
    
    const result = await onSubmit(formData);
    if (result) {
      onClose();
    }
  };

  const isEditing = !!editingProposal;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {isEditing ? 'Editar Proposta' : 'Nova Proposta Empresarial'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name" className="text-foreground">
              Nome da Empresa *
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="company_name"
                placeholder="Ex: Barbearia do João"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                className="pl-10 bg-background border-border"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_name" className="text-foreground">
                Nome do Contato
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="contact_name"
                  placeholder="Ex: João Silva"
                  value={formData.contact_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_cnpj" className="text-foreground">
                CNPJ
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="company_cnpj"
                  placeholder="00.000.000/0000-00"
                  value={cnpjDisplay}
                  onChange={handleCnpjChange}
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_email" className="text-foreground">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="company_email"
                  type="email"
                  placeholder="contato@empresa.com"
                  value={formData.company_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_email: e.target.value }))}
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_phone" className="text-foreground">
                Telefone/WhatsApp
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="company_phone"
                  placeholder="(00) 00000-0000"
                  value={phoneDisplay}
                  onChange={handlePhoneChange}
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proposal_value" className="text-foreground">
                Valor da Proposta (R$)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="proposal_value"
                  placeholder="R$ 0,00"
                  value={valueDisplay}
                  onChange={handleValueChange}
                  className="pl-10 bg-background border-border"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Opcional. Pode ser definido depois.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-foreground">
                Observações
              </Label>
              <Textarea
                id="notes"
                placeholder="Anotações..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="bg-background border-border min-h-[60px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.company_name.trim()}>
              {loading ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar' : 'Criar Proposta')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
