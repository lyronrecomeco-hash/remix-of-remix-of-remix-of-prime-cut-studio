/**
 * CAKTO AUTOMATION MODAL - Modal com regras e produtos
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Zap,
  Package,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ShoppingCart,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CaktoEventType, CAKTO_EVENT_LABELS, CAKTO_EVENT_COLORS } from './types';
import { toast } from 'sonner';

interface CaktoAutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instanceId: string;
  integrationId?: string;
}

interface CaktoProduct {
  id: string;
  name: string;
  image: string;
  description: string;
  price: number;
  type: 'unique' | 'subscription';
  status: 'active' | 'blocked' | 'deleted';
  category?: { id: string; name: string };
}

const EVENT_ICONS: Record<CaktoEventType, typeof ShoppingCart> = {
  initiate_checkout: ShoppingCart,
  purchase_approved: CheckCircle2,
  purchase_refused: XCircle,
  purchase_refunded: RotateCcw,
  checkout_abandonment: Clock,
};

export function CaktoAutomationModal({ 
  open, 
  onOpenChange, 
  instanceId,
  integrationId 
}: CaktoAutomationModalProps) {
  const [activeTab, setActiveTab] = useState('rules');
  const [products, setProducts] = useState<CaktoProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [apiToken, setApiToken] = useState<string | null>(null);

  const fetchApiToken = useCallback(async () => {
    if (!integrationId) return;
    const { data } = await supabase
      .from('genesis_instance_integrations')
      .select('metadata')
      .eq('id', integrationId)
      .single();
    if (data?.metadata && typeof data.metadata === 'object') {
      const meta = data.metadata as { api_token?: string };
      setApiToken(meta.api_token || null);
    }
  }, [integrationId]);

  const fetchProducts = useCallback(async () => {
    if (!apiToken) return;
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      if (productSearch) params.append('search', productSearch);
      if (productFilter !== 'all') params.append('status', productFilter);
      params.append('limit', '50');

      const response = await fetch(
        `https://api.cakto.com.br/api/products/?${params.toString()}`,
        { headers: { 'Authorization': `Bearer ${apiToken}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data.results || []);
      }
    } catch (err) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoadingProducts(false);
    }
  }, [apiToken, productSearch, productFilter]);

  useEffect(() => {
    if (open && integrationId) fetchApiToken();
  }, [open, integrationId, fetchApiToken]);

  useEffect(() => {
    if (open && activeTab === 'products' && apiToken) fetchProducts();
  }, [open, activeTab, apiToken, fetchProducts]);

  const allEventTypes: CaktoEventType[] = [
    'initiate_checkout', 'purchase_approved', 'purchase_refused',
    'purchase_refunded', 'checkout_abandonment',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            Central de Automação Cakto
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 grid w-fit grid-cols-2">
            <TabsTrigger value="rules" className="gap-2 px-6">
              <Zap className="w-4 h-4" />
              Regras
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2 px-6">
              <Package className="w-4 h-4" />
              Produtos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="flex-1 overflow-auto m-0 p-6">
            <div className="space-y-3">
              {allEventTypes.filter(t => eventFilter === 'all' || eventFilter === t).map(eventType => {
                const colors = CAKTO_EVENT_COLORS[eventType];
                const Icon = EVENT_ICONS[eventType];
                return (
                  <Card key={eventType} className={`${colors.border} border`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${colors.text}`} />
                        </div>
                        <p className="font-semibold">{CAKTO_EVENT_LABELS[eventType]}</p>
                      </div>
                      <Badge variant="secondary">Configurável</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="products" className="flex-1 overflow-hidden flex flex-col m-0 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                />
              </div>
              <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loadingProducts || !apiToken}>
                <RefreshCw className={`w-4 h-4 ${loadingProducts ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              {!apiToken ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                    <p>Token de API não configurado</p>
                  </CardContent>
                </Card>
              ) : loadingProducts ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
              ) : products.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p>Nenhum produto encontrado</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardContent className="p-4 flex gap-4">
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{product.name}</p>
                          <p className="text-lg font-bold text-primary">
                            R$ {(product.price / 100).toFixed(2).replace('.', ',')}
                          </p>
                          <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                            {product.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
