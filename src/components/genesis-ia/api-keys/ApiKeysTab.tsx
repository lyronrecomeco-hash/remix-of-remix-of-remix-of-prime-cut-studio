import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Plus, Trash2, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, RefreshCw, Shield, ArrowLeft, Users, Search, Calendar, Filter, ChevronLeft, ChevronRight, Clock, MapPin, Globe, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal, ModalBody } from '@/components/ui/modal';
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

type TabType = 'keys' | 'users';

export function ApiKeysTab({ onBack }: ApiKeysTabProps) {
  const [activeTab, setActiveTab] = useState<TabType>('keys');
  
  // Keys state
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [keysPage, setKeysPage] = useState(1);
  const keysPerPage = 5;
  
  // Users and history state
  const [users, setUsers] = useState<GenesisUser[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const usersPerPage = 10;
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
    try {
      const { data, error } = await supabase
        .from('genesis_users')
        .select('id, name, email, auth_user_id')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const syncUsage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-api-keys', {
        body: { action: 'sync_usage' }
      });

      console.log('Sync response:', data);

      if (error) throw error;
      
      if (data?.success) {
        const account = data.account;
        const usedCredits = account?.used || 0;
        const remainingCredits = account?.remaining || 0;
        toast.success(`Sincronizado! Uso: ${usedCredits.toLocaleString()} créditos${remainingCredits ? ` (${remainingCredits.toLocaleString()} restantes)` : ''}`);
        loadKeys();
      } else {
        console.error('Sync error:', data);
        toast.error(data?.error || 'Erro ao sincronizar');
      }
    } catch (error: any) {
      console.error('Error syncing usage:', error);
      toast.error('Erro ao sincronizar uso');
    } finally {
      setLoading(false);
    }
  };

  const loadSearchHistory = async (user: GenesisUser, filter?: string) => {
    setHistoryLoading(true);
    setSelectedUser(user);
    setHistoryModalOpen(true);

    try {
      // Aplicar filtros de data
      const currentFilter = filter || dateFilter;
      const now = new Date();
      let startDate: string | null = null;
      let endDate: string | null = null;

      if (currentFilter === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      } else if (currentFilter === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (currentFilter === 'month') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (currentFilter === 'custom' && customDateStart) {
        startDate = customDateStart;
        endDate = customDateEnd ? customDateEnd + 'T23:59:59' : null;
      }

      // Buscar por user_id OU auth_user_id (para maior compatibilidade)
      let query = supabase
        .from('genesis_search_history')
        .select('*')
        .or(`user_id.eq.${user.id},auth_user_id.eq.${user.auth_user_id}`)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Query error:', error);
        throw error;
      }
      
      console.log(`📊 Histórico carregado: ${data?.length || 0} registros para ${user.name}`);
      setSearchHistory(data || []);
    } catch (error) {
      console.error('Error loading search history:', error);
      toast.error('Erro ao carregar histórico');
      setSearchHistory([]);
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
  const totalKeysPages = Math.ceil(keys.length / keysPerPage);
  const paginatedKeys = keys.slice((keysPage - 1) * keysPerPage, keysPage * keysPerPage);
  
  const totalUsersPages = Math.ceil(users.length / usersPerPage);
  const paginatedUsers = users.slice((usersPage - 1) * usersPerPage, usersPage * usersPerPage);

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
      'radar': 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
      'prospecting': 'from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30',
      'manual': 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
    };
    return colors[type] || 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30';
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
              <h1 className="text-lg font-semibold text-white">Gerenciar API Keys</h1>
              <p className="text-xs text-white/50">Rotação automática de chaves Serper</p>
            </div>
          </div>
        </div>
        {activeTab === 'keys' && (
          <Button
            onClick={() => setAdding(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-9"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nova Chave
          </Button>
        )}
      </div>

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
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalUsage.toLocaleString()}</p>
                <p className="text-xs text-white/50">Créditos Usados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 cursor-pointer hover:from-blue-500/20 hover:to-cyan-500/20 transition-all group" 
          onClick={syncUsage}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <RefreshCw className={`w-5 h-5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sincronizar</p>
                <p className="text-xs text-blue-300/70">Uso real Serper</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-lg bg-white/5 border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('keys')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'keys'
              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Key className="w-4 h-4" />
          API Keys
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          Usuários
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/20 text-white/60">
            {users.length}
          </Badge>
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'keys' ? (
          <motion.div
            key="keys"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
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
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
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

                    {/* Keys Pagination */}
                    {totalKeysPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="text-white/50 text-sm">
                          Página {keysPage} de {totalKeysPages}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setKeysPage(p => Math.max(1, p - 1))}
                            disabled={keysPage === 1}
                            className="text-white/50 hover:text-white disabled:opacity-30"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setKeysPage(p => Math.min(totalKeysPages, p + 1))}
                            disabled={keysPage === totalKeysPages}
                            className="text-white/50 hover:text-white disabled:opacity-30"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
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
          </motion.div>
        ) : (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Users List */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Usuários - Histórico de Pesquisas
                  </span>
                  <Badge variant="outline" className="text-xs px-2 py-0.5 border-white/20 text-white/60">
                    {users.length} usuários
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/50 text-sm">Nenhum usuário encontrado</p>
                  </div>
                ) : (
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
                            <p className="text-white font-medium text-sm">{user.name}</p>
                            <p className="text-white/40 text-xs">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 text-blue-400 hover:from-blue-500/20 hover:to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Search className="w-3.5 h-3.5 mr-1.5" />
                            Ver Histórico
                          </Button>
                        </div>
                      </motion.div>
                    ))}

                    {/* Users Pagination */}
                    {totalUsersPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="text-white/50 text-sm">
                          Página {usersPage} de {totalUsersPages}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                            disabled={usersPage === 1}
                            className="text-white/50 hover:text-white disabled:opacity-30"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUsersPage(p => Math.min(totalUsersPages, p + 1))}
                            disabled={usersPage === totalUsersPages}
                            className="text-white/50 hover:text-white disabled:opacity-30"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Search History Modal */}
      <Modal 
        isOpen={historyModalOpen} 
        onClose={() => setHistoryModalOpen(false)}
        title=""
        size="4xl"
      >
        <div className="p-6 space-y-5">
          {/* Modal Header */}
          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Histórico de Pesquisas</h2>
              {selectedUser && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center">
                    <span className="text-blue-400 text-xs font-semibold">
                      {selectedUser.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white/70 text-sm">{selectedUser.name}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/50 text-sm">{selectedUser.email}</span>
                </div>
              )}
            </div>
            {searchHistory.length > 0 && (
              <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5">
                {searchHistory.length} pesquisas
              </Badge>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Filter className="w-4 h-4 text-white/60" />
            </div>
            <Select value={dateFilter} onValueChange={(v) => { setDateFilter(v); if (selectedUser) loadSearchHistory(selectedUser, v); }}>
              <SelectTrigger className="w-44 bg-white/5 border-white/10 text-white h-10">
                <SelectValue placeholder="Filtrar por período" />
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
                  className="w-36 bg-white/5 border-white/10 text-white text-sm h-10"
                />
                <span className="text-white/30">→</span>
                <Input
                  type="date"
                  value={customDateEnd}
                  onChange={(e) => setCustomDateEnd(e.target.value)}
                  className="w-36 bg-white/5 border-white/10 text-white text-sm h-10"
                />
                <Button
                  size="sm"
                  onClick={() => selectedUser && loadSearchHistory(selectedUser)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-10 px-4"
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  Aplicar
                </Button>
              </div>
            )}
          </div>

          {/* History List */}
          <div className="overflow-y-auto max-h-[45vh] space-y-2 pr-1">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                  <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
                <p className="text-white/50 text-sm">Carregando histórico...</p>
              </div>
            ) : searchHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-white/20" />
                </div>
                <p className="text-white/50 text-sm font-medium">Nenhuma pesquisa encontrada</p>
                <p className="text-white/30 text-xs mt-1">Este usuário ainda não realizou pesquisas no período selecionado</p>
              </div>
            ) : (
              searchHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getSearchTypeColor(item.search_type).split(' ')[0]} ${getSearchTypeColor(item.search_type).split(' ')[1]} flex items-center justify-center flex-shrink-0`}>
                        {item.search_type === 'radar' ? (
                          <Globe className="w-5 h-5 text-cyan-400" />
                        ) : item.search_type === 'prospecting' ? (
                          <TrendingUp className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Search className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {item.search_query || `${item.niche} em ${item.city}`}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] px-2 py-0.5 bg-gradient-to-r ${getSearchTypeColor(item.search_type)}`}
                          >
                            {getSearchTypeLabel(item.search_type)}
                          </Badge>
                          {item.city && (
                            <span className="text-white/40 text-xs flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.city}{item.state ? `, ${item.state}` : ''}
                            </span>
                          )}
                          {item.niche && (
                            <span className="text-white/40 text-xs">
                              {item.niche}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-2 justify-end">
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                          {item.results_count} resultados
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end mt-2 text-white/40 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                        <span className="text-white/20">•</span>
                        <span>{new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Summary Footer */}
          {searchHistory.length > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-blue-300 text-sm font-medium">Resumo do período</p>
                  <p className="text-blue-300/60 text-xs">Total de pesquisas realizadas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{searchHistory.length}</p>
                <p className="text-blue-300/60 text-xs">pesquisas</p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
