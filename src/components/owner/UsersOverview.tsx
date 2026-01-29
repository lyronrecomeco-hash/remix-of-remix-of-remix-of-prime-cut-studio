import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Users, Search, RefreshCw, Shield, Clock, Mail, CheckCircle, XCircle, Crown, UserCog,
  Globe, Activity, BarChart3, Bell, Send, Eye, History, Database, Calendar, TrendingUp,
  Wifi, WifiOff, Timer, MonitorSmartphone, KeyRound
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserPermissionsModal } from './UserPermissionsModal';

interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen_at: string | null;
  last_login_at: string | null;
  current_page: string | null;
  device_info: string | null;
  session_started_at: string | null;
}

interface AdminUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  role?: string;
  last_login?: string;
  login_count?: number;
  last_ip?: string;
  appointments_count?: number;
  clients_count?: number;
  // Novos campos de presença
  is_online?: boolean;
  last_seen_at?: string | null;
  current_page?: string | null;
  device_info?: string | null;
  session_started_at?: string | null;
}

interface LoginHistory {
  id: string;
  email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  attempted_at: string;
}

interface UserWarning {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const UsersOverview = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [presenceData, setPresenceData] = useState<Record<string, UserPresence>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail modal
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Warning modal
  const [warningUser, setWarningUser] = useState<AdminUser | null>(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [sendingWarning, setSendingWarning] = useState(false);
  
  // Permissions modal
  const [permissionsUser, setPermissionsUser] = useState<AdminUser | null>(null);

  const fetchPresenceData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('*');

      if (error) {
        console.error('Error fetching presence:', error);
        return;
      }

      const presenceMap: Record<string, UserPresence> = {};
      data?.forEach(p => {
        presenceMap[p.user_id] = p as UserPresence;
      });
      setPresenceData(presenceMap);
    } catch (error) {
      console.error('Error fetching presence data:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchPresenceData();
    
    // Atualizar presença em tempo real
    const presenceChannel = supabase
      .channel('user-presence-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          const newData = payload.new as Record<string, unknown>;
          if (newData && 'user_id' in newData) {
            setPresenceData(prev => ({
              ...prev,
              [newData.user_id as string]: newData as unknown as UserPresence
            }));
          }
        }
      )
      .subscribe();

    // Atualizar presença a cada 30s
    const interval = setInterval(fetchPresenceData, 30000);

    return () => {
      supabase.removeChannel(presenceChannel);
      clearInterval(interval);
    };
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch ALL user roles to get all registered users
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch admin users for names/emails
      const { data: adminUsers } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch email confirmation tokens to get emails
      const { data: emailTokens } = await supabase
        .from('email_confirmation_tokens')
        .select('user_id, email')
        .order('created_at', { ascending: false });

      // Fetch user profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*');

      // Fetch ALL subscriptions
      const { data: subscriptions } = await supabase
        .from('shop_subscriptions')
        .select('user_id, created_at, status');

      // Fetch login attempts with counts
      const { data: loginAttempts } = await supabase
        .from('login_attempts')
        .select('*')
        .order('attempted_at', { ascending: false });

      // Fetch usage metrics
      const now = new Date();
      const { data: metrics } = await supabase
        .from('usage_metrics')
        .select('*')
        .eq('month', now.getMonth() + 1)
        .eq('year', now.getFullYear());

      // Build complete user list from user_roles (ALL users)
      const userIds = new Set<string>();
      
      // Add all users from roles
      roles?.forEach(r => userIds.add(r.user_id));
      
      // Add all users from admin_users
      adminUsers?.forEach(u => userIds.add(u.user_id));
      
      // Add all users from subscriptions
      subscriptions?.forEach(s => userIds.add(s.user_id));

      const enrichedUsers: AdminUser[] = [];
      
      userIds.forEach(userId => {
        const adminUser = adminUsers?.find(u => u.user_id === userId);
        const emailToken = emailTokens?.find(e => e.user_id === userId);
        const userRole = roles?.find(r => r.user_id === userId);
        const profile = profiles?.find(p => p.user_id === userId);
        const usage = metrics?.find(m => m.user_id === userId);
        const subscription = subscriptions?.find(s => s.user_id === userId);
        
        // Get email from multiple sources
        const email = adminUser?.email || emailToken?.email || 'Email não cadastrado';
        
        // Get login attempts by email
        const userLogins = loginAttempts?.filter(l => l.email === email) || [];
        const successLogins = userLogins.filter(l => l.success);
        const lastLogin = successLogins[0];
        
        // Build display name from multiple sources
        let displayName = 'Usuário Pendente';
        if (adminUser?.name && adminUser.name !== 'Usuário') {
          displayName = adminUser.name;
        } else if (profile?.first_name) {
          displayName = `${profile.first_name} ${profile.last_name || ''}`.trim();
        } else if (email && email !== 'Email não cadastrado') {
          // Extract name from email
          const emailName = email.split('@')[0];
          displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._-]/g, ' ');
        }
        
        enrichedUsers.push({
          id: adminUser?.id || userId,
          user_id: userId,
          name: displayName,
          email: email,
          is_active: adminUser?.is_active ?? true,
          expires_at: adminUser?.expires_at || null,
          created_at: userRole?.created_at || subscription?.created_at || new Date().toISOString(),
          updated_at: adminUser?.updated_at || new Date().toISOString(),
          role: userRole?.role || 'usuário',
          last_login: lastLogin?.attempted_at,
          login_count: successLogins.length,
          last_ip: lastLogin?.ip_address || 'N/A',
          appointments_count: usage?.appointments_count || 0,
          clients_count: usage?.clients_count || 0,
        });
      });

      // Sort by created_at descending
      enrichedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLoginHistory = async (email: string) => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email)
        .order('attempted_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLoginHistory(data || []);
    } catch (error) {
      console.error('Error fetching login history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewDetails = async (user: AdminUser) => {
    setSelectedUser(user);
    await fetchLoginHistory(user.email);
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !user.is_active })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast.success(`Usuário ${!user.is_active ? 'ativado' : 'desativado'} com sucesso`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user:', error);
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const handleSendWarning = async () => {
    if (!warningUser || !warningMessage.trim()) {
      toast.error('Digite uma mensagem');
      return;
    }

    setSendingWarning(true);
    try {
      // Insert into admin_settings as a notification
      const { error } = await supabase
        .from('admin_settings')
        .insert({
          setting_type: `user_warning_${warningUser.user_id}_${Date.now()}`,
          user_id: warningUser.user_id,
          settings: {
            type: 'warning',
            message: warningMessage,
            from: 'owner',
            is_read: false,
            created_at: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast.success('Aviso enviado com sucesso!');
      setWarningUser(null);
      setWarningMessage('');
    } catch (error) {
      console.error('Error sending warning:', error);
      toast.error('Erro ao enviar aviso');
    } finally {
      setSendingWarning(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'barber':
        return <UserCog className="w-4 h-4 text-green-500" />;
      default:
        return <Users className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-amber-500/10 text-amber-500">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-500/10 text-blue-500">Admin</Badge>;
      case 'barber':
        return <Badge className="bg-green-500/10 text-green-500">Barbeiro</Badge>;
      case 'usuário':
      case 'N/A':
        return <Badge variant="secondary">Usuário</Badge>;
      default:
        return <Badge variant="secondary">Usuário</Badge>;
    }
  };

  // Combinar usuários com dados de presença
  const usersWithPresence = users.map(user => {
    const presence = presenceData[user.user_id];
    return {
      ...user,
      is_online: presence?.is_online ?? false,
      last_seen_at: presence?.last_seen_at ?? null,
      current_page: presence?.current_page ?? null,
      device_info: presence?.device_info ?? null,
      session_started_at: presence?.session_started_at ?? null,
      last_login_at: presence?.last_login_at ?? user.last_login ?? null,
    };
  });

  const filteredUsers = usersWithPresence.filter(user => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search) ||
      user.last_ip?.toLowerCase().includes(search)
    );
  });

  // Calcular quantos estão online agora
  const onlineNow = usersWithPresence.filter(u => u.is_online).length;

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    online: onlineNow,
    superAdmins: users.filter(u => u.role === 'super_admin').length,
    admins: users.filter(u => u.role === 'admin').length,
    barbers: users.filter(u => u.role === 'barber').length,
  };

  // Função para formatar tempo desde última atividade
  const formatLastSeen = (lastSeen: string | null): string => {
    if (!lastSeen) return 'Nunca';
    try {
      return formatDistanceToNow(new Date(lastSeen), { addSuffix: true, locale: ptBR });
    } catch {
      return 'Inválido';
    }
  };

  // Função para verificar se está realmente online (visto nos últimos 2 min)
  const isReallyOnline = (lastSeen: string | null, isOnline: boolean): boolean => {
    if (!isOnline) return false;
    if (!lastSeen) return false;
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    return new Date(lastSeen).getTime() > twoMinutesAgo;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Visão Geral de Usuários</h2>
          <p className="text-sm text-muted-foreground">Gerencie todos os usuários do sistema</p>
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
        <Card className="border-border/50 bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-sm text-emerald-600">Online Agora</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-emerald-600">{stats.online}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Ativos</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Super Admin</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.superAdmins}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Admins</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.admins}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <UserCog className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Barbeiros</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.barbers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email, role ou IP..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Lista de Usuários</CardTitle>
          <CardDescription>{filteredUsers.length} usuários encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum usuário encontrado</p>
              ) : (
                filteredUsers.map((user) => {
                  const reallyOnline = isReallyOnline(user.last_seen_at, user.is_online ?? false);
                  return (
                  <div
                    key={user.user_id}
                    className={`p-4 rounded-lg bg-card border transition-colors ${
                      reallyOnline 
                        ? 'border-emerald-500/50 bg-emerald-500/5' 
                        : 'border-border/50 hover:border-border'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {/* Indicador de status online */}
                        <div className="relative">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {getRoleIcon(user.role || '')}
                          </div>
                          {reallyOnline && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-foreground">{user.name}</h3>
                            {getRoleBadge(user.role || '')}
                            {/* Badge de status online */}
                            {reallyOnline ? (
                              <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                                <Wifi className="w-3 h-3 mr-1" />
                                Online
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-muted-foreground">
                                <WifiOff className="w-3 h-3 mr-1" />
                                Offline
                              </Badge>
                            )}
                            {!user.is_active && <Badge variant="destructive">Inativo</Badge>}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                            {/* Status de presença detalhado */}
                            <div className="flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              Visto: {formatLastSeen(user.last_seen_at)}
                            </div>
                            {user.current_page && reallyOnline && (
                              <div className="flex items-center gap-1 text-emerald-600">
                                <MonitorSmartphone className="w-3 h-3" />
                                {user.current_page}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              IP: {user.last_ip}
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {user.login_count} logins
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {user.appointments_count} agendamentos
                            </div>
                            {user.last_login && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-primary" />
                                Último login: {format(new Date(user.last_login), 'dd/MM HH:mm', { locale: ptBR })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(user)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPermissionsUser(user)}
                          className="text-primary border-primary/30 hover:bg-primary/10"
                        >
                          <KeyRound className="w-4 h-4 mr-1" />
                          Acessos
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setWarningUser(user)}
                        >
                          <Bell className="w-4 h-4 mr-1" />
                          Aviso
                        </Button>
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() => handleToggleActive(user)}
                          disabled={user.email === 'lyronrp@gmail.com'}
                        />
                      </div>
                    </div>
                  </div>
                )})
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getRoleIcon(selectedUser?.role || '')}
              {selectedUser?.name}
              {(() => {
                const presence = selectedUser ? presenceData[selectedUser.user_id] : null;
                const online = presence ? isReallyOnline(presence.last_seen_at, presence.is_online) : false;
                return online ? (
                  <Badge className="bg-emerald-500/20 text-emerald-600 ml-2">
                    <Wifi className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="ml-2">
                    <WifiOff className="w-3 h-3 mr-1" />
                    Offline
                  </Badge>
                );
              })()}
            </DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Status de Presença em Tempo Real */}
            {selectedUser && presenceData[selectedUser.user_id] && (
              <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-500" />
                    Status em Tempo Real
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">Última atividade:</span>
                      <p className="font-medium">
                        {formatLastSeen(presenceData[selectedUser.user_id].last_seen_at)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Último login:</span>
                      <p className="font-medium">
                        {presenceData[selectedUser.user_id].last_login_at 
                          ? format(new Date(presenceData[selectedUser.user_id].last_login_at!), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Página atual:</span>
                      <p className="font-medium font-mono text-xs">
                        {presenceData[selectedUser.user_id].current_page || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sessão iniciada:</span>
                      <p className="font-medium">
                        {presenceData[selectedUser.user_id].session_started_at
                          ? format(new Date(presenceData[selectedUser.user_id].session_started_at!), 'dd/MM HH:mm', { locale: ptBR })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {presenceData[selectedUser.user_id].device_info && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">Dispositivo:</span>
                      <p className="font-mono text-xs text-muted-foreground">
                        {presenceData[selectedUser.user_id].device_info?.slice(0, 80)}...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-border/50">
                <CardContent className="pt-4 text-center">
                  <Activity className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-2xl font-bold">{selectedUser?.login_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Logins</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-4 text-center">
                  <Calendar className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                  <p className="text-2xl font-bold">{selectedUser?.appointments_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Agendamentos</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-4 text-center">
                  <Users className="w-5 h-5 mx-auto text-green-500 mb-1" />
                  <p className="text-2xl font-bold">{selectedUser?.clients_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Clientes</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-4 text-center">
                  <Globe className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                  <p className="text-sm font-mono">{selectedUser?.last_ip}</p>
                  <p className="text-xs text-muted-foreground">Último IP</p>
                </CardContent>
              </Card>
            </div>

            {/* Login History */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <History className="w-4 h-4" />
                Histórico de Logins
              </h4>
              {loadingHistory ? (
                <p className="text-muted-foreground text-sm">Carregando...</p>
              ) : loginHistory.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum login registrado</p>
              ) : (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {loginHistory.map((login) => (
                      <div
                        key={login.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          {login.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="font-mono text-xs">{login.ip_address || 'N/A'}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(login.attempted_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Warning Modal */}
      <Dialog open={!!warningUser} onOpenChange={() => setWarningUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Enviar Aviso
            </DialogTitle>
            <DialogDescription>
              Enviar aviso para {warningUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Digite a mensagem de aviso..."
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarningUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSendWarning} disabled={sendingWarning || !warningMessage.trim()}>
              {sendingWarning ? 'Enviando...' : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Permissions Modal */}
      <UserPermissionsModal
        open={!!permissionsUser}
        onOpenChange={(open) => !open && setPermissionsUser(null)}
        user={permissionsUser}
      />
    </div>
  );
};

export default UsersOverview;
