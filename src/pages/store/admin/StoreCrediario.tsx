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
import { toast } from 'sonner';
import { format, isPast, isToday, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import { 
  Receipt, 
  Search, 
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  User,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StoreCrediario() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const { data: installments, isLoading } = useQuery({
    queryKey: ['store-installments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_installments')
        .select(`
          *,
          store_sales(
            sale_number,
            total,
            down_payment,
            installments_count,
            store_customers(name, cpf, phone, address, city, state)
          )
        `)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const updateInstallmentMutation = useMutation({
    mutationFn: async (data: { id: string; status: string; paid_date?: string }) => {
      const updateData: any = { 
        status: data.status
      };
      
      if (data.status === 'paid') {
        updateData.paid_date = data.paid_date || new Date().toISOString();
      }

      const { error } = await supabase
        .from('store_installments')
        .update(updateData)
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-installments'] });
      toast.success('Parcela atualizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar parcela');
    }
  });

  const getInstallmentStatus = (installment: any) => {
    if (installment.status === 'paid') {
      return { label: 'Pago', variant: 'default' as const, color: 'bg-green-500' };
    }
    if (isPast(new Date(installment.due_date)) && !isToday(new Date(installment.due_date))) {
      return { label: 'Atrasado', variant: 'destructive' as const, color: 'bg-red-500' };
    }
    if (isToday(new Date(installment.due_date))) {
      return { label: 'Vence Hoje', variant: 'outline' as const, color: 'bg-yellow-500', isWarning: true };
    }
    const sevenDaysFromNow = addDays(new Date(), 7);
    if (new Date(installment.due_date) <= sevenDaysFromNow) {
      return { label: 'Próximo', variant: 'outline' as const, color: 'bg-blue-500' };
    }
    return { label: 'Pendente', variant: 'secondary' as const, color: 'bg-slate-500' };
  };

  const filteredInstallments = installments?.filter(installment => {
    const customer = installment.store_sales?.store_customers;
    const matchesSearch = customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer?.cpf?.includes(searchTerm) ||
                         installment.store_sales?.sale_number?.includes(searchTerm);
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'paid') return matchesSearch && installment.status === 'paid';
    if (statusFilter === 'pending') return matchesSearch && installment.status === 'pending';
    if (statusFilter === 'overdue') {
      return matchesSearch && installment.status === 'pending' && 
             isPast(new Date(installment.due_date)) && !isToday(new Date(installment.due_date));
    }
    return matchesSearch;
  });

  const stats = {
    total: installments?.length || 0,
    pending: installments?.filter(i => i.status === 'pending').length || 0,
    paid: installments?.filter(i => i.status === 'paid').length || 0,
    overdue: installments?.filter(i => 
      i.status === 'pending' && isPast(new Date(i.due_date)) && !isToday(new Date(i.due_date))
    ).length || 0,
    totalPending: installments?.filter(i => i.status === 'pending')
      .reduce((acc, i) => acc + (i.amount || 0), 0) || 0,
    totalOverdue: installments?.filter(i => 
      i.status === 'pending' && isPast(new Date(i.due_date)) && !isToday(new Date(i.due_date))
    ).reduce((acc, i) => acc + (i.amount || 0), 0) || 0,
  };

  const generateReceipt = (installment: any) => {
    const doc = new jsPDF();
    const customer = installment.store_sales?.store_customers;
    const sale = installment.store_sales;
    const totalInstallments = sale?.installments_count || 1;

    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE PAGAMENTO', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Crediário - Minha Loja', 105, 30, { align: 'center' });

    // Customer Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE', 20, 55);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${customer?.name || '-'}`, 20, 65);
    doc.text(`CPF: ${customer?.cpf || '-'}`, 20, 72);
    doc.text(`Telefone: ${customer?.phone || '-'}`, 20, 79);
    doc.text(`Endereço: ${customer?.address || '-'}, ${customer?.city || ''}/${customer?.state || ''}`, 20, 86);

    // Sale Info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DA VENDA', 20, 105);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Venda Nº: ${sale?.sale_number || '-'}`, 20, 115);
    doc.text(`Valor Total: R$ ${(sale?.total || 0).toFixed(2)}`, 20, 122);
    doc.text(`Entrada: R$ ${(sale?.down_payment || 0).toFixed(2)}`, 20, 129);

    // Installment Info
    doc.setFillColor(59, 130, 246);
    doc.rect(20, 145, 170, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PARCELA', 105, 157, { align: 'center' });
    
    doc.setFontSize(20);
    doc.text(`${installment.installment_number}/${totalInstallments}`, 60, 172);
    doc.text(`R$ ${(installment.amount || 0).toFixed(2)}`, 150, 172, { align: 'right' });

    // Payment Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Vencimento: ${format(new Date(installment.due_date), 'dd/MM/yyyy')}`, 20, 195);
    
    if (installment.status === 'paid' && installment.paid_date) {
      doc.setTextColor(34, 197, 94);
      doc.setFont('helvetica', 'bold');
      doc.text(`✓ PAGO em ${format(new Date(installment.paid_date), 'dd/MM/yyyy HH:mm')}`, 20, 205);
    } else {
      doc.setTextColor(239, 68, 68);
      doc.setFont('helvetica', 'bold');
      doc.text('PENDENTE', 20, 205);
    }

    // Footer
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Documento gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 280, { align: 'center' });

    doc.save(`recibo_${sale?.sale_number}_parcela_${installment.installment_number}.pdf`);
    toast.success('Recibo gerado com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Crediário</h1>
          <p className="text-slate-400 mt-1">Gerencie as parcelas dos seus clientes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Receipt className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Parcelas</p>
                  <p className="text-xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Pendentes</p>
                  <p className="text-xl font-bold text-yellow-400">{stats.pending}</p>
                  <p className="text-xs text-slate-500">
                    R$ {stats.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 cursor-pointer hover:bg-slate-800/70"
                onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Atrasadas</p>
                  <p className="text-xl font-bold text-red-400">{stats.overdue}</p>
                  <p className="text-xs text-slate-500">
                    R$ {stats.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Pagas</p>
                  <p className="text-xl font-bold text-green-400">{stats.paid}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search & Filter */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por cliente, CPF ou número da venda..."
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
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="overdue">Atrasadas</SelectItem>
                <SelectItem value="paid">Pagas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Installments Table */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Parcelas ({filteredInstallments?.length || 0})
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
                    <TableHead className="text-slate-400">Cliente</TableHead>
                    <TableHead className="text-slate-400">Venda</TableHead>
                    <TableHead className="text-slate-400 text-center">Parcela</TableHead>
                    <TableHead className="text-slate-400 text-right">Valor</TableHead>
                    <TableHead className="text-slate-400">Vencimento</TableHead>
                    <TableHead className="text-slate-400 text-center">Status</TableHead>
                    <TableHead className="text-slate-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredInstallments?.map((installment, index) => {
                      const status = getInstallmentStatus(installment);
                      const customer = installment.store_sales?.store_customers;
                      const totalInstallments = installment.store_sales?.installments_count || 1;
                      return (
                        <motion.tr
                          key={installment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-slate-700/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{customer?.name || '-'}</p>
                                <p className="text-xs text-slate-400">{customer?.cpf}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            #{installment.store_sales?.sale_number}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-white font-medium">
                              {installment.installment_number}/{totalInstallments}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-white font-medium">
                            R$ {(installment.amount || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-slate-300">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(installment.due_date), 'dd/MM/yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={status.variant}
                              className={status.isWarning ? 'border-yellow-500 text-yellow-500' : ''}
                            >
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {installment.status !== 'paid' && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => updateInstallmentMutation.mutate({
                                    id: installment.id,
                                    status: 'paid'
                                  })}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-600"
                                onClick={() => generateReceipt(installment)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-600"
                                onClick={() => {
                                  setSelectedInstallment(installment);
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

              {filteredInstallments?.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhuma parcela encontrada</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detalhes da Parcela
            </DialogTitle>
          </DialogHeader>

          {selectedInstallment && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Cliente</h3>
                <p className="text-white font-medium">
                  {selectedInstallment.store_sales?.store_customers?.name}
                </p>
                <p className="text-sm text-slate-400">
                  CPF: {selectedInstallment.store_sales?.store_customers?.cpf}
                </p>
                <p className="text-sm text-slate-400">
                  Tel: {selectedInstallment.store_sales?.store_customers?.phone}
                </p>
              </div>

              {/* Installment Info */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">Parcela</span>
                  <span className="text-white font-bold text-lg">
                    {selectedInstallment.installment_number}/{selectedInstallment.store_sales?.installments_count || 1}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">Valor</span>
                  <span className="text-2xl font-bold text-blue-400">
                    R$ {(selectedInstallment.amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Vencimento</span>
                  <span className="text-white">
                    {format(new Date(selectedInstallment.due_date), 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Status</span>
                <Badge 
                  variant={getInstallmentStatus(selectedInstallment).variant}
                  className={getInstallmentStatus(selectedInstallment).isWarning ? 'border-yellow-500 text-yellow-500' : ''}
                >
                  {getInstallmentStatus(selectedInstallment).label}
                </Badge>
              </div>

              {selectedInstallment.paid_date && (
                <p className="text-sm text-green-400 text-center">
                  ✓ Pago em {format(new Date(selectedInstallment.paid_date), 'dd/MM/yyyy HH:mm')}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                {selectedInstallment.status !== 'paid' && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      updateInstallmentMutation.mutate({
                        id: selectedInstallment.id,
                        status: 'paid'
                      });
                      setDetailsDialog(false);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Marcar como Pago
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600"
                  onClick={() => generateReceipt(selectedInstallment)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Gerar Recibo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
