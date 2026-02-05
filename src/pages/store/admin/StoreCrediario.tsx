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
      return { label: 'Pago', variant: 'default' as const, color: 'bg-green-100 text-green-700' };
    }
    if (isPast(new Date(installment.due_date)) && !isToday(new Date(installment.due_date))) {
      return { label: 'Atrasado', variant: 'destructive' as const, color: 'bg-red-100 text-red-700' };
    }
    if (isToday(new Date(installment.due_date))) {
      return { label: 'Vence Hoje', variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-700', isWarning: true };
    }
    const sevenDaysFromNow = addDays(new Date(), 7);
    if (new Date(installment.due_date) <= sevenDaysFromNow) {
      return { label: 'Próximo', variant: 'outline' as const, color: 'bg-blue-100 text-blue-700' };
    }
    return { label: 'Pendente', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-700' };
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
    doc.setFillColor(59, 130, 246);
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Crediário</h1>
          <p className="text-gray-500 mt-1">Gerencie as parcelas dos seus clientes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Receipt className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Parcelas</p>
                  <p className="text-xl font-bold text-gray-900">{stats.total}</p>
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
          <Card className="bg-white border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pendentes</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-xs text-gray-400">
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
          <Card 
            className={`bg-white border-gray-200 cursor-pointer hover:border-red-300 hover:shadow-lg transition-all ${
              statusFilter === 'overdue' ? 'ring-2 ring-red-500' : ''
            }`}
            onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Atrasadas</p>
                  <p className="text-xl font-bold text-red-600">{stats.overdue}</p>
                  <p className="text-xs text-gray-400">
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
          <Card className="bg-white border-gray-200 hover:border-green-300 hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pagas</p>
                  <p className="text-xl font-bold text-green-600">{stats.paid}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search & Filter */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente, CPF ou número da venda..."
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
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            Parcelas ({filteredInstallments?.length || 0})
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
                    <TableHead className="text-gray-600">Cliente</TableHead>
                    <TableHead className="text-gray-600">Venda</TableHead>
                    <TableHead className="text-gray-600 text-center">Parcela</TableHead>
                    <TableHead className="text-gray-600 text-right">Valor</TableHead>
                    <TableHead className="text-gray-600">Vencimento</TableHead>
                    <TableHead className="text-gray-600 text-center">Status</TableHead>
                    <TableHead className="text-gray-600 text-right">Ações</TableHead>
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
                          className="border-gray-100 hover:bg-gray-50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-500" />
                              </div>
                              <div>
                                <p className="text-gray-900 font-medium">{customer?.name || '-'}</p>
                                <p className="text-xs text-gray-500">{customer?.cpf}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            #{installment.store_sales?.sale_number}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-gray-900 font-medium">
                              {installment.installment_number}/{totalInstallments}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-gray-900 font-medium">
                            R$ {(installment.amount || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(installment.due_date), 'dd/MM/yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {installment.status === 'pending' && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
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
                                className="border-gray-300 text-gray-700 hover:bg-gray-100"
                                onClick={() => generateReceipt(installment)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-100"
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
                  <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma parcela encontrada</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="bg-white border-gray-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Detalhes da Parcela</DialogTitle>
          </DialogHeader>

          {selectedInstallment && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Cliente
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Nome</p>
                    <p className="text-gray-900 font-medium">
                      {selectedInstallment.store_sales?.store_customers?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">CPF</p>
                    <p className="text-gray-900">
                      {selectedInstallment.store_sales?.store_customers?.cpf || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Telefone</p>
                    <p className="text-gray-900">
                      {selectedInstallment.store_sales?.store_customers?.phone || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Installment Details */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-blue-600">Parcela</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {selectedInstallment.installment_number}/{selectedInstallment.store_sales?.installments_count || 1}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-600">Valor</p>
                    <p className="text-2xl font-bold text-blue-700">
                      R$ {(selectedInstallment.amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-blue-600">Vencimento</p>
                    <p className="text-blue-900 font-medium">
                      {format(new Date(selectedInstallment.due_date), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <Badge className={getInstallmentStatus(selectedInstallment).color}>
                    {getInstallmentStatus(selectedInstallment).label}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedInstallment.status === 'pending' && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
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
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => generateReceipt(selectedInstallment)}
                >
                  <FileText className="w-4 h-4 mr-2" />
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
