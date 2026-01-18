import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface GenesisFinancialTabProps {
  userId: string;
}

const revenueData = [
  { month: "Jan", receita: 45000, lucro: 13000 },
  { month: "Fev", receita: 52000, lucro: 17000 },
  { month: "Mar", receita: 48000, lucro: 17000 },
  { month: "Abr", receita: 61000, lucro: 23000 },
  { month: "Mai", receita: 55000, lucro: 21000 },
  { month: "Jun", receita: 67000, lucro: 27000 },
  { month: "Jul", receita: 72000, lucro: 30000 },
];

const categoryData = [
  { name: "Assinaturas", value: 45, color: "hsl(217 91% 60%)" },
  { name: "Serviços", value: 25, color: "hsl(145 70% 50%)" },
  { name: "Produtos", value: 20, color: "hsl(280 70% 60%)" },
  { name: "Outros", value: 10, color: "hsl(45 90% 55%)" },
];

const chartConfig = {
  receita: { label: "Receita", color: "hsl(217 91% 60%)" },
  lucro: { label: "Lucro", color: "hsl(145 70% 50%)" },
};

export function GenesisFinancialTab({ userId }: GenesisFinancialTabProps) {
  const [period, setPeriod] = useState("30d");

  const stats = useMemo(() => ({
    totalRevenue: 400000,
    thisMonth: 72000,
    lastMonth: 67000,
    growth: 7.5,
    clients: 1250,
    conversionRate: 8.4,
  }), []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="w-full space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financeiro</h2>
          <p className="text-sm text-muted-foreground">Acompanhe suas métricas em tempo real</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-28 h-10 bg-card border-border">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 dias</SelectItem>
            <SelectItem value="30d">30 dias</SelectItem>
            <SelectItem value="90d">90 dias</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Main Stats - 3 Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Faturamento Total */}
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
                +12%
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-sm text-muted-foreground mt-1">Faturamento Total</p>
          </CardContent>
        </Card>

        {/* Este Mês */}
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
                +{stats.growth}%
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.thisMonth)}</p>
            <p className="text-sm text-muted-foreground mt-1">Neste Mês</p>
          </CardContent>
        </Card>

        {/* Mês Passado */}
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <ArrowDownRight className="w-4 h-4" />
                Referência
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.lastMonth)}</p>
            <p className="text-sm text-muted-foreground mt-1">Mês Passado</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart - Evolução */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Evolução do Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(145 70% 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(145 70% 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 40% 18%)" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(210 20% 50%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(210 20% 50%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222 47% 11%)",
                      border: "1px solid hsl(217 40% 20%)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
                  <Area type="monotone" dataKey="receita" stroke="hsl(217 91% 60%)" strokeWidth={2.5} fill="url(#colorReceita)" />
                  <Area type="monotone" dataKey="lucro" stroke="hsl(145 70% 50%)" strokeWidth={2.5} fill="url(#colorLucro)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Receita</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-muted-foreground">Lucro</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Receita por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222 47% 11%)",
                      border: "1px solid hsl(217 40% 20%)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Clientes Ativos */}
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">{stats.clients.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Clientes Ativos</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
                +5.3%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Conversão */}
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Target className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
                +1.2%
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
