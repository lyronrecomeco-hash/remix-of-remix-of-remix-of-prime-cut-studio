import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Database, RefreshCw, Calendar, Users, BarChart3, HardDrive } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface UserDatabase {
  user_id: string;
  name: string;
  email: string;
  appointments_count: number;
  clients_count: number;
  services_count: number;
  barbers_count: number;
  created_at: string;
}

const UserDatabaseSection = () => {
  const [users, setUsers] = useState<UserDatabase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDatabase | null>(null);

  useEffect(() => {
    fetchUserDatabases();
  }, []);

  const fetchUserDatabases = async () => {
    setIsLoading(true);
    try {
      const { data: subscriptions } = await supabase.from('shop_subscriptions').select('user_id, created_at');
      const { data: adminUsers } = await supabase.from('admin_users').select('*');
      const now = new Date();
      const { data: metrics } = await supabase.from('usage_metrics').select('*').eq('month', now.getMonth() + 1).eq('year', now.getFullYear());

      const userIds = new Set(subscriptions?.map(s => s.user_id) || []);
      const enrichedUsers: UserDatabase[] = [];

      for (const userId of userIds) {
        const admin = adminUsers?.find(u => u.user_id === userId);
        const usage = metrics?.find(m => m.user_id === userId);
        const { count: servicesCount } = await supabase.from('services').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        const { count: barbersCount } = await supabase.from('barbers').select('*', { count: 'exact', head: true }).eq('user_id', userId);

        enrichedUsers.push({
          user_id: userId,
          name: admin?.name || 'Usuário',
          email: admin?.email || 'N/A',
          appointments_count: usage?.appointments_count || 0,
          clients_count: usage?.clients_count || 0,
          services_count: servicesCount || 0,
          barbers_count: barbersCount || 0,
          created_at: subscriptions?.find(s => s.user_id === userId)?.created_at || new Date().toISOString(),
        });
      }

      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Error fetching user databases:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const getUsageLevel = (user: UserDatabase) => {
    const total = user.appointments_count + user.services_count + user.barbers_count;
    if (total > 100) return { label: 'Alto', color: 'bg-green-500' };
    if (total > 20) return { label: 'Médio', color: 'bg-amber-500' };
    return { label: 'Baixo', color: 'bg-muted-foreground' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Banco de Dados por Usuário</h2>
          <p className="text-sm text-muted-foreground">Dados isolados de cada usuário</p>
        </div>
        <Button variant="outline" onClick={fetchUserDatabases} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => {
            const usage = getUsageLevel(user);
            return (
              <Card key={user.user_id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedUser(user)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Database className="w-5 h-5 text-primary" />
                    <Badge className={`${usage.color} text-white`}>{usage.label}</Badge>
                  </div>
                  <CardTitle className="text-base">{user.name}</CardTitle>
                  <CardDescription className="text-xs">{user.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{user.appointments_count} agend.</div>
                    <div className="flex items-center gap-1"><Users className="w-3 h-3" />{user.barbers_count} barb.</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Database className="w-5 h-5" />{selectedUser?.name}</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{selectedUser?.appointments_count}</p><p className="text-xs text-muted-foreground">Agendamentos</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{selectedUser?.clients_count}</p><p className="text-xs text-muted-foreground">Clientes</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{selectedUser?.services_count}</p><p className="text-xs text-muted-foreground">Serviços</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{selectedUser?.barbers_count}</p><p className="text-xs text-muted-foreground">Barbeiros</p></CardContent></Card>
          </div>
          <p className="text-xs text-muted-foreground text-center">Criado em {selectedUser?.created_at ? format(new Date(selectedUser.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDatabaseSection;
