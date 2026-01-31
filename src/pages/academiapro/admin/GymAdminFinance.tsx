import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Users, 
  ArrowUp,
  Plus,
  Search,
  Filter,
  Download,
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GymAdminFinance() {
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    pendingAmount: 0,
    activeSubscriptions: 0,
    averageTicket: 0
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
      fetchStudents(),
      fetchPlans(),
      fetchStats()
    ]);
    setIsLoading(false);
  };

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('gym_profiles')
      .select('user_id, full_name, email')
      .order('full_name');

    if (data) setStudents(data);
  };

  const fetchPlans = async () => {
    const { data } = await (supabase.from('gym_plans' as any) as any)
      .select('*')
      .eq('is_active', true)
      .order('price_cents');

    if (data) setPlans(data);
  };

  const fetchStats = async () => {
    const [activeSubs] = await Promise.all([
      supabase.from('gym_subscriptions')
        .select('id', { count: 'exact' })
        .eq('status', 'active')
    ]);

    setStats({
      monthlyRevenue: 0,
      pendingAmount: 0,
      activeSubscriptions: activeSubs.count || 0,
      averageTicket: 0
    });
  };

  const handleCreatePayment = async () => {
    if (!newPayment.user_id || !newPayment.amount_cents) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const { error } = await (supabase.from('gym_payments' as any) as any)
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
    fetchStats();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const statCards = [
    { 
      icon: DollarSign, 
      label: 'Receita do Mês', 
      value: `R$ ${(stats.monthlyRevenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: '0%',
      positive: true,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400'
    },
    { 
      icon: Clock, 
      label: 'Pendente', 
      value: `R$ ${(stats.pendingAmount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: '0 cobranças',
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

      {/* Empty State / Coming soon for payments list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center"
      >
        <Receipt className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Histórico de Pagamentos</h2>
        <p className="text-zinc-400 max-w-md mx-auto mb-4">
          As cobranças criadas aparecerão aqui. Use o botão "Nova Cobrança" para adicionar pagamentos aos alunos.
        </p>
        <Button 
          variant="outline" 
          className="border-zinc-700"
          onClick={() => setOpenNewPayment(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Primeira Cobrança
        </Button>
      </motion.div>
    </div>
  );
}
