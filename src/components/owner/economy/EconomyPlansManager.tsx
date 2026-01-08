/**
 * Economy Plans Manager - Owner Panel
 * Full CRUD for subscription plans
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Star,
  Zap,
  MessageSquare,
  Bot,
  Webhook,
  Crown,
  Sparkles,
  Settings2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  useEconomyPlans,
  useUpdatePlan,
  useCreatePlan,
  useDeletePlan,
  EconomyPlan,
} from '@/hooks/useGenesisEconomy';
import { cn } from '@/lib/utils';

const defaultPlan: Partial<EconomyPlan> = {
  name: '',
  slug: '',
  description: '',
  is_active: true,
  is_recommended: false,
  price_monthly: 0,
  price_yearly: null,
  billing_cycle: 'monthly',
  credits_included: 100,
  max_instances: 1,
  max_flows: 5,
  max_messages_month: 1000,
  max_ai_calls_month: 100,
  max_webhooks: 5,
  features_enabled: {
    chatbot: true,
    flow_builder: false,
    luna_ai: false,
    templates: false,
    priority_support: false,
  },
  overusage_behavior: 'block',
  processing_priority: 5,
  display_order: 0,
};

export default function EconomyPlansManager() {
  const { data: plans, isLoading } = useEconomyPlans();
  const updatePlan = useUpdatePlan();
  const createPlan = useCreatePlan();
  const deletePlan = useDeletePlan();

  const [editingPlan, setEditingPlan] = useState<EconomyPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<EconomyPlan>>(defaultPlan);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleEdit = (plan: EconomyPlan) => {
    setEditingPlan(plan);
    setFormData(plan);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setFormData(defaultPlan);
    setEditingPlan(null);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (isCreating) {
      createPlan.mutate(formData as Omit<EconomyPlan, 'id' | 'created_at' | 'updated_at'>, {
        onSuccess: () => {
          setIsCreating(false);
          setFormData(defaultPlan);
        },
      });
    } else if (editingPlan) {
      updatePlan.mutate({ id: editingPlan.id, ...formData }, {
        onSuccess: () => {
          setEditingPlan(null);
          setFormData(defaultPlan);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deletePlan.mutate(id, {
      onSuccess: () => setDeleteConfirm(null),
    });
  };

  const updateFeature = (feature: keyof EconomyPlan['features_enabled'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      features_enabled: {
        ...prev.features_enabled!,
        [feature]: value,
      },
    }));
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
            <Package className="w-5 h-5 text-primary" />
            Gestão de Planos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure os planos de assinatura da Genesis
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Plano
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {plans?.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                "relative overflow-hidden transition-all hover:shadow-lg",
                plan.is_recommended && "ring-2 ring-primary",
                !plan.is_active && "opacity-60"
              )}>
                {plan.is_recommended && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                    Recomendado
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {plan.slug === 'enterprise' && <Crown className="w-4 h-4 text-yellow-500" />}
                      {plan.slug === 'pro' && <Sparkles className="w-4 h-4 text-purple-500" />}
                      {plan.name}
                    </CardTitle>
                    <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                      {plan.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    R$ {plan.price_monthly.toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span>{plan.credits_included.toLocaleString()} créditos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span>{plan.max_messages_month.toLocaleString()} msgs/mês</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-500" />
                      <span>{plan.max_ai_calls_month.toLocaleString()} IA/mês</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Webhook className="w-4 h-4 text-green-500" />
                      <span>{plan.max_webhooks} webhooks</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirm(plan.id)}
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
      <Dialog open={isCreating || !!editingPlan} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setEditingPlan(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              {isCreating ? 'Criar Novo Plano' : 'Editar Plano'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Plano</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (único)</Label>
                  <Input
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                    placeholder="Ex: pro"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição curta do plano"
                  rows={2}
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Preço Mensal (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_monthly || 0}
                    onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Anual (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_yearly || ''}
                    onChange={(e) => setFormData({ ...formData, price_yearly: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ciclo</Label>
                  <Select
                    value={formData.billing_cycle}
                    onValueChange={(value) => setFormData({ ...formData, billing_cycle: value as EconomyPlan['billing_cycle'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                      <SelectItem value="lifetime">Vitalício</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Limits */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Limites e Créditos
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Créditos Inclusos</Label>
                    <Input
                      type="number"
                      value={formData.credits_included || 0}
                      onChange={(e) => setFormData({ ...formData, credits_included: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Máx. Instâncias</Label>
                    <Input
                      type="number"
                      value={formData.max_instances || 1}
                      onChange={(e) => setFormData({ ...formData, max_instances: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Máx. Flows</Label>
                    <Input
                      type="number"
                      value={formData.max_flows || 5}
                      onChange={(e) => setFormData({ ...formData, max_flows: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Msgs/Mês</Label>
                    <Input
                      type="number"
                      value={formData.max_messages_month || 1000}
                      onChange={(e) => setFormData({ ...formData, max_messages_month: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IA/Mês</Label>
                    <Input
                      type="number"
                      value={formData.max_ai_calls_month || 100}
                      onChange={(e) => setFormData({ ...formData, max_ai_calls_month: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Webhooks</Label>
                    <Input
                      type="number"
                      value={formData.max_webhooks || 5}
                      onChange={(e) => setFormData({ ...formData, max_webhooks: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Recursos Habilitados</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'chatbot', label: 'Chatbot', icon: Bot },
                    { key: 'flow_builder', label: 'Flow Builder', icon: Zap },
                    { key: 'luna_ai', label: 'Luna IA', icon: Sparkles },
                    { key: 'templates', label: 'Templates Pro', icon: Package },
                    { key: 'priority_support', label: 'Suporte Prioritário', icon: Star },
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{label}</span>
                      </div>
                      <Switch
                        checked={formData.features_enabled?.[key as keyof EconomyPlan['features_enabled']] ?? false}
                        onCheckedChange={(value) => updateFeature(key as keyof EconomyPlan['features_enabled'], value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Overusage & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Comportamento ao Exceder</Label>
                  <Select
                    value={formData.overusage_behavior}
                    onValueChange={(value) => setFormData({ ...formData, overusage_behavior: value as EconomyPlan['overusage_behavior'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Bloquear</SelectItem>
                      <SelectItem value="charge_credits">Cobrar Créditos</SelectItem>
                      <SelectItem value="suggest_upgrade">Sugerir Upgrade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prioridade ({formData.processing_priority}/10)</Label>
                  <Slider
                    value={[formData.processing_priority || 5]}
                    onValueChange={([value]) => setFormData({ ...formData, processing_priority: value })}
                    min={1}
                    max={10}
                    step={1}
                    className="mt-3"
                  />
                </div>
              </div>

              {/* Status Flags */}
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active ?? true}
                    onCheckedChange={(value) => setFormData({ ...formData, is_active: value })}
                  />
                  <Label>Plano Ativo</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_recommended ?? false}
                    onCheckedChange={(value) => setFormData({ ...formData, is_recommended: value })}
                  />
                  <Label>Recomendado</Label>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreating(false);
              setEditingPlan(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updatePlan.isPending || createPlan.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updatePlan.isPending || createPlan.isPending ? 'Salvando...' : 'Salvar'}
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
              Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.
              Usuários com este plano ativo serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Plano
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
