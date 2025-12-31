import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Building2, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Loader2,
  Search,
  RefreshCw,
  UserCog,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CRMTenant {
  id: string;
  name: string;
  segment: string | null;
  owner_user_id: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface CRMUser {
  id: string;
  crm_tenant_id: string;
  auth_user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'collaborator';
  is_active: boolean;
  created_at: string;
}

const segments = [
  'Tecnologia',
  'Saúde',
  'Educação',
  'Varejo',
  'Serviços',
  'Indústria',
  'Imobiliário',
  'Financeiro',
  'Marketing',
  'Consultoria',
  'Outro',
];

export default function CRMUsersManager() {
  const [tenants, setTenants] = useState<CRMTenant[]>([]);
  const [users, setUsers] = useState<CRMUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<CRMTenant | null>(null);
  
  // Modal states
  const [isCreateTenantOpen, setIsCreateTenantOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CRMUser | null>(null);
  
  // Form states
  const [tenantForm, setTenantForm] = useState({ name: '', segment: '' });
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'collaborator' as 'admin' | 'manager' | 'collaborator',
    tenantId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tenantsRes, usersRes] = await Promise.all([
        supabase.from('crm_tenants').select('*').order('created_at', { ascending: false }),
        supabase.from('crm_users').select('*').order('created_at', { ascending: false }),
      ]);

      if (tenantsRes.error) throw tenantsRes.error;
      if (usersRes.error) throw usersRes.error;

      setTenants(tenantsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error: any) {
      console.error('Error fetching CRM data:', error);
      toast.error('Erro ao carregar dados do CRM');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    if (!tenantForm.name) {
      toast.error('Nome da empresa é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a temporary owner_user_id (will be replaced when first admin is created)
      const tempOwnerId = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('crm_tenants')
        .insert({
          name: tenantForm.name,
          segment: tenantForm.segment || null,
          owner_user_id: tempOwnerId,
          onboarding_completed: true,
        })
        .select()
        .single();

      if (error) throw error;

      setTenants([data, ...tenants]);
      setTenantForm({ name: '', segment: '' });
      setIsCreateTenantOpen(false);
      toast.success('Empresa CRM criada com sucesso!');
    } catch (error: any) {
      console.error('Error creating tenant:', error);
      toast.error('Erro ao criar empresa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      // First delete all users of this tenant
      await supabase.from('crm_users').delete().eq('crm_tenant_id', tenantId);
      
      // Then delete the tenant
      const { error } = await supabase.from('crm_tenants').delete().eq('id', tenantId);
      if (error) throw error;

      setTenants(tenants.filter(t => t.id !== tenantId));
      setUsers(users.filter(u => u.crm_tenant_id !== tenantId));
      toast.success('Empresa CRM excluída com sucesso!');
    } catch (error: any) {
      console.error('Error deleting tenant:', error);
      toast.error('Erro ao excluir empresa');
    }
  };

  const handleCreateUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password || !userForm.tenantId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (userForm.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userForm.email,
        password: userForm.password,
        options: {
          data: {
            name: userForm.name,
            user_type: 'crm',
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Usuário não criado');

      // Create CRM user
      const { data: crmUserData, error: crmError } = await supabase
        .from('crm_users')
        .insert({
          crm_tenant_id: userForm.tenantId,
          auth_user_id: authData.user.id,
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          is_active: true,
        })
        .select()
        .single();

      if (crmError) throw crmError;

      // Update tenant owner if this is the first admin
      const tenant = tenants.find(t => t.id === userForm.tenantId);
      const tenantUsers = users.filter(u => u.crm_tenant_id === userForm.tenantId);
      
      if (userForm.role === 'admin' && tenantUsers.length === 0) {
        await supabase
          .from('crm_tenants')
          .update({ owner_user_id: authData.user.id })
          .eq('id', userForm.tenantId);
      }

      setUsers([crmUserData, ...users]);
      setUserForm({ name: '', email: '', password: '', role: 'collaborator', tenantId: '' });
      setIsCreateUserOpen(false);
      toast.success('Usuário CRM criado com sucesso!');
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Erro ao criar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUserActive = async (user: CRMUser) => {
    try {
      const { error } = await supabase
        .from('crm_users')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      if (error) throw error;

      setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
      toast.success(`Usuário ${user.is_active ? 'desativado' : 'ativado'} com sucesso!`);
    } catch (error: any) {
      console.error('Error toggling user:', error);
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const handleUpdateUserRole = async () => {
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('crm_users')
        .update({ role: userForm.role })
        .eq('id', editingUser.id);

      if (error) throw error;

      setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: userForm.role } : u));
      setEditingUser(null);
      setIsEditUserOpen(false);
      toast.success('Função atualizada com sucesso!');
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error('Erro ao atualizar função');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.from('crm_users').delete().eq('id', userId);
      if (error) throw error;

      setUsers(users.filter(u => u.id !== userId));
      toast.success('Usuário excluído com sucesso!');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.segment && t.segment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredUsers = selectedTenant
    ? users.filter(u => u.crm_tenant_id === selectedTenant.id)
    : users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Gestor</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Colaborador</Badge>;
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão CRM</h2>
          <p className="text-muted-foreground">
            Gerencie empresas e usuários do CRM
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={isCreateTenantOpen} onOpenChange={setIsCreateTenantOpen}>
            <DialogTrigger asChild>
              <Button>
                <Building2 className="w-4 h-4 mr-2" />
                Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Empresa CRM</DialogTitle>
                <DialogDescription>
                  Crie uma nova empresa para o CRM. Depois, adicione usuários a ela.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant-name">Nome da Empresa *</Label>
                  <Input
                    id="tenant-name"
                    value={tenantForm.name}
                    onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                    placeholder="Ex: Empresa ABC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant-segment">Segmento</Label>
                  <Select
                    value={tenantForm.segment}
                    onValueChange={(value) => setTenantForm({ ...tenantForm, segment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map((seg) => (
                        <SelectItem key={seg} value={seg}>
                          {seg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateTenantOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTenant} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Criar Empresa
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tenants.length}</p>
                <p className="text-sm text-muted-foreground">Empresas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-500/10">
                <XCircle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => !u.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresas ou usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={selectedTenant?.id || 'all'}
          onValueChange={(value) => setSelectedTenant(value === 'all' ? null : tenants.find(t => t.id === value) || null)}
        >
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Filtrar por empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {tenants.map((tenant) => (
              <SelectItem key={tenant.id} value={tenant.id}>
                {tenant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tenants Table */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Empresas CRM
            </CardTitle>
            <CardDescription>
              {filteredTenants.length} empresa(s) cadastrada(s)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Onboarding</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhuma empresa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>
                        {tenant.segment ? (
                          <Badge variant="outline">{tenant.segment}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {users.filter(u => u.crm_tenant_id === tenant.id).length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tenant.onboarding_completed ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Completo
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(tenant.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(tenant.id)}
                            title="Copiar ID"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Dialog open={isCreateUserOpen && userForm.tenantId === tenant.id} onOpenChange={(open) => {
                            setIsCreateUserOpen(open);
                            if (open) setUserForm({ ...userForm, tenantId: tenant.id });
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Adicionar usuário">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Novo Usuário CRM</DialogTitle>
                                <DialogDescription>
                                  Criar usuário para {tenant.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="user-name">Nome *</Label>
                                  <Input
                                    id="user-name"
                                    value={userForm.name}
                                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                    placeholder="Nome completo"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="user-email">Email *</Label>
                                  <Input
                                    id="user-email"
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    placeholder="email@exemplo.com"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="user-password">Senha *</Label>
                                  <div className="relative">
                                    <Input
                                      id="user-password"
                                      type={showPassword ? 'text' : 'password'}
                                      value={userForm.password}
                                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                      placeholder="Mínimo 6 caracteres"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-0 top-0 h-full"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="user-role">Função *</Label>
                                  <Select
                                    value={userForm.role}
                                    onValueChange={(value: 'admin' | 'manager' | 'collaborator') => 
                                      setUserForm({ ...userForm, role: value })
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
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                                  Cancelar
                                </Button>
                                <Button onClick={handleCreateUser} disabled={isSubmitting}>
                                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                  Criar Usuário
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive" title="Excluir">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Empresa?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação excluirá permanentemente a empresa "{tenant.name}" e todos os seus usuários. Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTenant(tenant.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Usuários CRM
            </CardTitle>
            <CardDescription>
              {filteredUsers.length} usuário(s) {selectedTenant ? `de ${selectedTenant.name}` : ''}
            </CardDescription>
          </div>
          <Button variant="outline" asChild>
            <a href="/crm/login" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Acessar CRM
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const tenant = tenants.find(t => t.id === user.crm_tenant_id);
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tenant?.name || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          {user.is_active ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Ativo
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog open={isEditUserOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                              setIsEditUserOpen(open);
                              if (open) {
                                setEditingUser(user);
                                setUserForm({ ...userForm, role: user.role });
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Editar função">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Editar Função</DialogTitle>
                                  <DialogDescription>
                                    Alterar função de {user.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Função</Label>
                                    <Select
                                      value={userForm.role}
                                      onValueChange={(value: 'admin' | 'manager' | 'collaborator') => 
                                        setUserForm({ ...userForm, role: value })
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
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                                    Cancelar
                                  </Button>
                                  <Button onClick={handleUpdateUserRole} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Salvar
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleUserActive(user)}
                              title={user.is_active ? 'Desativar' : 'Ativar'}
                            >
                              {user.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive" title="Excluir">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Usuário?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação excluirá permanentemente o usuário "{user.name}". Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}