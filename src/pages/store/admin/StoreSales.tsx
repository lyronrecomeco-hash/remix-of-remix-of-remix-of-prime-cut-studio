import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Search,
  Eye,
  Loader2,
  Calendar,
  User,
  DollarSign,
  FileText,
  Check,
  Clock,
  XCircle,
  Truck,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';

interface Sale {
  id: string;
  sale_number: string;
  status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  subtotal: number;
  discount: number;
  total: number;
  down_payment: number;
  payment_method: string;
  installments_count: number;
  notes: string | null;
  created_at: string;
  customer_id: string | null;
  customer?: {
    name: string;
    cpf: string;
    phone: string | null;
    address: string | null;
  };
}

interface Customer {
  id: string;
  name: string;
  cpf: string;
  phone: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock },
  approved: { label: 'Aprovada', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Check },
  delivered: { label: 'Entregue', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: Truck },
  cancelled: { label: 'Cancelada', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function StoreSales() {
  const { user } = useStoreAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: '',
    discount: '0',
    down_payment: '0',
    installments_count: '1',
    notes: '',
    items: [] as { product_id: string; quantity: number; product?: Product }[],
  });

  useEffect(() => {
    if (user) {
      fetchSales();
      fetchCustomers();
      fetchProducts();
    }
  }, [user]);

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('store_sales')
        .select(`
          *,
          customer:store_customers(name, cpf, phone, address)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Erro ao carregar vendas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('store_customers')
        .select('id, name, cpf, phone')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('store_products')
        .select('id, name, price, stock_quantity')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .gt('stock_quantity', 0)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: 1 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      newItems[index] = { ...newItems[index], product_id: value, product };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((acc, item) => {
      const product = products.find(p => p.id === item.product_id);
      return acc + (product?.price || 0) * item.quantity;
    }, 0);
    const discount = parseFloat(formData.discount) || 0;
    return { subtotal, total: subtotal - discount };
  };

  const handleSave = async () => {
    if (!formData.customer_id || formData.items.length === 0) {
      toast.error('Selecione um cliente e adicione produtos');
      return;
    }

    setIsSaving(true);
    try {
      const { subtotal, total } = calculateTotal();
      const down_payment = parseFloat(formData.down_payment) || 0;
      const discount = parseFloat(formData.discount) || 0;
      const installments_count = parseInt(formData.installments_count) || 1;

      const { data: saleData, error: saleError } = await supabase
        .from('store_sales')
        .insert({
          user_id: user!.id,
          customer_id: formData.customer_id,
          sale_number: '',
          subtotal,
          discount,
          total,
          down_payment,
          payment_method: 'crediario',
          installments_count,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      const saleItems = formData.items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
          sale_id: saleData.id,
          product_id: item.product_id,
          product_name: product?.name || '',
          quantity: item.quantity,
          unit_price: product?.price || 0,
          total_price: (product?.price || 0) * item.quantity,
        };
      });

      const { error: itemsError } = await supabase
        .from('store_sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      const remainingAmount = total - down_payment;
      const installmentValue = remainingAmount / installments_count;
      
      const installments = [];
      for (let i = 1; i <= installments_count; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        
        installments.push({
          sale_id: saleData.id,
          customer_id: formData.customer_id,
          installment_number: i,
          amount: installmentValue,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'pending' as const,
        });
      }

      const { error: installmentsError } = await supabase
        .from('store_installments')
        .insert(installments);

      if (installmentsError) throw installmentsError;

      for (const item of formData.items) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          await supabase
            .from('store_products')
            .update({ stock_quantity: Math.max(0, product.stock_quantity - item.quantity) })
            .eq('id', item.product_id);
        }
      }

      toast.success('Venda criada com sucesso!');
      setIsModalOpen(false);
      setFormData({
        customer_id: '',
        discount: '0',
        down_payment: '0',
        installments_count: '1',
        notes: '',
        items: [],
      });
      fetchSales();
    } catch (error) {
      console.error('Error saving sale:', error);
      toast.error('Erro ao criar venda');
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = (sale: Sale) => {
    const doc = new jsPDF();
    const customer = sale.customer;

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('NOTA DE VENDA', 105, 25, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Nº: ${sale.sale_number}`, 20, 55);
    doc.text(`Data: ${format(new Date(sale.created_at), 'dd/MM/yyyy', { locale: ptBR })}`, 120, 55);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE', 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Nome: ${customer?.name || 'N/A'}`, 20, 85);
    doc.text(`CPF: ${customer?.cpf || 'N/A'}`, 20, 92);
    doc.text(`Telefone: ${customer?.phone || 'N/A'}`, 20, 99);
    doc.text(`Endereço: ${customer?.address || 'N/A'}`, 20, 106);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES DE PAGAMENTO', 20, 125);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Subtotal: ${formatCurrency(sale.subtotal)}`, 20, 135);
    doc.text(`Desconto: ${formatCurrency(sale.discount)}`, 20, 142);
    doc.text(`Total: ${formatCurrency(sale.total)}`, 20, 149);
    doc.text(`Entrada: ${formatCurrency(sale.down_payment)}`, 20, 156);
    doc.text(`Parcelas: ${sale.installments_count}x`, 20, 163);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Este documento serve como comprovante de venda.', 105, 280, { align: 'center' });

    doc.save(`nota-${sale.sale_number}.pdf`);
    toast.success('PDF gerado com sucesso!');
  };

  const filteredSales = sales.filter(sale =>
    sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { subtotal, total } = calculateTotal();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-500">Gerencie suas vendas e crediário</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Venda
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Buscar por número ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white border-gray-200 text-gray-900"
        />
      </div>

      {/* Sales List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredSales.length === 0 ? (
        <Card className="bg-white border-gray-100">
          <CardContent className="py-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma venda encontrada</p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="mt-4"
            >
              Criar Primeira Venda
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSales.map((sale, index) => {
            const status = statusConfig[sale.status];
            const StatusIcon = status.icon;
            
            return (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{sale.sale_number}</h3>
                            <Badge className={`${status.color} border`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {sale.customer?.name || 'Cliente não identificado'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(sale.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(sale.total)}</p>
                          <p className="text-xs text-gray-500">
                            {sale.installments_count}x de {formatCurrency(sale.total / sale.installments_count)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedSale(sale);
                              setIsDetailModalOpen(true);
                            }}
                            className="text-gray-400 hover:text-gray-900"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => generatePDF(sale)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Sale Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border-gray-100 text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Nova Venda</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Cliente *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700">Produtos</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="border-gray-200"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Select
                    value={item.product_id}
                    onValueChange={(value) => handleItemChange(index, 'product_id', value)}
                  >
                    <SelectTrigger className="flex-1 bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Produto" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20 bg-gray-50 border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Desconto</Label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Entrada</Label>
                <Input
                  type="number"
                  value={formData.down_payment}
                  onChange={(e) => setFormData({ ...formData, down_payment: e.target.value })}
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Parcelas</Label>
              <Select
                value={formData.installments_count}
                onValueChange={(value) => setFormData({ ...formData, installments_count: value })}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-gray-50 border-gray-200"
              />
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Desconto</span>
                <span className="text-red-600">-{formatCurrency(parseFloat(formData.discount) || 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-gray-200"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Finalizar Venda'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sale Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="bg-white border-gray-100 text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Detalhes da Venda</DialogTitle>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">{selectedSale.sale_number}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(selectedSale.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Cliente</p>
                  <p className="text-gray-900 font-medium">{selectedSale.customer?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Telefone</p>
                  <p className="text-gray-900 font-medium">{selectedSale.customer?.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Subtotal</p>
                  <p className="text-gray-900 font-medium">{formatCurrency(selectedSale.subtotal)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Desconto</p>
                  <p className="text-red-600 font-medium">{formatCurrency(selectedSale.discount)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="text-blue-600 font-bold text-lg">{formatCurrency(selectedSale.total)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Entrada</p>
                  <p className="text-gray-900 font-medium">{formatCurrency(selectedSale.down_payment)}</p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="border-gray-200"
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => generatePDF(selectedSale)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
