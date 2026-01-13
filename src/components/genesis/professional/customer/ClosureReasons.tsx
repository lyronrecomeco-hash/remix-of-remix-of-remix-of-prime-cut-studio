import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CheckCircle, Plus, Trash2, Edit, Loader2, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClosureReason {
  id: string;
  name: string;
  description: string;
  category: string;
  requires_note: boolean;
  is_active: boolean;
  sort_order: number;
}

export function ClosureReasons() {
  const { genesisUser } = useGenesisAuth();
  const [reasons, setReasons] = useState<ClosureReason[]>([]);
  const [instances, setInstances] = useState<{ id: string; name: string }[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReason, setEditingReason] = useState<ClosureReason | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'general',
    requires_note: false,
  });

  useEffect(() => {
    fetchInstances();
  }, [genesisUser]);

  useEffect(() => {
    if (selectedInstance) fetchReasons();
  }, [selectedInstance]);

  const fetchInstances = async () => {
    if (!genesisUser) return;

    const { data } = await supabase
      .from('genesis_instances')
      .select('id, name')
      .eq('user_id', genesisUser.id);

    if (data && data.length > 0) {
      setInstances(data);
      setSelectedInstance(data[0].id);
    }
    setLoading(false);
  };

  const fetchReasons = async () => {
    const { data } = await supabase
      .from('genesis_closure_reasons')
      .select('*')
      .eq('instance_id', selectedInstance)
      .order('sort_order');

    setReasons((data as ClosureReason[]) || []);
  };

  const openCreateDialog = () => {
    setEditingReason(null);
    setForm({ name: '', description: '', category: 'general', requires_note: false });
    setDialogOpen(true);
  };

  const openEditDialog = (reason: ClosureReason) => {
    setEditingReason(reason);
    setForm({
      name: reason.name,
      description: reason.description || '',
      category: reason.category,
      requires_note: reason.requires_note,
    });
    setDialogOpen(true);
  };

  const saveReason = async () => {
    if (!form.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (editingReason) {
      await supabase
        .from('genesis_closure_reasons')
        .update(form)
        .eq('id', editingReason.id);
      toast.success('Motivo atualizado!');
    } else {
      await supabase
        .from('genesis_closure_reasons')
        .insert({
          instance_id: selectedInstance,
          ...form,
          sort_order: reasons.length,
        });
      toast.success('Motivo criado!');
    }

    setDialogOpen(false);
    fetchReasons();
  };

  const deleteReason = async (id: string) => {
    if (!confirm('Excluir motivo?')) return;
    await supabase.from('genesis_closure_reasons').delete().eq('id', id);
    toast.success('Excluído');
    fetchReasons();
  };

  const toggleActive = async (reason: ClosureReason) => {
    await supabase
      .from('genesis_closure_reasons')
      .update({ is_active: !reason.is_active })
      .eq('id', reason.id);
    fetchReasons();
  };

  const categories = [
    { value: 'general', label: 'Geral' },
    { value: 'resolved', label: 'Resolvido' },
    { value: 'no_response', label: 'Sem Resposta' },
    { value: 'spam', label: 'Spam' },
    { value: 'transferred', label: 'Transferido' },
    { value: 'other', label: 'Outro' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Motivos de Finalização</h2>
            <p className="text-sm text-muted-foreground">Categorize o encerramento de atendimentos</p>
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedInstance}
            onChange={(e) => setSelectedInstance(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-background text-sm"
          >
            {instances.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Motivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingReason ? 'Editar' : 'Novo'} Motivo</DialogTitle>
                <DialogDescription>Configure o motivo de finalização</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: Cliente satisfeito"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Exigir observação</Label>
                  <Switch
                    checked={form.requires_note}
                    onCheckedChange={(v) => setForm(f => ({ ...f, requires_note: v }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={saveReason}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Lista */}
      {reasons.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum motivo cadastrado</p>
            <Button className="mt-4" onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`${!reason.is_active && 'opacity-60'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{reason.name}</span>
                          <Badge variant="outline">{categories.find(c => c.value === reason.category)?.label}</Badge>
                          {reason.requires_note && (
                            <Badge variant="secondary" className="text-xs">Requer nota</Badge>
                          )}
                        </div>
                        {reason.description && (
                          <p className="text-sm text-muted-foreground">{reason.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(reason)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleActive(reason)}>
                        {reason.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteReason(reason.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
