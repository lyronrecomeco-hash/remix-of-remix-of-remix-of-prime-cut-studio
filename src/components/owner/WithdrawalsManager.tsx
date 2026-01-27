import { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, 
  Search, 
  Loader2, 
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Settings2,
  DollarSign,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Withdrawal {
  id: string;
  promotional_user_id: string;
  holder_name: string;
  pix_type: string;
  pix_key: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  notes: string | null;
  promotional_user?: {
    name: string;
    email: string;
    whatsapp: string;
    type: string;
  };
}

interface Settings {
  id: string;
  default_commission_rate: number;
  min_withdrawal_amount: number;
  max_withdrawal_amount: number;
  withdrawal_processing_days: number;
}

const PIX_TYPE_LABELS: Record<string, string> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  email: 'Email',
  phone: 'Celular',
  random: 'Chave Aleatória',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  processing: { label: 'Processando', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Loader2 },
  completed: { label: 'Pago', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
};

export default function WithdrawalsManager() {
  const [activeTab, setActiveTab] = useState('withdrawals');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [processing, setProcessing] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Fetch withdrawals with user info
      const { data: withdrawalsData, error: wError } = await supabase
        .from('promotional_withdrawals')
        .select(`
          *,
          promotional_user:promotional_users(name, email, whatsapp, type)
        `)
        .order('requested_at', { ascending: false });

      if (wError) throw wError;
      setWithdrawals(withdrawalsData || []);

      // Fetch settings
      const { data: settingsData, error: sError } = await supabase
        .from('promotional_settings')
        .select('*')
        .single();

      if (!sError && settingsData) {
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfirmPayment = async () => {
    if (!selectedWithdrawal) return;

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('promotional_withdrawals')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
        })
        .eq('id', selectedWithdrawal.id);

      if (error) throw error;

      // Update user balances
      await supabase
        .from('promotional_users')
        .update({ pending_balance: 0 })
        .eq('id', selectedWithdrawal.promotional_user_id);

      toast.success('Pagamento confirmado!');
      setSelectedWithdrawal(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao confirmar');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelWithdrawal = async () => {
    if (!selectedWithdrawal) return;

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user's current balance
      const { data: promoUser } = await supabase
        .from('promotional_users')
        .select('available_balance, pending_balance')
        .eq('id', selectedWithdrawal.promotional_user_id)
        .single();

      const { error } = await supabase
        .from('promotional_withdrawals')
        .update({
          status: 'cancelled',
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
        })
        .eq('id', selectedWithdrawal.id);

      if (error) throw error;

      // Return balance to user
      if (promoUser) {
        await supabase
          .from('promotional_users')
          .update({
            available_balance: (promoUser.available_balance || 0) + selectedWithdrawal.amount,
            pending_balance: 0,
          })
          .eq('id', selectedWithdrawal.promotional_user_id);
      }

      toast.success('Saque cancelado e saldo devolvido');
      setSelectedWithdrawal(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSavingSettings(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('promotional_settings')
        .update({
          default_commission_rate: settings.default_commission_rate,
          min_withdrawal_amount: settings.min_withdrawal_amount,
          max_withdrawal_amount: settings.max_withdrawal_amount,
          withdrawal_processing_days: settings.withdrawal_processing_days,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;
      toast.success('Configurações salvas!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar');
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter(w =>
    w.holder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.promotional_user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.pix_key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const totalPending = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <Wallet className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Gerenciar Pagamentos
            {pendingCount > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Saques promocionais e configurações de comissão
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">R$ {totalPending.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Comissão Padrão</p>
              <p className="text-2xl font-bold">{settings?.default_commission_rate || 10}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Saques</p>
              <p className="text-2xl font-bold">{withdrawals.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="withdrawals" className="gap-2">
            <Wallet className="w-4 h-4" />
            Saques
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals" className="mt-6 space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, chave PIX..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-12">
                <Wallet className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Nenhum saque encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredWithdrawals.map((w) => {
                const statusConfig = STATUS_CONFIG[w.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusConfig.icon;

                return (
                  <Card
                    key={w.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setSelectedWithdrawal(w)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {w.promotional_user?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium truncate">{w.promotional_user?.name || w.holder_name}</p>
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {PIX_TYPE_LABELS[w.pix_type]}: {w.pix_key}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">R$ {w.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(w.requested_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Comissão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Comissão Padrão (%)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={settings?.default_commission_rate || 10}
                    onChange={(e) => settings && setSettings({
                      ...settings,
                      default_commission_rate: parseFloat(e.target.value) || 10,
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentual aplicado para novos usuários promocionais
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Valor Mínimo para Saque (R$)</Label>
                  <Input
                    type="number"
                    min="10"
                    value={settings?.min_withdrawal_amount || 100}
                    onChange={(e) => settings && setSettings({
                      ...settings,
                      min_withdrawal_amount: parseFloat(e.target.value) || 100,
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Máximo para Saque (R$)</Label>
                  <Input
                    type="number"
                    min="100"
                    value={settings?.max_withdrawal_amount || 10000}
                    onChange={(e) => settings && setSettings({
                      ...settings,
                      max_withdrawal_amount: parseFloat(e.target.value) || 10000,
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prazo de Processamento (dias)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={settings?.withdrawal_processing_days || 1}
                    onChange={(e) => settings && setSettings({
                      ...settings,
                      withdrawal_processing_days: parseInt(e.target.value) || 1,
                    })}
                  />
                </div>
              </div>
              <Button onClick={handleSaveSettings} disabled={savingSettings}>
                {savingSettings && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Withdrawal Detail Modal */}
      <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Saque</DialogTitle>
            <DialogDescription>
              Solicitado em {selectedWithdrawal && new Date(selectedWithdrawal.requested_at).toLocaleString('pt-BR')}
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Usuário</span>
                  <span className="font-medium">{selectedWithdrawal.promotional_user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{selectedWithdrawal.promotional_user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">WhatsApp</span>
                  <span className="font-medium">{selectedWithdrawal.promotional_user?.whatsapp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo</span>
                  <Badge variant="outline">
                    {selectedWithdrawal.promotional_user?.type === 'influencer' ? 'Influenciador' : 'Parceiro'}
                  </Badge>
                </div>
              </div>

              <div className="bg-primary/10 rounded-lg p-4 space-y-3 border border-primary/20">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Titular</span>
                  <span className="font-medium">{selectedWithdrawal.holder_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo PIX</span>
                  <span className="font-medium">{PIX_TYPE_LABELS[selectedWithdrawal.pix_type]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chave PIX</span>
                  <span className="font-medium font-mono text-sm">{selectedWithdrawal.pix_key}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {selectedWithdrawal.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {selectedWithdrawal.processed_at && (
                <p className="text-sm text-muted-foreground text-center">
                  Processado em {new Date(selectedWithdrawal.processed_at).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedWithdrawal?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelWithdrawal}
                  disabled={processing}
                  className="text-destructive hover:text-destructive"
                >
                  {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Cancelar Saque
                </Button>
                <Button onClick={handleConfirmPayment} disabled={processing}>
                  {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar Pagamento
                </Button>
              </>
            )}
            {selectedWithdrawal?.status !== 'pending' && (
              <Button variant="outline" onClick={() => setSelectedWithdrawal(null)}>
                Fechar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
