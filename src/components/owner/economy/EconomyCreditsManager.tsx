/**
 * Economy Credits Manager - Owner Panel
 * Manage credit packages
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  Plus,
  Edit2,
  Trash2,
  Star,
  AlertTriangle,
  Gift,
  Calendar,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
  useCreditPackages,
  useUpdateCreditPackage,
  useCreateCreditPackage,
  useDeleteCreditPackage,
  CreditPackage,
} from '@/hooks/useGenesisEconomy';
import { cn } from '@/lib/utils';

const defaultPackage: Partial<CreditPackage> = {
  name: '',
  credits_amount: 100,
  price: 19.90,
  bonus_credits: 0,
  is_active: true,
  is_recommended: false,
  is_not_recommended: false,
  expiration_days: null,
  display_order: 0,
};

export default function EconomyCreditsManager() {
  const { data: packages, isLoading } = useCreditPackages();
  const updatePackage = useUpdateCreditPackage();
  const createPackage = useCreateCreditPackage();
  const deletePackage = useDeleteCreditPackage();

  const [editing, setEditing] = useState<CreditPackage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<CreditPackage>>(defaultPackage);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleEdit = (pkg: CreditPackage) => {
    setEditing(pkg);
    setFormData(pkg);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setFormData(defaultPackage);
    setEditing(null);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (isCreating) {
      createPackage.mutate(formData as Omit<CreditPackage, 'id' | 'created_at' | 'updated_at' | 'price_per_credit'>, {
        onSuccess: () => {
          setIsCreating(false);
          setFormData(defaultPackage);
        },
      });
    } else if (editing) {
      updatePackage.mutate({ id: editing.id, ...formData }, {
        onSuccess: () => {
          setEditing(null);
          setFormData(defaultPackage);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deletePackage.mutate(id, {
      onSuccess: () => setDeleteConfirm(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Pacotes de Créditos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure pacotes de créditos avulsos para compra
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Pacote
        </Button>
      </div>

      {/* Info Box */}
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Estratégia de Preço
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Créditos avulsos devem ser mais caros que os inclusos nos planos para incentivar assinaturas.
                Use a flag "Não Recomendado" para pacotes com preço/crédito alto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {packages?.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                "relative overflow-hidden transition-all hover:shadow-lg",
                pkg.is_recommended && "ring-2 ring-primary",
                pkg.is_not_recommended && "ring-2 ring-amber-500/50",
                !pkg.is_active && "opacity-60"
              )}>
                {pkg.is_recommended && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Popular
                  </div>
                )}
                {pkg.is_not_recommended && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Caro
                  </div>
                )}

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">
                      R$ {pkg.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (R$ {pkg.price_per_credit?.toFixed(4)}/crédito)
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Créditos</span>
                      <span className="font-medium">{pkg.credits_amount.toLocaleString()}</span>
                    </div>
                    {pkg.bonus_credits > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Gift className="w-3 h-3 text-green-500" />
                          Bônus
                        </span>
                        <span className="font-medium text-green-600">+{pkg.bonus_credits}</span>
                      </div>
                    )}
                    {pkg.expiration_days && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expira em
                        </span>
                        <span className="font-medium">{pkg.expiration_days} dias</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(pkg)}
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirm(pkg.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isCreating || !!editing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setEditing(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              {isCreating ? 'Criar Pacote' : 'Editar Pacote'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Pacote</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Profissional"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Créditos</Label>
                <Input
                  type="number"
                  value={formData.credits_amount || 0}
                  onChange={(e) => setFormData({ ...formData, credits_amount: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bônus de Créditos</Label>
                <Input
                  type="number"
                  value={formData.bonus_credits || 0}
                  onChange={(e) => setFormData({ ...formData, bonus_credits: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Expira em (dias)</Label>
                <Input
                  type="number"
                  value={formData.expiration_days || ''}
                  onChange={(e) => setFormData({ ...formData, expiration_days: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Nunca"
                />
              </div>
            </div>

            {/* Calculated price per credit */}
            {formData.credits_amount && formData.price && (
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <span className="text-sm text-muted-foreground">Preço por crédito: </span>
                <span className="font-medium text-primary">
                  R$ {(formData.price / formData.credits_amount).toFixed(4)}
                </span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Pacote Ativo</Label>
                <Switch
                  checked={formData.is_active ?? true}
                  onCheckedChange={(value) => setFormData({ ...formData, is_active: value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  Recomendado
                </Label>
                <Switch
                  checked={formData.is_recommended ?? false}
                  onCheckedChange={(value) => setFormData({ ...formData, is_recommended: value, is_not_recommended: value ? false : formData.is_not_recommended })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Não Recomendado (Caro)
                </Label>
                <Switch
                  checked={formData.is_not_recommended ?? false}
                  onCheckedChange={(value) => setFormData({ ...formData, is_not_recommended: value, is_recommended: value ? false : formData.is_recommended })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreating(false);
              setEditing(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updatePackage.isPending || createPackage.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pacote de créditos?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
