import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  UserCog,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { useCRM } from '@/contexts/CRMContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CRMUserData {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'collaborator';
  is_active: boolean;
  created_at: string;
  leadsCount?: number;
  tasksCount?: number;
}

export default function CRMUsers() {
  const { crmTenant, crmUser, isAdmin } = useCRM();
  const { toast } = useToast();
  const [users, setUsers] = useState<CRMUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CRMUserData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'collaborator' as CRMUserData['role'],
  });

  useEffect(() => {
    if (crmTenant) {
      fetchUsers();
    }
  }, [crmTenant]);

  const fetchUsers = async () => {
    if (!crmTenant) return;

    try {
      setIsLoading(true);

      const { data: usersData } = await supabase
        .from('crm_users')
        .select('*')
        .eq('crm_tenant_id', crmTenant.id)
        .order('created_at');

      if (usersData) {
        // Get leads and tasks count
        const { data: leadsData } = await supabase
          .from('crm_leads')
          .select('id, responsible_id')
          .eq('crm_tenant_id', crmTenant.id);

        const { data: tasksData } = await supabase
          .from('crm_tasks')
          .select('id, assigned_to')
          .eq('crm_tenant_id', crmTenant.id);

        const enrichedUsers = usersData.map((user) => ({
          ...user,
          role: user.role as CRMUserData['role'],
          leadsCount: leadsData?.filter((l) => l.responsible_id === user.id).length || 0,
          tasksCount: tasksData?.filter((t) => t.assigned_to === user.id).length || 0,
        }));

        setUsers(enrichedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (user?: CRMUserData) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'collaborator',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crmTenant || !formData.name.trim() || !formData.email.trim()) return;

    try {
      setIsSubmitting(true);

      if (selectedUser) {
        // Update existing user
        const { error } = await supabase
          .from('crm_users')
          .update({
            name: formData.name.trim(),
            email: formData.email.trim(),
            role: formData.role,
          })
          .eq('id', selectedUser.id);

        if (error) throw error;

        toast({
          title: 'Usuário atualizado',
          description: 'As alterações foram salvas',
        });
      } else {
        // For new users, we just create a placeholder
        // In a real scenario, you would invite via email or create auth account
        toast({
          title: 'Atenção',
          description: 'Novos usuários devem ser criados pelo Owner Panel',
          variant: 'destructive',
        });
        setIsModalOpen(false);
        return;
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o usuário',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (user: CRMUserData) => {
    if (user.id === crmUser?.id) {
      toast({
        title: 'Atenção',
        description: 'Você não pode desativar sua própria conta',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('crm_users')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_active: !u.is_active } : u
        )
      );

      toast({
        title: user.is_active ? 'Usuário desativado' : 'Usuário ativado',
      });
    } catch (error) {
      console.error('Error toggling user:', error);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gestor';
      default:
        return 'Colaborador';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-500';
      case 'manager':
        return 'bg-amber-500/20 text-amber-500';
      default:
        return 'bg-blue-500/20 text-blue-500';
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Acesso restrito</h3>
            <p className="text-muted-foreground">
              Apenas administradores podem gerenciar usuários
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded" />
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
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">
            {users.length} usuário{users.length !== 1 && 's'} no CRM
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <p className="text-sm">
            <strong>Nota:</strong> Novos usuários do CRM devem ser criados através do{' '}
            <span className="text-primary">Owner Panel</span>. Aqui você pode apenas
            gerenciar usuários existentes.
          </p>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`hover:shadow-lg transition-all ${
                !user.is_active && 'opacity-60'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {user.name}
                        {user.id === crmUser?.id && (
                          <Badge variant="outline" className="text-xs">
                            Você
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenModal(user)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Badge className={getRoleColor(user.role)}>
                    <Shield className="w-3 h-3 mr-1" />
                    {getRoleLabel(user.role)}
                  </Badge>
                  {!user.is_active && (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Leads</p>
                    <p className="font-semibold">{user.leadsCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tarefas</p>
                    <p className="font-semibold">{user.tasksCount}</p>
                  </div>
                </div>

                {user.id !== crmUser?.id && (
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ativo</span>
                    <Switch
                      checked={user.is_active}
                      onCheckedChange={() => toggleActive(user)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredUsers.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <UserCog className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar a busca
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do usuário"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                required
                disabled
              />
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select
                value={formData.role}
                onValueChange={(value: CRMUserData['role']) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="manager">Gestor</SelectItem>
                  <SelectItem value="collaborator">Colaborador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
