import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users, 
  CreditCard,
  ArrowUp,
  ArrowDown,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  Receipt,
  Wallet
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GymAdminFinance() {
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    pendingAmount: 0,
    activeSubscriptions: 0,
    averageTicket: 0,
    lastMonthRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openNewPayment, setOpenNewPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    user_id: '',
    plan_id: '',
    amount_cents: 0,
    payment_method: 'pix',
    description: ''
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchPayments(),
      fetchStudents(),
      fetchPlans(),
      fetchStats()
    ]);
    setIsLoading(false);
  };

  const fetchPayments = async () => {
    const { data } = await supabase
      .from('gym_payments')
      .select(`
        *,
        gym_profiles(full_name, email),
        gym_plans(name, price_cents)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) setPayments(data);
  };

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('gym_profiles')
      .select('user_id, full_name, email')
      .order('full_name');

    if (data) setStudents(data);
  };

  const fetchPlans = async () => {
    const { data } = await supabase
      .from('gym_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_cents');

    if (data) setPlans(data);
  };

  const fetchStats = async () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const [currentMonth, lastMonth, pending, activeSubs] = await Promise.all([
      supabase.from('gym_payments')
        .select('amount_cents')
        .eq('status', 'paid')
        .gte('paid_at', monthStart.toISOString())
        .lte('paid_at', monthEnd.toISOString()),
      supabase.from('gym_payments')
        .select('amount_cents')
        .eq('status', 'paid')
        .gte('paid_at', lastMonthStart.toISOString())
        .lte('paid_at', lastMonthEnd.toISOString()),
      supabase.from('gym_payments')
        .select('amount_cents')
        .eq('status', 'pending'),
      supabase.from('gym_subscriptions')
        .select('id', { count: 'exact' })
        .eq('status', 'active')
    ]);

    const monthlyRevenue = (currentMonth.data || []).reduce((sum, p) => sum + p.amount_cents, 0);
    const lastMonthRevenue = (lastMonth.data || []).reduce((sum, p) => sum + p.amount_cents, 0);
    const pendingAmount = (pending.data || []).reduce((sum, p) => sum + p.amount_cents, 0);
    const activeCount = activeSubs.count || 0;

    setStats({
      monthlyRevenue,
      lastMonthRevenue,
      pendingAmount,
      activeSubscriptions: activeCount,
      averageTicket: activeCount > 0 ? Math.round(monthlyRevenue / activeCount) : 0
    });
  };

  const handleCreatePayment = async () => {
    if (!newPayment.user_id || !newPayment.amount_cents) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const { error } = await supabase
      .from('gym_payments')
      .insert({
        user_id: newPayment.user_id,
        plan_id: newPayment.plan_id || null,
        amount_cents: newPayment.amount_cents,
        payment_method: newPayment.payment_method,
        description: newPayment.description || null,
        status: 'pending',
        due_date: new Date().toISOString()
      });

    if (error) {
      toast.error('Erro ao criar cobrança');
      return;
    }

    toast.success('Cobrança criada com sucesso');
    setOpenNewPayment(false);
    setNewPayment({
      user_id: '',
      plan_id: '',
      amount_cents: 0,
      payment_method: 'pix',
      description: ''
    });
    fetchPayments();
    fetchStats();
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    const { error } = await supabase
      .from('gym_payments')
      .update({ 
        status: 'paid', 
        paid_at: new Date().toISOString() 
      })
      .eq('id', paymentId);

    if (error) {
      toast.error('Erro ao atualizar pagamento');
      return;
    }

    toast.success('Pagamento confirmado');
    fetchPayments();
    fetchStats();
  };

  const handleCancelPayment = async (paymentId: string) => {
    const { error } = await supabase
      .from('gym_payments')
      .update({ status: 'cancelled' })
      .eq('id', paymentId);

    if (error) {
      toast.error('Erro ao cancelar cobrança');
      return;
    }

    toast.success('Cobrança cancelada');
    fetchPayments();
    fetchStats();
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.gym_profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.gym_profiles?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Vencido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const revenueChange = stats.lastMonthRevenue > 0 
    ? ((stats.monthlyRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue * 100).toFixed(0)
    : '0';

  const statCards = [
    { 
      icon: DollarSign, 
      label: 'Receita do Mês', 
      value: `R$ ${(stats.monthlyRevenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: `${Number(revenueChange) >= 0 ? '+' : ''}${revenueChange}%`,
      positive: Number(revenueChange) >= 0,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400'
    },
    { 
      icon: Clock, 
      label: 'Pendente', 
      value: `R$ ${(stats.pendingAmount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: `${filteredPayments.filter(p => p.status === 'pending').length} cobranças`,
      positive: false,
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400'
    },
    { 
      icon: Users, 
      label: 'Assinaturas Ativas', 
      value: stats.activeSubscriptions.toString(),
      change: 'planos ativos',
      positive: true,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    { 
      icon: Wallet, 
      label: 'Ticket Médio', 
      value: `R$ ${(stats.averageTicket / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: 'por aluno',
      positive: true,
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-zinc-400 mt-1">Controle financeiro completo da academia</p>
        </div>
        <Dialog open={openNewPayment} onOpenChange={setOpenNewPayment}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Cobrança
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Nova Cobrança</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Criar uma nova cobrança para um aluno
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Aluno *</Label>
                <Select
                  value={newPayment.user_id}
                  onValueChange={(v) => setNewPayment({ ...newPayment, user_id: v })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {students.map((s) => (
                      <SelectItem key={s.user_id} value={s.user_id}>
                        {s.full_name} ({s.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Plano (opcional)</Label>
                <Select
                  value={newPayment.plan_id}
                  onValueChange={(v) => {
                    const plan = plans.find(p => p.id === v);
                    setNewPayment({ 
                      ...newPayment, 
                      plan_id: v,
                      amount_cents: plan?.price_cents || newPayment.amount_cents
                    });
                  }}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} - R$ {(p.price_cents / 100).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(newPayment.amount_cents / 100).toFixed(2)}
                  onChange={(e) => setNewPayment({ 
                    ...newPayment, 
                    amount_cents: Math.round(parseFloat(e.target.value || '0') * 100)
                  })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Método de Pagamento</Label>
                <Select
                  value={newPayment.payment_method}
                  onValueChange={(v) => setNewPayment({ ...newPayment, payment_method: v })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Ex: Mensalidade Janeiro"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenNewPayment(false)}
                  className="flex-1 border-zinc-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreatePayment}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  Criar Cobrança
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat, index) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-emerald-500' : 'text-zinc-400'}`}>
                {stat.positive && <ArrowUp className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold">{isLoading ? '--' : stat.value}</p>
            <p className="text-zinc-400 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-zinc-900 border-zinc-800">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="border-zinc-800">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="text-left p-4 font-medium text-zinc-400">Aluno</th>
                <th className="text-left p-4 font-medium text-zinc-400 hidden sm:table-cell">Descrição</th>
                <th className="text-left p-4 font-medium text-zinc-400">Valor</th>
                <th className="text-left p-4 font-medium text-zinc-400 hidden md:table-cell">Status</th>
                <th className="text-left p-4 font-medium text-zinc-400 hidden lg:table-cell">Data</th>
                <th className="text-right p-4 font-medium text-zinc-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-zinc-800 animate-pulse">
                    <td className="p-4"><div className="h-4 bg-zinc-800 rounded w-32" /></td>
                    <td className="p-4 hidden sm:table-cell"><div className="h-4 bg-zinc-800 rounded w-40" /></td>
                    <td className="p-4"><div className="h-4 bg-zinc-800 rounded w-20" /></td>
                    <td className="p-4 hidden md:table-cell"><div className="h-6 bg-zinc-800 rounded w-20" /></td>
                    <td className="p-4 hidden lg:table-cell"><div className="h-4 bg-zinc-800 rounded w-24" /></td>
                    <td className="p-4"><div className="h-8 bg-zinc-800 rounded w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{payment.gym_profiles?.full_name || 'N/A'}</p>
                        <p className="text-sm text-zinc-400">{payment.gym_profiles?.email}</p>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <p className="text-zinc-300">{payment.description || payment.gym_plans?.name || 'Pagamento'}</p>
                      <p className="text-xs text-zinc-500">{payment.payment_method?.toUpperCase()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold">
                        R$ {(payment.amount_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="p-4 hidden lg:table-cell text-zinc-400 text-sm">
                      {format(new Date(payment.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                          <DropdownMenuItem className="cursor-pointer">
                            <Receipt className="w-4 h-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          {payment.status === 'pending' && (
                            <>
                              <DropdownMenuItem 
                                className="cursor-pointer text-emerald-500 focus:text-emerald-500"
                                onClick={() => handleMarkAsPaid(payment.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Marcar como pago
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-500 focus:text-red-500"
                                onClick={() => handleCancelPayment(payment.id)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancelar cobrança
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400">
                    <Receipt className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                    <p>Nenhuma cobrança encontrada</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
