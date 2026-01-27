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
  Building2,
  Sparkles,
  UserPlus
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
import { CreatePromotionalUserModal } from './promocional/CreatePromotionalUserModal';

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
  subscription_plan_name?: string;
  subscription_expires_at?: string;
}

interface PromotionalUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  whatsapp: string;
  type: string;
  available_balance: number;
  commission_rate: number;
  status: string;
  created_at: string;
}

interface GenesisUsersTabProps {
  userId: string;
}

export const GenesisUsersTab = ({ userId }: GenesisUsersTabProps) => {
  const [users, setUsers] = useState<GenesisUser[]>([]);
  const [promotionalUsers, setPromotionalUsers] = useState<PromotionalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPromotionalModalOpen, setIsPromotionalModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<GenesisUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'users' | 'promotional'>('users');
  const [defaultCommissionRate, setDefaultCommissionRate] = useState(10);
  
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
        .select('user_id, status, plan, plan_name, expires_at');

      // Mapear assinaturas por user_id
      const subsMap = new Map<string, { status: string; plan: string; plan_name: string | null; expires_at: string | null }>();
      (subscriptionsData || []).forEach((sub: { user_id: string; status: string; plan: string; plan_name: string | null; expires_at: string | null }) => {
        subsMap.set(sub.user_id, { status: sub.status, plan: sub.plan, plan_name: sub.plan_name, expires_at: sub.expires_at });
      });

      // Combinar dados
      const usersWithSubs = (usersData || []).map(user => {
        const sub = subsMap.get(user.id);
        // Verificar se está expirado
        const isExpired = sub?.expires_at ? new Date(sub.expires_at) < new Date() : false;
        const effectiveStatus = isExpired ? 'expired' : (sub?.status || 'none');
        
        return {
          ...user,
          subscription_status: effectiveStatus,
          subscription_plan: sub?.plan || 'free',
          subscription_plan_name: sub?.plan_name || null,
          subscription_expires_at: sub?.expires_at || null,
        };
      });

      setUsers(usersWithSubs);

      // Buscar usuários promocionais
      const { data: promoData } = await supabase
        .from('promotional_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      setPromotionalUsers(promoData || []);

      // Buscar configurações
      const { data: settingsData } = await supabase
        .from('promotional_settings')
        .select('default_commission_rate')
        .single();
      
      if (settingsData) {
        setDefaultCommissionRate(settingsData.default_commission_rate);
      }
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

  const filteredPromotionalUsers = promotionalUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Gerenciar Usuários</h2>
            <p className="text-sm text-muted-foreground">
              {users.length} usuário(s) • {promotionalUsers.length} promocional(is)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsPromotionalModalOpen(true)} 
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Influenciador/Parceiro
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-lg w-fit">
        <Button
          variant={activeView === 'users' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('users')}
          className="gap-2"
        >
          <Users className="w-4 h-4" />
          Usuários ({users.length})
        </Button>
        <Button
          variant={activeView === 'promotional' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('promotional')}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Promocionais ({promotionalUsers.length})
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : activeView === 'users' ? (
        // Users List
        filteredUsers.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-12">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{searchTerm ? 'Nenhum encontrado' : 'Nenhum usuário'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className={`${!user.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{user.name}</p>
                          {!user.is_active && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                          {/* Plano */}
                          {user.subscription_plan_name ? (
                            <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                              {user.subscription_plan_name}
                            </Badge>
                          ) : user.subscription_plan && user.subscription_plan !== 'free' ? (
                            <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {user.subscription_plan === 'starter' ? 'Mensal' : 
                               user.subscription_plan === 'pro' ? 'Trimestral' : 
                               user.subscription_plan === 'enterprise' ? 'Anual' : user.subscription_plan}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Free</Badge>
                          )}
                          {/* Status */}
                          {user.subscription_status === 'active' ? (
                            <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ativo</Badge>
                          ) : user.subscription_status === 'expired' ? (
                            <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">Expirado</Badge>
                          ) : user.subscription_status === 'trial' ? (
                            <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">Trial</Badge>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="truncate">{user.email}</span>
                          {user.subscription_expires_at && (
                            <span className="text-xs">
                              • Expira: {new Date(user.subscription_expires_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block text-sm text-muted-foreground">{formatDate(user.created_at)}</div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
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
        )
      ) : (
        // Promotional Users List
        filteredPromotionalUsers.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-12">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{searchTerm ? 'Nenhum encontrado' : 'Nenhum usuário promocional'}</p>
              <Button 
                variant="outline" 
                className="mt-4 gap-2" 
                onClick={() => setIsPromotionalModalOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
                Criar Primeiro
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredPromotionalUsers.map((user) => (
              <Card key={user.id} className={`${user.status !== 'active' ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{user.name}</p>
                          <Badge className={`text-xs ${
                            user.type === 'influencer' 
                              ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            {user.type === 'influencer' ? 'Influenciador' : 'Parceiro'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {user.commission_rate}% comissão
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="truncate">{user.email}</span>
                          <span className="text-xs">• Saldo: R$ {user.available_balance.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block text-sm text-muted-foreground">{formatDate(user.created_at)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Create/Edit User Modal */}
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

      {/* Delete Confirmation Modal */}
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

      {/* Create Promotional User Modal */}
      <CreatePromotionalUserModal
        isOpen={isPromotionalModalOpen}
        onClose={() => setIsPromotionalModalOpen(false)}
        onSuccess={fetchUsers}
        defaultCommissionRate={defaultCommissionRate}
      />
    </div>
  );
};
