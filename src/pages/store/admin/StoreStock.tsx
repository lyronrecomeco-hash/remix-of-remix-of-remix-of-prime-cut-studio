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
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Controle de Estoque</h1>
          <p className="text-slate-400 mt-1">Gerencie o estoque dos seus produtos</p>
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
                  <Package className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Itens</p>
                  <p className="text-xl font-bold text-white">{totalItems}</p>
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
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Produtos</p>
                  <p className="text-xl font-bold text-white">{products?.length || 0}</p>
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
          <Card className="bg-slate-800/50 border-slate-700/50 cursor-pointer hover:bg-slate-800/70 transition-colors"
                onClick={() => setShowLowStock(!showLowStock)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Estoque Baixo</p>
                  <p className="text-xl font-bold text-yellow-400">{lowStockCount}</p>
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
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Sem Estoque</p>
                  <p className="text-xl font-bold text-red-400">{outOfStockCount}</p>
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
                placeholder="Buscar produto por nome ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <Button
              variant={showLowStock ? 'default' : 'outline'}
              onClick={() => setShowLowStock(!showLowStock)}
              className={showLowStock ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-slate-600 text-slate-300'}
            >
              <Filter className="w-4 h-4 mr-2" />
              Estoque Baixo ({lowStockCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            Produtos ({filteredProducts?.length || 0})
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
                    <TableHead className="text-slate-400">Produto</TableHead>
                    <TableHead className="text-slate-400">SKU</TableHead>
                    <TableHead className="text-slate-400">Categoria</TableHead>
                    <TableHead className="text-slate-400 text-center">Estoque</TableHead>
                    <TableHead className="text-slate-400 text-center">Mínimo</TableHead>
                    <TableHead className="text-slate-400 text-center">Status</TableHead>
                    <TableHead className="text-slate-400 text-right">Ações</TableHead>
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
                          className="border-slate-700/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {product.images?.[0] ? (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                                  <Package className="w-5 h-5 text-slate-500" />
                                </div>
                              )}
                              <span className="text-white font-medium">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-400">{product.sku || '-'}</TableCell>
                          <TableCell className="text-slate-400">
                            {product.store_categories?.name || '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${
                              stockQty === 0 ? 'text-red-400' :
                              stockQty <= minStock ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {stockQty}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-slate-400">
                            {minStock}
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
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
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
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
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
                  <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum produto encontrado</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Movement Dialog */}
      <Dialog open={movementDialog} onOpenChange={setMovementDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {movement.type === 'in' ? (
                <>
                  <Plus className="w-5 h-5 text-green-400" />
                  Entrada de Estoque
                </>
              ) : (
                <>
                  <Minus className="w-5 h-5 text-red-400" />
                  Saída de Estoque
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedProduct.images?.[0] ? (
                    <img 
                      src={selectedProduct.images[0]} 
                      alt={selectedProduct.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{selectedProduct.name}</p>
                    <p className="text-sm text-slate-400">Estoque atual: {selectedProduct.stock_quantity || 0}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={movement.quantity}
                  onChange={(e) => setMovement({ ...movement, quantity: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Motivo (opcional)</Label>
                <Textarea
                  placeholder="Ex: Compra de fornecedor, Venda, Devolução..."
                  value={movement.reason}
                  onChange={(e) => setMovement({ ...movement, reason: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div className="p-4 bg-slate-800/30 rounded-lg">
                <p className="text-sm text-slate-400">Novo estoque após movimentação:</p>
                <p className="text-2xl font-bold text-white">
                  {movement.type === 'in' 
                    ? (selectedProduct.stock_quantity || 0) + (movement.quantity || 0)
                    : Math.max(0, (selectedProduct.stock_quantity || 0) - (movement.quantity || 0))
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600"
                  onClick={() => setMovementDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className={`flex-1 ${
                    movement.type === 'in' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  onClick={handleStockMovement}
                  disabled={updateStockMutation.isPending}
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
