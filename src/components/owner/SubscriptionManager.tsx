import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Users, Search, RefreshCw, Crown, Star, User, Calendar, 
  TrendingUp, Edit2, Trash2, Check, X, Mail,
  DollarSign, AlertTriangle, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SubscriptionUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  plan_name: string;
  plan_display_name: string;
  subscription_status: string;
  subscription_id: string;
  appointments_count: number;
  expires_at: string | null;
}

interface Plan {
  id: string;
  name: string;
  display_name: string;
  price: number;
}

const SubscriptionManager = () => {
  const [users, setUsers] = useState<SubscriptionUser[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Edit modal
  const [editingUser, setEditingUser] = useState<SubscriptionUser | null>(null);
  const [editPlan, setEditPlan] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Delete confirmation
  const [deletingUser, setDeletingUser] = useState<SubscriptionUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchUsers();
  }, []);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('id, name, display_name, price')
      .eq('is_active', true);

    if (!error && data) {
      setPlans(data);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch ALL subscriptions with their users and plans
      const { data: subscriptions, error: subError } = await supabase
        .from('shop_subscriptions')
        .select(`
          *,
          subscription_plans (id, name, display_name, price)
        `)
        .order('created_at', { ascending: false });

      if (subError) throw subError;

      // Fetch admin users to get names
      const { data: adminUsers } = await supabase
        .from('admin_users')
        .select('*');

      // Fetch email confirmation tokens to get emails
      const { data: emailTokens } = await supabase
        .from('email_confirmation_tokens')
        .select('user_id, email')
        .order('created_at', { ascending: false });

      // Fetch user profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name');

      // Fetch usage metrics for current month
      const now = new Date();
      const { data: metrics } = await supabase
        .from('usage_metrics')
        .select('*')
        .eq('month', now.getMonth() + 1)
        .eq('year', now.getFullYear());

      // Build user list from subscriptions
      const enrichedUsers = (subscriptions || []).map(sub => {
        const adminUser = adminUsers?.find(u => u.user_id === sub.user_id);
        const emailToken = emailTokens?.find(e => e.user_id === sub.user_id);
        const profile = profiles?.find(p => p.user_id === sub.user_id);
        const usage = metrics?.find(m => m.user_id === sub.user_id);
        const planData = sub.subscription_plans as any;

        // Get name from multiple sources
        let displayName = 'Usuário Pendente';
        if (adminUser?.name && adminUser.name !== 'Usuário') {
          displayName = adminUser.name;
        } else if (profile?.first_name) {
          displayName = `${profile.first_name} ${profile.last_name || ''}`.trim();
        } else if (emailToken?.email) {
          // Extract name from email
          const emailName = emailToken.email.split('@')[0];
          displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._-]/g, ' ');
        }

        // Get email from multiple sources
        const email = adminUser?.email || emailToken?.email || 'Email não cadastrado';

        return {
          id: adminUser?.id || sub.id,
          user_id: sub.user_id,
          name: displayName,
          email: email,
          is_active: adminUser?.is_active ?? true,
          created_at: sub.created_at,
          plan_name: planData?.name || 'free',
          plan_display_name: planData?.display_name || 'Gratuito',
          subscription_status: sub.status || 'none',
          subscription_id: sub.id,
          appointments_count: usage?.appointments_count || 0,
          expires_at: sub.expires_at || null,
        };
      });

      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!editingUser || !editPlan) return;

    setIsSaving(true);
    try {
      const selectedPlan = plans.find(p => p.id === editPlan);
      if (!selectedPlan) throw new Error('Plano não encontrado');

      const { error } = await supabase
        .from('shop_subscriptions')
        .update({
          plan_id: editPlan,
          status: 'active',
          expires_at: selectedPlan.name === 'lifetime' ? null : undefined,
        })
        .eq('id', editingUser.subscription_id);

      if (error) throw error;

      toast.success(`Plano alterado para ${selectedPlan.display_name}!`);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error('Erro ao alterar plano');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (user: SubscriptionUser) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !user.is_active })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast.success(`Usuário ${!user.is_active ? 'ativado' : 'desativado'}`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', deletingUser.user_id);

      if (error) throw error;

      toast.success('Usuário removido com sucesso');
      setDeletingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao remover usuário');
    } finally {
      setIsDeleting(false);
    }
  };

  const getPlanBadge = (planName: string, displayName: string) => {
    switch (planName) {
      case 'lifetime':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Crown className="w-3 h-3 mr-1" />
            {displayName}
          </Badge>
        );
      case 'premium':
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Star className="w-3 h-3 mr-1" />
            {displayName}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <User className="w-3 h-3 mr-1" />
            {displayName}
          </Badge>
        );
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = filterPlan === 'all' || user.plan_name === filterPlan;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);

    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    free: users.filter(u => u.plan_name === 'free').length,
    premium: users.filter(u => u.plan_name === 'premium').length,
    lifetime: users.filter(u => u.plan_name === 'lifetime').length,
    revenue: users.reduce((acc, u) => {
      if (u.plan_name === 'premium') return acc + 49;
      return acc;
    }, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Gestão de Assinaturas</h2>
          <p className="text-sm text-muted-foreground">Gerencie planos e usuários do sistema</p>
        </div>
        <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Ativos</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Gratuito</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.free}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Premium</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.premium}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Vitalício</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.lifetime}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Receita/mês</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-500">R$ {stats.revenue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os planos</SelectItem>
            <SelectItem value="free">Gratuito</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="lifetime">Vitalício</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Usuários</CardTitle>
          <CardDescription>{filteredUsers.length} usuários encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum usuário encontrado</p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.subscription_id}
                    className="p-4 rounded-lg bg-card border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-foreground">{user.name}</h3>
                          {getPlanBadge(user.plan_name, user.plan_display_name)}
                          {!user.is_active && (
                            <Badge variant="destructive" className="text-xs">Inativo</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Desde {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {user.appointments_count} agendamentos/mês
                          </div>
                          {user.expires_at && (
                            <div className="flex items-center gap-1 text-amber-500">
                              <AlertTriangle className="w-3 h-3" />
                              Expira: {format(new Date(user.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {user.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={() => handleToggleActive(user)}
                          />
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setEditPlan(plans.find(p => p.name === user.plan_name)?.id || '');
                          }}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Plano
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeletingUser(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Plano</DialogTitle>
            <DialogDescription>
              Alterar plano de {editingUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={editPlan} onValueChange={setEditPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.display_name} - R$ {plan.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePlan} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover {deletingUser?.name}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting}>
              {isDeleting ? 'Removendo...' : 'Remover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionManager;
