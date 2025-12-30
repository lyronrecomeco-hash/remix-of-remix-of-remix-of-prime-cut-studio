import { useState, useEffect } from 'react';
import { TrendingUp, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

interface AffiliateSalesProps {
  affiliateId: string;
}

interface Referral {
  id: string;
  plan_name: string | null;
  plan_price: number | null;
  commission_rate: number | null;
  commission_amount: number | null;
  status: string;
  trial_expires_at: string | null;
  converted_at: string | null;
  confirmed_at: string | null;
  created_at: string;
}

const AffiliateSales = ({ affiliateId }: AffiliateSalesProps) => {
  const [sales, setSales] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSales();
  }, [affiliateId]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('affiliate_referrals')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      confirmed: 'bg-green-500/20 text-green-500',
      paid: 'bg-blue-500/20 text-blue-500',
      cancelled: 'bg-red-500/20 text-red-500'
    };
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      paid: 'Pago',
      cancelled: 'Cancelado'
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const filteredSales = sales.filter(sale => {
    if (statusFilter !== 'all' && sale.status !== statusFilter) return false;
    if (search && !sale.plan_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Calculate totals
  const totalConfirmed = sales
    .filter(s => s.status === 'confirmed' || s.status === 'paid')
    .reduce((acc, s) => acc + (s.commission_amount || 0), 0);

  const totalPending = sales
    .filter(s => s.status === 'pending')
    .reduce((acc, s) => acc + (s.commission_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Minhas Vendas</h2>
          <p className="text-muted-foreground mt-1">Acompanhe todas as suas vendas e comissões</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total de Vendas</p>
            <p className="text-2xl font-bold text-foreground mt-1">{sales.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Comissões Confirmadas</p>
            <p className="text-2xl font-bold text-green-500 mt-1">{formatCurrency(totalConfirmed)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Comissões Pendentes</p>
            <p className="text-2xl font-bold text-yellow-500 mt-1">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por plano..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary/50 border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-secondary/50 border-border">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Histórico de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma venda encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Data</TableHead>
                    <TableHead className="text-muted-foreground">Plano</TableHead>
                    <TableHead className="text-muted-foreground">Valor</TableHead>
                    <TableHead className="text-muted-foreground">Taxa</TableHead>
                    <TableHead className="text-muted-foreground">Comissão</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id} className="border-border">
                      <TableCell className="text-foreground">
                        {formatDate(sale.created_at)}
                      </TableCell>
                      <TableCell className="text-foreground font-medium">
                        {sale.plan_name || 'Cadastro (Trial)'}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {formatCurrency(sale.plan_price)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {sale.commission_rate ? `${sale.commission_rate}%` : '-'}
                      </TableCell>
                      <TableCell className="text-primary font-bold">
                        {formatCurrency(sale.commission_amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(sale.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateSales;
