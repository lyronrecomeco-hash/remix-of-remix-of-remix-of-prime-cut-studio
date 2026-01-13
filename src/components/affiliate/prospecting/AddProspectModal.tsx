import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Building2, Globe, Phone, Mail, MapPin } from 'lucide-react';
import { Prospect } from './types';

interface AddProspectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Prospect>) => Promise<Prospect | null>;
}

const NICHES = [
  'Barbearia',
  'Salão de Beleza',
  'Clínica Médica',
  'Clínica Odontológica',
  'Academia',
  'Restaurante',
  'Pizzaria',
  'Loja de Roupas',
  'Pet Shop',
  'Oficina Mecânica',
  'Imobiliária',
  'Escritório de Advocacia',
  'Contabilidade',
  'Agência de Marketing',
  'Consultório Psicologia',
  'Estúdio de Tatuagem',
  'Escola/Curso',
  'Hotel/Pousada',
  'Outro',
];

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const AddProspectModal = ({ open, onClose, onSubmit }: AddProspectModalProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    company_phone: '',
    company_email: '',
    company_website: '',
    company_city: '',
    company_state: '',
    niche: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name.trim()) return;

    setLoading(true);
    const result = await onSubmit(form);
    setLoading(false);

    if (result) {
      setForm({
        company_name: '',
        company_phone: '',
        company_email: '',
        company_website: '',
        company_city: '',
        company_state: '',
        niche: '',
        notes: '',
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Adicionar Prospect
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Nome da Empresa */}
          <div>
            <Label className="flex items-center gap-1.5 mb-1.5">
              <Building2 className="w-4 h-4" />
              Nome da Empresa *
            </Label>
            <Input
              value={form.company_name}
              onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))}
              placeholder="Ex: Barbearia do João"
              required
            />
          </div>

          {/* Telefone e Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5">
                <Phone className="w-4 h-4" />
                WhatsApp
              </Label>
              <Input
                value={form.company_phone}
                onChange={(e) => setForm(f => ({ ...f, company_phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                type="email"
                value={form.company_email}
                onChange={(e) => setForm(f => ({ ...f, company_email: e.target.value }))}
                placeholder="contato@empresa.com"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <Label className="flex items-center gap-1.5 mb-1.5">
              <Globe className="w-4 h-4" />
              Website (se tiver)
            </Label>
            <Input
              value={form.company_website}
              onChange={(e) => setForm(f => ({ ...f, company_website: e.target.value }))}
              placeholder="www.empresa.com.br"
            />
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-4 h-4" />
                Cidade
              </Label>
              <Input
                value={form.company_city}
                onChange={(e) => setForm(f => ({ ...f, company_city: e.target.value }))}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <Label className="mb-1.5">Estado</Label>
              <Select 
                value={form.company_state} 
                onValueChange={(v) => setForm(f => ({ ...f, company_state: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(uf => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nicho */}
          <div>
            <Label className="mb-1.5">Nicho/Segmento</Label>
            <Select 
              value={form.niche} 
              onValueChange={(v) => setForm(f => ({ ...f, niche: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nicho" />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map(niche => (
                  <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notas */}
          <div>
            <Label className="mb-1.5">Observações</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Informações adicionais sobre este prospect..."
              rows={2}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !form.company_name.trim()}>
              {loading ? 'Adicionando...' : 'Adicionar Prospect'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
