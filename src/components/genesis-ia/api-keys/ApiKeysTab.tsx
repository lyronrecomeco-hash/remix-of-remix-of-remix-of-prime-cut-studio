import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Plus, Trash2, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, RefreshCw, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface ApiKeysTabProps {
  onBack: () => void;
}

export function ApiKeysTab({ onBack }: ApiKeysTabProps) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadKeys();
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
        <Button
          onClick={() => setAdding(true)}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-9"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nova Chave
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
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
                <RefreshCw className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalUsage.toLocaleString()}</p>
                <p className="text-xs text-white/50">Requisições Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
            <div className="space-y-2">
              {keys.map((key, index) => (
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
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/20 text-white/50">
                          {key.usage_count} usos
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
    </div>
  );
}
