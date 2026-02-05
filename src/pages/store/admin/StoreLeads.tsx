import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  MessageSquare, 
  Search, 
  Phone,
  MapPin,
  Package,
  Eye,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig = {
  new: { label: 'Novo', color: 'bg-blue-100 text-blue-700', icon: Clock },
  contacted: { label: 'Contatado', color: 'bg-yellow-100 text-yellow-700', icon: Phone },
  negotiating: { label: 'Negociando', color: 'bg-purple-100 text-purple-700', icon: MessageSquare },
  converted: { label: 'Convertido', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  lost: { label: 'Perdido', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function StoreLeads() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const { data: leads, isLoading } = useQuery({
    queryKey: ['store-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_leads')
        .select('*, store_products(name, images)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const updateLeadMutation = useMutation({
    mutationFn: async (data: { id: string; status: string }) => {
      const { error } = await supabase
        .from('store_leads')
        .update({ 
          status: data.status
        })
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-leads'] });
      toast.success('Lead atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar lead');
    }
  });

  const convertToCustomerMutation = useMutation({
    mutationFn: async (lead: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Create customer from lead
      const { error: customerError } = await supabase
        .from('store_customers')
        .insert({
          name: lead.name,
          cpf: lead.cpf || '00000000000',
          phone: lead.phone,
          address: lead.address,
          notes: `Convertido do lead em ${format(new Date(), 'dd/MM/yyyy')}`,
          user_id: user.id
        });
      
      if (customerError) throw customerError;

      // Update lead status
      const { error: leadError } = await supabase
        .from('store_leads')
        .update({ status: 'converted' })
        .eq('id', lead.id);
      
      if (leadError) throw leadError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-leads'] });
      queryClient.invalidateQueries({ queryKey: ['store-customers'] });
      toast.success('Lead convertido em cliente com sucesso!');
      setDetailsDialog(false);
    },
    onError: () => {
      toast.error('Erro ao converter lead');
    }
  });

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone?.includes(searchTerm) ||
                         lead.cpf?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const leadsByStatus = {
    new: leads?.filter(l => l.status === 'new').length || 0,
    contacted: leads?.filter(l => l.status === 'contacted').length || 0,
    negotiating: leads?.filter(l => l.status === 'negotiating').length || 0,
    converted: leads?.filter(l => l.status === 'converted').length || 0,
    lost: leads?.filter(l => l.status === 'lost').length || 0,
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone?.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${name}! Sou da Minha Loja e vi que você demonstrou interesse em nossos produtos. Como posso ajudar?`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1">Gerencie os interessados nos seus produtos</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([key, config], index) => {
          const StatusIcon = config.icon;
          const bgColor = config.color.split(' ')[0];
          const textColor = config.color.split(' ')[1];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`bg-white border-gray-200 cursor-pointer hover:shadow-lg transition-all ${
                  statusFilter === key ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${bgColor} rounded-lg`}>
                      <StatusIcon className={`w-5 h-5 ${textColor}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{config.label}</p>
                      <p className="text-xl font-bold text-gray-900">{leadsByStatus[key as keyof typeof leadsByStatus]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, telefone ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200 text-gray-900">
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Leads ({filteredLeads?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-600">Lead</TableHead>
                    <TableHead className="text-gray-600">Produto</TableHead>
                    <TableHead className="text-gray-600">Contato</TableHead>
                    <TableHead className="text-gray-600 text-center">Status</TableHead>
                    <TableHead className="text-gray-600">Data</TableHead>
                    <TableHead className="text-gray-600 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredLeads?.map((lead, index) => {
                      const status = statusConfig[lead.status as keyof typeof statusConfig] || statusConfig.new;
                      return (
                        <motion.tr
                          key={lead.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-gray-100 hover:bg-gray-50"
                        >
                          <TableCell>
                            <div>
                              <p className="text-gray-900 font-medium">{lead.name}</p>
                              <p className="text-xs text-gray-500">{lead.cpf || '-'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {lead.store_products?.images?.[0] ? (
                                <img 
                                  src={lead.store_products.images[0]} 
                                  alt=""
                                  className="w-8 h-8 rounded object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                  <Package className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                              <span className="text-gray-700 text-sm">
                                {lead.store_products?.name || '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="w-3 h-3" />
                                {lead.phone || '-'}
                              </div>
                              {lead.address && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  {lead.address}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">
                            {lead.created_at ? format(new Date(lead.created_at), 'dd/MM/yy HH:mm', { locale: ptBR }) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => lead.phone && openWhatsApp(lead.phone, lead.name)}
                                disabled={!lead.phone}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setDetailsDialog(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>

              {filteredLeads?.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum lead encontrado</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="bg-white border-gray-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Detalhes do Lead</DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4">
              {/* Lead Info */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedLead.name}</h3>
                  <Badge className={statusConfig[selectedLead.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-700'}>
                    {statusConfig[selectedLead.status as keyof typeof statusConfig]?.label || selectedLead.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">CPF</p>
                    <p className="text-gray-900">{selectedLead.cpf || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Telefone</p>
                    <p className="text-gray-900">{selectedLead.phone || '-'}</p>
                  </div>
                  {selectedLead.address && (
                    <div className="col-span-2">
                      <p className="text-gray-500">Endereço</p>
                      <p className="text-gray-900">{selectedLead.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Interest */}
              {selectedLead.store_products && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-2">Produto de Interesse</p>
                  <div className="flex items-center gap-3">
                    {selectedLead.store_products.images?.[0] ? (
                      <img 
                        src={selectedLead.store_products.images[0]} 
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-400" />
                      </div>
                    )}
                    <p className="text-gray-900 font-medium">{selectedLead.store_products.name}</p>
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedLead.message && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Mensagem</p>
                  <p className="text-gray-900">{selectedLead.message}</p>
                </div>
              )}

              {/* Status Update */}
              <div className="space-y-2">
                <Label className="text-gray-700">Atualizar Status</Label>
                <Select 
                  value={selectedLead.status || 'new'}
                  onValueChange={(value) => {
                    updateLeadMutation.mutate({ id: selectedLead.id, status: value });
                    setSelectedLead({ ...selectedLead, status: value });
                  }}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => selectedLead.phone && openWhatsApp(selectedLead.phone, selectedLead.name)}
                  disabled={!selectedLead.phone}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                {selectedLead.status !== 'converted' && (
                  <Button
                    variant="outline"
                    className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                    onClick={() => convertToCustomerMutation.mutate(selectedLead)}
                    disabled={convertToCustomerMutation.isPending}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Converter em Cliente
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
