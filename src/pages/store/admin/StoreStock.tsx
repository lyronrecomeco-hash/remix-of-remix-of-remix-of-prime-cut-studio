import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Package, 
  Search, 
  Plus, 
  Minus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StockMovement {
  product_id: string;
  product_name: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
}

export default function StoreStock() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [movementDialog, setMovementDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [movement, setMovement] = useState<Partial<StockMovement>>({
    type: 'in',
    quantity: 1,
    reason: ''
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['store-products-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_products')
        .select('*, store_categories(name)')
        .order('stock_quantity', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const updateStockMutation = useMutation({
    mutationFn: async (data: { productId: string; newStock: number }) => {
      const { error } = await supabase
        .from('store_products')
        .update({ stock_quantity: data.newStock, updated_at: new Date().toISOString() })
        .eq('id', data.productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-products-stock'] });
      toast.success('Estoque atualizado com sucesso!');
      setMovementDialog(false);
      setSelectedProduct(null);
      setMovement({ type: 'in', quantity: 1, reason: '' });
    },
    onError: () => {
      toast.error('Erro ao atualizar estoque');
    }
  });

  const handleStockMovement = () => {
    if (!selectedProduct || !movement.quantity) return;
    
    const currentStock = selectedProduct.stock_quantity || 0;
    const newStock = movement.type === 'in' 
      ? currentStock + (movement.quantity || 0)
      : Math.max(0, currentStock - (movement.quantity || 0));
    
    updateStockMutation.mutate({
      productId: selectedProduct.id,
      newStock
    });
  };

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = !showLowStock || ((product.stock_quantity || 0) <= (product.min_stock_alert || 5));
    return matchesSearch && matchesLowStock;
  });

  const lowStockCount = products?.filter(p => (p.stock_quantity || 0) <= (p.min_stock_alert || 5)).length || 0;
  const outOfStockCount = products?.filter(p => (p.stock_quantity || 0) === 0).length || 0;
  const totalItems = products?.reduce((acc, p) => acc + (p.stock_quantity || 0), 0) || 0;

  const getStockStatus = (stock: number, minStock: number = 5) => {
    if (stock === 0) return { label: 'Sem Estoque', variant: 'destructive' as const };
    if (stock <= minStock) return { label: 'Estoque Baixo', variant: 'outline' as const, isWarning: true };
    return { label: 'Normal', variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Controle de Estoque</h1>
          <p className="text-gray-500 mt-1">Gerencie o estoque dos seus produtos</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Itens</p>
                  <p className="text-xl font-bold text-gray-900">{totalItems}</p>
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
          <Card className="bg-white border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Produtos</p>
                  <p className="text-xl font-bold text-gray-900">{products?.length || 0}</p>
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
          <Card className={`bg-white border-gray-100 cursor-pointer hover:border-amber-200 transition-colors ${showLowStock ? 'ring-2 ring-amber-400' : ''}`}
                onClick={() => setShowLowStock(!showLowStock)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estoque Baixo</p>
                  <p className="text-xl font-bold text-amber-600">{lowStockCount}</p>
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
          <Card className="bg-white border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sem Estoque</p>
                  <p className="text-xl font-bold text-red-600">{outOfStockCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search & Filter */}
      <Card className="bg-white border-gray-100">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar produto por nome ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>
            <Button
              variant={showLowStock ? 'default' : 'outline'}
              onClick={() => setShowLowStock(!showLowStock)}
              className={showLowStock ? 'bg-amber-500 hover:bg-amber-600' : 'border-gray-200 text-gray-600'}
            >
              <Filter className="w-4 h-4 mr-2" />
              Estoque Baixo ({lowStockCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-white border-gray-100">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Produtos ({filteredProducts?.length || 0})
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
                  <TableRow className="border-gray-100">
                    <TableHead className="text-gray-600">Produto</TableHead>
                    <TableHead className="text-gray-600">SKU</TableHead>
                    <TableHead className="text-gray-600">Categoria</TableHead>
                    <TableHead className="text-gray-600 text-center">Estoque</TableHead>
                    <TableHead className="text-gray-600 text-center">Mínimo</TableHead>
                    <TableHead className="text-gray-600 text-center">Status</TableHead>
                    <TableHead className="text-gray-600 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredProducts?.map((product, index) => {
                      const stockQty = product.stock_quantity || 0;
                      const minStock = product.min_stock_alert || 5;
                      const status = getStockStatus(stockQty, minStock);
                      return (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-gray-50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <span className="text-gray-900 font-medium">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-500">{product.sku || '-'}</TableCell>
                          <TableCell className="text-gray-500">
                            {product.store_categories?.name || '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${
                              stockQty === 0 ? 'text-red-600' :
                              stockQty <= minStock ? 'text-amber-600' :
                              'text-emerald-600'
                            }`}>
                              {stockQty}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-gray-500">
                            {minStock}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={status.variant}
                              className={status.isWarning ? 'border-amber-400 text-amber-600 bg-amber-50' : ''}
                            >
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setMovement({ type: 'in', quantity: 1, reason: '' });
                                  setMovementDialog(true);
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setMovement({ type: 'out', quantity: 1, reason: '' });
                                  setMovementDialog(true);
                                }}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>

              {filteredProducts?.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum produto encontrado</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Movement Dialog */}
      <Dialog open={movementDialog} onOpenChange={setMovementDialog}>
        <DialogContent className="bg-white border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              {movement.type === 'in' ? (
                <>
                  <Plus className="w-5 h-5 text-emerald-600" />
                  Entrada de Estoque
                </>
              ) : (
                <>
                  <Minus className="w-5 h-5 text-red-600" />
                  Saída de Estoque
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedProduct.image_url ? (
                    <img 
                      src={selectedProduct.image_url} 
                      alt={selectedProduct.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-gray-900 font-medium">{selectedProduct.name}</p>
                    <p className="text-sm text-gray-500">Estoque atual: {selectedProduct.stock_quantity || 0}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={movement.quantity}
                  onChange={(e) => setMovement({ ...movement, quantity: parseInt(e.target.value) || 0 })}
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Motivo (opcional)</Label>
                <Textarea
                  placeholder="Ex: Compra de fornecedor, Venda, Devolução..."
                  value={movement.reason}
                  onChange={(e) => setMovement({ ...movement, reason: e.target.value })}
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Novo estoque após movimentação:</p>
                <p className={`text-2xl font-bold ${
                  movement.type === 'in' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {movement.type === 'in' 
                    ? (selectedProduct.stock_quantity || 0) + (movement.quantity || 0)
                    : Math.max(0, (selectedProduct.stock_quantity || 0) - (movement.quantity || 0))
                  } unidades
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setMovementDialog(false)}
                  className="border-gray-200"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleStockMovement}
                  disabled={updateStockMutation.isPending}
                  className={movement.type === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  {updateStockMutation.isPending ? 'Salvando...' : 'Confirmar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
