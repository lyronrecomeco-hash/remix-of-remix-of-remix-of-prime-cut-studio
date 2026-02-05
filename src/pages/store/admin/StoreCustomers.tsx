import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  cpf: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  credit_score: 'excellent' | 'good' | 'regular' | 'bad';
  credit_limit: number;
  notes: string | null;
  is_active: boolean;
}

const creditScoreColors: Record<string, { bg: string; text: string; label: string }> = {
  excellent: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Excelente' },
  good: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Bom' },
  regular: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Regular' },
  bad: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Ruim' },
};

const formatCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

export default function StoreCustomers() {
  const { user } = useStoreAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    cpf: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    cep: string;
    credit_score: 'excellent' | 'good' | 'regular' | 'bad';
    credit_limit: string;
    notes: string;
    is_active: boolean;
  }>({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    cep: '',
    credit_score: 'good',
    credit_limit: '',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('store_customers')
        .select('*')
        .eq('user_id', user!.id)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({
        name: customer.name,
        cpf: customer.cpf,
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        cep: customer.cep || '',
        credit_score: customer.credit_score,
        credit_limit: customer.credit_limit.toString(),
        notes: customer.notes || '',
        is_active: customer.is_active,
      });
    } else {
      setSelectedCustomer(null);
      setFormData({
        name: '',
        cpf: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        cep: '',
        credit_score: 'good',
        credit_limit: '',
        notes: '',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.cpf) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setIsSaving(true);
    try {
      const customerData = {
        user_id: user!.id,
        name: formData.name,
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        cep: formData.cep || null,
        credit_score: formData.credit_score,
        credit_limit: parseFloat(formData.credit_limit) || 0,
        notes: formData.notes || null,
        is_active: formData.is_active,
      };

      if (selectedCustomer) {
        const { error } = await supabase
          .from('store_customers')
          .update(customerData)
          .eq('id', selectedCustomer.id);

        if (error) throw error;
        toast.success('Cliente atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('store_customers')
          .insert(customerData);

        if (error) throw error;
        toast.success('Cliente cadastrado com sucesso!');
      }

      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Erro ao salvar cliente');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;

    try {
      const { error } = await supabase
        .from('store_customers')
        .delete()
        .eq('id', selectedCustomer.id);

      if (error) throw error;
      toast.success('Cliente excluído com sucesso!');
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Erro ao excluir cliente');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.cpf.includes(searchTerm.replace(/\D/g, ''))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-slate-400">Gerencie seus clientes e crédito</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <Input
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-900/50 border-slate-700 text-white"
        />
      </div>

      {/* Customers List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum cliente encontrado</p>
            <Button
              onClick={() => handleOpenModal()}
              variant="outline"
              className="mt-4"
            >
              Cadastrar Primeiro Cliente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <span className="text-blue-400 font-semibold">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{customer.name}</h3>
                        <p className="text-sm text-slate-400">{formatCPF(customer.cpf)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs ${creditScoreColors[customer.credit_score].bg} ${creditScoreColors[customer.credit_score].text}`}>
                      {creditScoreColors[customer.credit_score].label}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Phone className="w-4 h-4" />
                        {formatPhone(customer.phone)}
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.city && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-4 h-4" />
                        {customer.city}{customer.state ? `, ${customer.state}` : ''}
                      </div>
                    )}
                    {customer.credit_limit > 0 && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <CreditCard className="w-4 h-4" />
                        Limite: R$ {customer.credit_limit.toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenModal(customer)}
                      className="flex-1 text-slate-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Customer Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número, bairro"
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Cidade"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="UF"
                  maxLength={2}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>CEP</Label>
                <Input
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  placeholder="00000-000"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Score de Crédito</Label>
                <Select
                  value={formData.credit_score}
                  onValueChange={(value: any) => setFormData({ ...formData, credit_score: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="excellent">Excelente</SelectItem>
                    <SelectItem value="good">Bom</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="bad">Ruim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Limite de Crédito</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.credit_limit}
                  onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                  placeholder="0,00"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas sobre o cliente..."
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Cliente ativo</Label>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-500"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir "{selectedCustomer?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-500">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
