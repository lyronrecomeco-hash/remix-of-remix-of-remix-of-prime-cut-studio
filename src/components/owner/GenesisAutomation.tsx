import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, 
  Users, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search, 
  MoreVertical,
  Smartphone,
  Power,
  Settings,
  Activity,
  Link2,
  Unlink,
  Mail,
  AlertTriangle,
  ChevronDown,
  Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface GenesisInstance {
  id: string;
  user_id: string;
  name: string;
  phone_number?: string;
  status: string;
  orchestrated_status?: string;
  is_paused: boolean;
  backend_url?: string;
  backend_token?: string;
  created_at: string;
  last_heartbeat?: string;
  user_email?: string;
}

interface GenesisUser {
  id: string;
  email: string;
}

interface GenesisCampaign {
  id: string;
  name: string;
  status: string;
  total_contacts: number;
  sent_count: number;
  failed_count: number;
  instance_id: string;
  created_at: string;
  user_id: string;
}

const GenesisAutomation = () => {
  const [instances, setInstances] = useState<GenesisInstance[]>([]);
  const [campaigns, setCampaigns] = useState<GenesisCampaign[]>([]);
  const [users, setUsers] = useState<GenesisUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<GenesisInstance | null>(null);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [newInstanceUser, setNewInstanceUser] = useState('');
  const [activeTab, setActiveTab] = useState('instances');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch instances
      const { data: instancesData, error: instancesError } = await supabase
        .from('genesis_instances')
        .select('*')
        .order('created_at', { ascending: false });

      if (instancesError) throw instancesError;

      // Get unique user IDs
      const userIds = [...new Set(instancesData?.map(i => i.user_id) || [])];

      // Try to fetch user emails from edge function, fallback to empty array
      let authUsers: Array<{ id: string; email: string }> = [];
      try {
        const response = await supabase.functions.invoke('get-users-list', {
          body: { user_ids: userIds }
        });
        
        if (response.data?.users && Array.isArray(response.data.users)) {
          authUsers = response.data.users;
        } else if (response.data && Array.isArray(response.data)) {
          authUsers = response.data;
        }
      } catch (e) {
        console.warn('Could not fetch user emails:', e);
      }

      // Map emails to instances
      const instancesWithEmails = (instancesData || []).map(instance => ({
        ...instance,
        user_email: authUsers.find((u) => u.id === instance.user_id)?.email || instance.user_id.slice(0, 8) + '...'
      }));

      setInstances(instancesWithEmails);

      // Fetch campaigns
      const { data: campaignsData } = await supabase
        .from('genesis_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      setCampaigns(campaignsData || []);

      // Create users list from instances
      const usersMap = new Map<string, GenesisUser>();
      instancesWithEmails.forEach(inst => {
        if (!usersMap.has(inst.user_id)) {
          usersMap.set(inst.user_id, { id: inst.user_id, email: inst.user_email || 'N/A' });
        }
      });
      setUsers(Array.from(usersMap.values()));

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstance = async () => {
    if (!newInstanceName.trim() || !newInstanceUser) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      const { error } = await supabase.from('genesis_instances').insert({
        name: newInstanceName.trim(),
        user_id: newInstanceUser,
        status: 'disconnected',
        orchestrated_status: 'disconnected',
        is_paused: false,
        backend_url: 'http://72.62.108.24:3000',
        backend_token: 'genesis-master-token-2024-secure'
      });

      if (error) throw error;

      toast.success('Instância criada com sucesso');
      setShowAddDialog(false);
      setNewInstanceName('');
      setNewInstanceUser('');
      fetchData();
    } catch (error) {
      console.error('Error adding instance:', error);
      toast.error('Erro ao criar instância');
    }
  };

  const handleDeleteInstance = async () => {
    if (!selectedInstance) return;

    try {
      // Delete related data first
      await supabase.from('genesis_campaign_contacts')
        .delete()
        .in('campaign_id', campaigns.filter(c => c.instance_id === selectedInstance.id).map(c => c.id));

      await supabase.from('genesis_campaign_logs')
        .delete()
        .in('campaign_id', campaigns.filter(c => c.instance_id === selectedInstance.id).map(c => c.id));

      await supabase.from('genesis_campaigns')
        .delete()
        .eq('instance_id', selectedInstance.id);

      await supabase.from('chatbot_sessions')
        .delete()
        .eq('instance_id', selectedInstance.id);

      const { error } = await supabase.from('genesis_instances')
        .delete()
        .eq('id', selectedInstance.id);

      if (error) throw error;

      toast.success('Instância removida com sucesso');
      setShowDeleteDialog(false);
      setSelectedInstance(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting instance:', error);
      toast.error('Erro ao remover instância');
    }
  };

  const handleTogglePause = async (instance: GenesisInstance) => {
    try {
      const { error } = await supabase.from('genesis_instances')
        .update({ is_paused: !instance.is_paused })
        .eq('id', instance.id);

      if (error) throw error;

      toast.success(instance.is_paused ? 'Instância ativada' : 'Instância pausada');
      fetchData();
    } catch (error) {
      console.error('Error toggling pause:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const handleDisconnect = async (instance: GenesisInstance) => {
    try {
      const { error } = await supabase.from('genesis_instances')
        .update({ 
          status: 'disconnected',
          orchestrated_status: 'disconnected',
          phone_number: null
        })
        .eq('id', instance.id);

      if (error) throw error;

      toast.success('Instância desconectada');
      fetchData();
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Erro ao desconectar');
    }
  };

  const handleConfigBackend = async (instance: GenesisInstance) => {
    try {
      const { error } = await supabase.from('genesis_instances')
        .update({ 
          backend_url: 'http://72.62.108.24:3000',
          backend_token: 'genesis-master-token-2024-secure'
        })
        .eq('id', instance.id);

      if (error) throw error;

      toast.success('Backend configurado com VPS nativo');
      fetchData();
    } catch (error) {
      console.error('Error configuring backend:', error);
      toast.error('Erro ao configurar backend');
    }
  };

  const getStatusBadge = (status: string, orchestrated?: string) => {
    const effectiveStatus = orchestrated || status;
    switch (effectiveStatus) {
      case 'connected':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Conectado</Badge>;
      case 'qr_pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">QR Pendente</Badge>;
      case 'connecting':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Conectando</Badge>;
      default:
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Desconectado</Badge>;
    }
  };

  const filteredInstances = instances.filter(instance => {
    const matchesSearch = 
      instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.phone_number?.includes(searchTerm) ||
      instance.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = selectedUser === 'all' || instance.user_id === selectedUser;
    
    return matchesSearch && matchesUser;
  });

  const stats = {
    total: instances.length,
    connected: instances.filter(i => i.orchestrated_status === 'connected' || i.status === 'connected').length,
    paused: instances.filter(i => i.is_paused).length,
    campaigns: campaigns.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Genesis Automação
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerenciamento completo de instâncias Genesis em todas as contas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Instância
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Instâncias</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.connected}</p>
                <p className="text-xs text-muted-foreground">Conectadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Power className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.paused}</p>
                <p className="text-xs text-muted-foreground">Pausadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Send className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.campaigns}</p>
                <p className="text-xs text-muted-foreground">Campanhas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="instances">Instâncias</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
        </TabsList>

        <TabsContent value="instances" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Filtrar por usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instances Table */}
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Backend</TableHead>
                      <TableHead>Pausado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstances.map((instance) => (
                      <TableRow key={instance.id}>
                        <TableCell className="font-medium">{instance.name}</TableCell>
                        <TableCell>{instance.phone_number || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {instance.user_email}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(instance.status, instance.orchestrated_status)}
                        </TableCell>
                        <TableCell>
                          {instance.backend_url ? (
                            <Badge variant="outline" className="text-xs">
                              Configurado
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Não configurado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {instance.is_paused ? (
                            <Badge variant="secondary">Pausado</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-400">Ativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleTogglePause(instance)}>
                                <Power className="w-4 h-4 mr-2" />
                                {instance.is_paused ? 'Ativar' : 'Pausar'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleConfigBackend(instance)}>
                                <Settings className="w-4 h-4 mr-2" />
                                Configurar Backend Nativo
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDisconnect(instance)}>
                                <Unlink className="w-4 h-4 mr-2" />
                                Desconectar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedInstance(instance);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredInstances.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhuma instância encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contatos</TableHead>
                      <TableHead>Enviados</TableHead>
                      <TableHead>Falhas</TableHead>
                      <TableHead>Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>
                          <Badge variant={
                            campaign.status === 'completed' ? 'default' :
                            campaign.status === 'running' ? 'secondary' :
                            campaign.status === 'paused' ? 'outline' :
                            'destructive'
                          }>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.total_contacts}</TableCell>
                        <TableCell className="text-green-400">{campaign.sent_count}</TableCell>
                        <TableCell className="text-red-400">{campaign.failed_count}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                    {campaigns.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhuma campanha encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Instance Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Instância Genesis</DialogTitle>
            <DialogDescription>
              Crie uma nova instância para qualquer conta de usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Instância</Label>
              <Input
                placeholder="Ex: Vendas Principal"
                value={newInstanceName}
                onChange={(e) => setNewInstanceName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Usuário (conta)</Label>
              <Select value={newInstanceUser} onValueChange={setNewInstanceUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddInstance}>
              Criar Instância
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Remover Instância
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a instância "{selectedInstance?.name}"?
              Esta ação removerá também todas as campanhas e dados relacionados.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteInstance}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GenesisAutomation;