/**
 * Economy Consumption Rules Manager - Owner Panel
 * Define credit costs for each action
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings2,
  Edit2,
  Save,
  X,
  MessageSquare,
  Bot,
  Zap,
  Webhook,
  Activity,
  AlertCircle,
  CheckCircle,
  Plus,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useConsumptionRules,
  useUpdateConsumptionRule,
  useCreateConsumptionRule,
  ConsumptionRule,
} from '@/hooks/useGenesisEconomy';
import { cn } from '@/lib/utils';

const actionIcons: Record<string, React.ElementType> = {
  whatsapp_message_sent: MessageSquare,
  whatsapp_message_received: MessageSquare,
  ai_response: Bot,
  flow_execution: Zap,
  webhook_call: Webhook,
  ai_analysis: Activity,
};

const priorityLabels = {
  plan_first: 'Plano Primeiro',
  credits_first: 'Créditos Primeiro',
  plan_only: 'Apenas Plano',
  credits_only: 'Apenas Créditos',
};

const defaultRule: Partial<ConsumptionRule> = {
  action_type: '',
  action_label: '',
  credits_cost: 1,
  description: '',
  is_active: true,
  priority_source: 'plan_first',
};

export default function EconomyRulesManager() {
  const { data: rules, isLoading } = useConsumptionRules();
  const updateRule = useUpdateConsumptionRule();
  const createRule = useCreateConsumptionRule();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ConsumptionRule>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<ConsumptionRule>>(defaultRule);

  const handleEditStart = (rule: ConsumptionRule) => {
    setEditingId(rule.id);
    setEditData(rule);
  };

  const handleEditSave = () => {
    if (editingId) {
      updateRule.mutate({ id: editingId, ...editData }, {
        onSuccess: () => {
          setEditingId(null);
          setEditData({});
        },
      });
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleCreate = () => {
    createRule.mutate(formData as Omit<ConsumptionRule, 'id' | 'created_at' | 'updated_at'>, {
      onSuccess: () => {
        setIsCreating(false);
        setFormData(defaultRule);
      },
    });
  };

  const handleToggleActive = (rule: ConsumptionRule) => {
    updateRule.mutate({ id: rule.id, is_active: !rule.is_active });
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
            <Settings2 className="w-5 h-5 text-primary" />
            Regras de Consumo
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Defina quantos créditos cada ação consome
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Regra
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {rules?.filter(r => r.is_active).length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Regras Ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {rules?.reduce((sum, r) => sum + Number(r.credits_cost), 0).toFixed(1) || 0}
              </div>
              <p className="text-sm text-muted-foreground">Custo Total por Ciclo</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                R$ {((rules?.reduce((sum, r) => sum + Number(r.credits_cost), 0) || 0) * 0.10).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">Custo Estimado (R$0,10/cred)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tabela de Custos por Ação</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ação</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules?.map((rule) => {
                const Icon = actionIcons[rule.action_type] || Activity;
                const isEditing = editingId === rule.id;

                return (
                  <TableRow key={rule.id} className={cn(!rule.is_active && "opacity-50")}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{rule.action_label}</p>
                          <p className="text-xs text-muted-foreground">{rule.action_type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.1"
                          className="w-20"
                          value={editData.credits_cost || 0}
                          onChange={(e) => setEditData({ ...editData, credits_cost: parseFloat(e.target.value) })}
                        />
                      ) : (
                        <Badge variant="outline" className="font-mono">
                          {Number(rule.credits_cost).toFixed(1)} G
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={editData.priority_source}
                          onValueChange={(value) => setEditData({ ...editData, priority_source: value as ConsumptionRule['priority_source'] })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plan_first">Plano Primeiro</SelectItem>
                            <SelectItem value="credits_first">Créditos Primeiro</SelectItem>
                            <SelectItem value="plan_only">Apenas Plano</SelectItem>
                            <SelectItem value="credits_only">Apenas Créditos</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {priorityLabels[rule.priority_source]}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className="flex items-center gap-1"
                      >
                        {rule.is_active ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Inativo
                          </Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                            <X className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={handleEditSave} disabled={updateRule.isPending}>
                            <Save className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleEditStart(rule)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Rule Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nova Regra de Consumo
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Ação (slug)</Label>
              <Input
                value={formData.action_type || ''}
                onChange={(e) => setFormData({ ...formData, action_type: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                placeholder="ex: custom_action"
              />
            </div>

            <div className="space-y-2">
              <Label>Nome da Ação</Label>
              <Input
                value={formData.action_label || ''}
                onChange={(e) => setFormData({ ...formData, action_label: e.target.value })}
                placeholder="ex: Ação Personalizada"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Custo em Créditos</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.credits_cost || 1}
                  onChange={(e) => setFormData({ ...formData, credits_cost: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={formData.priority_source}
                  onValueChange={(value) => setFormData({ ...formData, priority_source: value as ConsumptionRule['priority_source'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plan_first">Plano Primeiro</SelectItem>
                    <SelectItem value="credits_first">Créditos Primeiro</SelectItem>
                    <SelectItem value="plan_only">Apenas Plano</SelectItem>
                    <SelectItem value="credits_only">Apenas Créditos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da ação..."
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Regra Ativa</Label>
              <Switch
                checked={formData.is_active ?? true}
                onCheckedChange={(value) => setFormData({ ...formData, is_active: value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createRule.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Criar Regra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
