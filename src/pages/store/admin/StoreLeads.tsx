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
import { Textarea } from '@/components/ui/textarea';
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
  new: { label: 'Novo', color: 'bg-blue-500', icon: Clock },
  contacted: { label: 'Contatado', color: 'bg-yellow-500', icon: Phone },
  negotiating: { label: 'Negociando', color: 'bg-purple-500', icon: MessageSquare },
  converted: { label: 'Convertido', color: 'bg-green-500', icon: CheckCircle2 },
  lost: { label: 'Perdido', color: 'bg-red-500', icon: XCircle },
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
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Leads</h1>
          <p className="text-slate-400 mt-1">Gerencie os interessados nos seus produtos</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([key, config], index) => {
          const StatusIcon = config.icon;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`bg-slate-800/50 border-slate-700/50 cursor-pointer hover:bg-slate-800/70 transition-colors ${
                  statusFilter === key ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${config.color}/20 rounded-lg`}>
                      <StatusIcon className={`w-5 h-5 ${config.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{config.label}</p>
                      <p className="text-xl font-bold text-white">{leadsByStatus[key as keyof typeof leadsByStatus]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome, telefone ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
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
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Leads ({filteredLeads?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Lead</TableHead>
                    <TableHead className="text-slate-400">Produto</TableHead>
                    <TableHead className="text-slate-400">Contato</TableHead>
                    <TableHead className="text-slate-400 text-center">Status</TableHead>
                    <TableHead className="text-slate-400">Data</TableHead>
                    <TableHead className="text-slate-400 text-right">Ações</TableHead>
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
                          className="border-slate-700/50"
                        >
                          <TableCell>
                            <div>
                              <p className="text-white font-medium">{lead.name}</p>
                              <p className="text-xs text-slate-400">{lead.cpf || '-'}</p>
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
                                <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                                  <Package className="w-4 h-4 text-slate-500" />
                                </div>
                              )}
                              <span className="text-slate-300 text-sm">
                                {lead.store_products?.name || '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm text-slate-400">
                                <Phone className="w-3 h-3" />
                                {lead.phone || '-'}
                              </div>
                              {lead.address && (
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                  <MapPin className="w-3 h-3" />
                                  {lead.address}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${status.color} text-white`}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm">
                            {lead.created_at ? format(new Date(lead.created_at), 'dd/MM/yy HH:mm', { locale: ptBR }) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                                onClick={() => lead.phone && openWhatsApp(lead.phone, lead.name)}
                                disabled={!lead.phone}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-600"
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
                  <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum lead encontrado</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Detalhes do Lead</DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4">
              {/* Lead Info */}
              <div className="p-4 bg-slate-800/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{selectedLead.name}</h3>
                  <Badge className={`${statusConfig[selectedLead.status as keyof typeof statusConfig]?.color || 'bg-gray-500'} text-white`}>
                    {statusConfig[selectedLead.status as keyof typeof statusConfig]?.label || selectedLead.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400">CPF</p>
                    <p className="text-white">{selectedLead.cpf || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Telefone</p>
                    <p className="text-white">{selectedLead.phone || '-'}</p>
                  </div>
                  {selectedLead.address && (
                    <div className="col-span-2">
                      <p className="text-slate-400">Endereço</p>
                      <p className="text-white">{selectedLead.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Interest */}
              {selectedLead.store_products && (
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-400 mb-2">Produto de Interesse</p>
                  <div className="flex items-center gap-3">
                    {selectedLead.store_products.images?.[0] ? (
                      <img 
                        src={selectedLead.store_products.images[0]} 
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-500" />
                      </div>
                    )}
                    <p className="text-white font-medium">{selectedLead.store_products.name}</p>
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedLead.message && (
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-400 mb-2">Mensagem</p>
                  <p className="text-white">{selectedLead.message}</p>
                </div>
              )}

              {/* Status Update */}
              <div className="space-y-2">
                <Label className="text-slate-300">Atualizar Status</Label>
                <Select 
                  value={selectedLead.status || 'new'}
                  onValueChange={(value) => {
                    updateLeadMutation.mutate({ id: selectedLead.id, status: value });
                    setSelectedLead({ ...selectedLead, status: value });
                  }}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => selectedLead.phone && openWhatsApp(selectedLead.phone, selectedLead.name)}
                  disabled={!selectedLead.phone}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                {selectedLead.status !== 'converted' && (
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
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
