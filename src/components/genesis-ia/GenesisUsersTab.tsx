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
  Crown,
  Sparkles,
  Handshake
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WelcomeCredentialsModal } from './users/WelcomeCredentialsModal';

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
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [createdUserData, setCreatedUserData] = useState<{
    name: string;
    email: string;
    password: string;
    userType: 'client' | 'influencer' | 'partner';
  } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company_name: '',
    is_active: true,
    user_type: 'client' as 'client' | 'influencer' | 'partner',
  });

  const USER_TYPE_CONFIG = {
    client: { label: 'Cliente', icon: Crown, className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    influencer: { label: 'Influencer', icon: Sparkles, className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    partner: { label: 'Parceiro', icon: Handshake, className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  };

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
    setFormData({ name: '', email: '', password: '', phone: '', company_name: '', is_active: true, user_type: 'client' });
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
      user_type: 'client', // Default, pois não temos essa info no user ainda
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

          // Criar subscription se for influencer ou partner (sem pagamento)
          if (formData.user_type !== 'client') {
            const { data: newGenesisUser } = await supabase
              .from('genesis_users')
              .select('id')
              .eq('auth_user_id', authData.user.id)
              .single();

            if (newGenesisUser) {
              await supabase.from('genesis_subscriptions').insert([{
                user_id: newGenesisUser.id,
                plan: 'starter',
                plan_name: formData.user_type === 'influencer' ? 'Influencer' : 'Parceiro',
                status: 'active',
                user_type: formData.user_type,
                started_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              }]);
            }
          }

          // Mostrar modal de boas-vindas
          setCreatedUserData({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            userType: formData.user_type,
          });
          setShowWelcomeModal(true);
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
                          <Badge variant="outline" className="text-xs border-white/20 text-white/40">Free</Badge>
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
                      <div className="flex items-center gap-2 text-sm text-white/50">
                        <span className="truncate">{user.email}</span>
                        {user.subscription_expires_at && (
                          <span className="text-xs text-white/30">
                            • Expira: {new Date(user.subscription_expires_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
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
            {!editingUser && (
              <div className="space-y-2">
                <Label>Tipo de Usuário *</Label>
                <Select
                  value={formData.user_type}
                  onValueChange={(value) => setFormData(p => ({ ...p, user_type: value as 'client' | 'influencer' | 'partner' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">👑 Cliente (Pagante)</SelectItem>
                    <SelectItem value="influencer">✨ Influencer (Promocional)</SelectItem>
                    <SelectItem value="partner">🤝 Parceiro (Promocional)</SelectItem>
                  </SelectContent>
                </Select>
                {formData.user_type !== 'client' && (
                  <p className="text-xs text-emerald-400">Acesso promocional: 1 ano sem pagamento</p>
                )}
              </div>
            )}
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

      {/* Modal de Boas-Vindas */}
      {createdUserData && (
        <WelcomeCredentialsModal
          isOpen={showWelcomeModal}
          onClose={() => {
            setShowWelcomeModal(false);
            setCreatedUserData(null);
          }}
          userData={createdUserData}
        />
      )}
    </div>
  );
};
