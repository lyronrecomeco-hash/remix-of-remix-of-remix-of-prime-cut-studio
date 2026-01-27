/**
 * Aba de Gerenciamento de Saques (Admin)
 * Listagem e aprovação de saques de usuários promocionais
 */

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  Search, 
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Eye,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  processed_by: string | null;
  notes: string | null;
  // Dados do usuário (join)
  user_email?: string;
  user_name?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  pending: { 
    label: 'Pendente', 
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: Clock
  },
  processing: { 
    label: 'Processando', 
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: RefreshCw
  },
  completed: { 
    label: 'Pago', 
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2
  },
  rejected: { 
    label: 'Rejeitado', 
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: XCircle
  },
};

const PIX_TYPE_LABELS: Record<string, string> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  email: 'E-mail',
  phone: 'Telefone',
  random: 'Chave Aleatória',
};

export function WithdrawalsManagementTab() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('promotional_withdrawals')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Erro ao carregar saques:', error);
      toast.error('Erro ao carregar saques');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedWithdrawal) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('promotional_withdrawals')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', selectedWithdrawal.id);

      if (error) throw error;

      toast.success('Pagamento confirmado!');
      setSelectedWithdrawal(null);
      loadWithdrawals();
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error('Erro ao confirmar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedWithdrawal) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('promotional_withdrawals')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
        })
        .eq('id', selectedWithdrawal.id);

      if (error) throw error;

      toast.success('Saque rejeitado');
      setSelectedWithdrawal(null);
      loadWithdrawals();
    } catch (error) {
      console.error('Erro ao rejeitar saque:', error);
      toast.error('Erro ao rejeitar saque');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    const matchesSearch = 
      w.holder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.pix_key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const stats = {
    pending: withdrawals.filter(w => w.status === 'pending').length,
    pendingAmount: withdrawals.filter(w => w.status === 'pending').reduce((acc, w) => acc + w.amount, 0),
    completed: withdrawals.filter(w => w.status === 'completed').length,
    completedAmount: withdrawals.filter(w => w.status === 'completed').reduce((acc, w) => acc + w.amount, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Gerenciar Saques</h2>
            <p className="text-sm text-white/50">{withdrawals.length} solicitações</p>
          </div>
        </div>
        <Button variant="outline" onClick={loadWithdrawals} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white/50">Pendentes</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
            <p className="text-sm text-amber-400">{formatCurrency(stats.pendingAmount)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white/50">Pagos</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
            <p className="text-sm text-emerald-400">{formatCurrency(stats.completedAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <Input
            placeholder="Buscar por nome ou chave PIX..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
            style={{ borderRadius: '10px' }}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10" style={{ borderRadius: '10px' }}>
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="completed">Pagos</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Saques */}
      {filteredWithdrawals.length === 0 ? (
        <Card className="bg-white/5 border-white/10 border-dashed" style={{ borderRadius: '14px' }}>
          <CardContent className="flex flex-col items-center py-12">
            <Wallet className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/50">Nenhum saque encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredWithdrawals.map((withdrawal) => {
            const statusConfig = STATUS_CONFIG[withdrawal.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;

            return (
              <Card 
                key={withdrawal.id}
                className="bg-white/5 border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                style={{ borderRadius: '14px' }}
                onClick={() => setSelectedWithdrawal(withdrawal)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white/70" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{withdrawal.holder_name}</p>
                        <p className="text-sm text-white/50">
                          {PIX_TYPE_LABELS[withdrawal.pix_type] || withdrawal.pix_type}: {withdrawal.pix_key}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-white">{formatCurrency(withdrawal.amount)}</p>
                      <p className="text-xs text-white/40">
                        {format(new Date(withdrawal.requested_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Badge className={statusConfig.className}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
        <DialogContent className="bg-[hsl(215_30%_12%)] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Detalhes do Saque</DialogTitle>
            <DialogDescription className="text-white/60">
              ID: {selectedWithdrawal?.id.slice(0, 8)}...
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="py-4 space-y-4">
              {/* Solicitante */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-white/50" />
                  <span className="text-sm text-white/50">Solicitante</span>
                </div>
                <p className="text-lg font-medium text-white">{selectedWithdrawal.holder_name}</p>
              </div>

              {/* Dados do PIX */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Tipo de Chave</span>
                  <Badge variant="outline" className="border-white/20">
                    {PIX_TYPE_LABELS[selectedWithdrawal.pix_type] || selectedWithdrawal.pix_type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Chave PIX</span>
                  <span className="text-white font-mono">{selectedWithdrawal.pix_key}</span>
                </div>
              </div>

              {/* Valor */}
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-sm text-emerald-300 mb-1">Valor do Saque</p>
                <p className="text-3xl font-bold text-emerald-400">
                  {formatCurrency(selectedWithdrawal.amount)}
                </p>
              </div>

              {/* Data */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data da Solicitação
                </span>
                <span className="text-white">
                  {format(new Date(selectedWithdrawal.requested_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Status</span>
                <Badge className={STATUS_CONFIG[selectedWithdrawal.status]?.className}>
                  {STATUS_CONFIG[selectedWithdrawal.status]?.label || selectedWithdrawal.status}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedWithdrawal?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleRejectPayment}
                  disabled={isProcessing}
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  style={{ borderRadius: '10px' }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                  style={{ borderRadius: '10px' }}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Confirmar Pagamento
                </Button>
              </>
            )}
            {selectedWithdrawal?.status !== 'pending' && (
              <Button
                variant="outline"
                onClick={() => setSelectedWithdrawal(null)}
                className="w-full"
                style={{ borderRadius: '10px' }}
              >
                Fechar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
