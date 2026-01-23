import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Loader2, 
  MoreVertical,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Phone,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GenesisUser {
  id: string;
  auth_user_id: string;
  email: string;
  name: string;
  phone: string | null;
  company_name: string | null;
  is_active: boolean;
  created_at: string;
  // Dados de assinatura
  subscription_status?: string;
  subscription_plan?: string;
}

interface GenesisUsersTabProps {
  userId: string;
}

export const GenesisUsersTab = ({ userId }: GenesisUsersTabProps) => {
  const [users, setUsers] = useState<GenesisUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<GenesisUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company_name: '',
    is_active: true,
  });

  const fetchUsers = useCallback(async () => {
    try {
      // Buscar usuários
      const { data: usersData, error } = await supabase
        .from('genesis_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar assinaturas de todos os usuários
      const { data: subscriptionsData } = await supabase
        .from('genesis_subscriptions')
        .select('user_id, status, plan');

      // Mapear assinaturas por user_id
      const subsMap = new Map<string, { status: string; plan: string }>();
      (subscriptionsData || []).forEach((sub: { user_id: string; status: string; plan: string }) => {
        subsMap.set(sub.user_id, { status: sub.status, plan: sub.plan });
      });

      // Combinar dados
      const usersWithSubs = (usersData || []).map(user => ({
        ...user,
        subscription_status: subsMap.get(user.id)?.status || 'none',
        subscription_plan: subsMap.get(user.id)?.plan || 'free',
      }));

      setUsers(usersWithSubs);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', phone: '', company_name: '', is_active: true });
    setEditingUser(null);
    setShowPassword(false);
  };

  const openCreateModal = () => { resetForm(); setIsModalOpen(true); };

  const openEditModal = (user: GenesisUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      company_name: user.company_name || '',
      is_active: user.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Preencha nome e email');
      return;
    }
    if (!editingUser && !formData.password) {
      toast.error('Senha obrigatória');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        const { error } = await supabase
          .from('genesis_users')
          .update({
            name: formData.name,
            phone: formData.phone || null,
            company_name: formData.company_name || null,
            is_active: formData.is_active,
          })
          .eq('id', editingUser.id);
        if (error) throw error;
        toast.success('Usuário atualizado');
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (authError) throw authError;
        if (authData.user) {
          const { error } = await supabase.from('genesis_users').insert({
            auth_user_id: authData.user.id,
            email: formData.email,
            name: formData.name,
            phone: formData.phone || null,
            company_name: formData.company_name || null,
            is_active: formData.is_active,
          });
          if (error) throw error;
        }
        toast.success('Usuário criado');
      }
      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: GenesisUser) => {
    const { error } = await supabase.from('genesis_users').update({ is_active: !user.is_active }).eq('id', user.id);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
      toast.success(user.is_active ? 'Desativado' : 'Ativado');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('genesis_users').delete().eq('id', id);
    if (!error) {
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeleteConfirm(null);
      toast.success('Removido');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Gerenciar Usuários</h2>
            <p className="text-sm text-white/50">{users.length} usuário(s)</p>
          </div>
        </div>
        <Button onClick={openCreateModal} className="gap-2"><Plus className="w-4 h-4" />Novo Usuário</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
        <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white/5 border-white/10" style={{ borderRadius: '10px' }} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div>
      ) : filteredUsers.length === 0 ? (
        <Card className="border-dashed bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="flex flex-col items-center py-12">
            <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/50">{searchTerm ? 'Nenhum encontrado' : 'Nenhum usuário'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className={`bg-white/5 border-white/10 ${!user.is_active ? 'opacity-60' : ''}`} style={{ borderRadius: '14px' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate text-white">{user.name}</p>
                        {!user.is_active && <Badge variant="secondary" className="text-xs bg-white/10 text-white/50">Inativo</Badge>}
                        {/* Status de assinatura */}
                        {user.subscription_status === 'active' ? (
                          <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            {user.subscription_plan === 'enterprise' ? 'Enterprise' : 
                             user.subscription_plan === 'pro' ? 'Pro' : 
                             user.subscription_plan === 'basic' ? 'Básico' : 'Ativo'}
                          </Badge>
                        ) : user.subscription_status === 'none' ? (
                          <Badge variant="outline" className="text-xs border-white/20 text-white/40">Sem plano</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                            {user.subscription_status === 'trial' ? 'Trial' : user.subscription_status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-white/50 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="hidden md:block text-sm text-white/40">{formatDate(user.created_at)}</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditModal(user)}><Pencil className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                        {user.is_active ? <><UserX className="w-4 h-4 mr-2" />Desativar</> : <><UserCheck className="w-4 h-4 mr-2" />Ativar</>}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteConfirm(user.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={(o) => { setIsModalOpen(o); if (!o) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar' : 'Novo'} Usuário</DialogTitle>
            <DialogDescription>{editingUser ? 'Atualize os dados' : 'Preencha os dados'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} disabled={!!editingUser} />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label>Senha *</Label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Input value={formData.company_name} onChange={(e) => setFormData(p => ({ ...p, company_name: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData(p => ({ ...p, is_active: c }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{editingUser ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
