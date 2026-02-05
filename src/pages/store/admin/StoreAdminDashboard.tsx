import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
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
  Cell
} from 'recharts';

const COLORS = ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export default function StoreAdminDashboard() {
  const { user } = useStoreAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingInstallments: 0,
    overdueInstallments: 0,
    lowStockProducts: 0,
    newLeads: 0
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { count: productsCount } = await supabase
        .from('store_products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      const { count: customersCount } = await supabase
        .from('store_customers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      const { data: sales } = await supabase
        .from('store_sales')
        .select('total, created_at, status')
        .eq('user_id', user!.id);

      const totalRevenue = sales?.reduce((acc, sale) => acc + Number(sale.total), 0) || 0;

      const { count: pendingInstallments } = await supabase
        .from('store_installments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: overdueInstallments } = await supabase
        .from('store_installments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'overdue');

      const { data: lowStock } = await supabase
        .from('store_products')
        .select('id, stock_quantity, min_stock_alert')
        .eq('user_id', user!.id);

      const lowStockCount = lowStock?.filter(p => p.stock_quantity <= p.min_stock_alert).length || 0;

      const { count: newLeads } = await supabase
        .from('store_leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('status', 'new');

      const mockSalesData = [
        { name: 'Jan', vendas: 4200 },
        { name: 'Fev', vendas: 3800 },
        { name: 'Mar', vendas: 5100 },
        { name: 'Abr', vendas: 4700 },
        { name: 'Mai', vendas: 5900 },
        { name: 'Jun', vendas: 6200 },
      ];

      const mockCategoryData = [
        { name: 'Eletrônicos', value: 35 },
        { name: 'Móveis', value: 25 },
        { name: 'Eletrodomésticos', value: 20 },
        { name: 'Outros', value: 20 },
      ];

      setStats({
        totalProducts: productsCount || 0,
        totalCustomers: customersCount || 0,
        totalSales: sales?.length || 0,
        totalRevenue,
        pendingInstallments: pendingInstallments || 0,
        overdueInstallments: overdueInstallments || 0,
        lowStockProducts: lowStockCount,
        newLeads: newLeads || 0
      });

      setSalesData(mockSalesData);
      setCategoryData(mockCategoryData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Produtos',
      value: stats.totalProducts,
      icon: Package,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Clientes',
      value: stats.totalCustomers,
      icon: Users,
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
    {
      title: 'Vendas',
      value: stats.totalSales,
      icon: ShoppingCart,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Faturamento',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
  ];

  const alertCards = [
    {
      title: 'Parcelas Pendentes',
      value: stats.pendingInstallments,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'Parcelas Vencidas',
      value: stats.overdueInstallments,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      title: 'Estoque Baixo',
      value: stats.lowStockProducts,
      icon: TrendingDown,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      title: 'Novos Leads',
      value: stats.newLeads,
      icon: Eye,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral do seu negócio</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {alertCards.map((alert, index) => (
          <motion.div
            key={alert.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Card className="bg-white border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${alert.bg}`}>
                    <alert.icon className={`w-5 h-5 ${alert.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{alert.value}</p>
                    <p className="text-xs text-gray-500">{alert.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white border-gray-100">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Vendas por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `R$${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                    />
                    <Area
                      type="monotone"
                      dataKey="vendas"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorVendas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white border-gray-100">
            <CardHeader>
              <CardTitle className="text-gray-900">Vendas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value: number) => [`${value}%`, 'Participação']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-gray-500">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
