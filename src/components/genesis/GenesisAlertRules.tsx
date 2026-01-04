import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Bell, Plus, Trash2, Edit, AlertTriangle, Activity, 
  Clock, Zap, Cpu, HardDrive, Heart, ToggleLeft, ToggleRight 
} from 'lucide-react';

interface AlertRule {
  id: string;
  name: string;
  description: string | null;
  metric_type: string;
  condition_operator: string;
  threshold_value: number;
  alert_severity: string;
  evaluation_window_minutes: number;
  cooldown_minutes: number;
  is_enabled: boolean;
  notify_email: boolean;
  notify_webhook: boolean;
  webhook_url: string | null;
  instance_id: string | null;
  trigger_count: number;
  last_triggered_at: string | null;
}

const METRIC_TYPES = [
  { value: 'disconnection_count', label: 'Desconexões', icon: AlertTriangle },
  { value: 'failure_rate', label: 'Taxa de Falha (%)', icon: Activity },
  { value: 'response_time', label: 'Tempo de Resposta (ms)', icon: Clock },
  { value: 'cpu_usage', label: 'Uso de CPU (%)', icon: Cpu },
  { value: 'memory_usage', label: 'Uso de Memória (%)', icon: HardDrive },
  { value: 'health_score', label: 'Health Score', icon: Heart },
];

const OPERATORS = [
  { value: 'gt', label: 'Maior que (>)' },
  { value: 'gte', label: 'Maior ou igual (>=)' },
  { value: 'lt', label: 'Menor que (<)' },
  { value: 'lte', label: 'Menor ou igual (<=)' },
  { value: 'eq', label: 'Igual (=)' },
];

const SEVERITIES = [
  { value: 'info', label: 'Info', color: 'bg-blue-500' },
  { value: 'warning', label: 'Aviso', color: 'bg-yellow-500' },
  { value: 'critical', label: 'Crítico', color: 'bg-red-500' },
];

export function GenesisAlertRules() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    metric_type: 'disconnection_count',
    condition_operator: 'gt',
    threshold_value: 5,
    alert_severity: 'warning',
    evaluation_window_minutes: 60,
    cooldown_minutes: 30,
    notify_email: false,
    notify_webhook: false,
    webhook_url: '',
  });

  const { data: rules, isLoading } = useQuery({
    queryKey: ['genesis-alert-rules'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('genesis-metrics', {
        body: { action: 'get_alert_rules' }
      });
      if (error) throw error;
      return data.rules as AlertRule[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (rule: typeof formData) => {
      const { data, error } = await supabase.functions.invoke('genesis-metrics', {
        body: { action: 'create_alert_rule', rule }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genesis-alert-rules'] });
      toast.success('Regra criada com sucesso');
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => toast.error('Erro ao criar regra')
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<typeof formData> }) => {
      const { data, error } = await supabase.functions.invoke('genesis-metrics', {
        body: { action: 'update_alert_rule', rule_id: id, updates }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genesis-alert-rules'] });
      toast.success('Regra atualizada');
      setEditingRule(null);
      resetForm();
    },
    onError: () => toast.error('Erro ao atualizar regra')
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { data, error } = await supabase.functions.invoke('genesis-metrics', {
        body: { action: 'toggle_alert_rule', rule_id: id, enabled }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genesis-alert-rules'] });
      toast.success('Regra atualizada');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('genesis-metrics', {
        body: { action: 'delete_alert_rule', rule_id: id }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genesis-alert-rules'] });
      toast.success('Regra excluída');
    },
    onError: () => toast.error('Erro ao excluir regra')
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      metric_type: 'disconnection_count',
      condition_operator: 'gt',
      threshold_value: 5,
      alert_severity: 'warning',
      evaluation_window_minutes: 60,
      cooldown_minutes: 30,
      notify_email: false,
      notify_webhook: false,
      webhook_url: '',
    });
  };

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      metric_type: rule.metric_type,
      condition_operator: rule.condition_operator,
      threshold_value: rule.threshold_value,
      alert_severity: rule.alert_severity,
      evaluation_window_minutes: rule.evaluation_window_minutes,
      cooldown_minutes: rule.cooldown_minutes,
      notify_email: rule.notify_email,
      notify_webhook: rule.notify_webhook,
      webhook_url: rule.webhook_url || '',
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getMetricIcon = (type: string) => {
    const metric = METRIC_TYPES.find(m => m.value === type);
    return metric?.icon || Activity;
  };

  const getOperatorLabel = (op: string) => {
    return OPERATORS.find(o => o.value === op)?.label || op;
  };

  const getSeverityBadge = (severity: string) => {
    const sev = SEVERITIES.find(s => s.value === severity);
    return (
      <Badge className={`${sev?.color} text-white`}>
        {sev?.label || severity}
      </Badge>
    );
  };

  const RuleForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Nome da Regra</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Alta taxa de falhas"
          />
        </div>
        
        <div className="col-span-2">
          <Label>Descrição (opcional)</Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descreva quando esta regra deve alertar"
          />
        </div>

        <div>
          <Label>Métrica</Label>
          <Select
            value={formData.metric_type}
            onValueChange={(v) => setFormData(prev => ({ ...prev, metric_type: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRIC_TYPES.map(m => (
                <SelectItem key={m.value} value={m.value}>
                  <div className="flex items-center gap-2">
                    <m.icon className="h-4 w-4" />
                    {m.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Severidade</Label>
          <Select
            value={formData.alert_severity}
            onValueChange={(v) => setFormData(prev => ({ ...prev, alert_severity: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITIES.map(s => (
                <SelectItem key={s.value} value={s.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${s.color}`} />
                    {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Condição</Label>
          <Select
            value={formData.condition_operator}
            onValueChange={(v) => setFormData(prev => ({ ...prev, condition_operator: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Valor Limite</Label>
          <Input
            type="number"
            value={formData.threshold_value}
            onChange={(e) => setFormData(prev => ({ ...prev, threshold_value: Number(e.target.value) }))}
          />
        </div>

        <div>
          <Label>Janela de Avaliação (min)</Label>
          <Input
            type="number"
            value={formData.evaluation_window_minutes}
            onChange={(e) => setFormData(prev => ({ ...prev, evaluation_window_minutes: Number(e.target.value) }))}
          />
        </div>

        <div>
          <Label>Cooldown (min)</Label>
          <Input
            type="number"
            value={formData.cooldown_minutes}
            onChange={(e) => setFormData(prev => ({ ...prev, cooldown_minutes: Number(e.target.value) }))}
          />
        </div>

        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <Label>Notificar por Email</Label>
            <Switch
              checked={formData.notify_email}
              onCheckedChange={(v) => setFormData(prev => ({ ...prev, notify_email: v }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Notificar por Webhook</Label>
            <Switch
              checked={formData.notify_webhook}
              onCheckedChange={(v) => setFormData(prev => ({ ...prev, notify_webhook: v }))}
            />
          </div>

          {formData.notify_webhook && (
            <div>
              <Label>URL do Webhook</Label>
              <Input
                value={formData.webhook_url}
                onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => {
          setIsCreateOpen(false);
          setEditingRule(null);
          resetForm();
        }}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
          {editingRule ? 'Salvar' : 'Criar Regra'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Regras de Alerta
          </h2>
          <p className="text-muted-foreground">Configure alertas automáticos para suas instâncias</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Regra de Alerta</DialogTitle>
            </DialogHeader>
            <RuleForm />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-6 bg-muted rounded w-1/2" /></CardHeader>
              <CardContent><div className="h-20 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : !rules?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">Nenhuma regra configurada</h3>
            <p className="text-muted-foreground text-center max-w-sm mt-1">
              Crie regras para receber alertas automáticos quando métricas ultrapassarem limites definidos
            </p>
            <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Regra
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rules.map(rule => {
            const MetricIcon = getMetricIcon(rule.metric_type);
            return (
              <Card key={rule.id} className={!rule.is_enabled ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MetricIcon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{rule.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(rule.alert_severity)}
                      <Switch
                        checked={rule.is_enabled}
                        onCheckedChange={(enabled) => toggleMutation.mutate({ id: rule.id, enabled })}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rule.description && (
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
                    <Zap className="h-4 w-4" />
                    <span>
                      {METRIC_TYPES.find(m => m.value === rule.metric_type)?.label} {' '}
                      {getOperatorLabel(rule.condition_operator)} {' '}
                      <strong>{rule.threshold_value}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Janela: {rule.evaluation_window_minutes}min</span>
                    <span>Cooldown: {rule.cooldown_minutes}min</span>
                    {rule.trigger_count > 0 && (
                      <span className="text-yellow-600">Disparos: {rule.trigger_count}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(rule)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm('Excluir esta regra?')) {
                          deleteMutation.mutate(rule.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog para edição */}
      <Dialog open={!!editingRule} onOpenChange={(open) => !open && setEditingRule(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Regra de Alerta</DialogTitle>
          </DialogHeader>
          <RuleForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
