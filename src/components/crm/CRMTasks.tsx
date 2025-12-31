import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  CheckSquare,
  Phone,
  Calendar,
  MessageSquare,
  ClipboardList,
  MoreHorizontal,
  Edit,
  Trash2,
  Check,
  Clock,
  User,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useCRM } from '@/contexts/CRMContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string | null;
  task_type: 'call' | 'meeting' | 'followup' | 'internal';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: number;
  due_date: string | null;
  completed_at: string | null;
  lead_id: string | null;
  assigned_to: string | null;
  created_at: string;
  lead?: { name: string } | null;
  assignee?: { name: string } | null;
}

interface Lead {
  id: string;
  name: string;
}

interface CRMUser {
  id: string;
  name: string;
}

export default function CRMTasks() {
  const { crmTenant, crmUser } = useCRM();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<CRMUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'internal' as Task['task_type'],
    priority: 2,
    due_date: '',
    lead_id: '',
    assigned_to: '',
  });

  useEffect(() => {
    if (crmTenant) {
      fetchData();
    }
  }, [crmTenant]);

  const fetchData = async () => {
    if (!crmTenant) return;

    try {
      setIsLoading(true);

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('crm_tasks')
        .select(`
          *,
          lead:crm_leads(name),
          assignee:crm_users!crm_tasks_assigned_to_fkey(name)
        `)
        .eq('crm_tenant_id', crmTenant.id)
        .order('due_date', { ascending: true, nullsFirst: false });

      setTasks(tasksData || []);

      // Fetch leads
      const { data: leadsData } = await supabase
        .from('crm_leads')
        .select('id, name')
        .eq('crm_tenant_id', crmTenant.id)
        .in('status', ['new', 'active']);

      setLeads(leadsData || []);

      // Fetch users
      const { data: usersData } = await supabase
        .from('crm_users')
        .select('id, name')
        .eq('crm_tenant_id', crmTenant.id)
        .eq('is_active', true);

      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        task_type: task.task_type,
        priority: task.priority,
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        lead_id: task.lead_id || '',
        assigned_to: task.assigned_to || '',
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        task_type: 'internal',
        priority: 2,
        due_date: '',
        lead_id: '',
        assigned_to: crmUser?.id || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crmTenant || !formData.title.trim()) return;

    try {
      setIsSubmitting(true);

      const taskData = {
        crm_tenant_id: crmTenant.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        task_type: formData.task_type,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        lead_id: formData.lead_id || null,
        assigned_to: formData.assigned_to || null,
        created_by: crmUser?.id,
      };

      if (selectedTask) {
        const { error } = await supabase
          .from('crm_tasks')
          .update(taskData)
          .eq('id', selectedTask.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('crm_tasks')
          .insert(taskData);

        if (error) throw error;

        // Log to lead history if linked
        if (formData.lead_id) {
          await supabase.from('crm_lead_history').insert({
            crm_tenant_id: crmTenant.id,
            lead_id: formData.lead_id,
            user_id: crmUser?.id,
            action: 'task_created',
            new_value: { title: formData.title, type: formData.task_type },
          });
        }
      }

      toast({
        title: selectedTask ? 'Tarefa atualizada' : 'Tarefa criada',
        description: 'As alterações foram salvas com sucesso',
      });

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a tarefa',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    try {
      const { error } = await supabase
        .from('crm_tasks')
        .update({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', task.id);

      if (error) throw error;

      // Log to lead history if linked
      if (task.lead_id && newStatus === 'completed') {
        await supabase.from('crm_lead_history').insert({
          crm_tenant_id: crmTenant?.id,
          lead_id: task.lead_id,
          user_id: crmUser?.id,
          action: 'task_completed',
          new_value: { title: task.title, type: task.task_type },
        });
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: newStatus,
                completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
              }
            : t
        )
      );

      toast({
        title: newStatus === 'completed' ? 'Tarefa concluída' : 'Tarefa reaberta',
      });
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Deseja realmente excluir a tarefa "${task.title}"?`)) return;

    try {
      const { error } = await supabase
        .from('crm_tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      toast({
        title: 'Tarefa excluída',
        description: 'A tarefa foi removida com sucesso',
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a tarefa',
        variant: 'destructive',
      });
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'meeting':
        return <Calendar className="w-4 h-4" />;
      case 'followup':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <ClipboardList className="w-4 h-4" />;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'call':
        return 'Ligação';
      case 'meeting':
        return 'Reunião';
      case 'followup':
        return 'Follow-up';
      default:
        return 'Interna';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'text-red-500 bg-red-500/10';
      case 2:
        return 'text-amber-500 bg-amber-500/10';
      case 3:
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return 'Alta';
      case 2:
        return 'Média';
      case 3:
        return 'Baixa';
      default:
        return 'Normal';
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesType = typeFilter === 'all' || task.task_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const overdueCount = tasks.filter((t) => t.status !== 'completed' && isOverdue(t.due_date)).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tarefas</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{pendingCount} pendente{pendingCount !== 1 && 's'}</span>
            {overdueCount > 0 && (
              <span className="text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {overdueCount} atrasada{overdueCount !== 1 && 's'}
              </span>
            )}
          </div>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="call">Ligação</SelectItem>
                <SelectItem value="meeting">Reunião</SelectItem>
                <SelectItem value="followup">Follow-up</SelectItem>
                <SelectItem value="internal">Interna</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.02 }}
            >
              <Card
                className={`hover:shadow-md transition-shadow ${
                  task.status === 'completed' && 'opacity-60'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={() => toggleComplete(task)}
                      className="mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3
                            className={`font-medium ${
                              task.status === 'completed' && 'line-through'
                            }`}
                          >
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenModal(task)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(task)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant="secondary" className="gap-1">
                          {getTaskTypeIcon(task.task_type)}
                          {getTaskTypeLabel(task.task_type)}
                        </Badge>

                        <Badge className={getPriorityColor(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </Badge>

                        {task.due_date && (
                          <Badge
                            variant="outline"
                            className={
                              isOverdue(task.due_date) && task.status !== 'completed'
                                ? 'border-red-500 text-red-500'
                                : ''
                            }
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(task.due_date).toLocaleDateString('pt-BR')}
                          </Badge>
                        )}

                        {task.lead && (
                          <Badge variant="outline">
                            <User className="w-3 h-3 mr-1" />
                            {task.lead.name}
                          </Badge>
                        )}

                        {task.assignee && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            → {task.assignee.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Tente ajustar os filtros'
                  : 'Comece criando sua primeira tarefa'}
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <Button onClick={() => handleOpenModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </DialogTitle>
            <DialogDescription>
              {selectedTask
                ? 'Atualize as informações da tarefa'
                : 'Crie uma nova tarefa para acompanhamento'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título da tarefa"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task_type">Tipo</Label>
                <Select
                  value={formData.task_type}
                  onValueChange={(value: Task['task_type']) =>
                    setFormData({ ...formData, task_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Ligação</SelectItem>
                    <SelectItem value="meeting">Reunião</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="internal">Interna</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={String(formData.priority)}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Alta</SelectItem>
                    <SelectItem value="2">Média</SelectItem>
                    <SelectItem value="3">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Data de vencimento</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead">Lead vinculado</Label>
              <Select
                value={formData.lead_id}
                onValueChange={(value) => setFormData({ ...formData, lead_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um lead (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_to">Responsável</Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) =>
                  setFormData({ ...formData, assigned_to: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição da tarefa..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
                {isSubmitting ? 'Salvando...' : selectedTask ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
