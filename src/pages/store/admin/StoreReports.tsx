import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package,
  Download,
  Calendar,
  ShoppingCart,
  AlertTriangle,
  ArrowUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function StoreReports() {
  const [period, setPeriod] = useState('30');

  const startDate = period === '7' 
    ? subDays(new Date(), 7)
    : period === '30'
    ? subDays(new Date(), 30)
    : period === 'month'
    ? startOfMonth(new Date())
    : startOfMonth(subMonths(new Date(), 1));

  const endDate = period === 'lastMonth' 
    ? endOfMonth(subMonths(new Date(), 1))
    : new Date();

  const { data: salesData } = useQuery({
    queryKey: ['store-reports-sales', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_sales')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: productsData } = useQuery({
    queryKey: ['store-reports-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_products')
        .select('*, store_categories(name)')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: customersData } = useQuery({
    queryKey: ['store-reports-customers', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_customers')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (error) throw error;
      return data;
    }
  });

  const { data: installmentsData } = useQuery({
    queryKey: ['store-reports-installments', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_installments')
        .select('*')
        .gte('due_date', startDate.toISOString())
        .lte('due_date', endDate.toISOString());
      
      if (error) throw error;
      return data;
    }
  });

  const { data: leadsData } = useQuery({
    queryKey: ['store-reports-leads', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_leads')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate stats - using 'total' column instead of 'total_amount'
  const totalSales = salesData?.reduce((acc, sale) => acc + (sale.total || 0), 0) || 0;
  const totalDownPayments = salesData?.reduce((acc, sale) => acc + (sale.down_payment || 0), 0) || 0;
  const salesCount = salesData?.length || 0;
  const avgTicket = salesCount > 0 ? totalSales / salesCount : 0;
  const newCustomers = customersData?.length || 0;
  const newLeads = leadsData?.length || 0;
  const convertedLeads = leadsData?.filter(l => l.status === 'converted').length || 0;
  const conversionRate = newLeads > 0 ? (convertedLeads / newLeads) * 100 : 0;

  const pendingInstallments = installmentsData?.filter(i => i.status === 'pending').length || 0;
  const paidInstallments = installmentsData?.filter(i => i.status === 'paid').length || 0;
  const overdueInstallments = installmentsData?.filter(i => 
    i.status === 'pending' && new Date(i.due_date) < new Date()
  ).length || 0;

  // Chart data - using 'total' column
  const salesByDay = salesData?.reduce((acc: any, sale) => {
    const day = format(new Date(sale.created_at || ''), 'dd/MM');
    if (!acc[day]) {
      acc[day] = { day, total: 0, count: 0 };
    }
    acc[day].total += sale.total || 0;
    acc[day].count += 1;
    return acc;
  }, {});

  const salesChartData = Object.values(salesByDay || {});

  const productsByCategory = productsData?.reduce((acc: any, product) => {
    const category = product.store_categories?.name || 'Sem categoria';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(productsByCategory || {}).map(([name, value]) => ({
    name,
    value
  }));

  const leadsByStatus = leadsData?.reduce((acc: any, lead) => {
    const status = lead.status || 'new';
    if (!acc[status]) {
      acc[status] = 0;
    }
    acc[status] += 1;
    return acc;
  }, {});

  const leadsChartData = Object.entries(leadsByStatus || {}).map(([name, value]) => ({
    name: name === 'new' ? 'Novos' : 
          name === 'contacted' ? 'Contatados' :
          name === 'negotiating' ? 'Negociando' :
          name === 'converted' ? 'Convertidos' : 'Perdidos',
    value
  }));

  const installmentsChartData = [
    { name: 'Pagas', value: paidInstallments, color: '#10b981' },
    { name: 'Pendentes', value: pendingInstallments - overdueInstallments, color: '#f59e0b' },
    { name: 'Atrasadas', value: overdueInstallments, color: '#ef4444' },
  ];

  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE VENDAS', 105, 18, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`, 105, 28, { align: 'center' });

    // Stats Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO FINANCEIRO', 20, 50);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const statsY = 60;
    doc.text(`Total em Vendas: R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, statsY);
    doc.text(`Entradas Recebidas: R$ ${totalDownPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, statsY + 8);
    doc.text(`Quantidade de Vendas: ${salesCount}`, 20, statsY + 16);
    doc.text(`Ticket Médio: R$ ${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, statsY + 24);

    // Customers Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTES E LEADS', 20, statsY + 45);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Novos Clientes: ${newCustomers}`, 20, statsY + 55);
    doc.text(`Novos Leads: ${newLeads}`, 20, statsY + 63);
    doc.text(`Leads Convertidos: ${convertedLeads}`, 20, statsY + 71);
    doc.text(`Taxa de Conversão: ${conversionRate.toFixed(1)}%`, 20, statsY + 79);

    // Installments Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CREDIÁRIO', 20, statsY + 100);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Parcelas Pagas: ${paidInstallments}`, 20, statsY + 110);
    doc.text(`Parcelas Pendentes: ${pendingInstallments}`, 20, statsY + 118);
    doc.text(`Parcelas Atrasadas: ${overdueInstallments}`, 20, statsY + 126);

    // Footer
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(`Relatório gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 280, { align: 'center' });

    doc.save(`relatorio_vendas_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Relatórios</h1>
          <p className="text-slate-400 mt-1">Análise completa do seu negócio</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-600 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="lastMonth">Mês passado</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generatePDFReport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-300">Total em Vendas</p>
                  <p className="text-2xl font-bold text-white">
                    R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-300">Vendas</p>
                  <p className="text-2xl font-bold text-white">{salesCount}</p>
                  <p className="text-xs text-green-400">Ticket médio: R$ {avgTicket.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-300">Novos Clientes</p>
                  <p className="text-2xl font-bold text-white">{newCustomers}</p>
                  <p className="text-xs text-purple-400">
                    <span className="flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      {conversionRate.toFixed(1)}% conversão
                    </span>
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-300">Parcelas Atrasadas</p>
                  <p className="text-2xl font-bold text-white">{overdueInstallments}</p>
                  <p className="text-xs text-orange-400">de {pendingInstallments} pendentes</p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Vendas por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData as any[]}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                    formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Total']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Leads Funnel */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Funil de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Products by Category */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-green-400" />
              Produtos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Installments Status */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              Status das Parcelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={installmentsChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {installmentsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
