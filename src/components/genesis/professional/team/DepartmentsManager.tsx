import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Users, Plus, Trash2, Edit, Loader2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface Department {
  id: string;
  instance_id: string;
  name: string;
  description: string;
  color: string;
  is_active: boolean;
  max_queue_size: number;
  auto_assign: boolean;
}

export function DepartmentsManager() {
  const { genesisUser } = useGenesisAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [instances, setInstances] = useState<{ id: string; name: string }[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    max_queue_size: 50,
    auto_assign: false,
  });

  useEffect(() => {
    fetchInstances();
  }, [genesisUser]);

  useEffect(() => {
    if (selectedInstance) fetchDepartments();
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

  const fetchDepartments = async () => {
    const { data } = await supabase
      .from('genesis_departments')
      .select('*')
      .eq('instance_id', selectedInstance)
      .order('name');

    setDepartments((data as Department[]) || []);
  };

  const openCreateDialog = () => {
    setEditingDept(null);
    setForm({ name: '', description: '', color: '#6366f1', max_queue_size: 50, auto_assign: false });
    setDialogOpen(true);
  };

  const openEditDialog = (dept: Department) => {
    setEditingDept(dept);
    setForm({
      name: dept.name,
      description: dept.description || '',
      color: dept.color,
      max_queue_size: dept.max_queue_size,
      auto_assign: dept.auto_assign,
    });
    setDialogOpen(true);
  };

  const saveDepartment = async () => {
    if (!form.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (editingDept) {
      const { error } = await supabase
        .from('genesis_departments')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', editingDept.id);

      if (error) {
        toast.error('Erro ao atualizar');
      } else {
        toast.success('Departamento atualizado!');
      }
    } else {
      const { error } = await supabase
        .from('genesis_departments')
        .insert({
          instance_id: selectedInstance,
          ...form,
        });

      if (error) {
        toast.error('Erro ao criar');
      } else {
        toast.success('Departamento criado!');
      }
    }

    setDialogOpen(false);
    fetchDepartments();
  };

  const toggleActive = async (dept: Department) => {
    await supabase
      .from('genesis_departments')
      .update({ is_active: !dept.is_active })
      .eq('id', dept.id);

    fetchDepartments();
  };

  const deleteDepartment = async (id: string) => {
    if (!confirm('Excluir departamento?')) return;

    await supabase.from('genesis_departments').delete().eq('id', id);
    toast.success('Excluído');
    fetchDepartments();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Departamentos</h2>
            <p className="text-sm text-muted-foreground">Organize sua equipe por setores</p>
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
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDept ? 'Editar' : 'Novo'} Departamento</DialogTitle>
                <DialogDescription>Configure os dados do departamento</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Label className="text-right">Nome</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="col-span-3"
                    placeholder="Vendas, Suporte, etc."
                  />
                </div>
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Label className="text-right">Descrição</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Label className="text-right">Cor</Label>
                  <div className="col-span-3 flex gap-2">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input value={form.color} className="font-mono" readOnly />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Label className="text-right">Fila Máx.</Label>
                  <Input
                    type="number"
                    value={form.max_queue_size}
                    onChange={(e) => setForm(f => ({ ...f, max_queue_size: parseInt(e.target.value) || 50 }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Label className="text-right">Auto-atribuir</Label>
                  <Switch
                    checked={form.auto_assign}
                    onCheckedChange={(v) => setForm(f => ({ ...f, auto_assign: v }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={saveDepartment}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* List */}
      {departments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum departamento criado</p>
            <Button className="mt-4" onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept, i) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`relative ${!dept.is_active && 'opacity-60'}`}>
                <div 
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
                  style={{ backgroundColor: dept.color }}
                />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      />
                      <CardTitle className="text-base">{dept.name}</CardTitle>
                    </div>
                    <Badge variant={dept.is_active ? 'default' : 'secondary'}>
                      {dept.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  {dept.description && (
                    <CardDescription>{dept.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>Fila máx: {dept.max_queue_size}</span>
                    {dept.auto_assign && <Badge variant="outline">Auto-atribuir</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(dept)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleActive(dept)}>
                      {dept.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteDepartment(dept.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
