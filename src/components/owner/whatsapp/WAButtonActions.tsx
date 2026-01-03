import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  MousePointer, 
  ArrowRight, 
  Zap,
  ShoppingCart,
  CreditCard,
  UserCheck,
  MessageSquare,
  Settings,
  RefreshCw
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  template_type: string;
}

const ACTION_TYPES = [
  { value: 'send_template', label: 'Enviar Template', icon: MessageSquare, color: 'bg-blue-500' },
  { value: 'update_state', label: 'Atualizar Estado', icon: RefreshCw, color: 'bg-purple-500' },
  { value: 'create_order', label: 'Criar Pedido', icon: ShoppingCart, color: 'bg-green-500' },
  { value: 'confirm_order', label: 'Confirmar Pedido', icon: UserCheck, color: 'bg-emerald-500' },
  { value: 'send_payment', label: 'Enviar Pagamento', icon: CreditCard, color: 'bg-amber-500' },
  { value: 'confirm_payment', label: 'Confirmar Pagamento', icon: CreditCard, color: 'bg-teal-500' },
  { value: 'transfer_to_human', label: 'Transferir p/ Humano', icon: UserCheck, color: 'bg-red-500' },
  { value: 'update_crm', label: 'Atualizar CRM', icon: Settings, color: 'bg-indigo-500' },
  { value: 'send_followup', label: 'Enviar Follow-up', icon: ArrowRight, color: 'bg-pink-500' },
  { value: 'custom', label: 'Ação Customizada', icon: Zap, color: 'bg-gray-500' },
];

export function WAButtonActions() {
  const [actions, setActions] = useState<any[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    button_id: '',
    template_id: '',
    action_type: 'send_template',
    description: '',
    is_active: true,
    action_config: '{}',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [actionsRes, templatesRes] = await Promise.all([
        supabase
          .from('whatsapp_button_actions')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('whatsapp_interactive_templates')
          .select('id, name, template_type')
          .eq('is_active', true)
          .order('name'),
      ]);

      if (actionsRes.error) throw actionsRes.error;
      if (templatesRes.error) throw templatesRes.error;

      setActions(actionsRes.data || []);
      setTemplates(templatesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.button_id || !formData.action_type) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    let actionConfig: Record<string, unknown> = {};
    try {
      if (formData.action_config && formData.action_config !== '{}') {
        actionConfig = JSON.parse(formData.action_config);
      }
    } catch {
      toast.error('Config JSON inválido');
      return;
    }

    const data = {
      button_id: formData.button_id,
      template_id: formData.template_id || null,
      action_type: formData.action_type,
      description: formData.description || null,
      is_active: formData.is_active,
      action_config: actionConfig as Json,
    };

    try {
      if (editingAction) {
        const { error } = await supabase
          .from('whatsapp_button_actions')
          .update(data)
          .eq('id', editingAction.id);
        if (error) throw error;
        toast.success('Ação atualizada');
      } else {
        const { error } = await supabase
          .from('whatsapp_button_actions')
          .insert(data);
        if (error) throw error;
        toast.success('Ação criada');
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving action:', error);
      toast.error(error.message || 'Erro ao salvar');
    }
  };

  const handleEdit = (action: any) => {
    setEditingAction(action);
    setFormData({
      button_id: action.button_id,
      template_id: action.template_id || '',
      action_type: action.action_type,
      description: action.description || '',
      is_active: action.is_active,
      action_config: action.action_config ? JSON.stringify(action.action_config, null, 2) : '{}',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta ação?')) return;

    try {
      const { error } = await supabase
        .from('whatsapp_button_actions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Ação excluída');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir');
    }
  };

  const toggleActive = async (action: any) => {
    try {
      const { error } = await supabase
        .from('whatsapp_button_actions')
        .update({ is_active: !action.is_active })
        .eq('id', action.id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setEditingAction(null);
    setFormData({
      button_id: '',
      template_id: '',
      action_type: 'send_template',
      description: '',
      is_active: true,
      action_config: '{}',
    });
  };

  const getActionConfig = (type: string) => {
    return ACTION_TYPES.find(a => a.value === type) || ACTION_TYPES[ACTION_TYPES.length - 1];
  };

  const getTemplateName = (id: string | null) => {
    if (!id) return null;
    return templates.find(t => t.id === id)?.name;
  };

  const getNextTemplateId = (action: any): string | null => {
    if (!action.action_config) return null;
    const config = action.action_config as Record<string, unknown>;
    return (config.next_template_id as string) || null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Motor de Botões</h2>
          <p className="text-sm text-muted-foreground">
            Configure ações para cada botão dos templates
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Ação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAction ? 'Editar Ação' : 'Nova Ação de Botão'}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 p-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ID do Botão *</Label>
                    <Input
                      value={formData.button_id}
                      onChange={(e) => setFormData({ ...formData, button_id: e.target.value })}
                      placeholder="btn_confirmar"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Template de Origem</Label>
                    <Select
                      value={formData.template_id}
                      onValueChange={(v) => setFormData({ ...formData, template_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Opcional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Ação *</Label>
                  <Select
                    value={formData.action_type}
                    onValueChange={(v) => setFormData({ ...formData, action_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map(action => (
                        <SelectItem key={action.value} value={action.value}>
                          <div className="flex items-center gap-2">
                            <action.icon className="w-4 h-4" />
                            {action.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição da ação"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Configuração (JSON)</Label>
                  <Textarea
                    value={formData.action_config}
                    onChange={(e) => setFormData({ ...formData, action_config: e.target.value })}
                    placeholder='{"next_template_id": "...", "new_state": "checkout"}'
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use next_template_id para enviar outro template após a ação
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                  />
                  <Label>Ação Ativa</Label>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  {editingAction ? 'Atualizar' : 'Criar Ação'}
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : actions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <MousePointer className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma ação de botão configurada</p>
            <p className="text-sm">Crie ações para responder aos cliques de botões</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {actions.map(action => {
            const config = getActionConfig(action.action_type);
            const Icon = config.icon;
            const nextTemplateId = getNextTemplateId(action);
            
            return (
              <Card key={action.id} className={!action.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${config.color} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-0.5 rounded">
                            {action.button_id}
                          </code>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <Badge variant="outline">{config.label}</Badge>
                        </div>
                        {action.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {action.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {nextTemplateId && (
                            <span>
                              Próximo: <strong>{getTemplateName(nextTemplateId)}</strong>
                            </span>
                          )}
                          {action.template_id && (
                            <span>
                              Origem: <strong>{getTemplateName(action.template_id)}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={action.is_active}
                        onCheckedChange={() => toggleActive(action)}
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(action)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(action.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
