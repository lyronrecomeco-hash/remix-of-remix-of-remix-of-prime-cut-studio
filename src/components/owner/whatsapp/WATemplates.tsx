import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Edit, 
  Loader2, 
  Save,
  Plus,
  MessageSquare,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AutomationTemplate {
  id: string;
  template_type: string;
  name: string;
  message_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const WATemplates = () => {
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<AutomationTemplate | null>(null);
  const [templateMessage, setTemplateMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New template state
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('custom');
  const [newMessage, setNewMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_automation_templates')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTemplates((data || []) as AutomationTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (template: AutomationTemplate) => {
    setEditingTemplate(template);
    setTemplateMessage(template.message_template);
  };

  const saveTemplate = async () => {
    if (!editingTemplate) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('whatsapp_automation_templates')
        .update({
          message_template: templateMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTemplate.id);

      if (error) throw error;

      toast.success('Template salvo!');
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Erro ao salvar template');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTemplateActive = async (template: AutomationTemplate) => {
    try {
      const { error } = await supabase
        .from('whatsapp_automation_templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id);

      if (error) throw error;

      toast.success(`Template ${template.is_active ? 'desativado' : 'ativado'}!`);
      fetchTemplates();
    } catch (error) {
      console.error('Error toggling template:', error);
      toast.error('Erro ao alterar template');
    }
  };

  const createTemplate = async () => {
    if (!newName.trim() || !newMessage.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('whatsapp_automation_templates')
        .insert({
          name: newName,
          template_type: newType,
          message_template: newMessage,
          is_active: true,
        });

      if (error) throw error;

      toast.success('Template criado!');
      setIsNewDialogOpen(false);
      setNewName('');
      setNewType('custom');
      setNewMessage('');
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Erro ao criar template');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_automation_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Template removido!');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Erro ao remover template');
    }
  };

  const copyTemplate = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success('Template copiado!');
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      collaborator_token: 'Token Colaborador',
      welcome: 'Boas-vindas',
      notification: 'Notificação',
      reminder: 'Lembrete',
      custom: 'Personalizado',
    };
    return types[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      collaborator_token: 'bg-purple-500/10 text-purple-500',
      welcome: 'bg-green-500/10 text-green-500',
      notification: 'bg-blue-500/10 text-blue-500',
      reminder: 'bg-yellow-500/10 text-yellow-500',
      custom: 'bg-gray-500/10 text-gray-500',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Templates de Mensagens</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie templates para automações e envios
          </p>
        </div>
        <Button onClick={() => setIsNewDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Variables Help */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Variáveis Disponíveis
          </h4>
          <div className="flex flex-wrap gap-2 text-sm">
            <code className="bg-background px-2 py-1 rounded">{'{{nome}}'}</code>
            <code className="bg-background px-2 py-1 rounded">{'{{token}}'}</code>
            <code className="bg-background px-2 py-1 rounded">{'{{link}}'}</code>
            <code className="bg-background px-2 py-1 rounded">{'{{empresa}}'}</code>
            <code className="bg-background px-2 py-1 rounded">{'{{data}}'}</code>
            <code className="bg-background px-2 py-1 rounded">{'{{hora}}'}</code>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id} className={!template.is_active ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {template.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeBadgeColor(template.template_type)}>
                      {getTypeLabel(template.template_type)}
                    </Badge>
                    {!template.is_active && (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </div>
                </div>
                <Switch
                  checked={template.is_active}
                  onCheckedChange={() => toggleTemplateActive(template)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                  {template.message_template}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Atualizado: {new Date(template.updated_at).toLocaleDateString('pt-BR')}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyTemplate(template.message_template, template.id)}
                  >
                    {copiedId === template.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {template.template_type === 'custom' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium mb-2">Nenhum template</h3>
              <p className="text-muted-foreground mb-4">
                Crie templates para usar em automações
              </p>
              <Button onClick={() => setIsNewDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
            <DialogDescription>
              {editingTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                value={templateMessage}
                onChange={(e) => setTemplateMessage(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use *texto* para negrito, _texto_ para itálico
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Cancelar
            </Button>
            <Button onClick={saveTemplate} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Template Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Template</DialogTitle>
            <DialogDescription>
              Crie um novo template de mensagem
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Template</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Boas-vindas Cliente"
              />
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={8}
                placeholder="Olá {{nome}}! Seja bem-vindo..."
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createTemplate} disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
