import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Plus, Trash2, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, RefreshCw, Shield, ArrowLeft, Users, Search, Filter, ChevronLeft, ChevronRight, X, Calendar, Clock, MapPin, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  key_name: string;
  api_key_preview: string;
  provider: string;
  usage_count: number;
  last_used_at: string | null;
  is_active: boolean;
  priority: number;
  created_at: string;
}

interface GenesisUser {
  id: string;
  name: string;
  email: string;
  auth_user_id: string;
  search_count?: number;
}

interface SearchHistory {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  search_type: string;
  search_query: string;
  city: string;
  state: string;
  region: string;
  niche: string;
  results_count: number;
  credits_used: number;
  created_at: string;
}

interface ApiKeysTabProps {
  onBack: () => void;
}

const KEYS_PER_PAGE = 5;
const USERS_PER_PAGE = 10;

export function ApiKeysTab({ onBack }: ApiKeysTabProps) {
  const [activeTab, setActiveTab] = useState<'keys' | 'users'>('keys');
  
  // Keys state
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [keysPage, setKeysPage] = useState(1);
  
  // Users state
  const [users, setUsers] = useState<GenesisUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  
  // History modal state
  const [selectedUser, setSelectedUser] = useState<GenesisUser | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');

  useEffect(() => {
    loadKeys();
    loadUsers();
  }, []);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-api-keys', {
        body: { action: 'list' }
      });

      if (error) throw error;
      setKeys(data?.keys || []);
    } catch (error) {
      console.error('Error loading keys:', error);
      toast.error('Erro ao carregar chaves');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from('genesis_users')
        .select('id, name, email, auth_user_id')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const syncUsage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-api-keys', {
        body: { action: 'sync_usage' }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success('Uso sincronizado com a API Serper!');
        loadKeys();
      } else {
        toast.error(data?.error || 'Erro ao sincronizar');
      }
    } catch (error: any) {
      console.error('Error syncing usage:', error);
      toast.error('Erro ao sincronizar uso');
    } finally {
      setLoading(false);
    }
  };

  const loadSearchHistory = async (user: GenesisUser, filterValue?: string) => {
    setHistoryLoading(true);
    setSelectedUser(user);
    setHistoryModalOpen(true);

    try {
      let query = supabase
        .from('genesis_search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const filter = filterValue || dateFilter;
      const now = new Date();
      
      if (filter === 'today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte('created_at', startOfDay);
      } else if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', weekAgo);
      } else if (filter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', monthAgo);
      } else if (filter === 'custom' && customDateStart) {
        query = query.gte('created_at', customDateStart + 'T00:00:00');
        if (customDateEnd) {
          query = query.lte('created_at', customDateEnd + 'T23:59:59');
        }
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setSearchHistory(data || []);
    } catch (error) {
      console.error('Error loading search history:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAddKey = async () => {
    if (!newKeyName.trim() || !newKeyValue.trim()) {
      toast.error('Preencha nome e chave');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-api-keys', {
        body: { 
          action: 'add',
          keyName: newKeyName.trim(),
          apiKey: newKeyValue.trim()
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Chave adicionada com sucesso!');
      setNewKeyName('');
      setNewKeyValue('');
      setAdding(false);
      loadKeys();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar chave');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleKey = async (keyId: string, currentStatus: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-api-keys', {
        body: { 
          action: 'toggle',
          keyId,
          isActive: !currentStatus
        }
      });

      if (error) throw error;
      toast.success(`Chave ${!currentStatus ? 'ativada' : 'desativada'}`);
      loadKeys();
    } catch (error) {
      toast.error('Erro ao atualizar chave');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta chave?')) return;

    try {
      const { data, error } = await supabase.functions.invoke('manage-api-keys', {
        body: { action: 'delete', keyId }
      });

      if (error) throw error;
      toast.success('Chave removida');
      loadKeys();
    } catch (error) {
      toast.error('Erro ao remover chave');
    }
  };

  const activeKeys = keys.filter(k => k.is_active).length;
  const totalUsage = keys.reduce((sum, k) => sum + k.usage_count, 0);

  // Pagination calculations
  const totalKeysPages = Math.ceil(keys.length / KEYS_PER_PAGE);
  const paginatedKeys = keys.slice((keysPage - 1) * KEYS_PER_PAGE, keysPage * KEYS_PER_PAGE);
  
  const totalUsersPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = users.slice((usersPage - 1) * USERS_PER_PAGE, usersPage * USERS_PER_PAGE);

  const getSearchTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'radar': 'Radar Global',
      'prospecting': 'Prospecção',
      'manual': 'Busca Manual'
    };
    return labels[type] || type;
  };

  const getSearchTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'radar': 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
      'prospecting': 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      'manual': 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[type] || 'from-gray-500/20 to-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
    setSelectedUser(null);
    setSearchHistory([]);
    setDateFilter('all');
    setCustomDateStart('');
    setCustomDateEnd('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white/50 hover:text-white hover:bg-white/10 h-9"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Gerenciar API & Usuários</h1>
              <p className="text-xs text-white/50">Chaves Serper e histórico de pesquisas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'keys' | 'users')} className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 h-auto">
          <TabsTrigger 
            value="keys" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-white text-white/60 px-4 py-2"
          >
            <Key className="w-4 h-4 mr-2" />
            API Keys ({keys.length})
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-white text-white/60 px-4 py-2"
          >
            <Users className="w-4 h-4 mr-2" />
            Usuários ({users.length})
          </TabsTrigger>
        </TabsList>

        {/* Keys Tab */}
        <TabsContent value="keys" className="mt-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{activeKeys}</p>
                    <p className="text-xs text-white/50">Chaves Ativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Key className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{keys.length}</p>
                    <p className="text-xs text-white/50">Total de Chaves</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Search className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{totalUsage.toLocaleString()}</p>
                    <p className="text-xs text-white/50">Requisições Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors" onClick={syncUsage}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <RefreshCw className={`w-5 h-5 text-purple-400 ${loading ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Sincronizar</p>
                    <p className="text-xs text-white/50">Atualizar uso real</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Key Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => setAdding(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nova Chave
            </Button>
          </div>

          {/* Add Key Form */}
          <AnimatePresence>
            {adding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      Adicionar Nova Chave
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white/70 text-sm">Nome da Chave</Label>
                        <Input
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="Ex: Serper Key 1"
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70 text-sm">API Key</Label>
                        <Input
                          type="password"
                          value={newKeyValue}
                          onChange={(e) => setNewKeyValue(e.target.value)}
                          placeholder="Cole a chave aqui..."
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddKey}
                        disabled={saving}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                      >
                        {saving ? 'Salvando...' : 'Salvar Chave'}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => { setAdding(false); setNewKeyName(''); setNewKeyValue(''); }}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Keys List */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  Chaves Cadastradas
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadKeys}
                  className="text-white/50 hover:text-white h-8"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
              ) : keys.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">Nenhuma chave cadastrada</p>
                  <p className="text-white/30 text-xs mt-1">Adicione sua primeira chave para começar</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {paginatedKeys.map((key, index) => (
                      <motion.div
                        key={key.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          key.is_active 
                            ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                            : 'bg-white/2 border-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            key.is_active ? 'bg-green-500/20' : 'bg-white/10'
                          }`}>
                            <Key className={`w-4 h-4 ${key.is_active ? 'text-green-400' : 'text-white/30'}`} />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{key.key_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-white/40 text-xs font-mono">****{key.api_key_preview}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary bg-primary/10">
                                {key.usage_count.toLocaleString()} usos
                              </Badge>
                              {key.last_used_at && (
                                <span className="text-white/30 text-[10px]">
                                  Último: {new Date(key.last_used_at).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleKey(key.id, key.is_active)}
                            className={`h-8 px-2 ${key.is_active ? 'text-green-400 hover:text-green-300' : 'text-white/40 hover:text-white/60'}`}
                          >
                            {key.is_active ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteKey(key.id)}
                            className="h-8 px-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalKeysPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <span className="text-white/50 text-sm">
                        Página {keysPage} de {totalKeysPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setKeysPage(p => Math.max(1, p - 1))}
                          disabled={keysPage === 1}
                          className="text-white/70 hover:text-white disabled:opacity-30"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        {Array.from({ length: totalKeysPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant="ghost"
                            size="sm"
                            onClick={() => setKeysPage(page)}
                            className={`w-8 h-8 ${keysPage === page 
                              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white' 
                              : 'text-white/50 hover:text-white'}`}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setKeysPage(p => Math.min(totalKeysPages, p + 1))}
                          disabled={keysPage === totalKeysPages}
                          className="text-white/70 hover:text-white disabled:opacity-30"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-300 font-medium">Rotação Automática</p>
              <p className="text-blue-300/70 text-xs mt-1">
                As chaves são rotacionadas automaticamente com base no uso. Se uma chave esgotar os créditos, 
                o sistema alterna automaticamente para a próxima disponível.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Usuários - Histórico de Pesquisas
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadUsers}
                  className="text-white/50 hover:text-white h-8"
                >
                  <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">Nenhum usuário encontrado</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {paginatedUsers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => loadSearchHistory(user)}
                        className="flex items-center justify-between p-3 rounded-lg border bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                            <span className="text-blue-400 font-semibold">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-white/40 text-sm">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className="text-xs px-3 py-1 border-blue-500/30 text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors"
                          >
                            <Search className="w-3.5 h-3.5 mr-1.5" />
                            Ver Histórico
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalUsersPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <span className="text-white/50 text-sm">
                        Página {usersPage} de {totalUsersPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                          disabled={usersPage === 1}
                          className="text-white/70 hover:text-white disabled:opacity-30"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        {Array.from({ length: Math.min(5, totalUsersPages) }, (_, i) => {
                          let page = i + 1;
                          if (totalUsersPages > 5) {
                            if (usersPage > 3) {
                              page = usersPage - 2 + i;
                            }
                            if (usersPage > totalUsersPages - 2) {
                              page = totalUsersPages - 4 + i;
                            }
                          }
                          return page;
                        }).filter(p => p > 0 && p <= totalUsersPages).map(page => (
                          <Button
                            key={page}
                            variant="ghost"
                            size="sm"
                            onClick={() => setUsersPage(page)}
                            className={`w-8 h-8 ${usersPage === page 
                              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white' 
                              : 'text-white/50 hover:text-white'}`}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUsersPage(p => Math.min(totalUsersPages, p + 1))}
                          disabled={usersPage === totalUsersPages}
                          className="text-white/70 hover:text-white disabled:opacity-30"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Premium History Modal */}
      <AnimatePresence>
        {historyModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeHistoryModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="w-full max-w-4xl max-h-[85vh] overflow-hidden"
              >
                <div className="bg-gradient-to-br from-[#0a0f1a] via-[#0d1321] to-[#0a0f1a] rounded-2xl border border-white/10 shadow-2xl shadow-blue-500/10">
                  {/* Header */}
                  <div className="relative p-6 border-b border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center border border-blue-500/20">
                          <Activity className="w-7 h-7 text-blue-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">Histórico de Pesquisas</h2>
                          {selectedUser && (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                                <span className="text-blue-400 font-medium text-xs">
                                  {selectedUser.name?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                              <span className="text-white/70 text-sm">{selectedUser.name}</span>
                              <span className="text-white/40 text-sm">•</span>
                              <span className="text-white/50 text-sm">{selectedUser.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={closeHistoryModal}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="p-4 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <Filter className="w-4 h-4 text-white/50" />
                        <span className="text-white/50 text-sm">Filtrar:</span>
                      </div>
                      
                      <Select value={dateFilter} onValueChange={(v) => { setDateFilter(v); if (selectedUser) loadSearchHistory(selectedUser, v); }}>
                        <SelectTrigger className="w-44 bg-white/5 border-white/10 text-white h-9">
                          <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                          <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0f1a] border-white/10">
                          <SelectItem value="all">Todos os períodos</SelectItem>
                          <SelectItem value="today">Hoje</SelectItem>
                          <SelectItem value="week">Última Semana</SelectItem>
                          <SelectItem value="month">Último Mês</SelectItem>
                          <SelectItem value="custom">Data Específica</SelectItem>
                        </SelectContent>
                      </Select>

                      {dateFilter === 'custom' && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={customDateStart}
                            onChange={(e) => setCustomDateStart(e.target.value)}
                            className="w-36 bg-white/5 border-white/10 text-white text-sm h-9"
                          />
                          <span className="text-white/40">até</span>
                          <Input
                            type="date"
                            value={customDateEnd}
                            onChange={(e) => setCustomDateEnd(e.target.value)}
                            className="w-36 bg-white/5 border-white/10 text-white text-sm h-9"
                          />
                          <Button
                            size="sm"
                            onClick={() => selectedUser && loadSearchHistory(selectedUser)}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-9"
                          >
                            Aplicar
                          </Button>
                        </div>
                      )}

                      <div className="ml-auto">
                        <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30 px-3 py-1">
                          {searchHistory.length} pesquisas
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 overflow-y-auto max-h-[50vh] space-y-3">
                    {historyLoading ? (
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                          </div>
                          <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl animate-pulse" />
                        </div>
                        <p className="text-white/50 text-sm mt-4">Carregando histórico...</p>
                      </div>
                    ) : searchHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center mb-4">
                          <Search className="w-10 h-10 text-white/20" />
                        </div>
                        <p className="text-white/50 text-base font-medium">Nenhuma pesquisa encontrada</p>
                        <p className="text-white/30 text-sm mt-1">Este usuário ainda não realizou pesquisas no período selecionado</p>
                      </div>
                    ) : (
                      searchHistory.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="group p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/15 transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getSearchTypeColor(item.search_type).split(' ')[0]} ${getSearchTypeColor(item.search_type).split(' ')[1]} flex items-center justify-center flex-shrink-0`}>
                                <Target className="w-5 h-5 text-current" style={{ color: item.search_type === 'radar' ? '#a855f7' : item.search_type === 'prospecting' ? '#10b981' : '#3b82f6' }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">
                                  {item.search_query || `${item.niche || 'Busca'} em ${item.city || item.region || 'Local não especificado'}`}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-[11px] px-2 py-0.5 bg-gradient-to-r ${getSearchTypeColor(item.search_type)}`}
                                  >
                                    {getSearchTypeLabel(item.search_type)}
                                  </Badge>
                                  {item.city && (
                                    <div className="flex items-center gap-1 text-white/40 text-xs">
                                      <MapPin className="w-3 h-3" />
                                      {item.city}{item.state ? `, ${item.state}` : ''}
                                    </div>
                                  )}
                                  {item.niche && (
                                    <Badge variant="outline" className="text-[11px] px-2 py-0.5 border-white/20 text-white/60">
                                      {item.niche}
                                    </Badge>
                                  )}
                                  <span className="text-white/40 text-xs">
                                    {item.results_count} resultados
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(item.created_at).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="flex items-center gap-1.5 text-white/40 text-xs mt-1">
                                <Clock className="w-3 h-3" />
                                {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {searchHistory.length > 0 && (
                    <div className="p-4 border-t border-white/10 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                              <Search className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-white/50 text-xs">Total de Pesquisas</p>
                              <p className="text-white font-semibold">{searchHistory.length}</p>
                            </div>
                          </div>
                          <div className="w-px h-8 bg-white/10" />
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                              <Target className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-white/50 text-xs">Resultados Totais</p>
                              <p className="text-white font-semibold">
                                {searchHistory.reduce((sum, h) => sum + (h.results_count || 0), 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={closeHistoryModal}
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          Fechar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
