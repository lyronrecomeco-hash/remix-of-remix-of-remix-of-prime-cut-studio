/**
 * PRODUCT MULTI SELECT - Seletor de múltiplos produtos com checkboxes
 * Para campanhas de PIX não pago com precisão máxima
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, 
  Check, 
  ChevronDown, 
  ChevronUp,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CaktoProduct } from './hooks/useCaktoContacts';

interface ProductMultiSelectProps {
  products: CaktoProduct[];
  selectedProductIds: string[];
  onChange: (productIds: string[]) => void;
  className?: string;
}

export function ProductMultiSelect({
  products,
  selectedProductIds,
  onChange,
  className,
}: ProductMultiSelectProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = (productExternalId: string) => {
    if (selectedProductIds.includes(productExternalId)) {
      onChange(selectedProductIds.filter(id => id !== productExternalId));
    } else {
      onChange([...selectedProductIds, productExternalId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      onChange([]);
    } else {
      onChange(products.map(p => p.external_id));
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const selectedProducts = useMemo(() => {
    return products.filter(p => selectedProductIds.includes(p.external_id));
  }, [products, selectedProductIds]);

  const displayProducts = expanded ? products : products.slice(0, 5);
  const hasMore = products.length > 5;
  const allSelected = selectedProductIds.length === products.length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <Card className={cn("border-blue-500/20 bg-blue-500/5", className)}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            <Label className="font-medium">Filtrar por Produtos</Label>
            {selectedProductIds.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedProductIds.length} selecionado{selectedProductIds.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs h-7"
            >
              {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
            </Button>
            {selectedProductIds.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs h-7 text-destructive hover:text-destructive"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Selecione um ou mais produtos para extrair contatos com precisão.
          {selectedProductIds.length === 0 && ' Se nenhum for selecionado, busca em todos.'}
        </p>

        {/* Selected products badges */}
        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map(product => (
              <Badge
                key={product.id}
                variant="default"
                className="gap-1 pr-1.5 bg-blue-600 hover:bg-blue-700"
              >
                {product.name}
                <button
                  type="button"
                  onClick={() => handleToggle(product.external_id)}
                  className="ml-1 rounded-full hover:bg-white/20 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Products list */}
        <ScrollArea className={cn(expanded && products.length > 5 ? "h-[250px]" : "h-auto")}>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {displayProducts.map((product, index) => {
                const isSelected = selectedProductIds.includes(product.external_id);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <label
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        isSelected 
                          ? "bg-blue-500/10 border-blue-500/50" 
                          : "bg-background/50 border-border/50 hover:border-border"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggle(product.external_id)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {product.name}
                          </span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {formatPrice(product.price)}
                          </Badge>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-500 shrink-0" />
                      )}
                    </label>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Show more/less */}
        {hasMore && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full gap-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Ver mais ({products.length - 5} produtos)
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-muted-foreground">
          ✓ {products.length} produtos ativos disponíveis
        </p>
      </CardContent>
    </Card>
  );
}
